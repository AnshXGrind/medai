# Apply Supabase Migration Script
# This script applies the Health ID migration to your Supabase database

Write-Host "`n=== Applying Health ID Multi-Factor Migration ===" -ForegroundColor Cyan
Write-Host "Reading environment variables..." -ForegroundColor Yellow

# Read Supabase credentials
$envContent = Get-Content .env.local
$supabaseUrl = ($envContent | Select-String 'VITE_SUPABASE_URL=').ToString().Split('"')[1]
$supabaseKey = ($envContent | Select-String 'VITE_SUPABASE_ANON_KEY=').ToString().Split('"')[1]
$projectId = ($envContent | Select-String 'VITE_SUPABASE_PROJECT_ID=').ToString().Split('"')[1]

Write-Host "Project ID: $projectId" -ForegroundColor White
Write-Host "URL: $supabaseUrl" -ForegroundColor White

# Read migration SQL
Write-Host "`nReading migration file..." -ForegroundColor Yellow
$migrationSql = Get-Content "supabase\migrations\20251103_health_id_multi_factor_verification.sql" -Raw

Write-Host "Migration file loaded ($($migrationSql.Length) characters)" -ForegroundColor Green

# Since we can't execute DDL via the REST API directly, we'll use psql if available
# or provide instructions for manual execution

Write-Host "`n=== Checking for PostgreSQL client (psql) ===" -ForegroundColor Cyan

try {
    $psqlVersion = psql --version 2>&1
    Write-Host "Found: $psqlVersion" -ForegroundColor Green
    
    Write-Host "`nTo apply the migration, you need your database password." -ForegroundColor Yellow
    Write-Host "Get it from: https://app.supabase.com/project/$projectId/settings/database" -ForegroundColor Cyan
    Write-Host "`nThen run:" -ForegroundColor White
    Write-Host "psql -h aws-0-ap-south-1.pooler.supabase.com -p 6543 -d postgres -U postgres.tdfkrllvxlrukdzsiwjd -f supabase\migrations\20251103_health_id_multi_factor_verification.sql" -ForegroundColor Yellow
    
} catch {
    Write-Host "psql not found." -ForegroundColor Red
    
    Write-Host "`nMANUAL MIGRATION REQUIRED" -ForegroundColor Red
    Write-Host "`nSince neither the Supabase CLI (with auth) nor psql are available," -ForegroundColor Yellow
    Write-Host "you need to apply the migration manually:" -ForegroundColor Yellow
    
    Write-Host "`nSTEPS:" -ForegroundColor Cyan
    Write-Host "1. Open: https://app.supabase.com/project/$projectId/editor" -ForegroundColor White
    Write-Host "2. Click 'SQL Editor' in the left sidebar" -ForegroundColor White
    Write-Host "3. Click 'New Query'" -ForegroundColor White
    Write-Host "4. Open this file in VS Code (already open):" -ForegroundColor White
    Write-Host "   supabase\migrations\20251103_health_id_multi_factor_verification.sql" -ForegroundColor Cyan
    Write-Host "5. Select All (Ctrl+A) and Copy (Ctrl+C)" -ForegroundColor White
    Write-Host "6. Paste into Supabase SQL Editor" -ForegroundColor White
    Write-Host "7. Click 'Run' or press Ctrl+Enter" -ForegroundColor White
    Write-Host "8. Wait for 'Success' message" -ForegroundColor White
    Write-Host "9. Verify in Table Editor - profiles - check for new columns:" -ForegroundColor White
    Write-Host "   - health_id_hash, health_id_last_four" -ForegroundColor Cyan
    Write-Host "   - pan_hash, voter_id_hash, etc." -ForegroundColor Cyan
    
    Write-Host "`nAfter migration is applied:" -ForegroundColor Green
    Write-Host "   Go to http://localhost:8081/env-check.html" -ForegroundColor Cyan
    Write-Host "   Click Test Sign Up - it should work!" -ForegroundColor Green
    
    Write-Host "`nOpening the migration file now..." -ForegroundColor Yellow
    Start-Sleep -Seconds 2
    code "supabase\migrations\20251103_health_id_multi_factor_verification.sql"
    
    Write-Host "`nOpening Supabase Dashboard in browser..." -ForegroundColor Yellow
    Start-Sleep -Seconds 1
    Start-Process "https://app.supabase.com/project/$projectId/editor"
}

Write-Host "`n=== Script Complete ===" -ForegroundColor Cyan
