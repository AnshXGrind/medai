# Universal Health ID Platform - Quick Setup Script
# Run this script to set up the Universal Health ID system

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  UNIVERSAL HEALTH ID PLATFORM SETUP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js 18+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green

# Check if npm is available
Write-Host "Checking npm installation..." -ForegroundColor Yellow
$npmVersion = npm --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm is not installed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
Write-Host ""

# Check if .env file exists
Write-Host "Checking environment configuration..." -ForegroundColor Yellow
if (-Not (Test-Path ".env")) {
    Write-Host "⚠️  .env file not found!" -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Write-Host "Creating .env from .env.example..." -ForegroundColor Yellow
        Copy-Item ".env.example" ".env"
        Write-Host "✅ .env file created" -ForegroundColor Green
        Write-Host "⚠️  Please edit .env and add your Supabase credentials!" -ForegroundColor Yellow
        Write-Host ""
    } else {
        Write-Host "❌ .env.example not found!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ .env file exists" -ForegroundColor Green
}

# Check if node_modules exists
Write-Host ""
Write-Host "Checking dependencies..." -ForegroundColor Yellow
if (-Not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies (this may take a few minutes)..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
    Write-Host "   Run 'npm install' if you need to update" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MIGRATION OPTIONS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "The database migration needs to be applied to Supabase." -ForegroundColor White
Write-Host ""
Write-Host "Choose an option:" -ForegroundColor Yellow
Write-Host "  1. Apply migration using Supabase CLI (recommended)" -ForegroundColor White
Write-Host "  2. Manual setup (copy SQL to Supabase Dashboard)" -ForegroundColor White
Write-Host "  3. Skip migration for now" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-3)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "Checking for Supabase CLI..." -ForegroundColor Yellow
        $supabaseVersion = supabase --version 2>$null
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Supabase CLI not found!" -ForegroundColor Red
            Write-Host ""
            Write-Host "Install Supabase CLI with:" -ForegroundColor Yellow
            Write-Host "  npm install -g supabase" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "Then run this script again or use option 2 (Manual setup)" -ForegroundColor Yellow
            exit 1
        }
        Write-Host "✅ Supabase CLI found: $supabaseVersion" -ForegroundColor Green
        Write-Host ""
        Write-Host "Applying migration..." -ForegroundColor Yellow
        supabase db push
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Migration applied successfully!" -ForegroundColor Green
        } else {
            Write-Host "❌ Migration failed!" -ForegroundColor Red
            Write-Host "Try option 2 (Manual setup) instead" -ForegroundColor Yellow
        }
    }
    "2" {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "  MANUAL MIGRATION SETUP" -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Follow these steps:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "1. Open your Supabase Dashboard" -ForegroundColor White
        Write-Host "   https://app.supabase.com" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "2. Go to SQL Editor" -ForegroundColor White
        Write-Host ""
        Write-Host "3. Open this file:" -ForegroundColor White
        Write-Host "   supabase/migrations/20251104_universal_health_id_system.sql" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "4. Copy the entire contents and paste into SQL Editor" -ForegroundColor White
        Write-Host ""
        Write-Host "5. Click 'Run' to execute the migration" -ForegroundColor White
        Write-Host ""
        Write-Host "6. Verify tables are created in the Table Editor" -ForegroundColor White
        Write-Host ""
        
        # Try to open the file in default editor
        $migrationFile = "supabase\migrations\20251104_universal_health_id_system.sql"
        if (Test-Path $migrationFile) {
            Write-Host "Would you like to open the migration file now? (y/n): " -ForegroundColor Yellow -NoNewline
            $openFile = Read-Host
            if ($openFile -eq "y" -or $openFile -eq "Y") {
                Start-Process $migrationFile
                Write-Host "✅ Migration file opened in default editor" -ForegroundColor Green
            }
        }
    }
    "3" {
        Write-Host ""
        Write-Host "⚠️  Skipping migration" -ForegroundColor Yellow
        Write-Host "Remember to apply the migration before using the app!" -ForegroundColor Yellow
    }
    default {
        Write-Host ""
        Write-Host "❌ Invalid choice!" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SETUP COMPLETE!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Ensure your .env file has correct Supabase credentials" -ForegroundColor White
Write-Host "   VITE_SUPABASE_URL=your_url" -ForegroundColor Gray
Write-Host "   VITE_SUPABASE_ANON_KEY=your_key" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Start the development server:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Open your browser:" -ForegroundColor White
Write-Host "   http://localhost:8081" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Create your first Health ID:" -ForegroundColor White
Write-Host "   Navigate to /create-health-id" -ForegroundColor Cyan
Write-Host ""
Write-Host "📖 For detailed documentation, see:" -ForegroundColor Yellow
Write-Host "   README_UNIVERSAL_HEALTH_ID.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 Universal Health ID Platform is ready!" -ForegroundColor Green
Write-Host ""

# Ask if user wants to start dev server now
Write-Host "Would you like to start the development server now? (y/n): " -ForegroundColor Yellow -NoNewline
$startServer = Read-Host

if ($startServer -eq "y" -or $startServer -eq "Y") {
    Write-Host ""
    Write-Host "Starting development server..." -ForegroundColor Green
    Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
    Write-Host ""
    npm run dev
} else {
    Write-Host ""
    Write-Host "You can start the server later with:" -ForegroundColor Yellow
    Write-Host "  npm run dev" -ForegroundColor Cyan
    Write-Host ""
}
