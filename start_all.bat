@echo off
echo =========================================================================
echo  CRISIS-AI: Disaster Response & Resource Allocation System
echo =========================================================================
echo Starting Backend and Frontend simultaneously...
echo.

start "CRISIS-AI Backend (FastAPI)" cmd /k "%~dp0run_backend.bat"
timeout /t 2 /nobreak >nul
start "CRISIS-AI Frontend (Vite)" cmd /k "%~dp0run_frontend.bat"

echo.
echo Both servers launched!
echo - Frontend URL: http://localhost:5173
echo - Backend API Docs: http://localhost:8000/docs
echo =========================================================================
