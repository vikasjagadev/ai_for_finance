Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "Starting StockMind AI Vite Frontend Application" -ForegroundColor Green
Write-Host "URL: http://localhost:5173" -ForegroundColor Yellow
Write-Host "===================================================" -ForegroundColor Cyan
Set-Location -Path "$PSScriptRoot\frontend"
& npm.cmd run dev

