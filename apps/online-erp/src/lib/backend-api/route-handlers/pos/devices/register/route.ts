import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit, requestIp } from "@/lib/api";
import { hashPosSecret, issueDeviceAccessToken, issueDeviceRefreshSecret } from "@/lib/pos-device-auth";

const schema = z.object({ pairingCode: z.string().min(8).max(64), deviceName: z.string().trim().min(2).max(80), appVersion: z.string().max(40).optional() });

export async function POST(request: Request) {
  const limited = rateLimit(`pos-register:${requestIp(request)}`, 8, 60_000);
  if (limited) return limited;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid device registration request." }, { status: 400 });
  const codeHash = hashPosSecret(parsed.data.pairingCode.trim().toUpperCase());
  const pair = await db.posDevicePairingCode.findUnique({ where: { codeHash } });
  const now = new Date();
  if (!pair || pair.consumedAt || (pair.expiresAt && pair.expiresAt <= now) || pair.attempts >= 8) {
    if (pair) await db.posDevicePairingCode.update({ where: { id: pair.id }, data: { attempts: { increment: 1 } } }).catch(() => {});
    return NextResponse.json({ error: "Pairing code is invalid, expired, or already used." }, { status: 401 });
  }
  const deviceId = randomUUID();
  const refreshSecret = issueDeviceRefreshSecret();
  try {
    const device = await db.$transaction(async (tx) => {
      const claimed = await tx.posDevicePairingCode.updateMany({ where: { id: pair.id, consumedAt: null, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }], attempts: { lt: 8 } }, data: { consumedAt: now } });
      if (claimed.count !== 1) throw new Error("PAIRING_CODE_ALREADY_USED");
      const created = await tx.posDevice.create({ data: { id: deviceId, name: parsed.data.deviceName, deviceCode: randomUUID(), refreshTokenHash: hashPosSecret(refreshSecret), branchId: pair.branchId, registerId: pair.registerId, appVersion: parsed.data.appVersion } });
      const cashiers = await tx.user.findMany({ where: { branchId: pair.branchId, role: "CASHIER", active: true, deletedAt: null }, select: { id: true } });
      if (cashiers.length) await tx.posDeviceCashier.createMany({ data: cashiers.map((cashier) => ({ deviceId: created.id, userId: cashier.id })) });
      await tx.posDevicePairingCode.update({ where: { id: pair.id }, data: { deviceId: created.id } });
      await tx.auditLog.create({ data: { userId: pair.createdById, branchId: pair.branchId, action: "POS_DEVICE_REGISTERED", entityType: "PosDevice", entityId: created.id, metadata: { name: created.name } } });
      return created;
    }, { isolationLevel: "Serializable" });
    const accessToken = await issueDeviceAccessToken({ id: device.id, branchId: device.branchId });
    return NextResponse.json({ deviceId: device.id, accessToken, refreshSecret, expiresInSeconds: 900 }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "PAIRING_CODE_ALREADY_USED") return NextResponse.json({ error: "Pairing code is invalid, expired, or already used." }, { status: 409 });
    console.error("POS device registration failed", error);
    return NextResponse.json({ error: "Device registration failed." }, { status: 500 });
  }
}
