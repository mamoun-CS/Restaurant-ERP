# Cashier and Online ERP Architecture

## Required product boundary

The target is two independent products backed by one cloud API and one PostgreSQL database. Independent API and Online ERP Next targets now build from the monorepo; the cashier has a separate Electron build. Container deployment and DB-backed integration gates remain unverified:

```text
apps/cashier (current path: apps/desktop-pos)
  Electron main / React renderer / SQLite / offline auth / local checkout / local printing
                  | HTTPS device API; cashier session API; sync contracts
Online ERP (current source path: repository root)
  Next.js admin, finance, employee, reporting, printing management, and mobile emergency POS
                  | HTTPS, cookie or token auth according to client
apps/api (separate Next.js runtime; transitional shared server helpers remain in root src/lib)
  Authentication / authorization / product / order / device / printing modules
                  | Prisma
              Existing PostgreSQL database

packages/shared-types
packages/shared-validation
packages/shared-business-logic
```

The cashier remains at `apps/desktop-pos` during migration to preserve installer configuration and the stable SQLite location. API handlers have been extracted into `apps/api/src/modules/route-handlers`; 72 root API route files re-export the same handlers for compatibility. The API has its own Next app and standalone output. The Online ERP source remains at the repository root; `Dockerfile.online-erp` and `npm run online-erp:build` produce a separate standalone target that rewrites `/api/*` to `ONLINE_ERP_API_URL`. This keeps UI/API server processes separate without copying or reimplementing the existing ERP UI. Both cloud targets are built from the monorepo and still use root Prisma/schema and server helpers where needed. Container images and PostgreSQL-backed flows have not been verified yet. Do not create a second cloud database or remove existing compatibility routes during rollout.

## Shared packages (Phase A)

- `@restaurant/shared-types` defines platform-neutral DTOs used by Electron IPC and cloud device contracts. It has no runtime dependency.
- `@restaurant/shared-validation` defines the offline sale upload schema; both the cashier sync worker and cloud API validate the same payload, including arithmetic reconciliation.
- `@restaurant/shared-business-logic` contains pure integer-minor-unit sale-total and discount-limit functions, used by local checkout and server acceptance.

Shared packages must remain independent of Electron, Next.js, Prisma, and SQLite. Cloud-only rules such as current device revocation and authorization still run on the API. The cashier also enforces the last signed policy snapshot so checkout remains offline-capable.

## Windows cashier trust boundary

Electron main owns the SQLite database, persistent device credentials, synchronization, and local printer access. The renderer uses a narrow typed preload bridge; it has no direct filesystem, SQL, or Node access. Local data lives under Electron `userData`, outside the installation directory, so installer upgrades do not replace it. Checkout persists the order, items, payments, inventory movements, audit event, receipt, and outbox record in a single SQLite transaction.

The Windows cashier never connects to PostgreSQL. It uses device-authenticated HTTPS endpoints, caches catalog and signed cashier policy data, and uploads immutable sales with UUID idempotency keys. If cloud access is unavailable, the cashier can use the last downloaded catalog and authorization snapshot until the configured offline expiry.

## Online ERP and emergency mobile POS

The existing Next.js ERP remains the authoritative online application while extraction proceeds. It currently has browser login, role checks, dashboard and finance screens, products/categories/employees/discounts, cash shifts, invoice/order APIs, reports, and printer administration. The browser cashier already uses the cloud invoice API and records orders in PostgreSQL without requiring the Windows app.

The dedicated mobile emergency POS is not yet implemented as a separately named surface. It must authenticate an authorized employee, use the shared cloud order API, mark its transaction source/device, and make the internet requirement visible. It must not depend on local SQLite or the Windows app. Existing `/pos` functionality is a reusable starting point, but it needs a dedicated touch-first workflow and server-side cashier authorization before it satisfies this requirement.

## Printing assessment

Retain `print-agent/`: it is a separate Windows TypeScript process for printer and cash-drawer work. The ERP already has printer pairing, device APIs, printer configurations, category/product routes, a durable print-job model with idempotency and retry state, admin printer controls, and invoice print-job creation. The database already supports a dynamic number of printer configurations and category/product assignments.

The printer routing foundation is therefore reusable and does not need a fixed three-printer limit. Remaining work includes ensuring category/product routes produce station-specific kitchen tickets, defining fallback behavior for unassigned products, synchronizing printer configuration to the Electron cashier for offline tickets, and verifying that reprints and errors remain auditable. Shawarma, Broast, Burger, and a future Barista station are configuration data, never hard-coded application branches.

## Order sources and identity

Orders need stable UUID/idempotency identifiers and explicit sources: `WINDOWS_POS`, `MOBILE_POS`, or `ONLINE_ERP`, plus cashier and optional device identifiers. Existing invoices already have `idempotencyKey` and `clientTransactionId`; the offline sync path uses those fields. The existing browser invoice flow and cloud schema need source metadata before all three origins can be reliably reported and audited. Any schema change must be additive and preceded by duplicate/data preflight; do not modify production data as part of source-code work.

## Extraction and deployment sequence

1. Define shared contracts and logic while retaining all current routes (done for offline sale sync contracts).
2. Extract API handlers behind a separately runnable API app; keep compatibility routes in the existing Next app during cutover (separate builds and local HTTP routing verified; container and DB-backed parity remain to verify).
3. Keep the root Next UI as source during this migration stage, build it as its own target, and route API traffic to the independent backend. Move source into `apps/online-erp` after shared auth/session/server imports are disentangled and verify container deployment.
4. Implement and test mobile emergency POS using cloud-side order creation.
5. Complete dynamic station ticket routing and local/offline printer configuration sync.
6. Add order-source reporting, end-to-end sync/printing tests, and separate deployment pipelines.

See `docs/REBUILD-STATUS.md` for current phase and `docs/MIGRATION-PLAN.md` for data safety gates.
