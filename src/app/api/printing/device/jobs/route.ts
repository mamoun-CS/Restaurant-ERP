import { NextResponse } from "next/server";
import { authenticatePrintDevice } from "@/lib/printing/device-auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const device = await authenticatePrintDevice(request);
  if (!device) return NextResponse.json({ success: false, code: "DEVICE_NOT_AUTHORIZED" }, { status: 401 });
  const limit = Math.min(Number(new URL(request.url).searchParams.get("limit") || 10), 25);
  const maxAttempts = Number(process.env.PRINT_JOB_MAX_ATTEMPTS || 5);
  const staleProcessingBefore = new Date(Date.now() - Number(process.env.PRINT_JOB_STALE_PROCESSING_MS || 120_000));
  const candidates = await db.printJob.findMany({
    where: {
      branchId: device.branchId,
      status: { in: ["PENDING", "FAILED", "PROCESSING"] },
      attempts: { lt: maxAttempts },
    },
    include: {
      printerConfiguration: { include: { branch: true } },
      invoice: {
        include: {
          cashier: { select: { id: true, name: true } },
          branch: true,
          items: { include: { addons: true, product: { include: { translations: true } } } },
          payment: true,
          payments: true,
          kitchenOrder: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  for (const job of candidates) {
    const processingAt = job.processingAt instanceof Date ? job.processingAt : null;
    const isStaleProcessing = job.status === "PROCESSING" && (!processingAt || processingAt < staleProcessingBefore);
    const accepted = job.printDeviceId === device.id && (job.status !== "PROCESSING" || isStaleProcessing);
    if (!accepted) {
      console.log({
        event: "PRINT_JOB_FILTERED_OUT",
        jobId: job.id,
        jobStatus: job.status,
        jobDeviceId: job.printDeviceId,
        currentDeviceId: device.id,
        jobBranchId: job.branchId,
        currentBranchId: device.branchId,
        jobType: job.jobType,
        reason: job.printDeviceId !== device.id ? "DEVICE_MISMATCH" : "PROCESSING_NOT_STALE",
      });
    }
  }

  const eligible = candidates
    .filter((job) => {
      const processingAt = job.processingAt instanceof Date ? job.processingAt : null;
      const isStaleProcessing = job.status === "PROCESSING" && (!processingAt || processingAt < staleProcessingBefore);
      return job.printDeviceId === device.id && (job.status !== "PROCESSING" || isStaleProcessing);
    })
    .slice(0, limit);

  const claimed = [];
  for (const job of eligible) {
    const result = await db.printJob.updateMany({
      where: {
        id: job.id,
        printDeviceId: device.id,
        status: job.status,
      },
      data: { status: "SENT", sentAt: new Date() },
    });
    if (result.count === 1) claimed.push({ ...job, status: "SENT" });
  }

  console.log({
    event: "DEVICE_JOB_FETCH",
    deviceId: device.id,
    branchId: device.branchId,
    pendingJobsCount: claimed.length,
    jobIds: claimed.map((job) => job.id),
  });

  return NextResponse.json({ success: true, jobs: claimed });
}
