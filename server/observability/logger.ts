import crypto from 'crypto';
import { getDatabase } from '../database/connection';
import { LogLevel, StructuredLog } from './types';
import { sanitizeData } from './sanitizer';

class StructuredLogger {
  private inMemoryRingBuffer: StructuredLog[] = [];
  private readonly maxRingBufferSize = 500;
  private isPersisting = true;

  constructor() {
    // Initial setup
  }

  private emit(
    level: LogLevel,
    message: string,
    options: {
      service?: string;
      traceId?: string;
      spanId?: string;
      action?: string;
      userId?: string;
      userRole?: string;
      durationMs?: number;
      statusCode?: number;
      clientIp?: string;
      userAgent?: string;
      metadata?: Record<string, any>;
      error?: { name: string; message: string; code?: string; stack?: string };
    } = {}
  ): StructuredLog {
    const timestamp = new Date().toISOString();
    const id = `log_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const traceId = options.traceId || `trc_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const service = options.service || 'souq_core';

    const logEntry: StructuredLog = {
      id,
      level,
      message,
      service,
      traceId,
      spanId: options.spanId,
      action: options.action,
      userId: options.userId,
      userRole: options.userRole,
      durationMs: options.durationMs,
      statusCode: options.statusCode,
      clientIp: options.clientIp,
      userAgent: options.userAgent,
      metadata: options.metadata ? sanitizeData(options.metadata) : undefined,
      error: options.error ? sanitizeData(options.error) : undefined,
      timestamp
    };

    // 1. Maintain in-memory ring buffer
    this.inMemoryRingBuffer.unshift(logEntry);
    if (this.inMemoryRingBuffer.length > this.maxRingBufferSize) {
      this.inMemoryRingBuffer.pop();
    }

    // 2. Persist to SQLite if database is ready
    if (this.isPersisting) {
      try {
        const db = getDatabase();
        const stmt = db.prepare(`
          INSERT INTO system_logs (
            id, level, message, service, trace_id, action,
            user_id, duration_ms, status_code, client_ip,
            context_json, error_json, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
          logEntry.id,
          logEntry.level,
          logEntry.message,
          logEntry.service,
          logEntry.traceId,
          logEntry.action || null,
          logEntry.userId || null,
          logEntry.durationMs || null,
          logEntry.statusCode || null,
          logEntry.clientIp || null,
          logEntry.metadata ? JSON.stringify(logEntry.metadata) : null,
          logEntry.error ? JSON.stringify(logEntry.error) : null,
          logEntry.timestamp
        );
      } catch (err) {
        // Fallback gracefully without crashing
      }
    }

    // 3. Format console output for dev mode
    if (process.env.NODE_ENV !== 'test') {
      const color = level === 'error' || level === 'fatal' ? '\x1b[31m' :
                    level === 'warn' ? '\x1b[33m' :
                    level === 'info' ? '\x1b[36m' : '\x1b[90m';
      const reset = '\x1b[0m';
      console.log(`${color}[${timestamp}] [${level.toUpperCase()}] [${service}]${reset} ${message} ${options.durationMs ? `(${options.durationMs}ms)` : ''}`);
    }

    return logEntry;
  }

  public debug(message: string, options?: Parameters<StructuredLogger['emit']>[2]): StructuredLog {
    return this.emit('debug', message, options);
  }

  public info(message: string, options?: Parameters<StructuredLogger['emit']>[2]): StructuredLog {
    return this.emit('info', message, options);
  }

  public warn(message: string, options?: Parameters<StructuredLogger['emit']>[2]): StructuredLog {
    return this.emit('warn', message, options);
  }

  public error(message: string, options?: Parameters<StructuredLogger['emit']>[2]): StructuredLog {
    return this.emit('error', message, options);
  }

  public fatal(message: string, options?: Parameters<StructuredLogger['emit']>[2]): StructuredLog {
    return this.emit('fatal', message, options);
  }

  /**
   * Query structured logs with flexible filters
   */
  public getLogs(filter: {
    level?: LogLevel;
    service?: string;
    traceId?: string;
    search?: string;
    limit?: number;
  } = {}): StructuredLog[] {
    const limit = Math.min(filter.limit || 100, 200);

    try {
      const db = getDatabase();
      let sql = 'SELECT * FROM system_logs WHERE 1=1';
      const params: any[] = [];

      if (filter.level) {
        sql += ' AND level = ?';
        params.push(filter.level);
      }
      if (filter.service) {
        sql += ' AND service = ?';
        params.push(filter.service);
      }
      if (filter.traceId) {
        sql += ' AND trace_id = ?';
        params.push(filter.traceId);
      }
      if (filter.search) {
        sql += ' AND (message LIKE ? OR context_json LIKE ?)';
        params.push(`%${filter.search}%`, `%${filter.search}%`);
      }

      sql += ' ORDER BY created_at DESC LIMIT ?';
      params.push(limit);

      const rows = db.prepare(sql).all(...params) as any[];

      return rows.map(r => ({
        id: r.id,
        level: r.level as LogLevel,
        message: r.message,
        service: r.service,
        traceId: r.trace_id,
        action: r.action || undefined,
        userId: r.user_id || undefined,
        durationMs: r.duration_ms || undefined,
        statusCode: r.status_code || undefined,
        clientIp: r.client_ip || undefined,
        metadata: r.context_json ? JSON.parse(r.context_json) : undefined,
        error: r.error_json ? JSON.parse(r.error_json) : undefined,
        timestamp: r.created_at
      }));
    } catch {
      // Fallback to in-memory buffer if DB is unavailable
      return this.inMemoryRingBuffer
        .filter(l => !filter.level || l.level === filter.level)
        .filter(l => !filter.service || l.service === filter.service)
        .filter(l => !filter.traceId || l.traceId === filter.traceId)
        .filter(l => !filter.search || l.message.includes(filter.search))
        .slice(0, limit);
    }
  }

  /**
   * Clear in-memory log buffer (useful for test suites)
   */
  public clearBuffer(): void {
    this.inMemoryRingBuffer = [];
  }
}

export const logger = new StructuredLogger();
