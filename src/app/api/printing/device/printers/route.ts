import { NextResponse } from "next/server";
import { authenticatePrintDevice } from "@/lib/printing/device-auth";
import { db } from "@/lib/db";
import { devicePrintersSchema } from "@/lib/printing/validation";

export async function POST(request: Request) {
  const device = await authenticatePrintDevice(request);
  if (!device) return NextResponse.json({ success: false, code: "DEVICE_NOT_AUTHORIZED" }, { status: 401 });
  const parsed = devicePrintersSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, code: "INVALID_INPUT", details: parsed.error.flatten() }, { status: 400 });
  await db.printDevice.update({ where: { id: device.id }, data: { localPrinters: parsed.data.printers, lastHeartbeatAt: new Date(), status: "ONLINE" } });
  return NextResponse.json({ success: true });
}
