import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { verifyToken } from "@/lib/auth";
import { audit } from "@/lib/cash";
import { db } from "@/lib/db";

const rateSchema = z.object({ currencyCode: z.enum(["USD", "JOD"]), rateToBase: z.number().positive() });

export async function GET() {
  const user = await verifyToken((await cookies()).get("erp_session")?.value);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [branches, registers, currencies] = await Promise.all([
    db.branch.findMany({ orderBy: { name: "asc" } }),
    db.cashRegister.findMany({ include: { branch: true }, orderBy: { number: "asc" } }),
    db.currency.findMany({
      include: {
        denominations: { orderBy: [{ sortOrder: "asc" }, { value: "desc" }] },
        exchangeRates: { where: { active: true }, orderBy: { createdAt: "desc" }, take: 1, include: { manager: { select: { name: true } } } },
      },
      orderBy: [{ isBase: "desc" }, { code: "asc" }],
    }),
  ]);
  return NextResponse.json({ branches, registers, currencies });
}

export async function PATCH(request: Request) {
  const user = await verifyToken((await cookies()).get("erp_session")?.value);
  if (user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = rateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid rate", details: parsed.error.flatten() }, { status: 400 });
  const currency = await db.currency.findUnique({ where: { code: parsed.data.currencyCode } });
  if (!currency) return NextResponse.json({ error: "Currency not found" }, { status: 404 });
  const previous = await db.exchangeRate.findFirst({ where: { currencyId: currency.id, active: true }, orderBy: { createdAt: "desc" } });
  const result = await db.$transaction(async (tx) => {
    await tx.exchangeRate.updateMany({ where: { currencyId: currency.id, active: true }, data: { active: false } });
    return tx.exchangeRate.create({
      data: {
        currencyId: currency.id,
        rateToBase: parsed.data.rateToBase,
        previousRate: previous?.rateToBase,
        managerId: user.userId,
      },
    });
  });
  await audit(user, "EXCHANGE_RATE_CHANGED", "ExchangeRate", result.id, { currencyCode: currency.code }, previous, result, request);
  return NextResponse.json(result);
}
