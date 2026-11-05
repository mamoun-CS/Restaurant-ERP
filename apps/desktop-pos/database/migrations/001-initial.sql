PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY, cloud_id TEXT UNIQUE, name_en TEXT NOT NULL, name_ar TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0, active INTEGER NOT NULL DEFAULT 1,
  server_version INTEGER, updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY, cloud_id TEXT UNIQUE, sku TEXT NOT NULL, barcode TEXT UNIQUE,
  name_en TEXT NOT NULL, name_ar TEXT NOT NULL, category_id TEXT REFERENCES categories(id),
  price_minor INTEGER NOT NULL CHECK(price_minor >= 0), currency_code TEXT NOT NULL DEFAULT 'ILS',
  sizes_json TEXT NOT NULL DEFAULT '[]', addons_json TEXT NOT NULL DEFAULT '[]',
  active INTEGER NOT NULL DEFAULT 1, server_version INTEGER, updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS products_search_idx ON products(active, sku, barcode, name_en);
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY, cloud_id TEXT UNIQUE, name TEXT NOT NULL, phone TEXT,
  email TEXT, sync_version INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS cashiers (
  id TEXT PRIMARY KEY, cloud_id TEXT UNIQUE, username TEXT NOT NULL UNIQUE, display_name TEXT NOT NULL,
  credential_hash TEXT NOT NULL, credential_salt TEXT NOT NULL, verifier_kind TEXT NOT NULL,
  policy_version INTEGER NOT NULL, offline_expires_at TEXT NOT NULL,
  can_discount INTEGER NOT NULL DEFAULT 0, max_discount_percent REAL NOT NULL DEFAULT 0,
  max_discount_minor INTEGER NOT NULL DEFAULT 0, supervisor INTEGER NOT NULL DEFAULT 0,
  policy_token TEXT NOT NULL,
  failed_attempts INTEGER NOT NULL DEFAULT 0, locked_until TEXT, active INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY, idempotency_key TEXT NOT NULL UNIQUE, device_id TEXT NOT NULL,
  cloud_id TEXT UNIQUE, cashier_id TEXT NOT NULL, shift_id TEXT, customer_id TEXT,
  status TEXT NOT NULL CHECK(status IN ('COMPLETED','VOIDED')),
  currency_code TEXT NOT NULL, subtotal_minor INTEGER NOT NULL CHECK(subtotal_minor >= 0),
  discount_minor INTEGER NOT NULL CHECK(discount_minor >= 0), tax_minor INTEGER NOT NULL CHECK(tax_minor >= 0),
  total_minor INTEGER NOT NULL CHECK(total_minor >= 0), created_at TEXT NOT NULL,
  sync_status TEXT NOT NULL DEFAULT 'pending' CHECK(sync_status IN ('pending','processing','synced','failed')),
  server_number TEXT, synced_at TEXT
);
CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  product_id TEXT, product_cloud_id TEXT, product_name_snapshot TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK(quantity > 0), unit_price_minor INTEGER NOT NULL CHECK(unit_price_minor >= 0),
  line_total_minor INTEGER NOT NULL CHECK(line_total_minor >= 0), options_json TEXT NOT NULL DEFAULT '[]'
);
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  method TEXT NOT NULL CHECK(method IN ('CASH','CREDIT_CARD','BANK')),
  amount_minor INTEGER NOT NULL CHECK(amount_minor > 0), currency_code TEXT NOT NULL,
  processor_reference TEXT, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS inventory_movements (
  id TEXT PRIMARY KEY, order_id TEXT REFERENCES orders(id) ON DELETE RESTRICT,
  product_id TEXT NOT NULL, quantity_delta INTEGER NOT NULL, source TEXT NOT NULL,
  created_at TEXT NOT NULL, sync_status TEXT NOT NULL DEFAULT 'pending'
);
CREATE TABLE IF NOT EXISTS discount_events (
  id TEXT PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  cashier_id TEXT NOT NULL, supervisor_id TEXT, amount_minor INTEGER NOT NULL,
  reason TEXT NOT NULL, policy_version INTEGER NOT NULL, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS cash_register_sessions (
  id TEXT PRIMARY KEY, register_cloud_id TEXT, cashier_id TEXT NOT NULL,
  opened_at TEXT NOT NULL, closed_at TEXT, opening_minor INTEGER NOT NULL,
  closing_minor INTEGER, status TEXT NOT NULL CHECK(status IN ('OPEN','CLOSED'))
);
CREATE TABLE IF NOT EXISTS discount_coupons (
  code TEXT PRIMARY KEY, type TEXT NOT NULL CHECK(type IN ('FIXED','PERCENTAGE')),
  value REAL NOT NULL CHECK(value > 0), starts_at TEXT NOT NULL, ends_at TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1, max_uses INTEGER, used_count INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS receipts (
  id TEXT PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  receipt_number TEXT NOT NULL, print_status TEXT NOT NULL DEFAULT 'pending',
  attempt_count INTEGER NOT NULL DEFAULT 0, last_error TEXT, updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sync_queue (
  id TEXT PRIMARY KEY, entity_type TEXT NOT NULL, entity_id TEXT NOT NULL,
  operation TEXT NOT NULL, payload_json TEXT NOT NULL, idempotency_key TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','processing','synced','failed')),
  attempt_count INTEGER NOT NULL DEFAULT 0, next_attempt_at TEXT NOT NULL,
  last_attempt_at TEXT, error_message TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS sync_queue_pending_idx ON sync_queue(status, next_attempt_at, created_at);
CREATE TABLE IF NOT EXISTS sync_metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS device_settings (key TEXT PRIMARY KEY, value_json TEXT NOT NULL, owner TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY, actor_id TEXT NOT NULL, action TEXT NOT NULL, entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL, details_json TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL
);
INSERT OR IGNORE INTO schema_migrations(version, applied_at) VALUES (1, strftime('%Y-%m-%dT%H:%M:%fZ','now'));
