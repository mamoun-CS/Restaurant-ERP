# Database Design

## Existing cloud database

`prisma/schema.prisma` is PostgreSQL-specific and remains the cloud source of truth. Relevant existing models include `Branch`, `User`, `Category`, `Product`, `ProductTranslation`, `ProductSize`, `ProductAddon`, `DiscountCampaign`, `Invoice`, `InvoiceItem`, `InvoicePayment`, `CashRegister`, `CashShift`, `InventoryMovement`, and `AuditLog`. Cloud invoices preserve item and cost snapshots and support `idempotencyKey` and `clientTransactionId`. Existing money is generally `Decimal(..., 2)`; the desktop boundary converts it to integer minor units and never serializes JS floating point as authoritative money.

## Local SQLite target

Each Windows installation owns a separate SQLite database under Electron's per-user application data path. The initial migration creates these entities (UUID primary keys unless stated otherwise):

| Table | Essential fields / purpose |
|---|---|
| `products`, `categories`, `product_options` | Cached catalog snapshots, cloud ID, active flag, integer unit price, server version/update cursor |
| `customers` | Local UUID, optional cloud ID, normalized contact fields, sync version |
| `cashiers`, `cashier_permissions` | Provisioned credential hash/salt and last-synced authorization snapshot; no raw PIN/password |
| `orders`, `order_items`, `payments` | Immutable completed sale snapshot, UUID/idempotency key, integer minor-unit totals, cashier/device/shift IDs, creation time |
| `inventory_movements` | Append-only signed quantity delta and source order/reference; never overwrite a cloud stock balance |
| `discount_events` | Applied amount, reason, cashier, optional approving supervisor, permission snapshot version, timestamp |
| `cash_registers`, `cash_register_sessions` | Device register and offline opening/closing totals and audit trail |
| `receipts` | Sale-linked receipt number/render metadata and print attempts; sale remains available for reprint |
| `sync_queue` | Durable outbox with UUID, entity, operation, payload/version, idempotency key, attempts, retry time, last error, status |
| `sync_metadata`, `device_settings` | Last pull cursor, device identity, cloud-owned config version, device-owned settings |
| `audit_logs` | Append-only sensitive-action record and actor/device IDs |

All locally created sales and related rows are written in one `BEGIN IMMEDIATE` transaction. A sale's idempotency key is unique locally. No queue cleanup may cascade-delete completed orders. Currency code and minor-unit exponent are recorded so totals remain interpretable. Quantities use integer base units where practical or a checked fixed-precision representation for fractional inventory.

## IDs, versions, and migrations

Create UUIDs locally; cloud rows retain the originating UUID and enforce uniqueness for `(device_id, client_transaction_id)` and idempotency keys. Product/catalog records carry cloud IDs and server versions. Migrations are additive and numbered. Before migration, checkpoint/backup the DB; retain a tested restore path and never delete the DB during installer upgrade. Cloud migration history under `prisma/migrations` remains authoritative for PostgreSQL.

The current repository has no Electron SQLite file or production desktop data to migrate. Existing browser data is IndexedDB and cannot safely be read by an installer without a browser-based export step. During rollout, add an explicit export/import utility that validates and preserves pending sales and transaction IDs; do not infer that the seven-day browser cleanup is a suitable archive policy. Never run destructive cloud migrations as part of this desktop introduction.
