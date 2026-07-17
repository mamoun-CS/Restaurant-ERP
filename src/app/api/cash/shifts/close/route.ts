import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { verifyToken } from "@/lib/auth";
import { audit, convertTotalsToBase, expectedCashByCurrency, getRateSnapshot, notifyManagers, sumCounts } from "@/lib/cash";
import { db } from "@/lib/db";
import { apiError, assertSameOrigin, rateLimit, requestIp } from "@/lib/api";

const schema = z.object({
  shiftId: z.string(),
  counts: z.array(z.object({
    currencyCode: z.string(),
    denominationValue: z.number().positive(),
    quantity: z.number().int().min(0),
    withdrawnQty: z.number().int().min(0),
    remainingQty: z.number().int().min(0),
  })).min(1),
  note: z.string().optional(),
});

export async function POST(request: Request) {
  const csrfError = assertSameOrigin(request);
  if (csrfError) return csrfError;
  const limited = rateLimit(`cash-close:${requestIp(request)}`, 8, 60_000);
  if (limited) return limited;
  const user = await verifyToken((await cookies()).get("erp_session")?.value);
  if (user?.role !== "CASHIER") return apiError("FORBIDDEN", "Forbidden", 403);
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return apiError("INVALID_INPUT", "Invalid closing count", 400, parsed.error.flatten());
  const invalid = parsed.data.counts.find((count) => count.withdrawnQty + count.remainingQty !== count.quantity);
  if (invalid) return apiError("INVALID_INPUT", "Withdrawn quantity plus remaining quantity must equal available quantity", 400, { invalid });
  const shift = await db.cashShift.findFirst({ where: { id: parsed.data.shiftId, employeeId: user.userId, status: "OPEN" }, include: { register: true, branch: true } });
  if (!shift) return apiError("NO_OPEN_SHIFT", "Open shift not found", 404);
  const rates = await getRateSnapshot();
  const actualByCurrency = sumCounts(parsed.data.counts);
  const remainingByCurrency = sumCounts(parsed.data.counts.map((count) => ({ ...count, quantity: count.remainingQty })));
  const withdrawnByCurrency = sumCounts(parsed.data.counts.map((count) => ({ ...count, quantity: count.withdrawnQty })));
  const expectedByCurrency = await expectedCashByCurrency(shift.id);
  for (const [code, withdrawn] of withdrawnByCurrency.entries()) {
    expectedByCurrency.set(code, (expectedByCurrency.get(code) ?? withdrawn.sub(withdrawn)).sub(withdrawn));
  }
  const actualBase = convertTotalsToBase(actualByCurrency, rates);
  const expectedBase = convertTotalsToBase(expectedByCurrency, rates);
  const differenceBase = actualBase.sub(expectedBase);
  const discrepancyRows = [...new Set([...actualByCurrency.keys(), ...expectedByCurrency.keys()])].map((code) => {
    const actual = actualByCurrency.get(code) ?? actualBase.sub(actualBase);
    const expected = expectedByCurrency.get(code) ?? actualBase.sub(actualBase);
    const rate = rates.find((item) => item.code === code)?.rateToBase ?? actualBase.add(1);
    return { currencyCode: code, actualAmount: actual, expectedAmount: expected, differenceAmount: actual.sub(expected), differenceBase: actual.sub(expected).mul(rate) };
  }).filter((item) => !item.differenceAmount.eq(0));
  if (discrepancyRows.length && !parsed.data.note?.trim()) {
    return apiError("INVALID_INPUT", "A discrepancy explanation is required", 400, { discrepancies: discrepancyRows });
  }
  const reportReference = `CSR-${Date.now().toString().slice(-10)}`;
  const closed = await db.$transaction(async (tx) => {
    await tx.shiftCashWithdrawal.createMany({
      data: [...withdrawnByCurrency.entries()].filter(([, amount]) => amount.gt(0)).map(([currencyCode, amount]) => ({ shiftId: shift.id, currencyCode, amount })),
    });
    await tx.shiftClosingDenomination.createMany({
      data: parsed.data.counts.map((count) => ({
        shiftId: shift.id,
        currencyCode: count.currencyCode,
        denominationValue: count.denominationValue,
        availableQty: count.quantity,
        withdrawnQty: count.withdrawnQty,
        remainingQty: count.remainingQty,
        totalAmount: count.denominationValue * count.quantity,
        withdrawnAmount: count.denominationValue * count.withdrawnQty,
        remainingAmount: count.denominationValue * count.remainingQty,
      })),
    });
    await tx.shiftCashCarryover.createMany({
      data: [...remainingByCurrency.entries()].map(([currencyCode, amount]) => ({
        shiftId: shift.id,
        currencyCode,
        amount,
        denominationBreakdown: parsed.data.counts.filter((count) => count.currencyCode === currencyCode).map((count) => ({
          denominationValue: count.denominationValue,
          quantity: count.remainingQty,
        })),
      })),
    });
    if (discrepancyRows.length) {
      await tx.shiftDiscrepancy.createMany({
        data: discrepancyRows.map((row) => ({ shiftId: shift.id, note: parsed.data.note!, ...row })),
      });
    }
    const updated = await tx.cashShift.update({
      where: { id: shift.id },
      data: {
        status: discrepancyRows.length ? "REVIEW_REQUIRED" : "CLOSED",
        closedAt: new Date(),
        actualClosingTotalBase: actualBase,
        expectedClosingTotalBase: expectedBase,
        differenceTotalBase: differenceBase,
        closingRates: rates.map((rate) => ({ code: rate.code, rateToBase: rate.rateToBase.toString() })),
        employeeClosingNote: parsed.data.note,
      },
      include: { register: true, branch: true, employee: true, discrepancies: true, carryovers: true, withdrawals: true },
    });
    await tx.shiftReport.create({
      data: {
        shiftId: shift.id,
        reference: reportReference,
        generatedById: user.userId,
        reportData: {
          shiftNumber: updated.shiftNumber,
          branch: updated.branch.name,
          register: updated.register.number,
          employee: updated.employee.name,
          openedAt: updated.openedAt,
          closedAt: updated.closedAt,
          expectedByCurrency: Object.fromEntries([...expectedByCurrency.entries()].map(([k, v]) => [k, v.toString()])),
          actualByCurrency: Object.fromEntries([...actualByCurrency.entries()].map(([k, v]) => [k, v.toString()])),
          differenceBase: differenceBase.toString(),
          note: parsed.data.note,
        },
      },
    });
    return updated;
  });
  await audit(user, "CASH_SHIFT_CLOSED", "CashShift", closed.id, { reportReference }, shift, closed, request);
  if (discrepancyRows.length) {
    await notifyManagers("SHIFT_DISCREPANCY", "Shift shortage or overage", `${user.name} closed shift ${closed.shiftNumber} with a difference of ${differenceBase.toFixed(2)} ILS.`, closed.id, { discrepancyRows, reportReference, note: parsed.data.note });
    await audit(user, "SHIFT_SHORTAGE_OR_OVERAGE_DETECTED", "CashShift", closed.id, { discrepancyRows }, null, discrepancyRows, request);
  }
  return NextResponse.json({ shift: closed, reportReference });
}
