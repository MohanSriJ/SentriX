@echo off
title SentriX Frontend (Port 5173)
cd /d "%~dp0frontend"
set "PATH=C:\Program Files\nodejs;%PATH%"

echo =======================================================
echo           SENTRIX - Vite React Frontend
echo           Sense. Predict. Respond.
echo =======================================================
echo.
echo Starting Vite Dev Server on http://127.0.0.1:5173 ...
echo.

call npm.cmd run dev -- --host 127.0.0.1 --port 5173

echo.
echo Frontend server has stopped.
pause
