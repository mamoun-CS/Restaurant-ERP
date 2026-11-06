ALTER TABLE cashiers ADD COLUMN account_type TEXT NOT NULL DEFAULT 'CASHIER'
  CHECK(account_type IN ('ADMIN','CASHIER'));
INSERT INTO schema_migrations(version, applied_at) VALUES(3, datetime('now'));
