import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { verifyToken } from "@/lib/auth";
import { audit, convertTotalsToBase, getLatestCarryover, getRateSnapshot, notifyManagers, sumCounts } from "@/lib/cash";
import { db } from "@/lib/db";
import { apiError, assertSameOrigin, rateLimit, requestIp } from "@/lib/api";

const schema = z.object({
  registerId: z.string(),
  counts: z.array(z.object({ currencyCode: z.string(), denominationValue: z.number().positive(), quantity: z.number().int().min(0) })).min(1),
  discrepancyNote: z.string().optional(),
});

export async function POST(request: Request) {
  const csrfError = assertSameOrigin(request);
  if (csrfError) return csrfError;
  const limited = rateLimit(`cash-open:${requestIp(request)}`, 8, 60_000);
  if (limited) return limited;
  const user = await verifyToken((await cookies()).get("erp_session")?.value);
  if (user?.role !== "CASHIER") return apiError("FORBIDDEN", "Forbidden", 403);
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return apiError("INVALID_INPUT", "Invalid opening count", 400, parsed.error.flatten());
  const register = await db.cashRegister.findFirst({ where: { id: parsed.data.registerId, branchId: user.branchId, active: true }, include: { branch: true } });
  if (!register) return apiError("RESOURCE_NOT_FOUND", "Cash register not found", 404);
  const existing = await db.cashShift.findFirst({ where: { OR: [{ registerId: register.id, status: "OPEN" }, { employeeId: user.userId, status: "OPEN" }] } });
  if (existing) return apiError("CASH_SHIFT_ALREADY_OPEN", "An open shift already exists for this register or employee.", 409);
  const rates = await getRateSnapshot();
  const totals = sumCounts(parsed.data.counts);
  const openingTotalBase = convertTotalsToBase(totals, rates);
  const previousShift = await getLatestCarryover(register.id);
  const handoverDiffs = previousShift?.carryovers.map((carryover) => {
    const actual = totals.get(carryover.currencyCode) ?? openingTotalBase.sub(openingTotalBase);
    return { currencyCode: carryover.currencyCode, carryoverAmount: carryover.amount, actualOpeningAmount: actual, differenceAmount: actual.sub(carryover.amount) };
  }).filter((item) => !item.differenceAmount.eq(0)) ?? [];
  if (handoverDiffs.length && !parsed.data.discrepancyNote?.trim()) {
    return apiError("INVALID_INPUT", "A handover discrepancy note is required", 400, { handoverDiffs });
  }
  const shift = await db.$transaction(async (tx) => {
    const duplicate = await tx.cashShift.findFirst({ where: { OR: [{ registerId: register.id, status: "OPEN" }, { employeeId: user.userId, status: "OPEN" }] } });
    if (duplicate) throw new Error("CASH_SHIFT_ALREADY_OPEN");
    const created = await tx.cashShift.create({
      data: {
        shiftNumber: `SH-${Date.now().toString().slice(-9)}`,
        branchId: user.branchId,
        registerId: register.id,
        employeeId: user.userId,
        openingTotalBase,
        openingRates: rates.map((rate) => ({ code: rate.code, rateToBase: rate.rateToBase.toString() })),
        previousShiftId: previousShift?.id,
        openingDenominations: {
          create: parsed.data.counts.map((count) => ({
            currencyCode: count.currencyCode,
            denominationValue: count.denominationValue,
            quantity: count.quantity,
            totalAmount: count.denominationValue * count.quantity,
          })),
        },
      },
    });
    if (handoverDiffs.length) {
      await tx.shiftHandoverDiscrepancy.createMany({
        data: handoverDiffs.map((item) => ({
          shiftId: created.id,
          previousShiftId: previousShift?.id,
          currencyCode: item.currencyCode,
          carryoverAmount: item.carryoverAmount,
          actualOpeningAmount: item.actualOpeningAmount,
          differenceAmount: item.differenceAmount,
          note: parsed.data.discrepancyNote!,
        })),
      });
    }
    return created;
  }, { isolationLevel: "Serializable" }).catch((error) => {
    if (String(error.message) === "CASH_SHIFT_ALREADY_OPEN") return null;
    throw error;
  });
  if (!shift) return apiError("CASH_SHIFT_ALREADY_OPEN", "An open shift already exists for this register or employee.", 409);
  await audit(user, "CASH_SHIFT_OPENED", "CashShift", shift.id, { registerId: register.id, counts: parsed.data.counts }, null, shift, request);
  if (handoverDiffs.length) {
    await notifyManagers("HANDOVER_DIFFERENCE", "Shift handover difference", `${user.name} opened ${register.number} with a carryover difference.`, shift.id, { handoverDiffs, note: parsed.data.discrepancyNote });
    await audit(user, "SHIFT_HANDOVER_DIFFERENCE_DETECTED", "CashShift", shift.id, { handoverDiffs }, null, handoverDiffs, request);
  }
  return NextResponse.json(shift, { status: 201 });
}
