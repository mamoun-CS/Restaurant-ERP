# Rebuild Status

## Current Phase

The user-facing deployment has two applications: the Windows Cashier (`apps/desktop-pos`) and the full-stack Online ERP (`apps/online-erp`). The ERP serves UI, authentication, management APIs, and POS device/sync APIs from one Next.js process on port `3000`. The route tree in `apps/api` remains a compatibility surface over the same canonical handlers, not a required third runtime for the normal cashier workflow.

## Completed

- `apps/online-erp` contains the ERP UI, app environment examples, Prisma schema/migrations, printing agent, and deployment/configuration files.
- Canonical backend route handlers live in `apps/online-erp/src/lib/backend-api/route-handlers`. `npm run api:routes` generates route adapters for the ERP and the compatibility API tree.
- ERP's `/api/auth/login` compatibility route delegates to the existing auth handler so the login form path continues to work.
- `apps/desktop-pos` retains SQLite checkout, local printing, pairing credentials, and durable synchronization; shared contracts remain in `packages/`.
- The cashier creates/migrates its SQLite database on first launch in Electron `userData`, outside the install directory. Bootstrap refreshes the local catalog transactionally without deleting local sales/outbox records.
- API bootstrap and SQLite compute the same SHA-256 catalog hash over categories, products, prices, sizes, and add-ons. The cashier shows last checked match status, refreshes automatically when stale or mismatched, and has a manual catalog refresh action.
- Windows packaging now compiles and bundles print-agent files and the RAW spooler script. The agent is started with Electron's embedded Node runtime if a valid legacy agent pairing is present; receipt printing still supports the Windows print dialog.
- Cashier printer setup now opens Windows printer settings, lists locally installed printers, lets the user save a receipt printer, and prints a test page. If no printer is connected, checkout remains available and receipt print selection can be deferred until one is installed.
- The completed-sale screen now offers **Save invoice PDF**. It opens the native save dialog and writes a PDF from the rendered invoice, allowing local invoice review without a physical printer.
- Four pending migrations were applied to the configured local development PostgreSQL database on 2026-11-05: print-device telemetry, printer connection type, branch-scoped category routing, and offline POS devices. They add fields/tables and adjust an index; no application rows were deleted. No production database was touched.
- The local database contains active `admin@noura.test` (ADMIN) and `cashier@noura.test` (CASHIER) accounts. Their stored password hashes match `Demo123!` (including the exclamation mark). Both login flows returned HTTP 200 after applying the local migrations. Offline cashier PIN provisioning remains a separate action in POS Devices.

## Verification

- The ERP dev server responds on port `3000`; no `3010` listener is needed for the two-app run.
- `POST /api/auth/login` returned HTTP 200 for both demo roles; the admin POS Devices API returned HTTP 200.
- POS registration with an empty payload returned HTTP 400 validation, bootstrap without a device token returned HTTP 401, and sale sync without a device token returned HTTP 401.
- `prisma migrate status` reports the local database schema is up to date.
- `npm run build` compiled the production bundle, then stopped in TypeScript validation because the local Next.js package is incomplete (`next/types.d.ts` is missing). A successful production build is not verified.
- Live one-time pairing and sale synchronization have not been performed.
- `npm ci` from the Online ERP folder was attempted but did not complete; its partial `node_modules` is not usable, and Next build could not start. Re-run `npm ci --prefix apps/online-erp`, then both builds and local startup checks.
- The dependency list was corrected for shared packages' new relative location. The local npm cache lacks one platform-specific Tailwind package, so lockfile regeneration/install also awaits registry access.
- `start-cloud-apps.ps1` now opens only the full-stack Online ERP on port 3000; `stop-cloud-apps.ps1` stops that listener.
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
- No production database or sales data was changed. The local development database received the four migrations listed above.

## Remaining Boundary Work

- Restore a complete Online ERP dependency installation, then rerun production build and type checking.
- Verify live POS pairing and an offline sale upload against a disposable database before claiming sync is verified.
- Review production migration state and take a verified backup before deploying the local migrations to production.
- Mobile emergency POS, explicit source attribution, local printer configuration sync, station-split kitchen tickets, and offline printer queues are not complete.
- Unify POS enrollment with print-agent enrollment and integrate POS checkout kitchen tickets with the bundled agent; keep manual receipt printer selection available.

## Next Work

1. Restore complete ERP dependencies and confirm an independent production build of the full-stack app.
2. Exercise device pairing and full offline-sale synchronization against a disposable PostgreSQL database.
3. Continue with touch-first mobile POS and dynamic station ticket routing/offline printing.

## Printer Routing Update (2026-11-05)

- The ERP printing page now provides an editable category-to-printer selector, scoped to a selected branch and the branch's enabled kitchen/bar printers.
- Added a manager-only API endpoint at `/api/printing/category-routes` to read and save routes. Existing product route precedence remains unchanged; branch category routes are considered next, then the default kitchen printer.
- Added an additive migration for branch-scoped category mappings. Existing category mappings are retained as legacy global rows and only apply when the mapped printer belongs to the invoice branch.
- The branch-scoped category migration was applied to the local development database with the other pending migrations. ERP production build type-checking remains blocked by the incomplete local Next.js installation; production database state is unchanged.

## POS Discounts and Coupons Update (2026-11-05)

- Removed the supervisor username/PIN prompt from the Windows cashier. Manual discounts remain limited by the cashier's synchronized discount permission and require a reason; the cashier cannot exceed its offline policy.
- Added coupon codes to ERP discount campaigns, with optional global usage limits, SQLite bootstrap caching, offline cashier coupon entry, local validity checks, and server-side sale validation/redemption during sync. Coupon use counts are retained locally when a bootstrap snapshot is older than an offline redemption.
- Windows POS bootstrap only downloads active, current, full-order coupons. Product/category-scoped discount campaigns are excluded because the desktop cashier currently does not calculate item-scoped campaign totals.
- Windows Cashier production build passed after syncing its installed shared-types declaration with the workspace package. ERP Prisma generation and build were not verified because the Prisma CLI is unavailable in `apps/online-erp/node_modules`.
- Cash shifts and post-checkout invoice editing remain available in the existing Online ERP cashier but have not yet been brought into the Windows cashier. Local cash-shift reconciliation and safe offline invoice amendment/cancellation require explicit durable sync contracts; completed local sales are not silently editable.
