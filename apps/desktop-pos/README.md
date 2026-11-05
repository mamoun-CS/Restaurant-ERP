# Windows POS

Independent Electron + React + TypeScript app. SQLite is opened by Electron main under the current Windows user's Electron `userData` directory; renderer code reaches it only through the typed preload IPC methods. The initial migration and checkout transaction are in `database/migrations` and `electron/database.ts`.

```powershell
npm install
npm run desktop:dev
npm run desktop:build
npm run package:windows
```

Run `npm install` in this directory to install the desktop toolchain. `package:windows` builds a per-user NSIS installer with Start Menu and desktop shortcuts. Installer upgrades keep the SQLite file outside the installation folder. Packaging native SQLite on a developer workstation requires Visual Studio 2022 C++ build tools; the Windows GitHub Actions workflow builds and uploads the installer from a Windows runner.

## Current scope

The app supports a provisioned offline cashier PIN, local catalog lookup (including barcode text entry), cart editing, atomic cash checkout, discount limits with supervisor PIN approval, a local receipt view/print action, and a persistent outbox. Device pairing, cloud catalog/cashier bootstrap, and idempotent sale upload are implemented. The SQLite DB includes migration-managed tables for sales, payments, inventory movements, cashier verifiers/policies, settings, audit logs, and synchronization.

The implementation is not yet production-ready. The cloud dashboard and API remain in the same Next.js deployment; sales sync currently uses full catalog snapshots and does not cover customers or register sessions. Product option selection, cash register opening/closing, sales history, non-cash terminal settlement, integrated print-agent output, signed auto-updates, and backup/restore UX are pending. The cloud migration has not been applied to a production database, and the Windows installer has not yet been verified on a clean Windows 10/11 machine. Review `docs/REBUILD-STATUS.md` and the root migration/security documents before a live pilot.
