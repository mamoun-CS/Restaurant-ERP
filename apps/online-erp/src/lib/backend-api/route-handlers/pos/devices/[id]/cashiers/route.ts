import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertSameOrigin, rateLimit, requestIp } from "@/lib/api";

const schema = z.object({ userIds: z.array(z.string().min(1)).max(300) });

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const csrfError = assertSameOrigin(request);
  if (csrfError) return csrfError;
  const limited = rateLimit(`pos-device-assign:${requestIp(request)}`, 20, 60_000);
  if (limited) return limited;
  const user = await verifyToken((await cookies()).get("erp_session")?.value);
  if (user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid cashier assignment." }, { status: 400 });
  const { id } = await params;
  const device = await db.posDevice.findUnique({ where: { id }, select: { id: true, branchId: true } });
  if (!device) return NextResponse.json({ error: "Device not found." }, { status: 404 });
  const userIds = [...new Set(parsed.data.userIds)];
  const eligible = await db.user.findMany({ where: { id: { in: userIds }, role: { in: ["CASHIER", "ADMIN"] }, active: true, deletedAt: null, OR: [{ branchId: device.branchId }, { role: "ADMIN", branchId: null }] }, select: { id: true } });
  if (eligible.length !== userIds.length) return NextResponse.json({ error: "Every POS account must be active and available to the device branch." }, { status: 400 });
  await db.$transaction(async (tx) => {
    await tx.posDeviceCashier.deleteMany({ where: { deviceId: id } });
    if (userIds.length) await tx.posDeviceCashier.createMany({ data: userIds.map((userId) => ({ deviceId: id, userId })) });
    await tx.auditLog.create({ data: { userId: user.userId, branchId: device.branchId, action: "POS_CASHIER_ASSIGNMENTS_UPDATED", entityType: "PosDevice", entityId: id, metadata: { cashierIds: userIds } } });
  });
  return NextResponse.json({ success: true, assignedCount: userIds.length });
}
