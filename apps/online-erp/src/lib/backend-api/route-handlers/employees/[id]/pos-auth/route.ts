import { scrypt as scryptCallback, randomBytes } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertSameOrigin, rateLimit, requestIp } from "@/lib/api";

const scrypt = promisify(scryptCallback);
const schema = z.object({ pin: z.string().regex(/^\d{4,12}$/).optional(), offlineDays: z.number().int().min(1).max(90).default(30), neverExpires: z.boolean().default(false), canDiscount: z.boolean().default(false), maxDiscountPercent: z.number().min(0).max(100).default(0), maxDiscountAmount: z.number().min(0).max(100000).default(0), supervisor: z.boolean().default(false) });

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const csrfError = assertSameOrigin(request);
  if (csrfError) return csrfError;
  const limited = rateLimit(`cashier-pos-auth:${requestIp(request)}`, 10, 60_000);
  if (limited) return limited;
  const user = await verifyToken((await cookies()).get("erp_session")?.value);
  if (user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid POS authentication settings.", details: parsed.error.flatten() }, { status: 400 });
  const { id } = await params;
  const target = await db.user.findFirst({ where: { id, role: { in: ["CASHIER", "ADMIN"] }, deletedAt: null } });
  if (!target) return NextResponse.json({ error: "POS account not found." }, { status: 404 });
  if (!parsed.data.pin && (!target.offlinePinHash || !target.offlinePinSalt || (target.offlinePinExpiresAt && target.offlinePinExpiresAt <= new Date()))) return NextResponse.json({ error: "Set a new PIN before saving a policy for this account." }, { status: 400 });
  const salt = parsed.data.pin ? randomBytes(16) : null;
  const pinHash = parsed.data.pin && salt ? (await scrypt(parsed.data.pin, salt, 64)) as Buffer : null;
  const expiry = parsed.data.neverExpires ? null : new Date(Date.now() + parsed.data.offlineDays * 24 * 60 * 60_000);
  const { pin: _pin, ...policy } = parsed.data;
  const supervisor = target.role === "ADMIN" || policy.supervisor;
  await db.user.update({ where: { id }, data: { ...(pinHash&&salt?{offlinePinHash:pinHash.toString("hex"),offlinePinSalt:salt.toString("hex")}:{}), offlinePinExpiresAt: expiry, offlineCredentialVersion: { increment: 1 }, canDiscount: policy.canDiscount, maxDiscountPercent: policy.maxDiscountPercent, maxDiscountAmount: policy.maxDiscountAmount, supervisor } });
  await db.auditLog.create({ data: { userId: user.userId, branchId: target.branchId, action: target.role === "ADMIN" ? "ADMIN_POS_CREDENTIAL_UPDATED" : "CASHIER_POS_CREDENTIAL_UPDATED", entityType: "User", entityId: id, metadata: { offlineExpiresAt: expiry?.toISOString() ?? null, canDiscount: policy.canDiscount, maxDiscountPercent: policy.maxDiscountPercent, maxDiscountAmount: policy.maxDiscountAmount, supervisor, accountRole:target.role } } });
  return NextResponse.json({ success: true, offlineExpiresAt: expiry?.toISOString() ?? null, policyVersion: target.offlineCredentialVersion + 1 });
}
