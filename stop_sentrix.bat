@echo off
title Stop SentriX Services
echo ===================================================
echo     Stopping SentriX Background Services...
echo ===================================================

echo Stopping ngrok tunnels...
taskkill /F /IM ngrok.exe 2>nul

echo Stopping Python uvicorn backend...
taskkill /F /FI "WINDOWTITLE eq SentriX Backend*" 2>nul
taskkill /F /IM python.exe 2>nul

echo Stopping Vite frontend dev server...
taskkill /F /FI "WINDOWTITLE eq SentriX Frontend*" 2>nul
taskkill /F /IM node.exe 2>nul

echo.
echo All SentriX services have been stopped.
pause
