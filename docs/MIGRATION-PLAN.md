# Migration Plan

## Data and feature preservation

Keep the existing Next.js ERP, Prisma/PostgreSQL schema, migrations, admin pages, financial modules, cash-shift controls, and print-agent behavior available through the transition. No production database changes are required to add the desktop shell. Existing PostgreSQL data remains under the existing migration/backup process.

## Rollout sequence

1. Inventory current production schema/version and take a verified PostgreSQL backup. Record branch, register, cashier, discount, inventory, and invoice behavior. The current browser offline store is a separate IndexedDB dataset.
2. Add cloud API contracts and database uniqueness constraints through additive Prisma migrations after checking existing duplicates. Deploy API support before distributing a desktop client.
3. Ship the Electron application in shadow/pilot mode per device. Enroll device, bootstrap its catalog/permissions, and test offline sales against a dedicated branch/register policy.
4. Provide a browser-side export for pending IndexedDB sales and cached customers/config. Validate JSON, preserve UUID/client transaction IDs, totals, timestamps, and payments, then import atomically into SQLite. Reject malformed/duplicate keys for operator review; never auto-delete source records before verified import.
5. Reconcile historical invoices by `clientTransactionId`/idempotency key before upload. For events without an origin ID, do not guess equivalence; export a reconciliation report.
6. Compare per-device order counts/totals, inventory movements, and payment totals through at least one full operating cycle. Keep rollback to the browser POS available until signed off.
7. Cut over devices individually. Preserve PostgreSQL invoice IDs/numbers and local receipt references. Installer updates preserve SQLite and include a backup/restore path.

## Safety rules

Never reset production PostgreSQL or run a destructive migration as part of this work. Use additive migrations, preflight checks, backups, and explicit reconciliation. Do not delete completed sales from either store to make synchronization appear clean. Existing browser cleanup removes synced local sales after seven days, so operators should export pending/unarchived history before any browser retirement; this behavior should be replaced with a retention/archive policy before production cutover.
