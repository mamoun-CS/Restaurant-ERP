const os = require("node:os");
const { getPrinters, printHtml, saveHtmlAsPdf, openCashDrawer } = require("./printer");
const { upsertReceived, markJob, readQueue } = require("./queue");

const JOB_ACTIONS = ["PRINT", "SAVE_PDF", "PRINT_AND_SAVE", "MANUAL", "REJECT"];
const MANUAL_ACTIONS = ["PRINT", "SAVE_PDF", "PRINT_AND_SAVE", "RETRY"];

const HEARTBEAT_INTERVAL = 30000;
const FALLBACK_POLL_INTERVAL = 60000;
const RECONNECT_DELAYS = [2000, 5000, 10000, 30000, 60000];

let eventAbort = null;
let reconnectTimer = null;
let fallbackTimer = null;
let heartbeatTimer = null;
let processing = false;
let fallbackPolling = false;
let reconnectAttempt = 0;
let lastSuccessfulPrintAt = "";
let runtimeStatus = {
  connected: false,
  message: "Disconnected",
  sseStatus: "Disconnected",
  lastConnectedAt: "",
  lastEventAt: "",
  lastFallbackPollAt: "",
  lastJobMessage: "",
};

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
    updateStatus(onStatusChange, { connected: false, message: "Not paired", sseStatus: "Disconnected" });
    return;
  }
  void pollJobs(config, token, onStatusChange, "startup").catch((error) => {
    log("QUEUE_FETCH_FAILED", {
      source: "startup",
      message: error.message,
      deviceId: config.deviceId,
      hasToken: Boolean(token),
    });
  });
  connectToPrintEvents(config, token, onStatusChange);
  startHeartbeat(config, token, onStatusChange);
}

function connectToPrintEvents(config, token, onStatusChange) {
  if (eventAbort) return;
  eventAbort = new AbortController();
  const url = `${config.erpUrl}/api/printing/device/events`;
  log("SSE_CONNECTING", { message: "[SSE] Connecting...", url, attempt: reconnectAttempt + 1, deviceId: config.deviceId, hasToken: Boolean(token) });
  updateStatus(onStatusChange, { connected: false, message: reconnectAttempt ? "Reconnecting" : "Connecting", sseStatus: "Reconnecting" });
  fetch(url, {
    headers: authHeaders(config, token),
    signal: eventAbort.signal,
  })
    .then(async (response) => {
      if (response.status === 401 || response.status === 403) {
        const body = await response.text().catch(() => "");
        log("SSE_AUTH_FAILED", { url, status: response.status, body, deviceId: config.deviceId, hasToken: Boolean(token) });
        throw new Error("SSE_AUTH_FAILED");
      }
      if (!response.ok || !response.body) {
        const body = await response.text().catch(() => "");
        log("SSE_CONNECT_FAILED", { url, status: response.status, body, deviceId: config.deviceId, hasToken: Boolean(token) });
        throw new Error(`SSE connection failed: ${response.status}`);
      }
      reconnectAttempt = 0;
      stopFallbackPolling();
      updateStatus(onStatusChange, { connected: true, message: "Connected", sseStatus: "Connected", lastConnectedAt: new Date().toISOString() });
      log("SSE_CONNECTED", { message: "[SSE] Connected", url, deviceId: config.deviceId });
      await pollJobs(config, token, onStatusChange, "initial-sync");
      await readEventStream(response.body, async (event) => {
        runtimeStatus.lastEventAt = new Date().toISOString();
        if (event.event === "connected") return;
        log("SSE_EVENT_RECEIVED", { event: event.event, message: event.event === "print-job" || event.event === "PRINT_JOB_CREATED" ? "[SSE] Print job notification received" : undefined });
        if (event.event === "print-job" || event.event === "PRINT_JOB_CREATED") {
          const payload = JSON.parse(event.data || "{}");
          if (payload.jobId) await pollJobs(config, token, onStatusChange, `sse:${payload.jobId}`);
        }
      });
      throw new Error("SSE stream closed");
    })
    .catch((error) => {
      if (eventAbort?.signal.aborted) return;
      log(error.message === "SSE_AUTH_FAILED" ? "SSE_AUTH_FAILED" : "SSE_DISCONNECTED", { message: error.message });
      updateStatus(onStatusChange, { connected: false, message: "Fallback Polling", sseStatus: "Fallback Polling" });
      startFallbackPolling(config, token, onStatusChange);
      scheduleReconnect(config, token, onStatusChange);
    })
    .finally(() => {
      eventAbort = null;
    });
}

async function readEventStream(body, onEvent) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() || "";
    for (const chunk of chunks) {
      if (!chunk.trim() || chunk.startsWith(":")) continue;
      const event = parseSseChunk(chunk);
      await onEvent(event);
    }
  }
}

function parseSseChunk(chunk) {
  const event = { event: "message", data: "" };
  for (const line of chunk.split("\n")) {
    if (line.startsWith("event:")) event.event = line.slice(6).trim();
    if (line.startsWith("data:")) event.data += line.slice(5).trim();
  }
  return event;
}

function scheduleReconnect(config, token, onStatusChange) {
  if (reconnectTimer) return;
  const delay = RECONNECT_DELAYS[Math.min(reconnectAttempt, RECONNECT_DELAYS.length - 1)];
  reconnectAttempt += 1;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connectToPrintEvents(config, token, onStatusChange);
  }, delay);
}

function startFallbackPolling(config, token, onStatusChange) {
  if (fallbackTimer) return;
  fallbackPolling = true;
  const intervalMs = fallbackPollIntervalMs(config);
  log("FALLBACK_POLL_STARTED", { intervalMs });
  const run = async () => {
    runtimeStatus.lastFallbackPollAt = new Date().toISOString();
    await pollJobs(config, token, onStatusChange, "fallback").catch(() => undefined);
    fallbackTimer = setTimeout(run, intervalMs);
  };
  fallbackTimer = setTimeout(run, intervalMs);
}

function stopFallbackPolling() {
  if (fallbackTimer) clearTimeout(fallbackTimer);
  if (fallbackPolling) log("FALLBACK_POLL_STOPPED");
  fallbackTimer = null;
  fallbackPolling = false;
}

function startHeartbeat(config, token, onStatusChange) {
  stopHeartbeat();
  const beat = async () => {
    try {
      const payload = {
        sseStatus: runtimeStatus.sseStatus,
        lastSuccessfulPrintAt,
        appVersion: require("../package.json").version,
      };
      if (runtimeStatus.lastEventAt) payload.lastEventAt = runtimeStatus.lastEventAt;
      if (runtimeStatus.lastFallbackPollAt) payload.lastFallbackPollAt = runtimeStatus.lastFallbackPollAt;
      const response = await fetch(`${config.erpUrl}/api/printing/device/heartbeat`, {
        method: "POST",
        headers: authHeaders(config, token),
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Heartbeat rejected");
    } catch {
      updateStatus(onStatusChange, { connected: false, message: "Disconnected" });
    }
  };
  beat();
  heartbeatTimer = setInterval(beat, HEARTBEAT_INTERVAL);
}

function stopHeartbeat() {
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  heartbeatTimer = null;
}

async function pollJobs(config, token, onStatusChange, source) {
  if (processing || config.paused) return;
  processing = true;
  const url = `${config.erpUrl}/api/printing/device/jobs`;
  log("QUEUE_FETCHING", { message: "[Queue] Fetching pending jobs", source, url, deviceId: config.deviceId, hasToken: Boolean(token) });
  try {
    const response = await fetch(url, { headers: authHeaders(config, token) });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      log("QUEUE_FETCH_REJECTED", { source, url, status: response.status, body: data, deviceId: config.deviceId, hasToken: Boolean(token) });
      throw new Error(data?.message || data?.code || "Could not fetch jobs.");
    }
    const jobs = data.jobs || [];
    log("QUEUE_RECEIVED", {
      message: `[Queue] Received ${jobs.length} pending ${jobs.length === 1 ? "job" : "jobs"}`,
      source,
      count: jobs.length,
      jobIds: jobs.map((job) => job.id),
    });
    for (const job of jobs) await handlePrintJob(job, config, token, onStatusChange);
  } finally {
    processing = false;
  }
}

async function syncPrinters(config, token, printers) {
  if (!config.deviceId || !token) return;
  await fetch(`${config.erpUrl}/api/printing/device/printers`, { method: "POST", headers: authHeaders(config, token), body: JSON.stringify({ printers }) });
}

async function handlePrintJob(job, config, token, onStatusChange) {
  if (!["PENDING", "SENT", "FAILED"].includes(job.status)) return;
  const queued = upsertReceived(job);
  if (queued.duplicate) return;

  if (job.jobType === "OPEN_CASH_DRAWER") {
    return handleCashDrawerCommand(job, config, token, onStatusChange);
  }

  const jobAction = normalizeJobAction(config.defaultJobAction);
  if (jobAction === "MANUAL") {
    markJob(job.id, { status: "WAITING_FOR_MANUAL_ACTION", errorCode: "", errorMessage: "" });
    updateStatus(onStatusChange, { lastJobMessage: "Print job is waiting for manual processing." });
    return;
  }

  if (jobAction === "REJECT") {
    markJob(job.id, {
      status: "REJECTED",
      completedAt: new Date().toISOString(),
      outputAction: "REJECT",
      errorCode: "JOB_REJECTED_BY_AGENT",
      errorMessage: "The Print Agent is configured to reject incoming jobs.",
    });
    updateStatus(onStatusChange, { lastJobMessage: "Print job rejected by agent configuration." });
    await failJob(config, token, job.id, "JOB_REJECTED_BY_AGENT", "The Print Agent is configured to reject incoming jobs.");
    return;
  }

  await executeJobAction(job, jobAction, config, token, onStatusChange, queued.job);
}

async function executeJobAction(job, action, config, token, onStatusChange, localJob = null) {
  const outputAction = normalizeManualAction(action);
  const printerName = job.printerConfiguration?.localPrinterName;
  try {
    log("PRINT_PROCESSING_JOB", { message: `[Print] Processing job: ${job.id}`, jobId: job.id, action: outputAction });
    markJob(job.id, {
      status: "PROCESSING",
      attempts: (localJob?.attempts || 0) + 1,
      lastAttemptAt: new Date().toISOString(),
      outputAction,
      errorCode: "",
      errorMessage: "",
    });
    await fetch(`${config.erpUrl}/api/printing/device/jobs/${job.id}/processing`, { method: "POST", headers: authHeaders(config, token) });

    await validateActionSettings(job, outputAction, config);

    const invoiceNumber = job.invoice?.officialNumber || job.invoice?.number || job.invoiceId || job.id;
    let outputPath = "";
    if (outputAction === "SAVE_PDF" || outputAction === "PRINT_AND_SAVE") {
      const output = await saveHtmlAsPdf({ jobId: job.id, html: job.content, paperWidth: job.paperWidth, outputFolder: config.outputFolder, invoiceNumber });
      outputPath = output.filePath || "";
    }

    if (actionIncludesPrint(outputAction) && job.openCashDrawer) {
      try {
        await openCashDrawer({
          printerName,
          cashDrawerEnabled: job.printerConfiguration?.openCashDrawer || false,
          cashDrawerPin: job.printerConfiguration?.cashDrawerPin || 0,
          cashDrawerPulseOn: job.printerConfiguration?.cashDrawerPulseOn || 25,
          cashDrawerPulseOff: job.printerConfiguration?.cashDrawerPulseOff || 250,
          mockMode: config.mockMode,
        });
        markJob(job.id, { cashDrawerOpened: true });
      } catch (drawerError) {
        if (config.continuePrintingIfDrawerFails) markJob(job.id, { drawerErrorCode: drawerError.code || "DRAWER_COMMAND_FAILED" });
        else throw drawerError;
      }
    }

    if (outputAction === "PRINT" || outputAction === "PRINT_AND_SAVE") {
      await printHtml({ jobId: job.id, html: job.content, printerName, paperWidth: job.paperWidth, copies: job.copies, mockMode: config.mockMode });
    }

    lastSuccessfulPrintAt = new Date().toISOString();
    const status = statusForAction(outputAction);
    markJob(job.id, {
      status,
      completedAt: lastSuccessfulPrintAt,
      outputAction,
      outputPath,
      printerName: actionIncludesPrint(outputAction) ? printerName : "",
      errorCode: "",
      errorMessage: "",
    });
    const completeBody = {};
    const drawerError = readQueue().jobs.find((j) => j.id === job.id)?.drawerErrorCode;
    if (drawerError) {
      completeBody.drawerErrorCode = drawerError;
      completeBody.drawerErrorMessage = "Cash drawer failed but invoice printed.";
    }
    await fetch(`${config.erpUrl}/api/printing/device/jobs/${job.id}/complete`, { method: "POST", headers: authHeaders(config, token), body: completeBody.drawerErrorCode ? JSON.stringify(completeBody) : undefined });
    log("PRINT_COMPLETED_JOB", { message: `[Print] Completed job: ${job.id}`, jobId: job.id, status, outputPath });
    updateStatus(onStatusChange, {
      lastJobMessage: successMessageForAction(outputAction, outputPath),
    });
    onStatusChange?.(getRuntimeStatus());
    return { success: true, status, outputPath, printerName: actionIncludesPrint(outputAction) ? printerName : "" };
  } catch (error) {
    const code = error.code || "UNKNOWN_ERROR";
    markJob(job.id, { status: "FAILED", errorCode: code, errorMessage: error.message });
    updateStatus(onStatusChange, { lastJobMessage: error.message || "Print job failed." });
    await failJob(config, token, job.id, code, error.message);
    return { success: false, status: "FAILED", errorCode: code, errorMessage: error.message };
  }
}

async function processQueuedJob(jobId, action, config, token, onStatusChange) {
  const queue = readQueue();
  const localJob = queue.jobs.find((item) => item.id === jobId);
  if (!localJob) throw codeError("JOB_NOT_FOUND", "Queued job was not found.");
  const normalizedAction = normalizeQueuedAction(action, localJob, config);
  const job = localJob.payload;
  if (!job) throw codeError("INVALID_JOB_PAYLOAD", "Queued job payload is missing.");
  return executeJobAction(job, normalizedAction, config, token, onStatusChange, localJob);
}

async function rejectQueuedJob(jobId, config, token, onStatusChange) {
  const queue = readQueue();
  const localJob = queue.jobs.find((item) => item.id === jobId);
  if (!localJob) throw codeError("JOB_NOT_FOUND", "Queued job was not found.");
  markJob(jobId, {
    status: "REJECTED",
    completedAt: new Date().toISOString(),
    outputAction: "REJECT",
    errorCode: "JOB_REJECTED_BY_AGENT",
    errorMessage: "The Print Agent is configured to reject incoming jobs.",
  });
  await failJob(config, token, jobId, "JOB_REJECTED_BY_AGENT", "The Print Agent is configured to reject incoming jobs.");
  updateStatus(onStatusChange, { lastJobMessage: "Queued print job rejected." });
  return { success: true, status: "REJECTED" };
}

async function handleCashDrawerCommand(job, config, token) {
  const queued = upsertReceived(job);
  if (queued.duplicate) return;
  const printerName = job.printerConfiguration?.localPrinterName;
  try {
    markJob(job.id, { status: "PROCESSING", attempts: (queued.job.attempts || 0) + 1, lastAttemptAt: new Date().toISOString() });
    await fetch(`${config.erpUrl}/api/printing/device/jobs/${job.id}/processing`, { method: "POST", headers: authHeaders(config, token) });
    await openCashDrawer({
      printerName,
      cashDrawerEnabled: job.printerConfiguration?.openCashDrawer || false,
      cashDrawerPin: job.printerConfiguration?.cashDrawerPin || 0,
      cashDrawerPulseOn: job.printerConfiguration?.cashDrawerPulseOn || 25,
      cashDrawerPulseOff: job.printerConfiguration?.cashDrawerPulseOff || 250,
      mockMode: config.mockMode,
    });
    markJob(job.id, { status: "PRINTED", completedAt: new Date().toISOString(), cashDrawerOpened: true });
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
  if (eventAbort) eventAbort.abort();
  eventAbort = null;
  if (reconnectTimer) clearTimeout(reconnectTimer);
  reconnectTimer = null;
  stopFallbackPolling();
  stopHeartbeat();
}

function updateStatus(onStatusChange, patch) {
  runtimeStatus = { ...runtimeStatus, ...patch };
  onStatusChange?.(getRuntimeStatus());
}

function getRuntimeStatus() {
  return { ...runtimeStatus, fallbackPolling, lastSuccessfulPrintAt };
}

function normalizeJobAction(action) {
  return JOB_ACTIONS.includes(action) ? action : "SAVE_PDF";
}

function normalizeManualAction(action) {
  if (MANUAL_ACTIONS.includes(action)) return action;
  throw codeError("INVALID_JOB_ACTION", `Unsupported job action: ${action}`);
}

function normalizeQueuedAction(action, localJob, config) {
  const manualAction = normalizeManualAction(action);
  if (manualAction !== "RETRY") return manualAction;
  if (["PRINT", "SAVE_PDF", "PRINT_AND_SAVE"].includes(localJob.outputAction)) return localJob.outputAction;
  const configuredAction = normalizeJobAction(config.defaultJobAction);
  if (["PRINT", "SAVE_PDF", "PRINT_AND_SAVE"].includes(configuredAction)) return configuredAction;
  return "SAVE_PDF";
}

async function validateActionSettings(job, action, config) {
  if (actionIncludesPrint(action) && !job.printerConfiguration?.localPrinterName) {
    throw codeError("PRINTER_NOT_CONFIGURED", "No local printer is configured for this job.");
  }
  if (actionIncludesPrint(action) && !config.mockMode) {
    const printerName = job.printerConfiguration.localPrinterName;
    const printers = await getPrinters();
    if (!printers.some((printer) => printer.name === printerName)) {
      throw codeError("PRINTER_NOT_CONFIGURED", `Printer ${printerName} was not found on this PC.`);
    }
  }
  if (actionIncludesPdf(action) && !config.outputFolder) {
    throw codeError("PDF_OUTPUT_FOLDER_REQUIRED", "Choose an output folder before saving print jobs as PDF.");
  }
}

function actionIncludesPrint(action) {
  return action === "PRINT" || action === "PRINT_AND_SAVE";
}

function actionIncludesPdf(action) {
  return action === "SAVE_PDF" || action === "PRINT_AND_SAVE";
}

function statusForAction(action) {
  if (action === "SAVE_PDF") return "PDF_SAVED";
  if (action === "PRINT_AND_SAVE") return "PRINTED_AND_SAVED";
  return "PRINTED";
}

function successMessageForAction(action, outputPath) {
  if (action === "SAVE_PDF") return `Saved PDF: ${outputPath}`;
  if (action === "PRINT_AND_SAVE") return `Printed and saved PDF: ${outputPath}`;
  return "Print job completed.";
}

function fallbackPollIntervalMs(config) {
  return Math.max(Number(config.fallbackPollIntervalMs || FALLBACK_POLL_INTERVAL), FALLBACK_POLL_INTERVAL);
}

function codeError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function log(event, data = {}) {
  console.log(JSON.stringify({ event, timestamp: new Date().toISOString(), ...data }));
}

module.exports = { connectToServer, disconnectFromServer, pairDevice, syncPrinters, getRuntimeStatus, processQueuedJob, rejectQueuedJob, executeJobAction, normalizeJobAction };
