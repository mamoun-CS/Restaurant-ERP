import type { Prisma } from "@/generated/prisma/client";

type Tx = Prisma.TransactionClient;

export type RoutableInvoiceItem = {
  id: string;
  productId: string | null;
  categoryId: string | null;
  productNameSnapshot: string;
  quantity: number;
  selectedSizeSnapshot: string | null;
  addons: { nameSnapshot: string }[];
  product?: { requiresPreparation: boolean; categoryId: string } | null;
};

export async function routeKitchenItems(tx: Tx, branchId: string, items: RoutableInvoiceItem[]) {
  const printableItems = items.filter((item) => item.product?.requiresPreparation);
  if (!printableItems.length) return [];

  const [printers, productRoutes, categoryRoutes] = await Promise.all([
    tx.printerConfiguration.findMany({ where: { branchId, enabled: true, autoPrint: true, printerType: { in: ["KITCHEN", "BAR"] } }, orderBy: { createdAt: "asc" } }),
    tx.productPrinterRoute.findMany({ where: { productId: { in: printableItems.map((item) => item.productId).filter((value): value is string => Boolean(value)) } }, include: { printerConfiguration: true } }),
    tx.categoryPrinterRoute.findMany({ where: { categoryId: { in: printableItems.map((item) => item.categoryId).filter((value): value is string => Boolean(value)) } }, include: { printerConfiguration: true } }),
  ]);

  const defaultKitchen = printers.find((printer) => printer.printerType === "KITCHEN");
  const byProduct = new Map(productRoutes.map((route) => [route.productId, route.printerConfiguration]));
  const byCategory = new Map(categoryRoutes.map((route) => [route.categoryId, route.printerConfiguration]));
  const groups = new Map<string, { printer: typeof printers[number]; items: RoutableInvoiceItem[] }>();

  for (const item of printableItems) {
    const printer = (item.productId && byProduct.get(item.productId)) || (item.categoryId && byCategory.get(item.categoryId)) || defaultKitchen;
    if (!printer || !printer.enabled || !printer.autoPrint) continue;
    const current = groups.get(printer.id) || { printer, items: [] };
    current.items.push(item);
    groups.set(printer.id, current);
  }

  return [...groups.values()];
}
