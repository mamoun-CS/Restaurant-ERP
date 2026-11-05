"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Copy,
  Database,
  Monitor,
  Printer,
  RefreshCw,
  RotateCcw,
  Sparkles,
  TestTube2,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useLanguage } from "@/components/language-provider";

interface DiagnosticItem {
  id: string;
  category: "DATABASE" | "SECURITY" | "AGENT" | "PRINTER" | "DRAWER" | "JOBS";
  titleAr: string;
  titleEn: string;
  status: "pass" | "warn" | "fail";
  detailsAr: string;
  detailsEn: string;
  fixAr?: string;
  fixEn?: string;
}

interface ReadinessResponse {
  success: boolean;
  timestamp: string;
  overallStatus: "pass" | "warn" | "fail";
  checks: DiagnosticItem[];
  metrics: {
    dbLatencyMs: number;
    appliedMigrationsCount: number;
    pairedDevicesCount: number;
    onlineDevicesCount: number;
    configuredPrintersCount: number;
    pendingJobsCount: number;
    failedJobsCount: number;
    defaultPaperSize: string;
  };
}

export default function ReadinessPage() {
  const { locale } = useLanguage();
  const ar = locale === "ar";

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReadinessResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: "success" | "danger"; text: string } | null>(null);

  const [retryingJobs, setRetryingJobs] = useState(false);
  const [testingDrawer, setTestingDrawer] = useState(false);
  const [testingPrint, setTestingPrint] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);

  const fetchReadiness = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/printing/readiness", { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`Failed to load readiness checks: HTTP ${res.status}`);
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown diagnostic error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchReadiness();
  }, [fetchReadiness]);

  async function handleRetryFailedJobs() {
    setRetryingJobs(true);
    setNotice(null);
    try {
      const res = await fetch("/api/printing/readiness/retry-failed", {
        method: "POST",
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Retry failed");
      setNotice({
        tone: "success",
        text: ar ? `تمت إعادة جدولة ${result.count} مهمة طباعة بنجاح.` : `Retried ${result.count} failed jobs successfully.`,
      });
      void fetchReadiness();
    } catch (err) {
      setNotice({
        tone: "danger",
        text: err instanceof Error ? err.message : "Failed to retry jobs",
      });
    } finally {
      setRetryingJobs(false);
    }
  }

  async function handleQuickTestPrint() {
    setTestingPrint(true);
    setNotice(null);
    try {
      // Find cashier printer or first available printer
      const printersRes = await fetch("/api/printing/printers");
      const printers = await printersRes.json();
      const target = printers.find((p: { printerType: string; enabled: boolean }) => p.printerType === "CASHIER" && p.enabled) || printers[0];

      if (!target) {
        throw new Error(ar ? "لا توجد طابعة مهيأة لإجراء الفحص." : "No printer configured to test.");
      }

      const res = await fetch(`/api/printing/printers/${target.id}/test-print`, {
        method: "POST",
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Test print failed");
      setNotice({
        tone: "success",
        text: ar ? `تم إرسال الطباعة التجريبية إلى "${target.displayName}".` : `Test print sent to "${target.displayName}".`,
      });
      void fetchReadiness();
    } catch (err) {
      setNotice({
        tone: "danger",
        text: err instanceof Error ? err.message : "Test print failed",
      });
    } finally {
      setTestingPrint(false);
    }
  }

  async function handleQuickTestDrawer() {
    setTestingDrawer(true);
    setNotice(null);
    try {
      const printersRes = await fetch("/api/printing/printers");
      const printers = await printersRes.json();
      const target = printers.find((p: { openCashDrawer: boolean; enabled: boolean }) => p.openCashDrawer && p.enabled);

      if (!target) {
        throw new Error(ar ? "لا توجد طابعة مفعل عليها درج النقدية." : "No printer with cash drawer enabled.");
      }

      const res = await fetch("/api/printing/device/cash-drawer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: "OPEN_CASH_DRAWER", printerId: target.id }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Drawer test failed");
      setNotice({
        tone: "success",
        text: ar ? `تم إرسال أمر فتح درج النقدية إلى "${target.displayName}".` : `Cash drawer kick command sent to "${target.displayName}".`,
      });
    } catch (err) {
      setNotice({
        tone: "danger",
        text: err instanceof Error ? err.message : "Drawer test failed",
      });
    } finally {
      setTestingDrawer(false);
    }
  }

  function handleCopyDiagnosticReport() {
    if (!data) return;

    const reportLines = [
      "==================================================",
      " SHEIKH AL KAR RESTAURANT ERP - DIAGNOSTIC REPORT ",
      "==================================================",
      `Generated At: ${data.timestamp}`,
      `Overall Status: ${data.overallStatus.toUpperCase()}`,
      "",
      "--- SYSTEM METRICS ---",
      `Cloud DB Latency:        ${data.metrics.dbLatencyMs} ms`,
      `Applied Migrations:      ${data.metrics.appliedMigrationsCount}`,
      `Paired Agents:           ${data.metrics.pairedDevicesCount} (Online: ${data.metrics.onlineDevicesCount})`,
      `Configured Printers:     ${data.metrics.configuredPrintersCount}`,
      `Pending Print Jobs:      ${data.metrics.pendingJobsCount}`,
      `Failed Print Jobs:       ${data.metrics.failedJobsCount}`,
      `Default Paper Size:      ${data.metrics.defaultPaperSize}`,
      "",
      "--- READINESS CHECKS ---",
    ];

    for (const c of data.checks) {
      reportLines.push(
        `[${c.status.toUpperCase()}] ${c.titleEn} (${c.titleAr})`,
        `  Details: ${c.detailsEn}`,
      );
      if (c.fixEn) {
        reportLines.push(`  Suggested Fix: ${c.fixEn}`);
      }
      reportLines.push("");
    }

    reportLines.push("==================================================");
    reportLines.push("NOTE: This diagnostic report contains NO secrets or credentials.");

    const text = reportLines.join("\n");
    void navigator.clipboard.writeText(text);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 3000);
  }

  return (
    <AppShell
      title={ar ? "جاهزية الطباعة والتشخيص" : "Printing Readiness & Diagnostics"}
      description={ar ? "فحص شامل لجميع طابعات الكاشير والمطبخ وقاعدة البيانات ودرج النقدية" : "Comprehensive health inspection of printers, cloud DB, and cash drawer"}
    >
      <div className="space-y-6">
        {/* Top Header & Quick Return */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <Link
            href="/admin/settings/printing"
            className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold"
          >
            <ArrowRight size={14} className={ar ? "" : "rotate-180"} />
            {ar ? "العودة إلى إعدادات الطباعة" : "Back to Printing Settings"}
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => fetchReadiness()}
              disabled={loading}
              className="btn-secondary text-xs flex items-center gap-1.5"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              {ar ? "إعادة الفحص" : "Refresh"}
            </button>

            <button
              onClick={handleCopyDiagnosticReport}
              disabled={!data}
              className="btn-secondary text-xs flex items-center gap-1.5 text-primary"
            >
              <Copy size={13} />
              {copiedReport ? (ar ? "تم النسخ!" : "Copied!") : (ar ? "نسخ تقرير الدعم الفني" : "Copy Diagnostic Report")}
            </button>
          </div>
        </div>

        {notice && (
          <div
            className={`p-4 rounded-xl border text-sm ${
              notice.tone === "success"
                ? "border-success/30 bg-success/10 text-success"
                : "border-danger/30 bg-danger/10 text-danger"
            }`}
          >
            {notice.text}
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl border border-danger/30 bg-danger/10 text-danger text-sm flex items-center gap-2">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* Overall Status Banner */}
        {data && (
          <div
            className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              data.overallStatus === "pass"
                ? "bg-success/10 border-success/30 text-success"
                : data.overallStatus === "warn"
                ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                : "bg-danger/10 border-danger/30 text-danger"
            }`}
          >
            <div className="flex items-center gap-3">
              {data.overallStatus === "pass" ? (
                <CheckCircle2 size={32} className="shrink-0" />
              ) : data.overallStatus === "warn" ? (
                <AlertTriangle size={32} className="shrink-0" />
              ) : (
                <AlertCircle size={32} className="shrink-0" />
              )}
              <div>
                <h2 className="text-lg font-bold">
                  {data.overallStatus === "pass"
                    ? ar
                      ? "جميع أنظمة الطباعة جاهزة ومكتملة ✓"
                      : "All Printing Systems Ready & Operational"
                    : data.overallStatus === "warn"
                    ? ar
                      ? "توجد تنبيهات تتطلب الانتباه ⚠"
                      : "Warnings Detected - Action Recommended"
                    : ar
                      ? "يوجد خلل يمنع الطباعة الحية ✗"
                      : "Critical Issues Detected - Fix Required"}
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  {ar
                    ? `آخر فحص: ${new Date(data.timestamp).toLocaleTimeString("ar-PS")}`
                    : `Last check: ${new Date(data.timestamp).toLocaleTimeString()}`}
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
              <button
                onClick={handleQuickTestPrint}
                disabled={testingPrint}
                className="btn-primary text-xs flex items-center gap-1.5 justify-center flex-1 sm:flex-none"
              >
                {testingPrint ? <RefreshCw size={13} className="animate-spin" /> : <Printer size={13} />}
                {ar ? "اختبار طباعة الآن" : "Test Print"}
              </button>

              <button
                onClick={handleQuickTestDrawer}
                disabled={testingDrawer}
                className="btn-secondary text-xs flex items-center gap-1.5 justify-center flex-1 sm:flex-none"
              >
                {testingDrawer ? <RefreshCw size={13} className="animate-spin" /> : <TestTube2 size={13} />}
                {ar ? "اختبار الدرج" : "Test Drawer"}
              </button>

              {data.metrics.failedJobsCount > 0 && (
                <button
                  onClick={handleRetryFailedJobs}
                  disabled={retryingJobs}
                  className="btn-secondary text-xs flex items-center gap-1.5 justify-center text-amber-500 border-amber-500/30 hover:bg-amber-500/10"
                >
                  {retryingJobs ? <RefreshCw size={13} className="animate-spin" /> : <RotateCcw size={13} />}
                  {ar ? `إعادة محاولة (${data.metrics.failedJobsCount})` : `Retry Failed (${data.metrics.failedJobsCount})`}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Metrics Grid */}
        {data && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricCard
              label={ar ? "زمن استجابة قاعدة البيانات" : "Cloud DB Latency"}
              value={`${data.metrics.dbLatencyMs} ms`}
              icon={<Database size={16} />}
              status={data.metrics.dbLatencyMs < 400 ? "pass" : "warn"}
            />
            <MetricCard
              label={ar ? "أجهزة الكاشير المتصلة" : "Online Agents"}
              value={`${data.metrics.onlineDevicesCount} / ${data.metrics.pairedDevicesCount}`}
              icon={<Monitor size={16} />}
              status={data.metrics.onlineDevicesCount > 0 ? "pass" : "fail"}
            />
            <MetricCard
              label={ar ? "الطابعات المهيأة" : "Configured Printers"}
              value={String(data.metrics.configuredPrintersCount)}
              icon={<Printer size={16} />}
              status={data.metrics.configuredPrintersCount > 0 ? "pass" : "fail"}
            />
            <MetricCard
              label={ar ? "المهام الفاشلة / المعلقة" : "Failed / Pending Jobs"}
              value={`${data.metrics.failedJobsCount} / ${data.metrics.pendingJobsCount}`}
              icon={<Activity size={16} />}
              status={data.metrics.failedJobsCount === 0 ? "pass" : "warn"}
            />
          </div>
        )}

        {/* Diagnostic Checks List */}
        {data && (
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-text flex items-center gap-2">
              <Sparkles size={16} className="text-primary" />
              {ar ? "قائمة فحوصات الجاهزية التفصيلية" : "Detailed Readiness Checks"}
            </h3>

            <div className="grid gap-3">
              {data.checks.map((check) => {
                const isPass = check.status === "pass";
                const isWarn = check.status === "warn";
                return (
                  <div
                    key={check.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isPass
                        ? "border-border bg-card"
                        : isWarn
                        ? "border-amber-500/30 bg-amber-500/5"
                        : "border-danger/30 bg-danger/5"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {isPass ? (
                            <CheckCircle2 size={18} className="text-success" />
                          ) : isWarn ? (
                            <AlertTriangle size={18} className="text-amber-500" />
                          ) : (
                            <AlertCircle size={18} className="text-danger" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-text">
                            {ar ? check.titleAr : check.titleEn}
                          </h4>
                          <p className="text-xs text-muted mt-1">
                            {ar ? check.detailsAr : check.detailsEn}
                          </p>

                          {/* Fix instruction */}
                          {(check.fixAr || check.fixEn) && (
                            <div className="mt-2.5 p-2.5 rounded-lg bg-background border border-border text-xs flex items-start gap-2">
                              <span className="font-bold text-primary shrink-0">
                                {ar ? "💡 الحل المقترح:" : "💡 Recommended Fix:"}
                              </span>
                              <span className="text-text font-medium">
                                {ar ? check.fixAr : check.fixEn}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                          isPass
                            ? "bg-success/15 text-success"
                            : isWarn
                            ? "bg-amber-500/15 text-amber-500"
                            : "bg-danger/15 text-danger"
                        }`}
                      >
                        {isPass ? "PASS" : isWarn ? "WARN" : "FAIL"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function MetricCard({
  label,
  value,
  icon,
  status,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  status: "pass" | "warn" | "fail";
}) {
  return (
    <div className="card p-3 border border-border">
      <div className="flex items-center justify-between text-muted text-xs mb-1">
        <span>{label}</span>
        <span
          className={
            status === "pass" ? "text-success" : status === "warn" ? "text-amber-500" : "text-danger"
          }
        >
          {icon}
        </span>
      </div>
      <p className="text-lg font-bold text-text font-mono">{value}</p>
    </div>
  );
}
