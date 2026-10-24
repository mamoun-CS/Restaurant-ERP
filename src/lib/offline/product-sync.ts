import { localDb } from "./db";
import { products as fallbackProducts } from "@/lib/demo-data";
import type { LocalProduct, LocalCategory } from "./types";

export async function initAndSyncProductCatalog(): Promise<LocalProduct[]> {
  if (!localDb) return fallbackProducts.map(formatFallbackProduct);

  try {
    // 1. Check if we have internet and can fetch live products
    const res = await fetch("/api/products", {
      headers: { Accept: "application/json" },
      cache: "no-store",
    }).catch(() => null);

    if (res && res.ok) {
      const serverProducts = await res.json().catch(() => null);
      if (Array.isArray(serverProducts)) {
        const mappedProducts: LocalProduct[] = serverProducts.map((p) => {
          const enTranslation = p.translations?.find((t: { locale: string }) => t.locale === "en");
          const arTranslation = p.translations?.find((t: { locale: string }) => t.locale === "ar");

          return {
            id: p.id,
            sku: p.sku || undefined,
            nameEn: enTranslation?.name || p.nameEn || p.sku || "Product",
            nameAr: arTranslation?.name || p.nameAr || enTranslation?.name || "منتج",
            descriptionEn: enTranslation?.description || p.descriptionEn || "",
            descriptionAr: arTranslation?.description || p.descriptionAr || "",
            price: Number(p.price || 0),
            category: p.category?.nameEn || p.category || "General",
            categoryAr: p.category?.nameAr || p.categoryAr || "عام",
            emoji: p.emoji || "🍽️",
            color: p.color || "sand",
            active: p.active !== false,
            sizes: Array.isArray(p.sizes)
              ? p.sizes.map((s: { nameEn: string; nameAr: string; priceDelta?: number; delta?: number }) => ({
                  nameEn: s.nameEn,
                  nameAr: s.nameAr,
                  delta: Number(s.priceDelta ?? s.delta ?? 0),
                }))
              : [],
            addons: Array.isArray(p.addons)
              ? p.addons.map((a: { nameEn: string; nameAr: string; price: number }) => ({
                  nameEn: a.nameEn,
                  nameAr: a.nameAr,
                  price: Number(a.price || 0),
                }))
              : [],
            updatedAt: new Date().toISOString(),
          };
        });

        // Save into IndexedDB
        await localDb.transaction("rw", [localDb.products, localDb.config], async () => {
          // The server's empty list is authoritative too: it may represent
          // a catalog whose products were all deactivated/deleted.
          await localDb.products.clear();
          if (mappedProducts.length > 0) await localDb.products.bulkPut(mappedProducts);
          await localDb.setConfig("lastProductSyncAt", new Date().toISOString());
        });

        return mappedProducts;
      }
    }
  } catch (error) {
    console.warn("Could not sync products from server; falling back to local DB", error);
  }

  // 2. Fallback to local DB cache
  const cached = await localDb.products.toArray().catch(() => []);
  if (cached.length > 0) {
    return cached;
  }

  // 3. Fallback to bundled fallback catalog if local DB is completely empty
  const defaultList = fallbackProducts.map(formatFallbackProduct);
  await localDb.products.bulkPut(defaultList).catch(() => null);
  return defaultList;
}

export async function syncAppMetadata(): Promise<void> {
  if (!localDb) return;

  try {
    // Sync current shift
    const shiftRes = await fetch("/api/cash/current-shift").catch(() => null);
    if (shiftRes && shiftRes.ok) {
      const shiftData = await shiftRes.json().catch(() => null);
      if (shiftData?.shift) {
        await localDb.setConfig("currentShift", {
          id: shiftData.shift.id,
          shiftNumber: shiftData.shift.shiftNumber,
          registerId: shiftData.shift.registerId,
          registerNumber: shiftData.shift.register?.number,
          status: shiftData.shift.status,
          openedAt: shiftData.shift.openedAt,
        });
      }
    }

    // Sync categories
    const catRes = await fetch("/api/categories").catch(() => null);
    if (catRes && catRes.ok) {
      const categories = await catRes.json().catch(() => null);
      if (Array.isArray(categories)) {
        const localCats: LocalCategory[] = categories.map((c) => ({
          id: c.id,
          nameEn: c.nameEn,
          nameAr: c.nameAr,
          sortOrder: c.sortOrder ?? 0,
        }));
        // Remove stale/deleted categories instead of resurrecting them from
        // the previous local snapshot.
        await localDb.transaction("rw", localDb.categories, async () => {
          await localDb.categories.clear();
          if (localCats.length > 0) await localDb.categories.bulkPut(localCats);
        }).catch(() => null);
      }
    }
  } catch (err) {
    console.warn("App metadata sync non-fatal warning:", err);
  }
}

function formatFallbackProduct(p: (typeof fallbackProducts)[number]): LocalProduct {
  return {
    id: p.id,
    nameEn: p.nameEn,
    nameAr: p.nameAr,
    descriptionEn: p.descriptionEn,
    descriptionAr: p.descriptionAr,
    price: Number(p.price),
    category: p.category,
    categoryAr: p.categoryAr,
    emoji: p.emoji,
    color: p.color,
    active: p.active !== false,
    sizes: (p.sizes || []).map((s) => ({
      nameEn: s.nameEn,
      nameAr: s.nameAr,
      delta: Number(s.delta || 0),
    })),
    addons: (p.addons || []).map((a) => ({
      nameEn: a.nameEn,
      nameAr: a.nameAr,
      price: Number(a.price || 0),
    })),
    updatedAt: new Date().toISOString(),
  };
}
