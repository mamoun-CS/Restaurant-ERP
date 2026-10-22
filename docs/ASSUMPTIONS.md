# Assumptions & Architectural Decisions

This document records all operational, technical, and environment assumptions made for the **Sheikh Al Kar Restaurant ERP** printing and local cashier PC setup.

## 1. Cashier PC Environment
- **Operating System:** Windows 10 or Windows 11 (64-bit).
- **Runtime:** Node.js 20 LTS installed.
- **Local Application:** Next.js application runs locally on `http://localhost:3000` (or `0.0.0.0:3000` for LAN access).
- **Print Agent:** Headless Node.js TypeScript daemon running locally on the cashier PC as a background process or Windows scheduled task (auto-started at user logon).
- **Browser for Rasterization:** Microsoft Edge (preinstalled on all modern Windows 10/11) or Google Chrome available at default system paths (`C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe` or `C:\Program Files\Google\Chrome\Application\chrome.exe`). Used headlessly to render Arabic receipts as high-resolution crisp monochrome thermal bitmap images (`GS v 0` ESC/POS raster).

## 2. Printer & Cash Drawer Hardware
- **Cashier Printer:**
  - Common thermal receipt printers (Epson TM-T20/TM-T88, Bixolon, Rongta, Xprinter, Sunmi, Star Micronics, or compatible).
  - Default paper width assumed to be **80mm** (printable width ~72mm, 576 dots @ 203 DPI), with full support for **58mm** (printable width ~48mm, 384 dots @ 203 DPI) and custom millimeter widths.
  - Connection type:
    - **USB:** Driven via Windows Spooler (RAW print queue using `RawPrinterHelper` winspool API).
    - **LAN:** Raw TCP socket to `IP:port` (standard ESC/POS raw port 9100).
- **Cash Drawer:**
  - Standard cash drawer connected via RJ11 kick-out cable to the receipt printer's drawer port.
  - Standard ESC/POS pulse command: `ESC p m t1 t2` (pin 0 or pin 1, standard pulse 25ms on / 250ms off).
  - Drawer can be triggered automatically before/after receipt printing or tested independently via the settings UI and agent CLI.

## 3. Database & Network Connectivity
- **PostgreSQL Database:** Hosted in the cloud (e.g. Supabase, Neon, AWS RDS, Neon, or VPS) accessed via TLS/SSL (`sslmode=require`).
- **Connection Resiliency:**
  - In normal operation, cashier PC connects to cloud PostgreSQL.
  - If internet drops:
    - Offline POS (`src/lib/offline`) caches sales in IndexedDB (`localDb`).
    - Print agent continues printing queued local jobs from its persistent disk queue.
    - When internet reconnects, sales and print statuses synchronize automatically.
- **Cookie Security:**
  - In development or local HTTP (`http://localhost:3000` or `http://192.168.x.x:3000`), session cookies must not enforce `secure: true`, otherwise authentication fails over HTTP.
  - Secure cookies are enabled only when `APP_URL` starts with `https://` or `COOKIE_SECURE=true`.

## 4. Security & Secrets Management
- No secrets (passwords, JWT secrets, database credentials, auth tokens) are logged or displayed in UI diagnostics or reports.
- Agent tokens are stored in restricted local config files (`config.json` with Windows ACL restricted to current user) or DPAPI protected.
- Admin creation script forces a secure password and creates an initial admin without pre-populated demo passwords.
