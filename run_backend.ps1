Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "Starting StockMind AI FastAPI Backend Server" -ForegroundColor Green
Write-Host "Base URL: http://localhost:8000" -ForegroundColor Yellow
Write-Host "OpenAPI Docs: http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host "===================================================" -ForegroundColor Cyan
Set-Location -Path "$PSScriptRoot\backend"
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

