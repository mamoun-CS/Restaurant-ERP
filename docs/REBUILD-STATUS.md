# Rebuild Status

## Current Phase

Cloud source is organized into `apps/online-erp` and `apps/api`; the Windows Cashier remains independently in `apps/desktop-pos`. Rebuild and database-backed parity checks after this reorganization are pending, so deployment is not marked verified.

## Completed

- `apps/online-erp` contains the ERP UI, app environment examples, Prisma schema/migrations, printing agent, and deployment/configuration files.
- `apps/api` contains the independent Next.js API runtime and route implementations. The ERP rewrites `/api/*` to API; its three login/session routes remain local for cookie compatibility.
- The API handler set includes POS pairing/bootstrap/revocation/sale sync, auth, discounts and cashier permissions, order/invoice management, printer configuration, and print jobs.
- `apps/desktop-pos` retains SQLite checkout, local printing, pairing credentials, and durable synchronization; shared contracts remain in `packages/`.
- The cashier creates/migrates its SQLite database on first launch in Electron `userData`, outside the install directory. Bootstrap refreshes the local catalog transactionally without deleting local sales/outbox records.
- API bootstrap and SQLite compute the same SHA-256 catalog hash over categories, products, prices, sizes, and add-ons. The cashier shows last checked match status, refreshes automatically when stale or mismatched, and has a manual catalog refresh action.
- Windows packaging now compiles and bundles print-agent files and the RAW spooler script. The agent is started with Electron's embedded Node runtime if a valid legacy agent pairing is present; receipt printing still supports the Windows print dialog.
- Cashier printer setup now opens Windows printer settings, lists locally installed printers, lets the user save a receipt printer, and prints a test page. If no printer is connected, checkout remains available and receipt print selection can be deferred until one is installed.
- The completed-sale screen now offers **Save invoice PDF**. It opens the native save dialog and writes a PDF from the rendered invoice, allowing local invoice review without a physical printer.
- The existing PostgreSQL schema and migration history were moved with the ERP app. No migration was applied and no live PostgreSQL data was altered.

## Verification

- Before folder reorganization, separate API/ERP builds and local API proxy routing passed. Those results do not verify the new paths.
- After reorganization, the ERP build exposed and fixed an issue with compatibility routes importing the API directly. Those routes now use the ERP-local auth endpoints plus a rewrite to the API for the other paths.
- `npm ci` from the Online ERP folder was attempted but did not complete; its partial `node_modules` is not usable, and Next build could not start. Re-run `npm ci --prefix apps/online-erp`, then both builds and local startup checks.
- The dependency list was corrected for shared packages' new relative location. The local npm cache lacks one platform-specific Tailwind package, so lockfile regeneration/install also awaits registry access.
- `start-cloud-apps.ps1` opens API and ERP dev servers separately on ports 3010 and 3000; `stop-cloud-apps.ps1` stops those listeners. These scripts could not be exercised while the dependency installation remained incomplete.
- The prior cashier build and 14 tests passed. The cashier remains in its original folder; re-run these if its shared dependencies change.
- The current catalog reconciliation tests cover cloud price changes and preservation of SQLite sales/outbox rows. A previous 15-case run had 2 passing and 13 SQLite-backed cases unable to start after an Electron native rebuild attempt; unit tests have not been rerun after switching to the N-API binary. API/SQLite hash equivalence has not been executed in this checkout.
- The cashier TypeScript/Vite production build passes. GitHub's first package attempt then failed compiling `better-sqlite3` 12.11.1 against Electron 45/V8 15.6 (`GetPrototypeV2`, `HolderV2`, and `Object::New` API mismatches). Updated the cashier to `better-sqlite3` 13.0.3, which uses Node-API prebuilt binaries, and removed the Electron-specific native rebuild step. Local verification loaded SQLite 3.53.4 in Electron 45 and passed a write/read smoke check. Packaging still needs a fresh GitHub run.
- Automatic agent start is conditional on a separate legacy print-agent credential. POS device enrollment does not provision it yet, so initial cashier pairing alone does not activate the background printer agent. The POS agent print-job path remains unintegrated.
- The in-cashier Windows printer setup and test print path have not been built or tested on a Windows device in this checkout; Windows still handles driver installation through its built-in printer settings.
- PDF save implementation uses Electron `webContents.printToPDF` and the native Save dialog, but file generation and Arabic text rendering have not been exercised because the Electron window could not start in this checkout.
- In this development session, the Electron launcher now strips a globally inherited `ELECTRON_RUN_AS_NODE` variable before starting Electron. This fixed local launches where Electron APIs were unavailable because it started in Node compatibility mode.
- Added `.github/workflows/build-windows.yml` for manual runs, pushes to `main`, and `desktop-v*` tags. Earlier runs identified missing print-agent dependencies and `better-sqlite3` 12.11.1 incompatibility with Electron 45/V8 15.6. The cashier now uses `better-sqlite3` 13.0.3's N-API prebuild and no longer performs an Electron-specific C++ rebuild.
- Local Windows verification passed: `npm run package:windows` created `apps/desktop-pos/release/Restaurant-POS-Setup.exe`, and `scripts/smoke-installed-windows.ps1` passed install, first-run SQLite creation, same-version reinstall preservation, and uninstall preservation. GitHub run 42063416836 also completed successfully: cashier tests, NSIS packaging, installed-app smoke test, and artifact upload all passed. The `restaurant-pos-windows-setup` artifact is available for download. The installer is not code-signed; Windows may show its standard publisher warning.
- The smoke test uses an explicit temporary Electron user-data path; ordinary installs continue to use Electron's default user-data directory.
- The workflow smoke test does not exercise real cloud enrollment/sales synchronization, PDF saving, or a physical printer; those require a reachable server and/or hardware.
- Docker image builds remain unverified because Docker Desktop's Linux engine was unavailable.
- Successful database-backed login/session, pairing, bootstrap, and sale synchronization remain untested against disposable PostgreSQL.
- No live database or sales data was changed during the file reorganization.

## Remaining Boundary Work

- API route handlers still import auth/domain helpers from `apps/online-erp/src`. Extract those into an independent shared server package or `apps/api` before deploying the API without ERP source.
- Reinstall dependencies and verify each app builds and starts from its own directory. Then verify the two containers and PostgreSQL-backed flows.
- Existing migrations remain additive; take a verified backup and perform duplicate/data preflight before production migration.
- Mobile emergency POS, explicit source attribution, local printer configuration sync, station-split kitchen tickets, and offline printer queues are not complete.
- Unify POS enrollment with print-agent enrollment and integrate POS checkout kitchen tickets with the bundled agent; keep manual receipt printer selection available.

## Next Work

1. Restore cloud dependencies using the documented app-local install and verify API/ERP builds from their folders.
2. Remove API imports from ERP source and validate separate container builds and database-backed authentication/pairing/sync.
3. Continue with touch-first mobile POS and dynamic station ticket routing/offline printing.

## Printer Routing Update (2026-11-05)

- The ERP printing page now provides an editable category-to-printer selector, scoped to a selected branch and the branch's enabled kitchen/bar printers.
- Added a manager-only API endpoint at `/api/printing/category-routes` to read and save routes. Existing product route precedence remains unchanged; branch category routes are considered next, then the default kitchen printer.
- Added an additive migration for branch-scoped category mappings. Existing category mappings are retained as legacy global rows and only apply when the mapped printer belongs to the invoice branch.
- Verification limitation: app dependencies are currently unavailable in this checkout (`npm run db:generate --prefix apps/online-erp` fails because the Prisma CLI is not installed). The Prisma client generation, app build, migration deployment, and database-backed UI/API flow have not been verified. Apply `npm run db:deploy` and `npm run db:generate` after restoring dependencies before using the setting.
