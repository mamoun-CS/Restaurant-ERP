@echo off
title Restaurant ERP - Auto Recovery & Boot Service
setlocal EnableDelayedExpansion

cd /d "%~dp0\.."

echo ========================================================
echo   Restaurant ERP - Auto-Start & Health Check
echo ========================================================
echo.

:: 1. التحقق من متطلبات التشغيل وبناء المشروع أولاً
where node >nul 2>nul || (echo Node.js 20+ is required. & exit /b 1)
if not exist "node_modules" (
    echo [Dependencies not found, installing...]
    call npm ci || exit /b 1
)
if not exist ".next\standalone\server.js" (
    echo [.next folder not found! Building production bundle...]
    call npm run build || exit /b 1
)

:: 2. فحص قاعدة البيانات وتحديث الجداول تلقائياً إن لزم
echo [1/4] Checking and syncing Database schema...
call npx prisma generate
call npx prisma migrate deploy || exit /b 1

:: 3. تشغيل خادم النظام الرئيسي (ERP Server)
echo [2/4] Starting ERP Web Server (Port 3000)...
start "Restaurant ERP Web Server" /min cmd /c "npm run start"

:: 4. تشغيل وكيل الطابعات المباشر (Print Agent)
echo [3/4] Starting POS Print Agent (Port 4099)...
if not exist "print-agent\dist\cli.js" (
    echo [Print agent build not found, building first...]
    cd print-agent && call npm run build && cd .. || exit /b 1
)
start "Restaurant Print Agent" /min cmd /c "node print-agent/dist/cli.js run"

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
