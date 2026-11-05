"use strict";

function discountLimitMinor(subtotalMinor, canDiscount, maxDiscountPercent, maxDiscountMinor) {
  if (!Number.isSafeInteger(subtotalMinor) || !Number.isFinite(maxDiscountPercent) || !Number.isSafeInteger(maxDiscountMinor) || subtotalMinor < 0 || maxDiscountMinor < 0 || maxDiscountPercent < 0 || maxDiscountPercent > 100) {
    throw new RangeError("Invalid discount policy values.");
  }
  return canDiscount ? Math.min(Math.floor(subtotalMinor * maxDiscountPercent / 100), maxDiscountMinor) : 0;
}

function saleTotals(subtotalMinor, discountMinor, taxMinor = 0) {
  if (![subtotalMinor, discountMinor, taxMinor].every(Number.isSafeInteger) || subtotalMinor < 0 || discountMinor < 0 || discountMinor > subtotalMinor || taxMinor < 0) {
    throw new RangeError("Invalid sale totals.");
  }
  const totalMinor = subtotalMinor - discountMinor + taxMinor;
  if (!Number.isSafeInteger(totalMinor)) throw new RangeError("Sale total exceeds supported range.");
  return { subtotalMinor, discountMinor, taxMinor, totalMinor };
}

module.exports = { discountLimitMinor, saleTotals };
