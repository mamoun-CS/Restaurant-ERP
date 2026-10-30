import { db, getCloudDb } from "@/lib/db";

export interface SyncStats {
  invoicesPushed: number;
  productsPulled: number;
  lastSyncAt: string;
  error?: string;
}

/**
 * 1. Push local completed invoices to Cloud database
 */
export async function pushLocalSalesToCloud(): Promise<number> {
  const cloudDb = getCloudDb();
  if (!cloudDb) return 0;

  // Find unsynced invoices locally
  const unsynced = await db.invoice.findMany({
    where: { isSynced: false },
    include: {
      items: { include: { addons: true } },
      payments: true,
      branch: true,
    },
    take: 50,
  });

  if (!unsynced.length) return 0;

  let pushedCount = 0;

  for (const inv of unsynced) {
    try {
      // Ensure branch exists on cloud
      await cloudDb.branch.upsert({
        where: { code: inv.branch.code },
        update: { name: inv.branch.name, nameAr: inv.branch.nameAr },
        create: {
          id: inv.branch.id,
          code: inv.branch.code,
          name: inv.branch.name,
          nameAr: inv.branch.nameAr,
          active: true,
        },
      });

      // Upsert invoice on cloud
      await cloudDb.invoice.upsert({
        where: { number: inv.number },
        update: {
          status: inv.status,
          totalAmount: inv.totalAmount,
          grandTotal: inv.grandTotal,
        },
        create: {
          id: inv.id,
          number: inv.number,
          officialNumber: inv.officialNumber,
          status: inv.status,
          idempotencyKey: inv.idempotencyKey,
          clientTransactionId: inv.clientTransactionId,
          orderType: inv.orderType,
          customerName: inv.customerName,
          customerPhone: inv.customerPhone,
          customerAddress: inv.customerAddress,
          customerNotes: inv.customerNotes,
          subtotal: inv.subtotal,
          discountAmount: inv.discountAmount,
          taxAmount: inv.taxAmount,
          totalAmount: inv.totalAmount,
          grandTotal: inv.grandTotal,
          paymentMethod: inv.paymentMethod,
          cashierId: inv.cashierId,
          branchId: inv.branchId,
          shiftId: inv.shiftId,
          createdAt: inv.createdAt,
          isSynced: true,
          syncedAt: new Date(),
          items: {
            create: inv.items.map((it) => ({
              productNameSnapshot: it.productNameSnapshot,
              quantity: it.quantity,
              unitPrice: it.unitPrice,
              selectedSizeSnapshot: it.selectedSizeSnapshot,
              totalPrice: it.totalPrice,
              unitCostSnapshot: it.unitCostSnapshot,
              totalCostSnapshot: it.totalCostSnapshot,
              addons: {
                create: it.addons.map((a) => ({
                  nameSnapshot: a.nameSnapshot,
                  priceSnapshot: a.priceSnapshot,
                })),
              },
            })),
          },
        },
      });

      // Mark locally as synced
      await db.invoice.update({
        where: { id: inv.id },
        data: { isSynced: true, syncedAt: new Date() },
      });

      pushedCount++;
    } catch (err) {
      console.error(`Failed to push invoice ${inv.number} to cloud:`, err);
      // Continue to next invoice so one failure doesn't block the queue
    }
  }

  return pushedCount;
}

/**
 * 2. Pull products & categories updated by Admin on Cloud to Local database
 */
export async function pullCatalogFromCloud(): Promise<number> {
  const cloudDb = getCloudDb();
  if (!cloudDb) return 0;

  try {
    // Fetch active categories and products from cloud
    const cloudCategories = await cloudDb.category.findMany();
    for (const cat of cloudCategories) {
      await db.category.upsert({
        where: { id: cat.id },
        update: {
          nameEn: cat.nameEn,
          nameAr: cat.nameAr,
          active: cat.active,
          sortOrder: cat.sortOrder,
        },
        create: {
          id: cat.id,
          nameEn: cat.nameEn,
          nameAr: cat.nameAr,
          active: cat.active,
          sortOrder: cat.sortOrder,
        },
      });
    }

    const cloudProducts = await cloudDb.product.findMany({
      include: { translations: true },
    });

    for (const p of cloudProducts) {
      await db.product.upsert({
        where: { id: p.id },
        update: {
          sku: p.sku,
          categoryId: p.categoryId,
          price: p.price,
          currentCost: p.currentCost,
          active: p.active,
          emoji: p.emoji,
          color: p.color,
          sizes: p.sizes as any,
          addons: p.addons as any,
          requiresPreparation: p.requiresPreparation,
        },
        create: {
          id: p.id,
          sku: p.sku,
          categoryId: p.categoryId,
          price: p.price,
          currentCost: p.currentCost,
          active: p.active,
          emoji: p.emoji,
          color: p.color,
          sizes: p.sizes as any,
          addons: p.addons as any,
          requiresPreparation: p.requiresPreparation,
        },
      });
    }

    return cloudProducts.length;
  } catch (err) {
    console.error("Failed to pull catalog from cloud:", err);
    return 0;
  }
}

/**
 * Execute full bidirectional sync cycle
 */
export async function runBidirectionalSync(): Promise<SyncStats> {
  try {
    const invoicesPushed = await pushLocalSalesToCloud();
    const productsPulled = await pullCatalogFromCloud();
    return {
      invoicesPushed,
      productsPulled,
      lastSyncAt: new Date().toISOString(),
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Sync failed";
    return {
      invoicesPushed: 0,
      productsPulled: 0,
      lastSyncAt: new Date().toISOString(),
      error: msg,
    };
  }
}
