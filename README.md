# Sheikh Al Kar Restaurant ERP

A bilingual restaurant ERP and point-of-sale system for **Sheikh Al Kar / شيخ الكار**. The project supports manager administration, cashier sales, product and employee management, invoices, finance reporting, multi-currency payments, and cash register shift control.

The target users are restaurant managers, cashiers, and operations staff who need a single system for daily sales, cash drawer accountability, reports, and branch-aware administration.

## Key Features

- Authentication with protected manager and cashier routes.
- Role-based navigation for `ADMIN` and `CASHIER`.
- Admin dashboard with revenue, invoices, top products, and quick actions.
- Product, category, discount, employee, invoice, report, settings, and finance screens.
- POS interface with product filtering, cart management, sizes, addons, discounts, and checkout.
- Multi-currency invoice payments in ILS, USD, and JOD with stored exchange-rate snapshots.
- Cash register and shift management with opening counts, closing counts, carryovers, discrepancies, notifications, and reports.
- Supplier management, purchase invoices, supplier payments, purchase returns, and expense category approval rules.
- Official invoice numbering, invoice idempotency keys, expanded card/bank payment metadata, and standardized API errors for protected mutations.
- Shift expenses and shift returns APIs.
- Kitchen order creation for products marked as requiring preparation.
- Audit log model for sensitive actions.
- Arabic RTL and English LTR UI support.
- Responsive layout, mobile navigation drawer, mobile table cards, and print-safe CSS.

## Technology Stack

| Area | Technology |
| --- | --- |
| Frontend | Next.js 16.2.10 App Router, React 19.2.4, TypeScript |
| Styling | Tailwind CSS 4 via `src/app/globals.css` and shared utility classes |
| Backend | Next.js API route handlers |
| Database | PostgreSQL |
| ORM | Prisma 7.8.0 with `@prisma/adapter-pg` |
| Authentication | JWT cookie sessions with `jose`; password hashing with `bcryptjs` |
| Validation | `zod` |
| Icons | `lucide-react` |
| Charts | `recharts` |
| PDF/export | `pdf-lib`, `xlsx` |
| State | React local state and browser fetch calls |
| Testing | Lint/build checks currently; no dedicated test runner is configured |

## Architecture

- `src/app` contains App Router pages and API routes.
- `src/components` contains shared UI and feature pages.
- `src/lib` contains database, auth, finance, cash, and demo-data helpers.
- `prisma/schema.prisma` defines the database schema and generated Prisma client output.
- `prisma/seed.ts` seeds local branches, users, products, currencies, denominations, exchange rates, and a default register.

Authentication stores an `erp_session` HTTP-only cookie. Middleware in `src/proxy.ts` protects admin, POS, cash, invoice, and sales pages. Managers are routed to `/admin`; cashiers are routed to `/cash`, where they choose between opening a register and continuing an existing shift.

Sales data flows from POS to `/api/invoices`. The server verifies an open cashier shift, calculates invoice totals, stores independent payment rows, snapshots exchange rates, links the invoice to the shift, and creates a kitchen order when applicable.

More detail:

- [Architecture](docs/architecture.md)
- [Database](docs/database.md)
- [API](docs/api.md)
- [Cash Shifts](docs/cash-shifts.md)
- [Responsive Design](docs/responsive-design.md)
- [Deployment](docs/deployment.md)

## Folder Structure

```text
.
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
│   ├── brand/
│   └── photo/
├── src/
│   ├── app/
│   │   ├── api/
│   │   ├── admin/
│   │   ├── cash/
│   │   ├── login/
│   │   └── pos/
│   ├── components/
│   ├── generated/prisma/
│   ├── i18n/
│   └── lib/
├── docs/
├── .env.example
├── package.json
└── README.md
```

Generated folders such as `node_modules`, `.next`, and cache folders are intentionally omitted.

## Prerequisites

- Node.js compatible with Next.js 16. Node 20 LTS or newer is recommended.
- npm, because this project uses `package-lock.json`.
- PostgreSQL server.
- A terminal that can run Prisma and Next.js commands.

## Installation

```bash
npm install
cp .env.example .env
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

| Variable | Required | Purpose | Example | Default |
| --- | --- | --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string used by Prisma | `postgresql://postgres:postgres@localhost:5432/restaurant_erp?schema=public` | None |
| `AUTH_SECRET` | Required in production | JWT signing secret, minimum 32 characters | `replace-with-at-least-32-random-characters` | Local development fallback only |
| `APP_URL` | Yes for email flows | Public application URL | `https://erp.example.com` | `http://localhost:3000` in examples |
| `SMTP_HOST` | Password reset email | SMTP host | `smtp.example.com` | None |
| `SMTP_PORT` | Password reset email | SMTP port | `587` | None |
| `SMTP_SECURE` | Password reset email | Use TLS from connection start | `false` | None |
| `SMTP_USER` | Password reset email | SMTP username | `mailer@example.com` | None |
| `SMTP_PASSWORD` | Password reset email | SMTP password | `secret` | None |
| `SMTP_FROM_NAME` | Password reset email | Sender display name | `Sheikh Al Kar` | None |
| `SMTP_FROM_EMAIL` | Password reset email | Sender email | `no-reply@example.com` | None |

Never commit production secrets.

## Database Setup

The database engine is PostgreSQL. Prisma schema changes are applied locally with:

```bash
npm run db:migrate
```

Production deployments must use reviewed migrations:

```bash
npm run db:deploy
```

Generate the Prisma client:

```bash
npm run db:generate
```

Seed local data:

```bash
npm run db:seed
```

Main entities include `Branch`, `User`, `Product`, `Category`, `DiscountCampaign`, `Invoice`, `InvoicePayment`, `CashRegister`, `CashShift`, `Currency`, `ExchangeRate`, suppliers, purchase invoices, supplier payments, purchase returns, expense categories, inventory movements, shift denominations, shift expenses, returns, reports, notifications, kitchen orders, and audit logs.

## Running the Project

| Task | Command |
| --- | --- |
| Development | `npm run dev` |
| Production build | `npm run build` |
| Production start | `npm run start` |
| Lint | `npm run lint` |
| Prisma generate | `npm run db:generate` |
| Create/apply local migration | `npm run db:migrate` |
| Apply production migrations | `npm run db:deploy` |
| Seed database | `npm run db:seed` |

There is no configured `format`, `test`, or `e2e` script yet.

## Default Local Accounts

Seeded demo accounts use password `Demo123!`:

| Role | Email |
| --- | --- |
| Admin | `admin@noura.test` |
| Cashier | `cashier@noura.test` |

These are local-development accounts only.

## Roles and Permissions

| Role | Main Access |
| --- | --- |
| `ADMIN` | Admin dashboard, finance, products, categories, discounts, employees, invoices, reports, settings, cash management, exchange rates |
| `CASHIER` | Cash entry screen, POS, personal sales, cash shift opening and closing |

The current implementation has two roles. Chef, supplier, customer, and inventory-specific roles are not implemented as separate roles.

## Main Workflows

### Login

1. Open `/login`.
2. Sign in with an admin or cashier account.
3. Admins go to `/admin`.
4. Cashiers go to `/cash`.

### Add a Product

1. Sign in as admin.
2. Open `/admin/products`.
3. Use the add-product action.
4. Enter English and Arabic details, SKU, price, category, and status.

### Create a Sale

1. Sign in as cashier.
2. Open or continue a cash shift from `/cash`.
3. Go to `/pos`.
4. Add products to the cart.
5. Checkout.

### Open Cash Register

1. Open `/cash`.
2. Select `Open Cash`.
3. Count ILS, USD, and JOD denominations.
4. Confirm opening count.

### Close Cash Register

1. Open `/cash/close`.
2. Count actual cash.
3. Enter withdrawn and remaining denomination quantities.
4. Add a note when there is a discrepancy.
5. Finalize closing.

### Change Exchange Rates

1. Sign in as admin.
2. Open `/admin/cash`.
3. Select USD or JOD.
4. Enter the new fixed ILS rate.
5. Save. The old and new rate are recorded through `ExchangeRate` and audit logging.

## Cash Register and Shift Module

The cash register is branch-assigned and shared between employees, but only one open shift may exist for a register at a time.

The module supports:

- Opening shift denomination counts.
- Previous shift carryover reference.
- Handover discrepancy detection.
- ILS, USD, and JOD totals.
- Exchange-rate snapshots at opening, closing, and payment time.
- Cash, credit card, and bank payment separation.
- Shift expenses and returns.
- Expected cash calculation.
- Closing denomination counts.
- Withdrawn and remaining quantity validation.
- Shortage and overage detection.
- Manager notifications.
- Closing report storage.

## Multi-Currency Logic

- Base currency: ILS.
- Default accepted currencies: ILS, USD, JOD.
- Managers edit fixed USD-to-ILS and JOD-to-ILS rates.
- Every invoice payment stores its own exchange rate snapshot.
- Physical drawer cash is calculated separately from credit card and bank payments.
- Financial values use Prisma `Decimal` fields in the database schema.

## API Documentation

See [API documentation](docs/api.md). Major groups:

- `/api/auth/*`
- `/api/products`
- `/api/categories`
- `/api/discounts`
- `/api/employees`
- `/api/invoices`
- `/api/finance/*`
- `/api/cash/*`

## Reports and Printing

The app includes invoice receipt preview and print CSS. Shift reports are stored in `ShiftReport` records after closing. Global print CSS removes navigation and buttons, uses print-safe colors, avoids page breaks inside cards/rows, and keeps receipt thermal formatting for `.receipt-print`.

PDF and richer thermal shift-report rendering are partially prepared by dependencies and data models but not fully implemented as UI downloads yet.

## Responsive Design

Supported target sizes start at 320px wide and extend to desktop displays. The app uses:

- Off-canvas mobile sidebar with overlay and Escape close.
- Full-width mobile content containers.
- Wrapped header action areas.
- Controlled table scroll on tablet/desktop.
- Mobile card views for cash denomination and cash report tables.
- RTL-aware logical spacing utilities from Tailwind and CSS logical properties.
- Print-specific styles for reports and receipts.

See [Responsive Design](docs/responsive-design.md).

## Testing

Validated in this work:

```bash
npm run lint
npm run build
```

Current lint output contains warnings in existing finance files for unused imports. There are no lint errors.

Recommended future additions:

- Playwright viewport tests for `/login`, `/admin`, `/admin/products`, `/admin/cash`, `/cash`, `/cash/open`, `/cash/close`, and `/pos`.
- API integration tests for open shift, invoice creation, close shift, expense, and return flows.
- Visual regression snapshots for RTL and LTR.

## Deployment

The project is a standard Next.js application backed by PostgreSQL.

Production checklist:

1. Set production `DATABASE_URL`.
2. Set a strong `AUTH_SECRET`.
3. Run `npm install`.
4. Run `npm run db:generate`.
5. Apply schema changes with `npm run db:deploy`.
6. Run `npm run build`.
7. Run `npm run start` behind HTTPS.

No Dockerfile, process manager configuration, or hosting-provider config is currently included.

## Security

- Passwords are hashed with `bcryptjs`.
- Sessions are signed JWTs in HTTP-only cookies.
- Middleware enforces route-level role access.
- API handlers validate inputs with `zod`.
- Shift opening, closing, exchange-rate changes, invoices, expenses, and returns are calculated and recorded server-side.
- Sensitive cash actions write audit records.
- Production must use HTTPS and strong secrets.
- Auth, invoice creation, and cash open/close mutations include same-origin checks and in-memory rate limiting. Use Redis or another shared store for production rate limiting.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Database connection error | Confirm `DATABASE_URL`, PostgreSQL status, and database name. |
| Prisma client missing | Run `npm run db:generate`. |
| Tables missing | Run `npm run db:migrate` locally or `npm run db:deploy` in production. |
| No demo users | Run `npm run db:seed`. |
| Cash register already open | Close the existing shift or use `Continue Shift`. |
| Checkout redirects to open cash | The cashier does not have an open shift. Open cash first. |
| Exchange rate missing | Seed the database or configure rates in `/admin/cash`. |
| Build type issues after stale `.next` files | Stop dev server and rebuild; remove generated build output manually if needed. |
| RTL layout looks wrong | Use the language switch and verify `document.dir` changes to `rtl`. |

## Contribution Guidelines

Recommended conventions:

- Use short feature branches, for example `feature/cash-report-printing`.
- Keep Prisma schema changes reviewed and seeded when needed.
- Run `npm run lint` and `npm run build` before opening a pull request.
- Reuse existing components, routes, validation patterns, and CSS tokens.
- Do not commit `.env`, secrets, generated build output, or `node_modules`.

## License

No open-source license is included. Treat this project as private/proprietary unless a license file is added.
