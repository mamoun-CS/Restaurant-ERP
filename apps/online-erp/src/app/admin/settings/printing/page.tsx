import { PrintingSettingsPage } from "@/components/printing-settings-page";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [branches, devices, printers, products, categories] = await Promise.all([
    db.branch.findMany({ orderBy: { name: "asc" } }),
    db.printDevice.findMany({ include: { branch: true }, orderBy: { createdAt: "desc" } }),
    db.printerConfiguration.findMany({ include: { printDevice: true, branch: true }, orderBy: { createdAt: "desc" } }),
    db.product.findMany({ select: { id: true, sku: true, translations: true }, take: 25, orderBy: { createdAt: "desc" } }),
    db.category.findMany({ take: 25, orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <PrintingSettingsPage
      branches={branches}
      devices={devices}
      printers={printers}
      products={products}
      categories={categories}
    />
  );
}
