# Synchronization Strategy

## Direction and ownership

Use a device-authenticated, versioned HTTPS API with bounded request bodies and schema validation. Push immutable locally completed orders and append-only inventory/discount/audit events using stable UUID idempotency keys. The desktop uses `/api/v1/pos/bootstrap` for catalog and signed cashier-policy snapshots and `/api/v1/sync/push` for order upload and acknowledgement. The existing `/api/invoices` endpoint authenticates a browser cashier cookie; it is not the desktop sync API. `/api/sync/cloud` remains a PostgreSQL-to-PostgreSQL replication helper.

## Durable outbox and retry

The SQLite checkout transaction inserts both the sale and its outbox item. On restart, rows marked `processing` are returned to `pending`. A single-process lock plus a SQLite lease prevents overlapping sync workers; the server's unique idempotency constraint is the final duplicate defense. Batch requests are independently acknowledged per item, allowing partial success without resending acknowledged items. Retry transport failures, timeouts, 429, and 5xx with capped exponential backoff and jitter; honor `Retry-After`. Authentication/configuration failures remain visible and queued but require re-provisioning. Validation failures are quarantined with error detail and an operator action; the immutable sale is retained.

Sync runs at startup, on network recovery, and on a periodic timer. Connectivity is determined by a bounded API request, not OS network state alone. Work runs outside renderer checkout flow. The UI shows pending, last successful sync, and actionable errors. Do not sync while local DB migration/checkout transactions are open.

## Conflict rules

- Products, categories, prices, discounts, cashier status/permissions, and centrally managed configuration: cloud authoritative; apply each cursor page transactionally.
- Completed orders, payment records, discount events, and audit events: device-originated immutable facts; never overwrite or delete due to a pull conflict. Corrections are compensating events.
- Inventory: append movements with stable IDs and dedupe on cloud; calculate balances from movements/controlled snapshots. Do not upload a blind local quantity overwrite.
- Customers: merge by cloud ID when present, otherwise normalized phone/email under an explicit server policy; retain both on ambiguity and flag review instead of silently merging.
- Device settings: device-local values own hardware/printer preferences; cloud policy owns enforceable permissions and global behavior. Store source/version on each setting.

## Authentication and offline limits

Device enrollment issues a revocable device identity and refresh credential stored via Windows Credential Manager/OS-protected storage. Access tokens are short lived. Cashier password/PIN verification is local only for users provisioned by a prior successful sync. Store a memory-hard verifier (Argon2id where supportable) and a per-user/device salt, never the PIN itself; apply a persisted attempt counter, delay, and temporary lockout. A signed/versioned permission snapshot bounds offline privilege. Offline mode cannot learn an account disable or permission change until reconnection; cap offline authorization age and require online revalidation for configured high-risk actions. This limitation must be visible to administrators and documented to operators.

Discount policy is validated in the cloud on every online order and locally against the latest signed policy snapshot offline. Exceeding a cashier limit requires supervisor credentials and records both actors, reason, amount, and policy version. A client-provided discount total alone is never authorization.

## Current gaps

The desktop device endpoints authenticate short-lived device JWTs and verify signed cashier policy snapshots, including supervisor authorization for above-limit discounts. Sync returns per-order acknowledgements, uses idempotency keys, and the local worker retries failed orders with bounded backoff. Remaining gaps: bootstrap replaces the full catalog instead of using a cursor; customers, register sessions, and standalone inventory events are not synced; broader API integration and conflict tests are needed. Offline revocation cannot take effect until a terminal reconnects. The legacy `/api/sync/cloud` PostgreSQL replication endpoint is separate and still needs its own access controls reviewed before exposure.
