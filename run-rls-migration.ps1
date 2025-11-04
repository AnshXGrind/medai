#!/usr/bin/env pwsh
# =====================================================
# SUPABASE RLS MIGRATION RUNNER
# =====================================================
# This script applies Row Level Security policies to your Supabase database
# Run this ONCE after pushing the security commit

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "🔒 SUPABASE RLS MIGRATION" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Check if supabase CLI is installed
$supabaseCli = Get-Command supabase -ErrorAction SilentlyContinue

if ($supabaseCli) {
    Write-Host "✅ Supabase CLI found" -ForegroundColor Green
    Write-Host ""
    Write-Host "Running migration..." -ForegroundColor Yellow
    
    # Apply migration
    supabase db push
    
    Write-Host ""
    Write-Host "✅ Migration complete!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Supabase CLI not installed" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Manual steps:" -ForegroundColor Cyan
    Write-Host "1. Go to: https://app.supabase.com/project/tdfkrllvxlrukdzsiwjd/sql" -ForegroundColor White
    Write-Host "2. Click 'New Query'" -ForegroundColor White
    Write-Host "3. Copy entire file: supabase/migrations/001_enable_rls.sql" -ForegroundColor White
    Write-Host "4. Paste and click 'Run'" -ForegroundColor White
    Write-Host "5. Verify: Should see 'RLS enabled on: patients, health_records...'" -ForegroundColor White
    Write-Host ""
    Write-Host "OR install Supabase CLI:" -ForegroundColor Cyan
    Write-Host "npm install -g supabase" -ForegroundColor White
    Write-Host "supabase login" -ForegroundColor White
    Write-Host "supabase link --project-ref tdfkrllvxlrukdzsiwjd" -ForegroundColor White
    Write-Host "supabase db push" -ForegroundColor White
}

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "Next: Rotate Supabase keys (see DEPLOYMENT_CHECKLIST.md)" -ForegroundColor Yellow
Write-Host "=================================================" -ForegroundColor Cyan
