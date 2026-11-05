import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api";
import { db } from "@/lib/db";

export async function GET() {
  const user = await requireAdmin(); if (user instanceof NextResponse) return user;
  const devices = await db.printDevice.findMany({ include: { branch: true, printerConfigs: true }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(devices.map(({ tokenHash: _tokenHash, ...device }) => device));
}
