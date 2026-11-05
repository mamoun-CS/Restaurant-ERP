import { NextResponse } from "next/server";
import { assertSameOrigin, requireAdmin } from "@/lib/api";
import { db } from "@/lib/db";

export async function GET() {
  const user = await requireAdmin();
  if (user instanceof NextResponse) return user;
  const routes = await db.categoryPrinterRoute.findMany({
    include: { printerConfiguration: { select: { id: true, branchId: true, displayName: true, printerType: true, enabled: true } } },
  });
  return NextResponse.json(routes);
}

export async function PUT(request: Request) {
  const csrfError = assertSameOrigin(request);
  if (csrfError) return csrfError;
  const user = await requireAdmin();
  if (user instanceof NextResponse) return user;
  const body = await request.json().catch(() => null) as { categoryId?: unknown; branchId?: unknown; printerConfigurationId?: unknown } | null;
  if (typeof body?.categoryId !== "string" || typeof body.branchId !== "string" || (body.printerConfigurationId !== null && typeof body.printerConfigurationId !== "string")) {
    return NextResponse.json({ error: "Invalid category route" }, { status: 400 });
  }
  const category = await db.category.findUnique({ where: { id: body.categoryId }, select: { id: true } });
  if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });
  const branch = await db.branch.findUnique({ where: { id: body.branchId }, select: { id: true } });
  if (!branch) return NextResponse.json({ error: "Branch not found" }, { status: 404 });
  if (body.printerConfigurationId === null) {
    await db.categoryPrinterRoute.deleteMany({ where: { categoryId: category.id, branchId: body.branchId } });
    return NextResponse.json({ categoryId: category.id, printerConfigurationId: null });
  }
  const printer = await db.printerConfiguration.findUnique({ where: { id: body.printerConfigurationId as string } });
  if (!printer || printer.branchId !== body.branchId || !printer.enabled || !["KITCHEN", "BAR"].includes(printer.printerType)) {
    return NextResponse.json({ error: "Choose an enabled kitchen or bar printer" }, { status: 400 });
  }
  const route = await db.categoryPrinterRoute.upsert({
    where: { categoryId_branchId: { categoryId: category.id, branchId: body.branchId } },
    create: { categoryId: category.id, branchId: body.branchId, printerConfigurationId: printer.id },
    update: { printerConfigurationId: printer.id },
  });
  return NextResponse.json(route);
}
