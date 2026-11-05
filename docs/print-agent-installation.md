# Local Print Agent Installation Guide

The **Sheikh Al Kar Print Agent** is a lightweight, headless daemon located under `apps/online-erp/print-agent/`. The Windows cashier installer now bundles its compiled JavaScript and the Windows RAW spooler script, and runs it with Electron's embedded Node runtime. A separate Node.js installation is not needed for normal cashier operation.

The agent keeps its pairing configuration and local print queue in `%APPDATA%\restaurant-erp-print-agent`. Cashier SQLite data remains in Electron's per-user `userData` directory. Neither directory is inside the install folder, so an application update does not overwrite either store.

The cashier starts the bundled agent on launch only when a valid existing agent pairing configuration is present. This preserves existing agent enrollment. The cashier's newer POS device enrollment is separate from the print agent's legacy pairing flow; until these flows are unified, a new installation must still be paired with a print-agent pairing code before its background print agent can run.

> [!NOTE]
> The print agent itself is fully headless and does not require native C++ compiler tools (`node-gyp`). The cashier installer includes its runtime and spooler script.

## 1. Prerequisites for standalone development
- **OS:** Windows 10 or Windows 11 (64-bit)
- **Node.js:** Node.js 20 LTS installed and available in `PATH`
- **Browser:** Microsoft Edge (preinstalled) or Google Chrome (used headlessly for crisp Arabic bitmap rasterization)

## 2. Standalone Installation & Pairing
1. Navigate to the project root:
   ```cmd
   cd "c:\path\to\Restaurant ERP"
   ```
2. Install the agent's development dependencies and build the TypeScript agent:
   ```cmd
   npm --prefix apps\online-erp\print-agent install
   npm --prefix apps\online-erp\print-agent run build
   ```

3. Generate a pairing code from the ERP:
   - Navigate to `http://localhost:3000/admin/settings/printing`.
   - Select your branch and click **Generate Pairing Code**.

4. Pair the agent using the CLI:
   ```cmd
   node apps\online-erp\print-agent\dist\cli.js pair <CODE> "Cashier-Station-1"
   ```
   The pairing token is encrypted and securely stored in `%APPDATA%\restaurant-erp-print-agent\config.json`.

5. Run system diagnostics:
   ```cmd
   node apps\online-erp\print-agent\dist\cli.js doctor
   ```

## 3. Running the Agent
- **Manual Start:**
  ```cmd
  node apps\online-erp\print-agent\dist\cli.js run
  ```
- **Combined Launcher:** Double-click `scripts\start-all.bat` to launch both the Next.js ERP and the Print Agent.
- **Windows Task Scheduler (Auto-Start at Logon):**
  Open PowerShell as Administrator and run:
  ```powershell
  .\scripts\install-windows.ps1
  ```

## 4. Diagnostics Loopback Endpoint
The agent binds a status endpoint strictly to `127.0.0.1:4099/health` for local health checks.
