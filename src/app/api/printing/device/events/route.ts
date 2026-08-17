import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { rateLimit, requestIp } from "@/lib/api";
import { db } from "@/lib/db";
import { authenticatePrintDevice } from "@/lib/printing/device-auth";
import { registerPrintEventClient } from "@/lib/printing/sse-broker";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const limited = rateLimit(`print-events:${requestIp(request)}`, 30, 60_000);
  if (limited) return limited;
  const device = await authenticatePrintDevice(request);
  if (!device) return NextResponse.json({ success: false, code: "DEVICE_NOT_AUTHORIZED" }, { status: 401 });

  await db.printDevice.update({
    where: { id: device.id },
    data: { status: "ONLINE", lastConnectedAt: new Date(), lastHeartbeatAt: new Date() },
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };
      const keepAlive = windowlessSetInterval(() => {
        controller.enqueue(encoder.encode(`: keep-alive ${Date.now()}\n\n`));
      }, 20_000);
      const cleanup = registerPrintEventClient({
        id: randomUUID(),
        deviceId: device.id,
        branchId: device.branchId,
        send,
        close: () => {
          clearInterval(keepAlive);
          try {
            controller.close();
          } catch {
            // Already closed by client disconnect.
          }
        },
      });
      send("connected", { success: true });
      request.signal.addEventListener("abort", cleanup, { once: true });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

function windowlessSetInterval(callback: () => void, ms: number) {
  return setInterval(callback, ms);
}
