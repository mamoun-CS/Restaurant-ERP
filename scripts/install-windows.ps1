# ==============================================================================
# Sheikh Al Kar Restaurant ERP - Windows Auto-Start Installer
# Registers Windows Task Scheduler jobs to start the ERP and Print Agent at logon
# with automatic restart on failure.
# ==============================================================================

param(
    [string]$ErpPort = "3000",
    [switch]$Uninstall
)

$ErrorActionPreference = "Stop"

$workspaceDir = Resolve-Path (Join-Path $PSScriptRoot "..")
$nodeExe = (Get-Command node).Source

if (-not $nodeExe) {
    Write-Error "Node.js was not found in PATH. Please install Node.js 20 LTS first."
    exit 1
}

$erpTaskName = "SheikhAlKar_ERP_App"
$agentTaskName = "SheikhAlKar_Print_Agent"

if ($Uninstall) {
    Write-Host "Removing Windows scheduled tasks..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $erpTaskName -Confirm:$false -ErrorAction SilentlyContinue
    Unregister-ScheduledTask -TaskName $agentTaskName -Confirm:$false -ErrorAction SilentlyContinue
    Write-Host "Tasks removed successfully." -ForegroundColor Green
    exit 0
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Installing Sheikh Al Kar Windows Auto-Start Services     " -ForegroundColor Cyan
Write-Host " Workspace: $workspaceDir                                  " -ForegroundColor Cyan
Write-Host " Node:      $nodeExe                                       " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Register Next.js ERP Task
$erpAction = New-ScheduledTaskAction -Execute "$nodeExe" `
    -Argument "server.js" `
    -WorkingDirectory "$workspaceDir"

$agentAction = New-ScheduledTaskAction -Execute "$nodeExe" `
    -Argument "print-agent/dist/cli.js run" `
    -WorkingDirectory "$workspaceDir"

$trigger = New-ScheduledTaskTrigger -AtLogOn
$principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive -RunLevel Highest

# Settings: restart on failure, run indefinitely
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RestartCount 3 `
    -RestartInterval (New-TimeSpan -Minutes 1) `
    -ExecutionTimeLimit (New-TimeSpan -Days 0)

# Unregister old tasks if exist
Unregister-ScheduledTask -TaskName $erpTaskName -Confirm:$false -ErrorAction SilentlyContinue
Unregister-ScheduledTask -TaskName $agentTaskName -Confirm:$false -ErrorAction SilentlyContinue

# Register new tasks
Register-ScheduledTask -TaskName $erpTaskName -Action $erpAction -Trigger $trigger -Principal $principal -Settings $settings | Out-Null
Write-Host "✓ Registered ERP Task: $erpTaskName" -ForegroundColor Green

Register-ScheduledTask -TaskName $agentTaskName -Action $agentAction -Trigger $trigger -Principal $principal -Settings $settings | Out-Null
Write-Host "✓ Registered Print Agent Task: $agentTaskName" -ForegroundColor Green

Write-Host "`nAuto-start setup complete! Both services will run automatically on Windows logon." -ForegroundColor Green
Write-Host "To start immediately, run: .\scripts\start-all.bat" -ForegroundColor Cyan
