import { execSync } from "node:child_process";
import type { DetectedPrinter } from "../types.js";

export function detectWindowsPrinters(): DetectedPrinter[] {
  if (process.platform !== "win32") {
    return [
      { name: "Virtual-Demo-Printer", displayName: "Virtual Demo Printer (Non-Windows)", isDefault: true, status: "Ready" },
    ];
  }

  try {
    const cmd = `powershell -NoProfile -NonInteractive -Command "Get-CimInstance Win32_Printer | Select-Object Name, Default, PrinterStatus, DriverName | ConvertTo-Json -Compress"`;
    const output = execSync(cmd, { encoding: "utf8", timeout: 8000 }).trim();

    if (!output) return [];

    const parsed = JSON.parse(output);
    const list = Array.isArray(parsed) ? parsed : [parsed];

    return list.map((item: { Name: string; Default?: boolean; PrinterStatus?: number }) => {
      let statusStr = "Ready";
      if (item.PrinterStatus === 1) statusStr = "Other";
      else if (item.PrinterStatus === 2) statusStr = "Unknown";
      else if (item.PrinterStatus === 3) statusStr = "Idle";
      else if (item.PrinterStatus === 4) statusStr = "Printing";
      else if (item.PrinterStatus === 5) statusStr = "Warming Up";
      else if (item.PrinterStatus === 7) statusStr = "Offline";

      return {
        name: item.Name,
        displayName: item.Name,
        isDefault: Boolean(item.Default),
        status: statusStr,
      };
    });
  } catch {
    return [];
  }
}
