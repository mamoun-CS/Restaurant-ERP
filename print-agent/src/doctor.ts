import os from "node:os";
import { loadConfig, getConfigPath } from "./crypto-store.js";
import { HtmlRasterizer } from "./renderer/html-to-raster.js";
import { detectWindowsPrinters } from "./detectors/windows-printers.js";
import { LanPrinterTransport } from "./transports/lan.js";
import type { CheckItem } from "./types.js";

export async function runAgentDoctor(): Promise<CheckItem[]> {
  const checks: CheckItem[] = [];
  const config = loadConfig();

  // 1. Node version check
  const nodeVersion = process.version;
  const major = parseInt(nodeVersion.replace("v", "").split(".")[0], 10);
  if (major >= 20) {
    checks.push({
      key: "node",
      title: "بيئة التشغيل Node.js / Node.js Runtime",
      status: "pass",
      details: `${nodeVersion} (متوافق / Compatible >= 20)`,
    });
  } else {
    checks.push({
      key: "node",
      title: "بيئة التشغيل Node.js / Node.js Runtime",
      status: "fail",
      details: `${nodeVersion} (غير مدعوم / Requires Node 20 LTS)`,
      fix: "قم بتحميل وتثبيت Node.js 20 LTS من https://nodejs.org",
    });
  }

  // 2. Browser for Rasterization (Edge / Chrome)
  const browser = HtmlRasterizer.findBrowser();
  if (browser) {
    checks.push({
      key: "browser",
      title: "محرك تحويل الفواتير للطباعة الحرارية / Raster Browser Engine",
      status: "pass",
      details: `تم العثور على المتصفح: ${browser}`,
    });
  } else {
    checks.push({
      key: "browser",
      title: "محرك تحويل الفواتير للطباعة الحرارية / Raster Browser Engine",
      status: "warn",
      details: "لم يتم العثور على متصفح Microsoft Edge أو Google Chrome (سيتم استخدام وضع النصوص البسيطة)",
      fix: "تثبيت Microsoft Edge أو Google Chrome لدعم طباعة النصوص العربية والرسومات بجودة عالية.",
    });
  }

  // 3. Configuration & Pairing
  const configPath = getConfigPath();
  if (config.token && config.deviceId) {
    checks.push({
      key: "pairing",
      title: "حالة الاقتران بالنظام / Device Pairing",
      status: "pass",
      details: `الجهاز مقترن بنجاح: ${config.deviceName || os.hostname()} (ID: ${config.deviceId})`,
    });
  } else {
    checks.push({
      key: "pairing",
      title: "حالة الاقتران بالنظام / Device Pairing",
      status: "fail",
      details: "الوكيل غير مقترن بنظام ERP بعد.",
      fix: "قم بإنشاء رمز اقتران من صفحة إعدادات الطباعة، ثم نفذ: `agent pair <CODE>`",
    });
  }

  // 4. ERP Server Connectivity & Latency
  const erpUrl = config.erpUrl || "http://localhost:3000";
  try {
    const start = Date.now();
    const res = await fetch(`${erpUrl.replace(/\/+$/, "")}/api/auth/session`, { method: "GET" });
    const latency = Date.now() - start;

    if (res.ok || res.status === 401 || res.status === 200) {
      checks.push({
        key: "erp_reachability",
        title: "الاتصال بخادم النظام / ERP Server Reachability",
        status: latency < 300 ? "pass" : "warn",
        details: `متصل بـ ${erpUrl} (زمن الاستجابة: ${latency}ms)`,
      });
    } else {
      checks.push({
        key: "erp_reachability",
        title: "الاتصال بخادم النظام / ERP Server Reachability",
        status: "warn",
        details: `الخادم استجاب برمز حالة ${res.status}`,
      });
    }
  } catch (err: unknown) {
    checks.push({
      key: "erp_reachability",
      title: "الاتصال بخادم النظام / ERP Server Reachability",
      status: "fail",
      details: `تعذر الاتصال بخادم النظام على ${erpUrl}: ${(err as Error).message}`,
      fix: "تأكد من تشغيل تطبيق Next.js أو فحص عنوان ERP_URL في ملف الإعدادات.",
    });
  }

  // 5. Detected Windows Printers
  const localPrinters = detectWindowsPrinters();
  if (localPrinters.length > 0) {
    const listNames = localPrinters.map((p) => p.name).join(", ");
    checks.push({
      key: "windows_printers",
      title: "طابعات ويندوز المحلية / Windows Spooler Printers",
      status: "pass",
      details: `تم اكتشاف ${localPrinters.length} طابعة (${listNames})`,
    });
  } else {
    checks.push({
      key: "windows_printers",
      title: "طابعات ويندوز المحلية / Windows Spooler Printers",
      status: "warn",
      details: "لم يتم العثور على طابعات مثبتة في ويندوز.",
      fix: "قم بتوصيل الطابعة عبر USB وتثبيت تعريف الطابعة الرسمي في ويندوز.",
    });
  }

  return checks;
}
