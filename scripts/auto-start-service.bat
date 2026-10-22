@echo off
title Restaurant ERP - Auto Recovery & Boot Service
setlocal EnableDelayedExpansion

cd /d "%~dp0\.."

echo ========================================================
echo   Restaurant ERP - Auto-Start & Health Check
echo ========================================================
echo.

:: 1. التحقق من بناء المشروع أولاً
if not exist ".next" (
    echo [.next folder not found! Building production bundle...]
    call npm run build
)

:: 2. فحص قاعدة البيانات وتحديث الجداول تلقائياً إن لزم
echo [1/4] Checking and syncing Database schema...
call npx prisma generate
call npx prisma db push --skip-generate

:: 3. تشغيل خادم النظام الرئيسي (ERP Server)
echo [2/4] Starting ERP Web Server (Port 3000)...
start "Restaurant ERP Web Server" /min cmd /c "npm run start"

:: 4. تشغيل وكيل الطابعات المباشر (Print Agent)
echo [3/4] Starting POS Print Agent (Port 4099)...
if exist "print-agent\dist\cli.js" (
    start "Restaurant Print Agent" /min cmd /c "node print-agent/dist/cli.js run"
) else (
    echo [Print agent build not found, building first...]
    cd print-agent && call npm run build && cd ..
    start "Restaurant Print Agent" /min cmd /c "node print-agent/dist/cli.js run"
)

:: 5. تشغيل النفق السحابي لجوال المدير إن كان مثبتاً
where cloudflared >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [4/4] Starting Cloudflare Remote Tunnel for Manager Phone...
    start "Cloudflare Tunnel" /min cmd /c "cloudflared tunnel --url http://localhost:3000"
) else (
    echo [4/4] Cloudflared not installed in PATH, skipping remote tunnel.
)

echo.
echo ========================================================
echo   All Restaurant ERP Services are running in background!
echo   Local Address: http://localhost:3000
echo ========================================================
timeout /t 5 >nul
