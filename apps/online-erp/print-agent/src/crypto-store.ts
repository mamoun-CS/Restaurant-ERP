import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execSync } from "node:child_process";
import type { AgentConfig } from "./types.js";

function getConfigDir(): string {
  if (process.platform === "win32") {
    const appData = process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming");
    return path.join(appData, "restaurant-erp-print-agent");
  }
  return path.join(os.homedir(), ".config", "restaurant-erp-print-agent");
}

const CONFIG_DIR = getConfigDir();
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

export function encryptDpapi(plainText: string): string {
  if (process.platform !== "win32") {
    return Buffer.from(plainText, "utf8").toString("base64");
  }
  try {
    const b64Input = Buffer.from(plainText, "utf8").toString("base64");
    const cmd = `powershell -NoProfile -NonInteractive -Command "$b = [System.Convert]::FromBase64String('${b64Input}'); $e = [System.Security.Cryptography.ProtectedData]::Protect($b, $null, [System.Security.Cryptography.DataProtectionScope]::CurrentUser); [System.Convert]::ToBase64String($e)"`;
    const out = execSync(cmd, { encoding: "utf8", stdio: ["pipe", "pipe", "ignore"], timeout: 4000 }).trim();
    if (out) return `dpapi:${out}`;
  } catch {
    // DPAPI fallback
  }
  return Buffer.from(plainText, "utf8").toString("base64");
}

export function decryptDpapi(cipherText: string): string {
  if (!cipherText) return "";
  if (cipherText.startsWith("dpapi:")) {
    const b64Cipher = cipherText.slice(6);
    try {
      const cmd = `powershell -NoProfile -NonInteractive -Command "$b = [System.Convert]::FromBase64String('${b64Cipher}'); $p = [System.Security.Cryptography.ProtectedData]::Unprotect($b, $null, [System.Security.Cryptography.DataProtectionScope]::CurrentUser); [System.Text.Encoding]::UTF8.GetString($p)"`;
      return execSync(cmd, { encoding: "utf8", stdio: ["pipe", "pipe", "ignore"], timeout: 4000 }).trim();
    } catch {
      return "";
    }
  }
  try {
    return Buffer.from(cipherText, "base64").toString("utf8");
  } catch {
    return cipherText;
  }
}

export function loadConfig(): AgentConfig {
  if (!fs.existsSync(CONFIG_FILE)) {
    return {
      erpUrl: process.env.ERP_URL || "http://localhost:3000",
      deviceName: os.hostname(),
    };
  }

  try {
    const raw = fs.readFileSync(CONFIG_FILE, "utf8");
    const parsed = JSON.parse(raw);
    const token = parsed.token ? decryptDpapi(parsed.token) : undefined;
    return {
      erpUrl: parsed.erpUrl || process.env.ERP_URL || "http://localhost:3000",
      deviceId: parsed.deviceId,
      deviceCode: parsed.deviceCode,
      token,
      branchId: parsed.branchId,
      deviceName: parsed.deviceName || os.hostname(),
      heartbeatIntervalMs: parsed.heartbeatIntervalMs || 30000,
      fallbackPollIntervalMs: parsed.fallbackPollIntervalMs || 60000,
    };
  } catch {
    return {
      erpUrl: process.env.ERP_URL || "http://localhost:3000",
      deviceName: os.hostname(),
    };
  }
}

export function saveConfig(cfg: AgentConfig): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
  }

  const toStore: Record<string, unknown> = {
    erpUrl: cfg.erpUrl,
    deviceId: cfg.deviceId,
    deviceCode: cfg.deviceCode,
    branchId: cfg.branchId,
    deviceName: cfg.deviceName,
    heartbeatIntervalMs: cfg.heartbeatIntervalMs,
    fallbackPollIntervalMs: cfg.fallbackPollIntervalMs,
    token: cfg.token ? encryptDpapi(cfg.token) : undefined,
  };

  fs.writeFileSync(CONFIG_FILE, JSON.stringify(toStore, null, 2), {
    encoding: "utf8",
    mode: 0o600,
  });

  // On Windows, restrict ACL permissions to current user
  if (process.platform === "win32") {
    try {
      execSync(`icacls "${CONFIG_FILE}" /inheritance:r /grant:r "%USERNAME%:F"`, {
        stdio: "ignore",
        timeout: 3000,
      });
    } catch {
      // non-fatal
    }
  }
}

export function getConfigPath(): string {
  return CONFIG_FILE;
}
