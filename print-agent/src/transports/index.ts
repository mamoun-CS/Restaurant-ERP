import { LanPrinterTransport } from "./lan.js";
import { UsbSpoolerTransport } from "./usb-spooler.js";
import { SerialPrinterTransport } from "./serial.js";
import type { PrinterConfigDto } from "../types.js";

export async function sendRawToPrinter(
  printer: PrinterConfigDto,
  data: Buffer,
): Promise<void> {
  const connectionType = printer.connectionType || (printer.ipAddress ? "LAN" : "USB");

  switch (connectionType) {
    case "LAN": {
      const ip = printer.ipAddress;
      if (!ip) {
        const err = new Error(`LAN printer '${printer.displayName}' has no IP address configured.`);
        (err as unknown as { code: string }).code = "CONFIG_MISSING_IP";
        throw err;
      }
      const port = printer.port || 9100;
      await LanPrinterTransport.send(data, { ip, port, timeoutMs: 10000 });
      break;
    }

    case "USB": {
      const printerName = printer.localPrinterName;
      if (!printerName) {
        const err = new Error(`USB printer '${printer.displayName}' has no local Windows printer name configured.`);
        (err as unknown as { code: string }).code = "CONFIG_MISSING_PRINTER_NAME";
        throw err;
      }
      await UsbSpoolerTransport.send(data, printerName);
      break;
    }

    case "SERIAL": {
      const port = printer.localPrinterName || "COM1";
      await SerialPrinterTransport.send(data, { port });
      break;
    }

    default: {
      const err = new Error(`Unsupported printer connection type: ${connectionType}`);
      (err as unknown as { code: string }).code = "UNSUPPORTED_CONNECTION_TYPE";
      throw err;
    }
  }
}
