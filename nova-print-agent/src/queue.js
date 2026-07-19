const fs = require("node:fs");
const path = require("node:path");
const { app } = require("electron");

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

function upsertReceived(job) {
  const queue = readQueue();
  const existing = queue.jobs.find((item) => item.id === job.id);
  if (existing && ["PRINTED", "PROCESSING"].includes(existing.status)) return { duplicate: true, job: existing };
  if (!existing) queue.jobs.push({ id: job.id, payload: job, status: "RECEIVED", attempts: 0, receivedAt: new Date().toISOString() });
  writeQueue(queue);
  return { duplicate: false, job };
}

function markJob(id, patch) {
  const queue = readQueue();
  const index = queue.jobs.findIndex((job) => job.id === id);
  if (index >= 0) queue.jobs[index] = { ...queue.jobs[index], ...patch };
  writeQueue(queue);
}

function stats() {
  const jobs = readQueue().jobs;
  const today = new Date().toISOString().slice(0, 10);
  return {
    printedToday: jobs.filter((job) => job.status === "PRINTED" && job.completedAt?.startsWith(today)).length,
    failedJobs: jobs.filter((job) => job.status === "FAILED" || job.status === "RETRY_PENDING").length,
    lastReceivedJob: jobs.at(-1)?.id || "",
    lastSuccessfulPrint: [...jobs].reverse().find((job) => job.status === "PRINTED")?.completedAt || "",
    lastError: [...jobs].reverse().find((job) => job.errorMessage)?.errorMessage || ""
  };
}

module.exports = { upsertReceived, markJob, stats, readQueue };
