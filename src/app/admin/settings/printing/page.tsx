import { AppShell } from "@/components/app-shell";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function PrintingSettingsPage() {
  const [branches, devices, printers, products, categories] = await Promise.all([
    db.branch.findMany({ orderBy: { name: "asc" } }),
    db.printDevice.findMany({ include: { branch: true }, orderBy: { createdAt: "desc" } }),
    db.printerConfiguration.findMany({ include: { printDevice: true, branch: true }, orderBy: { createdAt: "desc" } }),
    db.product.findMany({ select: { id: true, sku: true, translations: true }, take: 25, orderBy: { createdAt: "desc" } }),
    db.category.findMany({ take: 25, orderBy: { sortOrder: "asc" } }),
  ]);
  return (
    <AppShell title="Printing Settings" description="Devices, local printers, and product routing">
      <div className="grid gap-5">
        <section className="card p-5">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold">Connected Print Devices</h2>
              <p className="text-sm text-muted mt-1">Generate a pairing code from the API, then enter it in Nova Print Agent.</p>
            </div>
            <code className="text-xs bg-background rounded-lg px-3 py-2">POST /api/printing/pairing-codes</code>
          </div>
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm">
              <thead className="text-muted"><tr><th className="text-start p-2">Device</th><th className="text-start p-2">Branch</th><th className="text-start p-2">Status</th><th className="text-start p-2">OS</th><th className="text-start p-2">Version</th><th className="text-start p-2">Heartbeat</th></tr></thead>
              <tbody>{devices.map((device) => <tr key={device.id} className="border-t border-border"><td className="p-2 font-semibold">{device.name}</td><td className="p-2">{device.branch.name}</td><td className="p-2"><span className={`rounded-full px-2 py-1 text-xs ${device.status === "ONLINE" ? "bg-success/10 text-success" : device.status === "DISABLED" ? "bg-muted/10 text-muted" : "bg-danger/10 text-danger"}`}>{device.status}</span></td><td className="p-2">{device.operatingSystem || "-"}</td><td className="p-2">{device.appVersion || "-"}</td><td className="p-2">{device.lastHeartbeatAt?.toLocaleString() || "-"}</td></tr>)}</tbody>
            </table>
          </div>
          {!devices.length && <p className="text-sm text-muted mt-4">No print devices paired yet.</p>}
        </section>
        <section className="card p-5">
          <h2 className="text-lg font-bold">Printer Configuration</h2>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3 mt-4">
            {printers.map((printer) => <div key={printer.id} className="rounded-lg border border-border p-4"><div className="flex justify-between gap-3"><b>{printer.displayName}</b><span className="text-xs text-muted">{printer.printerType}</span></div><p className="text-sm text-muted mt-2">{printer.localPrinterName}</p><p className="text-xs mt-3">{printer.branch.name} · {printer.printDevice.name} · {printer.paperWidth} · {printer.copies} copies</p></div>)}
          </div>
          {!printers.length && <p className="text-sm text-muted mt-4">No ERP printer configuration exists. Pair an agent and create printers from reported local Windows printer names.</p>}
        </section>
        <section className="card p-5">
          <h2 className="text-lg font-bold">Printer Routing</h2>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="rounded-lg border border-border p-4"><b>Recent products</b><p className="text-sm text-muted mt-2">{products.map((p) => p.translations[0]?.name || p.sku).join(", ") || "No products"}</p></div>
            <div className="rounded-lg border border-border p-4"><b>Categories</b><p className="text-sm text-muted mt-2">{categories.map((c) => c.nameEn).join(", ") || "No categories"}</p></div>
          </div>
          <p className="text-xs text-muted mt-4">Product routes override category routes. Unrouted preparation items use the first enabled kitchen printer.</p>
        </section>
        <section className="card p-5">
          <h2 className="text-lg font-bold">Branches</h2>
          <p className="text-sm text-muted mt-2">{branches.map((branch) => branch.name).join(", ")}</p>
        </section>
      </div>
    </AppShell>
  );
}
