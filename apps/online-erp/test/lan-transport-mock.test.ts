import net from "node:net";
import { strictEqual, ok } from "node:assert";
import { LanPrinterTransport } from "../print-agent/src/transports/lan";

async function runTests() {
  console.log("LAN transport mock socket tests:");

  // 1. Success test with mock TCP server
  await new Promise<void>((resolve, reject) => {
    const receivedChunks: Buffer[] = [];
    const server = net.createServer((socket) => {
      socket.on("data", (chunk) => {
        receivedChunks.push(chunk);
      });
    });

    server.listen(0, "127.0.0.1", async () => {
      const address = server.address() as net.AddressInfo;
      const port = address.port;

      try {
        const testPayload = Buffer.from([0x1b, 0x40, 0x54, 0x45, 0x53, 0x54, 0x0a]); // ESC @ TEST \n
        await LanPrinterTransport.send(testPayload, {
          ip: "127.0.0.1",
          port,
          timeoutMs: 3000,
        });

        const totalReceived = Buffer.concat(receivedChunks);
        strictEqual(
          totalReceived.toString("hex"),
          testPayload.toString("hex"),
          "Received bytes must match sent bytes",
        );
        console.log("  \x1b[32m✓\x1b[0m transmits exact ESC/POS raw bytes to mock TCP server");
        server.close(() => resolve());
      } catch (err) {
        server.close(() => reject(err));
      }
    });
  });

  // 2. Ping test with open port
  await new Promise<void>((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, "127.0.0.1", async () => {
      const address = server.address() as net.AddressInfo;
      const port = address.port;

      const isReachable = await LanPrinterTransport.ping("127.0.0.1", port, 2000);
      ok(isReachable, "Open port must return true for ping");
      console.log("  \x1b[32m✓\x1b[0m pings open socket port successfully");
      server.close(() => resolve());
    });
  });

  // 3. Connection refused test on unused port
  try {
    // Port 1 is rarely open on loopback
    await LanPrinterTransport.send(Buffer.from("FAIL"), {
      ip: "127.0.0.1",
      port: 19999,
      timeoutMs: 1000,
    });
    console.log("  \x1b[31m✗\x1b[0m should have rejected connection to closed port");
    process.exitCode = 1;
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    ok(
      code === "CONNECTION_REFUSED" || code === "PRINTER_TIMEOUT" || code === "PRINTER_OFFLINE",
      `Expected standard printer offline code, got: ${code}`,
    );
    console.log(`  \x1b[32m✓\x1b[0m correctly maps socket error on closed port (${code})`);
  }

  console.log("All LAN transport mock tests completed.\n");
}

runTests().catch((e) => {
  console.error("LAN transport test error:", e);
  process.exitCode = 1;
});
