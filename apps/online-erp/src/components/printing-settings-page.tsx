"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Copy,
  Monitor,
  Network,
  Plus,
  Printer as PrinterIcon,
  RefreshCw,
  Save,
  Settings2,
  ShieldCheck,
  TestTube2,
  Trash2,
  Usb,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/ui";
import { useLanguage } from "@/components/language-provider";

type Branch = {
  id: string;
  name: string;
  nameAr: string;
  code: string;
  active: boolean;
};

type ReportedPrinter = {
  name: string;
  displayName?: string;
  isDefault?: boolean;
  status?: string;
};

type Device = {
  id: string;
  name: string;
  status: string;
  operatingSystem?: string | null;
  appVersion?: string | null;
  lastHeartbeatAt?: Date | string | null;
  lastConnectedAt?: Date | string | null;
  sseStatus?: string | null;
  lastEventAt?: Date | string | null;
  lastFallbackPollAt?: Date | string | null;
  lastPrinterRefreshAt?: Date | string | null;
  localPrinters?: ReportedPrinter[] | unknown;
  branch: { id?: string; name: string; nameAr?: string | null };
};

type Printer = {
  id: string;
  branchId: string;
  printDeviceId: string;
  displayName: string;
  printerType: "CASHIER" | "KITCHEN" | "BAR" | "LABEL" | "REPORT" | string;
  connectionType: "USB" | "LAN" | "SERIAL" | string;
  localPrinterName: string;
  ipAddress?: string | null;
  port?: number | null;
  paperWidth: "W58" | "W80" | "A4" | "CUSTOM" | string;
  customWidthMm?: number | null;
  copies: number;
  autoPrint: boolean;
  enabled: boolean;
  branch: { name: string; nameAr?: string | null };
  printDevice: { id: string; name: string; localPrinters?: ReportedPrinter[] | unknown };
  openCashDrawer: boolean;
  cashDrawerPin: number;
  cashDrawerPulseOn: number;
  cashDrawerPulseOff: number;
  cashDrawerOpenBeforePrint: boolean;
};

type Product = {
  id: string;
  sku: string;
  translations: { name: string }[];
};

type Category = {
  id: string;
  nameEn: string;
  nameAr: string;
};

type Notice = { tone: "success" | "danger"; text: string } | null;

type Props = {
  branches: Branch[];
  devices: Device[];
  printers: Printer[];
  products: Product[];
  categories: Category[];
};

type PrinterForm = {
  id?: string;
  branchId: string;
  printDeviceId: string;
  displayName: string;
  printerType: "CASHIER" | "KITCHEN" | "BAR" | "LABEL" | "REPORT";
  connectionType: "USB" | "LAN" | "SERIAL";
  localPrinterName: string;
  ipAddress: string;
  port: number;
  paperWidth: "W58" | "W80" | "A4" | "CUSTOM";
  customWidthMm: number | "";
  copies: number;
  autoPrint: boolean;
  enabled: boolean;
  openCashDrawer: boolean;
  cashDrawerPin: number;
  cashDrawerPulseOn: number;
  cashDrawerPulseOff: number;
  cashDrawerOpenBeforePrint: boolean;
};

export function PrintingSettingsPage({
  branches,
  devices: initialDevices,
  printers: initialPrinters,
  products,
  categories,
}: Props) {
  const { locale } = useLanguage();
  const ar = locale === "ar";
  const copy = ar ? arabicCopy : englishCopy;

  const [devices, setDevices] = useState<Device[]>(initialDevices);
  const [printers, setPrinters] = useState<Printer[]>(initialPrinters);
  const [selectedBranchId, setSelectedBranchId] = useState<string>(branches[0]?.id || "");
  const [generating, setGenerating] = useState(false);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [countdown, setCountdown] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState<Notice>(null);

  const [savingPrinterId, setSavingPrinterId] = useState<string | null>(null);
  const [testingDrawerId, setTestingDrawerId] = useState<string | null>(null);
  const [testingPrintId, setTestingPrintId] = useState<string | null>(null);
  const [deletingPrinterId, setDeletingPrinterId] = useState<string | null>(null);

  const [editingPrinterId, setEditingPrinterId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [printerForm, setPrinterForm] = useState<PrinterForm | null>(null);

  const branchName = useCallback(
    (branch: { name: string; nameAr?: string | null }) => (ar ? branch.nameAr || branch.name : branch.name),
    [ar],
  );

  const updateCountdown = useCallback(() => {
    if (!expiresAt) return;
    const now = new Date().getTime();
    const expiry = new Date(expiresAt).getTime();
    const diff = expiry - now;

    if (diff <= 0) {
      setCountdown("00:00:00");
      setPairingCode(null);
      setExpiresAt(null);
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    setCountdown(
      `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
    );
  }, [expiresAt]);

  useEffect(() => {
    if (!pairingCode || !expiresAt) return;
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [pairingCode, expiresAt, updateCountdown]);

  // Periodic device refresh to detect freshly paired agents or reported printers
  useEffect(() => {
    const refreshDevices = async () => {
      try {
        const res = await fetch("/api/printing/devices");
        if (res.ok) {
          const data = await res.json();
          setDevices(data as Device[]);
        }
      } catch {
        // silent refresh failure
      }
    };

    const interval = setInterval(refreshDevices, 15000);
    return () => clearInterval(interval);
  }, []);

  async function generatePairingCode() {
    if (!selectedBranchId || generating) return;
    setGenerating(true);
    setError("");
    setNotice(null);
    try {
      const response = await fetch("/api/printing/pairing-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branchId: selectedBranchId }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(apiMessage(body) || copy.generateError);
      }
      setPairingCode(body.code);
      setExpiresAt(body.expiresAt);
      setNotice({ tone: "success", text: copy.codeGenerated });
    } catch (err) {
      const message = err instanceof Error ? err.message : copy.generateError;
      setError(message);
    } finally {
      setGenerating(false);
    }
  }

  async function copyToClipboard() {
    if (!pairingCode) return;
    try {
      await navigator.clipboard.writeText(pairingCode);
      setNotice({ tone: "success", text: copy.copied });
    } catch {
      setNotice({ tone: "danger", text: copy.copyFailed });
    }
  }

  function startCreate() {
    setIsCreatingNew(true);
    setEditingPrinterId(null);
    const defaultDevice = devices[0];
    const defaultBranchId = defaultDevice?.branch?.id || branches[0]?.id || "";
    const localPrinters = Array.isArray(defaultDevice?.localPrinters)
      ? (defaultDevice?.localPrinters as ReportedPrinter[])
      : [];
    const firstLocal = localPrinters[0]?.name || "POS-Printer";

    setPrinterForm({
      branchId: defaultBranchId,
      printDeviceId: defaultDevice?.id || "",
      displayName: ar ? "طابعة الكاشير الرئيسية" : "Main Cashier Printer",
      printerType: "CASHIER",
      connectionType: "USB",
      localPrinterName: firstLocal,
      ipAddress: "192.168.1.200",
      port: 9100,
      paperWidth: "W80",
      customWidthMm: 80,
      copies: 1,
      autoPrint: true,
      enabled: true,
      openCashDrawer: true,
      cashDrawerPin: 0,
      cashDrawerPulseOn: 25,
      cashDrawerPulseOff: 250,
      cashDrawerOpenBeforePrint: true,
    });
  }

  function startEdit(printer: Printer) {
    setIsCreatingNew(false);
    setEditingPrinterId(printer.id);
    setPrinterForm({
      id: printer.id,
      branchId: printer.branchId,
      printDeviceId: printer.printDeviceId,
      displayName: printer.displayName,
      printerType: (printer.printerType as PrinterForm["printerType"]) || "CASHIER",
      connectionType: (printer.connectionType as PrinterForm["connectionType"]) || "USB",
      localPrinterName: printer.localPrinterName || "",
      ipAddress: printer.ipAddress || "",
      port: printer.port || 9100,
      paperWidth: (printer.paperWidth as PrinterForm["paperWidth"]) || "W80",
      customWidthMm: printer.customWidthMm || 80,
      copies: printer.copies || 1,
      autoPrint: printer.autoPrint !== false,
      enabled: printer.enabled !== false,
      openCashDrawer: Boolean(printer.openCashDrawer),
      cashDrawerPin: printer.cashDrawerPin ?? 0,
      cashDrawerPulseOn: printer.cashDrawerPulseOn ?? 25,
      cashDrawerPulseOff: printer.cashDrawerPulseOff ?? 250,
      cashDrawerOpenBeforePrint: printer.cashDrawerOpenBeforePrint !== false,
    });
  }

  function cancelEdit() {
    setIsCreatingNew(false);
    setEditingPrinterId(null);
    setPrinterForm(null);
  }

  function getDetectedPrintersForDevice(deviceId: string): ReportedPrinter[] {
    const dev = devices.find((d) => d.id === deviceId);
    if (!dev || !Array.isArray(dev.localPrinters)) return [];
    return dev.localPrinters as ReportedPrinter[];
  }

  function validatePrinterForm(form: PrinterForm): string | null {
    if (!form.displayName.trim()) return copy.errorNameRequired;
    if (!form.printDeviceId) return copy.errorDeviceRequired;
    if (form.connectionType === "LAN") {
      if (!form.ipAddress.trim()) return copy.errorLanIpRequired;
      if (!form.port || form.port < 1 || form.port > 65535) return copy.errorPortInvalid;
    } else {
      if (!form.localPrinterName.trim()) return copy.errorSpoolerRequired;
    }
    if (form.paperWidth === "CUSTOM" && (!form.customWidthMm || Number(form.customWidthMm) <= 0)) {
      return copy.errorCustomWidthRequired;
    }
    return null;
  }

  async function savePrinter() {
    if (!printerForm) return;
    const validationError = validatePrinterForm(printerForm);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSavingPrinterId(printerForm.id || "new");
    setError("");
    setNotice(null);

    const payload = {
      branchId: printerForm.branchId,
      printDeviceId: printerForm.printDeviceId,
      displayName: printerForm.displayName.trim(),
      printerType: printerForm.printerType,
      connectionType: printerForm.connectionType,
      localPrinterName: printerForm.connectionType === "LAN" ? (printerForm.ipAddress ? `LAN-${printerForm.ipAddress}` : "LAN-Printer") : printerForm.localPrinterName.trim(),
      ipAddress: printerForm.connectionType === "LAN" ? printerForm.ipAddress.trim() : null,
      port: printerForm.connectionType === "LAN" ? Number(printerForm.port || 9100) : 9100,
      paperWidth: printerForm.paperWidth,
      customWidthMm: printerForm.paperWidth === "CUSTOM" ? Number(printerForm.customWidthMm) : null,
      copies: Number(printerForm.copies || 1),
      autoPrint: printerForm.autoPrint,
      enabled: printerForm.enabled,
      openCashDrawer: printerForm.openCashDrawer,
      cashDrawerPin: Number(printerForm.cashDrawerPin || 0),
      cashDrawerPulseOn: Number(printerForm.cashDrawerPulseOn || 25),
      cashDrawerPulseOff: Number(printerForm.cashDrawerPulseOff || 250),
      cashDrawerOpenBeforePrint: printerForm.cashDrawerOpenBeforePrint,
    };

    try {
      const url = printerForm.id ? `/api/printing/printers/${printerForm.id}` : "/api/printing/printers";
      const method = printerForm.id ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(apiMessage(body) || copy.saveError);
      }

      setNotice({ tone: "success", text: copy.printerSaved });
      setEditingPrinterId(null);
      setIsCreatingNew(false);
      setPrinterForm(null);

      // Refresh printers list from server
      const updatedRes = await fetch("/api/printing/printers");
      if (updatedRes.ok) {
        const refreshed = await updatedRes.json();
        setPrinters(refreshed);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : copy.saveError;
      setError(message);
    } finally {
      setSavingPrinterId(null);
    }
  }

  async function deletePrinter(printerId: string) {
    if (!window.confirm(copy.confirmDelete)) return;
    setDeletingPrinterId(printerId);
    setError("");
    setNotice(null);
    try {
      const response = await fetch(`/api/printing/printers/${printerId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(apiMessage(body) || copy.deleteError);
      }
      setPrinters((prev) => prev.filter((p) => p.id !== printerId));
      setNotice({ tone: "success", text: copy.printerDeleted });
    } catch (err) {
      const message = err instanceof Error ? err.message : copy.deleteError;
      setError(message);
    } finally {
      setDeletingPrinterId(null);
    }
  }

  async function testCashDrawer(printerId: string) {
    setTestingDrawerId(printerId);
    setError("");
    setNotice(null);
    try {
      const response = await fetch("/api/printing/device/cash-drawer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: "OPEN_CASH_DRAWER", printerId }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(apiMessage(body) || copy.drawerTestError);
      }
      setNotice({ tone: "success", text: copy.drawerTestSent });
    } catch (err) {
      const message = err instanceof Error ? err.message : copy.drawerTestError;
      setError(message);
    } finally {
      setTestingDrawerId(null);
    }
  }

  async function testPrint(printerId: string) {
    setTestingPrintId(printerId);
    setError("");
    setNotice(null);
    try {
      const response = await fetch(`/api/printing/printers/${printerId}/test-print`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(apiMessage(body) || copy.testPrintError);
      }
      setNotice({ tone: "success", text: copy.testPrintSent });
    } catch (err) {
      const message = err instanceof Error ? err.message : copy.testPrintError;
      setError(message);
    } finally {
      setTestingPrintId(null);
    }
  }

  const formattedExpiry = useMemo(() => {
    if (!expiresAt) return "";
    return new Date(expiresAt).toLocaleString(locale === "ar" ? "ar-PS" : "en", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [expiresAt, locale]);

  return (
    <AppShell title={copy.title} description={copy.description}>
      {error && <Alert tone="danger" text={error} />}
      {notice && <Alert tone={notice.tone} text={notice.text} compact />}

      <div className="grid gap-5">
        {/* Navigation Banner to Readiness page */}
        <section className="card p-4 bg-primary/5 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Activity className="text-primary size-5 shrink-0" />
            <div>
              <h3 className="font-bold text-sm text-text">{copy.readinessTitle}</h3>
              <p className="text-xs text-muted mt-0.5">{copy.readinessDescription}</p>
            </div>
          </div>
          <Link
            href="/admin/settings/printing/readiness"
            className="btn-secondary text-xs flex items-center gap-2 whitespace-nowrap self-stretch sm:self-auto justify-center"
          >
            <Activity size={14} className="text-primary" />
            {copy.openReadiness}
          </Link>
        </section>

        {/* Pairing section */}
        <section className="card p-5">
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck size={20} />
            <h2 className="text-lg font-bold">{copy.devicePairing}</h2>
          </div>
          <p className="text-sm text-muted mt-1">{copy.devicePairingHelp}</p>

          <div className="flex flex-col sm:flex-row gap-3 mt-5">
            <label className="min-w-0 flex-1">
              <span className="text-xs font-bold block mb-2">{copy.selectBranch}</span>
              <select
                className="input"
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                disabled={generating}
              >
                <option value="">{copy.selectBranch}</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {ar ? branch.nameAr || branch.name : branch.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-end">
              <button
                className="btn-primary flex items-center justify-center gap-2"
                onClick={generatePairingCode}
                disabled={generating || !selectedBranchId}
              >
                {generating ? <RefreshCw size={17} className="animate-spin" /> : <Zap size={17} />}
                {generating ? copy.generating : copy.generatePairingCode}
              </button>
            </div>
          </div>

          {pairingCode && (
            <div className="mt-5 rounded-xl border border-success/25 bg-success/10 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-success">{copy.pairingCode}</span>
                  <p className="text-3xl font-mono font-bold tracking-widest text-text mt-1 break-anywhere">
                    {pairingCode}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-muted">
                    <span>
                      {copy.expiresAt}: {formattedExpiry}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-success" />
                      {copy.expiresIn}: {countdown}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="btn-secondary flex items-center gap-2" onClick={copyToClipboard}>
                    <Copy size={16} />
                    {copy.copyCode}
                  </button>
                  <button
                    className="btn-primary flex items-center gap-2"
                    onClick={generatePairingCode}
                    disabled={generating || !selectedBranchId}
                  >
                    <RefreshCw size={16} className={generating ? "animate-spin" : ""} />
                    {copy.generateNewCode}
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Connected devices */}
        <section className="card overflow-hidden">
          <div className="p-5 border-b border-border flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-primary">
                <Monitor size={19} />
                <h2 className="font-bold text-lg">{copy.connectedDevices}</h2>
              </div>
              <p className="text-sm text-muted mt-1">{copy.devicePairingHelp}</p>
            </div>
          </div>
          <div className="table-scroll mobile-hidden-table">
            <table className="w-full text-sm min-w-[720px]">
              <thead className="bg-background text-muted">
                <tr>
                  <th className="p-3 text-start">{copy.device}</th>
                  <th className="p-3 text-start">{copy.branch}</th>
                  <th className="p-3 text-start">{copy.status}</th>
                  <th className="p-3 text-start">{copy.os}</th>
                  <th className="p-3 text-start">{copy.version}</th>
                  <th className="p-3 text-start">{copy.detectedPrinters}</th>
                  <th className="p-3 text-start">{copy.heartbeat}</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((device) => {
                  const detected = Array.isArray(device.localPrinters) ? device.localPrinters : [];
                  return (
                    <tr key={device.id} className="border-t border-border hover:bg-background/60">
                      <td className="p-3 font-semibold">{device.name}</td>
                      <td className="p-3">{branchName(device.branch)}</td>
                      <td className="p-3">
                        <StatusBadge
                          active={device.status === "ONLINE"}
                          label={device.status === "ONLINE" ? copy.online : device.status === "DISABLED" ? copy.disabled : copy.offline}
                        />
                      </td>
                      <td className="p-3">{device.operatingSystem || "-"}</td>
                      <td className="p-3">{device.appVersion || "-"}</td>
                      <td className="p-3">
                        {detected.length > 0 ? (
                          <span className="badge-neutral text-xs px-2 py-0.5 rounded">
                            {detected.length} {copy.printersFound}
                          </span>
                        ) : (
                          <span className="text-muted text-xs">{copy.noPrintersDetected}</span>
                        )}
                      </td>
                      <td className="p-3">
                        {device.lastHeartbeatAt ? new Date(device.lastHeartbeatAt).toLocaleString(locale === "ar" ? "ar-PS" : "en") : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mobile-card-list p-3">
            {devices.map((device) => (
              <DeviceCard key={`${device.id}-card`} device={device} copy={copy} branchName={branchName} locale={locale} />
            ))}
          </div>
          {!devices.length && <p className="text-sm text-muted p-4 text-center">{copy.noDevices}</p>}
        </section>

        {/* Printer Configurations */}
        <section className="card p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-border">
            <div className="flex items-center gap-2 text-primary">
              <PrinterIcon size={19} />
              <div>
                <h2 className="text-lg font-bold">{copy.printerConfiguration}</h2>
                <p className="text-xs text-muted">{copy.printerConfigSubtitle}</p>
              </div>
            </div>
            {!isCreatingNew && (
              <button
                type="button"
                className="btn-primary text-xs flex items-center gap-1.5"
                onClick={startCreate}
                disabled={!devices.length}
              >
                <Plus size={15} />
                {copy.addNewPrinter}
              </button>
            )}
          </div>

          {/* New Printer Form Modal / Card */}
          {isCreatingNew && printerForm && (
            <div className="mt-4 p-5 rounded-xl border border-primary/30 bg-primary/5">
              <h3 className="font-bold text-base text-primary mb-3 flex items-center gap-2">
                <Plus size={16} />
                {copy.addNewPrinter}
              </h3>
              <PrinterEditForm
                form={printerForm}
                setForm={setPrinterForm}
                devices={devices}
                branches={branches}
                onSave={savePrinter}
                onCancel={cancelEdit}
                saving={savingPrinterId === "new"}
                copy={copy}
                ar={ar}
                getDetectedPrinters={getDetectedPrintersForDevice}
              />
            </div>
          )}

          {/* Existing Printers Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {printers.map((printer) => {
              const isEditing = editingPrinterId === printer.id && printerForm;
              return (
                <div
                  key={printer.id}
                  className={`rounded-xl border p-4 transition-colors ${
                    printer.enabled ? "border-border bg-card" : "border-border/50 bg-background/50 opacity-80"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="font-bold text-base truncate">{printer.displayName}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-primary/10 text-primary">
                          {printerRoleLabel(printer.printerType, copy)}
                        </span>
                        <span className="text-xs text-muted flex items-center gap-1">
                          {printer.connectionType === "LAN" ? <Network size={12} /> : <Usb size={12} />}
                          {printer.connectionType || "USB"}
                        </span>
                      </div>
                    </div>
                    <StatusBadge
                      active={printer.enabled}
                      label={printer.enabled ? copy.active : copy.inactive}
                    />
                  </div>

                  <div className="mt-3 text-xs space-y-1 text-muted border-t border-border/50 pt-2">
                    <div className="flex justify-between">
                      <span>{copy.target}:</span>
                      <strong className="text-text font-mono truncate max-w-[160px]">
                        {printer.connectionType === "LAN" ? `${printer.ipAddress}:${printer.port}` : printer.localPrinterName}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>{copy.paperWidthLabel}:</span>
                      <strong className="text-text">
                        {printer.paperWidth === "CUSTOM"
                          ? `${printer.customWidthMm} mm`
                          : printer.paperWidth === "W58"
                          ? "58 mm"
                          : "80 mm"}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>{copy.assignedDevice}:</span>
                      <strong className="text-text">{printer.printDevice?.name || "-"}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>{copy.drawer}:</span>
                      <strong className={printer.openCashDrawer ? "text-success" : "text-muted"}>
                        {printer.openCashDrawer ? copy.drawerEnabled : copy.disabled}
                      </strong>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="mt-4 pt-4 border-t border-border">
                      <PrinterEditForm
                        form={printerForm}
                        setForm={setPrinterForm}
                        devices={devices}
                        branches={branches}
                        onSave={savePrinter}
                        onCancel={cancelEdit}
                        saving={savingPrinterId === printer.id}
                        copy={copy}
                        ar={ar}
                        getDetectedPrinters={getDetectedPrintersForDevice}
                      />
                    </div>
                  ) : (
                    <div className="mt-4 pt-3 border-t border-border flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="btn-secondary flex-1 text-xs flex items-center justify-center gap-1.5 py-1.5"
                        onClick={() => startEdit(printer)}
                      >
                        <Settings2 size={13} />
                        {copy.configure}
                      </button>

                      <button
                        type="button"
                        className="btn-secondary text-xs flex items-center justify-center gap-1.5 py-1.5 px-2.5 text-primary"
                        onClick={() => testPrint(printer.id)}
                        disabled={testingPrintId === printer.id}
                        title={copy.testPrint}
                      >
                        {testingPrintId === printer.id ? <RefreshCw size={13} className="animate-spin" /> : <PrinterIcon size={13} />}
                        {copy.testPrintShort}
                      </button>

                      {printer.openCashDrawer && (
                        <button
                          type="button"
                          className="btn-secondary text-xs flex items-center justify-center gap-1.5 py-1.5 px-2.5 text-amber-500"
                          onClick={() => testCashDrawer(printer.id)}
                          disabled={testingDrawerId === printer.id}
                          title={copy.testDrawer}
                        >
                          {testingDrawerId === printer.id ? <RefreshCw size={13} className="animate-spin" /> : <TestTube2 size={13} />}
                          {copy.drawerShort}
                        </button>
                      )}

                      <button
                        type="button"
                        className="btn-secondary text-xs p-1.5 text-danger hover:bg-danger/10"
                        onClick={() => deletePrinter(printer.id)}
                        disabled={deletingPrinterId === printer.id}
                        title={copy.delete}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!printers.length && !isCreatingNew && (
            <div className="text-center py-8 text-muted border border-dashed rounded-xl mt-4">
              <PrinterIcon size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm font-semibold">{copy.noPrinters}</p>
              <button
                type="button"
                className="btn-primary text-xs mt-3 inline-flex items-center gap-1.5"
                onClick={startCreate}
                disabled={!devices.length}
              >
                <Plus size={14} />
                {copy.addNewPrinter}
              </button>
            </div>
          )}
        </section>

        {/* Printer Routing Section */}
        <section className="card p-5">
          <div className="flex items-center gap-2 text-primary">
            <Settings2 size={19} />
            <h2 className="text-lg font-bold">{copy.printerRouting}</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="rounded-lg border border-border p-4">
              <b>{copy.recentProducts}</b>
              <p className="text-sm text-muted mt-2">
                {products.map((p) => p.translations[0]?.name || p.sku).join(", ") || copy.noProducts}
              </p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <b>{copy.categoriesLabel}</b>
              <p className="text-sm text-muted mt-2">
                {categories.map((c) => (ar ? c.nameAr : c.nameEn)).join(", ") || copy.noCategories}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted mt-4">{copy.routingHelp}</p>
        </section>
      </div>
    </AppShell>
  );
}

function PrinterEditForm({
  form,
  setForm,
  devices,
  branches,
  onSave,
  onCancel,
  saving,
  copy,
  ar,
  getDetectedPrinters,
}: {
  form: PrinterForm;
  setForm: (f: PrinterForm) => void;
  devices: Device[];
  branches: Branch[];
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  copy: Copy;
  ar: boolean;
  getDetectedPrinters: (deviceId: string) => ReportedPrinter[];
}) {
  const detectedPrinters = getDetectedPrinters(form.printDeviceId);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Display Name */}
        <label className="block">
          <span className="text-xs font-bold block mb-1">{copy.displayName} *</span>
          <input
            className="input"
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            placeholder={ar ? "طابعة الكاشير / طابعة المطبخ" : "e.g. Cashier Counter Printer"}
            required
          />
        </label>

        {/* Role / Purpose */}
        <label className="block">
          <span className="text-xs font-bold block mb-1">{copy.roleLabel} *</span>
          <select
            className="input"
            value={form.printerType}
            onChange={(e) => setForm({ ...form, printerType: e.target.value as PrinterForm["printerType"] })}
          >
            <option value="CASHIER">{copy.roleCashier}</option>
            <option value="KITCHEN">{copy.roleKitchen}</option>
            <option value="BAR">{copy.roleBar}</option>
            <option value="LABEL">{copy.roleLabelOption}</option>
            <option value="REPORT">{copy.roleReport}</option>
          </select>
        </label>

        {/* Assigned Print Device */}
        <label className="block">
          <span className="text-xs font-bold block mb-1">{copy.assignedDevice} *</span>
          <select
            className="input"
            value={form.printDeviceId}
            onChange={(e) => setForm({ ...form, printDeviceId: e.target.value })}
            required
          >
            {devices.map((dev) => (
              <option key={dev.id} value={dev.id}>
                {dev.name} ({dev.status === "ONLINE" ? copy.online : copy.offline})
              </option>
            ))}
          </select>
        </label>

        {/* Branch */}
        <label className="block">
          <span className="text-xs font-bold block mb-1">{copy.branch} *</span>
          <select
            className="input"
            value={form.branchId}
            onChange={(e) => setForm({ ...form, branchId: e.target.value })}
            required
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {ar ? b.nameAr || b.name : b.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Connection Type */}
      <div className="p-3 rounded-lg border border-border bg-background space-y-3">
        <span className="text-xs font-bold text-primary block">{copy.connectionType}</span>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="connectionType"
              value="USB"
              checked={form.connectionType === "USB"}
              onChange={() => setForm({ ...form, connectionType: "USB" })}
              className="accent-[var(--primary)]"
            />
            <span className="text-sm font-semibold flex items-center gap-1.5">
              <Usb size={15} />
              {copy.usbSpooler}
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="connectionType"
              value="LAN"
              checked={form.connectionType === "LAN"}
              onChange={() => setForm({ ...form, connectionType: "LAN" })}
              className="accent-[var(--primary)]"
            />
            <span className="text-sm font-semibold flex items-center gap-1.5">
              <Network size={15} />
              {copy.networkLan}
            </span>
          </label>
        </div>

        {form.connectionType === "USB" ? (
          <div>
            <label className="block">
              <span className="text-xs font-bold block mb-1">{copy.localPrinterName} *</span>
              {detectedPrinters.length > 0 ? (
                <div className="space-y-1">
                  <select
                    className="input"
                    value={form.localPrinterName}
                    onChange={(e) => setForm({ ...form, localPrinterName: e.target.value })}
                  >
                    <option value="">{copy.selectDetectedPrinter}</option>
                    {detectedPrinters.map((p) => (
                      <option key={p.name} value={p.name}>
                        {p.name} {p.isDefault ? `(${copy.defaultPrinter})` : ""}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted mt-1">{copy.detectedPrintersHint}</p>
                </div>
              ) : (
                <div>
                  <input
                    className="input font-mono text-sm"
                    value={form.localPrinterName}
                    onChange={(e) => setForm({ ...form, localPrinterName: e.target.value })}
                    placeholder="e.g. EPSON TM-T20III or POS-80"
                    required
                  />
                  <p className="text-xs text-muted mt-1">{copy.manualPrinterNameHint}</p>
                </div>
              )}
            </label>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-bold block mb-1">{copy.ipAddress} *</span>
              <input
                className="input font-mono text-sm"
                value={form.ipAddress}
                onChange={(e) => setForm({ ...form, ipAddress: e.target.value })}
                placeholder="192.168.1.200"
                required
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold block mb-1">{copy.port} *</span>
              <input
                type="number"
                className="input font-mono text-sm"
                value={form.port}
                onChange={(e) => setForm({ ...form, port: Number(e.target.value) })}
                placeholder="9100"
                required
              />
            </label>
          </div>
        )}
      </div>

      {/* Paper Width & Copies */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <label className="block">
          <span className="text-xs font-bold block mb-1">{copy.paperWidthLabel}</span>
          <select
            className="input"
            value={form.paperWidth}
            onChange={(e) => setForm({ ...form, paperWidth: e.target.value as PrinterForm["paperWidth"] })}
          >
            <option value="W80">80mm ({copy.standardThermal})</option>
            <option value="W58">58mm ({copy.compactThermal})</option>
            <option value="CUSTOM">{copy.customMm}</option>
          </select>
        </label>

        {form.paperWidth === "CUSTOM" && (
          <label className="block">
            <span className="text-xs font-bold block mb-1">{copy.customWidthMm}</span>
            <input
              type="number"
              min={30}
              max={300}
              className="input"
              value={form.customWidthMm}
              onChange={(e) => setForm({ ...form, customWidthMm: e.target.value ? Number(e.target.value) : "" })}
              required
            />
          </label>
        )}

        <label className="block">
          <span className="text-xs font-bold block mb-1">{copy.copies}</span>
          <input
            type="number"
            min={1}
            max={5}
            className="input"
            value={form.copies}
            onChange={(e) => setForm({ ...form, copies: Number(e.target.value) })}
          />
        </label>
      </div>

      {/* Toggles: AutoPrint & Enabled */}
      <div className="flex flex-wrap gap-5 py-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.autoPrint}
            onChange={(e) => setForm({ ...form, autoPrint: e.target.checked })}
            className="size-4 accent-[var(--primary)]"
          />
          <span className="text-sm font-semibold">{copy.autoPrint}</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
            className="size-4 accent-[var(--primary)]"
          />
          <span className="text-sm font-semibold">{copy.enabled}</span>
        </label>
      </div>

      {/* Cash Drawer Configuration */}
      <div className="pt-3 border-t border-border">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-primary">{copy.cashDrawerSettings}</span>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.openCashDrawer}
              onChange={(e) => setForm({ ...form, openCashDrawer: e.target.checked })}
              className="size-4 accent-[var(--primary)]"
            />
            <span className="text-sm font-semibold">{copy.enableCashDrawer}</span>
          </label>
        </div>

        {form.openCashDrawer && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-background p-3 rounded-lg border border-border">
            <label className="block">
              <span className="text-xs font-bold block mb-1">{copy.drawerPin}</span>
              <select
                className="input text-xs"
                value={form.cashDrawerPin}
                onChange={(e) => setForm({ ...form, cashDrawerPin: Number(e.target.value) })}
              >
                <option value={0}>Pin 2 / Drawer 1</option>
                <option value={1}>Pin 5 / Drawer 2</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-bold block mb-1">{copy.pulseOn}</span>
              <input
                type="number"
                min={1}
                max={255}
                className="input text-xs"
                value={form.cashDrawerPulseOn}
                onChange={(e) => setForm({ ...form, cashDrawerPulseOn: Number(e.target.value) })}
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold block mb-1">{copy.pulseOff}</span>
              <input
                type="number"
                min={1}
                max={255}
                className="input text-xs"
                value={form.cashDrawerPulseOff}
                onChange={(e) => setForm({ ...form, cashDrawerPulseOff: Number(e.target.value) })}
              />
            </label>
            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.cashDrawerOpenBeforePrint}
                  onChange={(e) => setForm({ ...form, cashDrawerOpenBeforePrint: e.target.checked })}
                  className="size-4 accent-[var(--primary)]"
                />
                <span className="text-xs font-semibold">{copy.openBeforePrint}</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-3 border-t border-border">
        <button type="submit" className="btn-primary flex items-center gap-2" disabled={saving}>
          {saving ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
          {copy.save}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          {copy.cancel}
        </button>
      </div>
    </form>
  );
}

function printerRoleLabel(role: string, copy: Copy): string {
  switch (role) {
    case "CASHIER":
      return copy.roleCashier;
    case "KITCHEN":
      return copy.roleKitchen;
    case "BAR":
      return copy.roleBar;
    case "LABEL":
      return copy.roleLabelOption;
    case "REPORT":
      return copy.roleReport;
    default:
      return role;
  }
}

function DeviceCard({
  device,
  copy,
  branchName,
  locale,
}: {
  device: Device;
  copy: Copy;
  branchName: (b: { name: string; nameAr?: string | null }) => string;
  locale: string;
}) {
  const detected = Array.isArray(device.localPrinters) ? device.localPrinters : [];
  return (
    <article className="rounded-xl border border-border bg-background p-4">
      <div className="flex justify-between gap-3">
        <div className="min-w-0">
          <b className="break-anywhere">{device.name}</b>
          <p className="text-xs text-muted mt-1">{branchName(device.branch)}</p>
        </div>
        <StatusBadge
          active={device.status === "ONLINE"}
          label={device.status === "ONLINE" ? copy.online : device.status === "DISABLED" ? copy.disabled : copy.offline}
        />
      </div>
      <dl className="grid grid-cols-2 gap-3 mt-4 text-sm">
        <Info label={copy.os} value={device.operatingSystem || "-"} />
        <Info label={copy.version} value={device.appVersion || "-"} />
        <Info label={copy.detectedPrinters} value={`${detected.length} ${copy.printersFound}`} />
        <Info
          label={copy.heartbeat}
          value={device.lastHeartbeatAt ? new Date(device.lastHeartbeatAt).toLocaleTimeString(locale === "ar" ? "ar-PS" : "en") : "-"}
        />
      </dl>
    </article>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-muted text-xs">{label}</dt>
      <dd className="font-bold break-anywhere mt-0.5">{value}</dd>
    </div>
  );
}

function Alert({ tone, text, compact = false }: { tone: "success" | "danger"; text: string; compact?: boolean }) {
  return (
    <div
      className={`${compact ? "mt-4" : "mb-4"} rounded-xl border px-4 py-3 text-sm ${
        tone === "success" ? "border-success/25 bg-success/10 text-success" : "border-danger/25 bg-danger/10 text-danger"
      }`}
      role="alert"
    >
      {text}
    </div>
  );
}

function apiMessage(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";
  const body = payload as { message?: unknown; error?: unknown };
  return typeof body.message === "string" ? body.message : typeof body.error === "string" ? body.error : "";
}

const englishCopy = {
  title: "Printing Settings",
  description: "Devices, local printers, network printers, and product routing",
  readinessTitle: "Printing Readiness & System Health",
  readinessDescription: "Run full end-to-end diagnostics on printers, cloud database, paper width, and drawer status.",
  openReadiness: "Check Readiness",
  devicePairing: "Device Pairing",
  devicePairingHelp: "Generate a pairing code here, then run `agent pair <code>` on the cashier PC.",
  selectBranch: "Select branch",
  generatePairingCode: "Generate Pairing Code",
  generating: "Generating...",
  pairingCode: "Pairing Code",
  expiresAt: "Expires at",
  expiresIn: "Expires in",
  copyCode: "Copy",
  copied: "Copied to clipboard.",
  copyFailed: "Failed to copy.",
  generateNewCode: "Generate New Code",
  generateError: "Failed to generate pairing code.",
  codeGenerated: "Pairing code generated successfully.",
  connectedDevices: "Connected Print Devices",
  noDevices: "No print devices paired yet. Follow the installation guide to pair the cashier PC.",
  device: "Device",
  branch: "Branch",
  status: "Status",
  os: "OS",
  version: "Version",
  sse: "SSE",
  heartbeat: "Heartbeat",
  detectedPrinters: "Detected Printers",
  printersFound: "printers",
  noPrintersDetected: "None detected yet",
  online: "Online",
  offline: "Offline",
  disabled: "Disabled",
  active: "Active",
  inactive: "Inactive",
  printerConfiguration: "Printers Configuration",
  printerConfigSubtitle: "Configure cashier, kitchen, and bar printers with USB or LAN connection.",
  addNewPrinter: "Add Printer",
  noPrinters: "No printers configured yet. Add your first printer above.",
  copies: "Copies",
  printerRouting: "Printer Routing",
  recentProducts: "Recent products",
  categoriesLabel: "Categories",
  noProducts: "No products",
  noCategories: "No categories",
  routingHelp: "Product routes override category routes. Unrouted preparation items use the first enabled kitchen printer.",
  displayName: "Display Name",
  roleLabel: "Role / Purpose",
  roleCashier: "Cashier (Receipts)",
  roleKitchen: "Kitchen Ticket",
  roleBar: "Bar Ticket",
  roleLabelOption: "Labels",
  roleReport: "Reports",
  assignedDevice: "Assigned PC / Device",
  connectionType: "Connection Type",
  usbSpooler: "USB / Windows Spooler",
  networkLan: "Network / LAN (TCP raw 9100)",
  localPrinterName: "Windows Printer Name",
  selectDetectedPrinter: "-- Select detected printer --",
  defaultPrinter: "Default",
  detectedPrintersHint: "Populated automatically from the Windows printers reported by the print agent.",
  manualPrinterNameHint: "Exact printer name as shown in Windows 'Printers & scanners'.",
  ipAddress: "Printer IP Address",
  port: "Port (Default 9100)",
  paperWidthLabel: "Paper Width",
  standardThermal: "Standard 80mm",
  compactThermal: "Compact 58mm",
  customMm: "Custom Width (mm)",
  customWidthMm: "Width in mm",
  autoPrint: "Auto-print on checkout",
  enabled: "Enabled",
  cashDrawerSettings: "Cash Drawer (RJ11 Kick-out)",
  enableCashDrawer: "Open cash drawer on cash sales",
  drawerEnabled: "Cash drawer enabled",
  drawerPin: "Drawer Pin",
  pulseOn: "Pulse ON (ms)",
  pulseOff: "Pulse OFF (ms)",
  openBeforePrint: "Open before printing",
  testDrawer: "Test Cash Drawer",
  testPrint: "Test Print",
  testPrintShort: "Test Print",
  drawerShort: "Drawer",
  configure: "Configure",
  save: "Save",
  cancel: "Cancel",
  delete: "Delete",
  confirmDelete: "Are you sure you want to delete this printer configuration?",
  deleteError: "Failed to delete printer.",
  printerDeleted: "Printer configuration deleted.",
  saveError: "Failed to save printer settings.",
  printerSaved: "Printer settings saved successfully.",
  drawerTestError: "Cash drawer test failed.",
  drawerTestSent: "Cash drawer kick command sent to agent.",
  testPrintError: "Test print failed.",
  testPrintSent: "Test print job sent to printer.",
  target: "Target",
  drawer: "Drawer",
  errorNameRequired: "Printer display name is required.",
  errorDeviceRequired: "Please select an assigned print device.",
  errorLanIpRequired: "IP address is required for LAN connection.",
  errorPortInvalid: "Invalid port number (1-65535).",
  errorSpoolerRequired: "Windows printer name is required.",
  errorCustomWidthRequired: "Custom paper width in millimeters is required.",
};

const arabicCopy: typeof englishCopy = {
  title: "إعدادات الطباعة",
  description: "أجهزة الطباعة، الطابعات المحلية والشبكية، وتوجيه تذاكر المطبخ",
  readinessTitle: "فحص جاهزية الطباعة وتشخيص النظام",
  readinessDescription: "إجراء تشخيص شامل وفوري للطابعات، اتصال قاعدة البيانات السحابية، ودرج النقدية.",
  openReadiness: "فتح صفحة الجاهزية",
  devicePairing: "اقتران جهاز الكاشير",
  devicePairingHelp: "أنشئ رمز اقتران هنا، ثم نفّذ الأمر `agent pair <code>` على كمبيوتر الكاشير.",
  selectBranch: "اختر الفرع",
  generatePairingCode: "إنشاء رمز اقتران",
  generating: "جارٍ الإنشاء...",
  pairingCode: "رمز الاقتران",
  expiresAt: "ينتهي في",
  expiresIn: "متبقي",
  copyCode: "نسخ",
  copied: "تم النسخ إلى الحافظة.",
  copyFailed: "فشل النسخ.",
  generateNewCode: "إنشاء رمز جديد",
  generateError: "فشل إنشاء رمز الاقتران.",
  codeGenerated: "تم إنشاء رمز الاقتران بنجاح.",
  connectedDevices: "أجهزة الطباعة المتصلة",
  noDevices: "لا توجد أجهزة طباعة مقترنة بعد. اتبع دليل التثبيت لربط جهاز الكاشير.",
  device: "الجهاز",
  branch: "الفرع",
  status: "الحالة",
  os: "نظام التشغيل",
  version: "الإصدار",
  sse: "SSE",
  heartbeat: "آخر اتصال",
  detectedPrinters: "الطابعات المكتشفة",
  printersFound: "طابعة",
  noPrintersDetected: "لم تكتشف طابعات بعد",
  online: "متصل",
  offline: "غير متصل",
  disabled: "معطل",
  active: "نشط",
  inactive: "غير نشط",
  printerConfiguration: "إعدادات الطابعات",
  printerConfigSubtitle: "تهيئة طابعات الكاشير والمطبخ والبار عبر USB أو شبكة LAN.",
  addNewPrinter: "إضافة طابعة جديدة",
  noPrinters: "لا توجد طابعات مهيأة بعد. أضف طابعتك الأولى أعلاه.",
  copies: "عدد النسخ",
  printerRouting: "توجيه الطباعة",
  recentProducts: "المنتجات الأخيرة",
  categoriesLabel: "التصنيفات",
  noProducts: "لا توجد منتجات",
  noCategories: "لا توجد تصنيفات",
  routingHelp: "توجيهات المنتجات تتجاوز توجيهات التصنيفات. عناصر الإعداد غير الموجهة تستخدم أول طابعة مطبخ مفعلة.",
  displayName: "اسم الطابعة في النظام",
  roleLabel: "الدور / الغرض",
  roleCashier: "الكاشير (فواتير الزبائن)",
  roleKitchen: "المطبخ (تذاكر الطلبات)",
  roleBar: "البار / المشروبات",
  roleLabelOption: "الملصقات",
  roleReport: "التقارير",
  assignedDevice: "الجهاز / الكمبيوتر المضيف",
  connectionType: "نوع الاتصال",
  usbSpooler: "USB / طابعة ويندوز المباشرة",
  networkLan: "شبكة LAN (منفذ 9100 مباشر)",
  localPrinterName: "اسم طابعة ويندوز",
  selectDetectedPrinter: "-- اختر من الطابعات المكتشفة --",
  defaultPrinter: "الافتراضية",
  detectedPrintersHint: "يتم ملء هذه القائمة تلقائياً من الطابعات المعرفة في ويندوز عبر وكيل الطباعة.",
  manualPrinterNameHint: "اكتب اسم الطابعة كما هو مطابق تماماً في قائمة طابعات ويندوز.",
  ipAddress: "عنوان IP للطابعة",
  port: "المنفذ (الافتراضي 9100)",
  paperWidthLabel: "عرض الورق",
  standardThermal: "قياسي 80 ملم",
  compactThermal: "مدمج 58 ملم",
  customMm: "مخصص (ملم)",
  customWidthMm: "العرض بالمليمتر",
  autoPrint: "طباعة تلقائية عند الدفع",
  enabled: "مفعلة للعمل",
  cashDrawerSettings: "درج النقدية (وصلة RJ11)",
  enableCashDrawer: "فتح درج النقدية تلقائياً عند الدفع نقداً",
  drawerEnabled: "درج النقدية مفعّل",
  drawerPin: "مقبس فتح الدرج",
  pulseOn: "نبضة تشغيل (ms)",
  pulseOff: "نبضة إيقاف (ms)",
  openBeforePrint: "فتح الدرج قبل بدء الطباعة",
  testDrawer: "اختبار درج النقدية",
  testPrint: "طباعة تجريبية",
  testPrintShort: "طباعة فحص",
  drawerShort: "الدرج",
  configure: "تعديل",
  save: "حفظ الإعدادات",
  cancel: "إلغاء",
  delete: "حذف",
  confirmDelete: "هل أنت متأكد من حذف إعدادات هذه الطابعة؟",
  deleteError: "فشل حذف إعدادات الطابعة.",
  printerDeleted: "تم حذف إعدادات الطابعة بنجاح.",
  saveError: "فشل حفظ إعدادات الطابعة.",
  printerSaved: "تم حفظ إعدادات الطابعة بنجاح.",
  drawerTestError: "فشل اختبار درج النقدية.",
  drawerTestSent: "تم إرسال أمر فتح الدرج إلى وكيل الطباعة.",
  testPrintError: "فشلت الطباعة التجريبية.",
  testPrintSent: "تم إرسال مهمة الطباعة التجريبية إلى الطابعة بنجاح.",
  target: "الهدف",
  drawer: "الدرج",
  errorNameRequired: "يرجى إدخال اسم الطابعة في النظام.",
  errorDeviceRequired: "يرجى تحديد جهاز الكاشير المضيف.",
  errorLanIpRequired: "عنوان IP مطلوب لاتصال الشبكة LAN.",
  errorPortInvalid: "رقم المنفذ غير صالح (يجب أن يكون بين 1 و 65535).",
  errorSpoolerRequired: "اسم طابعة ويندوز مطلوب.",
  errorCustomWidthRequired: "يرجى تحديد عرض الورق المخصص بالمليمتر.",
};

type Copy = typeof englishCopy;
