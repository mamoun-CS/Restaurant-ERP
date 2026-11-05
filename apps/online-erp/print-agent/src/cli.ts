#!/usr/bin/env node
import process from "node:process";
import os from "node:os";
import { loadConfig, saveConfig, getConfigPath } from "./crypto-store.js";
import { ApiClient } from "./api-client.js";
import { PrintAgent } from "./agent.js";
import { runAgentDoctor } from "./doctor.js";
import { EscPos } from "./escpos/commands.js";
import { detectWindowsPrinters } from "./detectors/windows-printers.js";
import { UsbSpoolerTransport } from "./transports/usb-spooler.js";
import { LanPrinterTransport } from "./transports/lan.js";

async function main() {
  const args = process.argv.slice(2);
  const command = args[0]?.toLowerCase();

  switch (command) {
    case "pair": {
      const code = args[1];
      if (!code) {
        console.error("Usage: agent pair <PAIRING_CODE> [DEVICE_NAME]");
        console.error("Example: agent pair ABC123XYZ \"Cashier-Counter-1\"");
        process.exit(1);
      }
      const deviceName = args[2] || os.hostname();
      const config = loadConfig();
      const client = new ApiClient(config);

      console.log(`Pairing with ERP at ${config.erpUrl}...`);
      try {
        const paired = await client.pair(code, deviceName);
        config.deviceId = paired.deviceId;
        config.deviceCode = paired.deviceCode;
        config.branchId = paired.branchId;
        config.token = paired.token;
        config.deviceName = deviceName;
        saveConfig(config);

        console.log("✓ Pairing successful!");
        console.log(`  Device ID:   ${paired.deviceId}`);
        console.log(`  Device Code: ${paired.deviceCode}`);
        console.log(`  Branch ID:   ${paired.branchId}`);
        console.log(`  Config saved to: ${getConfigPath()}`);
        console.log("\nYou can now start the agent by running: agent run");
      } catch (err) {
        console.error("✗ Pairing failed:", (err as Error).message);
        process.exit(1);
      }
      break;
    }

    case "run": {
      const agent = new PrintAgent();
      process.on("SIGINT", () => {
        console.log("\nReceived SIGINT. Shutting down gracefully...");
        agent.stop();
        process.exit(0);
      });
      process.on("SIGTERM", () => {
        console.log("\nReceived SIGTERM. Shutting down gracefully...");
        agent.stop();
        process.exit(0);
      });

      try {
        await agent.start();
      } catch (err) {
        console.error("✗ Failed to start agent:", (err as Error).message);
        process.exit(1);
      }
      break;
    }

    case "doctor": {
      console.log("Running Sheikh Al Kar Print Agent Doctor...\n");
      const results = await runAgentDoctor();
      let hasFailures = false;

      for (const check of results) {
        const icon = check.status === "pass" ? "✓" : check.status === "warn" ? "⚠" : "✗";
        console.log(`${icon} [${check.title}]`);
        console.log(`   ${check.details}`);
        if (check.fix) {
          console.log(`   💡 إصلاح / Fix: ${check.fix}`);
        }
        console.log("");
        if (check.status === "fail") hasFailures = true;
      }

      if (hasFailures) {
        console.error("Doctor detected issues that need resolution.");
        process.exit(1);
      } else {
        console.log("All critical checks passed successfully!");
      }
      break;
    }

    case "test-drawer": {
      const target = args[1];
      console.log("Testing cash drawer kick command (ESC p 0)...");

      const pulse = EscPos.cashDrawer(0, 25, 250);
      try {
        if (target && target.includes(".")) {
          // IP address -> LAN
          const port = parseInt(args[2] || "9100", 10);
          console.log(`Sending cash drawer pulse to LAN ${target}:${port}...`);
          await LanPrinterTransport.send(pulse, { ip: target, port });
        } else {
          // USB Windows Spooler
          const printerName = target || detectWindowsPrinters().find((p) => p.isDefault)?.name || detectWindowsPrinters()[0]?.name;
          if (!printerName) {
            console.error("✗ No Windows printer found to test drawer. Specify: agent test-drawer <PRINTER_NAME>");
            process.exit(1);
          }
          console.log(`Sending cash drawer pulse to Windows printer '${printerName}'...`);
          await UsbSpoolerTransport.send(pulse, printerName);
        }
        console.log("✓ Cash drawer pulse sent successfully!");
      } catch (err) {
        console.error("✗ Cash drawer test failed:", (err as Error).message);
        process.exit(1);
      }
      break;
    }

    case "test-print": {
      const target = args[1];
      console.log("Testing printer output...");

      const sample = Buffer.concat([
        EscPos.INIT,
        Buffer.from("\n================================\n", "ascii"),
        Buffer.from("       SHEIKH AL KAR ERP        \n", "ascii"),
        Buffer.from("        مطعم شيخ الكار         \n", "utf8"),
        Buffer.from("================================\n", "ascii"),
        Buffer.from(`Date: ${new Date().toLocaleString()}\n`, "ascii"),
        Buffer.from("Test print completed successfully.\n", "ascii"),
        Buffer.from("================================\n\n\n", "ascii"),
        EscPos.FEED_3_LINES,
        EscPos.CUT_PARTIAL,
      ]);

      try {
        if (target && target.includes(".")) {
          const port = parseInt(args[2] || "9100", 10);
          console.log(`Sending test print to LAN ${target}:${port}...`);
          await LanPrinterTransport.send(sample, { ip: target, port });
        } else {
          const printerName = target || detectWindowsPrinters().find((p) => p.isDefault)?.name || detectWindowsPrinters()[0]?.name;
          if (!printerName) {
            console.error("✗ No Windows printer found. Specify: agent test-print <PRINTER_NAME>");
            process.exit(1);
          }
          console.log(`Sending test print to Windows printer '${printerName}'...`);
          await UsbSpoolerTransport.send(sample, printerName);
        }
        console.log("✓ Test print sent successfully!");
      } catch (err) {
        console.error("✗ Test print failed:", (err as Error).message);
        process.exit(1);
      }
      break;
    }

    default: {
      console.log(`
Sheikh Al Kar Restaurant ERP - Local Print Agent (v1.0.0)

Commands:
  agent pair <CODE> [NAME]    Pair this PC with ERP using a pairing code
  agent run                   Run the background agent daemon (SSE + queue)
  agent doctor                Verify system readiness, printers, and network
  agent test-print [TARGET]   Send a test receipt to local or LAN printer
  agent test-drawer [TARGET]  Send a drawer kick signal (Pin 2 / ESC p)

Examples:
  agent pair W8X9K2 "POS-Counter"
  agent run
  agent doctor
  agent test-print "POS-80"
  agent test-print 192.168.1.200 9100
  agent test-drawer
      `);
      break;
    }
  }
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
