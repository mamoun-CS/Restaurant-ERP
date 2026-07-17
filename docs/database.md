# Database

The database is PostgreSQL managed through Prisma.

## Main Models

- `Branch`: store branch.
- `User`: employee account with `ADMIN` or `CASHIER` role.
- `Category`, `Product`, `ProductTranslation`, `ProductSize`, `ProductAddon`: menu catalog.
- `DiscountCampaign`: fixed or percentage discounts.
- `Invoice`, `InvoiceItem`, `InvoiceItemAddon`: sales records.
- `Payment`: legacy single payment relation.
- `InvoicePayment`: independent payment components with currency and exchange-rate snapshots.
- `Supplier`, `PurchaseInvoice`, `PurchaseInvoiceItem`, `SupplierPayment`, `PurchaseReturn`: supplier purchasing, supplier debts, and purchase returns.
- `PurchasePriceHistory`, `InventoryMovement`: purchase cost snapshots and stock movement audit trail.
- `ExpenseCategoryMaster`: configurable expense categories with approval requirements and cashier limits.
- `Currency`, `ExchangeRate`, `CurrencyDenomination`: multi-currency configuration.
- `CashRegister`: physical register assigned to a branch.
- `CashShift`: employee responsibility period with open, review, approved/rejected, force-closed, and closed statuses.
- `CashAdjustment`: immutable correction/reversal/manager adjustment records for closed shifts.
- `ShiftOpeningDenomination`, `ShiftClosingDenomination`: denomination counts.
- `ShiftCashWithdrawal`, `ShiftCashCarryover`: closing cash movement.
- `ShiftExpense`, `ShiftReturn`: cash-affecting shift events.
- `ShiftDiscrepancy`, `ShiftHandoverDiscrepancy`: shortage, overage, and carryover differences.
- `KitchenOrder`: chef/kitchen order payload.
- `ShiftReport`: stored shift closing report data.
- `CashNotification`: manager notifications.
- `AuditLog`: sensitive action records.

## Commands

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

Use `npm run db:migrate` in development and `npm run db:deploy` in production. Do not use `prisma db push` for production schema changes.

The migration `20260717180000_erp_financial_controls_suppliers` adds the supplier/purchase module, financial immutability fields, invoice idempotency fields, expanded payment metadata, security account fields, indexes, and partial unique indexes for active cash shifts.

## Seeded Data

The seed creates:

- Main branch.
- Admin and cashier demo accounts.
- Default cash register `REG-MAIN-01`.
- ILS, USD, and JOD currencies.
- Default denominations.
- Initial exchange rates.
- Demo categories, products, ingredients, expenses, and audit record.
