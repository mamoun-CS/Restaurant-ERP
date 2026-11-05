# Windows POS

Independent Electron + React + TypeScript app. SQLite is opened by Electron main under the current Windows user's Electron `userData` directory; renderer code reaches it only through the typed preload IPC methods. The initial migration and checkout transaction are in `database/migrations` and `electron/database.ts`.

```powershell
cd apps/desktop-pos
npm install --install-links
npm run dev
npm run build
npm run package:windows
```

From the repository root, the equivalent development command is `npm run desktop:dev`. `npm run package:windows` builds a per-user NSIS installer with Start Menu and desktop shortcuts. It uses `better-sqlite3`'s Node-API prebuilt binary, verifies SQLite from a real Electron process, and packages native `.node` modules outside ASAR. An Electron-specific C++ rebuild is not needed. Installer upgrades and uninstalls keep the SQLite file in the user's data folder.

## Build and download the USB installer

Push or merge the code to `main`, then open **GitHub → Actions → Build Windows POS Installer → Run workflow**. The same workflow also starts on pushes to `main` and `desktop-v*` release tags. Download the `restaurant-pos-windows-setup` artifact from the completed run and extract `Restaurant-POS-Setup.exe`. Copy that single file to the USB drive. The target cashier PC does not need Node.js, npm, Electron, Visual Studio, Python, or a compiler.

The workflow runs the cashier tests, packages the NSIS installer, installs it silently into a temporary Windows profile, launches it to confirm SQLite is created, then simulates reinstall and uninstall to verify that the user's database is preserved. Cloud enrollment and sales synchronization still require a reachable server during first pairing; no API keys or credentials are embedded in the installer.

## Current scope

The app supports a provisioned offline cashier PIN, local catalog lookup (including barcode text entry), cart editing, atomic cash checkout, discount limits with supervisor PIN approval, a local receipt view/print action, and a persistent outbox. Device pairing downloads products, prices, categories, and cashier permissions into SQLite; a SHA-256 catalog comparison is shown in the cashier UI, refreshed automatically, and can be forced manually. Catalog replacement is transactional and does not delete local sales or their sync queue. SQLite is created and migrated on first launch under Electron `userData` and remains available offline.

After checkout, use **Save invoice PDF** to select a folder and save the displayed invoice to the computer. This works without a printer and is suitable for checking the invoice output locally.

`package:windows` compiles and includes the print agent and Windows RAW spooler script in the installer. The bundled agent auto-starts only if its separate legacy print-agent enrollment exists in `%APPDATA%\restaurant-erp-print-agent`; POS pairing does not yet create that credential. For a new install, pair the print agent separately using the ERP printing page's pairing code. Receipt printing opens the Windows print dialog; automatic routed kitchen ticket printing from the cashier still requires an end-to-end POS print integration.

## Easy printer setup

Select **Set up a printer** on the sign-in screen (or **Printer** in the cashier header). The setup panel opens Windows **Bluetooth & devices → Printers & scanners**, where the user can add a USB/network printer or install the manufacturer's driver. Return to POS, press **Refresh printer list**, select a receipt printer, and print a test page. Leaving **Ask me each time** selected opens the Windows printer chooser for every receipt. Sales remain available when no printer is connected.

The implementation is not yet production-ready. Product option selection, cash register opening/closing, sales history, non-cash terminal settlement, automatic routed kitchen ticket printing from POS, signed auto-updates, and backup/restore UX are pending. The cloud migration has not been applied to a production database, and the Windows installer has not yet been verified on a clean Windows 10/11 machine. Review `docs/REBUILD-STATUS.md` and the root migration/security documents before a live pilot.
