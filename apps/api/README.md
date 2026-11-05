# Backend API Compatibility Surface

For the normal two-application workflow, run the full-stack Online ERP with:

```powershell
npm run dev --prefix apps/online-erp
```

The ERP UI and API share one Next.js process on port `3000`. The Windows Cashier uses this same ERP origin for pairing, catalog bootstrap, and sale synchronization under `/api/v1`.

Canonical API handlers are maintained in `apps/online-erp/src/lib/backend-api/route-handlers`. `npm run api:routes --prefix apps/online-erp` generates route adapters for the ERP and this compatibility app. This folder remains for compatibility and staged deployments; it is not a third application the cashier needs to connect to.

PostgreSQL schema and migrations are owned by `apps/online-erp/prisma`. Configure the ERP's `.env` with the existing `DATABASE_URL` and `AUTH_SECRET`; do not point these apps at different databases or secrets. Production migration rollout requires a verified backup and review of the pending migrations.
