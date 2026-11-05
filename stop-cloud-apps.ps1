$ErrorActionPreference = "SilentlyContinue"
Get-NetTCPConnection -State Listen -LocalPort 3000,3010 | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object {
  Stop-Process -Id $_ -Force
}
Write-Host "Stopped listeners on ports 3000 and 3010."
