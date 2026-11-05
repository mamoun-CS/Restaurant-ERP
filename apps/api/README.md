# Backend API

This folder contains the independent Next.js API runtime and its route handlers. POS pairing/bootstrap/sync, ERP auth, order management, discounts/permissions, and printing configuration/jobs are served here. API source currently imports the existing auth/Prisma helpers from `apps/online-erp/src` to preserve the current business behavior while extraction continues.

From the repository root, install dependencies and set the existing database and session secrets in `apps/online-erp/.env`:

```powershell
npm ci --prefix apps/online-erp
npm run postinstall --prefix apps/api
npm run dev --prefix apps/api       # http://localhost:3010
npm run build --prefix apps/api
```

Set the API's own `DATABASE_URL` and `AUTH_SECRET` in `apps/api/.env`; point `DATABASE_URL` at the existing PostgreSQL database configured for the ERP.

For the Online ERP, set `ONLINE_ERP_API_URL=http://localhost:3010` and run `npm run dev --prefix apps/online-erp` (port 3000). Login/session endpoints stay in the ERP origin so its current cookie-based page authentication continues to work; other `/api/*` calls are forwarded to this backend.

The existing PostgreSQL schema and migrations live in `apps/online-erp/prisma`. This API does not create or replace a database. Do not apply migrations without the documented backup and rollout gates.
