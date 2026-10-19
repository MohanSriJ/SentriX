@echo off
title SentriX Public Ngrok Tunnel
cd /d "%~dp0..\.."
set "PATH=C:\Users\mohan\AppData\Local\Microsoft\WindowsApps;%PATH%"

echo =======================================================
echo           SENTRIX - Public Ngrok Tunnel
echo           Forwarding to: http://localhost:5173
echo =======================================================
echo.
echo Starting Ngrok Tunnel to Port 5173...
echo.

ngrok http 5173

echo.
echo Ngrok tunnel has stopped.
pause
