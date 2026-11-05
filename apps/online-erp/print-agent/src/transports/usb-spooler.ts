import { execFile } from "node:child_process";
import path from "node:path";
import fs from "node:fs";

export class UsbSpoolerTransport {
  private static scriptPath: string | null = null;

  private static getScriptPath(): string {
    if (this.scriptPath && fs.existsSync(this.scriptPath)) {
      return this.scriptPath;
    }

    // Look in relative locations
    const candidates = [
      path.resolve(__dirname, "../../scripts/raw-print.ps1"),
      path.resolve(__dirname, "../scripts/raw-print.ps1"),
      path.resolve(process.cwd(), "scripts/raw-print.ps1"),
      path.resolve(process.cwd(), "print-agent/scripts/raw-print.ps1"),
    ];

    for (const p of candidates) {
      if (fs.existsSync(p)) {
        this.scriptPath = p;
        return p;
      }
    }

    // Default fallback path
    return path.resolve(process.cwd(), "scripts/raw-print.ps1");
  }

  public static async send(data: Buffer, printerName: string): Promise<void> {
    if (process.platform !== "win32") {
      throw new Error(`Windows Spooler RAW printing is only supported on Windows OS. Target: ${printerName}`);
    }

    const script = this.getScriptPath();
    const base64Data = data.toString("base64");

    return new Promise<void>((resolve, reject) => {
      const args = [
        "-NoProfile",
        "-NonInteractive",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        script,
        "-PrinterName",
        printerName,
        "-Base64Data",
        base64Data,
      ];

      execFile("powershell.exe", args, { timeout: 15000 }, (error, stdout, stderr) => {
        if (error) {
          const errMsg = stderr || stdout || error.message;
          let mappedCode = "RAW_PRINT_FAILED";

          if (errMsg.includes("not found") || errMsg.includes("invalid printer")) {
            mappedCode = "PRINTER_NOT_FOUND";
          } else if (errMsg.includes("Access is denied") || errMsg.includes("PermissionDenied")) {
            mappedCode = "ACCESS_DENIED";
          }

          const err = new Error(`Failed to print raw data to Windows printer '${printerName}': ${errMsg}`);
          (err as unknown as { code: string }).code = mappedCode;
          reject(err);
          return;
        }

        if (stdout.includes("SUCCESS")) {
          resolve();
        } else {
          const err = new Error(`Windows Spooler unexpected output: ${stdout}`);
          (err as unknown as { code: string }).code = "RAW_PRINT_FAILED";
          reject(err);
        }
      });
    });
  }
}
