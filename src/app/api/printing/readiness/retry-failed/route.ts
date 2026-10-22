import { NextResponse } from "next/server";
import { assertSameOrigin, requireAdmin } from "@/lib/api";
import { db } from "@/lib/db";
import { publishPrintJobEvent } from "@/lib/printing/sse-broker";

export async function POST(request: Request) {
  const csrfError = assertSameOrigin(request);
  if (csrfError) return csrfError;
  const user = await requireAdmin();
  if (user instanceof NextResponse) return user;

  const failedJobs = await db.printJob.findMany({
    where: { status: "FAILED" },
    take: 20,
    orderBy: { createdAt: "desc" },
  });

  if (!failedJobs.length) {
    return NextResponse.json({ success: true, count: 0, message: "No failed jobs to retry." });
  }

  let resetCount = 0;
  for (const job of failedJobs) {
    const updated = await db.printJob.update({
      where: { id: job.id },
      data: {
        status: "PENDING",
        attempts: 0,
        errorCode: null,
        errorMessage: null,
        failedAt: null,
      },
    });
    publishPrintJobEvent(updated);
    resetCount++;
  }

  return NextResponse.json({
    success: true,
    count: resetCount,
    message: `Reset ${resetCount} failed jobs to PENDING.`,
  });
}
