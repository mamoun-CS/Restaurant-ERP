type PrintEventClient = {
  id: string;
  deviceId: string;
  branchId: string;
  send: (event: string, data: unknown) => void;
  close: () => void;
};

const clients = new Map<string, PrintEventClient>();

export function registerPrintEventClient(client: PrintEventClient) {
  clients.set(client.id, client);
  return () => {
    clients.delete(client.id);
    client.close();
  };
}

export function publishPrintJobEvent(job: { id: string; printDeviceId: string | null; branchId: string }) {
  if (!job.printDeviceId) {
    console.log({
      event: "PRINT_JOB_EVENT_SKIPPED",
      reason: "NO_PRINT_DEVICE",
      jobId: job.id,
      branchId: job.branchId,
    });
    return;
  }
  let delivered = 0;
  for (const client of clients.values()) {
    if (client.deviceId === job.printDeviceId && client.branchId === job.branchId) {
      delivered += 1;
      client.send("print-job", { jobId: job.id });
      client.send("PRINT_JOB_CREATED", { jobId: job.id });
    }
  }
  console.log({
    event: "PRINT_JOB_EVENT_PUBLISHED",
    jobId: job.id,
    printDeviceId: job.printDeviceId,
    branchId: job.branchId,
    connectedClients: clients.size,
    delivered,
  });
}
