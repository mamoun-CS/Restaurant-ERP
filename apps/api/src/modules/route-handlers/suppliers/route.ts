import { z } from "zod";
import { db } from "@/lib/db";
import { audit } from "@/lib/cash";
import { apiError, apiSuccess, assertSameOrigin, requireAdmin } from "@/lib/api";

const supplierSchema = z.object({
  name: z.string().min(2),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  email: z.email().optional().or(z.literal("")),
  address: z.string().optional(),
  taxNumber: z.string().optional(),
  notes: z.string().optional(),
  active: z.boolean().default(true),
});

export async function GET() {
  const user = await requireAdmin();
  if (user instanceof Response) return user;
  const suppliers = await db.supplier.findMany({
    where: { deletedAt: null },
    include: { _count: { select: { purchases: true, payments: true, returns: true } } },
    orderBy: { name: "asc" },
  });
  return apiSuccess(suppliers);
}

export async function POST(request: Request) {
  const csrfError = assertSameOrigin(request);
  if (csrfError) return csrfError;
  const user = await requireAdmin();
  if (user instanceof Response) return user;
  const parsed = supplierSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("INVALID_INPUT", "Invalid supplier data.", 400, parsed.error.flatten());
  const supplier = await db.supplier.create({ data: { ...parsed.data, email: parsed.data.email || null } });
  await audit(user, "SUPPLIER_CREATED", "Supplier", supplier.id, null, null, supplier, request);
  return apiSuccess(supplier, 201);
}
