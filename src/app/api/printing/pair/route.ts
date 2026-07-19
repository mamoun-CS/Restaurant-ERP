import { NextResponse } from "next/server";
import { rateLimit, requestIp } from "@/lib/api";
import { db } from "@/lib/db";
import { createDeviceToken, hashPrintSecret } from "@/lib/printing/device-auth";
import { pairDeviceSchema } from "@/lib/printing/validation";

export async function POST(request: Request) {
  const limited = rateLimit(`print-pair:${requestIp(request)}`, 5, 60_000); if (limited) return limited;
  const parsed = pairDeviceSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, code: "INVALID_INPUT", message: "Invalid pairing request.", details: parsed.error.flatten() }, { status: 400 });
  const codeHash = hashPrintSecret(parsed.data.pairingCode);
  const pairing = await db.printPairingCode.findUnique({ where: { codeHash } });
  if (!pairing || pairing.usedAt || pairing.expiresAt < new Date()) {
    if (pairing) await db.printPairingCode.update({ where: { id: pairing.id }, data: { attempts: { increment: 1 } } });
    return NextResponse.json({ success: false, code: "INVALID_PAIRING_CODE", message: "Pairing code is invalid or expired." }, { status: 401 });
  }
  const token = createDeviceToken();
  const device = await db.$transaction(async (tx) => {
    const created = await tx.printDevice.create({
      data: { branchId: pairing.branchId, name: parsed.data.deviceName, deviceCode: `NPA-${Date.now().toString(36).toUpperCase()}`, tokenHash: hashPrintSecret(token), status: "ONLINE", operatingSystem: parsed.data.operatingSystem, appVersion: parsed.data.appVersion, lastConnectedAt: new Date(), lastHeartbeatAt: new Date() },
    });
    await tx.printPairingCode.update({ where: { id: pairing.id }, data: { usedAt: new Date(), printDeviceId: created.id } });
    return created;
  });
  return NextResponse.json({ success: true, deviceId: device.id, deviceCode: device.deviceCode, branchId: device.branchId, token });
}
