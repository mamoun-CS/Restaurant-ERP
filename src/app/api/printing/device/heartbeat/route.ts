import { NextResponse } from "next/server";
import { authenticatePrintDevice } from "@/lib/printing/device-auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const device = await authenticatePrintDevice(request);
  if (!device) return NextResponse.json({ success: false, code: "DEVICE_NOT_AUTHORIZED" }, { status: 401 });
  await db.printDevice.update({ where: { id: device.id }, data: { status: "ONLINE", lastHeartbeatAt: new Date(), lastConnectedAt: device.lastConnectedAt || new Date() } });
  return NextResponse.json({ success: true, pollingIntervalMs: 5000 });
}
