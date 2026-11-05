import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { getLatestCarryover, getOpenShiftForUser, getRateSnapshot } from "@/lib/cash";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const user = await verifyToken((await cookies()).get("erp_session")?.value);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const registerId = url.searchParams.get("registerId") || undefined;
  const [shift, rates, registers] = await Promise.all([
    getOpenShiftForUser(user, registerId),
    getRateSnapshot(),
    db.cashRegister.findMany({ where: { branchId: user.branchId, active: true }, include: { branch: true }, orderBy: { number: "asc" } }),
  ]);
  const carryover = registerId ? await getLatestCarryover(registerId) : null;
  return NextResponse.json({ shift, rates, registers, carryover });
}
