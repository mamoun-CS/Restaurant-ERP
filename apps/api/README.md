# Backend API application

This is a separate Next.js API runtime using the existing PostgreSQL database. Route handler implementations live in `src/modules/route-handlers`; the `src/app/api` files expose those handlers as HTTP routes. POS devices/bootstrap/sync, invoice/order management, discounts, cash permissions, products, and printer configuration/jobs are included. Shared Prisma/auth/printing domain helpers are still imported from the legacy root `src/lib` and `src/generated` during this extraction stage; the API build packages only the modules it uses into its standalone output.

The root `src/app/api/**` files are compatibility adapters importing the same handler modules. They preserve existing URLs for the legacy ERP deployment and do not duplicate business logic. `scripts/generate-api-route-adapters.mjs` regenerates the API route table after adding/changing a backend module.

From the repository root, install dependencies and generate the Prisma client once, then run:

```powershell
npm run api:dev
npm run api:build
npm run api:start
```

Copy this directory's `.env.example` to `.env` for local development. Production builds to a standalone Next.js server. The container target is `apps/api/Dockerfile`, built from the repository root so it can include shared packages, Prisma schema/client, and the transitional server modules. Configure its `DATABASE_URL` for the existing PostgreSQL database; no database is created by this application.

## Online ERP integration

The Online ERP source remains at the repository root during the safe migration. Build it as a separate deployment with `ONLINE_ERP_API_URL` set to the internal or public API origin:

```powershell
$env:ONLINE_ERP_API_URL = "https://api.example.com"
npm run online-erp:build
```

The Next.js `beforeFiles` rewrite forwards `/api/*` to that API origin. Leave the variable unset only for the legacy all-in-one ERP deployment. `docker-compose.separated.yml` builds separate API and Online ERP containers and expects `API_DATABASE_URL` to point to the existing PostgreSQL host as reachable from the API container.
