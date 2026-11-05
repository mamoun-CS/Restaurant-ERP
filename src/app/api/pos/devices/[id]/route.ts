import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertSameOrigin, rateLimit, requestIp } from "@/lib/api";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const csrfError = assertSameOrigin(request);
  if (csrfError) return csrfError;
  const limited = rateLimit(`pos-device-revoke:${requestIp(request)}`, 10, 60_000);
  if (limited) return limited;
  const user = await verifyToken((await cookies()).get("erp_session")?.value);
  if (user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const device = await db.posDevice.update({ where: { id }, data: { active: false, revokedAt: new Date() }, select: { id: true, name: true, branchId: true } }).catch(() => null);
  if (!device) return NextResponse.json({ error: "Device not found." }, { status: 404 });
  await db.auditLog.create({ data: { userId: user.userId, branchId: device.branchId, action: "POS_DEVICE_REVOKED", entityType: "PosDevice", entityId: device.id } });
  return new NextResponse(null, { status: 204 });
}
