import { NextResponse } from "next/server";
import { authenticatePrintDevice } from "@/lib/printing/device-auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const device = await authenticatePrintDevice(request);
  if (!device) return NextResponse.json({ success: false, code: "DEVICE_NOT_AUTHORIZED" }, { status: 401 });
  const limit = Math.min(Number(new URL(request.url).searchParams.get("limit") || 10), 25);
  const jobs = await db.printJob.findMany({
    where: { printDeviceId: device.id, status: { in: ["PENDING", "FAILED"] }, attempts: { lt: Number(process.env.PRINT_JOB_MAX_ATTEMPTS || 5) } },
    include: { printerConfiguration: true },
    orderBy: { createdAt: "asc" },
    take: limit,
  });
  await db.printJob.updateMany({ where: { id: { in: jobs.map((job) => job.id) }, status: "PENDING" }, data: { status: "SENT", sentAt: new Date() } });
  return NextResponse.json({ success: true, jobs });
}
