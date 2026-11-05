import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const user = await requireAdmin(); if (user instanceof NextResponse) return user;
  const url = new URL(request.url);
  const jobs = await db.printJob.findMany({
    where: {
      status: (url.searchParams.get("status") || undefined) as never,
      jobType: (url.searchParams.get("jobType") || undefined) as never,
      branchId: url.searchParams.get("branchId") || undefined,
      printerConfigurationId: url.searchParams.get("printerId") || undefined,
      invoice: url.searchParams.get("invoice") ? { number: { contains: url.searchParams.get("invoice")! } } : undefined,
    },
    include: { branch: true, printDevice: { select: { id: true, name: true } }, printerConfiguration: true, invoice: { select: { id: true, number: true } }, kitchenOrder: { select: { orderNumber: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return NextResponse.json(jobs);
}
