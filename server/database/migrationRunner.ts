import fs from 'fs';
import path from 'path';
import { getDatabase, runTransaction } from './connection';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_SELLERS, 
  INITIAL_ORDERS, 
  INITIAL_DISPUTES 
} from '../../src/data/mockData';

export const DEFAULT_USERS = [
  {
    id: 'cust-demo',
    email: 'customer@souqdesoq.eg',
    passwordHash: 'a109e36947ad56de1dca1cc49f0ef8ac9ad9a7b1aa0df41fb3c4cb73c1ff01ea',
    fullName: 'أحمد محمود النجار (مشتري معتمد)',
    phone: '01012345678',
    role: 'customer',
    createdAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'user-seller-1',
    email: 'farmawy@souqdesoq.eg',
    passwordHash: 'a109e36947ad56de1dca1cc49f0ef8ac9ad9a7b1aa0df41fb3c4cb73c1ff01ea',
    fullName: 'الحاج مصطفى الفرماوي (أقمشة دلتا دسوق)',
    phone: '01012345679',
    role: 'seller',
    sellerId: 'seller-1',
    createdAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'user-seller-2',
    email: 'carpet@souqdesoq.eg',
    passwordHash: 'a109e36947ad56de1dca1cc49f0ef8ac9ad9a7b1aa0df41fb3c4cb73c1ff01ea',
    fullName: 'الأسطى عبد الحميد الغازي (سجاد وكليم دسوق التراثي)',
    phone: '01012345680',
    role: 'seller',
    sellerId: 'seller-2',
    createdAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'user-support-1',
    email: 'support@souqdesoq.eg',
    passwordHash: 'a109e36947ad56de1dca1cc49f0ef8ac9ad9a7b1aa0df41fb3c4cb73c1ff01ea',
    fullName: 'أ. مروة الشاذلي (مستشار التحكيم وحماية المستهلك)',
    phone: '01233445566',
    role: 'support',
    createdAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'user-admin-root',
    email: 'justokayp@gmail.com',
    passwordHash: 'f0ce0e86206541c60bc47be815f83eba98004f63c883e6d71ff5cc929cb5f9ca',
    fullName: 'مدير عام منصة سوق دسوق (justokayp)',
    phone: '01000000000',
    role: 'admin',
    createdAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'user-admin-1',
    email: 'admin@souqdesoq.eg',
    passwordHash: 'a109e36947ad56de1dca1cc49f0ef8ac9ad9a7b1aa0df41fb3c4cb73c1ff01ea',
    fullName: 'م. كريم دسوقي (المشرف العام على المنصة)',
    phone: '01555667788',
    role: 'admin',
    createdAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'user-courier-1',
    email: 'courier@souqdesoq.eg',
    passwordHash: 'a109e36947ad56de1dca1cc49f0ef8ac9ad9a7b1aa0df41fb3c4cb73c1ff01ea',
    fullName: 'الكابتن إبراهيم عاشور (مندوب دسوق Express)',
    phone: '01055443322',
    role: 'courier',
    createdAt: '2026-09-01T10:00:00Z',
  },
];

const SCHEMA_FILE = path.join(process.cwd(), 'server', 'database', 'schema.sql');
const DATA_DIR = path.join(process.cwd(), 'server', 'data');
const STORE_JSON = path.join(DATA_DIR, 'store.json');
const STORE_BACKUP = path.join(DATA_DIR, 'store.json.migrated_backup');

export function runMigrations(): void {
  const db = getDatabase();

  // Create migrations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);

  const appliedRows = db.prepare('SELECT version FROM schema_migrations ORDER BY version ASC').all() as { version: number }[];
  const appliedSet = new Set(appliedRows.map(r => r.version));

  // Migration 1: Initial Normalized Relational Schema
  if (!appliedSet.has(1)) {
    console.log('🔄 [DB MIGRATION] Applying Migration 001: Initial Normalized Relational Schema...');
    const schemaSql = fs.readFileSync(SCHEMA_FILE, 'utf-8');
    db.exec(schemaSql);

    // Seed/migrate data inside an atomic transaction
    runTransaction((tx) => {
      let initialData: any = null;

      if (fs.existsSync(STORE_JSON)) {
        try {
          const raw = fs.readFileSync(STORE_JSON, 'utf-8');
          initialData = JSON.parse(raw);
          console.log('📦 [DB MIGRATION] Migrating existing data from store.json into SQLite...');
        } catch (e) {
          console.warn('Could not parse store.json, falling back to seed constants:', e);
        }
      }

      const usersToInsert = initialData?.users && initialData.users.length > 0 ? initialData.users : DEFAULT_USERS;
      const sellersToInsert = initialData?.sellers && initialData.sellers.length > 0 ? initialData.sellers : INITIAL_SELLERS;
      const productsToInsert = initialData?.products && initialData.products.length > 0 ? initialData.products : INITIAL_PRODUCTS;
      const ordersToInsert = initialData?.orders && initialData.orders.length > 0 ? initialData.orders : INITIAL_ORDERS;
      const disputesToInsert = initialData?.disputes && initialData.disputes.length > 0 ? initialData.disputes : INITIAL_DISPUTES;
      const ledgerToInsert = initialData?.ledger || [];
      const cartsToInsert = initialData?.carts || {};
      const sessionsToInsert = initialData?.sessions || [];

      // 1. Insert Users
      const insertUserStmt = tx.prepare(`
        INSERT OR IGNORE INTO users (id, email, password_hash, full_name, phone, role, seller_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const u of usersToInsert) {
        insertUserStmt.run(u.id, u.email, u.passwordHash, u.fullName, u.phone, u.role, u.sellerId || null, u.createdAt || new Date().toISOString());
      }

      // 2. Insert Sessions
      const insertSessionStmt = tx.prepare(`
        INSERT OR IGNORE INTO sessions (token, user_id, role, seller_id, created_at, expires_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      for (const s of sessionsToInsert) {
        insertSessionStmt.run(s.token, s.userId, s.role, s.sellerId || null, s.createdAt || new Date().toISOString(), s.expiresAt);
      }

      // 3. Insert Sellers
      const insertSellerStmt = tx.prepare(`
        INSERT OR IGNORE INTO sellers (
          id, name, trade_name, commercial_reg, tax_id, commission_rate, status,
          verification_status, desoq_district, phone, rating, total_sales_egp,
          available_balance_egp, pending_balance_egp, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const sel of sellersToInsert) {
        insertSellerStmt.run(
          sel.id,
          sel.name,
          sel.tradeName || sel.name,
          sel.commercialReg || null,
          sel.taxId || null,
          sel.commissionRate ?? 0.08,
          sel.status || 'active',
          sel.verificationStatus || 'verified',
          sel.desoqDistrict || 'حي الصفا',
          sel.phone || '01012345678',
          sel.rating ?? 5.0,
          sel.totalSalesEGP ?? 0,
          sel.availableBalanceEGP ?? 0,
          sel.pendingBalanceEGP ?? 0,
          sel.joinedDate || sel.createdAt || new Date().toISOString()
        );
      }

      // 4. Insert Products, Product Variants & Inventory
      const insertProdStmt = tx.prepare(`
        INSERT OR IGNORE INTO products (
          id, seller_id, title_ar, title_en, description_ar, category, price_egp,
          original_price_egp, images_json, stock, rating, review_count, is_featured,
          is_desoq_local_made, is_fast_desoq_delivery, attributes_json, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const insertVariantStmt = tx.prepare(`
        INSERT OR IGNORE INTO product_variants (
          id, product_id, name, sku, price_egp, stock, attributes_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const insertInvStmt = tx.prepare(`
        INSERT OR IGNORE INTO inventory (
          id, product_id, variant_id, seller_id, stock, reserved, low_stock_threshold, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const prod of productsToInsert) {
        insertProdStmt.run(
          prod.id,
          prod.sellerId,
          prod.titleAr,
          prod.titleEn || prod.titleAr,
          prod.descriptionAr,
          prod.category,
          prod.priceEGP,
          prod.originalPriceEGP || null,
          JSON.stringify(prod.images || []),
          prod.stock ?? 0,
          prod.rating ?? 5.0,
          prod.reviewCount ?? 0,
          prod.isFeatured ? 1 : 0,
          prod.isDesoqLocalMade ? 1 : 0,
          prod.isFastDesoqDelivery ? 1 : 0,
          JSON.stringify(prod.attributes || {}),
          prod.status || 'active',
          prod.createdAt || new Date().toISOString()
        );

        // Base inventory record
        insertInvStmt.run(
          `inv-${prod.id}`,
          prod.id,
          null,
          prod.sellerId,
          prod.stock ?? 0,
          0,
          5,
          new Date().toISOString()
        );

        // Variants if any
        if (prod.variants && prod.variants.length > 0) {
          for (const v of prod.variants) {
            insertVariantStmt.run(
              v.id,
              prod.id,
              v.name,
              v.sku,
              v.priceEGP,
              v.stock,
              JSON.stringify(v.attributes || {})
            );

            insertInvStmt.run(
              `inv-${v.id}`,
              prod.id,
              v.id,
              prod.sellerId,
              v.stock,
              0,
              5,
              new Date().toISOString()
            );
          }
        }
      }

      // 5. Insert Cart Items
      const insertCartStmt = tx.prepare(`
        INSERT OR REPLACE INTO cart_items (
          id, user_id, product_id, variant_id, quantity, seller_id, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const [userId, items] of Object.entries(cartsToInsert)) {
        if (Array.isArray(items)) {
          for (const it of items as any[]) {
            const vId = it.selectedVariant?.id || null;
            const cartId = `cart-${userId}-${it.product.id}-${vId || 'base'}`;
            insertCartStmt.run(
              cartId,
              userId,
              it.product.id,
              vId,
              it.quantity,
              it.sellerId || it.product.sellerId,
              new Date().toISOString(),
              new Date().toISOString()
            );
          }
        }
      }

      // 6. Insert Orders, SubOrders, Order Items, Payments, Shipments, Commissions
      const insertOrderStmt = tx.prepare(`
        INSERT OR REPLACE INTO orders (
          id, tracking_code, customer_id, customer_name, customer_phone,
          shipping_governorate, shipping_city, shipping_district, shipping_street,
          shipping_building, shipping_floor, shipping_apartment, shipping_landmarks,
          shipping_postal_code, payment_method, payment_status, fawry_reference_code,
          total_subtotal_egp, total_shipping_egp, discount_egp, total_amount_egp,
          order_status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const insertSubOrderStmt = tx.prepare(`
        INSERT OR REPLACE INTO sub_orders (
          id, order_id, seller_id, seller_name, subtotal_egp, shipping_fee_egp,
          commission_egp, seller_net_egp, status, shipping_provider, tracking_number,
          estimated_delivery, status_history_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const insertOrderItemStmt = tx.prepare(`
        INSERT OR REPLACE INTO order_items (
          id, order_id, sub_order_id, product_id, variant_id, product_title_ar,
          variant_name, quantity, unit_price_egp, total_price_egp, seller_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const insertPaymentStmt = tx.prepare(`
        INSERT OR REPLACE INTO payments (
          id, order_id, amount_egp, currency, payment_method, status,
          transaction_ref, gateway_payload_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const insertShipmentStmt = tx.prepare(`
        INSERT OR REPLACE INTO shipments (
          id, sub_order_id, order_id, seller_id, provider, tracking_number,
          origin_address, destination_address, status, dispatched_at, delivered_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const insertCommissionStmt = tx.prepare(`
        INSERT OR REPLACE INTO commissions (
          id, order_id, sub_order_id, seller_id, subtotal_egp, commission_rate,
          commission_amount_egp, seller_net_amount_egp, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const ord of ordersToInsert) {
        insertOrderStmt.run(
          ord.id,
          ord.trackingCode,
          ord.customerId || `cust-${Date.now()}`,
          ord.customerName,
          ord.customerPhone,
          ord.shippingAddress?.governorate || 'كفر الشيخ',
          ord.shippingAddress?.city || 'دسوق',
          ord.shippingAddress?.district || 'حي الصفا',
          ord.shippingAddress?.streetDetails || ord.shippingAddress?.street || 'شارع الجيش',
          ord.shippingAddress?.buildingNo || ord.shippingAddress?.building || null,
          ord.shippingAddress?.floor || null,
          ord.shippingAddress?.apartment || null,
          ord.shippingAddress?.landmarks || null,
          ord.shippingAddress?.postalCode || null,
          ord.paymentMethod,
          ord.paymentStatus,
          ord.fawryReferenceCode || null,
          ord.totalSubtotalEGP,
          ord.totalShippingEGP,
          ord.discountEGP || 0,
          ord.totalAmountEGP,
          ord.orderStatus,
          ord.createdAt || new Date().toISOString(),
          ord.createdAt || new Date().toISOString()
        );

        // Payment record
        insertPaymentStmt.run(
          `pay-${ord.id}`,
          ord.id,
          ord.totalAmountEGP,
          'EGP',
          ord.paymentMethod,
          ord.paymentStatus === 'paid' ? 'completed' : 'pending',
          ord.fawryReferenceCode || ord.trackingCode,
          null,
          ord.createdAt || new Date().toISOString()
        );

        if (ord.subOrders && ord.subOrders.length > 0) {
          for (const sub of ord.subOrders) {
            insertSubOrderStmt.run(
              sub.id,
              ord.id,
              sub.sellerId,
              sub.sellerName,
              sub.subtotalEGP,
              sub.shippingFeeEGP,
              sub.commissionEGP,
              sub.sellerNetEGP,
              sub.status,
              sub.shippingProvider,
              sub.trackingNumber,
              sub.estimatedDelivery,
              JSON.stringify(sub.statusHistory || []),
              ord.createdAt || new Date().toISOString()
            );

            // Shipment record
            insertShipmentStmt.run(
              `ship-${sub.id}`,
              sub.id,
              ord.id,
              sub.sellerId,
              sub.shippingProvider,
              sub.trackingNumber,
              'دسوق، كفر الشيخ',
              ord.shippingAddress?.city || 'دسوق',
              sub.status === 'delivered' ? 'delivered' : (sub.status === 'shipped' ? 'in_transit' : 'manifested'),
              sub.status !== 'seller_confirmed' ? ord.createdAt : null,
              sub.status === 'delivered' ? ord.createdAt : null,
              ord.createdAt || new Date().toISOString()
            );

            // Commission record
            insertCommissionStmt.run(
              `comm-${sub.id}`,
              ord.id,
              sub.id,
              sub.sellerId,
              sub.subtotalEGP,
              sub.commissionEGP / (sub.subtotalEGP || 1),
              sub.commissionEGP,
              sub.sellerNetEGP,
              'realized',
              ord.createdAt || new Date().toISOString()
            );

            // Items
            if (sub.items && sub.items.length > 0) {
              for (const it of sub.items) {
                const vId = it.selectedVariant?.id || null;
                const vName = it.selectedVariant?.name || null;
                const unitPrice = it.selectedVariant?.priceEGP ?? it.product.priceEGP;
                const totalPrice = unitPrice * it.quantity;
                insertOrderItemStmt.run(
                  `item-${ord.id}-${sub.id}-${it.product.id}-${vId || 'base'}`,
                  ord.id,
                  sub.id,
                  it.product.id,
                  vId,
                  it.product.titleAr,
                  vName,
                  it.quantity,
                  unitPrice,
                  totalPrice,
                  sub.sellerId
                );
              }
            }
          }
        }
      }

      // 7. Insert Seller Ledger
      const insertLedgerStmt = tx.prepare(`
        INSERT OR REPLACE INTO seller_ledger (
          id, seller_id, order_id, sub_order_id, type, amount_egp, description, balance_after_egp, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const led of ledgerToInsert) {
        insertLedgerStmt.run(
          led.id,
          led.sellerId,
          led.orderId || null,
          led.subOrderId || null,
          led.type,
          led.amountEGP,
          led.description,
          led.balanceAfterEGP,
          led.timestamp || new Date().toISOString()
        );
      }

      // 8. Insert Disputes, Messages, and Refunds
      const insertDisputeStmt = tx.prepare(`
        INSERT OR REPLACE INTO disputes (
          id, order_id, sub_order_id, seller_id, seller_name, customer_name,
          reason, description, requested_resolution, status, resolution_text, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const insertMsgStmt = tx.prepare(`
        INSERT OR REPLACE INTO dispute_messages (
          id, dispute_id, sender, sender_name, message, created_at
        ) VALUES (?, ?, ?, ?, ?, ?)
      `);

      const insertRefundStmt = tx.prepare(`
        INSERT OR REPLACE INTO refunds (
          id, dispute_id, order_id, sub_order_id, seller_id, amount_egp,
          reason, status, processed_by, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const d of disputesToInsert) {
        insertDisputeStmt.run(
          d.id,
          d.orderId,
          d.subOrderId,
          d.sellerId,
          d.sellerName,
          d.customerName,
          d.reason,
          d.description,
          d.requestedResolution,
          d.status,
          d.resolution || null,
          d.createdAt || new Date().toISOString(),
          d.createdAt || new Date().toISOString()
        );

        if (d.messages && d.messages.length > 0) {
          let msgIdx = 1;
          for (const m of d.messages) {
            insertMsgStmt.run(
              `msg-${d.id}-${msgIdx++}`,
              d.id,
              m.sender,
              m.senderName,
              m.message,
              m.timestamp || new Date().toISOString()
            );
          }
        }

        if (d.status === 'resolved' && d.requestedResolution === 'refund') {
          insertRefundStmt.run(
            `ref-${d.id}`,
            d.id,
            d.orderId,
            d.subOrderId,
            d.sellerId,
            d.refundAmountEGP || 0,
            d.reason,
            'completed',
            'إدارة حماية المستهلك بسوق دسوق',
            d.createdAt || new Date().toISOString()
          );
        }
      }

      // Record migration
      tx.prepare('INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)').run(
        1,
        '001_initial_schema',
        new Date().toISOString()
      );
    });

    // Safely archive store.json so it is no longer the authoritative store
    if (fs.existsSync(STORE_JSON)) {
      try {
        fs.renameSync(STORE_JSON, STORE_BACKUP);
        console.log(`✅ [DB MIGRATION] Archived old store.json to ${STORE_BACKUP}`);
      } catch (err) {
        console.warn('Could not rename store.json:', err);
      }
    }

    console.log('✅ [DB MIGRATION] Migration 001 completed successfully!');
  }

  // Migration 2: Idempotency Keys and Transactional Flow Hardening
  if (!appliedSet.has(2)) {
    console.log('🔄 [DB MIGRATION] Applying Migration 002: Idempotency Keys and Transactional Flow Hardening...');
    runTransaction((tx) => {
      // Safely add idempotency_key to orders if missing
      const orderCols = tx.prepare("PRAGMA table_info(orders)").all() as { name: string }[];
      if (!orderCols.some(c => c.name === 'idempotency_key')) {
        tx.exec("ALTER TABLE orders ADD COLUMN idempotency_key TEXT;");
      }
      tx.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_idempotency_key ON orders(idempotency_key) WHERE idempotency_key IS NOT NULL;");

      // Safely add idempotency_key to payments if missing
      const paymentCols = tx.prepare("PRAGMA table_info(payments)").all() as { name: string }[];
      if (!paymentCols.some(c => c.name === 'idempotency_key')) {
        tx.exec("ALTER TABLE payments ADD COLUMN idempotency_key TEXT;");
      }
      tx.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_idempotency_key ON payments(idempotency_key) WHERE idempotency_key IS NOT NULL;");

      // Record migration
      tx.prepare('INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)').run(
        2,
        '002_idempotency_keys',
        new Date().toISOString()
      );
    });
    console.log('✅ [DB MIGRATION] Migration 002 completed successfully!');
  }

  // Migration 3: Synchronize Demo Accounts Password Hashes
  if (!appliedSet.has(3)) {
    console.log('🔄 [DB MIGRATION] Applying Migration 003: Synchronize Demo Accounts Password Hashes...');
    runTransaction((tx) => {
      const updateHashStmt = tx.prepare(`
        UPDATE users 
        SET password_hash = ? 
        WHERE email = ? OR id = ?
      `);

      for (const u of DEFAULT_USERS) {
        updateHashStmt.run(u.passwordHash, u.email.toLowerCase(), u.id);
      }

      // Record migration
      tx.prepare('INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)').run(
        3,
        '003_demo_auth_sync',
        new Date().toISOString()
      );
    });
    console.log('✅ [DB MIGRATION] Migration 003 completed successfully!');
  }

  // Migration 4: Media Storage, KYC Vault & Object Storage Foundation
  if (!appliedSet.has(4)) {
    console.log('🔄 [DB MIGRATION] Applying Migration 004: Media, KYC Vault & Object Storage Foundation...');
    runTransaction((tx) => {
      // 1. Create stored_files table
      tx.exec(`
        CREATE TABLE IF NOT EXISTS stored_files (
          id TEXT PRIMARY KEY,
          storage_key TEXT UNIQUE NOT NULL,
          bucket TEXT NOT NULL CHECK(bucket IN ('public', 'private')),
          purpose TEXT NOT NULL,
          original_filename TEXT NOT NULL,
          sanitized_filename TEXT NOT NULL,
          mime_type TEXT NOT NULL,
          size_bytes INTEGER NOT NULL CHECK(size_bytes >= 0),
          sha256_checksum TEXT NOT NULL,
          owner_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
          owner_seller_id TEXT REFERENCES sellers(id) ON DELETE CASCADE,
          associated_entity_type TEXT NOT NULL,
          associated_entity_id TEXT,
          public_url TEXT,
          metadata_json TEXT NOT NULL DEFAULT '{}',
          status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'archived', 'deleted')),
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_stored_files_storage_key ON stored_files(storage_key);
        CREATE INDEX IF NOT EXISTS idx_stored_files_owner_seller_id ON stored_files(owner_seller_id);
        CREATE INDEX IF NOT EXISTS idx_stored_files_purpose ON stored_files(purpose);
        CREATE INDEX IF NOT EXISTS idx_stored_files_bucket ON stored_files(bucket);
        CREATE INDEX IF NOT EXISTS idx_stored_files_entity ON stored_files(associated_entity_type, associated_entity_id);
      `);

      // 2. Create kyc_documents table
      tx.exec(`
        CREATE TABLE IF NOT EXISTS kyc_documents (
          id TEXT PRIMARY KEY,
          seller_id TEXT NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
          file_id TEXT NOT NULL REFERENCES stored_files(id) ON DELETE CASCADE,
          document_type TEXT NOT NULL CHECK(document_type IN ('commercial_register', 'tax_card', 'national_id', 'bank_proof', 'other')),
          title_ar TEXT NOT NULL,
          document_number TEXT,
          status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected', 'expired')),
          review_notes TEXT,
          reviewed_by TEXT,
          reviewed_at TEXT,
          expiry_date TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_kyc_documents_seller_id ON kyc_documents(seller_id);
        CREATE INDEX IF NOT EXISTS idx_kyc_documents_status ON kyc_documents(status);
      `);

      // 3. Seed initial Verified & Pending KYC documents (empty for clean environment)
      const kycDocsSeed: any[] = [];

      const insertFileStmt = tx.prepare(`
        INSERT OR REPLACE INTO stored_files (
          id, storage_key, bucket, purpose, original_filename, sanitized_filename,
          mime_type, size_bytes, sha256_checksum, owner_user_id, owner_seller_id,
          associated_entity_type, associated_entity_id, public_url, metadata_json,
          status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const insertKycStmt = tx.prepare(`
        INSERT OR REPLACE INTO kyc_documents (
          id, seller_id, file_id, document_type, title_ar, document_number,
          status, review_notes, reviewed_by, reviewed_at, expiry_date,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const now = new Date().toISOString();

      // Ensure storage directories and sample files exist on disk for demo seeds
      const storageDir = path.join(process.cwd(), 'server', 'data', 'storage');
      const publicDir = path.join(storageDir, 'public');
      const privateDir = path.join(storageDir, 'private');
      if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
      if (!fs.existsSync(privateDir)) fs.mkdirSync(privateDir, { recursive: true });

      for (const kyc of kycDocsSeed) {
        insertFileStmt.run(
          kyc.fileId,
          kyc.file.storageKey,
          'private',
          kyc.file.purpose,
          kyc.file.originalFilename,
          kyc.file.sanitizedFilename,
          kyc.file.mimeType,
          kyc.file.sizeBytes,
          kyc.file.sha256Checksum,
          kyc.file.ownerUserId,
          kyc.file.ownerSellerId,
          kyc.file.associatedEntityType,
          kyc.file.associatedEntityId,
          null, // private, no public url
          JSON.stringify({ isSensitive: true, seed: true }),
          'active',
          kyc.createdAt,
          now
        );

        insertKycStmt.run(
          kyc.id,
          kyc.sellerId,
          kyc.fileId,
          kyc.documentType,
          kyc.titleAr,
          kyc.documentNumber,
          kyc.status,
          kyc.reviewNotes,
          kyc.reviewedBy,
          kyc.reviewedAt,
          kyc.expiryDate,
          kyc.createdAt,
          now
        );

        // Write a valid PDF file mock buffer onto disk storage so physical file retrieval works seamlessly
        try {
          const filePath = path.join(storageDir, kyc.file.storageKey);
          const fileDir = path.dirname(filePath);
          if (!fs.existsSync(fileDir)) fs.mkdirSync(fileDir, { recursive: true });
          if (!fs.existsSync(filePath)) {
            const samplePdf = Buffer.from(
              `%PDF-1.4\n1 0 obj\n<< /Title (${kyc.titleAr}) /Author (${kyc.sellerId}) /Creator (Souq Desoq KYC Vault) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF`
            );
            fs.writeFileSync(filePath, samplePdf);
          }
        } catch (e) {
          console.warn('Could not write seed KYC file to storage:', e);
        }
      }

      // Record migration
      tx.prepare('INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)').run(
        4,
        '004_media_kyc_storage',
        now
      );
    });
    console.log('✅ [DB MIGRATION] Migration 004 completed successfully!');
  }

  // Migration 5: Reliable Event Bus, Message Queues & Background Workers
  if (!appliedSet.has(5)) {
    console.log('🔄 [DB MIGRATION] Applying Migration 005: Event Bus, Message Queues & Background Workers...');
    runTransaction((tx) => {
      // 1. Create domain_events table
      tx.exec(`
        CREATE TABLE IF NOT EXISTS domain_events (
          id TEXT PRIMARY KEY,
          event_name TEXT NOT NULL,
          aggregate_type TEXT NOT NULL,
          aggregate_id TEXT NOT NULL,
          payload_json TEXT NOT NULL,
          metadata_json TEXT NOT NULL DEFAULT '{}',
          idempotency_key TEXT UNIQUE NOT NULL,
          status TEXT NOT NULL DEFAULT 'published' CHECK(status IN ('pending', 'published', 'failed')),
          created_at TEXT NOT NULL,
          published_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_domain_events_event_name ON domain_events(event_name);
        CREATE INDEX IF NOT EXISTS idx_domain_events_aggregate ON domain_events(aggregate_type, aggregate_id);
        CREATE INDEX IF NOT EXISTS idx_domain_events_idempotency ON domain_events(idempotency_key);
        CREATE INDEX IF NOT EXISTS idx_domain_events_created_at ON domain_events(created_at);
      `);

      // 2. Create background_jobs table
      tx.exec(`
        CREATE TABLE IF NOT EXISTS background_jobs (
          id TEXT PRIMARY KEY,
          queue_name TEXT NOT NULL,
          job_type TEXT NOT NULL,
          payload_json TEXT NOT NULL,
          idempotency_key TEXT UNIQUE NOT NULL,
          status TEXT NOT NULL DEFAULT 'queued' CHECK(status IN ('queued', 'running', 'completed', 'failed', 'dead_letter')),
          priority INTEGER NOT NULL DEFAULT 10,
          attempts INTEGER NOT NULL DEFAULT 0,
          max_attempts INTEGER NOT NULL DEFAULT 5,
          backoff_ms INTEGER NOT NULL DEFAULT 1000,
          scheduled_at TEXT NOT NULL,
          started_at TEXT,
          completed_at TEXT,
          failed_at TEXT,
          error_message TEXT,
          stack_trace TEXT,
          event_id TEXT REFERENCES domain_events(id) ON DELETE SET NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_background_jobs_queue_status ON background_jobs(queue_name, status);
        CREATE INDEX IF NOT EXISTS idx_background_jobs_scheduled_status ON background_jobs(status, scheduled_at);
        CREATE INDEX IF NOT EXISTS idx_background_jobs_idempotency ON background_jobs(idempotency_key);
      `);

      // 3. Create job_execution_logs table
      tx.exec(`
        CREATE TABLE IF NOT EXISTS job_execution_logs (
          id TEXT PRIMARY KEY,
          job_id TEXT NOT NULL REFERENCES background_jobs(id) ON DELETE CASCADE,
          attempt_number INTEGER NOT NULL,
          status TEXT NOT NULL CHECK(status IN ('success', 'failed', 'retry')),
          duration_ms INTEGER NOT NULL,
          error_message TEXT,
          executed_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_job_logs_job_id ON job_execution_logs(job_id);
        CREATE INDEX IF NOT EXISTS idx_job_logs_executed_at ON job_execution_logs(executed_at);
      `);

      const now = new Date().toISOString();

      // Seed initial domain events and background jobs for system demonstration
      const seedEventId = `evt_init_${Date.now()}`;
      tx.prepare(`
        INSERT OR IGNORE INTO domain_events (
          id, event_name, aggregate_type, aggregate_id, payload_json,
          metadata_json, idempotency_key, status, created_at, published_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        seedEventId,
        'order.created',
        'order',
        'ord-1001',
        JSON.stringify({
          orderId: 'ord-1001',
          customerName: 'أحمد محمود النجار',
          customerPhone: '01012345678',
          totalAmountEGP: 850
        }),
        JSON.stringify({ source: 'migration_seed' }),
        'idem_evt_init_ord_1001',
        'published',
        now,
        now
      );

      const seedJobId = `job_init_${Date.now()}`;
      tx.prepare(`
        INSERT OR IGNORE INTO background_jobs (
          id, queue_name, job_type, payload_json, idempotency_key, status,
          priority, attempts, max_attempts, backoff_ms, scheduled_at,
          completed_at, event_id, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        seedJobId,
        'notifications',
        'send_order_notification',
        JSON.stringify({
          orderId: 'ord-1001',
          customerName: 'أحمد محمود النجار',
          customerPhone: '01012345678',
          totalAmountEGP: 850,
          subOrderCount: 1
        }),
        'job_idem_init_ord_1001',
        'completed',
        5,
        1,
        5,
        1000,
        now,
        now,
        seedEventId,
        now,
        now
      );

      tx.prepare(`
        INSERT INTO job_execution_logs (id, job_id, attempt_number, status, duration_ms, executed_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        `jlog_init_${Date.now()}`,
        seedJobId,
        1,
        'success',
        42,
        now
      );

      // Record migration
      tx.prepare('INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)').run(
        5,
        '005_events_and_background_jobs',
        now
      );
    });
    console.log('✅ [DB MIGRATION] Migration 005 completed successfully!');
  }

  // Migration 6: Observability, Structured Logs & Security Audit Trail (Priority 9)
  if (!appliedSet.has(6)) {
    console.log('🔄 [DB MIGRATION] Applying Migration 006: Observability, Structured Logging & Security Audit Trail...');
    runTransaction((tx) => {
      tx.exec(`
        -- 1. Structured Application System Logs
        CREATE TABLE IF NOT EXISTS system_logs (
          id TEXT PRIMARY KEY,
          level TEXT NOT NULL, -- debug, info, warn, error, fatal
          message TEXT NOT NULL,
          service TEXT NOT NULL,
          trace_id TEXT NOT NULL,
          action TEXT,
          user_id TEXT,
          duration_ms REAL,
          status_code INTEGER,
          client_ip TEXT,
          context_json TEXT,
          error_json TEXT,
          created_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at);
        CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
        CREATE INDEX IF NOT EXISTS idx_system_logs_trace_id ON system_logs(trace_id);
        CREATE INDEX IF NOT EXISTS idx_system_logs_service ON system_logs(service);

        -- 2. Security & Administrative Audit Trail
        CREATE TABLE IF NOT EXISTS security_audit_logs (
          id TEXT PRIMARY KEY,
          actor_id TEXT NOT NULL,
          actor_role TEXT NOT NULL,
          action TEXT NOT NULL,
          resource_type TEXT NOT NULL,
          resource_id TEXT NOT NULL,
          details_json TEXT,
          ip_address TEXT,
          status TEXT NOT NULL, -- success, failure, denied
          severity TEXT NOT NULL, -- low, medium, high, critical
          created_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON security_audit_logs(created_at);
        CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON security_audit_logs(actor_id);
        CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON security_audit_logs(action);
        CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON security_audit_logs(resource_type, resource_id);

        -- 3. Service Metrics Snapshot
        CREATE TABLE IF NOT EXISTS service_metrics_snapshots (
          id TEXT PRIMARY KEY,
          metric_name TEXT NOT NULL,
          metric_value REAL NOT NULL,
          tags_json TEXT,
          recorded_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_metrics_recorded_at ON service_metrics_snapshots(recorded_at);
      `);

      const now = new Date().toISOString();

      // Seed initial sample logs and audit entry
      tx.prepare(`
        INSERT INTO system_logs (
          id, level, message, service, trace_id, action,
          user_id, duration_ms, status_code, client_ip, context_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        `log_init_${Date.now()}`,
        'info',
        'نظام سوق دسوق يعمل بكامل طاقته التشغيلية مع تفعيل المراقبة الشاملة',
        'system_init',
        `trc_init_${Date.now()}`,
        'SYSTEM_STARTUP',
        'user-admin-1',
        18,
        200,
        '127.0.0.1',
        JSON.stringify({ component: 'observability_engine', version: '2.0.0' }),
        now
      );

      tx.prepare(`
        INSERT INTO security_audit_logs (
          id, actor_id, actor_role, action, resource_type,
          resource_id, details_json, ip_address, status, severity, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        `audit_init_${Date.now()}`,
        'user-admin-1',
        'admin',
        'SYSTEM_OBSERVABILITY_ACTIVATED',
        'platform',
        'souq_desoq_v2',
        JSON.stringify({ tier: '09', status: 'operational', hardened: true }),
        '127.0.0.1',
        'success',
        'low',
        now
      );

      // Record migration
      tx.prepare('INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)').run(
        6,
        '006_reliability_and_observability',
        now
      );
    });
    console.log('✅ [DB MIGRATION] Migration 006 completed successfully!');
  }

  // Migration 7: Dedicated Search Engine & Multi-Factor Discovery Index
  if (!appliedSet.has(7)) {
    console.log('🔄 [DB MIGRATION] Applying Migration 007: Dedicated Search & Discovery Index...');
    runTransaction((tx) => {
      // 1. Search Product Documents Table
      tx.exec(`
        CREATE TABLE IF NOT EXISTS search_product_documents (
          product_id TEXT PRIMARY KEY,
          title_ar TEXT NOT NULL,
          normalized_title TEXT NOT NULL,
          title_en TEXT,
          description_ar TEXT NOT NULL,
          normalized_description TEXT NOT NULL,
          category TEXT NOT NULL,
          category_name_ar TEXT NOT NULL,
          seller_id TEXT NOT NULL,
          seller_name TEXT NOT NULL,
          seller_city TEXT NOT NULL,
          seller_is_verified INTEGER NOT NULL DEFAULT 0,
          is_desoq_local_made INTEGER NOT NULL DEFAULT 0,
          is_fast_desoq_delivery INTEGER NOT NULL DEFAULT 0,
          brand TEXT,
          price_egp REAL NOT NULL,
          original_price_egp REAL,
          stock INTEGER NOT NULL DEFAULT 0,
          is_in_stock INTEGER NOT NULL DEFAULT 0,
          rating REAL NOT NULL DEFAULT 5.0,
          review_count INTEGER NOT NULL DEFAULT 0,
          is_featured INTEGER NOT NULL DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'active',
          tags_json TEXT DEFAULT '[]',
          attributes_json TEXT DEFAULT '{}',
          keywords_text TEXT NOT NULL,
          popularity_score REAL NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        -- Performance Indexes for Search & Filter Facets
        CREATE INDEX IF NOT EXISTS idx_search_category ON search_product_documents(category);
        CREATE INDEX IF NOT EXISTS idx_search_seller ON search_product_documents(seller_id);
        CREATE INDEX IF NOT EXISTS idx_search_price ON search_product_documents(price_egp);
        CREATE INDEX IF NOT EXISTS idx_search_stock ON search_product_documents(is_in_stock, stock);
        CREATE INDEX IF NOT EXISTS idx_search_rating ON search_product_documents(rating);
        CREATE INDEX IF NOT EXISTS idx_search_desoq ON search_product_documents(is_desoq_local_made);
        CREATE INDEX IF NOT EXISTS idx_search_fast_deliv ON search_product_documents(is_fast_desoq_delivery);
        CREATE INDEX IF NOT EXISTS idx_search_brand ON search_product_documents(brand);
        CREATE INDEX IF NOT EXISTS idx_search_popularity ON search_product_documents(popularity_score);
        CREATE INDEX IF NOT EXISTS idx_search_status ON search_product_documents(status);
      `);

      // Seed all existing products into search_product_documents
      const productRows = tx.prepare('SELECT * FROM products').all() as any[];
      const sellerRows = tx.prepare("SELECT id, name, desoq_district AS city, (CASE WHEN verification_status = 'verified' THEN 1 ELSE 0 END) AS is_verified FROM sellers").all() as any[];
      const sellerMap = new Map(sellerRows.map(s => [s.id, s]));

      const insertStmt = tx.prepare(`
        INSERT OR REPLACE INTO search_product_documents (
          product_id, title_ar, normalized_title, title_en, description_ar,
          normalized_description, category, category_name_ar, seller_id, seller_name,
          seller_city, seller_is_verified, is_desoq_local_made, is_fast_desoq_delivery,
          brand, price_egp, original_price_egp, stock, is_in_stock, rating,
          review_count, is_featured, status, tags_json, attributes_json,
          keywords_text, popularity_score, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const now = new Date().toISOString();

      // Simple normalizer helper inside migration
      const normalizeAr = (txt: string) => {
        if (!txt) return '';
        return txt
          .toLowerCase()
          .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
          .replace(/[أإآٱ]/g, 'ا')
          .replace(/ة/g, 'ه')
          .replace(/ى/g, 'ي')
          .replace(/ؤ/g, 'و')
          .replace(/ئ/g, 'ي')
          .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'«»]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      };

      for (const p of productRows) {
        const seller = sellerMap.get(p.seller_id);
        const normTitle = normalizeAr(p.title_ar);
        const normDesc = normalizeAr(p.description_ar);
        const sellerName = seller?.name || 'تاجر دسوق';
        const sellerCity = seller?.city || 'دسوق';
        const sellerIsVerified = seller?.is_verified ? 1 : 0;
        const isDesoq = p.is_desoq_local_made ? 1 : 0;
        const isFast = p.is_fast_desoq_delivery ? 1 : 0;
        const isFeatured = p.is_featured ? 1 : 0;
        const isInStock = (p.stock > 0) ? 1 : 0;

        let attrs: any = {};
        try { attrs = JSON.parse(p.attributes_json || '{}'); } catch {}
        const brand = attrs.brand || attrs.الماركة || sellerName;

        const tags: string[] = [];
        if (isDesoq) tags.push('منتج مميز', 'جودة عالية', 'أصلي');
        if (isFast) tags.push('توصيل سريع', '24 ساعة');

        const keywordsText = normalizeAr([
          normTitle,
          p.title_en || '',
          normDesc,
          p.category || '',
          sellerName,
          sellerCity,
          ...tags
        ].join(' '));

        let popularity = (Number(p.rating || 5) * 10) + (Number(p.review_count || 0) * 2);
        if (isFeatured) popularity += 25;
        if (isDesoq) popularity += 20;
        if (isInStock) popularity += 10;

        insertStmt.run(
          p.id,
          p.title_ar,
          normTitle,
          p.title_en || p.title_ar,
          p.description_ar,
          normDesc,
          p.category,
          p.category,
          p.seller_id,
          sellerName,
          sellerCity,
          sellerIsVerified,
          isDesoq,
          isFast,
          brand,
          p.price_egp,
          p.original_price_egp || null,
          p.stock,
          isInStock,
          p.rating || 5.0,
          p.review_count || 0,
          isFeatured,
          p.status || 'active',
          JSON.stringify(tags),
          p.attributes_json || '{}',
          keywordsText,
          popularity,
          p.created_at || now,
          now
        );
      }

      // Record migration
      tx.prepare('INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)').run(
        7,
        '007_search_and_discovery_layer',
        now
      );
    });
    console.log('✅ [DB MIGRATION] Migration 007 (Search & Discovery) completed successfully!');
  }

  // Migration 8: Support Ticketing Enhancements (Priority, Internal Notes, Attachments)
  if (!appliedSet.has(8)) {
    console.log('🔄 [DB MIGRATION] Applying Migration 008: Support Ticketing Enhancements...');
    runTransaction((tx) => {
      // Add columns safely (SQLite allows adding columns without full table rebuilds)
      try {
        tx.exec(`
          ALTER TABLE disputes ADD COLUMN priority TEXT DEFAULT 'normal';
        `);
      } catch (e) {
        console.warn('Priority column might already exist:', e);
      }

      try {
        tx.exec(`
          ALTER TABLE disputes ADD COLUMN internal_notes_json TEXT DEFAULT '[]';
        `);
      } catch (e) {
        console.warn('Internal notes json column might already exist:', e);
      }

      try {
        tx.exec(`
          ALTER TABLE disputes ADD COLUMN attachments_json TEXT DEFAULT '[]';
        `);
      } catch (e) {
        console.warn('Attachments json column might already exist:', e);
      }

      // Record migration
      const now = new Date().toISOString();
      tx.prepare('INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)').run(
        8,
        '008_support_ticketing_enhancements',
        now
      );
    });
    console.log('✅ [DB MIGRATION] Migration 008 (Support Ticketing) completed successfully!');
  }

  // Migration 9: Full Reseed of Catalog & Sellers for 11 Expanded Categories
  if (!appliedSet.has(9)) {
    console.log('🔄 [DB MIGRATION] Applying Migration 009: Full Catalog & Sellers Reseed for 11 Categories...');
    runTransaction((tx) => {
      // 1. Upsert Sellers
      const insertSellerStmt = tx.prepare(`
        INSERT INTO sellers (
          id, name, trade_name, commercial_reg, tax_id, commission_rate, status,
          verification_status, desoq_district, phone, rating, total_sales_egp,
          available_balance_egp, pending_balance_egp, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          trade_name = excluded.trade_name,
          commercial_reg = excluded.commercial_reg,
          tax_id = excluded.tax_id,
          commission_rate = excluded.commission_rate,
          status = excluded.status,
          verification_status = excluded.verification_status,
          desoq_district = excluded.desoq_district,
          phone = excluded.phone,
          rating = excluded.rating,
          total_sales_egp = excluded.total_sales_egp,
          available_balance_egp = excluded.available_balance_egp,
          pending_balance_egp = excluded.pending_balance_egp
      `);
      for (const sel of INITIAL_SELLERS) {
        insertSellerStmt.run(
          sel.id,
          sel.name,
          sel.arabicName || sel.name,
          sel.commercialRecordNumber || null,
          sel.taxRegistrationNumber || null,
          sel.commissionRate ?? 0.08,
          sel.verificationStatus === 'verified' ? 'active' : 'pending',
          sel.verificationStatus || 'verified',
          sel.address || 'حي الصفا',
          sel.phone || '01012345678',
          sel.rating ?? 5.0,
          sel.totalSalesEGP ?? 0,
          sel.availableBalanceEGP ?? 0,
          sel.pendingBalanceEGP ?? 0,
          sel.joinedDate || new Date().toISOString()
        );
      }

      // 2. Upsert Products & Inventory
      const insertProdStmt = tx.prepare(`
        INSERT INTO products (
          id, seller_id, title_ar, title_en, description_ar, category, price_egp,
          original_price_egp, images_json, stock, rating, review_count, is_featured,
          is_desoq_local_made, is_fast_desoq_delivery, attributes_json, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          seller_id = excluded.seller_id,
          title_ar = excluded.title_ar,
          title_en = excluded.title_en,
          description_ar = excluded.description_ar,
          category = excluded.category,
          price_egp = excluded.price_egp,
          original_price_egp = excluded.original_price_egp,
          images_json = excluded.images_json,
          stock = excluded.stock,
          rating = excluded.rating,
          review_count = excluded.review_count,
          is_featured = excluded.is_featured,
          is_desoq_local_made = excluded.is_desoq_local_made,
          is_fast_desoq_delivery = excluded.is_fast_desoq_delivery,
          attributes_json = excluded.attributes_json,
          status = excluded.status
      `);

      const insertInvStmt = tx.prepare(`
        INSERT INTO inventory (
          id, product_id, variant_id, seller_id, stock, reserved, low_stock_threshold, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          seller_id = excluded.seller_id,
          stock = excluded.stock,
          updated_at = excluded.updated_at
      `);

      for (const prod of INITIAL_PRODUCTS) {
        insertProdStmt.run(
          prod.id,
          prod.sellerId,
          prod.titleAr,
          prod.titleEn || prod.titleAr,
          prod.descriptionAr,
          prod.category,
          prod.priceEGP,
          prod.originalPriceEGP || null,
          JSON.stringify(prod.images || []),
          prod.stock ?? 0,
          prod.rating ?? 5.0,
          prod.reviewCount ?? 0,
          prod.isFeatured ? 1 : 0,
          prod.isDesoqLocalMade ? 1 : 0,
          prod.isFastDesoqDelivery ? 1 : 0,
          JSON.stringify(prod.attributes || {}),
          prod.status || 'active',
          prod.createdAt || new Date().toISOString()
        );

        insertInvStmt.run(
          `inv-${prod.id}`,
          prod.id,
          null,
          prod.sellerId,
          prod.stock ?? 0,
          0,
          5,
          new Date().toISOString()
        );
      }

      // 3. Update search index if table exists
      try {
        tx.exec('DELETE FROM catalog_search_index;');
        const normalizeAr = (text: string): string => {
          if (!text) return '';
          return text
            .toLowerCase()
            .replace(/[أإآ]/g, 'ا')
            .replace(/ة/g, 'ه')
            .replace(/ى/g, 'ي')
            .replace(/ؤ/g, 'و')
            .replace(/ئ/g, 'ي')
            .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'«»]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        };

        const insertSearchStmt = tx.prepare(`
          INSERT INTO catalog_search_index (
            product_id, title_ar, title_ar_norm, title_en, description_ar, description_ar_norm,
            category_id, category_name_ar, seller_id, seller_name, seller_city, seller_is_verified,
            is_desoq_local_made, is_fast_desoq_delivery, brand, price_egp, original_price_egp,
            stock, is_in_stock, rating, review_count, is_featured, status, tags_json,
            attributes_json, keywords_text, popularity_score, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const sellerMap = new Map(INITIAL_SELLERS.map(s => [s.id, s]));

        for (const p of INITIAL_PRODUCTS) {
          const seller = sellerMap.get(p.sellerId);
          const normTitle = normalizeAr(p.titleAr);
          const normDesc = normalizeAr(p.descriptionAr);
          const sellerName = seller?.name || 'تاجر دسوق';
          const sellerCity = seller?.city || 'دسوق';
          const sellerIsVerified = seller?.verificationStatus === 'verified' ? 1 : 0;
          const isDesoq = p.isDesoqLocalMade ? 1 : 0;
          const isFast = p.isFastDesoqDelivery ? 1 : 0;
          const isFeatured = p.isFeatured ? 1 : 0;
          const isInStock = (p.stock > 0) ? 1 : 0;
          const brand = p.attributes?.brand || sellerName;

          const tags: string[] = [];
          if (isDesoq) tags.push('منتج مميز', 'جودة عالية', 'أصلي');
          if (isFast) tags.push('توصيل سريع', '24 ساعة');

          const keywordsText = normalizeAr([
            normTitle,
            p.titleEn || '',
            normDesc,
            p.category || '',
            sellerName,
            sellerCity,
            ...tags
          ].join(' '));

          let popularity = (Number(p.rating || 5) * 10) + (Number(p.reviewCount || 0) * 2);
          if (isFeatured) popularity += 25;
          if (isDesoq) popularity += 20;
          if (isInStock) popularity += 10;

          const nowStr = new Date().toISOString();

          insertSearchStmt.run(
            p.id,
            p.titleAr,
            normTitle,
            p.titleEn || p.titleAr,
            p.descriptionAr,
            normDesc,
            p.category,
            p.category,
            p.sellerId,
            sellerName,
            sellerCity,
            sellerIsVerified,
            isDesoq,
            isFast,
            brand,
            p.priceEGP,
            p.originalPriceEGP || null,
            p.stock,
            isInStock,
            p.rating || 5.0,
            p.reviewCount || 0,
            isFeatured,
            p.status || 'active',
            JSON.stringify(tags),
            JSON.stringify(p.attributes || {}),
            keywordsText,
            popularity,
            p.createdAt || nowStr,
            nowStr
          );
        }
      } catch (err) {
        console.warn('Could not refresh catalog_search_index:', err);
      }

      // Record migration
      const nowStr = new Date().toISOString();
      tx.prepare('INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)').run(
        9,
        '009_reseed_11_categories',
        nowStr
      );
    });
    console.log('✅ [DB MIGRATION] Migration 009 (Reseed 11 Categories) completed successfully!');
  }

  // Migration 10: Fashion, Perfumes & Accessories Domain Pivot
  if (!appliedSet.has(10)) {
    console.log('🔄 [DB MIGRATION] Applying Migration 010: Fashion, Perfumes & Accessories Domain Pivot...');
    runTransaction((tx) => {
      // 1. Clear old unrelated catalog data
      try { tx.exec('DELETE FROM catalog_search_index;'); } catch (e) {}
      try { tx.exec('DELETE FROM inventory;'); } catch (e) {}
      try { tx.exec('DELETE FROM product_variants;'); } catch (e) {}
      try { tx.exec('DELETE FROM dispute_messages;'); } catch (e) {}
      try { tx.exec('DELETE FROM disputes;'); } catch (e) {}
      try { tx.exec('DELETE FROM order_items;'); } catch (e) {}
      try { tx.exec('DELETE FROM shipments;'); } catch (e) {}
      try { tx.exec('DELETE FROM commissions;'); } catch (e) {}
      try { tx.exec('DELETE FROM payments;'); } catch (e) {}
      try { tx.exec('DELETE FROM seller_ledger;'); } catch (e) {}
      try { tx.exec('DELETE FROM sub_orders;'); } catch (e) {}
      try { tx.exec('DELETE FROM orders;'); } catch (e) {}
      try { tx.exec('DELETE FROM products;'); } catch (e) {}
      try { tx.exec('DELETE FROM sellers;'); } catch (e) {}

      // 2. Insert Sellers
      const insertSellerStmt = tx.prepare(`
        INSERT INTO sellers (
          id, name, trade_name, commercial_reg, tax_id, commission_rate, status,
          verification_status, desoq_district, phone, rating, total_sales_egp,
          available_balance_egp, pending_balance_egp, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          trade_name = excluded.trade_name,
          commercial_reg = excluded.commercial_reg,
          tax_id = excluded.tax_id,
          commission_rate = excluded.commission_rate,
          status = excluded.status,
          verification_status = excluded.verification_status,
          desoq_district = excluded.desoq_district,
          phone = excluded.phone,
          rating = excluded.rating,
          total_sales_egp = excluded.total_sales_egp,
          available_balance_egp = excluded.available_balance_egp,
          pending_balance_egp = excluded.pending_balance_egp
      `);
      for (const sel of INITIAL_SELLERS) {
        insertSellerStmt.run(
          sel.id,
          sel.name,
          sel.arabicName || sel.name,
          sel.commercialRecordNumber || null,
          sel.taxRegistrationNumber || null,
          sel.commissionRate ?? 0.08,
          sel.verificationStatus === 'verified' ? 'active' : 'pending',
          sel.verificationStatus || 'verified',
          sel.address || 'شارع الجيش',
          sel.phone || '01099887766',
          sel.rating ?? 5.0,
          sel.totalSalesEGP ?? 0,
          sel.availableBalanceEGP ?? 0,
          sel.pendingBalanceEGP ?? 0,
          sel.joinedDate || new Date().toISOString()
        );
      }

      // 3. Insert Products, Product Variants & Inventory
      const insertProdStmt = tx.prepare(`
        INSERT INTO products (
          id, seller_id, title_ar, title_en, description_ar, category, price_egp,
          original_price_egp, images_json, stock, rating, review_count, is_featured,
          is_desoq_local_made, is_fast_desoq_delivery, attributes_json, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          seller_id = excluded.seller_id,
          title_ar = excluded.title_ar,
          title_en = excluded.title_en,
          description_ar = excluded.description_ar,
          category = excluded.category,
          price_egp = excluded.price_egp,
          original_price_egp = excluded.original_price_egp,
          images_json = excluded.images_json,
          stock = excluded.stock,
          rating = excluded.rating,
          review_count = excluded.review_count,
          is_featured = excluded.is_featured,
          is_desoq_local_made = excluded.is_desoq_local_made,
          is_fast_desoq_delivery = excluded.is_fast_desoq_delivery,
          attributes_json = excluded.attributes_json,
          status = excluded.status
      `);

      const insertVariantStmt = tx.prepare(`
        INSERT INTO product_variants (
          id, product_id, name, sku, price_egp, stock, attributes_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          sku = excluded.sku,
          price_egp = excluded.price_egp,
          stock = excluded.stock,
          attributes_json = excluded.attributes_json
      `);

      const insertInvStmt = tx.prepare(`
        INSERT INTO inventory (
          id, product_id, variant_id, seller_id, stock, reserved, low_stock_threshold, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          seller_id = excluded.seller_id,
          stock = excluded.stock,
          updated_at = excluded.updated_at
      `);

      for (const prod of INITIAL_PRODUCTS) {
        insertProdStmt.run(
          prod.id,
          prod.sellerId,
          prod.titleAr,
          prod.titleEn || prod.titleAr,
          prod.descriptionAr,
          prod.category,
          prod.priceEGP,
          prod.originalPriceEGP || null,
          JSON.stringify(prod.images || []),
          prod.stock ?? 0,
          prod.rating ?? 5.0,
          prod.reviewCount ?? 0,
          prod.isFeatured ? 1 : 0,
          prod.isDesoqLocalMade ? 1 : 0,
          prod.isFastDesoqDelivery ? 1 : 0,
          JSON.stringify(prod.attributes || {}),
          prod.status || 'active',
          prod.createdAt || new Date().toISOString()
        );

        insertInvStmt.run(
          `inv-${prod.id}`,
          prod.id,
          null,
          prod.sellerId,
          prod.stock ?? 0,
          0,
          5,
          new Date().toISOString()
        );

        if (prod.variants && prod.variants.length > 0) {
          for (const v of prod.variants) {
            insertVariantStmt.run(
              v.id,
              prod.id,
              v.name,
              v.sku,
              v.priceEGP,
              v.stock,
              JSON.stringify(v.attributes || {})
            );

            insertInvStmt.run(
              `inv-${v.id}`,
              prod.id,
              v.id,
              prod.sellerId,
              v.stock,
              0,
              5,
              new Date().toISOString()
            );
          }
        }
      }

      // 4. Insert Orders
      const insertOrderStmt = tx.prepare(`
        INSERT OR REPLACE INTO orders (
          id, tracking_code, customer_id, customer_name, customer_phone,
          shipping_governorate, shipping_city, shipping_district, shipping_street,
          shipping_building, shipping_floor, shipping_apartment, shipping_landmarks,
          shipping_postal_code, payment_method, payment_status, fawry_reference_code,
          total_subtotal_egp, total_shipping_egp, discount_egp, total_amount_egp,
          order_status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const insertSubOrderStmt = tx.prepare(`
        INSERT OR REPLACE INTO sub_orders (
          id, order_id, seller_id, seller_name, subtotal_egp, shipping_fee_egp,
          commission_egp, seller_net_egp, status, shipping_provider, tracking_number,
          estimated_delivery, status_history_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const insertOrderItemStmt = tx.prepare(`
        INSERT OR REPLACE INTO order_items (
          id, order_id, sub_order_id, product_id, variant_id, product_title_ar,
          variant_name, quantity, unit_price_egp, total_price_egp, seller_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const ord of INITIAL_ORDERS) {
        insertOrderStmt.run(
          ord.id,
          ord.trackingCode,
          ord.customerId,
          ord.customerName,
          ord.customerPhone,
          ord.shippingAddress?.governorate || 'كفر الشيخ',
          ord.shippingAddress?.city || 'دسوق',
          ord.shippingAddress?.district || 'شارع الجيش',
          ord.shippingAddress?.streetDetails || 'شارع الجيش',
          ord.shippingAddress?.buildingNo || '14',
          ord.shippingAddress?.floorNo || '3',
          ord.shippingAddress?.apartmentNo || '6',
          null,
          null,
          ord.paymentMethod,
          ord.paymentStatus,
          null,
          ord.totalSubtotalEGP,
          ord.totalShippingEGP,
          ord.discountEGP || 0,
          ord.totalAmountEGP,
          ord.orderStatus,
          ord.createdAt,
          ord.createdAt
        );

        if (ord.subOrders && ord.subOrders.length > 0) {
          for (const sub of ord.subOrders) {
            insertSubOrderStmt.run(
              sub.id,
              ord.id,
              sub.sellerId,
              sub.sellerName,
              sub.subtotalEGP,
              sub.shippingFeeEGP,
              sub.commissionEGP,
              sub.sellerNetEGP,
              sub.status,
              sub.shippingProvider,
              sub.trackingNumber,
              sub.estimatedDelivery,
              JSON.stringify(sub.statusHistory || []),
              ord.createdAt
            );

            if (sub.items && sub.items.length > 0) {
              for (const it of sub.items) {
                const vId = it.selectedVariant?.id || null;
                const vName = it.selectedVariant?.name || null;
                const unitPrice = it.selectedVariant?.priceEGP ?? it.product.priceEGP;
                const totalPrice = unitPrice * it.quantity;
                insertOrderItemStmt.run(
                  `item-${ord.id}-${sub.id}-${it.product.id}-${vId || 'base'}`,
                  ord.id,
                  sub.id,
                  it.product.id,
                  vId,
                  it.product.titleAr,
                  vName,
                  it.quantity,
                  unitPrice,
                  totalPrice,
                  sub.sellerId
                );
              }
            }
          }
        }
      }

      // 5. Insert Disputes
      const insertDisputeStmt = tx.prepare(`
        INSERT OR REPLACE INTO disputes (
          id, order_id, sub_order_id, seller_id, seller_name, customer_name,
          reason, description, requested_resolution, status, resolution_text, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const insertMsgStmt = tx.prepare(`
        INSERT OR REPLACE INTO dispute_messages (
          id, dispute_id, sender, sender_name, message, created_at
        ) VALUES (?, ?, ?, ?, ?, ?)
      `);

      for (const d of INITIAL_DISPUTES) {
        insertDisputeStmt.run(
          d.id,
          d.orderId,
          d.subOrderId,
          d.sellerId,
          d.sellerName,
          d.customerName,
          d.reason,
          d.description,
          d.requestedResolution,
          d.status,
          d.resolution || null,
          d.createdAt,
          d.createdAt
        );

        if (d.messages && d.messages.length > 0) {
          let msgIdx = 1;
          for (const m of d.messages) {
            insertMsgStmt.run(
              `msg-${d.id}-${msgIdx++}`,
              d.id,
              m.sender,
              m.senderName,
              m.message,
              m.timestamp
            );
          }
        }
      }

      // 6. Update search index
      try {
        const normalizeAr = (text: string): string => {
          if (!text) return '';
          return text
            .toLowerCase()
            .replace(/[أإآ]/g, 'ا')
            .replace(/ة/g, 'ه')
            .replace(/ى/g, 'ي')
            .replace(/ؤ/g, 'و')
            .replace(/ئ/g, 'ي')
            .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'«»]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        };

        const insertSearchStmt = tx.prepare(`
          INSERT INTO catalog_search_index (
            product_id, title_ar, title_ar_norm, title_en, description_ar, description_ar_norm,
            category_id, category_name_ar, seller_id, seller_name, seller_city, seller_is_verified,
            is_desoq_local_made, is_fast_desoq_delivery, brand, price_egp, original_price_egp,
            stock, is_in_stock, rating, review_count, is_featured, status, tags_json,
            attributes_json, keywords_text, popularity_score, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const sellerMap = new Map(INITIAL_SELLERS.map(s => [s.id, s]));

        for (const p of INITIAL_PRODUCTS) {
          const seller = sellerMap.get(p.sellerId);
          const normTitle = normalizeAr(p.titleAr);
          const normDesc = normalizeAr(p.descriptionAr);
          const sellerName = seller?.name || 'تاجر أزياء وعطور';
          const sellerCity = seller?.city || 'دسوق';
          const sellerIsVerified = seller?.verificationStatus === 'verified' ? 1 : 0;
          const isDesoq = p.isDesoqLocalMade ? 1 : 0;
          const isFast = p.isFastDesoqDelivery ? 1 : 0;
          const isFeatured = p.isFeatured ? 1 : 0;
          const isInStock = (p.stock > 0) ? 1 : 0;
          const brand = p.attributes?.brand || sellerName;

          const tags: string[] = ['أزياء', 'عطور', 'إكسسوارات'];
          if (isDesoq) tags.push('صنع في مصر', 'دسوق');
          if (isFast) tags.push('توصيل سريع');

          const keywordsText = normalizeAr([
            normTitle,
            p.titleEn || '',
            normDesc,
            p.category || '',
            sellerName,
            sellerCity,
            ...tags
          ].join(' '));

          let popularity = (Number(p.rating || 5) * 10) + (Number(p.reviewCount || 0) * 2);
          if (isFeatured) popularity += 25;
          if (isDesoq) popularity += 20;
          if (isInStock) popularity += 10;

          const nowStr = new Date().toISOString();

          insertSearchStmt.run(
            p.id,
            p.titleAr,
            normTitle,
            p.titleEn || p.titleAr,
            p.descriptionAr,
            normDesc,
            p.category,
            p.category,
            p.sellerId,
            sellerName,
            sellerCity,
            sellerIsVerified,
            isDesoq,
            isFast,
            brand,
            p.priceEGP,
            p.originalPriceEGP || null,
            p.stock,
            isInStock,
            p.rating || 5.0,
            p.reviewCount || 0,
            isFeatured,
            p.status || 'active',
            JSON.stringify(tags),
            JSON.stringify(p.attributes || {}),
            keywordsText,
            popularity,
            p.createdAt || nowStr,
            nowStr
          );
        }
      } catch (err) {
        console.warn('Could not refresh catalog_search_index in Migration 010:', err);
      }

      // Record migration
      const nowStr = new Date().toISOString();
      tx.prepare('INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)').run(
        10,
        '010_fashion_perfumes_accessories_pivot',
        nowStr
      );
    });
    console.log('✅ [DB MIGRATION] Migration 010 (Fashion, Perfumes & Accessories Pivot) completed successfully!');
  }

  // Migration 11: Merchant Auth Credentials Alignment (abayas@souqdesoq.eg & royal@souqdesoq.eg)
  if (!appliedSet.has(11)) {
    console.log('🔄 [DB MIGRATION] Applying Migration 011: Merchant Auth Credentials Alignment...');
    runTransaction((tx) => {
      const usersToEnsure: any[] = [];

      const upsertUserStmt = tx.prepare(`
        INSERT INTO users (id, email, password_hash, full_name, phone, role, seller_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(email) DO UPDATE SET
          password_hash = excluded.password_hash,
          full_name = excluded.full_name,
          role = excluded.role,
          seller_id = excluded.seller_id
      `);

      for (const u of usersToEnsure) {
        upsertUserStmt.run(u.id, u.email, u.passwordHash, u.fullName, u.phone, u.role, u.sellerId, u.createdAt);
      }

      // Record migration
      const nowStr = new Date().toISOString();
      tx.prepare('INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)').run(
        11,
        '011_merchant_auth_credentials_alignment',
        nowStr
      );
    });
    console.log('✅ [DB MIGRATION] Migration 011 (Merchant Auth Credentials Alignment) completed successfully!');
  }

  // Migration 12: Expanded Dataset Seeding (28 Sellers & 160 Products)
  if (!appliedSet.has(12)) {
    console.log('🔄 [DB MIGRATION] Applying Migration 012: Expanded Dataset Seeding (28 Sellers & 160 Products)...');
    runTransaction((tx) => {
      // 1. Upsert Sellers
      const upsertSellerStmt = tx.prepare(`
        INSERT INTO sellers (
          id, name, trade_name, commercial_reg, tax_id, commission_rate, status,
          verification_status, desoq_district, phone, rating, total_sales_egp,
          available_balance_egp, pending_balance_egp, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          trade_name = excluded.trade_name,
          commercial_reg = excluded.commercial_reg,
          tax_id = excluded.tax_id,
          commission_rate = excluded.commission_rate,
          status = excluded.status,
          verification_status = excluded.verification_status,
          desoq_district = excluded.desoq_district,
          phone = excluded.phone,
          rating = excluded.rating,
          total_sales_egp = excluded.total_sales_egp,
          available_balance_egp = excluded.available_balance_egp,
          pending_balance_egp = excluded.pending_balance_egp
      `);

      for (const s of INITIAL_SELLERS) {
        upsertSellerStmt.run(
          s.id,
          s.name,
          s.arabicName || s.name,
          s.commercialRecordNumber || null,
          s.taxRegistrationNumber || null,
          s.commissionRate ?? 0.08,
          s.status || 'active',
          s.verificationStatus || 'verified',
          s.desoqDistrict || 'شارع الجيش',
          s.phone || '01012345678',
          s.rating ?? 5.0,
          s.totalSalesEGP ?? 0,
          s.availableBalanceEGP ?? 0,
          s.pendingBalanceEGP ?? 0,
          s.joinedDate || new Date().toISOString()
        );
      }

      // 2. Upsert Seller Users
      const upsertUserStmt = tx.prepare(`
        INSERT OR IGNORE INTO users (id, email, password_hash, full_name, phone, role, seller_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const s of INITIAL_SELLERS) {
        const num = s.id.replace('seller-', '');
        const email = `seller${num}@souqdesoq.eg`;
        upsertUserStmt.run(
          `user-${s.id}`,
          email,
          'a109e36947ad56de1dca1cc49f0ef8ac9ad9a7b1aa0df41fb3c4cb73c1ff01ea',
          `${s.ownerName} (${s.arabicName})`,
          s.phone,
          'seller',
          s.id,
          '2026-09-01T10:00:00Z'
        );
      }

      // 3. Upsert Products
      const upsertProductStmt = tx.prepare(`
        INSERT INTO products (
          id, seller_id, title_ar, title_en, description_ar, category, price_egp,
          original_price_egp, images_json, stock, rating, review_count, is_featured,
          is_desoq_local_made, is_fast_desoq_delivery, attributes_json, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          seller_id = excluded.seller_id,
          title_ar = excluded.title_ar,
          title_en = excluded.title_en,
          description_ar = excluded.description_ar,
          category = excluded.category,
          price_egp = excluded.price_egp,
          original_price_egp = excluded.original_price_egp,
          images_json = excluded.images_json,
          stock = excluded.stock,
          rating = excluded.rating,
          review_count = excluded.review_count,
          is_featured = excluded.is_featured,
          is_desoq_local_made = excluded.is_desoq_local_made,
          is_fast_desoq_delivery = excluded.is_fast_desoq_delivery,
          attributes_json = excluded.attributes_json,
          status = excluded.status
      `);

      for (const p of INITIAL_PRODUCTS) {
        upsertProductStmt.run(
          p.id,
          p.sellerId,
          p.titleAr,
          p.titleEn || p.titleAr,
          p.descriptionAr,
          p.category,
          p.priceEGP,
          p.originalPriceEGP || null,
          JSON.stringify(p.images),
          p.stock,
          p.rating,
          p.reviewCount,
          p.isFeatured ? 1 : 0,
          p.isDesoqLocalMade ? 1 : 0,
          p.isFastDesoqDelivery ? 1 : 0,
          JSON.stringify(p.attributes || {}),
          p.status || 'active',
          p.createdAt || new Date().toISOString()
        );
      }

      // Record migration
      const nowStr = new Date().toISOString();
      tx.prepare('INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)').run(
        12,
        '012_expanded_dataset_seeding_28_sellers_160_products',
        nowStr
      );
    });
    console.log('✅ [DB MIGRATION] Migration 012 (28 Sellers & 160 Products) applied successfully!');
  }

  // Migration 13: Ensure Default Courier Account
  if (!appliedSet.has(13)) {
    console.log('🔄 [DB MIGRATION] Applying Migration 013: Ensure Default Courier User...');
    runTransaction((tx) => {
      tx.prepare(`
        INSERT OR REPLACE INTO users (id, email, password_hash, full_name, phone, role, seller_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'user-courier-1',
        'courier@souqdesoq.eg',
        'a109e36947ad56de1dca1cc49f0ef8ac9ad9a7b1aa0df41fb3c4cb73c1ff01ea',
        'الكابتن إبراهيم عاشور (مندوب دسوق Express)',
        '01055443322',
        'courier',
        null,
        '2026-09-01T10:00:00Z'
      );

      const nowStr = new Date().toISOString();
      tx.prepare('INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)').run(
        13,
        '013_ensure_default_courier_account',
        nowStr
      );
    });
    console.log('✅ [DB MIGRATION] Migration 013 applied successfully!');
  }

  // Migration 14: High-Scale Inventory Reservations & Flash-Sale TTL Lock Engine
  if (!appliedSet.has(14)) {
    console.log('🔄 [DB MIGRATION] Applying Migration 014: Inventory Reservations & Flash-Sale TTL Lock Engine...');
    runTransaction((tx) => {
      tx.exec(`
        CREATE TABLE IF NOT EXISTS inventory_reservations (
          id TEXT PRIMARY KEY,
          product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
          variant_id TEXT REFERENCES product_variants(id) ON DELETE CASCADE,
          size TEXT,
          session_id TEXT NOT NULL,
          user_id TEXT,
          quantity INTEGER NOT NULL CHECK(quantity > 0),
          status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'converted', 'expired', 'released')),
          created_at TEXT NOT NULL,
          expires_at TEXT NOT NULL,
          order_id TEXT REFERENCES orders(id)
        );
        CREATE INDEX IF NOT EXISTS idx_inv_res_prod_var_status ON inventory_reservations(product_id, variant_id, status, expires_at);
        CREATE INDEX IF NOT EXISTS idx_inv_res_session_status ON inventory_reservations(session_id, status);
        CREATE INDEX IF NOT EXISTS idx_inv_res_status_expires ON inventory_reservations(status, expires_at);
      `);

      const nowStr = new Date().toISOString();
      tx.prepare('INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)').run(
        14,
        '014_inventory_reservations_ttl_lock',
        nowStr
      );
    });
    console.log('✅ [DB MIGRATION] Migration 014 applied successfully!');
  }

  // Migration 15: Fix Products Status CHECK Constraint to Support All Listing Statuses
  if (!appliedSet.has(15)) {
    console.log('🔄 [DB MIGRATION] Applying Migration 015: Expanding Products Status Check Constraint...');
    const rawDb = getDatabase();
    rawDb.exec('PRAGMA foreign_keys = OFF;');
    try {
      rawDb.exec(`
        CREATE TABLE IF NOT EXISTS products_new (
          id TEXT PRIMARY KEY,
          seller_id TEXT NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
          title_ar TEXT NOT NULL,
          title_en TEXT NOT NULL,
          description_ar TEXT NOT NULL,
          category TEXT NOT NULL,
          price_egp REAL NOT NULL CHECK(price_egp >= 0),
          original_price_egp REAL,
          images_json TEXT NOT NULL DEFAULT '[]',
          stock INTEGER NOT NULL DEFAULT 0 CHECK(stock >= 0),
          rating REAL NOT NULL DEFAULT 5.0,
          review_count INTEGER NOT NULL DEFAULT 0,
          is_featured INTEGER NOT NULL DEFAULT 0,
          is_desoq_local_made INTEGER NOT NULL DEFAULT 0,
          is_fast_desoq_delivery INTEGER NOT NULL DEFAULT 0,
          attributes_json TEXT NOT NULL DEFAULT '{}',
          status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'suspended', 'out_of_stock', 'draft', 'incomplete', 'pending_moderation', 'suppressed', 'inactive', 'archived')),
          created_at TEXT NOT NULL
        );

        INSERT INTO products_new (
          id, seller_id, title_ar, title_en, description_ar, category, price_egp,
          original_price_egp, images_json, stock, rating, review_count, is_featured,
          is_desoq_local_made, is_fast_desoq_delivery, attributes_json, status, created_at
        ) SELECT 
          id, seller_id, title_ar, title_en, description_ar, category, price_egp,
          original_price_egp, images_json, stock, rating, review_count, is_featured,
          is_desoq_local_made, is_fast_desoq_delivery, attributes_json, status, created_at
        FROM products;

        DROP TABLE products;

        ALTER TABLE products_new RENAME TO products;

        CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
        CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
        CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
      `);

      const nowStr = new Date().toISOString();
      rawDb.prepare('INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)').run(
        15,
        '015_expand_products_status_check',
        nowStr
      );
    } finally {
      rawDb.exec('PRAGMA foreign_keys = ON;');
    }
    console.log('✅ [DB MIGRATION] Migration 015 applied successfully!');
  }

  // Migration 16: State & Database Consistency, Idempotency and Courier Settlements Persistence
  if (!appliedSet.has(16)) {
    console.log('🔄 [DB MIGRATION] Applying Migration 016: Idempotency Keys and Courier Settlements Persistence...');
    const rawDb = getDatabase();
    rawDb.exec('PRAGMA foreign_keys = OFF;');
    try {
      // 1. Add idempotency_key to refunds if not already present
      const refundCols = rawDb.prepare("PRAGMA table_info(refunds)").all() as { name: string }[];
      if (!refundCols.some(c => c.name === 'idempotency_key')) {
        rawDb.exec(`ALTER TABLE refunds ADD COLUMN idempotency_key TEXT;`);
      }
      rawDb.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_refunds_idempotency_key ON refunds(idempotency_key);`);

      // 2. Add idempotency_key to inventory_reservations if not already present
      const invCols = rawDb.prepare("PRAGMA table_info(inventory_reservations)").all() as { name: string }[];
      if (!invCols.some(c => c.name === 'idempotency_key')) {
        rawDb.exec(`ALTER TABLE inventory_reservations ADD COLUMN idempotency_key TEXT;`);
      }
      rawDb.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_inv_res_idempotency_key ON inventory_reservations(idempotency_key);`);

      // 3. Ensure payments table has unique index on idempotency_key
      rawDb.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_idempotency_key ON payments(idempotency_key);`);

      // 4. Create courier_settlements table
      rawDb.exec(`
        CREATE TABLE IF NOT EXISTS courier_settlements (
          id TEXT PRIMARY KEY,
          courier_id TEXT NOT NULL REFERENCES users(id),
          courier_name TEXT NOT NULL,
          date TEXT NOT NULL,
          orders_delivered_count INTEGER NOT NULL DEFAULT 0,
          orders_failed_count INTEGER NOT NULL DEFAULT 0,
          orders_pending_count INTEGER NOT NULL DEFAULT 0,
          total_cod_collected_egp REAL NOT NULL DEFAULT 0,
          courier_commissions_egp REAL NOT NULL DEFAULT 0,
          net_remittance_due_egp REAL NOT NULL DEFAULT 0,
          payment_method TEXT NOT NULL,
          transaction_ref TEXT,
          notes TEXT,
          status TEXT NOT NULL DEFAULT 'confirmed',
          created_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_courier_settlements_courier_id ON courier_settlements(courier_id);
        CREATE INDEX IF NOT EXISTS idx_courier_settlements_date ON courier_settlements(date);
      `);

      // Seed initial settlement if empty
      const existingSettlementsCount = rawDb.prepare('SELECT COUNT(*) as count FROM courier_settlements').get() as { count: number };
      if (existingSettlementsCount.count === 0) {
        rawDb.prepare(`
          INSERT INTO courier_settlements (
            id, courier_id, courier_name, date, orders_delivered_count, orders_failed_count,
            orders_pending_count, total_cod_collected_egp, courier_commissions_egp,
            net_remittance_due_egp, payment_method, transaction_ref, notes, status, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          'SETTLE-98124',
          'user-courier-1',
          'الكابتن إبراهيم عاشور (مندوب دسوق Express)',
          '2026-03-11',
          12,
          1,
          2,
          4850,
          360,
          4490,
          'instapay',
          'IPN-20260311-9421',
          'تم توريد عهدة الوردية المسائية لخزينة منصة سوق دسوق بنجاح',
          'confirmed',
          '2026-03-11T20:30:00.000Z'
        );
      }

      const nowStr = new Date().toISOString();
      rawDb.prepare('INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)').run(
        16,
        '016_idempotency_and_courier_settlements',
        nowStr
      );
    } finally {
      rawDb.exec('PRAGMA foreign_keys = ON;');
    }
    console.log('✅ [DB MIGRATION] Migration 016 applied successfully!');
  }

  // Migration 17: Email Verification and Anti-Abuse Hardening
  if (!appliedSet.has(17)) {
    console.log('🔄 [DB MIGRATION] Applying Migration 017: Email Verification & Anti-Abuse Hardening...');
    const rawDb = getDatabase();
    rawDb.exec('PRAGMA foreign_keys = OFF;');
    try {
      const tableInfo = rawDb.prepare("PRAGMA table_info('users')").all() as any[];
      const colNames = new Set(tableInfo.map(c => c.name));

      if (!colNames.has('email_verified')) {
        rawDb.exec("ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0;");
      }
      if (!colNames.has('verification_code')) {
        rawDb.exec("ALTER TABLE users ADD COLUMN verification_code TEXT;");
      }
      if (!colNames.has('verification_expires_at')) {
        rawDb.exec("ALTER TABLE users ADD COLUMN verification_expires_at TEXT;");
      }
      if (!colNames.has('verification_attempts')) {
        rawDb.exec("ALTER TABLE users ADD COLUMN verification_attempts INTEGER NOT NULL DEFAULT 0;");
      }
      if (!colNames.has('last_code_sent_at')) {
        rawDb.exec("ALTER TABLE users ADD COLUMN last_code_sent_at TEXT;");
      }

      // Mark all pre-existing baseline accounts as verified
      rawDb.exec("UPDATE users SET email_verified = 1 WHERE email_verified IS NULL OR email_verified = 0;");

      const nowStr = new Date().toISOString();
      rawDb.prepare('INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)').run(
        17,
        '017_email_verification_and_anti_abuse',
        nowStr
      );
    } finally {
      rawDb.exec('PRAGMA foreign_keys = ON;');
    }
    console.log('✅ [DB MIGRATION] Migration 017 applied successfully!');
  }

  // Ensure all baseline data (users, sellers, products, inventory, orders, disputes, ledger) exists
  ensureBaselineData(db);
}

export function ensureBaselineData(db: any): void {
  ensureBaselineUsers(db);
  ensureBaselineSellers(db);
  ensureBaselineProducts(db);
  ensureBaselineOrdersAndDisputes(db);
  ensureBaselineLedger(db);
}

export function ensureBaselineUsers(db: any): void {
  const insertUserStmt = db.prepare(`
    INSERT INTO users (id, email, password_hash, full_name, phone, role, seller_id, created_at, email_verified)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);

  for (const u of DEFAULT_USERS) {
    const existing = db.prepare('SELECT id, role, password_hash FROM users WHERE lower(email) = ?').get(u.email.toLowerCase()) as any;
    if (!existing) {
      insertUserStmt.run(
        u.id, 
        u.email.toLowerCase(), 
        u.passwordHash, 
        u.fullName, 
        u.phone, 
        u.role, 
        (u as any).sellerId || null, 
        u.createdAt || new Date().toISOString()
      );
      console.log(`👤 [DB] Restored baseline user: ${u.email} (${u.role})`);
    } else {
      if (u.email.toLowerCase() === 'justokayp@gmail.com') {
        db.prepare('UPDATE users SET role = ?, password_hash = ? WHERE lower(email) = ?')
          .run('admin', u.passwordHash, u.email.toLowerCase());
      } else if (!existing.password_hash) {
        db.prepare('UPDATE users SET password_hash = ? WHERE lower(email) = ?')
          .run(u.passwordHash, u.email.toLowerCase());
      }
    }
  }
}

export function ensureBaselineSellers(db: any): void {
  const insertSellerStmt = db.prepare(`
    INSERT INTO sellers (
      id, name, trade_name, commercial_reg, tax_id, commission_rate, status,
      verification_status, desoq_district, phone, rating, total_sales_egp,
      available_balance_egp, pending_balance_egp, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      trade_name = excluded.trade_name,
      status = excluded.status,
      verification_status = excluded.verification_status,
      phone = excluded.phone,
      rating = excluded.rating
  `);

  for (const sel of INITIAL_SELLERS) {
    insertSellerStmt.run(
      sel.id,
      sel.name,
      sel.tradeName || sel.arabicName || sel.name,
      sel.commercialRecordNumber || null,
      sel.taxRegistrationNumber || null,
      sel.commissionRate ?? 0.08,
      sel.status || 'active',
      sel.verificationStatus || 'verified',
      sel.desoqDistrict || sel.address || 'شارع الجيش',
      sel.phone || '01012345678',
      sel.rating ?? 5.0,
      sel.totalSalesEGP ?? 0,
      sel.availableBalanceEGP ?? 0,
      sel.pendingBalanceEGP ?? 0,
      sel.joinedDate || new Date().toISOString()
    );
  }
}

export function ensureBaselineProducts(db: any): void {
  const insertProdStmt = db.prepare(`
    INSERT INTO products (
      id, seller_id, title_ar, title_en, description_ar, category, price_egp,
      original_price_egp, images_json, stock, rating, review_count, is_featured,
      is_desoq_local_made, is_fast_desoq_delivery, attributes_json, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title_ar = excluded.title_ar,
      title_en = excluded.title_en,
      description_ar = excluded.description_ar,
      category = excluded.category,
      price_egp = excluded.price_egp,
      original_price_egp = excluded.original_price_egp,
      stock = excluded.stock,
      status = excluded.status,
      is_desoq_local_made = excluded.is_desoq_local_made,
      attributes_json = excluded.attributes_json
  `);

  const insertVariantStmt = db.prepare(`
    INSERT INTO product_variants (
      id, product_id, name, sku, price_egp, stock, attributes_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      price_egp = excluded.price_egp,
      stock = excluded.stock
  `);

  const insertInvStmt = db.prepare(`
    INSERT INTO inventory (
      id, product_id, variant_id, seller_id, stock, reserved, low_stock_threshold, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      stock = excluded.stock,
      seller_id = excluded.seller_id,
      updated_at = excluded.updated_at
  `);

  for (const prod of INITIAL_PRODUCTS) {
    insertProdStmt.run(
      prod.id,
      prod.sellerId,
      prod.titleAr,
      prod.titleEn || prod.titleAr,
      prod.descriptionAr,
      prod.category,
      prod.priceEGP,
      prod.originalPriceEGP || null,
      JSON.stringify(prod.images || []),
      prod.stock,
      prod.rating ?? 5.0,
      prod.reviewCount ?? 0,
      prod.isFeatured ? 1 : 0,
      prod.isDesoqLocalMade ? 1 : 0,
      prod.isFastDesoqDelivery ? 1 : 0,
      JSON.stringify(prod.attributes || {}),
      prod.status || 'active',
      prod.createdAt || new Date().toISOString()
    );

    // Insert root inventory
    insertInvStmt.run(
      `inv-${prod.id}-root`,
      prod.id,
      null,
      prod.sellerId,
      prod.stock,
      0,
      5,
      new Date().toISOString()
    );

    // Variants
    if (prod.variants && prod.variants.length > 0) {
      for (const v of prod.variants) {
        insertVariantStmt.run(
          v.id,
          prod.id,
          v.name,
          v.sku,
          v.priceEGP,
          v.stock,
          JSON.stringify(v.attributes || {})
        );

        insertInvStmt.run(
          `inv-${prod.id}-${v.id}`,
          prod.id,
          v.id,
          prod.sellerId,
          v.stock,
          0,
          3,
          new Date().toISOString()
        );
      }
    }
  }

  // Populate catalog search index if table exists
  try {
    const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='catalog_search_index'").get();
    if (tableExists) {
      const insertSearchStmt = db.prepare(`
        INSERT INTO catalog_search_index (product_id, title_tokens, category_tokens, attributes_tokens, full_text, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(product_id) DO UPDATE SET
          title_tokens = excluded.title_tokens,
          category_tokens = excluded.category_tokens,
          attributes_tokens = excluded.attributes_tokens,
          full_text = excluded.full_text,
          updated_at = excluded.updated_at
      `);
      for (const prod of INITIAL_PRODUCTS) {
        const fullText = `${prod.titleAr} ${prod.titleEn || ''} ${prod.descriptionAr} ${prod.category} ${JSON.stringify(prod.attributes || {})}`;
        insertSearchStmt.run(
          prod.id,
          `${prod.titleAr} ${prod.titleEn || ''}`,
          prod.category,
          JSON.stringify(prod.attributes || {}),
          fullText,
          new Date().toISOString()
        );
      }
    }
  } catch (err) {
    // Non-fatal if search index isn't ready
  }
}

export function ensureBaselineOrdersAndDisputes(db: any): void {
  const orderCount = db.prepare('SELECT count(*) as count FROM orders').get() as any;
  if (!orderCount || orderCount.count === 0) {
    const insertOrderStmt = db.prepare(`
      INSERT INTO orders (
        id, tracking_code, customer_id, customer_name, customer_phone,
        shipping_governorate, shipping_city, shipping_district, shipping_street,
        shipping_building, shipping_floor, shipping_apartment,
        payment_method, payment_status, total_subtotal_egp, total_shipping_egp,
        discount_egp, total_amount_egp, order_status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertSubStmt = db.prepare(`
      INSERT INTO sub_orders (
        id, order_id, seller_id, seller_name, subtotal_egp, shipping_fee_egp,
        commission_egp, seller_net_egp, status, shipping_provider, tracking_number,
        estimated_delivery, status_history_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertItemStmt = db.prepare(`
      INSERT INTO order_items (
        id, order_id, sub_order_id, product_id, variant_id, product_title_ar,
        variant_name, quantity, unit_price_egp, total_price_egp, seller_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const ord of INITIAL_ORDERS) {
      insertOrderStmt.run(
        ord.id,
        ord.trackingCode,
        ord.customerId || 'cust-demo',
        ord.customerName,
        ord.customerPhone,
        ord.shippingAddress.governorate,
        ord.shippingAddress.city,
        ord.shippingAddress.district,
        ord.shippingAddress.streetDetails,
        ord.shippingAddress.buildingNo || null,
        ord.shippingAddress.floorNo || null,
        ord.shippingAddress.apartmentNo || null,
        ord.paymentMethod,
        ord.paymentStatus,
        ord.totalSubtotalEGP,
        ord.totalShippingEGP,
        ord.discountEGP || 0,
        ord.totalAmountEGP,
        ord.orderStatus,
        ord.createdAt,
        ord.createdAt
      );

      for (const sub of ord.subOrders) {
        insertSubStmt.run(
          sub.id,
          ord.id,
          sub.sellerId,
          sub.sellerName,
          sub.subtotalEGP,
          sub.shippingFeeEGP,
          sub.commissionEGP,
          sub.sellerNetEGP,
          sub.status,
          sub.shippingProvider || 'DesoqExpress',
          sub.trackingNumber || `DSQ-TRK-${Math.floor(100000 + Math.random() * 900000)}`,
          sub.estimatedDelivery || 'خلال 24 ساعة',
          JSON.stringify(sub.statusHistory || []),
          ord.createdAt
        );

        for (const item of sub.items) {
          insertItemStmt.run(
            `item-${Math.random().toString(36).substring(2, 9)}`,
            ord.id,
            sub.id,
            item.product.id,
            (item as any).variantId || null,
            item.product.titleAr,
            item.product.variants?.[0]?.name || null,
            item.quantity,
            item.product.priceEGP,
            item.product.priceEGP * item.quantity,
            sub.sellerId
          );
        }
      }
    }
  }

  const disputeCount = db.prepare('SELECT count(*) as count FROM disputes').get() as any;
  if (!disputeCount || disputeCount.count === 0) {
    const insertDispStmt = db.prepare(`
      INSERT INTO disputes (
        id, order_id, sub_order_id, seller_id, seller_name, customer_name,
        reason, description, requested_resolution, status, resolution_text, created_at, updated_at,
        priority, internal_notes_json, attachments_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'normal', '[]', '[]')
    `);

    const insertMsgStmt = db.prepare(`
      INSERT INTO dispute_messages (id, dispute_id, sender, sender_name, message, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const d of INITIAL_DISPUTES) {
      insertDispStmt.run(
        d.id,
        d.orderId,
        d.subOrderId,
        d.sellerId,
        d.sellerName,
        d.customerName,
        d.reason,
        d.description,
        d.requestedResolution,
        d.status,
        d.resolution || null,
        d.createdAt,
        d.createdAt
      );

      for (const msg of d.messages) {
        insertMsgStmt.run(
          `msg-${Math.random().toString(36).substring(2, 9)}`,
          d.id,
          msg.sender,
          msg.senderName,
          msg.message,
          msg.timestamp
        );
      }
    }
  }
}

export function ensureBaselineLedger(db: any): void {
  const ledgerCount = db.prepare('SELECT count(*) as count FROM seller_ledger').get() as any;
  if (!ledgerCount || ledgerCount.count === 0) {
    const insertLedgerStmt = db.prepare(`
      INSERT INTO seller_ledger (
        id, seller_id, order_id, sub_order_id, type, amount_egp, description, balance_after_egp, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertLedgerStmt.run(
      'ldg-init-1',
      'seller-1',
      'SD-558433',
      'SD-558433-SUB-1',
      'payout_credit',
      782,
      'إيداع مستحقات تسليم طلب أقمشة قطن مصري فاخر',
      18450,
      '2026-09-11T12:35:00Z'
    );
  }
}


