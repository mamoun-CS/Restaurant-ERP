import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authenticatePosDevice, issueOfflinePolicyToken } from "@/lib/pos-device-auth";
import { rateLimit, requestIp } from "@/lib/api";
import { createHash } from "node:crypto";

export async function GET(request: Request) {
  try {
  const limited = rateLimit(`pos-bootstrap:${requestIp(request)}`, 30, 60_000);
  if (limited) return limited;
  const device = await authenticatePosDevice(request);
  if (!device) return NextResponse.json({ error: "A valid POS device token is required." }, { status: 401 });
  const [branch, register, assignments, categories, products, coupons] = await Promise.all([
    db.branch.findUnique({ where: { id: device.branchId }, select: { id: true, code: true, name: true, nameAr: true, address: true } }),
    device.registerId ? db.cashRegister.findUnique({ where: { id: device.registerId }, select: { id: true, number: true, name: true } }) : null,
    db.posDeviceCashier.findMany({ where: { deviceId: device.id, active: true, user: { active: true, deletedAt: null, role: { in: ["CASHIER", "ADMIN"] }, offlinePinHash: { not: null }, offlinePinSalt: { not: null }, OR: [{ offlinePinExpiresAt: null }, { offlinePinExpiresAt: { gt: new Date() } }] } }, include: { user: { select: { id: true, name: true, email: true, role: true, active: true, offlinePinHash: true, offlinePinSalt: true, offlinePinExpiresAt: true, offlineCredentialVersion: true, canDiscount: true, maxDiscountPercent: true, maxDiscountAmount: true, supervisor: true } } } }),
    db.category.findMany({ where: { active: true, deletedAt: null }, orderBy: { sortOrder: "asc" } }),
    db.product.findMany({ where: { active: true, deletedAt: null }, include: { translations: true, sizes: true, addons: true } }),
    db.discountCampaign.findMany({ where: { active: true, couponCode: { not: null }, products:{none:{}},categories:{none:{}},startsAt: { lte: new Date() }, endsAt: { gte: new Date() } }, select: { couponCode:true,type:true,value:true,startsAt:true,endsAt:true,active:true,maxUses:true,usedCount:true } }),
  ]);
  const cashierById = new Map(assignments.map(({ user }) => [user.id, user]));
  const catalogCategories = categories.map((category) => ({ id: category.id, cloudId: category.id, nameEn: category.nameEn, nameAr: category.nameAr, sortOrder: category.sortOrder, active: category.active, serverVersion: category.updatedAt.getTime(), tags: category.tags }));
  const catalogProducts = products.map((product) => ({
    id: product.id, cloudId: product.id, sku: product.sku, barcode: product.barcode,
    nameEn: product.translations.find((translation) => translation.locale === "en")?.name ?? product.sku,
    nameAr: product.translations.find((translation) => translation.locale === "ar")?.name ?? product.sku,
    categoryId: product.categoryId, priceMinor: Math.round(Number(product.price) * 100), currencyCode: "ILS",
    active: product.active, serverVersion: product.updatedAt.getTime(), tags: product.tags,
    sizes: product.sizes.map((size) => ({ nameEn: size.nameEn, nameAr: size.nameAr, deltaMinor: Math.round(Number(size.priceDelta) * 100) })),
    addons: product.addons.map((addon) => ({ nameEn: addon.nameEn, nameAr: addon.nameAr, priceMinor: Math.round(Number(addon.price) * 100) })),
  }));
  const catalogHash = createHash("sha256").update(JSON.stringify({
    categories: [...catalogCategories].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
    products: [...catalogProducts].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
  })).digest("hex");
  const response = {
    device: { id: device.id, branchId: device.branchId, registerId: device.registerId },
    branch,
    register,
    serverTime: new Date().toISOString(),
    catalogVersion: Math.max(0, ...products.map((product) => product.updatedAt.getTime()), ...categories.map((category) => category.updatedAt.getTime())),
    catalogHash,
    categories: catalogCategories,
    products: catalogProducts,
    cashiers: await Promise.all([...cashierById.values()].map(async (cashier) => {
      const policy = { deviceId: device.id, userId: cashier.id, branchId: device.branchId, policyVersion: cashier.offlineCredentialVersion,
        canDiscount: cashier.canDiscount, maxDiscountPercent: Number(cashier.maxDiscountPercent),
        maxDiscountMinor: Math.round(Number(cashier.maxDiscountAmount) * 100), supervisor: cashier.supervisor };
      return { ...policy, id: cashier.id, cloudId: cashier.id, username: cashier.email, displayName: cashier.name, accountType:cashier.role,
        credentialHash: cashier.offlinePinHash, credentialSalt: cashier.offlinePinSalt, verifierKind: "scrypt-v1",
        offlineExpiresAt: cashier.offlinePinExpiresAt?.toISOString() ?? null, offlinePolicyToken: await issueOfflinePolicyToken(policy, cashier.offlinePinExpiresAt) };
    })),
    coupons: coupons.map((coupon) => ({ code:coupon.couponCode!,type:coupon.type,value:Number(coupon.value),startsAt:coupon.startsAt.toISOString(),endsAt:coupon.endsAt.toISOString(),active:coupon.active,maxUses:coupon.maxUses,usedCount:coupon.usedCount })),
  };
  await db.posDevice.update({ where: { id: device.id }, data: { lastSyncAt: new Date(), lastSyncError: null } });
  return NextResponse.json(response, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("POS device bootstrap failed:", error);
    const detail=error instanceof Error?error.message:"Unknown bootstrap error.";
    return NextResponse.json({ error: process.env.NODE_ENV === "production" ? "The POS bootstrap could not be completed." : detail }, { status: 500 });
  }
}
