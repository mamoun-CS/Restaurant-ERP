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
- The current catalog reconciliation tests cover cloud price changes and preservation of SQLite sales/outbox rows. A test run in this turn executed 15 cases: 2 passed and 13 SQLite-backed cases could not start because the prior Electron rebuild attempt removed the Node ABI binding. API/SQLite hash equivalence has not been executed in this checkout.
- The cashier TypeScript/Vite production build passes. The native Electron SQLite rebuild and packaging still cannot complete locally because no Electron 45 prebuild was available and the installed VS2019 lacks the Windows SDK/toolset required by node-gyp.
- Automatic agent start is conditional on a separate legacy print-agent credential. POS device enrollment does not provision it yet, so initial cashier pairing alone does not activate the background printer agent. The POS agent print-job path remains unintegrated.
- The in-cashier Windows printer setup and test print path have not been built or tested on a Windows device in this checkout; Windows still handles driver installation through its built-in printer settings.
- PDF save implementation uses Electron `webContents.printToPDF` and the native Save dialog, but file generation and Arabic text rendering have not been exercised because the Electron window could not start in this checkout.
- In this development session, `npm install --install-links` completed for the cashier and `npm run build` passed, including TypeScript and Vite production compilation. `npm run dev` starts Vite and TypeScript cleanly, but the Electron window cannot start until `better-sqlite3` is rebuilt for Electron ABI 150. No matching prebuilt binary was available, and this machine has VS2019 without the required Windows SDK/toolset. Install Visual Studio 2022 Build Tools with Desktop development with C++ (or run the supplied Windows packaging workflow) and rebuild the native module before running Electron.
- Added `.github/workflows/build-windows.yml` for manual runs, pushes to `main`, and `desktop-v*` tags. It installs from the cashier lockfile, runs tests, compiles the print agent and POS, rebuilds and verifies `better-sqlite3` against Electron 45.2.3, creates `Restaurant-POS-Setup.exe`, smoke-installs it on the runner, and uploads the artifact. The workflow has not been run on GitHub in this turn, so no Setup artifact is available yet.
- The workflow smoke script checks first-run SQLite creation, sentinel preservation across a same-version reinstall, and data retention after silent uninstall. It does not exercise real cloud enrollment/sales synchronization, PDF saving, or a physical printer; those require an authorized live server and/or hardware.
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
