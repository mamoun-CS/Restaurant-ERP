import { db } from "@/lib/db";
import type { Session } from "@/lib/auth";
import { PaymentMethod, Prisma } from "@/generated/prisma/client";

const Decimal = Prisma.Decimal;
type Decimal = Prisma.Decimal;

export type CountInput = {
  currencyCode: string;
  denominationValue: number;
  quantity: number;
  withdrawnQty?: number;
  remainingQty?: number;
};

export function toDecimal(value: number | string | Decimal) {
  return value instanceof Decimal ? value : new Decimal(value || 0);
}

export async function getRateSnapshot() {
  const currencies = await db.currency.findMany({
    where: { active: true },
    include: { exchangeRates: { where: { active: true }, orderBy: { createdAt: "desc" }, take: 1 } },
    orderBy: [{ isBase: "desc" }, { code: "asc" }],
  });
  return currencies.map((currency) => ({
    currencyId: currency.id,
    code: currency.code,
    name: currency.name,
    isBase: currency.isBase,
    rateToBase: currency.isBase ? new Decimal(1) : (currency.exchangeRates[0]?.rateToBase ?? new Decimal(1)),
  }));
}

export function sumCounts(counts: CountInput[]) {
  const totals = new Map<string, Decimal>();
  for (const count of counts) {
    const value = toDecimal(count.denominationValue).mul(count.quantity || 0);
    totals.set(count.currencyCode, (totals.get(count.currencyCode) ?? new Decimal(0)).add(value));
  }
  return totals;
}

export function convertTotalsToBase(totals: Map<string, Decimal>, rates: { code: string; rateToBase: Decimal }[]) {
  return [...totals.entries()].reduce((sum, [code, amount]) => {
    const rate = rates.find((item) => item.code === code)?.rateToBase ?? new Decimal(1);
    return sum.add(amount.mul(rate));
  }, new Decimal(0));
}

export async function getLatestCarryover(registerId: string) {
  const previous = await db.cashShift.findFirst({
    where: { registerId, status: "CLOSED" },
    include: { carryovers: true },
    orderBy: { closedAt: "desc" },
  });
  return previous;
}

export async function getOpenShiftForUser(user: Session, registerId?: string) {
  return db.cashShift.findFirst({
    where: {
      employeeId: user.userId,
      branchId: user.branchId,
      status: "OPEN",
      registerId: registerId || undefined,
    },
    include: { register: true, branch: true },
    orderBy: { openedAt: "desc" },
  });
}

export async function expectedCashByCurrency(shiftId: string) {
  const shift = await db.cashShift.findUniqueOrThrow({
    where: { id: shiftId },
    include: {
      openingDenominations: true,
      invoices: { include: { payments: true } },
      expenses: { where: { cancelledAt: null } },
      returns: true,
      withdrawals: true,
    },
  });
  const totals = new Map<string, Decimal>();
  for (const row of shift.openingDenominations) add(totals, row.currencyCode, row.totalAmount);
  for (const invoice of shift.invoices) {
    for (const payment of invoice.payments) {
      if (payment.method === PaymentMethod.CASH) {
        add(totals, payment.currencyCode, payment.amount.sub(payment.changeAmount));
      }
    }
  }
  for (const expense of shift.expenses) add(totals, expense.currencyCode, expense.amount.neg());
  for (const shiftReturn of shift.returns) {
    if (shiftReturn.refundMethod === PaymentMethod.CASH) add(totals, shiftReturn.currencyCode, shiftReturn.amount.neg());
  }
  for (const withdrawal of shift.withdrawals) add(totals, withdrawal.currencyCode, withdrawal.amount.neg());
  return totals;
}

function add(map: Map<string, Decimal>, code: string, amount: Decimal) {
  map.set(code, (map.get(code) ?? new Decimal(0)).add(amount));
}

export async function audit(user: Session | null, action: string, entityType: string, entityId?: string, metadata?: unknown, previousData?: unknown, newData?: unknown, request?: Request) {
  await db.auditLog.create({
    data: {
      userId: user?.userId,
      action,
      entityType,
      entityId,
      metadata: metadata as object,
      previousData: previousData as object,
      newData: newData as object,
      ipAddress: request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
      deviceInfo: request?.headers.get("user-agent"),
    },
  });
}

export async function notifyManagers(type: string, title: string, message: string, shiftId?: string, metadata?: unknown) {
  const managers = await db.user.findMany({ where: { role: "ADMIN", active: true }, select: { id: true } });
  if (!managers.length) return;
  await db.cashNotification.createMany({
    data: managers.map((manager) => ({
      userId: manager.id,
      shiftId,
      type,
      title,
      message,
      metadata: metadata as object,
    })),
  });
}
