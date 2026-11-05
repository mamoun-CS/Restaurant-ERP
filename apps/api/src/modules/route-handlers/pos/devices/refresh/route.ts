import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit, requestIp } from "@/lib/api";
import { hashPosSecret, issueDeviceAccessToken, secureHashMatches } from "@/lib/pos-device-auth";

const schema = z.object({ deviceId: z.string().uuid(), refreshSecret: z.string().min(32).max(128) });

export async function POST(request: Request) {
  const limited = rateLimit(`pos-refresh:${requestIp(request)}`, 30, 60_000);
  if (limited) return limited;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid refresh request." }, { status: 400 });
  const device = await db.posDevice.findUnique({ where: { id: parsed.data.deviceId }, select: { id: true, branchId: true, refreshTokenHash: true, active: true, revokedAt: true } });
  if (!device || !device.active || device.revokedAt || !secureHashMatches(parsed.data.refreshSecret, device.refreshTokenHash)) return NextResponse.json({ error: "Device credential is invalid or revoked." }, { status: 401 });
  const accessToken = await issueDeviceAccessToken(device);
  await db.posDevice.update({ where: { id: device.id }, data: { lastHeartbeatAt: new Date() } });
  return NextResponse.json({ accessToken, expiresInSeconds: 900 });
}
