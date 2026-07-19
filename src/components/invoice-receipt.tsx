"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Globe2, Printer } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BrandLogo } from "@/components/brand-logo";
import { useLanguage } from "@/components/language-provider";
import { PRINT_CONFIG } from "@/config/print";

type Invoice = {
  number: string;
  createdAt: string;
  subtotal: string | number;
  discountAmount: string | number;
  taxAmount: string | number;
  totalAmount: string | number;
  grandTotal: string | number;
  customerName?: string | null;
  customerNotes?: string | null;
  orderType: string;
  paymentMethod: string;
  cashier?: { name: string };
  branch?: {
    name?: string | null;
    nameAr?: string | null;
    phone?: string | null;
    address?: string | null;
  } | null;
  payments?: {
    method: string;
    status: string;
    amount: string | number;
    currencyCode?: string | null;
  }[];
  qrCode?: string | null;
  barcode?: string | null;
  items: {
    productNameSnapshot: string;
    quantity: number;
    unitPrice: string | number;
    selectedSizeSnapshot?: string | null;
    addons?: { nameSnapshot: string; priceSnapshot: string | number }[];
  }[];
};

type TranslationFn = ReturnType<typeof useLanguage>["t"];

export default function InvoiceReceipt({ number }: { number: string }) {
  const { t, locale, setLocale } = useLanguage();
  const searchParams = useSearchParams();
  const [data, setData] = useState<Invoice | null>(null);
  const [error, setError] = useState("");
  const autoPrintStarted = useRef(false);

  useEffect(() => {
    fetch(`/api/invoices/${encodeURIComponent(number)}`, { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json().catch(() => null);
        if (!response.ok)
          throw new Error(
            payload?.message || payload?.error || "Invoice not found",
          );
        setData(payload);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Invoice not found"),
      );
  }, [number]);

  useEffect(() => {
    if (!data || autoPrintStarted.current || !PRINT_CONFIG.ENABLE_AUTO_PRINT)
      return;

    const autoPrint = searchParams.get("autoPrint");
    const transactionId = searchParams.get("tx");
    const printToken = searchParams.get("printToken");
    if (autoPrint !== "1" || !transactionId || !printToken) return;

    const storageKey = autoPrintStorageKey(data.number, transactionId);
    if (sessionStorage.getItem(storageKey) !== printToken) return;

    autoPrintStarted.current = true;
    if (PRINT_CONFIG.REMOVE_PRINT_FLAG_AFTER_PRINT) {
      sessionStorage.removeItem(storageKey);
      const cleanUrl = `${window.location.pathname}${window.location.hash}`;
      window.history.replaceState(window.history.state, "", cleanUrl);
    }

    let cancelled = false;
    const printWhenReady = async () => {
      await waitForInvoiceRender();
      await nextFrame();
      if (cancelled) return;
      window.setTimeout(() => {
        if (!cancelled) printInvoice();
      }, PRINT_CONFIG.AUTO_PRINT_DELAY);
    };

    void printWhenReady();
    return () => {
      cancelled = true;
    };
  }, [data, searchParams]);

  const printRoot =
    data && typeof document !== "undefined"
      ? createPortal(
          <div id="print-root">
            <ReceiptArticle invoice={data} locale={locale} t={t} print />
          </div>,
          document.body,
        )
      : null;

  return (
    <main className="min-h-screen bg-background">
      <style>{`
        @media print {
          * {
            -webkit-print-color-adjust: ${PRINT_CONFIG.PRINT_BACKGROUND ? "exact" : "economy"};
            print-color-adjust: ${PRINT_CONFIG.PRINT_BACKGROUND ? "exact" : "economy"};
          }

          .print-invoice {
            font-size: 8.5px !important;
            line-height: 1.35 !important;
          }

          .print-invoice h2 {
            font-size: 13px !important;
          }

          .print-invoice svg {
            width: 34px !important;
            height: 34px !important;
          }
        }
      `}</style>
      {printRoot}
      <header className="no-print h-18 bg-surface border-b border-border px-4 sm:px-8 flex items-center">
        <Link href="/pos" className="btn-secondary flex items-center gap-2">
          <ArrowLeft size={17} className="rtl:rotate-180" />
          <span className="hidden sm:inline">{t("backToPos")}</span>
        </Link>
        <div className="ms-auto flex gap-2">
          <button
            onClick={() => setLocale(locale === "en" ? "ar" : "en")}
            className="btn-secondary flex gap-2 items-center"
          >
            <Globe2 size={17} />
            {t("language")}
          </button>
          <button
            onClick={async () => {
              await prepareAndPrintInvoice();
            }}
            className="btn-primary flex gap-2 items-center"
          >
            <Printer size={17} />
            {t("print")}
          </button>
        </div>
      </header>
      <div className="max-w-3xl mx-auto p-4 sm:p-10">
        <div className="no-print text-center mb-6">
          <CheckCircle2 size={42} className="text-success mx-auto" />
          <h1 className="text-2xl font-bold mt-3">
            {data ? "Payment completed" : error || "Loading..."}
          </h1>
          <p className="text-muted mt-1">Invoice #{number}</p>
        </div>
        {data && (
          <ReceiptArticle invoice={data} locale={locale} t={t} />
        )}
      </div>
    </main>
  );
}

function ReceiptArticle({
  invoice,
  locale,
  t,
  print = false,
}: {
  invoice: Invoice;
  locale: "en" | "ar";
  t: TranslationFn;
  print?: boolean;
}) {
  const total = (
    Number(invoice.grandTotal || 0) > 0
      ? Number(invoice.grandTotal)
      : Number(invoice.totalAmount)
  ).toFixed(2);

  const paymentDetails = invoice.payments
    ?.map(
      (payment) =>
        `${paymentLabel(payment.method, locale)} ${payment.currencyCode || "ILS"} ${Number(payment.amount || 0).toFixed(2)}`,
    )
    .join(", ");

  return (
    <article
      className={
        print
          ? "print-invoice receipt-print bg-white text-sm"
          : "receipt-print bg-white border border-border shadow-xl rounded-sm w-full max-w-[60mm] mx-auto p-7 text-sm"
      }
      dir="rtl"
    >
      <div className={print ? "print-invoice-content" : ""}>
        <div className="text-center">
          <BrandLogo variant="icon" className="mx-auto size-14" />
          <h2 dir="rtl" className="font-bold text-xl mt-3">
            شيخ الكار
          </h2>
          <p className="invoice-contact text-muted text-xs mt-1">
            {branchInfo(invoice, locale)}
          </p>
        </div>
        <div className="border-y border-dashed border-border py-4 my-5 text-xs space-y-1.5">
          <InfoRow label={t("invoice")} value={`#${invoice.number}`} strong />
          <InfoRow
            label={t("date")}
            value={new Date(invoice.createdAt).toLocaleString(
              locale === "ar" ? "ar" : "en",
              { dateStyle: "medium", timeStyle: "short" },
            )}
          />
          <InfoRow label={t("employee")} value={invoice.cashier?.name || "-"} />
          {invoice.customerName && (
            <InfoRow
              label={locale === "ar" ? "الزبون" : "Customer"}
              value={invoice.customerName}
              valueDir={locale === "ar" ? "rtl" : "ltr"}
            />
          )}
          <InfoRow
            label={t("payment")}
            value={paymentLabel(invoice.paymentMethod, locale)}
            valueDir={locale === "ar" ? "rtl" : "ltr"}
          />
          {paymentDetails && (
            <InfoRow
              label={locale === "ar" ? "تفاصيل الدفع" : "Payment details"}
              value={paymentDetails}
            />
          )}
          <InfoRow
            label={t("deliveryMethod")}
            value={deliveryLabel(invoice.orderType, locale)}
            valueDir={locale === "ar" ? "rtl" : "ltr"}
          />
          {invoice.customerNotes && (
            <InfoRow
              label={t("orderNotes")}
              value={invoice.customerNotes}
              valueDir={locale === "ar" ? "rtl" : "ltr"}
            />
          )}
        </div>
        <div className="space-y-4">
          {invoice.items.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-2"
            >
              <span>{item.quantity}×</span>
              <div className="min-w-0 break-anywhere">
                <b>{item.productNameSnapshot}</b>
                {item.selectedSizeSnapshot && (
                  <small className="block text-muted">
                    {item.selectedSizeSnapshot}
                  </small>
                )}
                {Boolean(item.addons?.length) && (
                  <small className="block text-muted">
                    {item.addons
                      ?.map((addon) => addon.nameSnapshot)
                      .join(", ")}
                  </small>
                )}
              </div>
              <span className="invoice-total-value">
                ₪ {(Number(item.unitPrice) * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-dashed border-border mt-5 pt-4 space-y-2">
          <TotalRow label={t("subtotal")} value={`₪ ${Number(invoice.subtotal).toFixed(2)}`} muted />
          {Number(invoice.discountAmount) > 0 && (
            <TotalRow
              label={t("discount")}
              value={`- ₪ ${Number(invoice.discountAmount).toFixed(2)}`}
              className="text-success"
            />
          )}
          {Number(invoice.taxAmount) > 0 && (
            <TotalRow label="Tax" value={`₪ ${Number(invoice.taxAmount).toFixed(2)}`} muted />
          )}
          <TotalRow
            label={t("total")}
            value={`₪ ${total}`}
            className="text-lg font-bold pt-2"
          />
        </div>
        {(invoice.qrCode || invoice.barcode) && (
          <div className="border-t border-dashed border-border mt-5 pt-5 text-center text-xs text-muted">
            {invoice.qrCode && (
              <img
                src={invoice.qrCode}
                alt="Invoice QR code"
                className="mx-auto size-24 object-contain"
              />
            )}
            {invoice.barcode && (
              <div className="mt-3 font-mono break-anywhere">
                {invoice.barcode}
              </div>
            )}
          </div>
        )}
        <div className="text-center border-t border-dashed border-border mt-5 pt-5">
          <b>{t("thanks")}</b>
          <p className="text-[10px] text-muted mt-2">
            Tax included · Tax no. 310048229
          </p>
        </div>
      </div>
    </article>
  );
}

function InfoRow({
  label,
  value,
  strong = false,
  valueDir = "ltr",
}: {
  label: string;
  value: string;
  strong?: boolean;
  valueDir?: "ltr" | "rtl";
}) {
  const ValueTag = strong ? "b" : "span";
  return (
    <div className="invoice-info-row">
      <ValueTag className="invoice-info-value" dir={valueDir}>
        {value}
      </ValueTag>
      <span className="invoice-info-label">{label}</span>
    </div>
  );
}

function TotalRow({
  label,
  value,
  muted = false,
  className = "",
}: {
  label: string;
  value: string;
  muted?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`invoice-total-row ${muted ? "text-muted" : ""} ${className}`}
    >
      <span className="invoice-total-value">{value}</span>
      <span className="invoice-total-label">{label}</span>
    </div>
  );
}

function autoPrintStorageKey(invoiceNumber: string, transactionId: string) {
  return `erp:auto-print:${invoiceNumber}:${transactionId}`;
}

async function waitForInvoiceRender() {
  await nextFrame();
  if ("fonts" in document) await document.fonts.ready.catch(() => undefined);
  const images = Array.from(
    document.querySelectorAll<HTMLImageElement>(".print-invoice img"),
  );
  await Promise.all(
    images.map((image) => {
      if (image.complete) return Promise.resolve();
      return new Promise<void>((resolve) => {
        image.addEventListener("load", () => resolve(), { once: true });
        image.addEventListener("error", () => resolve(), { once: true });
      });
    }),
  );
}

async function prepareAndPrintInvoice() {
  await waitForInvoiceRender();
  await nextFrame();
  printInvoice();
}

function printInvoice() {
  window.print();
}

function nextFrame() {
  return new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );
}

function branchInfo(data: Invoice, locale: "en" | "ar") {
  const branchName =
    locale === "ar"
      ? data.branch?.nameAr || data.branch?.name
      : data.branch?.name;
  const parts = [
    branchName || "Ramallah",
    data.branch?.phone || "+970 59 123 4567",
  ].filter(Boolean);
  return parts.join(" · ");
}

function paymentLabel(value: string, locale: "en" | "ar") {
  if (value === "CREDIT_CARD")
    return locale === "ar" ? "بطاقة / فيزا" : "Visa / Card";
  if (value === "BANK") return locale === "ar" ? "بنك" : "Bank";
  return locale === "ar" ? "نقداً" : "Cash";
}

function deliveryLabel(value: string, locale: "en" | "ar") {
  if (value === "DINE_IN") return locale === "ar" ? "داخل المطعم" : "Dine-in";
  if (value === "DELIVERY") return locale === "ar" ? "توصيل" : "Delivery";
  return locale === "ar" ? "سفري" : "Takeaway";
}
