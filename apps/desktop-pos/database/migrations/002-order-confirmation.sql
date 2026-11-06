BEGIN IMMEDIATE;
ALTER TABLE orders ADD COLUMN order_type TEXT NOT NULL DEFAULT 'PICKUP';
ALTER TABLE orders ADD COLUMN customer_name TEXT;
ALTER TABLE orders ADD COLUMN customer_phone TEXT;
ALTER TABLE orders ADD COLUMN customer_address TEXT;
ALTER TABLE orders ADD COLUMN customer_notes TEXT;
INSERT OR IGNORE INTO schema_migrations(version, applied_at) VALUES (2, strftime('%Y-%m-%dT%H:%M:%fZ','now'));
COMMIT;