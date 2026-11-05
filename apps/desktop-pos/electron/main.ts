import { app, BrowserWindow, ipcMain, safeStorage } from "electron";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { pathToFileURL } from "node:url";
import { PosDatabase } from "./database";
import type { AuthorizedCheckoutInput, BootstrapSnapshot, CheckoutInput } from "./shared";

let database: PosDatabase;
let windowRef: BrowserWindow | undefined;
let localDeviceId = "";
let activeCashier: { id:string;name:string;expiresAt:number;policyToken:string;canDiscount:boolean;maxDiscountPercent:number;maxDiscountMinor:number;supervisor:boolean } | null = null;
let syncRunning = false;
let cachedAccessToken: { token: string; expiresAt: number } | null = null;
const packagedPage = pathToFileURL(join(app.getAppPath(), "dist", "index.html")).href;
const devServerUrl = process.env.VITE_DEV_SERVER_URL;

function assertTrustedSender(event: Electron.IpcMainInvokeEvent) {
  const senderUrl = event.senderFrame?.url;
  if (devServerUrl ? senderUrl !== `${devServerUrl}/` && senderUrl !== devServerUrl : senderUrl !== packagedPage) {
    throw new Error("Untrusted renderer.");
  }
}

function requireCashier() {
  if (!activeCashier || activeCashier.expiresAt <= Date.now()) {
    activeCashier = null;
    throw new Error("Cashier session expired. Sign in again.");
  }
  activeCashier.expiresAt = Date.now() + 15 * 60_000;
  return activeCashier;
}

function validateCheckout(value: unknown): CheckoutInput {
  if (!value || typeof value !== "object") throw new Error("Invalid checkout request.");
  const raw = value as CheckoutInput & Record<string,unknown>;
  if ("cashierPolicyToken" in raw || "supervisorId" in raw || "supervisorPolicyToken" in raw) throw new Error("Authorization fields are controlled by the POS service.");
  const input = raw;
  if (typeof input.idempotencyKey !== "string" || input.idempotencyKey.length < 16 || input.idempotencyKey.length > 100) throw new Error("Invalid idempotency key.");
  if (!Array.isArray(input.items) || input.items.length > 200 || !Array.isArray(input.payments) || input.payments.length > 10) throw new Error("Invalid checkout lines or payments.");
  if (!/^[A-Z]{3}$/.test(input.currencyCode)) throw new Error("Invalid currency.");
  if (!Number.isSafeInteger(input.discountMinor ?? 0) || (input.discountMinor ?? 0) < 0) throw new Error("Invalid discount amount.");
  if ((input.discountMinor ?? 0) > 0 && (!input.discountReason?.trim() || input.discountReason.trim().length > 250)) throw new Error("Enter a reason for this discount.");
  if ((input.taxMinor ?? 0) !== 0) throw new Error("Tax configuration is not provisioned on this device.");
  if (input.items.some((item) => typeof item.productId !== "string" || !Number.isSafeInteger(item.quantity) || item.quantity < 1)) throw new Error("Invalid product line.");
  if (input.items.some((item) => item.unitPriceMinor !== undefined)) throw new Error("Prices are loaded from the local catalog.");
  if (input.payments.some((payment) => !Number.isSafeInteger(payment.amountMinor) || payment.amountMinor <= 0)) throw new Error("Invalid payment.");
  if (input.payments.some((payment) => payment.method !== "CASH")) throw new Error("Only cash payments are enabled until payment terminals are configured.");
  return input;
}

function getCloudConfig() {
  const baseUrl = database.getMetadata("cloud_url");
  const encrypted = database.getMetadata("refresh_secret_enc");
  if (!baseUrl || !encrypted || !safeStorage.isEncryptionAvailable()) return null;
  return { baseUrl, refreshSecret: safeStorage.decryptString(Buffer.from(encrypted, "hex")) };
}

async function getAccessToken(baseUrl: string, refreshSecret: string, force = false) {
  if (!force && cachedAccessToken && cachedAccessToken.expiresAt > Date.now() + 60_000) return cachedAccessToken.token;
  const response = await fetch(new URL("/api/v1/pos/devices/refresh", baseUrl), {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deviceId: localDeviceId, refreshSecret }), signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`Cloud sign-in failed (${response.status}).`);
  const result = await response.json() as { accessToken: string; expiresInSeconds: number };
  cachedAccessToken = { token: result.accessToken, expiresAt: Date.now() + result.expiresInSeconds * 1000 };
  return result.accessToken;
}

async function cloudGetBootstrap(baseUrl: string, accessToken: string) {
  const response = await fetch(new URL("/api/v1/pos/bootstrap", baseUrl), { headers: { Authorization: `Bearer ${accessToken}` }, signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error(`Catalog refresh failed (${response.status}).`);
  database.applyBootstrap(await response.json() as BootstrapSnapshot);
  database.setMetadata("last_cloud_sync", new Date().toISOString());
}

async function runSyncCycle() {
  if (syncRunning) return;
  let config: ReturnType<typeof getCloudConfig>;
  try { config = getCloudConfig(); }
  catch (error) { database.setMetadata("last_sync_error", error instanceof Error ? error.message : "Secure device credential is unavailable."); return; }
  if (!config) return;
  syncRunning = true;
  try {
    let accessToken = await getAccessToken(config.baseUrl, config.refreshSecret);
    const lastCatalogSync = database.getMetadata("last_catalog_sync");
    if (!lastCatalogSync || Date.now() - Date.parse(lastCatalogSync) > 5 * 60_000) {
      try { await cloudGetBootstrap(config.baseUrl, accessToken); }
      catch (error) {
        if (error instanceof Error && error.message.includes("(401)")) {
          accessToken = await getAccessToken(config.baseUrl, config.refreshSecret, true);
          await cloudGetBootstrap(config.baseUrl, accessToken);
        } else throw error;
      }
    }
    const batch = database.claimSyncBatch(20);
    if (batch.length) {
      let response: Response;
      try {
        response = await fetch(new URL("/api/v1/sync/push", config.baseUrl), {
          method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify({ orders: batch.map((row) => row.payload) }), signal: AbortSignal.timeout(25_000),
        });
      } catch (error) {
        for (const row of batch) database.markSyncFailure(row.id, error instanceof Error ? error.message : "Network request failed.", false, row.attempts);
        throw error;
      }
      if (!response.ok) {
        const text = `Cloud sync returned ${response.status}.`;
        const permanent = response.status >= 400 && response.status < 500 && ![401,408,429].includes(response.status);
        for (const row of batch) database.markSyncFailure(row.id, text, permanent, row.attempts);
        if (response.status === 401) cachedAccessToken = null;
        throw new Error(text);
      }
      const data = await response.json() as { acknowledgements?: { clientTransactionId:string;invoiceId?:string;officialNumber?:string;error?:string;permanent?:boolean }[] };
      const acknowledgements = new Map((data.acknowledgements ?? []).map((ack) => [ack.clientTransactionId, ack]));
      for (const row of batch) {
        const ack = acknowledgements.get(row.entityId);
        if (ack?.invoiceId && ack.officialNumber) database.markSyncSucceeded(row.id, ack.invoiceId, ack.officialNumber);
        else database.markSyncFailure(row.id, ack?.error ?? "The server did not acknowledge this sale.", ack?.permanent ?? false, row.attempts);
      }
    }
    database.setMetadata("last_sync_error", "");
    database.setMetadata("last_cloud_sync", new Date().toISOString());
  } catch (error) {
    database.setMetadata("last_sync_error", error instanceof Error ? error.message : "Synchronization failed.");
  } finally {
    syncRunning = false;
  }
}

function validateCloudUrl(raw: unknown) {
  if (typeof raw !== "string" || raw.length > 240) throw new Error("Enter a valid cloud server address.");
  let parsed: URL;
  try { parsed = new URL(raw); } catch { throw new Error("Enter a valid cloud server address."); }
  const localHost = ["localhost", "127.0.0.1", "::1"].includes(parsed.hostname);
  if (parsed.protocol !== "https:" && !(localHost && parsed.protocol === "http:")) throw new Error("Cloud connections must use HTTPS.");
  return parsed.toString().replace(/\/$/, "");
}

function createWindow() {
  windowRef = new BrowserWindow({
    width: 1440, height: 920, minWidth: 1000, minHeight: 700,
    webPreferences: { preload: join(__dirname, "preload.js"), contextIsolation: true, nodeIntegration: false, sandbox: true },
  });
  windowRef.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  windowRef.webContents.on("will-navigate", (event, url) => {
    if (devServerUrl ? url === devServerUrl || url === `${devServerUrl}/` : url === packagedPage) return;
    event.preventDefault();
  });
  windowRef.webContents.on("devtools-opened", () => { if (app.isPackaged) windowRef?.webContents.closeDevTools(); });
  windowRef.webContents.on("before-input-event", (event, input) => {
    if (app.isPackaged && (input.key === "F12" || (input.control && input.shift && input.key.toLowerCase() === "i"))) event.preventDefault();
  });
  windowRef.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({ responseHeaders: { ...details.responseHeaders, "Content-Security-Policy": ["default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self' https:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'"] } });
  });
  windowRef.webContents.session.setPermissionRequestHandler((_webContents, _permission, callback) => callback(false));
  const devUrl = devServerUrl;
  if (devUrl) void windowRef.loadURL(devUrl);
  else void windowRef.loadFile(join(app.getAppPath(), "dist", "index.html"));
}

app.whenReady().then(() => {
  const dbPath = join(app.getPath("userData"), "restaurant-pos.sqlite");
  const migrationPath = join(app.getAppPath(), "database", "migrations", "001-initial.sql");
  database = new PosDatabase(dbPath, migrationPath);
  const storedDevice = database.getMetadata("device_id");
  localDeviceId = storedDevice ?? randomUUID();
  if (!storedDevice) database.setMetadata("device_id", localDeviceId);
  ipcMain.handle("auth:login", async (event, username: unknown, pin: unknown) => {
    assertTrustedSender(event);
    if (typeof username !== "string" || typeof pin !== "string" || pin.length < 4 || pin.length > 12) throw new Error("Enter a valid cashier name and PIN.");
    const user = await database.authenticate(username, pin);
    if (!user) throw new Error("Invalid or unavailable offline cashier credentials.");
    activeCashier = { ...user, expiresAt: Date.now() + 15 * 60_000 };
    return { name: user.name, expiresAt: activeCashier.expiresAt, canDiscount: user.canDiscount, maxDiscountPercent: user.maxDiscountPercent, maxDiscountMinor: user.maxDiscountMinor, supervisor: user.supervisor };
  });
  ipcMain.handle("auth:logout", (event) => { assertTrustedSender(event); activeCashier = null; return true; });
  ipcMain.handle("device:enroll", async (event, rawUrl: unknown, pairingCode: unknown, deviceName: unknown) => {
    assertTrustedSender(event);
    const baseUrl = validateCloudUrl(rawUrl);
    if (typeof pairingCode !== "string" || pairingCode.length < 8 || typeof deviceName !== "string" || deviceName.trim().length < 2) throw new Error("Enter the pairing code and a device name.");
    if (!safeStorage.isEncryptionAvailable()) throw new Error("Windows secure credential storage is unavailable.");
    const response = await fetch(new URL("/api/v1/pos/devices/register", baseUrl), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pairingCode, deviceName: deviceName.trim(), appVersion: app.getVersion() }), signal: AbortSignal.timeout(15_000) });
    const result = await response.json().catch(() => null) as { deviceId?:string;accessToken?:string;refreshSecret?:string;expiresInSeconds?:number;error?:string }|null;
    if (!response.ok || !result?.deviceId || !result.accessToken || !result.refreshSecret) throw new Error(result?.error ?? `Device enrollment failed (${response.status}).`);
    localDeviceId = result.deviceId;
    database.setMetadata("cloud_url", baseUrl);
    database.setMetadata("refresh_secret_enc", safeStorage.encryptString(result.refreshSecret).toString("hex"));
    database.setMetadata("device_id", localDeviceId);
    cachedAccessToken = { token: result.accessToken, expiresAt: Date.now() + (result.expiresInSeconds ?? 900) * 1000 };
    await cloudGetBootstrap(baseUrl, result.accessToken);
    void runSyncCycle();
    return { enrolled: true, catalogCount: database.listProducts().length, cashierCount: database.getCashierCount() };
  });
  ipcMain.handle("sync:trigger", (event) => { assertTrustedSender(event); void runSyncCycle(); return true; });
  ipcMain.handle("catalog:list", (event, search: string) => { assertTrustedSender(event); requireCashier(); return database.listProducts(String(search).slice(0, 120)); });
  ipcMain.handle("app:local-status", (event) => { assertTrustedSender(event); let deviceEnrolled = false; try { deviceEnrolled = Boolean(getCloudConfig()); } catch { deviceEnrolled = false; } return ({ databaseReady: true, catalogCount: database.listProducts().length,
    cashierName: activeCashier?.expiresAt && activeCashier.expiresAt > Date.now() ? activeCashier.name : null,
    pendingCount: database.getPendingCount(), cashierCount: database.getCashierCount(), deviceEnrolled,
    lastSyncAt: database.getMetadata("last_cloud_sync"), lastSyncError: database.getMetadata("last_sync_error") }); });
  ipcMain.handle("sales:checkout", async (event, raw: unknown) => {
    assertTrustedSender(event);
    const cashier = requireCashier();
    const input = validateCheckout(raw);
    let supervisor: Awaited<ReturnType<PosDatabase["authenticate"]>> = null;
    if (input.supervisorAuthorization) {
      supervisor = await database.authenticate(input.supervisorAuthorization.username, input.supervisorAuthorization.pin, true);
      if (!supervisor) throw new Error("Supervisor PIN is invalid or supervisor credentials are unavailable on this terminal.");
    }
    const sale = { ...input };
    delete sale.supervisorAuthorization;
    const authorized: AuthorizedCheckoutInput = { ...sale, deviceId: localDeviceId, cashierPolicyToken: cashier.policyToken,
      supervisorId: supervisor?.id, supervisorPolicyToken: supervisor?.policyToken };
    return database.checkout(authorized, cashier.id);
  });
  createWindow();
  database.recoverInterruptedSync();
  setInterval(() => { void runSyncCycle(); }, 20_000);
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
app.on("before-quit", () => database?.close());
