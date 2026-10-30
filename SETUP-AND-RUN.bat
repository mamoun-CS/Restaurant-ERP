@echo off
title Restaurant ERP - First Time Setup
cd /d "%~dp0"
echo Installing dependencies and preparing Restaurant ERP...
where node >nul 2>nul || (echo Install Node.js 20 LTS first: https://nodejs.org/ & pause & exit /b 1)
if not exist node_modules call npm ci || (pause & exit /b 1)
call npx prisma generate || (pause & exit /b 1)
call npx prisma migrate deploy || (pause & exit /b 1)
if not exist .next\standalone\server.js call npm run build || (pause & exit /b 1)
if not exist print-agent\dist\cli.js (
  cd print-agent
  call npm run build || (pause & exit /b 1)
  cd ..
)
call npm run db:seed
echo Registering automatic startup on Windows...
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\install-windows.ps1
call scripts\auto-start-service.bat
