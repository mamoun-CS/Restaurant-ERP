# Cashier and Online ERP Architecture

## Two runtime applications

The local and hosted product uses two applications. The Windows Cashier is separately installed and works offline. The Online ERP is a full-stack Next.js application; its UI, authentication, management API, POS enrollment, bootstrap, and sales synchronization are served from one origin on port `3000`.

```text
apps/desktop-pos (Windows Cashier)
  Electron / SQLite / offline cashier credentials / local checkout / local printing
                  | HTTPS to the ERP origin on port 3000
                  | /api/v1/pos/* and /api/v1/sync/push
apps/online-erp (full-stack Online ERP)
  Next.js UI and API routes / PostgreSQL Prisma schema and migrations / print agent
  canonical API handlers: src/lib/backend-api/route-handlers
                  | Prisma
              Existing PostgreSQL database

packages/shared-types
packages/shared-validation
packages/shared-business-logic
```

The Online ERP route adapters are generated from the canonical handlers by `npm run api:routes`. The compatibility route tree under `apps/api` imports the same handlers; it is not required for the two-application local run. Do not start a second Next.js process for the normal ERP and cashier workflow.

## Shared packages (Phase A)

- `@restaurant/shared-types` defines platform-neutral DTOs used by Electron IPC and cloud device contracts. It has no runtime dependency.
- `@restaurant/shared-validation` defines the offline sale upload schema; both the cashier sync worker and cloud API validate the same payload, including arithmetic reconciliation.
- `@restaurant/shared-business-logic` contains pure integer-minor-unit sale-total and discount-limit functions, used by local checkout and server acceptance.

Shared packages remain independent of Electron, Next.js, Prisma, and SQLite. Cloud-only rules such as device revocation and authorization run in the ERP API handlers. The cashier enforces its last signed policy snapshot so checkout remains offline-capable.

## Windows cashier trust boundary

Electron main owns the SQLite database, persistent device credentials, synchronization, and local printer access. The renderer uses a narrow typed preload bridge; it has no direct filesystem, SQL, or Node access. Local data lives under Electron `userData`, outside the installation directory, so installer upgrades do not replace it. Checkout persists the order, items, payments, inventory movements, audit event, receipt, and outbox record before printing or cloud synchronization.

## Database and verification state

PostgreSQL schema and migrations are owned by Online ERP. On 2026-11-05, four pending migrations were applied to the configured local development database at `localhost:5432`: print-device telemetry, printer connection type, branch-scoped category routing, and offline POS devices. The migrations added columns/tables and adjusted a unique index; they did not delete application rows. Production schema state has not been checked or changed.

The local ERP login endpoint `/api/auth/login` and cashier device/sync endpoints are available on port `3000`. Both seeded demo users were found active in the local database, and the stored hashes match `Demo123!`. The backend login flow succeeds for both roles after the local migrations. This does not provision the separate offline cashier PIN; an administrator must set and assign that PIN under POS Devices.

The Online ERP dev server and selected API flows were verified locally. A production build compiled but its TypeScript phase is blocked by an incomplete local Next.js installation missing `next/types.d.ts`; build/deploy readiness remains unverified. Device pairing with a live code, actual sale synchronization, and production deployment have not been exercised in this checkout.
