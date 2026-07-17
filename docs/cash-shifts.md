# Cash Register and Shift Module

## Opening

Cashiers open a shift at `/cash/open`. The page displays register selection, exchange rates, previous carryover, and denomination counts for ILS, USD, and JOD.

The server:

- Rejects opening if the register or employee already has an open shift.
- Rechecks duplicate shifts inside a serializable transaction.
- Calculates totals from denominations.
- Stores opening exchange-rate snapshots.
- Compares actual opening cash to previous carryover.
- Requires a note when a handover discrepancy exists.
- Notifies managers and writes audit logs for discrepancies.

Opening balance source is stored as `PREVIOUS_SHIFT_CARRYOVER`, `MANAGER_ADDITION`, or `MIXED`. Previous carryover, manager addition, opening discrepancy, and denomination rows are stored separately.

## Sales

Invoices require an open shift. Payment components store:

- Method: cash, credit card, or bank.
- Currency.
- Amount.
- Exchange rate used.
- Converted ILS value.
- Provider, card/bank references, POS terminal number, status, settlement status, bank fee, and change fields when present.

Card and bank payments do not increase the physical drawer cash calculation.

## Closing

Cashiers close at `/cash/close`. For each denomination they enter:

- Available quantity.
- Withdrawn quantity.
- Remaining quantity.

The server validates:

```text
withdrawn quantity + remaining quantity = available quantity
```

Expected cash is calculated from opening cash, cash payments, refunds, expenses, and withdrawals. Actual cash is compared to expected cash by currency and total converted ILS value.

Any non-zero discrepancy requires a cashier note and sets the shift to `REVIEW_REQUIRED`. Zero discrepancy closes the shift as `CLOSED`.

Closed shifts are immutable. Corrections must be stored as `CashAdjustment` records with before/after values and audit log entries.

## Reports

Closing creates a `ShiftReport` record with structured report data. Manager report listing is available at `/admin/cash`.

## Known Gaps

- PDF download UI is not complete.
- Thermal shift report rendering is not complete.
- Manager review status editing UI is not complete.
- The POS API supports multiple payment rows, card metadata, idempotency keys, and official invoice numbers; the cashier UI still needs a full rich editor for every card/bank metadata field.
