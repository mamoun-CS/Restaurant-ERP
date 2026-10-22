# Printing & Hardware Troubleshooting

## Quick Diagnostic Tool: `agent doctor`
Run the agent doctor anytime to get an immediate status check:
```cmd
node print-agent/dist/cli.js doctor
```

## Readiness Dashboard
Open the ERP Readiness Dashboard at `/admin/settings/printing/readiness` for real-time end-to-end status of:
- Cloud database connection latency and applied migrations
- Paired agent heartbeats and status
- Configured printers, LAN ping tests, and paper widths
- Cash drawer configuration and pending/failed job queues

---

## Common Issues & Solutions

### 1. Agent Status shows "Offline"
- **Cause:** The agent process is not running, or network is down.
- **Fix:** Start the agent via `node print-agent/dist/cli.js run` or double-click `scripts\start-all.bat`. Verify `agent doctor` can reach `http://localhost:3000`.

### 2. Arabic Text Prints as Question Marks or Corrupted Symbols
- **Cause:** ESC/POS character codepages do not support Arabic cursive ligatures well.
- **Fix:** The Sheikh Al Kar print agent uses headless Microsoft Edge/Chrome to rasterize the receipt into a high-resolution monochrome bitmap image (`GS v 0`). Ensure Microsoft Edge or Chrome is installed on the cashier PC.

### 3. LAN Printer Unreachable (`PRINTER_TIMEOUT` / `CONNECTION_REFUSED`)
- **Cause:** Printer IP address changed or printer is powered off.
- **Fix:** Print a status slip from the printer by holding the `Feed` button while turning it on. Confirm the IP address in ERP Printer Settings matches the slip.

### 4. Cash Drawer Does Not Open
- **Cause:** RJ11 cable disconnected or incorrect pin assigned.
- **Fix:** Ensure the RJ11 cable is firmly connected to the printer's `DK` port. In printer settings, toggle the pin between `Pin 2` and `Pin 5`. Test using the "Test Cash Drawer" button.

### 5. Failed Print Jobs in Queue
- **Cause:** Printer ran out of paper or was disconnected while jobs were dispatched.
- **Fix:** Refill paper, verify printer is online, then go to `/admin/settings/printing/readiness` and click **Retry Failed Jobs**.

### 6. Idempotency & Double-Print Protection
- All jobs have unique idempotency keys (e.g. `invoice:<ID>:receipt:<PRINTER_ID>`).
- The agent persists printed job keys in `%APPDATA%\restaurant-erp-print-agent\printed-jobs.json` to guarantee a job is never physically printed twice, even if the agent is restarted during delivery.
