$ErrorActionPreference = "Stop"
$workspace = Split-Path -Parent $MyInvocation.MyCommand.Path
$erpDir = Join-Path $workspace "apps\online-erp"

if (-not (Test-Path (Join-Path $erpDir "node_modules\next\dist\bin\next"))) {
  throw "Dependencies are not installed. Run: npm install --prefix apps/online-erp"
}
Start-Process powershell -ArgumentList @("-NoExit", "-Command", "Set-Location -LiteralPath '$erpDir'; npm run dev")
Write-Host "Online ERP full stack: http://localhost:3000"
