-- Souq Desoq Normalized Relational Schema
-- Version 1: Core Marketplace Entities

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('customer', 'seller', 'support', 'admin', 'courier')),
  seller_id TEXT,
  email_verified INTEGER NOT NULL DEFAULT 0,
  verification_code TEXT,
  verification_expires_at TEXT,
  verification_attempts INTEGER NOT NULL DEFAULT 0,
  last_code_sent_at TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. Sessions
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  seller_id TEXT,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- 3. Sellers
CREATE TABLE IF NOT EXISTS sellers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  trade_name TEXT NOT NULL,
  commercial_reg TEXT,
  tax_id TEXT,
  commission_rate REAL NOT NULL DEFAULT 0.08,
  status TEXT NOT NULL CHECK(status IN ('active', 'suspended', 'under_review')),
  verification_status TEXT NOT NULL CHECK(verification_status IN ('verified', 'pending', 'rejected')),
  desoq_district TEXT NOT NULL,
  phone TEXT NOT NULL,
  rating REAL NOT NULL DEFAULT 5.0,
  total_sales_egp REAL NOT NULL DEFAULT 0,
  available_balance_egp REAL NOT NULL DEFAULT 0,
  pending_balance_egp REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sellers_status ON sellers(status);

-- 4. Products
CREATE TABLE IF NOT EXISTS products (
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
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- 5. Product Variants
CREATE TABLE IF NOT EXISTS product_variants (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  price_egp REAL NOT NULL CHECK(price_egp >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK(stock >= 0),
  attributes_json TEXT NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);

-- 6. Inventory (Authoritative stock per product / variant)
CREATE TABLE IF NOT EXISTS inventory (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id TEXT REFERENCES product_variants(id) ON DELETE CASCADE,
  seller_id TEXT NOT NULL REFERENCES sellers(id),
  stock INTEGER NOT NULL DEFAULT 0 CHECK(stock >= 0),
  reserved INTEGER NOT NULL DEFAULT 0 CHECK(reserved >= 0),
  low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  updated_at TEXT NOT NULL,
  UNIQUE(product_id, variant_id)
);
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_seller_id ON inventory(seller_id);

-- 6b. Inventory Reservations (High-Scale Flash-Sale TTL Locks)
CREATE TABLE IF NOT EXISTS inventory_reservations (
  id TEXT PRIMARY KEY,
  idempotency_key TEXT UNIQUE,
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
CREATE UNIQUE INDEX IF NOT EXISTS idx_inv_res_idempotency_key ON inventory_reservations(idempotency_key);

-- 7. Cart Items
CREATE TABLE IF NOT EXISTS cart_items (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id TEXT REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK(quantity > 0),
  seller_id TEXT NOT NULL REFERENCES sellers(id),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(user_id, product_id, variant_id)
);
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart_items(user_id);

-- 8. Orders
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  tracking_code TEXT NOT NULL UNIQUE,
  idempotency_key TEXT UNIQUE,
  customer_id TEXT,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shipping_governorate TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_district TEXT NOT NULL,
  shipping_street TEXT NOT NULL,
  shipping_building TEXT,
  shipping_floor TEXT,
  shipping_apartment TEXT,
  shipping_landmarks TEXT,
  shipping_postal_code TEXT,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL,
  fawry_reference_code TEXT,
  total_subtotal_egp REAL NOT NULL CHECK(total_subtotal_egp >= 0),
  total_shipping_egp REAL NOT NULL CHECK(total_shipping_egp >= 0),
  discount_egp REAL NOT NULL DEFAULT 0,
  total_amount_egp REAL NOT NULL CHECK(total_amount_egp >= 0),
  order_status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_tracking_code ON orders(tracking_code);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON orders(order_status);

-- 9. Sub-Orders (Seller Partitioned Orders)
CREATE TABLE IF NOT EXISTS sub_orders (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  seller_id TEXT NOT NULL REFERENCES sellers(id),
  seller_name TEXT NOT NULL,
  subtotal_egp REAL NOT NULL CHECK(subtotal_egp >= 0),
  shipping_fee_egp REAL NOT NULL CHECK(shipping_fee_egp >= 0),
  commission_egp REAL NOT NULL CHECK(commission_egp >= 0),
  seller_net_egp REAL NOT NULL CHECK(seller_net_egp >= 0),
  status TEXT NOT NULL,
  shipping_provider TEXT NOT NULL,
  tracking_number TEXT NOT NULL UNIQUE,
  estimated_delivery TEXT NOT NULL,
  status_history_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sub_orders_order_id ON sub_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_sub_orders_seller_id ON sub_orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_sub_orders_status ON sub_orders(status);

-- 10. Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  sub_order_id TEXT NOT NULL REFERENCES sub_orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id),
  variant_id TEXT REFERENCES product_variants(id),
  product_title_ar TEXT NOT NULL,
  variant_name TEXT,
  quantity INTEGER NOT NULL CHECK(quantity > 0),
  unit_price_egp REAL NOT NULL CHECK(unit_price_egp >= 0),
  total_price_egp REAL NOT NULL CHECK(total_price_egp >= 0),
  seller_id TEXT NOT NULL REFERENCES sellers(id)
);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_sub_order_id ON order_items(sub_order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- 11. Payments
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  idempotency_key TEXT UNIQUE,
  amount_egp REAL NOT NULL CHECK(amount_egp >= 0),
  currency TEXT NOT NULL DEFAULT 'EGP',
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL,
  transaction_ref TEXT,
  gateway_payload_json TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);

-- 12. Shipments
CREATE TABLE IF NOT EXISTS shipments (
  id TEXT PRIMARY KEY,
  sub_order_id TEXT NOT NULL REFERENCES sub_orders(id) ON DELETE CASCADE,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  seller_id TEXT NOT NULL REFERENCES sellers(id),
  provider TEXT NOT NULL,
  tracking_number TEXT NOT NULL UNIQUE,
  origin_address TEXT NOT NULL,
  destination_address TEXT NOT NULL,
  status TEXT NOT NULL,
  dispatched_at TEXT,
  delivered_at TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_shipments_sub_order_id ON shipments(sub_order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_tracking ON shipments(tracking_number);

-- 13. Commissions
CREATE TABLE IF NOT EXISTS commissions (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  sub_order_id TEXT NOT NULL REFERENCES sub_orders(id) ON DELETE CASCADE,
  seller_id TEXT NOT NULL REFERENCES sellers(id),
  subtotal_egp REAL NOT NULL,
  commission_rate REAL NOT NULL,
  commission_amount_egp REAL NOT NULL CHECK(commission_amount_egp >= 0),
  seller_net_amount_egp REAL NOT NULL CHECK(seller_net_amount_egp >= 0),
  status TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_commissions_order ON commissions(order_id);
CREATE INDEX IF NOT EXISTS idx_commissions_seller ON commissions(seller_id);

-- 14. Seller Ledger
CREATE TABLE IF NOT EXISTS seller_ledger (
  id TEXT PRIMARY KEY,
  seller_id TEXT NOT NULL REFERENCES sellers(id),
  order_id TEXT REFERENCES orders(id) ON DELETE SET NULL,
  sub_order_id TEXT REFERENCES sub_orders(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  amount_egp REAL NOT NULL,
  description TEXT NOT NULL,
  balance_after_egp REAL NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_seller_ledger_seller_id ON seller_ledger(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_ledger_created_at ON seller_ledger(created_at);

-- 15. Disputes & Messages
CREATE TABLE IF NOT EXISTS disputes (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  sub_order_id TEXT NOT NULL REFERENCES sub_orders(id) ON DELETE CASCADE,
  seller_id TEXT NOT NULL REFERENCES sellers(id),
  seller_name TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  reason TEXT NOT NULL,
  description TEXT NOT NULL,
  requested_resolution TEXT NOT NULL,
  status TEXT NOT NULL,
  resolution_text TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_disputes_order_id ON disputes(order_id);
CREATE INDEX IF NOT EXISTS idx_disputes_seller_id ON disputes(seller_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);

CREATE TABLE IF NOT EXISTS dispute_messages (
  id TEXT PRIMARY KEY,
  dispute_id TEXT NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
  sender TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_dispute_messages_dispute_id ON dispute_messages(dispute_id);

-- 16. Refunds
CREATE TABLE IF NOT EXISTS refunds (
  id TEXT PRIMARY KEY,
  idempotency_key TEXT UNIQUE,
  dispute_id TEXT REFERENCES disputes(id) ON DELETE SET NULL,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  sub_order_id TEXT NOT NULL REFERENCES sub_orders(id) ON DELETE CASCADE,
  seller_id TEXT NOT NULL REFERENCES sellers(id),
  amount_egp REAL NOT NULL CHECK(amount_egp >= 0),
  reason TEXT NOT NULL,
  status TEXT NOT NULL,
  processed_by TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_refunds_order_id ON refunds(order_id);
CREATE INDEX IF NOT EXISTS idx_refunds_seller_id ON refunds(seller_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_refunds_idempotency_key ON refunds(idempotency_key);

-- 17. Schema Migrations Table
CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  applied_at TEXT NOT NULL
);

-- 18. Stored Media & Files
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

-- 19. KYC Merchant Documents Vault
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

-- 20. Courier Shift Settlements (Server Database Source of Truth)
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

