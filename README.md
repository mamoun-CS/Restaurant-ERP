# Restaurant ERP — two cloud apps

Open `apps/online-erp` for the Online ERP and `apps/api` for the Backend API. Both run independently; the cashier remains separately installable in `apps/desktop-pos`. Shared contracts live in `packages/`, and the PostgreSQL schema/migrations remain in `apps/online-erp/prisma`.

## Run locally (PowerShell)

Install cloud dependencies from the ERP app manifest (the API uses this same dependency installation during the current monorepo phase):

```powershell
npm ci --prefix apps/online-erp
Copy-Item apps/online-erp/.env.example apps/online-erp/.env
Copy-Item apps/api/.env.example apps/api/.env
./start-cloud-apps.ps1
```

If the lockfile changed with the app manifest, run `npm install --prefix apps/online-erp` once instead of `npm ci` to refresh it; then use `npm ci` for repeatable installs.

Set `ONLINE_ERP_API_URL=http://localhost:3010` in `apps/online-erp/.env`. Set `DATABASE_URL` in `apps/online-erp/.env`, and `DATABASE_URL` plus `AUTH_SECRET` in `apps/api/.env`; both database URLs should reference the existing PostgreSQL database. The API serves POS, order, permissions, and print handlers; ERP `/api/*` calls are proxied to it. Login/session endpoints stay in the ERP app to preserve its cookie authentication. Database migrations are run from the ERP app, which owns the existing schema. To run one app only, use `npm run dev --prefix apps/api` (port 3010) or `npm run dev --prefix apps/online-erp` (port 3000). Stop both with `./stop-cloud-apps.ps1`.

For desktop POS work, follow `apps/desktop-pos/README.md`. It uses local SQLite and can check out while offline.

See `docs/REBUILD-STATUS.md` for verified results and remaining deployment/integration checks.
