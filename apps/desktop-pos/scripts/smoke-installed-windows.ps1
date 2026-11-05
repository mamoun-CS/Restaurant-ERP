$ErrorActionPreference = "Stop"

$installer = Join-Path $PSScriptRoot "..\release\Restaurant-POS-Setup.exe"
if (-not (Test-Path -LiteralPath $installer)) { throw "Installer artifact not found: $installer" }

$work = Join-Path $env:RUNNER_TEMP "restaurant-pos-installer-smoke"
$installDir = Join-Path $work "installed"
$appData = Join-Path $work "appdata"
New-Item -ItemType Directory -Force -Path $installDir, $appData | Out-Null
$originalAppData = $env:APPDATA
$originalRunAsNode = $env:ELECTRON_RUN_AS_NODE
$appProcess = $null

function Start-InstalledCashier {
  $exe = Join-Path $installDir "Sheikh Al Kar POS.exe"
  if (-not (Test-Path -LiteralPath $exe)) { throw "Installed cashier executable not found: $exe" }
  $script:appProcess = Start-Process -FilePath $exe -PassThru
  Start-Sleep -Seconds 8
  $script:appProcess.Refresh()
  if ($script:appProcess.HasExited) { throw "Installed cashier exited during first-run startup (code $($script:appProcess.ExitCode))." }
  Stop-Process -Id $script:appProcess.Id -Force
  $script:appProcess = $null
  Start-Sleep -Seconds 2
}

function Stop-InstalledCashier {
  $exe = Join-Path $installDir "Sheikh Al Kar POS.exe"
  Get-Process -Name "Sheikh Al Kar POS" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
  if (Test-Path -LiteralPath $exe) {
    Get-CimInstance Win32_Process -Filter "name = 'Sheikh Al Kar POS.exe'" -ErrorAction SilentlyContinue |
      Where-Object { $_.ExecutablePath -eq $exe } |
      ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
  }
  Start-Sleep -Seconds 2
}

try {
  $env:APPDATA = $appData
  Remove-Item Env:ELECTRON_RUN_AS_NODE -ErrorAction SilentlyContinue
  Start-Process -FilePath $installer -ArgumentList @("/S", "/D=$installDir") -Wait
  Stop-InstalledCashier
  Start-InstalledCashier

  $database = Get-ChildItem -LiteralPath $appData -Filter "restaurant-pos.sqlite" -File -Recurse | Select-Object -First 1
  if (-not $database) { throw "The first-run cashier did not create its SQLite database under APPDATA." }
  $databasePath = $database.FullName
  npm run native:verify -- "$databasePath" --write-sentinel
  if ($LASTEXITCODE -ne 0) { throw "Electron could not open the installed SQLite database." }

  # Reinstall the same build as an update simulation and ensure the user's DB survives.
  Start-Process -FilePath $installer -ArgumentList @("/S", "/D=$installDir") -Wait
  Stop-InstalledCashier
  Start-InstalledCashier
  npm run native:verify -- "$databasePath" --assert-sentinel
  if ($LASTEXITCODE -ne 0) { throw "The installer update simulation did not preserve the database sentinel." }

  $uninstaller = Get-ChildItem -LiteralPath $installDir -Filter "*.exe" -File -Recurse | Where-Object { $_.Name -match "uninstall|unins" } | Select-Object -First 1
  if (-not $uninstaller) { throw "NSIS uninstaller was not found." }
  Start-Process -FilePath $uninstaller.FullName -ArgumentList "/S" -Wait
  if (-not (Test-Path -LiteralPath $databasePath)) { throw "Uninstall removed the user SQLite database." }
  npm run native:verify -- "$databasePath" --assert-sentinel
  if ($LASTEXITCODE -ne 0) { throw "SQLite user data did not survive uninstall." }

  Write-Host "PASS: NSIS install, first launch, SQLite creation, reinstall preservation, and uninstall preservation."
} finally {
  if ($appProcess -and -not $appProcess.HasExited) { Stop-Process -Id $appProcess.Id -Force -ErrorAction SilentlyContinue }
  if ($null -eq $originalAppData) { Remove-Item Env:APPDATA -ErrorAction SilentlyContinue } else { $env:APPDATA = $originalAppData }
  if ($null -eq $originalRunAsNode) { Remove-Item Env:ELECTRON_RUN_AS_NODE -ErrorAction SilentlyContinue } else { $env:ELECTRON_RUN_AS_NODE = $originalRunAsNode }
}
