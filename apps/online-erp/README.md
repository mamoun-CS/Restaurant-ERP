# Online ERP

This folder contains the Online ERP Next.js application, its PostgreSQL Prisma schema and migrations, environment examples, printing agent, and deployment files. It is the full-stack Online ERP: the UI, login, management APIs, and cashier device/sync APIs are served from one Next.js process and one origin (`3000`), under `/api`.

From the repository root, install the cloud dependencies once:

```powershell
npm ci --prefix apps/online-erp
Copy-Item apps/online-erp/.env.example apps/online-erp/.env
```

Run the full-stack online system locally:

```powershell
npm run dev --prefix apps/online-erp
```

This starts the ERP Next.js server at port 3000. The cashier connects to this same origin for device enrollment, catalog bootstrap, and sale sync through `/api/v1/*`; there is no second listening port. The Windows Cashier remains independently installed and uses local SQLite when offline. Schema and migration files remain under this app's `prisma` directory; use `npm run db:deploy --prefix apps/online-erp` only during the planned database rollout.

The separately installable Windows Cashier is at `apps/desktop-pos` and uses SQLite for offline checkout.
# Printer routing

Administrators can assign each product category to an enabled kitchen or bar printer from **Settings → Printing → Printer Routing**. Assignments are branch-specific; product-level routes still take precedence, followed by category routes, then the branch's default kitchen printer. Choosing the default option removes the branch override. Legacy category routes without a branch remain in the database and are used only when their printer belongs to the invoice branch.

Apply the additive migration with `npm run db:deploy` before using branch-specific mappings, then regenerate Prisma with `npm run db:generate` as part of the app install/build workflow.
