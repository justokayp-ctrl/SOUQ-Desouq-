import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';

const DATA_DIR = path.join(process.cwd(), 'server', 'data');
const DB_PATH = path.join(DATA_DIR, 'marketplace.db');

let instance: DatabaseSync | null = null;

function initDbInstance(): DatabaseSync {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  try {
    const db = new DatabaseSync(DB_PATH);
    // Quick integrity check on open
    const check = (db.prepare('PRAGMA quick_check').get() as any)?.quick_check;
    if (check && check !== 'ok') {
      console.warn(`⚠️ [DB] SQLite quick_check returned: ${check}. Rebuilding database...`);
      db.close();
      throw new Error(`Database corrupted: ${check}`);
    }

    // Enforce ACID properties & Production Settings:
    // 1. Write-Ahead Logging (WAL) for high concurrency and performance
    db.exec('PRAGMA journal_mode = WAL;');
    // 2. Foreign Key constraints enforcement
    db.exec('PRAGMA foreign_keys = ON;');
    // 3. Normal synchronization for durability with performance
    db.exec('PRAGMA synchronous = NORMAL;');
    // 4. Busy timeout to prevent lock contentions (5000ms)
    db.exec('PRAGMA busy_timeout = 5000;');
    // 5. In-Memory Page Cache (64MB) for instant reads
    db.exec('PRAGMA cache_size = -64000;');
    // 6. Memory-Mapped I/O (up to 256MB)
    db.exec('PRAGMA mmap_size = 268435456;');
    // 7. Store temp tables & indexes in RAM
    db.exec('PRAGMA temp_store = MEMORY;');
    return db;
  } catch (err: any) {
    console.error('⚠️ [DB] Error opening SQLite database, resetting file:', err?.message || err);
    try {
      if (fs.existsSync(DB_PATH)) {
        const backupPath = `${DB_PATH}.corrupted_${Date.now()}`;
        fs.renameSync(DB_PATH, backupPath);
        if (fs.existsSync(`${DB_PATH}-shm`)) fs.unlinkSync(`${DB_PATH}-shm`);
        if (fs.existsSync(`${DB_PATH}-wal`)) fs.unlinkSync(`${DB_PATH}-wal`);
        console.log(`📦 [DB] Archived corrupted database to: ${backupPath}`);
      }
    } catch (cleanErr) {
      console.error('⚠️ [DB] Error archiving corrupted database files:', cleanErr);
    }

    const freshDb = new DatabaseSync(DB_PATH);
    freshDb.exec('PRAGMA journal_mode = WAL;');
    freshDb.exec('PRAGMA foreign_keys = ON;');
    freshDb.exec('PRAGMA synchronous = NORMAL;');
    freshDb.exec('PRAGMA busy_timeout = 5000;');
    freshDb.exec('PRAGMA cache_size = -64000;');
    freshDb.exec('PRAGMA mmap_size = 268435456;');
    freshDb.exec('PRAGMA temp_store = MEMORY;');
    return freshDb;
  }
}

export function getDatabase(): DatabaseSync {
  if (!instance) {
    instance = initDbInstance();
  }

  return instance;
}

let transactionDepth = 0;

/**
 * Execute a unit of work inside an ACID transaction with BEGIN IMMEDIATE.
 * Supports nested transactions via SQLite SAVEPOINTs, allowing transactional
 * methods to safely compose without lock errors.
 */
export function runTransaction<T>(work: (db: DatabaseSync) => T): T {
  const db = getDatabase();
  const isOuter = transactionDepth === 0;
  const currentDepth = transactionDepth;
  
  if (isOuter) {
    db.exec('BEGIN IMMEDIATE;');
  } else {
    db.exec(`SAVEPOINT sp_${currentDepth};`);
  }
  
  transactionDepth++;
  try {
    const result = work(db);
    transactionDepth--;
    if (isOuter) {
      db.exec('COMMIT;');
    } else {
      db.exec(`RELEASE SAVEPOINT sp_${currentDepth};`);
    }
    return result;
  } catch (error) {
    transactionDepth--;
    try {
      if (isOuter) {
        db.exec('ROLLBACK;');
      } else {
        db.exec(`ROLLBACK TO SAVEPOINT sp_${currentDepth};`);
      }
    } catch (rollbackErr) {
      console.error('Rollback error:', rollbackErr);
    }
    throw error;
  }
}
