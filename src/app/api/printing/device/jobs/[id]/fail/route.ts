import { NextResponse } from "next/server";
import { authenticatePrintDevice } from "@/lib/printing/device-auth";
import { db } from "@/lib/db";
import { jobFailSchema } from "@/lib/printing/validation";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const device = await authenticatePrintDevice(request); if (!device) return NextResponse.json({ success: false, code: "DEVICE_NOT_AUTHORIZED" }, { status: 401 });
  const parsed = jobFailSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ success: false, code: "INVALID_INPUT" }, { status: 400 });
  const { id } = await params;
  return NextResponse.json(await db.printJob.update({ where: { id, printDeviceId: device.id }, data: { status: "FAILED", failedAt: new Date(), errorCode: parsed.data.errorCode, errorMessage: parsed.data.errorMessage } }));
}
