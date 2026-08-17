"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Copy,
  Monitor,
  Printer,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Zap,
  Save,
  TestTube2,
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

type Device = {
  id: string;
  name: string;
  status: string;
  operatingSystem?: string | null;
  appVersion?: string | null;
  lastHeartbeatAt?: Date | null;
  lastConnectedAt?: Date | null;
  sseStatus?: string | null;
  lastEventAt?: Date | null;
  lastFallbackPollAt?: Date | null;
  lastPrinterRefreshAt?: Date | null;
  branch: { name: string; nameAr?: string | null };
};

type Printer = {
  id: string;
  displayName: string;
  printerType: string;
  localPrinterName: string;
  paperWidth: string;
  copies: number;
  branch: { name: string; nameAr?: string | null };
  printDevice: { name: string };
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
  id: string;
  displayName: string;
  localPrinterName: string;
  copies: number;
  openCashDrawer: boolean;
  cashDrawerPin: number;
  cashDrawerPulseOn: number;
  cashDrawerPulseOff: number;
  cashDrawerOpenBeforePrint: boolean;
};

export function PrintingSettingsPage({ branches, devices: initialDevices, printers, products, categories }: Props) {
  const { locale } = useLanguage();
  const ar = locale === "ar";
  const copy = ar ? arabicCopy : englishCopy;

  const [devices, setDevices] = useState<Device[]>(initialDevices);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [countdown, setCountdown] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState<Notice>(null);
  const [savingPrinterId, setSavingPrinterId] = useState<string | null>(null);
  const [testingDrawerId, setTestingDrawerId] = useState<string | null>(null);
  const [editingPrinterId, setEditingPrinterId] = useState<string | null>(null);
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

  useEffect(() => {
    if (!pairingCode || !expiresAt) return;
    const now = new Date().getTime();
    const expiry = new Date(expiresAt).getTime();
    if (now >= expiry) return;

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

    refreshDevices();
    const interval = setInterval(refreshDevices, 10000);
    return () => clearInterval(interval);
  }, [pairingCode, expiresAt]);

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

  function startEdit(printer: Printer) {
    setEditingPrinterId(printer.id);
    setPrinterForm({
      id: printer.id,
      displayName: printer.displayName,
      localPrinterName: printer.localPrinterName,
      copies: printer.copies,
      openCashDrawer: printer.openCashDrawer,
      cashDrawerPin: printer.cashDrawerPin,
      cashDrawerPulseOn: printer.cashDrawerPulseOn,
      cashDrawerPulseOff: printer.cashDrawerPulseOff,
      cashDrawerOpenBeforePrint: printer.cashDrawerOpenBeforePrint,
    });
  }

  function cancelEdit() {
    setEditingPrinterId(null);
    setPrinterForm(null);
  }

  async function savePrinter() {
    if (!printerForm || savingPrinterId) return;
    setSavingPrinterId(printerForm.id);
    setError("");
    setNotice(null);
    try {
      const response = await fetch(`/api/printing/printers/${printerForm.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: printerForm.displayName,
          localPrinterName: printerForm.localPrinterName,
          copies: printerForm.copies,
          openCashDrawer: printerForm.openCashDrawer,
          cashDrawerPin: printerForm.cashDrawerPin,
          cashDrawerPulseOn: printerForm.cashDrawerPulseOn,
          cashDrawerPulseOff: printerForm.cashDrawerPulseOff,
          cashDrawerOpenBeforePrint: printerForm.cashDrawerOpenBeforePrint,
        }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(apiMessage(body) || copy.saveError);
      }
      setNotice({ tone: "success", text: copy.printerSaved });
      setEditingPrinterId(null);
      setPrinterForm(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : copy.saveError;
      setError(message);
    } finally {
      setSavingPrinterId(null);
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
                    {generating ? <RefreshCw size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                    {copy.generateNewCode}
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="card overflow-hidden">
          <div className="p-5 border-b border-border flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-primary">
                <Monitor size={19} />
                <h2 className="font-bold text-lg">{copy.connectedDevices}</h2>
              </div>
              <p className="text-sm text-muted mt-1">{copy.devicePairingHelp}</p>
            </div>
            <code className="text-xs bg-background rounded-lg px-3 py-2">POST /api/printing/pairing-codes</code>
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
                  <th className="p-3 text-start">{copy.sse}</th>
                  <th className="p-3 text-start">{copy.heartbeat}</th>
                  <th className="p-3 text-start">{copy.lastEvent}</th>
                  <th className="p-3 text-start">{copy.lastFallbackPoll}</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((device) => (
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
                    <td className="p-3">{device.sseStatus || "-"}</td>
                    <td className="p-3">
                      {device.lastHeartbeatAt ? new Date(device.lastHeartbeatAt).toLocaleString() : "-"}
                    </td>
                    <td className="p-3">{device.lastEventAt ? new Date(device.lastEventAt).toLocaleString() : "-"}</td>
                    <td className="p-3">{device.lastFallbackPollAt ? new Date(device.lastFallbackPollAt).toLocaleString() : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mobile-card-list p-3">
            {devices.map((device) => (
              <DeviceCard key={`${device.id}-card`} device={device} copy={copy} branchName={branchName} />
            ))}
          </div>
          {!devices.length && <p className="text-sm text-muted p-4 text-center">{copy.noDevices}</p>}
        </section>

        <section className="card p-5">
          <div className="flex items-center gap-2 text-primary">
            <Printer size={19} />
            <h2 className="text-lg font-bold">{copy.printerConfiguration}</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
            {printers.map((printer) => (
              <div key={printer.id} className="rounded-lg border border-border p-4">
                <div className="flex justify-between gap-3">
                  <b>{printer.displayName}</b>
                  <span className="text-xs text-muted">{printer.printerType}</span>
                </div>
                <p className="text-sm text-muted mt-2">{printer.localPrinterName}</p>
                <p className="text-xs mt-3 text-muted">
                  {branchName(printer.branch)} · {printer.printDevice.name} · {printer.paperWidth} · {printer.copies} {copy.copies}
                </p>

                {editingPrinterId === printer.id && printerForm ? (
                  <form
                    className="mt-4 pt-4 border-t border-border space-y-3"
                    onSubmit={(e) => { e.preventDefault(); savePrinter(); }}
                  >
                    <label className="block">
                      <span className="text-xs font-bold block mb-1">{copy.displayName}</span>
                      <input className="input" value={printerForm.displayName} onChange={(e) => setPrinterForm({ ...printerForm, displayName: e.target.value })} />
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold block mb-1">{copy.localPrinterName}</span>
                      <input className="input" value={printerForm.localPrinterName} onChange={(e) => setPrinterForm({ ...printerForm, localPrinterName: e.target.value })} />
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold block mb-1">{copy.copies}</span>
                      <input type="number" min={1} max={5} className="input" value={printerForm.copies} onChange={(e) => setPrinterForm({ ...printerForm, copies: Number(e.target.value) })} />
                    </label>

                    <div className="pt-3 border-t border-border">
                      <p className="text-xs font-bold text-primary mb-2">{copy.cashDrawerSettings}</p>
                      <label className="flex items-center gap-2 mb-3">
                        <input
                          type="checkbox"
                          checked={printerForm.openCashDrawer}
                          onChange={(e) => setPrinterForm({ ...printerForm, openCashDrawer: e.target.checked })}
                          className="size-4 accent-[var(--primary)]"
                        />
                        <span className="text-sm font-semibold">{copy.enableCashDrawer}</span>
                      </label>
                      {printerForm.openCashDrawer && (
                        <div className="grid grid-cols-2 gap-3">
                          <label className="block">
                            <span className="text-xs font-bold block mb-1">{copy.drawerPin}</span>
                            <select className="input" value={printerForm.cashDrawerPin} onChange={(e) => setPrinterForm({ ...printerForm, cashDrawerPin: Number(e.target.value) })}>
                              <option value={0}>Pin 2 / Drawer 1</option>
                              <option value={1}>Pin 5 / Drawer 2</option>
                            </select>
                          </label>
                          <label className="block">
                            <span className="text-xs font-bold block mb-1">{copy.pulseOn}</span>
                            <input type="number" min={1} max={255} className="input" value={printerForm.cashDrawerPulseOn} onChange={(e) => setPrinterForm({ ...printerForm, cashDrawerPulseOn: Number(e.target.value) })} />
                          </label>
                          <label className="block">
                            <span className="text-xs font-bold block mb-1">{copy.pulseOff}</span>
                            <input type="number" min={1} max={255} className="input" value={printerForm.cashDrawerPulseOff} onChange={(e) => setPrinterForm({ ...printerForm, cashDrawerPulseOff: Number(e.target.value) })} />
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={printerForm.cashDrawerOpenBeforePrint}
                              onChange={(e) => setPrinterForm({ ...printerForm, cashDrawerOpenBeforePrint: e.target.checked })}
                              className="size-4 accent-[var(--primary)]"
                            />
                            <span className="text-sm font-semibold">{copy.openBeforePrint}</span>
                          </label>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button type="submit" className="btn-primary flex items-center gap-2" disabled={savingPrinterId === printer.id}>
                        {savingPrinterId === printer.id ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                        {copy.save}
                      </button>
                      <button type="button" className="btn-secondary" onClick={cancelEdit}>
                        {copy.cancel}
                      </button>
                      <button
                        type="button"
                        className="btn-secondary flex items-center gap-2"
                        onClick={() => testCashDrawer(printer.id)}
                        disabled={testingDrawerId === printer.id}
                      >
                        {testingDrawerId === printer.id ? <RefreshCw size={16} className="animate-spin" /> : <TestTube2 size={16} />}
                        {copy.testDrawer}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="mt-3 pt-3 border-t border-border">
                    {printer.openCashDrawer && (
                      <div className="flex items-center gap-1.5 text-xs text-success mb-2">
                        <span className="size-1.5 rounded-full bg-success" />
                        {copy.drawerEnabled}
                      </div>
                    )}
                    <button
                      type="button"
                      className="btn-secondary w-full flex items-center justify-center gap-2 text-xs"
                      onClick={() => startEdit(printer)}
                    >
                      <Settings2 size={14} />
                      {copy.configure}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          {!printers.length && (
            <p className="text-sm text-muted mt-4">{copy.noPrinters}</p>
          )}
        </section>

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

        <section className="card p-5">
          <div className="flex items-center gap-2 text-primary">
            <Zap size={19} />
            <h2 className="text-lg font-bold">{copy.branches}</h2>
          </div>
          <p className="text-sm text-muted mt-2">{branches.map((b) => ar ? b.nameAr : b.name).join(", ")}</p>
        </section>
      </div>
    </AppShell>
  );
}

function DeviceCard({ device, copy, branchName }: { device: Device; copy: Copy; branchName: (b: { name: string; nameAr?: string | null }) => string }) {
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
        <Info label={copy.sse} value={device.sseStatus || "-"} />
        <Info label={copy.heartbeat} value={device.lastHeartbeatAt ? new Date(device.lastHeartbeatAt).toLocaleString() : "-"} />
        <Info label={copy.lastConnected} value={device.lastConnectedAt ? new Date(device.lastConnectedAt).toLocaleString() : "-"} />
        <Info label={copy.lastEvent} value={device.lastEventAt ? new Date(device.lastEventAt).toLocaleString() : "-"} />
        <Info label={copy.lastFallbackPoll} value={device.lastFallbackPollAt ? new Date(device.lastFallbackPollAt).toLocaleString() : "-"} />
        <Info label={copy.lastPrinterRefresh} value={device.lastPrinterRefreshAt ? new Date(device.lastPrinterRefreshAt).toLocaleString() : "-"} />
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
  description: "Devices, local printers, and product routing",
  devicePairing: "Device Pairing",
  devicePairingHelp: "Generate a pairing code from the API, then enter it in Nova Print Agent.",
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
  noDevices: "No print devices paired yet.",
  device: "Device",
  branch: "Branch",
  status: "Status",
  os: "OS",
  version: "Version",
  sse: "SSE",
  heartbeat: "Heartbeat",
  lastConnected: "Last connected",
  lastEvent: "Last event",
  lastFallbackPoll: "Fallback poll",
  lastPrinterRefresh: "Printer refresh",
  online: "Online",
  offline: "Offline",
  disabled: "Disabled",
  printerConfiguration: "Printer Configuration",
  noPrinters: "No ERP printer configuration exists. Pair an agent and create printers from reported local Windows printer names.",
  copies: "copies",
  printerRouting: "Printer Routing",
  recentProducts: "Recent products",
  categoriesLabel: "Categories",
  noProducts: "No products",
  noCategories: "No categories",
  routingHelp: "Product routes override category routes. Unrouted preparation items use the first enabled kitchen printer.",
  branches: "Branches",
  displayName: "Display name",
  localPrinterName: "Local printer name",
  configure: "Configure",
  save: "Save",
  cancel: "Cancel",
  saveError: "Failed to save printer settings.",
  printerSaved: "Printer settings saved.",
  cashDrawerSettings: "Cash Drawer Settings",
  enableCashDrawer: "Enable Cash Drawer",
  drawerEnabled: "Cash drawer enabled",
  drawerPin: "Drawer pin",
  pulseOn: "Pulse ON (ms)",
  pulseOff: "Pulse OFF (ms)",
  openBeforePrint: "Open before printing",
  testDrawer: "Test Cash Drawer",
  drawerTestError: "Cash drawer test failed.",
  drawerTestSent: "Cash drawer test command sent.",
};

const arabicCopy: typeof englishCopy = {
  title: "إعدادات الطباعة",
  description: "الأجهزة، الطابعات المحلية، وتوجيه المنتجات",
  devicePairing: "اقتران الجهاز",
  devicePairingHelp: "أنشئ رمز اقتران من API، ثم أدخله في Nova Print Agent.",
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
  noDevices: "لا توجد أجهزة طباعة مقترنة بعد.",
  device: "الجهاز",
  branch: "الفرع",
  status: "الحالة",
  os: "نظام التشغيل",
  version: "الإصدار",
  sse: "SSE",
  heartbeat: "آخر اتصال",
  lastConnected: "آخر اتصال مباشر",
  lastEvent: "آخر حدث",
  lastFallbackPoll: "آخر فحص احتياطي",
  lastPrinterRefresh: "آخر تحديث للطابعات",
  online: "متصل",
  offline: "غير متصل",
  disabled: "معطل",
  printerConfiguration: "إعدادات الطابعات",
  noPrinters: "لا توجد إعدادات طابعات. اقترن جهازاً وأنشئ طابعات من الأسماء المبلغ عنها.",
  copies: "نسخ",
  printerRouting: "توجيه الطباعة",
  recentProducts: "المنتجات الأخيرة",
  categoriesLabel: "التصنيفات",
  noProducts: "لا توجد منتجات",
  noCategories: "لا توجد تصنيفات",
  routingHelp: "تجاوز مسارات المنتجات لمسارات التصنيفات. العناصر غير الموجهة تستخدم أول طابعة مطبخ مفعلة.",
  branches: "الفروع",
  displayName: "الاسم المعروض",
  localPrinterName: "اسم الطابعة المحلية",
  configure: "تعديل",
  save: "حفظ",
  cancel: "إلغاء",
  saveError: "فشل حفظ إعدادات الطابعة.",
  printerSaved: "تم حفظ إعدادات الطابعة.",
  cashDrawerSettings: "إعدادات درج النقدية",
  enableCashDrawer: "تفعيل درج النقدية",
  drawerEnabled: "درج النقدية مفعّل",
  drawerPin: "مقبس الدرج",
  pulseOn: "نبضة تشغيل (ms)",
  pulseOff: "نبضة إيقاف (ms)",
  openBeforePrint: "فتح قبل الطباعة",
  testDrawer: "اختبار درج النقدية",
  drawerTestError: "فشل اختبار درج النقدية.",
  drawerTestSent: "تم إرسال أمر اختبار درج النقدية.",
};

type Copy = typeof englishCopy;
