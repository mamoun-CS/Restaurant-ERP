import net from "node:net";

export interface LanPrintOptions {
  ip: string;
  port?: number;
  timeoutMs?: number;
}

export class LanPrinterTransport {
  public static async send(data: Buffer, options: LanPrintOptions): Promise<void> {
    const port = options.port || 9100;
    const timeoutMs = options.timeoutMs || 8000;

    return new Promise<void>((resolve, reject) => {
      const socket = new net.Socket();
      let finished = false;

      const cleanup = () => {
        if (!finished) {
          finished = true;
          socket.removeAllListeners();
          socket.destroy();
        }
      };

      socket.setTimeout(timeoutMs);

      socket.on("timeout", () => {
        cleanup();
        const err = new Error(`Connection to printer ${options.ip}:${port} timed out after ${timeoutMs}ms.`);
        (err as unknown as { code: string }).code = "PRINTER_TIMEOUT";
        reject(err);
      });

      socket.on("error", (err: NodeJS.ErrnoException) => {
        cleanup();
        let mappedCode = "PRINTER_OFFLINE";
        if (err.code === "ECONNREFUSED") mappedCode = "CONNECTION_REFUSED";
        else if (err.code === "EHOSTUNREACH" || err.code === "ENETUNREACH") mappedCode = "HOST_UNREACHABLE";
        else if (err.code === "ETIMEDOUT") mappedCode = "PRINTER_TIMEOUT";

        const mappedErr = new Error(`Failed to print to LAN printer at ${options.ip}:${port}: ${err.message}`);
        (mappedErr as unknown as { code: string }).code = mappedCode;
        reject(mappedErr);
      });

      socket.connect(port, options.ip, () => {
        socket.write(data, (writeErr) => {
          if (writeErr) {
            cleanup();
            const err = new Error(`Failed to write bytes to ${options.ip}:${port}: ${writeErr.message}`);
            (err as unknown as { code: string }).code = "PRINTER_WRITE_ERROR";
            reject(err);
            return;
          }
          // Allow small drain period for thermal printer buffer
          setTimeout(() => {
            cleanup();
            resolve();
          }, 200);
        });
      });
    });
  }

  public static async ping(ip: string, port = 9100, timeoutMs = 2500): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const socket = new net.Socket();
      let resolved = false;

      socket.setTimeout(timeoutMs);

      socket.on("connect", () => {
        if (!resolved) {
          resolved = true;
          socket.destroy();
          resolve(true);
        }
      });

      const onFail = () => {
        if (!resolved) {
          resolved = true;
          socket.destroy();
          resolve(false);
        }
      };

      socket.on("timeout", onFail);
      socket.on("error", onFail);

      try {
        socket.connect(port, ip);
      } catch {
        onFail();
      }
    });
  }
}
