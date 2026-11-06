"use strict";
// This package is consumed by the Electron CommonJS main process and Next.js API routes.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { z } = require("zod");

const optionSchema = z.object({ name: z.string().min(1).max(100), priceMinor: z.number().int().nonnegative() });
const offlineSaleSchema = z.object({
  id: z.string().uuid(), idempotencyKey: z.string().uuid(), cashierId: z.string().min(1), createdAt: z.string().datetime(),
  orderType: z.enum(["DINE_IN", "TAKEAWAY", "PICKUP", "DELIVERY"]).default("PICKUP"),
  customerName: z.string().max(120).optional(), customerPhone: z.string().max(40).optional(), customerAddress:z.string().max(300).optional(), customerNotes: z.string().max(1000).optional(),
  currencyCode: z.literal("ILS"), subtotalMinor: z.number().int().nonnegative(), discountMinor: z.number().int().nonnegative(),
  taxMinor: z.number().int().nonnegative(), totalMinor: z.number().int().nonnegative(),
  discountReason: z.string().max(250).optional(), couponCode: z.string().min(3).max(40).optional(), cashierPolicyToken: z.string().min(20).max(4096),
  supervisorId: z.string().optional(), supervisorPolicyToken: z.string().min(20).max(4096).optional(),
  items: z.array(z.object({ productId: z.string().min(1), productName: z.string().min(1).max(200), quantity: z.number().int().positive().max(10000), unitPriceMinor: z.number().int().nonnegative(), options: z.array(optionSchema).max(30).default([]) })).min(1).max(200),
  payments: z.array(z.object({ method: z.literal("CASH"), currencyCode: z.literal("ILS"), amountMinor: z.number().int().positive(), processorReference: z.string().max(120).optional() })).min(1).max(10),
}).superRefine((order, context) => {
  const lineSubtotal = order.items.reduce((sum, item) => sum + item.quantity * item.unitPriceMinor, 0);
  const paidTotal = order.payments.reduce((sum, payment) => sum + payment.amountMinor, 0);
  if (!Number.isSafeInteger(lineSubtotal) || lineSubtotal !== order.subtotalMinor) context.addIssue({ code: "custom", message: "Line subtotal does not match order subtotal.", path: ["subtotalMinor"] });
  if (order.discountMinor > order.subtotalMinor || order.totalMinor !== order.subtotalMinor - order.discountMinor + order.taxMinor) context.addIssue({ code: "custom", message: "Order total does not reconcile.", path: ["totalMinor"] });
  if (!Number.isSafeInteger(paidTotal) || paidTotal !== order.totalMinor) context.addIssue({ code: "custom", message: "Payment total does not match order total.", path: ["payments"] });
});

module.exports = { offlineSaleSchema };
