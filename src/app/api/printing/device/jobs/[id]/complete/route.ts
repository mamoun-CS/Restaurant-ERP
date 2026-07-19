import { NextResponse } from "next/server";
import { authenticatePrintDevice } from "@/lib/printing/device-auth";
import { db } from "@/lib/db";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const device = await authenticatePrintDevice(request); if (!device) return NextResponse.json({ success: false, code: "DEVICE_NOT_AUTHORIZED" }, { status: 401 });
  const { id } = await params;
  return NextResponse.json(await db.printJob.update({ where: { id, printDeviceId: device.id }, data: { status: "PRINTED", printedAt: new Date(), errorCode: null, errorMessage: null } }));
}
