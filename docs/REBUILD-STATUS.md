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
- Post-checkout invoice editing remains available in the existing Online ERP cashier but has not yet been brought into the Windows cashier. Safe offline invoice amendment/cancellation still requires an explicit durable sync contract; completed local sales are not silently editable.

## Offline Cash Shift Update (2026-11-06)

- Connected the existing SQLite `cash_register_sessions` table to the Windows Cashier. A cashier can open a shift with an opening balance and close it with a counted balance while offline.
- Completed local cash sales are linked to the currently open local shift. Closing calculates expected cash (opening balance plus local sale totals) and records the actual counted amount and variance in the local audit log.
- The cashier checkout UI requires an open local shift. Shift state and audit data survive application restarts because they are stored in the app's SQLite user-data database.
- Limitation: local shift open/close summaries are not yet synchronized into Online ERP CashShift reports; the existing sales sync contract does not carry local shift lifecycle records. No cloud reconciliation is claimed in this update.
- `npm run build` and `npm run package:windows` completed successfully; `npm run native:verify` loaded better-sqlite3 in Electron. The updated installer is `apps/desktop-pos/release/Restaurant-POS-Setup.exe` (131,512,082 bytes). The open/close reconciliation flow has not yet had a manual in-app run-through on an installed cashier.

## POS Admin and Order Confirmation Update (2026-11-06)

- Added an Arabic/English order confirmation dialog before local checkout. It captures customer name and phone, dine-in/takeaway/delivery, delivery address when relevant, and order notes. Delivery confirmation requires a name, phone, and address.
- Added an additive SQLite migration for those order fields. Offline sales retain the confirmation details; the existing sale-sync payload now carries them into ERP invoices and kitchen orders when the device reconnects.
- Card payment is visibly unavailable in this dialog because this device has no configured card terminal; the implemented payment choice remains cash.
- Added a supervisor-protected local admin panel for local recent sales, pending sync, catalog, printer, and diagnostics shortcuts. Added an isolated in-app Online ERP window for full ERP administration; it uses the configured server, has a separate persistent browser session, and restricts top-level navigation to the ERP origin. Online ERP retains its existing login and role authorization.
- The desktop production build passed after these changes. The Online ERP production build compiled but could not complete TypeScript validation in this checkout because the installed Next.js package has no declaration for `next/types.js`; this is an environment/dependency issue at `.next/dev/types/validator.ts`, so ERP build completion is not claimed.
- Desktop `npm run build` and direct `electron-builder --win nsis` packaging completed successfully. The installer is `apps/desktop-pos/release/Restaurant-POS-Setup.exe` (131,515,673 bytes). Confirmed that the packaged ASAR contains migration `002-order-confirmation.sql`, the main process, and the new renderer bundle. The order-confirmation and admin flows have not yet had an installed-app manual run-through.

## Cashier Sync Troubleshooting (2026-11-06)

- The sync warning in the cashier header now opens Device Check directly when selected.
- Diagnostics list pending/failed local receipts, retry count, next retry time, and each receipt-level sync error, alongside the most recent connection/server error.
- Manual “Sync now” retries permanently failed sales by returning them to the queue. Automatic retries remain enabled for transient errors.
- `npm run build` passed for the desktop cashier. The installer was rebuilt; sync behavior has not yet been manually exercised against a live server.

## Offline POS Administrator PIN (2026-11-06)

- POS Devices now lists active ERP Admin and Cashier accounts for offline PIN setup. The administrator PIN is used in the cashier Admin panel and cannot sign in as a regular cashier; server-side role checks enforce this split.
- Admin and Cashier credentials can be assigned to a branch-compatible POS device. The POS bootstrap returns only assigned accounts with a configured, unexpired offline PIN.
- The PIN form can replace a PIN or update offline validity and discount policy without revealing/re-entering an existing PIN. Admin supervisor access is enforced by role.
- Added additive SQLite migration `003-offline-account-type.sql`; existing local orders and outbox data are preserved. New installs and existing installations apply the migration on launch.
- Desktop `npm run build` passed. ERP production compilation completed, but TypeScript validation remains blocked by the existing incomplete Next.js package declaration for `next/types.js` in `.next/dev/types/validator.ts`; production build success is not claimed.
- Cloud bootstrap/admin PIN entry has not been verified against a live ERP database in this run.
- Follow-up: Added a separate Admin access action on the cashier welcome screen so an offline ADMIN account can open its admin panel directly, without first signing in as a cashier. The regular cashier login continues to accept CASHIER accounts only. Desktop production build passed; installer rebuilt. No live server account bootstrap was exercised.

## Manual Sync Review and Approval (2026-11-06)

- Manual retry actions now open a review dialog before starting synchronization. It shows the configured cloud URL, local device ID, branch/register, pending sale count, receipt numbers and totals, and the last sync error.
- The dialog explains that completed local sales (items, totals, and cash payment details) will upload and the device will download the latest catalog, coupons, assigned offline account verifiers, and policies. It does not show or transmit a PIN/password in the review UI.
- Sync proceeds only after the user selects Continue; Cancel closes the dialog without triggering that manual retry. Automatic background retries continue as configured.
- Admin login help now explains that the account needs an offline PIN, assignment to the terminal in Online ERP → POS Devices, and a device sync. The login error points to the same recovery steps.
- Desktop production build passed. Installer packaging is being refreshed. Live ERP/account confirmation and actual sync were not exercised.
- Follow-up: POS bootstrap now returns a structured diagnostic detail in local development (production keeps a generic safe response), and the desktop displays server-provided error text for bootstrap and sale-push failures. This addresses the opaque `Catalog refresh failed (500)` shown in the sync review. Desktop build passed; authenticated bootstrap could not be exercised without using the user’s live device credentials.
- Follow-up: Sync-review server errors now render as a short summary with expandable, scrollable LTR technical details, preventing long stack traces from collapsing the dialog width. Desktop build and NSIS packaging passed.
- Offline receipt update: Reworked the Windows Cashier's completed-sale invoice to follow the Online ERP receipt layout, including the logo/brand, invoice number, date/time, cashier, branch/register when available, order type, customer/delivery details, line items, subtotal, discount, total, payment and tax footer. Arabic/English display follows the cashier language. The receipt uses an 80 mm thermal layout; print output hides the on-screen controls, and the existing PDF save action remains available. Desktop `npm run build` passed. Physical printer output and PDF Arabic rendering have not been visually verified in this environment.
- Admin offline-login recovery update: the cashier now distinguishes a missing device credential, inactive account, non-admin account, expired PIN, temporary lockout, and an incorrect PIN in its local login error. The admin sign-in panel includes a “Sync admin access from cloud” action that opens the existing review-and-approve sync dialog, so assigned PIN verifiers can be provisioned without navigating through separate diagnostics. Desktop `npm run build` passed. This UI requires an enrolled device and Online ERP connectivity to sync; no live admin credential was used for verification.
- Follow-up on admin account provisioning: confirmed manual “Sync now” previously honored the automatic five-minute catalog/bootstrap throttle, so it could upload sales successfully without downloading newly assigned admin PIN verifiers. Explicit sync now forces a fresh authenticated POS bootstrap (accounts, PIN verifiers, catalog and policies) before uploading queued sales; a bootstrap/sync error is surfaced to the UI rather than returned as success. Automatic sync retains its five-minute throttle. Desktop production build passed; live account provisioning remains unverified without using a live account.
- Follow-up diagnosis against this workstation: read-only checks confirmed the assigned Admin account is active, has a configured unexpired offline PIN, and is assigned to the enrolled device in the local ERP PostgreSQL database, while that device's SQLite contained only its cashier account. The installed app bundle matches the build that forces bootstrap. Added a post-sync account-state confirmation to the Admin sign-in panel, so after approval it explicitly reports whether the requested admin credential was actually provisioned. It does not read or display a PIN/hash. Desktop production build passed; the user-approved sync action has not been triggered by the agent.
- Follow-up: Fixed the local coupon catalog refresh failure. Prisma Client generation now runs through the package's direct Prisma CLI script (the Windows npm shim was absent), and the existing additive `20261105000000_discount_coupons` migration was applied to the local development database. A read-only Prisma query selecting `discountCampaign.couponCode` succeeded afterward. This migration adds coupon fields/indexes and does not delete existing rows. The Online ERP dev server was restarted on port 3000; live authenticated device bootstrap/sale synchronization was not exercised.
- Renamed the Device Check label from “Sales sync” to “Sales upload & sync” (Arabic: “رفع ومزامنة المبيعات”) to make the action clearer. The desktop production build passed after the label change; installer packaging is being refreshed.
