import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyToken } from "@/lib/auth";
import { assertSameOrigin, rateLimit, requestIp } from "@/lib/api";
import { db } from "@/lib/db";
import { hashPosSecret } from "@/lib/pos-device-auth";

const schema = z.object({ branchId: z.string().min(1), registerId: z.string().min(1) });

export async function POST(request: Request) {
  const csrfError = assertSameOrigin(request);
  if (csrfError) return csrfError;
  const limited = rateLimit(`pos-pair:${requestIp(request)}`, 10, 60_000);
  if (limited) return limited;
  const user = await verifyToken((await cookies()).get("erp_session")?.value);
  if (user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Branch and cash register are required." }, { status: 400 });
  const register = await db.cashRegister.findFirst({ where: { id: parsed.data.registerId, branchId: parsed.data.branchId, active: true } });
  if (!register) return NextResponse.json({ error: "Cash register was not found for this branch." }, { status: 404 });
  const pairingCode = randomBytes(9).toString("base64url").toUpperCase();
  const expiresAt = new Date(Date.now() + 10 * 60_000);
  const row = await db.posDevicePairingCode.create({ data: { codeHash: hashPosSecret(pairingCode), branchId: parsed.data.branchId, registerId: register.id, createdById: user.userId, expiresAt } });
  await db.auditLog.create({ data: { userId: user.userId, branchId: parsed.data.branchId, action: "POS_PAIRING_CODE_CREATED", entityType: "PosDevicePairingCode", entityId: row.id, metadata: { expiresAt: expiresAt.toISOString(), registerId: register.id } } });
  return NextResponse.json({ pairingCode, expiresAt: expiresAt.toISOString() }, { status: 201 });
}
