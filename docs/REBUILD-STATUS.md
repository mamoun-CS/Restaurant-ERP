# Rebuild Status

## Current Phase

Phase 1 — Foundation (in progress; the desktop foundation is in place, but the requested independently deployable backend and admin dashboard boundaries are not complete).

## Completed

- Inspected the existing Next.js/React/TypeScript ERP, Prisma/PostgreSQL schema and migrations, authentication, API routes, browser POS/offline storage, printing agent, package scripts, and deployment files.
- Added an independently installable Electron + React + TypeScript Windows POS app under `apps/desktop-pos`.
- Added SQLite storage and migration, secure Electron IPC, local checkout, receipt view, device pairing, offline cashier PIN provisioning, discount policy snapshots, and a durable sale sync queue.
- Added device APIs to the existing Next.js cloud application for pairing, bootstrap, revocation, and signed sale synchronization.
- Added a POS device administration screen and additive PostgreSQL migration.
- Added Windows installer packaging configuration and a Windows CI packaging workflow.
- Documented architecture, database design, sync behavior, security, and data migration.

## Files Created

- `apps/desktop-pos/**`
- `src/app/api/pos/**`, `src/app/api/sync/push/**`, `src/app/api/v1/**`, `src/app/api/employees/[id]/pos-auth/**`
- `src/app/admin/pos-devices/**`, `src/components/pos-devices-page.tsx`, `src/lib/pos-device-auth.ts`
- `prisma/migrations/20261105090000_offline_pos_devices/**`
- `docs/REBUILD-STATUS.md`, `docs/DATABASE-DESIGN.md`, `docs/MIGRATION-PLAN.md`, `docs/SECURITY.md`, `docs/SYNC-STRATEGY.md`
- `.github/workflows/package-windows.yml`

## Files Modified

- Root `package.json`, `README.md`, `.env.example`, `.gitignore`, Prisma schema, navigation/i18n, and cloud sync helper.
- `docs/architecture.md` (the repository is used on Windows, where `ARCHITECTURE.md` and `architecture.md` resolve to the same file; retain the existing lowercase path).

## Tests

- Desktop SQLite/auth/sync tests: 12 passed.
- Desktop TypeScript/Vite production build: passed.
- Root Next.js production build (includes Next route type checking): passed.
- Root `npx tsc --noEmit`: passed after regenerating Next route types.
- Root ESLint: passed with 11 warnings, no errors.
- Windows installer packaging was attempted but cannot compile `better-sqlite3` on this workstation because Visual Studio 2022 C++ build tools are unavailable. The Windows CI workflow provides a Windows packaging runner; installer execution has not been verified here.
- The Prisma migration is additive and generated-client validation/build passed; it has not been applied to a live database.

## Known Issues

- The cloud dashboard and API still run from the existing root Next.js application. They are not independently deployable apps yet. Splitting them safely requires extracting shared auth/domain/database dependencies and preserving all existing routes.
- There is no shared TypeScript package yet; desktop API DTOs and cloud request validation still have separate definitions.
- The desktop flow currently handles product search, cart, local cash checkout, receipts, pairing, sync, and discount authorization. Customer management, sales history, cash register open/close, product-option selection, card/bank terminals, and printer-agent integration remain incomplete.
- Sync currently bootstraps full catalog snapshots rather than cursor-based incremental pulls. Conflict handling and retry monitoring need broader integration coverage.
- The sync endpoint checks policy snapshots and assignment at upload time. Offline actions cannot learn about revocation until a connection is restored.
- The Windows installer has not been built or run on this machine.

## Important Architectural Decisions

- Keep existing Next.js route handlers and Prisma/PostgreSQL as the cloud stack during migration; do not replace the ERP wholesale or run destructive migrations.
- Keep Electron main process as the owner of SQLite, sync credentials, and filesystem access. The renderer uses a narrow preload bridge.
- Store local money as integer minor units and queue immutable sales with UUID idempotency keys.
- Keep production PostgreSQL migrations additive and require backup/preflight before deployment.

## Next Step

- Complete Phase 1 by defining and implementing the cloud app boundary without moving or dropping existing ERP routes: extract shared platform-neutral contracts, then make backend and dashboard independently startable/deployable and verify both. Do not start new Phase 2 work until this boundary is complete.
