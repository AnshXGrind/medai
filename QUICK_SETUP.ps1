# Quick Start Script for MedAid Platform
# Run this script to install all dependencies and start all services

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MedAid Platform - Quick Start Setup  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($null -eq $nodeVersion) {
    Write-Host "❌ Node.js is not installed. Please install Node.js 16+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
Write-Host ""

# Get current directory
$rootDir = Get-Location

# Step 1: Install Backend Dependencies
Write-Host "📦 Step 1: Installing Backend Dependencies..." -ForegroundColor Yellow
Set-Location "$rootDir\backend-modules"
if (Test-Path "package.json") {
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Backend dependencies installed successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  Backend package.json not found" -ForegroundColor Red
}
Write-Host ""

# Step 2: Install Web App Dependencies
Write-Host "📦 Step 2: Installing Web App Dependencies..." -ForegroundColor Yellow
Set-Location $rootDir
if (Test-Path "package.json") {
    npm install axios
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Web app dependencies installed successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to install web app dependencies" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  Web package.json not found" -ForegroundColor Red
}
Write-Host ""

# Step 3: Install Mobile App Dependencies
Write-Host "📦 Step 3: Installing Mobile App Dependencies..." -ForegroundColor Yellow
Set-Location "$rootDir\mobile"
if (Test-Path "package.json") {
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Mobile app dependencies installed successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to install mobile app dependencies" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  Mobile package.json not found" -ForegroundColor Red
}
Write-Host ""

# Return to root directory
Set-Location $rootDir

# Display summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Installation Complete! 🎉" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Start Backend API:" -ForegroundColor White
Write-Host "   cd backend-modules" -ForegroundColor Gray
Write-Host "   node server.js" -ForegroundColor Gray
Write-Host "   (Runs on http://localhost:5000)" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Start Web App:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host "   (Runs on http://localhost:5173)" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Start Mobile App:" -ForegroundColor White
Write-Host "   cd mobile" -ForegroundColor Gray
Write-Host "   npm start" -ForegroundColor Gray
Write-Host "   (Scan QR code with Expo Go app)" -ForegroundColor Gray
Write-Host ""
Write-Host "📖 Documentation Files:" -ForegroundColor Yellow
Write-Host "   - MODULE_IMPLEMENTATION_SUMMARY.md (Backend + Web)" -ForegroundColor Gray
Write-Host "   - MOBILE_SETUP_GUIDE.md (Mobile App)" -ForegroundColor Gray
Write-Host "   - COMPLETE_IMPLEMENTATION_SUMMARY.md (Full Overview)" -ForegroundColor Gray
Write-Host ""
Write-Host "🔗 Important URLs:" -ForegroundColor Yellow
Write-Host "   Backend API: http://localhost:5000" -ForegroundColor Gray
Write-Host "   Web App: http://localhost:5173" -ForegroundColor Gray
Write-Host "   Mobile App: Expo Dev Tools" -ForegroundColor Gray
Write-Host ""
Write-Host "✅ Status:" -ForegroundColor Yellow
Write-Host "   Backend: ✅ Complete (5 modules)" -ForegroundColor Green
Write-Host "   Web Modules: 🟡 4/5 complete (UnifiedDashboard pending)" -ForegroundColor Yellow
Write-Host "   Mobile App: ✅ Complete (6 screens)" -ForegroundColor Green
Write-Host ""
Write-Host "Happy Coding! 🚀" -ForegroundColor Cyan
Write-Host ""
