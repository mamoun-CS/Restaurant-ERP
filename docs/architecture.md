# Architecture

This project is a Next.js App Router application with API routes and server-side Prisma access.

## Frontend

- Pages live in `src/app`.
- Feature screens live in `src/components`.
- Shared layout is `src/components/app-shell.tsx`.
- Language state is provided by `src/components/language-provider.tsx`.
- English and Arabic dictionaries live in `src/i18n`.
- Styling is centralized in `src/app/globals.css` with Tailwind CSS 4 theme tokens.

## Backend

API routes live under `src/app/api`. They use:

- `zod` for request validation.
- `src/lib/auth.ts` for JWT verification.
- `src/lib/db.ts` for Prisma access.
- `src/lib/cash.ts` for shift and currency calculations.

## Authentication and Permissions

`/api/auth/login` verifies a user, signs a JWT, and stores it in the `erp_session` HTTP-only cookie. `src/proxy.ts` protects route groups:

- `/admin/*` requires `ADMIN`.
- `/cash/*`, `/pos`, and `/my-sales` require `CASHIER`.
- `/invoice/*` requires an authenticated session.

## Sales and Shift Flow

1. Cashier signs in and lands on `/cash`.
2. Cashier opens or continues a shift.
3. POS calls `/api/invoices`.
4. The server verifies an open shift.
5. Invoice, invoice items, payment components, and kitchen order are created in one transaction.
6. Shift closing calculates expected cash from opening counts, cash payments, expenses, returns, and withdrawals.

## Responsive Layout

The shell uses an expanded desktop sidebar and off-canvas mobile drawer. Global CSS prevents page-level horizontal overflow, while tables use contained scroll or mobile card layouts where financial comparison is not required.
