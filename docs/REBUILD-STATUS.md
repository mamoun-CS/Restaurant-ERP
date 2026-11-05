# Rebuild Status

## Current Phase

Cloud source is organized into `apps/online-erp` and `apps/api`; the Windows Cashier remains independently in `apps/desktop-pos`. Rebuild and database-backed parity checks after this reorganization are pending, so deployment is not marked verified.

## Completed

- `apps/online-erp` contains the ERP UI, app environment examples, Prisma schema/migrations, printing agent, and deployment/configuration files.
- `apps/api` contains the independent Next.js API runtime and route implementations. The ERP rewrites `/api/*` to API; its three login/session routes remain local for cookie compatibility.
- The API handler set includes POS pairing/bootstrap/revocation/sale sync, auth, discounts and cashier permissions, order/invoice management, printer configuration, and print jobs.
- `apps/desktop-pos` retains SQLite checkout, local printing, pairing credentials, and durable synchronization; shared contracts remain in `packages/`.
- The existing PostgreSQL schema and migration history were moved with the ERP app. No migration was applied and no live PostgreSQL data was altered.

## Verification

- Before folder reorganization, separate API/ERP builds and local API proxy routing passed. Those results do not verify the new paths.
- After reorganization, the ERP build exposed and fixed an issue with compatibility routes importing the API directly. Those routes now use the ERP-local auth endpoints plus a rewrite to the API for the other paths.
- `npm ci` from the Online ERP folder was attempted but did not complete; its partial `node_modules` is not usable, and Next build could not start. Re-run `npm ci --prefix apps/online-erp`, then both builds and local startup checks.
- The dependency list was corrected for shared packages' new relative location. The local npm cache lacks one platform-specific Tailwind package, so lockfile regeneration/install also awaits registry access.
- `start-cloud-apps.ps1` opens API and ERP dev servers separately on ports 3010 and 3000; `stop-cloud-apps.ps1` stops those listeners. These scripts could not be exercised while the dependency installation remained incomplete.
- The prior cashier build and 14 tests passed. The cashier remains in its original folder; re-run these if its shared dependencies change.
- Docker image builds remain unverified because Docker Desktop's Linux engine was unavailable.
- Successful database-backed login/session, pairing, bootstrap, and sale synchronization remain untested against disposable PostgreSQL.
- No live database or sales data was changed during the file reorganization.

## Remaining Boundary Work

- API route handlers still import auth/domain helpers from `apps/online-erp/src`. Extract those into an independent shared server package or `apps/api` before deploying the API without ERP source.
- Reinstall dependencies and verify each app builds and starts from its own directory. Then verify the two containers and PostgreSQL-backed flows.
- Existing migrations remain additive; take a verified backup and perform duplicate/data preflight before production migration.
- Mobile emergency POS, explicit source attribution, local printer configuration sync, station-split kitchen tickets, and offline printer queues are not complete.

## Next Work

1. Restore cloud dependencies using the documented app-local install and verify API/ERP builds from their folders.
2. Remove API imports from ERP source and validate separate container builds and database-backed authentication/pairing/sync.
3. Continue with touch-first mobile POS and dynamic station ticket routing/offline printing.
