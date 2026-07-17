# API Documentation

All protected endpoints use the `erp_session` cookie. State-changing authenticated requests validate same-origin `Origin`/`Referer` headers and return standardized errors:

```json
{ "success": false, "code": "INVALID_INPUT", "message": "Invalid input.", "details": {} }
```

## Auth

| Endpoint | Method | Role | Purpose |
| --- | --- | --- | --- |
| `/api/auth/login` | `POST` | Public | Sign in and set session cookie |
| `/api/auth/logout` | `POST` | Authenticated | Clear session |

## Catalog

| Endpoint | Methods | Role | Purpose |
| --- | --- | --- | --- |
| `/api/products` | `GET`, `POST` | Authenticated/Admin for writes | Product list and creation |
| `/api/products/[id]` | `PATCH`, `DELETE` | Admin | Product updates |
| `/api/categories` | `GET`, `POST` | Authenticated/Admin for writes | Category list and creation |
| `/api/categories/[id]` | `PATCH`, `DELETE` | Admin | Category updates |
| `/api/discounts` | `GET`, `POST` | Authenticated/Admin for writes | Discount campaigns |
| `/api/discounts/[id]` | `PATCH`, `DELETE` | Admin | Discount updates |
| `/api/employees` | `GET`, `POST` | Admin | Employee management |
| `/api/employees/[id]` | `PATCH`, `DELETE` | Admin | Employee updates |

## Sales

| Endpoint | Method | Role | Purpose |
| --- | --- | --- | --- |
| `/api/invoices` | `GET` | Authenticated | List invoices; cashiers see their own |
| `/api/invoices` | `POST` | Cashier | Create invoice, payment rows, and kitchen order |

Important invoice `POST` fields: `items`, `discountAmount`, `payments`, `orderType`, optional `registerId`, optional `idempotencyKey`, and optional `clientTransactionId`.

Retrying the same successful invoice request returns the existing invoice. Card rows require a card type plus a transaction reference or POS terminal reference.

## Suppliers and Purchases

| Endpoint | Methods | Role | Purpose |
| --- | --- | --- | --- |
| `/api/suppliers` | `GET`, `POST` | Admin | Supplier list and creation |
| `/api/suppliers/[id]` | `GET`, `PATCH`, `DELETE` | Admin | Supplier detail, update, soft delete |
| `/api/purchases` | `GET`, `POST` | Admin | Purchase invoices; confirmed purchases update supplier balance, product cost history, and inventory movements |
| `/api/supplier-payments` | `GET`, `POST` | Admin | Supplier payments and purchase invoice paid/remaining status |
| `/api/purchase-returns` | `GET`, `POST` | Admin | Purchase returns with quantity validation |
| `/api/expense-categories` | `GET`, `POST` | Admin | Manage expense categories and approval rules |
| `/api/expense-categories/[id]` | `PATCH`, `DELETE` | Admin | Update or disable expense categories |

## Cash

| Endpoint | Method | Role | Purpose |
| --- | --- | --- | --- |
| `/api/cash/settings` | `GET` | Authenticated | Branches, registers, currencies, denominations |
| `/api/cash/settings` | `PATCH` | Admin | Change USD/JOD exchange rate |
| `/api/cash/shifts/current` | `GET` | Cashier | Current shift, registers, rates, carryover |
| `/api/cash/shifts/open` | `POST` | Cashier | Open register with denomination counts |
| `/api/cash/shifts/close` | `POST` | Cashier | Close shift with counts, withdrawals, carryover, discrepancy |
| `/api/cash/shifts` | `GET` | Authenticated | Manager or personal shift list |
| `/api/cash/expenses` | `POST` | Authenticated | Record shift expense |
| `/api/cash/returns` | `POST` | Cashier | Record shift return/refund |

## Finance

Finance endpoints live under `/api/finance/*` for summary, expenses, ingredients, payroll, recipes, reports, and export.
