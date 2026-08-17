import { NextResponse } from "next/server";
import { authenticatePrintDevice } from "@/lib/printing/device-auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const device = await authenticatePrintDevice(request);
  if (!device) return NextResponse.json({ success: false, code: "DEVICE_NOT_AUTHORIZED" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const lastEventAt = optionalDate(body.lastEventAt) ?? device.lastEventAt;
  const lastFallbackPollAt = optionalDate(body.lastFallbackPollAt) ?? device.lastFallbackPollAt;
  await db.printDevice.update({
    where: { id: device.id },
    data: {
      status: "ONLINE",
      appVersion: typeof body.appVersion === "string" ? body.appVersion : device.appVersion,
      sseStatus: typeof body.sseStatus === "string" ? body.sseStatus : device.sseStatus,
      lastEventAt,
      lastFallbackPollAt,
      lastHeartbeatAt: new Date(),
      lastConnectedAt: device.lastConnectedAt || new Date(),
    },
  });
  return NextResponse.json({
    success: true,
    heartbeatIntervalMs: 30000,
    fallbackPollIntervalMs: Number(process.env.PRINT_FALLBACK_POLL_INTERVAL_MS || 60000),
  });
}

function optionalDate(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
