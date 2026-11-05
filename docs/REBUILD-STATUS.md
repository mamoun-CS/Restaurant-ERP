# Rebuild Status

## Current Phase

Phase A boundary work is implemented in source and independently buildable targets exist for the API, Online ERP, and Windows Cashier. Production container deployment and database-backed parity checks remain open, so the system is not marked independently deployable yet.

## Completed

- The Electron cashier at `apps/desktop-pos` owns its SQLite database, checkout, local receipt printing, pairing credentials, and durable synchronization queue. It has its own build and test commands and does not depend on Next.js.
- Platform-neutral `@restaurant/shared-types`, `@restaurant/shared-validation`, and `@restaurant/shared-business-logic` packages are shared by desktop and cloud sync.
- All 72 existing API route implementations are under `apps/api/src/modules/route-handlers`. The API Next app exposes these routes, including POS device pairing/bootstrap, authentication, sale sync, discounts/cash permissions, orders/invoices, and printer configuration and job management.
- Existing root `/api/**` paths remain as compatibility adapters to the same handler modules, so route business logic is not duplicated.
- The Online ERP can be built as a separate standalone Next deployment with `ONLINE_ERP_API_URL`; its `/api/*` requests rewrite to the API origin. The default compose stack separates its web process from the API and gives the PostgreSQL connection only to the API service.
- The existing PostgreSQL service, named volume, Prisma schema, migration history, and authentication implementation are retained. No live database was altered and no migration was applied in this work.

## Verification Results

- `npm run api:build`: passed; standalone API build includes 72 routes.
- `ONLINE_ERP_API_URL=http://127.0.0.1:3010 npm run online-erp:build`: passed; inspected Next route manifest and confirmed `/api/:path*` rewrites to the API origin.
- `npm run build`: passed for the compatibility/root Next deployment.
- API standalone process: started locally and returned HTTP 200 on `/`. Invalid device registration returned the expected validation response; unauthenticated pairing-code creation was rejected.
- ERP standalone process plus API: `/login` returned HTTP 200; ERP `/api/v1/pos/devices/register` reached the API and returned its validation response, and an unauthenticated pairing request was rejected.
- `npm run desktop:build`: passed. `npm --prefix apps/desktop-pos test`: 14 passed. The root regression suite passed. Root ESLint passed with 11 warnings and 0 errors.
- Dependency boundary checks: root has no top-level Electron dependency; the cashier package has no Next dependency.
- Compose configuration parses. Building the API and ERP container images was attempted, but Docker Desktop's Linux engine was unavailable. Therefore container startup/deployment has not been verified.
- Successful ERP authentication, PostgreSQL-backed POS pairing, sale synchronization, and preservation against a live existing database have not been exercised end to end because no isolated test PostgreSQL instance was available. Local checks only verify routing, validation, and unauthenticated rejection; they are not proof of successful database-backed flows.
- Windows installer compilation and clean Windows 10/11 installation remain unverified; this workstation lacks the required Visual Studio C++ build tools.

## Known Gaps

- Online ERP UI source remains at the repository root. `Dockerfile.online-erp` and the separate build are deploy targets, but a clean `apps/online-erp` source package and full removal of root server-helper dependencies are still migration work.
- API route handlers currently import transitional auth, Prisma, and domain helpers from root `src/lib` and `src/generated`. The API has its own runtime/build boundary, while shared server dependency extraction remains incomplete.
- API image and Online ERP image have not been built or started in containers. Do not describe production independent deployment as verified until container builds and runtime checks pass.
- Existing auth code and route modules are preserved, but successful login/session behavior needs an integration run against a disposable PostgreSQL database.
- Shared sale validation is in use for offline uploads; browser and future mobile orders still need migration to the shared API validation contract.
- Mobile emergency POS, source attribution/reporting, local printer configuration sync, and station-split kitchen ticket verification remain incomplete. Existing dynamic printer configuration, category/product routes, idempotent jobs, retry behavior, and print-agent are retained for extension.
- Catalog sync uses full snapshots, not a cursor. Offline device revocation takes effect when the device reconnects.

## Data Safety

- The default split compose file retains the existing PostgreSQL service and `postgres_data` volume. Only the API receives its `DATABASE_URL`; Online ERP reaches it through the API rewrite.
- No production DB reset, schema migration, or data write was performed as part of the boundary extraction.
- Migrations remain additive and require duplicate preflight and a verified backup before production deployment.

## Next Work

1. Build and start both container images once Docker is available; run API and ERP against a disposable PostgreSQL database and verify login/session, device pairing, bootstrap, sale sync, permissions, and existing route compatibility.
2. Finish the Online ERP source/dependency boundary and produce a clean deployment pipeline without relying on root application internals.
3. Continue toward mobile POS: touch-first online checkout using the shared API, employee permissions, and explicit order source/device identity.
4. Extend dynamic printer routing to station-specific kitchen tickets, configured handling for unassigned items, and offline printer configuration/ticket queues in the Windows cashier.
