# Printer & Hardware Setup Guide

This guide covers printer configurations (USB vs LAN), paper widths, and cash drawer settings for Sheikh Al Kar Restaurant ERP.

## 1. Connection Transports
The system supports two primary printer connection transports per printer:

### A. USB (Windows Spooler)
- The printer connects via USB to the cashier PC.
- Install the manufacturer's Windows printer driver.
- The agent sends raw ESC/POS commands directly through the Windows Spooler (`winspool.drv` using `scripts/raw-print.ps1`).
- In ERP Settings (`/admin/settings/printing`), choose **USB** and select the printer name from the detected dropdown.

### B. Network / LAN (Raw TCP 9100)
- The printer connects via Ethernet cable to the local network router or switch.
- Assign a static IP address to the printer (e.g. `192.168.1.200`).
- The agent connects directly to `IP:9100` via raw TCP sockets with automatic timeout and retry management.
- In ERP Settings, choose **LAN** and enter the printer IP address and Port (default `9100`).

## 2. Paper Width Configuration
`PrinterConfiguration.paperWidth` is the single source of truth:
- **W80 (Standard 80mm):** 576 dots printable area at 203 DPI. Used for customer receipts and kitchen tickets.
- **W58 (Compact 58mm):** 384 dots printable area at 203 DPI.
- **CUSTOM:** Custom width in millimeters (30mm – 300mm).

Receipt and kitchen ticket HTML templates automatically adapt their CSS styling (`width: 80mm` vs `58mm`) based on the target printer's configured paper width.

## 3. Cash Drawer (RJ11 Kick-out)
- Connected to the printer's `DK` RJ11 kick-out port.
- Configured with:
  - **Pin:** `Pin 2 / Drawer 1` (default 0) or `Pin 5 / Drawer 2` (1).
  - **Pulse:** `pulseOn` (default 25ms), `pulseOff` (default 250ms).
  - **Timing:** `openBeforePrint` (default true) opens the drawer before printing begins.
- Use **Test Cash Drawer** in the ERP or `agent test-drawer` in the CLI to verify operation.
