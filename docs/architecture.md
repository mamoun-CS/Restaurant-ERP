# Target Architecture

## Current repository

This repository is a Next.js 16 / React 19 / TypeScript restaurant ERP. The same Next.js deployment currently serves the admin UI and REST-style route handlers. Prisma 7 connects that application to PostgreSQL. The schema includes branches, users, products and translations, categories, discount campaigns, invoices and line snapshots, multi-currency payments, inventory movements, cash shifts, financial controls, and printing configuration/jobs. Keep those features and their history; the desktop work is an additional independently deployable application, not a replacement for the ERP.

The POS UI in `src/components/pos-page.tsx` currently runs in a browser. Its offline implementation in `src/lib/offline` uses Dexie/IndexedDB for cached products and categories, completed sale snapshots, and a durable sync queue. It can save and print a sale offline, then retry an upload using a client transaction ID. It is not a Windows desktop application and still requires a browser to launch. The cloud invoice endpoint has a serializable database transaction and idempotency lookup. The separate `src/lib/cloud-sync.ts` concerns local-vs-cloud PostgreSQL database replication; it is not the desktop synchronization protocol.

## Target deployment boundaries

```text
apps/desktop-pos (Electron main + React renderer + SQLite)
    | authenticated HTTPS, versioned device API; idempotent push / cursor pull
apps/backend (evolve existing Next.js route handlers behind a domain boundary)
    | Prisma
PostgreSQL

apps/admin-dashboard (existing Next.js admin experience, independently deployable)
```

The first practical backend choice is to retain Next.js route handlers and Prisma rather than introduce a second server framework over the existing large domain. Move API/domain ownership behind explicit modules as endpoints are added. Split the dashboard and backend into separately deployable apps only after shared server dependencies and routing are decoupled. Do not make the desktop talk to PostgreSQL or use the existing browser cookie session as a device credential.

## Desktop trust boundaries

Electron main owns SQLite, filesystem paths, device credentials, sync scheduling, and printing integrations. The renderer gets a narrow typed `contextBridge` API. Enable context isolation, disable Node integration, deny unexpected navigation and child windows, and load remote content only when explicitly required. The database belongs in Electron `app.getPath("userData")`, with versioned migrations and backups before schema upgrades. Renderer components must never receive a SQL API or filesystem access.

Shared domain and validation packages may contain platform-neutral DTOs, money arithmetic, and schemas. They must not import Electron, Prisma, or SQLite code. Local and cloud identifiers are UUIDs; money crosses the desktop boundary as integer minor units. The local write for an order, its lines/payments, inventory movement, audit event, and outbox queue entry is one SQLite transaction.

## Implementation sequence and deployment

1. Preserve the current ERP and record its schema/business rules; establish versioned API/device identity and audit contracts.
2. Introduce desktop shell and SQLite schema with atomic offline checkout, receipt rendering/printing, and local catalog access.
3. Add device registration, provisioned offline cashier authentication, permissions, discount limits, and supervisor approvals.
4. Add API sync push/pull/ack with idempotent transaction acceptance and movement-based inventory.
5. Move existing browser POS workflows onto the desktop only after parity and migration export/import are available.

The cloud stays PostgreSQL-backed. Desktop installer updates must preserve `%APPDATA%` user data. Cloud services can use the existing PostgreSQL Compose deployment; the desktop installer is built and released separately. Details and unresolved implementation gates are in the other documents in this directory.

## Existing application structure and preserved workflows

- App Router pages and protected admin/cashier routes live in `src/app`; feature screens and responsive shell live in `src/components`; finance, cash, auth, printing, and offline helpers live in `src/lib`.
- `/api/auth/login` issues an HTTP-only `erp_session` cookie. `src/proxy.ts` protects admin, POS, cash, invoice, and sales pages. Admin and cashier roles remain part of the current cloud dashboard.
- The browser POS writes to `/api/invoices`; invoice, items, payment rows, kitchen order, print jobs, and shift linkage are managed by existing ERP logic. Cash shift opening/closing and financial reports remain in the cloud ERP.
- Existing capabilities to preserve include Arabic/English UI, product and category management, campaigns, customer and invoice records, multi-currency payment data, supplier/purchase/expense/payroll flows, audit logging, and the separate Nova Print Agent workflow.
- `prisma/schema.prisma` and `prisma/migrations` remain the PostgreSQL schema and migration history. The existing printing/API/deployment documentation is still relevant to the web ERP.

The current admin UI and REST handlers still deploy together as one Next.js application. The desktop app is separate, but the requested separately deployed backend/admin split has not yet been executed; first isolate their shared server-side domain logic and API contracts, then separate deployment artifacts without dropping existing routes.
