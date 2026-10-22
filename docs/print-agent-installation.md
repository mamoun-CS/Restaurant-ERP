# Local Print Agent Installation Guide

The **Sheikh Al Kar Print Agent** is a lightweight, headless Node.js daemon (running on Node 20 LTS) located under `print-agent/`. It runs locally on the cashier Windows PC to manage ESC/POS thermal printing, Arabic rasterization, and cash drawer kick pulses.

> [!NOTE]
> The print agent is fully headless and does not require Electron or native C++ compiler tools (`node-gyp`).

## 1. Prerequisites
- **OS:** Windows 10 or Windows 11 (64-bit)
- **Node.js:** Node.js 20 LTS installed and available in `PATH`
- **Browser:** Microsoft Edge (preinstalled) or Google Chrome (used headlessly for crisp Arabic bitmap rasterization)

## 2. Quick Installation & Pairing
1. Navigate to the project root:
   ```cmd
   cd "c:\path\to\Restaurant ERP"
   ```
2. Build the TypeScript agent:
   ```cmd
   npm --prefix print-agent run build
   ```
   *(or run `npx tsc -p print-agent`)*

3. Generate a pairing code from the ERP:
   - Navigate to `http://localhost:3000/admin/settings/printing`.
   - Select your branch and click **Generate Pairing Code**.

4. Pair the agent using the CLI:
   ```cmd
   node print-agent/dist/cli.js pair <CODE> "Cashier-Station-1"
   ```
   The pairing token is encrypted and securely stored in `%APPDATA%\restaurant-erp-print-agent\config.json`.

5. Run system diagnostics:
   ```cmd
   node print-agent/dist/cli.js doctor
   ```

## 3. Running the Agent
- **Manual Start:**
  ```cmd
  node print-agent/dist/cli.js run
  ```
- **Combined Launcher:** Double-click `scripts\start-all.bat` to launch both the Next.js ERP and the Print Agent.
- **Windows Task Scheduler (Auto-Start at Logon):**
  Open PowerShell as Administrator and run:
  ```powershell
  .\scripts\install-windows.ps1
  ```

## 4. Diagnostics Loopback Endpoint
The agent binds a status endpoint strictly to `127.0.0.1:4099/health` for local health checks.
