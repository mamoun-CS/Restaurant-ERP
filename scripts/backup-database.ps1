# ══════════════════════════════════════════════════════════════════════════════
# Sheikh Al Kar Restaurant ERP — Automated PostgreSQL Backup (Windows PowerShell)
# ══════════════════════════════════════════════════════════════════════════════
# Usage:
#   powershell -ExecutionPolicy Bypass -File .\scripts\backup-database.ps1
# ══════════════════════════════════════════════════════════════════════════════

$ErrorActionPreference = "Stop"

$ProjectDir = Split-Path -Parent $PSScriptRoot
$BackupDir = Join-Path $ProjectDir "backups"

if (!(Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
}

$Timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
$BackupFile = Join-Path $BackupDir "restaurant_erp_backup_$Timestamp.sql"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " [$(Get-Date)] Starting Restaurant ERP Database Backup..." -ForegroundColor Green
Write-Host " Target file: $BackupFile"
Write-Host "=========================================================="

$ContainerName = "restaurant_erp_db"
$DockerRunning = (docker ps --format '{{.Names}}' 2>$null) -contains $ContainerName

if ($DockerRunning) {
    Write-Host " -> Using Docker container: $ContainerName" -ForegroundColor Yellow
    docker exec $ContainerName pg_dump -U postgres -d restaurant_erp --clean --if-exists > $BackupFile
} else {
    Write-Host " -> Using local pg_dump..." -ForegroundColor Yellow
    $env:PGPASSWORD = if ($env:POSTGRES_PASSWORD) { $env:POSTGRES_PASSWORD } else { "postgres" }
    pg_dump -h localhost -p 5432 -U postgres -d restaurant_erp --clean --if-exists > $BackupFile
}

if ((Test-Path $BackupFile) -and ((Get-Item $BackupFile).Length -gt 0)) {
    $Size = (Get-Item $BackupFile).Length / 1KB
    Write-Host " Backup created successfully! Size: $([Math]::Round($Size, 2)) KB" -ForegroundColor Green
} else {
    Write-Host " ERROR: Backup file failed or is empty!" -ForegroundColor Red
    exit 1
}

# Purge backups older than 7 days
Get-ChildItem -Path $BackupDir -Filter "restaurant_erp_backup_*.sql" | Where-Object {
    $_.LastWriteTime -lt (Get-Date).AddDays(-7)
} | Remove-Item -Force

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " [$(Get-Date)] Backup finished." -ForegroundColor Green
