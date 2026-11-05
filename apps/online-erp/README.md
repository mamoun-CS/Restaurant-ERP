# Online ERP

This folder contains the Online ERP Next.js application, its PostgreSQL Prisma schema and migrations, environment examples, printing agent, and deployment files. It calls the separate API application through `ONLINE_ERP_API_URL`.

From the repository root, install the cloud dependencies once:

```powershell
npm ci --prefix apps/online-erp
Copy-Item apps/online-erp/.env.example apps/online-erp/.env
```

Then run either cloud app independently:

```powershell
npm run dev --prefix apps/api
npm run dev --prefix apps/online-erp
```

Configure `DATABASE_URL` here and `DATABASE_URL` plus `AUTH_SECRET` in `apps/api/.env`; both URLs should point to the same existing PostgreSQL database. Configure `ONLINE_ERP_API_URL=http://localhost:3010` so ERP API requests reach the backend. Schema and migration files remain under this app's `prisma` directory; use `npm run db:deploy --prefix apps/online-erp` only during the planned database rollout.

The separately installable Windows Cashier is at `apps/desktop-pos` and uses SQLite for offline checkout.
