# ⚡ QUICK ACTION CHECKLIST - Security Fixes

## 🚨 DO THESE NOW (5 minutes)

Copy-paste these commands in PowerShell:

```powershell
# 1. Remove .env from git
cd d:\github\medaid-sathi-extract\medaid-sathi-extract
git rm --cached .env
git commit -m "security: Remove .env from repository"

# 2. Create .env.local with secure values
Copy-Item .env.example .env.local

# 3. Generate secure HMAC secret (copy output to .env.local)
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

## 🔑 ROTATE SECRETS (30 minutes)

### Supabase
1. Go to: https://app.supabase.com/project/_/settings/api
2. Click "Reset anon key"
3. Copy new key to `.env.local`

### Google Maps
1. Go to: https://console.cloud.google.com/apis/credentials
2. Delete old API key, create new one
3. Restrict by domain: `yourdomain.com`
4. Copy to `.env.local`

### AADHAAR HMAC
Use the generated 64-char secret from above ☝️

## 🗄️ RUN DATABASE MIGRATION (10 minutes)

```bash
# Option 1: Supabase CLI
supabase db push

# Option 2: SQL Editor (paste this file)
# Go to: https://app.supabase.com/project/_/sql
# Paste: supabase/migrations/001_enable_rls.sql
```

## ✅ VERIFY (5 minutes)

```powershell
# 1. Check .env not in git
git status  # Should NOT show .env

# 2. Test app runs
npm run dev

# 3. Check CI runs
git push  # GitHub Actions should trigger
```

## 📋 FILES CHANGED

**Modified** (5):
- ✅ `.gitignore` - Added .env patterns
- ✅ `src/lib/secureAadhaar.ts` - HMAC security
- ✅ `.env.example` - Comprehensive template
- ✅ `package.json` - Removed bun references

**Created** (5):
- ✅ `SECURITY.md` - Security policy
- ✅ `SECRET_ROTATION_GUIDE.md` - Rotation steps
- ✅ `SECURITY_AUDIT_FIXES.md` - Implementation summary
- ✅ `.github/workflows/ci.yml` - Security CI
- ✅ `supabase/migrations/001_enable_rls.sql` - RLS policies

**Deleted** (1):
- ✅ `bun.lockb` - Removed for npm standardization

## 🎯 TOTAL TIME: ~50 minutes

---

**DONE?** Read `SECURITY_AUDIT_FIXES.md` for details!
