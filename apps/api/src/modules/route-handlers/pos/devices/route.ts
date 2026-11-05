import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const user = await verifyToken((await cookies()).get("erp_session")?.value);
  if (user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const [branches, registers, devices, cashiers] = await Promise.all([
    db.branch.findMany({ where: { active: true }, select: { id: true, name: true, nameAr: true, code: true }, orderBy: { name: "asc" } }),
    db.cashRegister.findMany({ where: { active: true }, select: { id: true, name: true, number: true, branchId: true }, orderBy: { name: "asc" } }),
    db.posDevice.findMany({ include: { branch: { select: { name: true, nameAr: true, code: true } }, register: { select: { name: true, number: true } }, assignments: { include: { user: { select: { id: true, name: true, email: true, active: true, offlinePinExpiresAt: true } } } } }, orderBy: { createdAt: "desc" } }),
    db.user.findMany({ where: { role: "CASHIER", active: true, deletedAt: null }, select: { id: true, name: true, email: true, branchId: true, offlinePinExpiresAt: true, canDiscount: true, maxDiscountPercent: true, maxDiscountAmount: true, supervisor: true }, orderBy: { name: "asc" } }),
  ]);
  return NextResponse.json({ branches, registers, devices: devices.map(({ refreshTokenHash: _secret, ...device }) => device), cashiers });
}
