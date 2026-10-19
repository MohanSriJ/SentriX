@echo off
title SentriX Master Launcher
cd /d "%~dp0"

echo =======================================================
echo          SENTRIX Safe-Node Platform Launcher
echo          Sense. Predict. Respond.
echo =======================================================
echo.

echo [1/3] Launching FastAPI Backend Window (Port 8000)...
start "SentriX Backend (Port 8000)" cmd.exe /k ""%~dp0scripts\windows\run_backend.bat""

echo Waiting 3 seconds for backend to initialize...
ping 127.0.0.1 -n 4 >nul

echo [2/3] Launching Vite Frontend Window (Port 5173)...
start "SentriX Frontend (Port 5173)" cmd.exe /k ""%~dp0scripts\windows\run_frontend.bat""

echo Waiting 3 seconds for frontend to initialize...
ping 127.0.0.1 -n 4 >nul

echo [3/3] Launching Public Ngrok Tunnel Window...
start "SentriX Public Tunnel" cmd.exe /k ""%~dp0scripts\windows\run_tunnel.bat""

echo.
echo =======================================================
echo   ALL 3 SERVICES HAVE BEEN LAUNCHED!
echo.
echo   Local Dashboard:   http://127.0.0.1:5173
echo   Local Backend API: http://127.0.0.1:8000
echo   Local API Docs:    http://127.0.0.1:8000/docs
echo.
echo   Keep the 3 spawned command prompt windows OPEN.
echo   You can safely close this master launcher window now.
echo =======================================================
echo.
pause
