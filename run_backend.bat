@echo off
echo ===================================================
echo Starting StockMind AI FastAPI Backend Server
echo Base URL: http://localhost:8000
echo OpenAPI Docs: http://localhost:8000/docs
echo ===================================================
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
pause

