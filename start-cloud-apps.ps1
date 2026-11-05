$ErrorActionPreference = "Stop"
$workspace = Split-Path -Parent $MyInvocation.MyCommand.Path
$apiDir = Join-Path $workspace "apps\api"
$erpDir = Join-Path $workspace "apps\online-erp"

if (-not (Test-Path (Join-Path $erpDir "node_modules\next\dist\bin\next"))) {
  throw "Dependencies are not installed. Run: npm install --prefix apps/online-erp"
}
Start-Process powershell -ArgumentList @("-NoExit", "-Command", "Set-Location -LiteralPath '$apiDir'; npm run dev")
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList @("-NoExit", "-Command", "Set-Location -LiteralPath '$erpDir'; npm run dev")
Write-Host "Backend API: http://localhost:3010"
Write-Host "Online ERP:  http://localhost:3000"
