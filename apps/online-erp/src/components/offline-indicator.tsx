"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  X,
  FileText,
  Download,
} from "lucide-react";
import { localDb } from "@/lib/offline/db";
import { syncService } from "@/lib/offline/sync-service";
import { getAllPendingSales } from "@/lib/offline/offline-sales";
import type { OfflineSale, SyncServiceState } from "@/lib/offline/types";
import { useLanguage } from "./language-provider";

export function OfflineIndicator({
  onSelectSaleForReprint,
}: {
  onSelectSaleForReprint?: (sale: OfflineSale) => void;
}) {
  const { locale } = useLanguage();
  const ar = locale === "ar";
  const [state, setState] = useState<SyncServiceState>({
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    isSyncing: false,
    pendingCount: 0,
    failedCount: 0,
    lastSyncTime: null,
    lastError: null,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingSales, setPendingSales] = useState<OfflineSale[]>([]);
  const [loadingSales, setLoadingSales] = useState(false);

  useEffect(() => {
    if (!syncService) return;
    syncService.init();
    const unsubscribe = syncService.subscribe((updated) => {
      setState(updated);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  async function openCenter() {
    setModalOpen(true);
    setLoadingSales(true);
    try {
      const sales = await getAllPendingSales();
      setPendingSales(sales);
    } finally {
      setLoadingSales(false);
    }
  }

  async function handleManualSync() {
    if (!syncService) return;
    await syncService.triggerSync();
    const sales = await getAllPendingSales();
    setPendingSales(sales);
  }

  const handleRetrySale = useCallback(async (saleId: string) => {
    if (!localDb) return;
    try {
      const nowTimestamp = Date.now();
      const isoNow = new Date(nowTimestamp).toISOString();
      // Reset the sale status back to PENDING so the sync service picks it up
      await localDb.sales.update(saleId, {
        syncStatus: "PENDING",
        syncError: null,
      });
      // Also reset the queue entry
      const queueItems = await localDb.syncQueue
        .where("saleId")
        .equals(saleId)
        .toArray();
      for (const item of queueItems) {
        if (item.id) {
          await localDb.syncQueue.update(item.id, {
            status: "PENDING",
            nextRetryAt: nowTimestamp,
            lastError: null,
            updatedAt: isoNow,
          });
        }
      }
      // Refresh list and trigger sync
      const sales = await getAllPendingSales();
      setPendingSales(sales);
      if (syncService) void syncService.triggerSync();
    } catch {
      // non-fatal
    }
  }, []);

  async function handleExportBackup() {
    if (!localDb) return;
    try {
      const allSales = await localDb.sales.toArray();
      if (!allSales.length) {
        alert(ar ? "لا توجد أي فواتير مسجلة محلياً لتصديرها" : "No local sales to export");
        return;
      }
      const jsonStr = JSON.stringify(allSales, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sales-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert(ar ? "حدث خطأ أثناء تصدير البيانات" : "Failed to export data");
    }
  }

  function formatTime(isoString?: string | null) {
    if (!isoString) return "-";
    try {
      return new Date(isoString).toLocaleTimeString(ar ? "ar" : "en", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return isoString;
    }
  }

  return (
    <>
      {/* Top Header Badge */}
      <button
        type="button"
        onClick={openCenter}
        title={ar ? "مركز المزامنة وحالة الاتصال" : "Sync & Connection Status"}
        className={`h-9 px-3 rounded-xl flex items-center gap-2 text-xs font-semibold transition border ${
          !state.isOnline
            ? "bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25"
            : state.isSyncing
              ? "bg-blue-500/15 text-blue-300 border-blue-500/30 hover:bg-blue-500/25"
              : state.pendingCount > 0
                ? "bg-orange-500/15 text-orange-300 border-orange-500/30 hover:bg-orange-500/25"
                : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25"
        }`}
      >
        {!state.isOnline ? (
          <>
            <WifiOff size={14} className="text-amber-400" />
            <span>{ar ? "غير متصل (محلي)" : "Offline (Local)"}</span>
            {state.pendingCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-black font-bold text-[10px]">
                {state.pendingCount}
              </span>
            )}
          </>
        ) : state.isSyncing ? (
          <>
            <RefreshCw size={14} className="animate-spin text-blue-400" />
            <span>{ar ? "جارٍ المزامنة..." : "Syncing..."}</span>
          </>
        ) : state.pendingCount > 0 ? (
          <>
            <Clock size={14} className="text-orange-400" />
            <span>
              {ar
                ? `${state.pendingCount} بانتظار المزامنة`
                : `${state.pendingCount} pending`}
            </span>
          </>
        ) : (
          <>
            <Wifi size={14} className="text-emerald-400" />
            <span className="hidden sm:inline">
              {ar ? "متصل ومزامن" : "Online & Synced"}
            </span>
          </>
        )}
      </button>

      {/* Synchronization & Offline Sales Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[80] bg-text/60 backdrop-blur-xs grid place-items-center p-4 animate-in fade-in"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="card w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl p-5 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div
                  className={`size-10 rounded-xl grid place-items-center ${
                    !state.isOnline
                      ? "bg-amber-500/20 text-amber-500"
                      : "bg-emerald-500/20 text-emerald-500"
                  }`}
                >
                  {!state.isOnline ? <WifiOff size={20} /> : <Wifi size={20} />}
                </div>
                <div>
                  <h3 className="font-bold text-lg">
                    {ar ? "مركز المزامنة والعمل دون إنترنت" : "Offline & Synchronization Center"}
                  </h3>
                  <p className="text-xs text-muted">
                    {state.isOnline
                      ? ar
                        ? "متصل بالخادم السحابي"
                        : "Connected to cloud server"
                      : ar
                        ? "العمل في الوضع المحلي (Offline)"
                        : "Operating in offline-first mode"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="size-8 grid place-items-center rounded-lg hover:bg-surface"
              >
                <X size={18} />
              </button>
            </div>

            {/* Status cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
              <div className="bg-background rounded-xl p-3 border border-border">
                <span className="text-xs text-muted block">
                  {ar ? "حالة الشبكة" : "Network"}
                </span>
                <b
                  className={`text-sm flex items-center gap-1.5 mt-1 ${
                    state.isOnline ? "text-emerald-500" : "text-amber-500"
                  }`}
                >
                  <span
                    className={`size-2 rounded-full ${
                      state.isOnline ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                  />
                  {state.isOnline
                    ? ar
                      ? "متصل"
                      : "Online"
                    : ar
                      ? "منقطع"
                      : "Offline"}
                </b>
              </div>

              <div className="bg-background rounded-xl p-3 border border-border">
                <span className="text-xs text-muted block">
                  {ar ? "فواتير بانتظار المزامنة" : "Pending Sync"}
                </span>
                <b className="text-sm block mt-1 text-primary">
                  {state.pendingCount} {ar ? "فواتير" : "sales"}
                </b>
              </div>

              <div className="bg-background rounded-xl p-3 border border-border col-span-2 sm:col-span-1">
                <span className="text-xs text-muted block">
                  {ar ? "آخر مزامنة" : "Last Synced"}
                </span>
                <b className="text-xs block mt-1 truncate">
                  {formatTime(state.lastSyncTime)}
                </b>
              </div>
            </div>

            {/* Error banner if any */}
            {state.lastError && (
              <div className="mb-4 p-3 rounded-xl bg-danger/10 border border-danger/25 text-danger text-xs flex items-start gap-2">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <span className="flex-1">{state.lastError}</span>
              </div>
            )}

            {/* Actions Bar & Sync Progress */}
            {state.isSyncing && (
              <div className="mb-3 p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/25 flex flex-col gap-1.5 text-xs">
                <div className="flex items-center justify-between text-blue-400 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <RefreshCw size={13} className="animate-spin" />
                    {ar ? "جارٍ إرسال الفواتير إلى السحابة..." : "Uploading sales to cloud..."}
                  </span>
                  <span>{state.pendingCount} {ar ? "متبقية" : "remaining"}</span>
                </div>
                <div className="w-full h-1.5 bg-blue-500/20 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 animate-pulse rounded-full w-2/3" />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-3 gap-2">
              <span className="text-sm font-bold truncate">
                {ar ? "الفواتير المسجلة محلياً" : "Locally Recorded Sales"}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void handleExportBackup()}
                  className="btn-secondary !h-8 !px-2.5 text-xs flex items-center gap-1.5"
                  title={ar ? "تصدير نسخة احتياطية محلية (JSON)" : "Export local backup (JSON)"}
                >
                  <Download size={13} />
                  <span className="hidden sm:inline">{ar ? "تصدير نسخة" : "Export Backup"}</span>
                </button>
                <button
                  type="button"
                  disabled={state.isSyncing}
                  onClick={handleManualSync}
                  className="btn-primary !h-8 !px-3 text-xs flex items-center gap-1.5"
                >
                  <RefreshCw
                    size={13}
                    className={state.isSyncing ? "animate-spin" : ""}
                  />
                  <span>
                    {state.isSyncing
                      ? ar
                        ? "جارٍ المزامنة..."
                        : "Syncing..."
                      : ar
                        ? "مزامنة الآن"
                        : "Sync Now"}
                  </span>
                </button>
              </div>
            </div>

            {/* Sales List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[160px]">
              {loadingSales ? (
                <div className="py-8 text-center text-muted text-xs">
                  <RefreshCw className="animate-spin mx-auto size-5 mb-2" />
                  {ar ? "جارٍ تحميل الفواتير..." : "Loading sales..."}
                </div>
              ) : pendingSales.length === 0 ? (
                <div className="py-8 text-center text-muted text-xs border border-dashed border-border rounded-xl">
                  <CheckCircle2 className="mx-auto size-8 text-emerald-500 mb-2" />
                  <p className="font-semibold text-text">
                    {ar ? "جميع الفواتير متزامنة بالكامل!" : "All sales are fully synced!"}
                  </p>
                  <p className="text-[11px] mt-1">
                    {ar
                      ? "لا توجد أي مبيعات معلقة في هذا الجهاز."
                      : "No pending offline sales stored on this device."}
                  </p>
                </div>
              ) : (
                pendingSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="p-3 rounded-xl bg-background border border-border flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-muted shrink-0" />
                        <b className="font-mono text-sm truncate">
                          {sale.officialNumber || sale.temporaryNumber}
                        </b>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            sale.syncStatus === "SYNCED"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : sale.syncStatus === "SYNCING"
                                ? "bg-blue-500/20 text-blue-400"
                                : sale.syncStatus === "FAILED"
                                  ? "bg-danger/20 text-danger"
                                  : "bg-amber-500/20 text-amber-400"
                          }`}
                        >
                          {sale.syncStatus}
                        </span>
                      </div>
                      <div className="text-muted text-[11px] mt-1 flex gap-3">
                        <span>{formatTime(sale.createdAt)}</span>
                        <span>
                          {sale.items.length} {ar ? "عناصر" : "items"}
                        </span>
                        <span className="font-semibold text-text">
                          ₪ {sale.totalAmount.toFixed(2)}
                        </span>
                      </div>
                      {sale.syncError && (
                        <p className="text-danger text-[10px] mt-1 truncate">
                          {sale.syncError}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {sale.syncStatus === "FAILED" && (
                        <button
                          type="button"
                          onClick={() => void handleRetrySale(sale.id)}
                          className="size-8 rounded-lg bg-amber-500/15 border border-amber-500/30 grid place-items-center hover:bg-amber-500/25"
                          title={ar ? "إعادة المحاولة" : "Retry Sync"}
                        >
                          <RefreshCw size={14} className="text-amber-400" />
                        </button>
                      )}
                      {onSelectSaleForReprint && (
                        <button
                          type="button"
                          onClick={() => {
                            setModalOpen(false);
                            onSelectSaleForReprint(sale);
                          }}
                          className="size-8 rounded-lg bg-surface border border-border grid place-items-center hover:bg-surface/80"
                          title={ar ? "طباعة الإيصال" : "Print Receipt"}
                        >
                          <Printer size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer advice */}
            <div className="mt-4 pt-3 border-t border-border text-[11px] text-muted text-center">
              {ar
                ? "يتم حفظ جميع الفواتير بأمان في متصفح الكاشير محلياً وتتم مزامنتها تلقائياً فور توفر الإنترنت."
                : "All sales are safely preserved in the cashier browser and automatically synced once online."}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
