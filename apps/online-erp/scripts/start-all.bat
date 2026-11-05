@echo off
title Sheikh Al Kar ERP - Launcher
echo ========================================================
echo   Starting Sheikh Al Kar Restaurant ERP + Print Agent
echo ========================================================

cd /d "%~dp0\.."

echo [1/2] Starting Local ERP Server...
if exist server.js (
    start "Sheikh Al Kar ERP (Next.js)" cmd /c "node server.js"
) else (
    start "Sheikh Al Kar ERP (Next.js)" cmd /c "npm run start"
)

timeout /t 3 /nobreak >nul

echo [2/2] Starting Print Agent Daemon...
start "Sheikh Al Kar Print Agent" cmd /c "node print-agent/dist/cli.js run"

echo.
echo Both services launched in separate background consoles.
echo - ERP Application: http://localhost:3000
echo - Print Agent Status: http://127.0.0.1:4099/health
echo.
pause
