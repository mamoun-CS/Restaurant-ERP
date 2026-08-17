const fs = require("node:fs");
const path = require("node:path");
const { app } = require("electron");

const finalStatuses = [
  "PRINTED",
  "PDF_SAVED",
  "PRINTED_AND_SAVED",
  "REJECTED",
];

function dbPath() {
  return path.join(app.getPath("userData"), "print-queue.json");
}

function readQueue() {
  try {
    if (!fs.existsSync(dbPath())) return { jobs: [] };
    return JSON.parse(fs.readFileSync(dbPath(), "utf8"));
  } catch {
    return { jobs: [] };
  }
}

function writeQueue(queue) {
  fs.mkdirSync(path.dirname(dbPath()), { recursive: true });
  fs.writeFileSync(dbPath(), JSON.stringify(queue, null, 2), "utf8");
}

function emitQueueUpdate() {
  const jobs = readQueue().jobs.slice(-200).reverse();
  try {
    const BrowserWindow = require("electron").BrowserWindow;
    const windows = BrowserWindow.getAllWindows();
    windows.forEach((win) => win.webContents.send("queue:update", jobs).catch(() => undefined));
  } catch {
    // ignore
  }
}

function upsertReceived(job) {
  const queue = readQueue();
  const existing = queue.jobs.find((item) => item.id === job.id);
  if (existing && (finalStatuses.includes(existing.status) || existing.status === "PROCESSING")) return { duplicate: true, job: existing };
  if (!existing) queue.jobs.push({ id: job.id, payload: job, status: "RECEIVED", attempts: 0, receivedAt: new Date().toISOString() });
  writeQueue(queue);
  emitQueueUpdate();
  return { duplicate: false, job: existing || queue.jobs.find((item) => item.id === job.id) || job };
}

function markJob(id, patch) {
  const queue = readQueue();
  const index = queue.jobs.findIndex((job) => job.id === id);
  if (index >= 0) queue.jobs[index] = { ...queue.jobs[index], ...patch };
  writeQueue(queue);
  emitQueueUpdate();
}

function stats() {
  const jobs = readQueue().jobs;
  const today = new Date().toISOString().slice(0, 10);
  return {
    printedToday: jobs.filter((job) => job.status === "PRINTED" && job.completedAt?.startsWith(today)).length,
    failedJobs: jobs.filter((job) => job.status === "FAILED").length,
    lastReceivedJob: jobs.at(-1)?.id || "",
    lastSuccessfulPrint: [...jobs].reverse().find((job) => ["PRINTED", "PDF_SAVED", "PRINTED_AND_SAVED"].includes(job.status))?.completedAt || "",
    lastError: [...jobs].reverse().find((job) => job.errorMessage)?.errorMessage || ""
  };
}

module.exports = { upsertReceived, markJob, stats, readQueue, finalStatuses };
