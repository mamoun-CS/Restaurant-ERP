import { AppShell } from "@/components/app-shell";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function PrintJobsPage() {
  const jobs = await db.printJob.findMany({
    include: { branch: true, printDevice: true, printerConfiguration: true, invoice: true, kitchenOrder: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return (
    <AppShell title="Print Jobs" description="Monitor pending, failed, printed, retry, and reprint jobs">
      <section className="card p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-muted"><tr><th className="text-start p-2">Job</th><th className="text-start p-2">Invoice</th><th className="text-start p-2">Order</th><th className="text-start p-2">Branch</th><th className="text-start p-2">Device</th><th className="text-start p-2">Printer</th><th className="text-start p-2">Type</th><th className="text-start p-2">Status</th><th className="text-start p-2">Attempts</th><th className="text-start p-2">Error</th></tr></thead>
            <tbody>{jobs.map((job) => <tr key={job.id} className="border-t border-border align-top"><td className="p-2 font-mono text-xs">{job.id.slice(-8)}</td><td className="p-2">{job.invoice?.number || "-"}</td><td className="p-2">{job.kitchenOrder?.orderNumber || "-"}</td><td className="p-2">{job.branch.name}</td><td className="p-2">{job.printDevice?.name || "-"}</td><td className="p-2">{job.printerConfiguration?.displayName || "-"}</td><td className="p-2">{job.jobType}</td><td className="p-2"><span className="rounded-full bg-background px-2 py-1 text-xs">{job.status}</span></td><td className="p-2">{job.attempts}/{job.maxAttempts}</td><td className="p-2 max-w-xs break-words">{job.errorCode || job.errorMessage || "-"}</td></tr>)}</tbody>
          </table>
        </div>
        {!jobs.length && <p className="text-sm text-muted">No print jobs have been created yet.</p>}
      </section>
    </AppShell>
  );
}
