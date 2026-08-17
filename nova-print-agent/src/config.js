const fs = require("node:fs");
const path = require("node:path");
const { app, safeStorage } = require("electron");

function getConfigPath() {
  return path.join(app.getPath("userData"), "print-agent-config.json");
}

function getSecretPath() {
  return path.join(app.getPath("userData"), "device-token.bin");
}

const defaultConfig = {
  erpUrl: "http://localhost:3000",
  deviceId: "",
  deviceCode: "",
  branchId: "",
  deviceName: "Nova Print Agent",
  language: "en",
  pollingIntervalMs: 5000,
  paperWidth: 80,
  startWithWindows: true,
  paused: false,
  mockMode: false,
  outputMode: "printer",
  outputFolder: "",
  defaultJobAction: "SAVE_PDF",
  continuePrintingIfDrawerFails: true,
  cashDrawerEnabled: false,
  cashDrawerPin: 0,
  cashDrawerPulseOn: 25,
  cashDrawerPulseOff: 250,
};

function loadConfig() {
  try {
    if (!fs.existsSync(getConfigPath())) return { ...defaultConfig };
    return { ...defaultConfig, ...JSON.parse(fs.readFileSync(getConfigPath(), "utf8")) };
  } catch {
    return { ...defaultConfig };
  }
}

function saveConfig(config) {
  fs.mkdirSync(path.dirname(getConfigPath()), { recursive: true });
  const { agentToken: _agentToken, token: _token, ...safeConfig } = config;
  fs.writeFileSync(getConfigPath(), JSON.stringify({ ...defaultConfig, ...safeConfig }, null, 2), "utf8");
}

function saveToken(token) {
  fs.mkdirSync(path.dirname(getSecretPath()), { recursive: true });
  const bytes = Buffer.from(token, "utf8");
  const encrypted = safeStorage.isEncryptionAvailable() ? safeStorage.encryptString(token) : bytes;
  fs.writeFileSync(getSecretPath(), encrypted);
}

function loadToken() {
  try {
    if (!fs.existsSync(getSecretPath())) return "";
    const encrypted = fs.readFileSync(getSecretPath());
    return safeStorage.isEncryptionAvailable() ? safeStorage.decryptString(encrypted) : encrypted.toString("utf8");
  } catch {
    return "";
  }
}

module.exports = { loadConfig, saveConfig, loadToken, saveToken };
