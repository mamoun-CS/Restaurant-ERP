import { test } from "node:test";
import { strict as assert } from "node:assert";
import { discountLimitMinor, saleTotals } from "@restaurant/shared-business-logic";
import { offlineSaleSchema } from "@restaurant/shared-validation";

test("shared pricing and discount rules use integer minor units", () => {
  assert.equal(discountLimitMinor(10_000, true, 7.5, 900), 750);
  assert.equal(discountLimitMinor(10_000, false, 100, 10_000), 0);
  assert.deepEqual(saleTotals(10_000, 750, 0), { subtotalMinor: 10_000, discountMinor: 750, taxMinor: 0, totalMinor: 9_250 });
  assert.throws(() => saleTotals(100, 101), /Invalid sale totals/);
});

test("shared offline sale schema validates the device cloud contract", () => {
  const sale = {
    id: "4ef0a91e-2d38-4c06-a8d4-66f2cc2c41b8", idempotencyKey: "70f31628-4d5c-485f-af47-9b32647595f3",
    cashierId: "cashier", createdAt: new Date().toISOString(), currencyCode: "ILS",
    subtotalMinor: 1250, discountMinor: 0, taxMinor: 0, totalMinor: 1250, cashierPolicyToken: "x".repeat(40),
    items: [{ productId: "product", productName: "Meal", quantity: 1, unitPriceMinor: 1250 }],
    payments: [{ method: "CASH", currencyCode: "ILS", amountMinor: 1250 }],
  };
  assert.equal(offlineSaleSchema.safeParse(sale).success, true);
  assert.equal(offlineSaleSchema.safeParse({ ...sale, totalMinor: 1 }).success, false);
  assert.equal(offlineSaleSchema.safeParse({ ...sale, payments: [{ method: "CREDIT_CARD", currencyCode: "ILS", amountMinor: 1250 }] }).success, false);
});
