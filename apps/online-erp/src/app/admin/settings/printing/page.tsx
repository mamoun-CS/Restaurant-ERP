import { PrintingSettingsPage } from "@/components/printing-settings-page";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [branches, devices, printers, categories, categoryRoutes] = await Promise.all([
    db.branch.findMany({ orderBy: { name: "asc" } }),
    db.printDevice.findMany({ include: { branch: true }, orderBy: { createdAt: "desc" } }),
    db.printerConfiguration.findMany({ include: { printDevice: true, branch: true }, orderBy: { createdAt: "desc" } }),
    db.category.findMany({ orderBy: { sortOrder: "asc" } }),
    db.categoryPrinterRoute.findMany({ select: { categoryId: true, branchId: true, printerConfigurationId: true } }),
  ]);

  return (
    <PrintingSettingsPage
      branches={branches}
      devices={devices}
      printers={printers}
      categories={categories}
      categoryRoutes={categoryRoutes}
    />
  );
}
