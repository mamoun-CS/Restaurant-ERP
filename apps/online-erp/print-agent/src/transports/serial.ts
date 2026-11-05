import fs from "node:fs";

export interface SerialPrintOptions {
  port: string; // e.g. "COM1", "/dev/ttyS0"
  baudRate?: number;
}

export class SerialPrinterTransport {
  public static async send(data: Buffer, options: SerialPrintOptions): Promise<void> {
    const portPath = options.port;
    return new Promise<void>((resolve, reject) => {
      // In Windows, COM ports can be written directly to \\.\COM1 via fs.open
      const fullPath = portPath.startsWith("\\\\.\\") ? portPath : `\\\\.\\${portPath}`;
      fs.open(fullPath, "w", (openErr, fd) => {
        if (openErr) {
          const err = new Error(`Failed to open serial port ${portPath}: ${openErr.message}`);
          (err as unknown as { code: string }).code = "SERIAL_PORT_UNAVAILABLE";
          reject(err);
          return;
        }

        fs.write(fd, data, 0, data.length, null, (writeErr) => {
          fs.close(fd, () => {
            if (writeErr) {
              const err = new Error(`Failed to write to serial port ${portPath}: ${writeErr.message}`);
              (err as unknown as { code: string }).code = "SERIAL_WRITE_ERROR";
              reject(err);
            } else {
              resolve();
            }
          });
        });
      });
    });
  }
}
