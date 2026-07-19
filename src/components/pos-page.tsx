"use client";
/* eslint-disable react-hooks/set-state-in-effect */
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Banknote,
  ChevronDown,
  Clock3,
  CreditCard,
  Globe2,
  LogOut,
  Minus,
  ClipboardList,
  Plus,
  Search,
  ShoppingBag,
  Store,
  Trash2,
  X,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { useLanguage } from "@/components/language-provider";
import { products } from "@/lib/demo-data";

type Product = (typeof products)[number];
type CartItem = {
  key: string;
  product: Product;
  quantity: number;
  size?: { nameEn: string; nameAr: string; delta: number };
  addons: { nameEn: string; nameAr: string; price: number }[];
};
type InvoiceItemPayload = {
  id?: string;
  productId?: string | null;
  productNameSnapshot?: string;
  quantity?: number;
  unitPrice?: string | number;
  selectedSizeSnapshot?: string | null;
  addons?: { nameSnapshot?: string; priceSnapshot?: string | number }[];
};
type PaymentChoice = "CASH" | "CREDIT_CARD";
type DeliveryMethod = "DINE_IN" | "TAKEAWAY" | "DELIVERY";
export default function PosPage() {
  const { t, locale, setLocale } = useLanguage();
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [drawer, setDrawer] = useState(false);
  const [custom, setCustom] = useState<Product | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentChoice>("CASH");
  const [deliveryMethod, setDeliveryMethod] =
    useState<DeliveryMethod>("TAKEAWAY");
  const [orderNotes, setOrderNotes] = useState("");
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [customer, setCustomer] = useState({ name: "", phone: "" });
  const cats = ["All", ...new Set(products.map((p) => p.category))];
  const filtered = products.filter(
    (p) =>
      (category === "All" || p.category === category) &&
      (p.nameEn + p.nameAr).toLowerCase().includes(search.toLowerCase()),
  );
  function add(
    product: Product,
    size?: CartItem["size"],
    addons: CartItem["addons"] = [],
  ) {
    const key =
      product.id + (size?.nameEn || "") + addons.map((x) => x.nameEn).join();
    setCart((old) => {
      const existing = old.find((x) => x.key === key);
      return existing
        ? old.map((x) =>
            x.key === key ? { ...x, quantity: x.quantity + 1 } : x,
          )
        : [...old, { key, product, quantity: 1, size, addons }];
    });
    setCustom(null);
  }
  function qty(key: string, delta: number) {
    setCart((old) =>
      old
        .map((x) =>
          x.key === key ? { ...x, quantity: x.quantity + delta } : x,
        )
        .filter((x) => x.quantity > 0),
    );
  }
  const subtotal = cart.reduce(
    (sum, x) =>
      sum +
      (x.product.price +
        (x.size?.delta || 0) +
        x.addons.reduce((a, b) => a + b.price, 0)) *
        x.quantity,
    0,
  );
  const discount = subtotal >= 30 ? subtotal * 0.1 : 0;
  const total = subtotal - discount;
  useEffect(() => {
    const edit = new URLSearchParams(window.location.search).get("edit");
    if (!edit) return;
    setEditingInvoiceId(edit);
    setLoadingOrder(true);
    fetch(`/api/invoices/${encodeURIComponent(edit)}`)
      .then(async (response) => {
        const data = await response.json().catch(() => null);
        if (!response.ok)
          throw new Error(data?.message || data?.error || t("checkoutFailed"));
        const rows = Array.isArray(data.items) ? data.items : [];
        setCart(
          rows.map((row: InvoiceItemPayload, index: number) => {
            const product = productFromInvoiceItem(row);
            return {
              key: `${row.id || product.id}-${index}`,
              product,
              quantity: Number(row.quantity || 1),
              size: row.selectedSizeSnapshot
                ? {
                    nameEn: row.selectedSizeSnapshot,
                    nameAr: row.selectedSizeSnapshot,
                    delta: 0,
                  }
                : undefined,
              addons: Array.isArray(row.addons)
                ? row.addons.map((addon) => ({
                    nameEn: String(addon.nameSnapshot || ""),
                    nameAr: String(addon.nameSnapshot || ""),
                    price: Number(addon.priceSnapshot || 0),
                  }))
                : [],
            };
          }),
        );
        const method =
          data.paymentMethod === "CREDIT_CARD" ? "CREDIT_CARD" : "CASH";
        setPaymentMethod(method);
        setDeliveryMethod(normalizeDeliveryMethod(data.orderType));
        setOrderNotes(data.customerNotes || "");
        setCustomer({
          name: data.customerName || "",
          phone: data.customerPhone || "",
        });
      })
      .catch((error) =>
        alert(error instanceof Error ? error.message : t("checkoutFailed")),
      )
      .finally(() => setLoadingOrder(false));
  }, [t]);
  function startCheckout() {
    if (!cart.length || checkingOut) return;
    setConfirming(true);
  }
  async function checkout() {
    if (checkingOut || !cart.length) return;
    setCheckingOut(true);
    try {
      const payload = {
        orderType: deliveryMethod,
        clientTransactionId: editingInvoiceId || crypto.randomUUID(),
        idempotencyKey: editingInvoiceId || crypto.randomUUID(),
        customerName: customer.name || undefined,
        customerPhone: customer.phone || undefined,
        customerNotes: orderNotes.trim() || undefined,
        items: cart.map((x) => ({
          productId: x.product.id,
          categoryId: x.product.category,
          productName: locale === "ar" ? x.product.nameAr : x.product.nameEn,
          quantity: x.quantity,
          unitPrice:
            x.product.price +
            (x.size?.delta || 0) +
            x.addons.reduce((a, b) => a + b.price, 0),
          selectedSize: x.size?.[locale === "ar" ? "nameAr" : "nameEn"],
          addons: x.addons.map((a) => ({
            name: locale === "ar" ? a.nameAr : a.nameEn,
            price: a.price,
          })),
        })),
        discountAmount: discount,
        payments: [
          {
            method: paymentMethod,
            currencyCode: "ILS",
            amount: total,
            changeAmount: 0,
            ...(paymentMethod === "CREDIT_CARD"
              ? { cardType: "VISA", transactionReference: `POS-${Date.now()}` }
              : {}),
          },
        ],
      };
      const res = await fetch(
        editingInvoiceId
          ? `/api/invoices/${encodeURIComponent(editingInvoiceId)}`
          : "/api/invoices",
        {
          method: editingInvoiceId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const text = await res.text();
      const data = text ? JSON.parse(text) : null;
      if (!res.ok) {
        if (res.status === 409) window.location.href = "/cash/open";
        else alert(data?.message || data?.error || t("checkoutFailed"));
        return;
      }
      window.location.href = `/invoice/${data.number}`;
    } catch (error) {
      alert(error instanceof Error ? error.message : t("checkoutFailed"));
    } finally {
      setCheckingOut(false);
      setConfirming(false);
    }
  }
  const cartPanel = (
    <CartPanel
      cart={cart}
      qty={qty}
      subtotal={subtotal}
      discount={discount}
      total={total}
      checkout={startCheckout}
      checkingOut={checkingOut}
      editing={Boolean(editingInvoiceId)}
    />
  );
  return (
    <main className="h-dvh flex flex-col bg-background overflow-hidden">
      <header className="h-[72px] shrink-0 bg-sidebar text-white flex items-center px-4 sm:px-6 gap-4">
        <Link href="/pos" className="min-w-0">
          <BrandLogo className="max-w-[190px]" />
        </Link>
        <div className="hidden md:flex ms-5 items-center gap-2 text-sm text-sidebar-muted">
          <Store size={17} />
          <b className="text-white">{t("mainBranch")}</b>
          <ChevronDown size={15} />
        </div>
        <div className="ms-auto flex items-center gap-2">
          <span className="hidden sm:flex items-center gap-2 text-xs text-sidebar-muted me-2">
            <Clock3 size={15} />
            <span suppressHydrationWarning>
              {new Date().toLocaleTimeString(locale === "ar" ? "ar" : "en", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </span>
          <Link
            href="/orders"
            className="size-10 rounded-xl bg-white/10 grid place-items-center"
            title={t("orders")}
          >
            <ClipboardList size={18} />
          </Link>
          <button
            onClick={() => setLocale(locale === "en" ? "ar" : "en")}
            className="h-10 px-3 rounded-xl bg-white/10 flex items-center gap-2 text-sm"
          >
            <Globe2 size={17} />
            <span className="hidden sm:inline">{t("language")}</span>
          </button>
          <form action="/api/auth/logout" method="post">
            <button className="size-10 rounded-xl bg-white/10 grid place-items-center">
              <LogOut size={18} />
            </button>
          </form>
        </div>
      </header>
      <div className="flex flex-1 min-h-0">
        <section className="flex-1 min-w-0 flex flex-col">
          <div className="p-3 sm:p-5 pb-2 bg-surface border-b border-border">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search
                  className="absolute start-4 top-3.5 text-muted"
                  size={19}
                />
                <input
                  className="input input-icon-start"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("search") + " products…"}
                />
              </div>
              <Link
                href="/cash/open"
                className="btn-secondary !px-3"
                title="Open cash register"
              >
                <Banknote size={18} />
              </Link>
              <Link
                href="/cash/close"
                className="btn-secondary !px-3"
                title="Close cash register"
              >
                <Store size={18} />
              </Link>
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-none mt-4 pb-2">
              {cats.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`h-10 px-4 rounded-xl whitespace-nowrap text-sm font-semibold transition ${category === c ? "bg-secondary text-white" : "bg-background text-muted hover:text-text"}`}
                >
                  {c === "All"
                    ? t("allCategories")
                    : locale === "ar"
                      ? products.find((p) => p.category === c)?.categoryAr
                      : c}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold">
                  {editingInvoiceId
                    ? `${t("editOrder")} #${editingInvoiceId}`
                    : category === "All"
                      ? t("products")
                      : category}
                </h1>
                <p className="text-xs text-muted mt-1">
                  {loadingOrder
                    ? t("processing")
                    : `${filtered.length} ${t("items")}`}
                </p>
              </div>
              <button
                className="text-sm text-primary font-bold"
                onClick={() => {
                  setEditingInvoiceId(null);
                  setCart([]);
                  setCustomer({ name: "", phone: "" });
                  window.history.replaceState(null, "", "/pos");
                }}
              >
                {editingInvoiceId ? t("newOrder") : t("newOrder")}
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
              {filtered.map((p) => (
                <button
                  key={p.id}
                  onClick={() =>
                    p.sizes.length || p.addons.length ? setCustom(p) : add(p)
                  }
                  className="card overflow-hidden text-start group active:scale-[.98] transition"
                >
                  <div className="h-24 sm:h-28 bg-background grid place-items-center text-5xl group-hover:scale-105 transition-transform">
                    {p.emoji}
                  </div>
                  <div className="p-3">
                    <p className="font-bold text-sm sm:text-base truncate">
                      {locale === "ar" ? p.nameAr : p.nameEn}
                    </p>
                    <p className="text-muted text-xs truncate mt-1 hidden sm:block">
                      {locale === "ar" ? p.descriptionAr : p.descriptionEn}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <b className="text-primary text-sm">
                        ₪ {p.price.toFixed(2)}
                      </b>
                      <span className="size-8 rounded-lg bg-primary text-black grid place-items-center">
                        <Plus size={17} />
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
        <aside className="hidden min-[900px]:flex w-[370px] xl:w-[410px] shrink-0 bg-surface border-s border-border flex-col">
          {cartPanel}
        </aside>
      </div>
      {cart.length > 0 && (
        <div className="min-[900px]:hidden fixed bottom-3 start-3 end-3 z-30 rounded-2xl bg-primary text-white shadow-xl p-2 flex items-center gap-2">
          <button
            onClick={() => setDrawer(true)}
            className="flex items-center gap-2 px-2 min-w-0 flex-1"
          >
            <ShoppingBag size={20} className="shrink-0" />
            <span className="font-bold text-sm whitespace-nowrap">
              {cart.reduce((a, b) => a + b.quantity, 0)} {t("items")}
            </span>
          </button>
          <b className="px-2 text-sm whitespace-nowrap">₪ {total.toFixed(2)}</b>
          <button
            onClick={() => setDrawer(true)}
            className="rounded-xl bg-white/15 px-3 py-2 text-sm font-bold whitespace-nowrap"
          >
            {t("continueCheckout")} →
          </button>
        </div>
      )}
      {drawer && (
        <div
          className="fixed inset-0 z-50 min-[900px]:hidden bg-text/40 flex items-end animate-in fade-in"
          onClick={() => setDrawer(false)}
        >
          <div
            className="bg-surface w-full max-h-[88vh] rounded-t-3xl flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1 w-12 bg-border rounded-full mx-auto mt-3" />
            <button
              onClick={() => setDrawer(false)}
              className="absolute end-4 mt-5 size-9 grid place-items-center"
            >
              <X />
            </button>
            {cartPanel}
          </div>
        </div>
      )}
      {custom && (
        <CustomizeModal
          product={custom}
          close={() => setCustom(null)}
          add={add}
        />
      )}
      {confirming && (
        <CheckoutConfirmDialog
          total={total}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          deliveryMethod={deliveryMethod}
          setDeliveryMethod={setDeliveryMethod}
          orderNotes={orderNotes}
          setOrderNotes={setOrderNotes}
          customer={customer}
          setCustomer={setCustomer}
          loading={checkingOut}
          onClose={() => setConfirming(false)}
          onConfirm={checkout}
        />
      )}
    </main>
  );
}

function CartPanel({
  cart,
  qty,
  subtotal,
  discount,
  total,
  checkout,
  checkingOut,
  editing,
}: {
  cart: CartItem[];
  qty: (k: string, d: number) => void;
  subtotal: number;
  discount: number;
  total: number;
  checkout: () => void;
  checkingOut: boolean;
  editing: boolean;
}) {
  const { t, locale } = useLanguage();
  return (
    <>
      <div className="p-5 border-b border-border">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-bold text-xl">
              {t("order")} <span className="text-muted">#1049</span>
            </h2>
            <p className="text-xs text-muted mt-1">
              Main Branch · Cashier Omar
            </p>
          </div>
          {cart.length > 0 && (
            <span className="size-9 bg-primary-soft text-primary rounded-lg grid place-items-center">
              <ShoppingBag size={18} />
            </span>
          )}
        </div>
      </div>
      {cart.length === 0 ? (
        <div className="flex-1 grid place-items-center text-center p-8">
          <div>
            <span className="size-16 rounded-full bg-background grid place-items-center mx-auto text-muted">
              <ShoppingBag size={26} />
            </span>
            <h3 className="font-bold mt-4">{t("emptyCart")}</h3>
            <p className="text-sm text-muted mt-2">{t("emptyCartHint")}</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24 min-[900px]:pb-4">
          {cart.map((item) => (
            <div key={item.key} className="bg-background rounded-xl p-3">
              <div className="flex gap-3">
                <span className="size-11 rounded-lg bg-surface grid place-items-center text-2xl">
                  {item.product.emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2">
                    <b className="text-sm truncate">
                      {locale === "ar"
                        ? item.product.nameAr
                        : item.product.nameEn}
                    </b>
                    <b className="text-sm">
                      ₪{" "}
                      {(
                        (item.product.price +
                          (item.size?.delta || 0) +
                          item.addons.reduce((a, b) => a + b.price, 0)) *
                        item.quantity
                      ).toFixed(2)}
                    </b>
                  </div>
                  {item.size && (
                    <p className="text-[11px] text-muted mt-1">
                      {locale === "ar" ? item.size.nameAr : item.size.nameEn}
                      {item.addons.length
                        ? " · " +
                          item.addons
                            .map((x) => (locale === "ar" ? x.nameAr : x.nameEn))
                            .join(", ")
                        : ""}
                    </p>
                  )}
                  <div className="flex items-center mt-3">
                    <button
                      onClick={() => qty(item.key, -1)}
                      className="size-10 rounded-lg bg-surface border border-border grid place-items-center"
                    >
                      {item.quantity === 1 ? (
                        <Trash2 size={15} className="text-danger" />
                      ) : (
                        <Minus size={15} />
                      )}
                    </button>
                    <b className="w-10 text-center text-sm">{item.quantity}</b>
                    <button
                      onClick={() => qty(item.key, 1)}
                      className="size-10 rounded-lg bg-surface border border-border grid place-items-center"
                    >
                      <Plus size={15} />
                    </button>
                    <span className="ms-auto text-xs text-muted">
                      ₪{" "}
                      {(
                        item.product.price +
                        (item.size?.delta || 0) +
                        item.addons.reduce((a, b) => a + b.price, 0)
                      ).toFixed(2)}{" "}
                      ea.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="p-4 sm:p-5 border-t border-border bg-surface">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-muted">
            <span>{t("subtotal")}</span>
            <span>₪ {subtotal.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-success">
              <span>{t("discount")} · Lunch Hour</span>
              <span>− ₪ {discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg pt-3 border-t border-dashed border-border">
            <b>{t("total")}</b>
            <b>₪ {total.toFixed(2)}</b>
          </div>
        </div>
        <button
          disabled={!cart.length || checkingOut}
          onClick={checkout}
          className="btn-primary w-full mt-4 disabled:opacity-40 flex items-center justify-between px-5"
        >
          <span>
            {checkingOut
              ? t("processing")
              : editing
                ? t("save")
                : t("checkout")}
          </span>
          <span>₪ {total.toFixed(2)}</span>
        </button>
        <p className="text-center text-[11px] text-muted mt-2">
          {t("cashOnly")} · VAT included
        </p>
      </div>
    </>
  );
}

function productFromInvoiceItem(row: InvoiceItemPayload): Product {
  const name = row.productNameSnapshot || "Edited item";
  const found = products.find(
    (product) =>
      product.id === row.productId ||
      product.nameEn === name ||
      product.nameAr === name,
  );
  if (found) return { ...found, price: Number(row.unitPrice ?? found.price) };
  return {
    id: row.productId || `edited-${row.id || name}`,
    nameEn: name,
    nameAr: name,
    descriptionEn: "",
    descriptionAr: "",
    price: Number(row.unitPrice || 0),
    category: "Edited",
    categoryAr: "معدل",
    emoji: "🍽️",
    color: "sand",
    active: true,
    sizes: [],
    addons: [],
  };
}

function normalizeDeliveryMethod(value: unknown): DeliveryMethod {
  if (value === "DINE_IN" || value === "DELIVERY") return value;
  return "TAKEAWAY";
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted">{label}</span>
      <b className="text-end break-words">{value}</b>
    </div>
  );
}

function CheckoutConfirmDialog({
  total,
  paymentMethod,
  setPaymentMethod,
  deliveryMethod,
  setDeliveryMethod,
  orderNotes,
  setOrderNotes,
  customer,
  setCustomer,
  loading,
  onClose,
  onConfirm,
}: {
  total: number;
  paymentMethod: PaymentChoice;
  setPaymentMethod: (value: PaymentChoice) => void;
  deliveryMethod: DeliveryMethod;
  setDeliveryMethod: (value: DeliveryMethod) => void;
  orderNotes: string;
  setOrderNotes: (value: string) => void;
  customer: { name: string; phone: string };
  setCustomer: (value: { name: string; phone: string }) => void;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { t } = useLanguage();
  const deliveryOptions: { value: DeliveryMethod; label: string }[] = [
    { value: "DINE_IN", label: t("dineIn") },
    { value: "TAKEAWAY", label: t("takeaway") },
    { value: "DELIVERY", label: t("delivery") },
  ];
  return (
    <div
      className="fixed inset-0 z-[70] bg-text/50 grid place-items-center p-4"
      onMouseDown={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        className="card w-full max-w-md max-h-[90vh] overflow-y-auto p-5 shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-3 ">
          <span className="size-11 rounded-xl bg-primary-soft text-primary grid place-items-center">
            <ShoppingBag size={20} />
          </span>
          <div className="flex-1">
            <h2 className="font-bold text-xl">{t("confirmOrder")}</h2>
            <p className="text-sm text-muted mt-2">
              {t("confirmOrderMessage")}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="size-9 grid place-items-center"
          >
            <X size={18} />
          </button>
        </div>
        <div className="mt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            <input
              className="input"
              value={customer.name}
              onChange={(event) =>
                setCustomer({ ...customer, name: event.target.value })
              }
              placeholder={t("customerName")}
            />
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              className="input"
              value={customer.phone}
              onChange={(event) => {
                const phone = event.target.value
                  .replace(/\D/g, "")
                  .slice(0, 10);

                setCustomer({
                  ...customer,
                  phone,
                });
              }}
              placeholder={t("phone")}
            />
          </div>
          <p className="text-xs font-bold mb-2">{t("paymentMethod")}</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod("CASH")}
              className={`h-12 rounded-xl border font-bold flex items-center justify-center gap-2 ${paymentMethod === "CASH" ? "border-primary bg-primary-soft text-primary" : "border-border"}`}
            >
              <Banknote size={17} />
              {t("cash")}
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("CREDIT_CARD")}
              className={`h-12 rounded-xl border font-bold flex items-center justify-center gap-2 ${paymentMethod === "CREDIT_CARD" ? "border-primary bg-primary-soft text-primary" : "border-border"}`}
            >
              <CreditCard size={17} />
              {t("cardPayment")}
            </button>
          </div>
          <button
            type="button"
            disabled
            className="mt-2 h-10 w-full rounded-xl border border-dashed border-border text-sm text-muted"
          >
            {t("splitPayment")}
          </button>
          <p className="text-xs font-bold mb-2 mt-4">{t("deliveryMethod")}</p>
          <div className="grid grid-cols-3 gap-2">
            {deliveryOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setDeliveryMethod(option.value)}
                className={`min-h-12 rounded-xl border px-2 text-sm font-bold ${deliveryMethod === option.value ? "border-primary bg-primary-soft text-primary" : "border-border"}`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <label className="mt-4 block">
            <span className="text-xs font-bold mb-2 block">
              {t("orderNotes")}
            </span>
            <textarea
              className="input min-h-24 resize-none py-3"
              value={orderNotes}
              onChange={(event) => setOrderNotes(event.target.value)}
              placeholder={t("orderNotesPlaceholder")}
            />
          </label>
        </div>
        <div className="mt-5 rounded-xl bg-background p-4 text-sm space-y-2">
          <SummaryRow label={t("customerName")} value={customer.name || "-"} />
          <SummaryRow
            label={t("payment")}
            value={
              paymentMethod === "CREDIT_CARD" ? t("cardPayment") : t("cash")
            }
          />
          <SummaryRow
            label={t("deliveryMethod")}
            value={
              deliveryOptions.find((option) => option.value === deliveryMethod)
                ?.label || "-"
            }
          />
          <SummaryRow
            label={t("orderNotes")}
            value={orderNotes.trim() || t("noNotes")}
          />
          <div className="flex justify-between border-t border-dashed border-border pt-2 text-base">
            <span className="text-muted">{t("total")}</span>
            <b>₪ {total.toFixed(2)}</b>
          </div>
        </div>
        <div className="mt-5 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
          <button
            className="btn-secondary"
            disabled={loading}
            onClick={onClose}
          >
            {t("cancel")}
          </button>
          <button
            className="btn-primary"
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? t("processing") : t("confirmOrder")}
          </button>
        </div>
      </section>
    </div>
  );
}

function CustomizeModal({
  product,
  close,
  add,
}: {
  product: Product;
  close: () => void;
  add: (p: Product, s?: CartItem["size"], a?: CartItem["addons"]) => void;
}) {
  const { t, locale } = useLanguage();
  const [size, setSize] = useState(product.sizes[0]);
  const [addons, setAddons] = useState<Product["addons"]>([]);
  const total =
    product.price +
    (size?.delta || 0) +
    addons.reduce((a, b) => a + b.price, 0);
  return (
    <div
      className="fixed inset-0 z-[60] bg-text/50 grid place-items-center p-4"
      onClick={close}
    >
      <div
        className="card w-full max-w-md p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex gap-4 items-center">
          <span className="size-16 rounded-2xl bg-background grid place-items-center text-4xl">
            {product.emoji}
          </span>
          <div>
            <h2 className="font-bold text-xl">
              {locale === "ar" ? product.nameAr : product.nameEn}
            </h2>
            <p className="text-sm text-muted mt-1">
              {locale === "ar" ? product.descriptionAr : product.descriptionEn}
            </p>
          </div>
          <button onClick={close} className="ms-auto self-start">
            <X size={20} />
          </button>
        </div>
        {product.sizes.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-bold mb-3">{t("size")}</h3>
            <div className="grid grid-cols-2 gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s.nameEn}
                  onClick={() => setSize(s)}
                  className={`p-3 rounded-xl border text-start ${size?.nameEn === s.nameEn ? "border-primary bg-primary-soft" : "border-border"}`}
                >
                  <b className="text-sm">
                    {locale === "ar" ? s.nameAr : s.nameEn}
                  </b>
                  <small className="block text-muted mt-1">
                    {s.delta ? `+ ₪ ${s.delta.toFixed(2)}` : "Included"}
                  </small>
                </button>
              ))}
            </div>
          </div>
        )}
        {product.addons.length > 0 && (
          <div className="mt-5">
            <h3 className="text-sm font-bold mb-3">{t("addons")}</h3>
            <div className="space-y-2">
              {product.addons.map((a) => (
                <label
                  key={a.nameEn}
                  className="flex items-center p-3 rounded-xl bg-background"
                >
                  <input
                    type="checkbox"
                    className="size-4 accent-primary"
                    checked={addons.some((x) => x.nameEn === a.nameEn)}
                    onChange={(e) =>
                      setAddons(
                        e.target.checked
                          ? [...addons, a]
                          : addons.filter((x) => x.nameEn !== a.nameEn),
                      )
                    }
                  />
                  <span className="ms-3 text-sm font-semibold">
                    {locale === "ar" ? a.nameAr : a.nameEn}
                  </span>
                  <span className="ms-auto text-xs text-muted">
                    {a.price ? `+ ₪ ${a.price.toFixed(2)}` : "Free"}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
        <button
          onClick={() => add(product, size, addons)}
          className="btn-primary w-full mt-6 flex justify-between items-center px-5 "
        >
          <span>{t("addToOrder")}</span>
          <span>₪ {total.toFixed(2)}</span>
        </button>
      </div>
    </div>
  );
}
