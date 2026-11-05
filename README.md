# Restaurant ERP — Cashier and Online ERP

The product has two applications:

- **Windows Cashier** — installable Electron app with SQLite, offline checkout, local printing, and automatic sync.
- **Online ERP** — full-stack Next.js app with UI, authentication, management APIs, POS pairing, catalog bootstrap, and sale sync, all served on port `3000`.

## Run Online ERP locally (PowerShell)

```powershell
npm ci --prefix apps/online-erp
Copy-Item apps/online-erp/.env.example apps/online-erp/.env
npm run dev --prefix apps/online-erp
```

Configure `DATABASE_URL` and `AUTH_SECRET` in `apps/online-erp/.env` for the existing PostgreSQL database. The cashier connects to the ERP origin, such as `http://localhost:3000`; it does not need a separate API port. The API compatibility route tree under `apps/api` is not required for the normal two-app workflow.

For Windows Cashier setup and packaging, follow [apps/desktop-pos/README.md](apps/desktop-pos/README.md). Its local database remains in Electron `userData` so application upgrades preserve offline sales.

See [docs/REBUILD-STATUS.md](docs/REBUILD-STATUS.md) for current verification results and remaining deployment checks.
