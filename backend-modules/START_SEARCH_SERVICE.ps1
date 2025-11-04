# MedAid - Python Search Service Setup
# Run this script to set up and start the Python backend

Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "🔍 MedAid Search Service Setup" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Cyan

# Check if Python is installed
Write-Host "`n📌 Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found! Please install Python 3.8+" -ForegroundColor Red
    exit 1
}

# Navigate to backend directory
Write-Host "`n📂 Navigating to backend directory..." -ForegroundColor Yellow
Set-Location backend-modules

# Install requirements
Write-Host "`n📦 Installing Python dependencies..." -ForegroundColor Yellow
Write-Host "Installing: Flask, flask-cors, Werkzeug" -ForegroundColor Cyan
pip install -r requirements.txt

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Start the server
Write-Host "`n" + "=" * 60 -ForegroundColor Cyan
Write-Host "🚀 Starting MedAid Search Service..." -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "`n📡 Server will start on: http://localhost:5000" -ForegroundColor Yellow
Write-Host "📄 Documentation: SEARCH_SERVICE_README.md" -ForegroundColor Yellow
Write-Host "`nPress Ctrl+C to stop the server`n" -ForegroundColor Cyan

python search_service.py
