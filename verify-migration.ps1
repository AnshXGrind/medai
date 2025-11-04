# Quick Migration Verification Script
# Run this after applying the migration in Supabase

Write-Host "`n🔍 Checking if migration was applied..." -ForegroundColor Cyan

# Set environment variables
$env:VITE_SUPABASE_URL = "https://tdfkrllvxlrukdzsiwjd.supabase.co"
$env:VITE_SUPABASE_ANON_KEY = (Get-Content .env.local | Select-String "VITE_SUPABASE_ANON_KEY").ToString().Split('"')[1]

# Run the check
node check-migration.mjs

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "If you see ✅ above, the migration worked!" -ForegroundColor Green
Write-Host "If you see ❌, please apply it in Supabase." -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

# Wait for user input
Write-Host "Press any key to continue..." -ForegroundColor White
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
