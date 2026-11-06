import { app, BrowserWindow, dialog, ipcMain, safeStorage, shell } from "electron";
import { spawn, type ChildProcess } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { pathToFileURL } from "node:url";
import { PosDatabase } from "./database";
import type { AuthorizedCheckoutInput, BootstrapSnapshot, CheckoutInput } from "./shared";
import { offlineSaleSchema } from "@restaurant/shared-validation";

// The Windows installer smoke test uses a temporary user-data directory. Normal
// installations do not set this environment variable and keep Electron's default.
if (app.isPackaged && process.env.RESTAURANT_POS_TEST_USER_DATA) {
  app.setPath("userData", process.env.RESTAURANT_POS_TEST_USER_DATA);
}

let database: PosDatabase;
let windowRef: BrowserWindow | undefined;
let onlineAdminWindow: BrowserWindow | null = null;
let localDeviceId = "";
let activeCashier: { id:string;name:string;expiresAt:number;policyToken:string;canDiscount:boolean;maxDiscountPercent:number;maxDiscountMinor:number;supervisor:boolean } | null = null;
let activeAdminSession: {id:string;name:string;expiresAt:number}|null=null;
let syncRunning = false;
let printAgentProcess: ChildProcess | null = null;
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

function requireAdminSession() {
  if (!activeAdminSession || activeAdminSession.expiresAt <= Date.now()) {
    activeAdminSession = null;
    throw new Error("Admin session expired. Sign in again.");
  }
  activeAdminSession.expiresAt = Date.now() + 5 * 60_000;
  return activeAdminSession;
}

function validateCheckout(value: unknown): CheckoutInput {
  if (!value || typeof value !== "object") throw new Error("Invalid checkout request.");
  const raw = value as CheckoutInput & Record<string,unknown>;
  if ("cashierPolicyToken" in raw || "supervisorId" in raw || "supervisorPolicyToken" in raw) throw new Error("Authorization fields are controlled by the POS service.");
  const input = raw;
  if (typeof input.idempotencyKey !== "string" || input.idempotencyKey.length < 16 || input.idempotencyKey.length > 100) throw new Error("Invalid idempotency key.");
  if (!Array.isArray(input.items) || input.items.length > 200 || !Array.isArray(input.payments) || input.payments.length > 10) throw new Error("Invalid checkout lines or payments.");
  if(input.orderType!==undefined&&!['DINE_IN','TAKEAWAY','PICKUP','DELIVERY'].includes(input.orderType))throw new Error("Invalid order type.");
  for(const value of [input.customerName,input.customerPhone,input.customerAddress,input.customerNotes])if(value!==undefined&&typeof value!=="string")throw new Error("Invalid customer or order details.");
  if((input.customerName?.length??0)>120||(input.customerPhone?.length??0)>40||(input.customerAddress?.length??0)>300||(input.customerNotes?.length??0)>1000)throw new Error("Customer or order details are too long.");
  if (!/^[A-Z]{3}$/.test(input.currencyCode)) throw new Error("Invalid currency.");
  if (!Number.isSafeInteger(input.discountMinor ?? 0) || (input.discountMinor ?? 0) < 0) throw new Error("Invalid discount amount.");
  if ((input.discountMinor ?? 0) > 0 && !input.couponCode && (!input.discountReason?.trim() || input.discountReason.trim().length > 250)) throw new Error("Enter a reason for this discount.");
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

function startBundledPrintAgent() {
  if (!app.isPackaged || printAgentProcess) return;
  const agentEntry = join(process.resourcesPath, "print-agent", "cli.js");
  const appData = process.env.APPDATA || join(app.getPath("appData"));
  const agentConfig = join(appData, "restaurant-erp-print-agent", "config.json");

  // The print agent has its own legacy enrollment flow. Start it only when
  // that configuration already exists and contains pairing credentials.
  try {
    if (!existsSync(agentEntry) || !existsSync(agentConfig)) return;
    const config = JSON.parse(readFileSync(agentConfig, "utf8")) as { deviceId?: unknown; token?: unknown };
    if (typeof config.deviceId !== "string" || typeof config.token !== "string" || !config.token) return;
  } catch {
    return;
  }

  printAgentProcess = spawn(process.execPath, [agentEntry, "run"], {
    windowsHide: true,
    stdio: "ignore",
    env: { ...process.env, ELECTRON_RUN_AS_NODE: "1" },
  });
  printAgentProcess.once("error", (error) => {
    console.error("Could not start the bundled print agent:", error);
    printAgentProcess = null;
  });
  printAgentProcess.once("exit", () => { printAgentProcess = null; });
}

function stopBundledPrintAgent() {
  if (!printAgentProcess) return;
  printAgentProcess.kill();
  printAgentProcess = null;
}

function getConfiguredPrinter() {
  return database.getMetadata("receipt_printer_name");
}

function getLocationName(key:"branch"|"register") {
  try { const value=JSON.parse(database.getMetadata(key)??"null") as {name?:unknown}|null; return typeof value?.name==="string"?value.name:null; }
  catch { return null; }
}

function printHtml(html: string, deviceName: string | null): Promise<void> {
  return new Promise((resolve, reject) => {
    const printWindow = new BrowserWindow({ show: false, webPreferences: { sandbox: true, contextIsolation: true } });
    printWindow.webContents.once("did-finish-load", () => {
      printWindow.webContents.print({ silent: Boolean(deviceName), ...(deviceName ? { deviceName } : {}), printBackground: true }, (success, failureReason) => {
        printWindow.close();
        if (success) resolve(); else reject(new Error(failureReason || "Windows could not print the page."));
      });
    });
    void printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`).catch((error) => {
      printWindow.close();
      reject(error);
    });
  });
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
  if (!response.ok) {
    const body=await response.text().catch(()=>"");
    let detail="";
    try { const parsed=JSON.parse(body) as {error?:unknown;message?:unknown}; detail=typeof parsed.error==="string"?parsed.error:typeof parsed.message==="string"?parsed.message:""; } catch { detail=body.replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim().slice(0,240); }
    throw new Error(`Catalog refresh failed (${response.status})${detail?`: ${detail}`:"."}`);
  }
  const snapshot = await response.json() as BootstrapSnapshot;
  database.applyBootstrap(snapshot);
  const localCatalogHash=database.getCatalogHash();
  const cloudCatalogHash=snapshot.catalogHash ?? localCatalogHash;
  database.setMetadata("cloud_catalog_hash", cloudCatalogHash);
  database.setMetadata("catalog_matches_cloud", String(localCatalogHash===cloudCatalogHash));
  database.setMetadata("catalog_verified_at", snapshot.serverTime);
  database.setMetadata("last_cloud_sync", new Date().toISOString());
}

async function runSyncCycle(forceBootstrap = false) {
  if (syncRunning) return;
  let config: ReturnType<typeof getCloudConfig>;
  try { config = getCloudConfig(); }
  catch (error) { database.setMetadata("last_sync_error", error instanceof Error ? error.message : "Secure device credential is unavailable."); return; }
  if (!config) return;
  syncRunning = true;
  try {
    let accessToken = await getAccessToken(config.baseUrl, config.refreshSecret);
    const lastCatalogSync = database.getMetadata("last_catalog_sync");
    const catalogOutOfDate = !lastCatalogSync || Date.now() - Date.parse(lastCatalogSync) > 5 * 60_000;
    if (forceBootstrap || catalogOutOfDate || database.getMetadata("catalog_matches_cloud") === "false") {
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
      const validOrders: unknown[] = [];
      const validRows = new Set<string>();
      for (const row of batch) {
        const parsed = offlineSaleSchema.safeParse(row.payload);
        if (parsed.success) { validOrders.push(parsed.data); validRows.add(row.id); }
        else database.markSyncFailure(row.id, "Saved sale does not match the shared sync contract.", true, row.attempts);
      }
      if (!validOrders.length) return;
      let response: Response;
      try {
        response = await fetch(new URL("/api/v1/sync/push", config.baseUrl), {
          method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify({ orders: validOrders }), signal: AbortSignal.timeout(25_000),
        });
      } catch (error) {
        for (const row of batch) database.markSyncFailure(row.id, error instanceof Error ? error.message : "Network request failed.", false, row.attempts);
        throw error;
      }
      if (!response.ok) {
        const responseBody=await response.text().catch(()=>"");
        let detail="";
        try { const parsed=JSON.parse(responseBody) as {error?:unknown;message?:unknown}; detail=typeof parsed.error==="string"?parsed.error:typeof parsed.message==="string"?parsed.message:""; } catch { detail=responseBody.replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim().slice(0,240); }
        const text = `Cloud sync returned ${response.status}${detail?`: ${detail}`:"."}`;
        const permanent = response.status >= 400 && response.status < 500 && ![401,408,429].includes(response.status);
        for (const row of batch) database.markSyncFailure(row.id, text, permanent, row.attempts);
        if (response.status === 401) cachedAccessToken = null;
        throw new Error(text);
      }
      const data = await response.json() as { acknowledgements?: { clientTransactionId:string;invoiceId?:string;officialNumber?:string;error?:string;permanent?:boolean }[] };
      const acknowledgements = new Map((data.acknowledgements ?? []).map((ack) => [ack.clientTransactionId, ack]));
      for (const row of batch) {
        if (!validRows.has(row.id)) continue;
        const ack = acknowledgements.get(row.entityId);
        if (ack?.invoiceId && ack.officialNumber) database.markSyncSucceeded(row.id, ack.invoiceId, ack.officialNumber);
        else database.markSyncFailure(row.id, ack?.error ?? "The server did not acknowledge this sale.", ack?.permanent ?? false, row.attempts);
      }
    }
    const failedSale=database.listSyncIssues().find((issue)=>issue.status==="failed");
    database.setMetadata("last_sync_error", failedSale?.errorMessage ?? "");
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
    ...(process.platform === "win32" ? { icon: join(app.getAppPath(), "assets", "brand-icon.ico") } : {}),
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
  ipcMain.handle("admin:verify", async (event, username:unknown, pin:unknown) => {
    assertTrustedSender(event);
    if(typeof username!=="string"||typeof pin!=="string")throw new Error("Enter the supervisor username and PIN.");
    const state=database.getOfflineAdminCredentialState(username);
    if(state==="missing")throw new Error("This admin account is not stored on this POS yet. In Online ERP → POS Devices, assign the admin to this terminal and set an offline PIN, then sync admin access here.");
    if(state==="inactive")throw new Error("This admin account is inactive. Activate it in Online ERP, then sync this terminal.");
    if(state==="not-admin")throw new Error("This account is not an Admin or supervisor account. Use an Admin account with an offline PIN.");
    if(state==="expired")throw new Error("The offline PIN has expired. Renew its offline validity in Online ERP → POS Devices, then sync this terminal.");
    if(state==="locked")throw new Error("This account is temporarily locked after several incorrect PIN attempts. Wait five minutes before trying again.");
    const supervisor=await database.authenticate(username,pin,true);
    if(!supervisor)throw new Error("The PIN does not match the offline PIN saved on this device. If you changed it in Online ERP, sync admin access before trying again.");
    activeAdminSession={id:supervisor.id,name:supervisor.name,expiresAt:Date.now()+5*60_000};
    return {name:supervisor.name,expiresAt:activeAdminSession.expiresAt};
  });
  ipcMain.handle("admin:credential-state", (event, username:unknown) => {
    assertTrustedSender(event);
    if(typeof username!=="string"||username.length>254)throw new Error("Enter a valid admin username.");
    return database.getOfflineAdminCredentialState(username);
  });
  ipcMain.handle("admin:logout", (event) => { assertTrustedSender(event); activeAdminSession=null; return true; });
  ipcMain.handle("admin:recent-orders", (event) => { assertTrustedSender(event); if(!activeAdminSession||activeAdminSession.expiresAt<=Date.now()){activeAdminSession=null;throw new Error("Supervisor access expired. Sign in again.");} activeAdminSession.expiresAt=Date.now()+5*60_000; return database.listRecentOrders(); });
  ipcMain.handle("admin:open-online", (event) => {
    assertTrustedSender(event);
    const config=getCloudConfig();
    if(!config)throw new Error("Connect this POS to the Online ERP first.");
    if(onlineAdminWindow&&!onlineAdminWindow.isDestroyed()){onlineAdminWindow.focus();return true;}
    const origin=new URL(config.baseUrl).origin;
    onlineAdminWindow=new BrowserWindow({width:1440,height:940,minWidth:1000,minHeight:700,parent:windowRef,webPreferences:{contextIsolation:true,nodeIntegration:false,sandbox:true,partition:"persist:online-admin"}});
    onlineAdminWindow.webContents.setWindowOpenHandler(()=>({action:"deny"}));
    const allowErpNavigation=(navigation:Electron.Event,url:string)=>{try{if(new URL(url).origin!==origin)navigation.preventDefault();}catch{navigation.preventDefault();}};
    onlineAdminWindow.webContents.on("will-navigate",allowErpNavigation);
    onlineAdminWindow.webContents.on("will-redirect",allowErpNavigation);
    onlineAdminWindow.webContents.session.setPermissionRequestHandler((_contents,_permission,callback)=>callback(false));
    onlineAdminWindow.once("closed",()=>{onlineAdminWindow=null;});
    void onlineAdminWindow.loadURL(new URL("/admin",config.baseUrl).toString());
    return true;
  });
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
  ipcMain.handle("sync:trigger", async (event) => {
    assertTrustedSender(event);
    if(syncRunning)throw new Error("Synchronization is already running. Wait a moment, then sync admin access again.");
    // A manual sync is also the explicit way to provision newly assigned offline
    // accounts and PIN verifiers. Do not let the five-minute catalog throttle
    // make a successful sync appear to refresh accounts when it did not.
    database.retryFailedSync();
    await runSyncCycle(true);
    const syncError=database.getMetadata("last_sync_error");
    if(syncError)throw new Error(syncError);
    return true;
  });
  ipcMain.handle("cash:open", (event, amount:unknown) => { assertTrustedSender(event); const cashier=requireCashier(); if(typeof amount!=="number")throw new Error("Enter a valid opening cash amount."); return database.openCashSession(cashier.id,Math.round(amount*100)); });
  ipcMain.handle("cash:close", (event, amount:unknown) => { assertTrustedSender(event); const cashier=requireCashier(); if(typeof amount!=="number")throw new Error("Enter a valid counted cash amount."); return database.closeCashSession(cashier.id,Math.round(amount*100)); });
  ipcMain.handle("device:set-server", async (event, rawUrl: unknown) => {
    assertTrustedSender(event);
    requireAdminSession();
    const config = getCloudConfig();
    if (!config) throw new Error("This terminal is not paired. Pair it from the admin system first.");
    const baseUrl = validateCloudUrl(rawUrl);
    if (syncRunning) throw new Error("Synchronization is running. Try changing the server address again in a moment.");
    try {
      const accessToken = await getAccessToken(baseUrl, config.refreshSecret, true);
      await cloudGetBootstrap(baseUrl, accessToken);
      database.setMetadata("cloud_url", baseUrl);
      database.setMetadata("last_sync_error", "");
      cachedAccessToken = { token: accessToken, expiresAt: Date.now() + 14 * 60_000 };
      await runSyncCycle(true);
      return { connected: !database.getMetadata("last_sync_error"), serverUrl: baseUrl };
    } catch (error) {
      cachedAccessToken = null;
      throw error;
    }
  });
  ipcMain.handle("app:diagnostics", async (event) => {
    assertTrustedSender(event);
    const checks: { id:string;status:"ok"|"warning"|"error";detail:string;action:"pair"|"connection"|"catalog"|"sync"|"printer"|null;issues?:ReturnType<PosDatabase["listSyncIssues"]> }[] = [];
    checks.push({ id:"database", status:"ok", detail:"Local SQLite database is open. Offline checkout is available.", action:null });
    let config: ReturnType<typeof getCloudConfig> = null;
    try { config = getCloudConfig(); } catch (error) { checks.push({ id:"credentials",status:"error",detail:error instanceof Error?error.message:"Could not read secure device credentials.",action:"pair" }); }
    if (!config) checks.push({ id:"pairing", status:"error", detail:"This device is not paired with a cloud server.", action:"pair" });
    else {
      try { await getAccessToken(config.baseUrl, config.refreshSecret, true); checks.push({ id:"connection",status:"ok",detail:`Cloud connection is working (${config.baseUrl}).`,action:null }); }
      catch (error) { checks.push({ id:"connection",status:"error",detail:error instanceof Error?error.message:"Unable to connect. Check the server address and Internet connection.",action:"connection" }); }
    }
    const catalogCount = database.listProducts().length;
    checks.push({ id:"catalog", status:catalogCount?"ok":"warning", detail:catalogCount?`${catalogCount} products are available locally.`:"Local catalog is empty. Connect to the server and download products.", action:catalogCount?null:(config?"catalog":"pair") });
    const cashierCount=database.getCashierCount();
    checks.push({ id:"cashiers",status:cashierCount?"ok":"warning",detail:cashierCount?`${cashierCount} offline cashier account(s) are ready.`:"No offline cashier accounts are available on this device.",action:config?"sync":"pair" });
    const pendingCount=database.getPendingCount();
    const syncError=database.getMetadata("last_sync_error");
    const syncIssues=database.listSyncIssues();
    checks.push({ id:"sync",status:syncError?"warning":"ok",detail:syncError?`${pendingCount} sale(s) waiting. Last sync error: ${syncError}`:`${pendingCount} sale(s) waiting to sync.`,action:pendingCount||syncError?"sync":null,issues:syncIssues });
    try {
      const printers=await (windowRef?.webContents.getPrintersAsync() ?? Promise.resolve([]));
      const selected=getConfiguredPrinter();
      const selectedAvailable=Boolean(selected&&printers.some((printer)=>printer.name===selected));
      checks.push({ id:"printer",status:selectedAvailable?"ok":"warning",detail:selectedAvailable?`Receipt printer is ready: ${selected}.`:selected?`Saved printer “${selected}” is unavailable. Choose a new printer or use the Windows dialog.`:printers.length?"No default printer is selected. You can choose one or ask Windows each time.":"No Windows printer is installed. Add one in Windows Settings; the cashier still works and can save invoices as PDF.",action:"printer" });
    } catch (error) { checks.push({ id:"printer",status:"warning",detail:error instanceof Error?error.message:"Could not read Windows printer list.",action:"printer" }); }
    return checks;
  });
  ipcMain.handle("catalog:refresh", async (event) => { assertTrustedSender(event); const config=getCloudConfig(); if(!config)throw new Error("Pair this terminal before refreshing the cloud catalog."); const accessToken=await getAccessToken(config.baseUrl,config.refreshSecret); await cloudGetBootstrap(config.baseUrl,accessToken); return {catalogCount:database.listProducts().length}; });
  ipcMain.handle("printer:list", async (event) => { assertTrustedSender(event); return (await windowRef?.webContents.getPrintersAsync() ?? []).map((printer) => ({name:printer.name,displayName:printer.displayName,description:printer.description})); });
  ipcMain.handle("printer:select", async (event, raw: unknown) => {
    assertTrustedSender(event);
    if (raw !== null && typeof raw !== "string") throw new Error("Choose a printer from the Windows printer list.");
    if (typeof raw === "string" && !(await windowRef?.webContents.getPrintersAsync() ?? []).some((printer) => printer.name === raw)) throw new Error("That printer is no longer available. Refresh the list.");
    if (raw) database.setMetadata("receipt_printer_name", raw); else database.setMetadata("receipt_printer_name", "");
    return {selectedPrinter:raw};
  });
  ipcMain.handle("printer:windows-settings", async (event) => { assertTrustedSender(event); await shell.openExternal("ms-settings:printers"); return true; });
  ipcMain.handle("printer:test", async (event) => {
    assertTrustedSender(event);
    const selected = getConfiguredPrinter();
    const printer = selected && (await windowRef?.webContents.getPrintersAsync() ?? []).some((item) => item.name === selected) ? selected : null;
    await printHtml("<!doctype html><meta charset='utf-8'><style>body{font:16px Arial,sans-serif;width:260px;margin:12px}h1{text-align:center;font-size:22px}p{text-align:center;margin:10px}</style><h1>Printer setup test</h1><p>Sheikh Al Kar POS</p><p>إذا ظهرت هذه الورقة، فالطابعة جاهزة</p><hr><p>Test completed</p>", printer);
    return {printedTo:printer};
  });
  ipcMain.handle("printer:receipt", async (event) => {
    assertTrustedSender(event);
    const selected = getConfiguredPrinter();
    const printer = selected && (await windowRef?.webContents.getPrintersAsync() ?? []).some((item) => item.name === selected) ? selected : null;
    if (!windowRef) throw new Error("POS window is not available.");
    await new Promise<void>((resolve,reject) => windowRef!.webContents.print({silent:Boolean(printer),...(printer?{deviceName:printer}:{}),printBackground:true},(success,reason)=>success?resolve():reject(new Error(reason||"Windows could not print the receipt."))));
    return true;
  });
  ipcMain.handle("invoice:save-pdf", async (event, rawReceiptNumber: unknown) => {
    assertTrustedSender(event);
    if (!windowRef) throw new Error("POS window is not available.");
    const receiptNumber = typeof rawReceiptNumber === "string" ? rawReceiptNumber.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 60) : "receipt";
    const defaultPath = join(app.getPath("documents"), `${receiptNumber || "receipt"}.pdf`);
    const choice = await dialog.showSaveDialog(windowRef, { title: "Save invoice as PDF", defaultPath, filters: [{ name: "PDF", extensions: ["pdf"] }] });
    if (choice.canceled || !choice.filePath) return { saved: false, filePath: null };
    const pdf = await windowRef.webContents.printToPDF({ pageSize: "A4", printBackground: true, margins: { top: 0.4, bottom: 0.4, left: 0.4, right: 0.4 } });
    writeFileSync(choice.filePath, pdf);
    return { saved: true, filePath: choice.filePath };
  });
  ipcMain.handle("catalog:list", (event, search: string) => { assertTrustedSender(event); requireCashier(); return database.listProducts(String(search).slice(0, 120)); });
  ipcMain.handle("app:local-status", (event) => { assertTrustedSender(event); let deviceEnrolled = false; try { deviceEnrolled = Boolean(getCloudConfig()); } catch { deviceEnrolled = false; } const cloudCatalogHash=database.getMetadata("cloud_catalog_hash"); const localCatalogHash=database.getCatalogHash(); const matchValue=database.getMetadata("catalog_matches_cloud"); const openCashSession=activeCashier?database.getOpenCashSession(activeCashier.id):null; return ({ databaseReady: true, catalogCount: database.listProducts().length, cloudUrl:database.getMetadata("cloud_url"),deviceId:database.getMetadata("device_id"),branchName:getLocationName("branch"),registerName:getLocationName("register"),openCashSession,
    cashierName: activeCashier?.expiresAt && activeCashier.expiresAt > Date.now() ? activeCashier.name : null,
    pendingCount: database.getPendingCount(), cashierCount: database.getCashierCount(), deviceEnrolled, selectedPrinterName:database.getMetadata("receipt_printer_name")||null,
      lastSyncAt: database.getMetadata("last_cloud_sync"), lastSyncError: database.getMetadata("last_sync_error"), catalogHash:localCatalogHash,cloudCatalogHash,catalogMatchesCloud:matchValue===null?null:localCatalogHash===cloudCatalogHash&&matchValue==="true",catalogSyncedAt:database.getMetadata("catalog_verified_at"),coupons:database.listCoupons() }); });
  ipcMain.handle("sales:checkout", async (event, raw: unknown) => {
    assertTrustedSender(event);
    const cashier = requireCashier();
    const input = validateCheckout(raw);
    const sale = { ...input };
    delete sale.supervisorAuthorization;
      const authorized: AuthorizedCheckoutInput = { ...sale, deviceId: localDeviceId, cashierPolicyToken: cashier.policyToken };
    return database.checkout(authorized, cashier.id);
  });
  createWindow();
  startBundledPrintAgent();
  database.recoverInterruptedSync();
  setInterval(() => { void runSyncCycle(); }, 20_000);
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
app.on("before-quit", () => {
  stopBundledPrintAgent();
  database?.close();
});
