import { z } from "zod";
import { db } from "@/lib/db";
import { audit } from "@/lib/cash";
import { apiError, apiSuccess, assertSameOrigin, requireAdmin } from "@/lib/api";

const schema = z.object({
  name: z.string().min(2).optional(),
  contactPerson: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.email().optional().nullable().or(z.literal("")),
  address: z.string().optional().nullable(),
  taxNumber: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  active: z.boolean().optional(),
});

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin();
  if (user instanceof Response) return user;
  const { id } = await params;
  const supplier = await db.supplier.findFirst({
    where: { id, deletedAt: null },
    include: { purchases: { orderBy: { purchaseDate: "desc" }, take: 50 }, payments: { orderBy: { paymentDate: "desc" }, take: 50 }, returns: { orderBy: { returnDate: "desc" }, take: 50 } },
  });
  if (!supplier) return apiError("SUPPLIER_NOT_FOUND", "Supplier not found.", 404);
  return apiSuccess(supplier);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const csrfError = assertSameOrigin(request);
  if (csrfError) return csrfError;
  const user = await requireAdmin();
  if (user instanceof Response) return user;
  const { id } = await params;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("INVALID_INPUT", "Invalid supplier data.", 400, parsed.error.flatten());
  const before = await db.supplier.findFirst({ where: { id, deletedAt: null } });
  if (!before) return apiError("SUPPLIER_NOT_FOUND", "Supplier not found.", 404);
  const supplier = await db.supplier.update({ where: { id }, data: { ...parsed.data, email: parsed.data.email || null } });
  await audit(user, "SUPPLIER_UPDATED", "Supplier", id, null, before, supplier, request);
  return apiSuccess(supplier);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const csrfError = assertSameOrigin(request);
  if (csrfError) return csrfError;
  const user = await requireAdmin();
  if (user instanceof Response) return user;
  const { id } = await params;
  const before = await db.supplier.findFirst({ where: { id, deletedAt: null } });
  if (!before) return apiError("SUPPLIER_NOT_FOUND", "Supplier not found.", 404);
  const supplier = await db.supplier.update({ where: { id }, data: { active: false, deletedAt: new Date(), deletedBy: user.userId } });
  await audit(user, "SUPPLIER_SOFT_DELETED", "Supplier", id, null, before, supplier, request);
  return apiSuccess(supplier);
}
