$ErrorActionPreference = "SilentlyContinue"
Get-NetTCPConnection -State Listen -LocalPort 3000 | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object {
  Stop-Process -Id $_ -Force
}
Write-Host "Stopped the Online ERP listener on port 3000."
