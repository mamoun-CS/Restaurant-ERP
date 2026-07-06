# Restaurant ERP / POS System

A responsive bilingual restaurant management and cashier system built with Next.js, TypeScript, Tailwind CSS, PostgreSQL, and Prisma.

## Setup

1. Copy `.env.example` to `.env` and set a PostgreSQL connection string and a strong `AUTH_SECRET`.
2. Run `npm run db:generate`.
3. Run `npm run db:push`.
4. Run `npm run db:seed`.
5. Start with `npm run dev` and open `http://localhost:3000`.

Demo accounts use password `Demo123!`:

- Admin: `admin@noura.test`
- Cashier: `cashier@noura.test`

The interface can be evaluated without a database using these demo credentials. Production CRUD and invoice APIs require PostgreSQL.

## Main routes

- `/login` — secure role-aware login
- `/admin` — analytics dashboard
- `/admin/products`, `/categories`, `/discounts`, `/employees` — management
- `/admin/reports`, `/admin/invoices`, `/admin/settings`
- `/pos` — touch-first cashier interface
- `/my-sales` — cashier history
- `/invoice/[id]` — thermal receipt preview and print

Brand colors are centralized in `src/app/globals.css` and exposed through `src/config/theme.ts`. English and Arabic copy is stored in `src/i18n`.

