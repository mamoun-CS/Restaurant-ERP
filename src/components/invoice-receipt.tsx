"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Globe2, Printer, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { useLanguage } from "@/components/language-provider";

type Invoice = {
  id?: string;
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
  receiptHtml?: string;
  items: {
    productNameSnapshot: string;
    quantity: number;
    unitPrice: string | number;
    selectedSizeSnapshot?: string | null;
    addons?: { nameSnapshot: string; priceSnapshot: string | number }[];
  }[];
};

type TranslationFn = ReturnType<typeof useLanguage>["t"];
type PrintState = {
  loading: boolean;
  message: string;
  tone: "success" | "error" | "info";
  jobId?: string;
  status?: "PENDING" | "SENT" | "PROCESSING" | "PRINTED" | "FAILED" | "CANCELLED";
};

export default function InvoiceReceipt({ number }: { number: string }) {
  const { t, locale, setLocale } = useLanguage();
  const searchParams = useSearchParams();
  const [data, setData] = useState<Invoice | null>(null);
  const [error, setError] = useState("");
  const [printState, setPrintState] = useState<PrintState>({
    loading: false,
    message: "",
    tone: "info",
  });
  const autoPrintStarted = useRef(false);
  const inFlightPrint = useRef(false);
  const receiptPreviewHtml = useMemo(
    () => (data?.receiptHtml ? extractReceiptPreviewHtml(data.receiptHtml) : ""),
    [data],
  );

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

  const sendToPrintAgent = useCallback(async (mode: "PRINT" | "REPRINT") => {
    if (!data || inFlightPrint.current) return;
    inFlightPrint.current = true;
    setPrintState({
      loading: true,
      message:
        locale === "ar"
          ? "جارٍ إرسال الفاتورة إلى وكيل الطباعة..."
          : "Sending invoice to Print Agent...",
      tone: "info",
    });
    try {
      const response = await fetch(
        `/api/printing/invoices/${encodeURIComponent(data.id || data.number)}/print`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode, requestId: crypto.randomUUID() }),
        },
      );
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.success) {
        throw new Error(
          payload?.message ||
            (locale === "ar"
              ? "تعذر إرسال الفاتورة إلى وكيل الطباعة."
              : "Invoice could not be sent to Print Agent."),
        );
      }
      setPrintState({
        loading: false,
        tone: "info",
        jobId: payload.job?.id,
        status: payload.job?.status,
        message:
          mode === "REPRINT"
            ? locale === "ar"
              ? "تمت إضافة إعادة الطباعة إلى قائمة انتظار الفواتير. بانتظار وكيل الطباعة..."
              : "Reprint is in the invoice queue. Waiting for Print Agent..."
            : locale === "ar"
              ? "تمت إضافة الفاتورة إلى قائمة انتظار الطباعة. بانتظار وكيل الطباعة..."
              : "Invoice is in the print queue. Waiting for Print Agent...",
      });
    } catch (err) {
      setPrintState({
        loading: false,
        tone: "error",
        message:
          err instanceof Error
            ? err.message
            : locale === "ar"
              ? "فشلت الطباعة عبر وكيل الطباعة."
              : "Print Agent request failed.",
      });
    } finally {
      inFlightPrint.current = false;
    }
  }, [data, locale]);

  useEffect(() => {
    if (!printState.jobId || printState.status === "PRINTED" || printState.status === "FAILED" || printState.status === "CANCELLED") return;
    let stopped = false;
    const timer = window.setInterval(async () => {
      try {
        const response = await fetch(`/api/printing/jobs/${encodeURIComponent(printState.jobId!)}`, { cache: "no-store" });
        const payload = await response.json().catch(() => null);
        if (!response.ok || !payload?.success || stopped) return;
        setPrintState((current) => ({
          ...current,
          loading: false,
          status: payload.job.status,
          tone: statusTone(payload.job.status),
          message: statusMessage(payload.job.status, locale, payload.job.errorMessage),
        }));
        if (["PRINTED", "FAILED", "CANCELLED"].includes(payload.job.status)) {
          window.clearInterval(timer);
        }
      } catch {
        if (!stopped) {
          setPrintState((current) => ({
            ...current,
            loading: false,
            tone: "info",
            message: locale === "ar" ? "بانتظار تحديث حالة الطباعة..." : "Waiting for print status update...",
          }));
        }
      }
    }, 2000);
    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }, [locale, printState.jobId, printState.status]);

  useEffect(() => {
    if (!data || autoPrintStarted.current) return;

    const autoPrint = searchParams.get("autoPrint");
    const transactionId = searchParams.get("tx");
    const printToken = searchParams.get("printToken");
    if (autoPrint !== "1" || !transactionId || !printToken) return;

    const storageKey = autoPrintStorageKey(data.number, transactionId);
    if (sessionStorage.getItem(storageKey) !== printToken) return;

    autoPrintStarted.current = true;
    sessionStorage.removeItem(storageKey);
    const cleanUrl = `${window.location.pathname}${window.location.hash}`;
    window.history.replaceState(window.history.state, "", cleanUrl);
    window.setTimeout(() => {
      void sendToPrintAgent("PRINT");
    }, 0);
  }, [data, searchParams, sendToPrintAgent]);

  return (
    <main className="min-h-screen bg-background">
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
            disabled={!data || printState.loading}
            onClick={() => void sendToPrintAgent("PRINT")}
            className="btn-primary flex gap-2 items-center"
          >
            {printState.loading ? (
              <RefreshCw className="animate-spin" size={17} />
            ) : (
              <Printer size={17} />
            )}
            {locale === "ar" ? "طباعة الفاتورة" : "Print Invoice"}
          </button>
          <button
            disabled={!data || printState.loading}
            onClick={() => void sendToPrintAgent("REPRINT")}
            className="btn-secondary flex gap-2 items-center"
          >
            <Printer size={17} />
            {locale === "ar" ? "إعادة الطباعة" : "Reprint Invoice"}
          </button>
        </div>
      </header>
     <div className="invoice-page-content w-full px-4 py-6 sm:px-8 sm:py-10 lg:px-12">
  <div className="no-print text-center mb-6">
    <CheckCircle2 size={42} className="text-success mx-auto" />

    <h1 className="text-2xl font-bold mt-3">
      {data
        ? locale === "ar"
          ? "تم إتمام الدفع"
          : "Payment completed"
        : error || (locale === "ar" ? "جارٍ التحميل..." : "Loading...")}
    </h1>

    <p className="text-muted mt-1">Invoice #{number}</p>
  </div>

  <div className="w-full">
    {printState.message && (
      <div
        className={`no-print mb-5 rounded-xl border px-4 py-3 text-sm font-bold ${
          printState.tone === "success"
            ? "border-success/25 bg-success/10 text-success"
            : printState.tone === "error"
              ? "border-danger/25 bg-danger/10 text-danger"
              : "border-border bg-surface text-muted"
        }`}
      >
        {printState.message}

        {printState.jobId && (
          <span className="ms-2 font-mono text-xs opacity-75">
            #{printState.jobId.slice(-8)}
          </span>
        )}
      </div>
    )}

    <div className="receipt-stage">
      {receiptPreviewHtml ? (
        <div
          className="receipt-preview-shell"
          dangerouslySetInnerHTML={{ __html: receiptPreviewHtml }}
        />
      ) : (
        data && <ReceiptArticle invoice={data} locale={locale} t={t} />
      )}
    </div>
  </div>
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
          : "receipt-fixed receipt-print bg-white border border-border shadow-xl rounded-sm p-7 text-sm"
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

function extractReceiptPreviewHtml(html: string) {
  if (typeof window !== "undefined" && "DOMParser" in window) {
    const document = new DOMParser().parseFromString(html, "text/html");
    const receipt = document.body.querySelector(".receipt");
    if (receipt) return receipt.outerHTML;
    return document.body.innerHTML;
  }

  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<head[\s\S]*?<\/head>/gi, "")
    .replace(/<\/?(?:!doctype|html|body)[^>]*>/gi, "");
}

function statusTone(status: PrintState["status"]): PrintState["tone"] {
  if (status === "PRINTED") return "success";
  if (status === "FAILED" || status === "CANCELLED") return "error";
  return "info";
}

function statusMessage(status: PrintState["status"], locale: "en" | "ar", errorMessage?: string) {
  const ar = locale === "ar";
  if (status === "PRINTED") return ar ? "تمت الطباعة بنجاح." : "Printed successfully.";
  if (status === "PROCESSING") return ar ? "وكيل الطباعة يعالج الفاتورة الآن..." : "Print Agent is printing the invoice...";
  if (status === "SENT") return ar ? "تم إرسال الفاتورة إلى وكيل الطباعة. بانتظار الطباعة..." : "Invoice sent to Print Agent. Waiting for print...";
  if (status === "FAILED") return errorMessage || (ar ? "فشلت الطباعة. تحقق من وكيل الطباعة أو الطابعة." : "Printing failed. Check the Print Agent or printer.");
  if (status === "CANCELLED") return ar ? "تم إلغاء مهمة الطباعة." : "Print job was cancelled.";
  return ar ? "الفاتورة في قائمة انتظار الطباعة." : "Invoice is waiting in the print queue.";
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
