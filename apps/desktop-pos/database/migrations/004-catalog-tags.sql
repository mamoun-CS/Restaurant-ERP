ALTER TABLE categories ADD COLUMN tags_json TEXT NOT NULL DEFAULT '[]';
ALTER TABLE products ADD COLUMN tags_json TEXT NOT NULL DEFAULT '[]';
INSERT INTO schema_migrations(version, applied_at) VALUES(4, datetime('now'));
