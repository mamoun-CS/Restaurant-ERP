const os = require("node:os");
const { printHtml } = require("./printer");
const { upsertReceived, markJob } = require("./queue");

let pollTimer = null;
let heartbeatTimer = null;
let processing = false;

function authHeaders(config, token) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}`, "x-print-device-id": config.deviceId };
}

async function pairDevice(config, pairingCode) {
  const response = await fetch(`${config.erpUrl}/api/printing/pair`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pairingCode, deviceName: config.deviceName, operatingSystem: `${os.type()} ${os.release()}`, appVersion: require("../package.json").version }),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.message || "Pairing failed.");
  return data;
}

function connectToServer(config, token, onStatusChange) {
  disconnectFromServer();
  if (!config.erpUrl || !config.deviceId || !token) {
    onStatusChange?.({ connected: false, message: "Not paired" });
    return;
  }
  const heartbeat = async () => {
    try {
      const response = await fetch(`${config.erpUrl}/api/printing/device/heartbeat`, { method: "POST", headers: authHeaders(config, token) });
      if (!response.ok) throw new Error("Heartbeat rejected");
      const data = await response.json().catch(() => ({}));
      onStatusChange?.({ connected: true, message: "Connected" });
      schedulePoll(config, token, onStatusChange, data.pollingIntervalMs || config.pollingIntervalMs || 5000);
    } catch {
      onStatusChange?.({ connected: false, message: "Disconnected" });
      schedulePoll(config, token, onStatusChange, 10000);
    }
  };
  heartbeat();
  heartbeatTimer = setInterval(heartbeat, 30000);
}

function schedulePoll(config, token, onStatusChange, delay) {
  if (pollTimer) clearTimeout(pollTimer);
  pollTimer = setTimeout(async () => {
    await pollJobs(config, token, onStatusChange).catch(() => onStatusChange?.({ connected: false, message: "Connection lost" }));
    schedulePoll(config, token, onStatusChange, config.pollingIntervalMs || delay);
  }, delay);
}

async function pollJobs(config, token) {
  if (processing || config.paused) return;
  processing = true;
  try {
    const response = await fetch(`${config.erpUrl}/api/printing/device/jobs`, { headers: authHeaders(config, token) });
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.message || "Could not fetch jobs.");
    for (const job of data.jobs || []) await handlePrintJob(job, config, token);
  } finally {
    processing = false;
  }
}

async function syncPrinters(config, token, printers) {
  if (!config.deviceId || !token) return;
  await fetch(`${config.erpUrl}/api/printing/device/printers`, { method: "POST", headers: authHeaders(config, token), body: JSON.stringify({ printers }) });
}

async function handlePrintJob(job, config, token) {
  const queued = upsertReceived(job);
  if (queued.duplicate) return failJob(config, token, job.id, "DUPLICATE_JOB", "Duplicate job rejected by local queue.");
  const printerName = job.printerConfiguration?.localPrinterName;
  try {
    markJob(job.id, { status: "PROCESSING", attempts: (queued.job.attempts || 0) + 1, lastAttemptAt: new Date().toISOString() });
    await fetch(`${config.erpUrl}/api/printing/device/jobs/${job.id}/processing`, { method: "POST", headers: authHeaders(config, token) });
    await printHtml({ jobId: job.id, html: job.content, printerName, paperWidth: job.paperWidth, copies: job.copies, mockMode: config.mockMode });
    markJob(job.id, { status: "PRINTED", completedAt: new Date().toISOString() });
    await fetch(`${config.erpUrl}/api/printing/device/jobs/${job.id}/complete`, { method: "POST", headers: authHeaders(config, token) });
  } catch (error) {
    const code = error.code || "UNKNOWN_ERROR";
    markJob(job.id, { status: "FAILED", errorCode: code, errorMessage: error.message });
    await failJob(config, token, job.id, code, error.message);
  }
}

async function failJob(config, token, id, errorCode, errorMessage) {
  await fetch(`${config.erpUrl}/api/printing/device/jobs/${id}/fail`, { method: "POST", headers: authHeaders(config, token), body: JSON.stringify({ errorCode, errorMessage }) }).catch(() => undefined);
}

function disconnectFromServer() {
  if (pollTimer) clearTimeout(pollTimer);
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  pollTimer = null;
  heartbeatTimer = null;
}

module.exports = { connectToServer, disconnectFromServer, pairDevice, syncPrinters };
