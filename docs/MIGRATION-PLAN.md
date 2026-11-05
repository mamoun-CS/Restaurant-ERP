# Application Separation and Data Migration Plan

## Preservation constraints

- Keep the existing Next.js ERP, authentication, route behavior, Prisma/PostgreSQL history, cash shifts, financial modules, and Nova print-agent protocol available throughout migration.
- Do not create a second cloud database. Preserve the existing PostgreSQL instance and apply only reviewed, additive schema migrations.
- Keep the cashier database under Electron `userData`, outside the installer directory. Never delete or recreate it during app startup or installer updates.
- Keep the current Electron path (`apps/desktop-pos`) temporarily. Rename it to `apps/cashier` only with a reviewed packaging/workflow migration; local database contents remain in the same OS application-data location.
- Do not claim the online ERP/backend boundary is complete until both have separate start/build/deployment commands and their integration tests pass.

## Phase A — contracts and boundary (implementation in progress; verification gates open)

1. Add platform-neutral DTOs, schemas, and business rules in `packages/shared-*`; consume the same sale contract and discount/total arithmetic in Electron and cloud sale acceptance.
2. Keep cloud route handlers available in the ERP app while extracting their domain logic behind API modules.
3. `apps/api` owns the runtime and handler table; `apps/online-erp` owns the ERP UI, auth/domain helpers, Prisma schema, and migrations. Root compatibility wrappers have been moved with the ERP app. Separate builds worked before the folder organization and must be rerun now.
4. Install dependencies and verify both app builds and starts from their folders. Build/start the containers and verify successful auth/session, pairing, bootstrap, sale sync, permissions, and compatibility routing against a disposable PostgreSQL database before production routing. These checks remain open.

## Phase B/C — cashier and online ERP

5. Complete cashier behavior (local sale history, customer records, register sessions, options, offline printer config) without changing the stable SQLite location. Add explicit numbered SQLite migrations and backup/restore verification before any upgrade.
6. ERP source is now grouped under `apps/online-erp`, with the existing screens/auth retained. API handlers still consume server helpers from that app during staged extraction. Remove that coupling, then demonstrate deployment parity and rollback.
7. Build a dedicated responsive mobile emergency POS in the online ERP. It uses the cloud order API and PostgreSQL only, requires internet, enforces employee role/branch/discount permissions server-side, and records `MOBILE_POS` source and device/session identity.
8. Keep Windows offline checkout independent of the API. On reconnection, use shared DTOs, validation, and idempotency to push orders; never overwrite completed local facts.

## Phase D/F — kitchen printing

9. Reuse existing `PrinterConfiguration`, `ProductPrinterRoute`, `CategoryPrinterRoute`, `PrintJob`, printer APIs/UI, and `print-agent`. They already model a dynamic printer count, category/product routing, retries, and idempotent jobs.
10. Verify and extend server routing so one paid order generates one ticket per configured station, each with only its assigned items, notes/options, order number/time, and source. Define an explicit configured fallback for unassigned items; never silently drop a ticket.
11. Add additive schema fields only if source/device/ticket behavior cannot be expressed by existing fields. Preflight duplicates and take a verified backup before applying migrations.
12. Add a local printer configuration snapshot and durable local ticket queue to cashier SQLite. Continue printing from the last synchronized configuration while offline; sync status only after the local agent confirms printing.

## Phase G/H — sync, rollout, and release

13. Add `WINDOWS_POS`, `MOBILE_POS`, and `ONLINE_ERP` source/device attribution and report filters. Existing `idempotencyKey` and `clientTransactionId` remain stable; add uniqueness only after checking existing duplicates.
14. Export pending browser IndexedDB transactions before browser POS retirement. Validate and import atomically, preserving IDs, totals, times, and payments. Reconcile duplicates by origin IDs, never by guesswork.
15. Test outage/reconnect, duplicate submissions, cashier/device revocation, discounts, concurrent mobile and Windows transactions, printer errors/reprints, migrations, and backup restore.
16. Cut over one branch/device at a time. Keep root ERP routes and deployments available until production reconciliation is signed off. Build and verify the Windows installer on clean Windows 10 and 11 systems.

## Safety gates

Never reset production PostgreSQL. Never remove original route handlers before compatibility coverage. Do not ship offline permissions without a bounded expiry and signed policy snapshot. Mobile emergency checkout requires internet and is not a replacement for the offline Windows cashier. Preserve all completed local sales and outbox rows even when a sale is rejected during sync; expose it for operator review.
