export type ProductSummary = {
  id: string; sku: string; barcode: string | null; nameEn: string; nameAr: string;
  priceMinor: number; currencyCode: string;
};

export type CheckoutInput = {
  idempotencyKey: string; deviceId: string; shiftId?: string; currencyCode: string;
  discountMinor?: number; discountReason?: string; taxMinor?: number;
  supervisorAuthorization?: { username: string; pin: string };
  items: { productId: string; quantity: number; unitPriceMinor?: number; options?: unknown[] }[];
  payments: { method: "CASH" | "CREDIT_CARD" | "BANK"; amountMinor: number; currencyCode: string; processorReference?: string }[];
};

export type AuthorizedCheckoutInput = Omit<CheckoutInput, "supervisorAuthorization"> & {
  cashierPolicyToken: string; supervisorId?: string; supervisorPolicyToken?: string;
};

export type OfflineSaleUpload = {
  id: string; idempotencyKey: string; cashierId: string; createdAt: string; currencyCode: "ILS";
  subtotalMinor: number; discountMinor: number; taxMinor: number; totalMinor: number;
  discountReason?: string; cashierPolicyToken: string; supervisorId?: string; supervisorPolicyToken?: string;
  items: { productId: string; productName: string; quantity: number; unitPriceMinor: number; options: {name:string;priceMinor:number}[] }[];
  payments: { method: "CASH"; currencyCode: "ILS"; amountMinor: number; processorReference?: string }[];
};

export type BootstrapSnapshot = {
  device: { id: string; branchId: string; registerId: string | null };
  branch: { id: string; code: string; name: string; nameAr: string; address: string | null } | null;
  register: { id: string; number: string; name: string } | null;
  serverTime: string; catalogVersion: number;
  categories: { id:string;cloudId:string;nameEn:string;nameAr:string;sortOrder:number;active:boolean;serverVersion:number }[];
  products: { id:string;cloudId:string;sku:string;barcode:string|null;nameEn:string;nameAr:string;categoryId:string;priceMinor:number;currencyCode:string;active:boolean;serverVersion:number;sizes:unknown[];addons:unknown[] }[];
  cashiers: { id:string;cloudId:string;username:string;displayName:string;credentialHash:string|null;credentialSalt:string|null;verifierKind:string;policyVersion:number;offlineExpiresAt:string;canDiscount:boolean;maxDiscountPercent:number;maxDiscountMinor:number;supervisor:boolean;offlinePolicyToken:string }[];
};
