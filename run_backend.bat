@echo off
echo ========================================================
echo  CRISIS-AI: Starting FastAPI Backend Server
echo ========================================================
cd /d "%~dp0\backend"
python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload
pause
