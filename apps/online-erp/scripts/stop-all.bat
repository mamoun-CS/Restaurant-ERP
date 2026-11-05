@echo off
title Sheikh Al Kar ERP - Terminator
echo ========================================================
echo   Stopping Sheikh Al Kar ERP + Print Agent Services
echo ========================================================

echo Stopping Print Agent...
taskkill /f /fi "WINDOWTITLE eq Sheikh Al Kar Print Agent*" >nul 2>&1

echo Stopping ERP Server...
taskkill /f /fi "WINDOWTITLE eq Sheikh Al Kar ERP*" >nul 2>&1

echo Done! All services stopped.
timeout /t 2 /nobreak >nul
