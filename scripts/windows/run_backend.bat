@echo off
title SentriX Backend (Port 8000)
cd /d "%~dp0..\.."

echo =======================================================
echo           SENTRIX - FastAPI Backend Server
echo           Sense. Predict. Respond.
echo =======================================================
echo.
echo Starting FastAPI on http://127.0.0.1:8000 ...
echo Interactive API docs at: http://127.0.0.1:8000/docs
echo.

"%~dp0..\..\backend\.venv\Scripts\python.exe" -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload

echo.
echo Backend server has stopped.
pause
