# Sheikh Al Kar Restaurant ERP / POS

A responsive bilingual restaurant ERP and cashier system for **شيخ الكار**. The app is built with Next.js, TypeScript, Tailwind CSS, PostgreSQL, and Prisma, and covers the daily workflows needed to manage restaurant sales, catalog data, cashiers, invoices, and reporting.

## ERP Features

- **Role-based access**: administrator and cashier login flows with protected routes.
- **Admin dashboard**: revenue KPIs, sales overview, top products, recent invoices, and quick actions.
- **Touch-first POS**: fast cashier interface for browsing products, filtering categories, building carts, selecting sizes/addons, applying discounts, and completing cash payments.
- **Product catalog management**: products, Arabic/English product names, categories, SKU data, prices, active status, sizes, and addons.
- **Category management**: bilingual categories with active status and sort ordering.
- **Discount campaigns**: fixed or percentage campaigns that can target products or categories with date ranges.
- **Employee management**: admin/cashier users, branch assignment, active status, and role-aware navigation.
- **Invoices and receipts**: completed invoice list, invoice details, thermal receipt preview, and print-ready receipt layout.
- **Cashier sales history**: individual cashier sales summary and invoice history.
- **Reports**: sales trends, product performance, category share, revenue totals, and branch/category filters.
- **Branch-ready data model**: branches, users, invoices, and reports are structured for multi-branch restaurant operations.
- **Audit-ready schema**: audit log model for tracking entity actions and metadata.
- **Bilingual UI**: English and Arabic interface copy with RTL-friendly layouts.
- **Restaurant branding**: Sheikh Al Kar logo assets, favicon/app icon, metadata, and color tokens derived from `public/photo/restaurant.jpg`.

## Main Modules

| Module | Purpose |
| --- | --- |
| Dashboard | Operations snapshot for owners/managers. |
| POS | Cashier order taking and payment completion. |
| Products | Menu item setup with price, category, sizes, and addons. |
| Categories | Menu organization in English and Arabic. |
| Discounts | Campaign setup for products or categories. |
| Employees | Staff access and role management. |
| Invoices | Sales receipts and invoice history. |
| Reports | Revenue, category, and product performance insights. |
| Settings | Business profile, receipt, branding, notification, and security preferences. |

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Prisma 7
- PostgreSQL
- jose authentication helpers
- bcryptjs password hashing
- lucide-react icons

## Setup

1. Copy `.env.example` to `.env`.
2. Set a PostgreSQL connection string and a strong `AUTH_SECRET`.
3. Run `npm run db:generate`.
4. Run `npm run db:push`.
5. Run `npm run db:seed`.
6. Start the app with `npm run dev`.
7. Open `http://localhost:3000`.

Demo accounts use password `Demo123!`:

- Admin: `admin@noura.test`
- Cashier: `cashier@noura.test`

The interface can be evaluated with the demo credentials. Production CRUD and invoice APIs require PostgreSQL.

## Main Routes

- `/login` - secure role-aware login
- `/admin` - analytics dashboard
- `/admin/products` - product management
- `/admin/categories` - category management
- `/admin/discounts` - discount campaigns
- `/admin/employees` - employee management
- `/admin/invoices` - invoice history
- `/admin/reports` - sales reports
- `/admin/settings` - business and brand settings
- `/pos` - cashier POS interface
- `/my-sales` - cashier sales history
- `/invoice/[id]` - receipt preview and print

## Data Model Highlights

The Prisma schema includes:

- Branches
- Users with `ADMIN` and `CASHIER` roles
- Products, translations, sizes, and addons
- Categories
- Discount campaigns
- Invoices and invoice items
- Payments
- Audit logs

## Branding

The application uses the original Sheikh Al Kar logo at `public/photo/restaurant.jpg` as the primary color reference. Brand tokens are centralized in `src/app/globals.css` and exposed through Tailwind theme variables. Logo assets live in `public/brand`, and app metadata/icons are configured in `src/app/layout.tsx`, `src/app/icon.svg`, `src/app/apple-icon.svg`, and `src/app/manifest.ts`.

English and Arabic copy is stored in `src/i18n`.
