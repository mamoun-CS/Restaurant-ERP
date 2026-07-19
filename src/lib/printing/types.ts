import type { Prisma } from "@/generated/prisma/client";

export type PrintPaperWidth = "W58" | "W80" | "A4" | "CUSTOM";

export type PrintInvoice = Prisma.InvoiceGetPayload<{
  include: {
    cashier: { select: { id: true; name: true } };
    branch: true;
    items: { include: { addons: true; product: { select: { id: true; categoryId: true; requiresPreparation: true } } } };
    payments: true;
    kitchenOrder: true;
  };
}>;
