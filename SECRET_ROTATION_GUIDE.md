# 🔒 SECRET ROTATION GUIDE - IMMEDIATE ACTION REQUIRED

## ⚠️ Critical: If `.env` was committed to repo

The `.env` file was previously in the repository. **ALL secrets in it are now compromised** and must be rotated immediately.

---

## 🚨 Step 1: Remove `.env` from Git History

### Quick Method (if recent)
```powershell
# Remove from staging
git rm --cached .env

# Commit removal
git commit -m "Remove .env from repository"

# Force push (if already pushed to GitHub)
git push origin main --force
```

### Deep Clean (if in git history)
```powershell
# Install BFG Repo Cleaner
# Download from: https://rtyley.github.io/bfg-repo-cleaner/

# Clone a fresh copy
git clone --mirror https://github.com/YourUsername/medaid-sathi-extract.git

# Remove .env from all commits
java -jar bfg.jar --delete-files .env medaid-sathi-extract.git

# Clean up
cd medaid-sathi-extract.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push
git push --force
```

---

## 🔑 Step 2: Rotate ALL Secrets

### A. Supabase Keys

1. **Go to**: [Supabase Dashboard](https://app.supabase.com/project/_/settings/api)
2. **Rotate**: Project API Keys
   - Click "Reset anon key" (safe - only affects new clients)
   - **DO NOT reset service_role key** unless absolutely necessary (breaks all backend)
3. **Update**:
   - `.env.local` (new keys)
   - Vercel/Netlify environment variables
   - Any CI/CD secrets

**Test**: After rotation, test login/signup flows

### B. Google Maps API Key

1. **Go to**: [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. **Rotate**:
   - Delete compromised API key
   - Create new API key
3. **Restrict**:
   - API restrictions: Maps JavaScript API, Places API, Geocoding API
   - Application restrictions: HTTP referrers
   - Add authorized domains: `yourdomain.com`, `*.yourdomain.com`
4. **Update**: `.env.local` and deployment platform

**Test**: Open `/doctors` page and verify map loads

### C. AADHAAR HMAC Secret

**CRITICAL**: This is the most sensitive secret!

1. **Generate new secret**:
```powershell
# PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

2. **Migration required**:
   - Old HMAC hashes won't match with new secret
   - Options:
     - **Option A**: Re-verify all users (ask them to input Aadhaar again)
     - **Option B**: Store both old & new secrets temporarily, try both for verification
     - **Option C**: Mark accounts for re-verification

3. **Update**:
   - `.env.local`: `VITE_AADHAAR_HMAC_SECRET=<new-secret>`
   - Production secret store (Vercel/AWS KMS)

**Test**: Create test patient with Aadhaar, verify login works

### D. NDHM/ABHA Credentials

1. **Contact**: NDHM support (support@nha.gov.in)
2. **Request**: Credential rotation (provide incident details)
3. **Wait**: 2-5 business days for new credentials
4. **Update**: `.env.local` and production

**Test**: ABHA authentication flow

### E. Database Credentials (if any)

If you have direct PostgreSQL credentials:

1. **Supabase Dashboard** → Settings → Database
2. Reset database password
3. Update connection strings in:
   - Backend services
   - CI/CD pipelines
   - Migration tools

---

## 🛡️ Step 3: Prevent Future Leaks

### Update `.gitignore`

Already done in this PR - verify:

```gitignore
# Environment variables
.env
.env.local
.env.*.local
.env.production
```

### Install git-secrets

```powershell
# Install via scoop
scoop install git-secrets

# Setup for repo
cd d:\github\medaid-sathi-extract\medaid-sathi-extract
git secrets --install
git secrets --register-aws
git secrets --add 'VITE_[A-Z_]+=[^\\s]+'
```

### Pre-commit Hook

Create `.husky/pre-commit`:
```bash
#!/bin/sh
# Check for secrets before commit
if git diff --cached --name-only | grep -q '.env$'; then
  echo "🚨 ERROR: Attempting to commit .env file!"
  echo "Please remove .env from staging: git reset HEAD .env"
  exit 1
fi
```

---

## 📋 Rotation Checklist

Use this checklist to track rotation progress:

### Immediate (24 hours)
- [ ] `.env` removed from git history
- [ ] GitHub repo access reviewed (remove unauthorized users)
- [ ] Supabase anon key rotated
- [ ] Google Maps API key rotated & restricted
- [ ] AADHAAR HMAC secret rotated
- [ ] Service role key rotated (if exposed)

### Short-term (7 days)
- [ ] NDHM credentials rotated (request submitted)
- [ ] Database password changed
- [ ] Audit logs reviewed for suspicious activity
- [ ] User re-verification flow implemented (for Aadhaar)

### Long-term (30 days)
- [ ] git-secrets installed on all developer machines
- [ ] Pre-commit hooks enabled
- [ ] Secret scanning in CI/CD (GitHub Actions)
- [ ] Security audit completed
- [ ] Post-incident review documented

---

## 🔍 Check for Unauthorized Access

### Supabase Logs
1. Dashboard → Logs → API Logs
2. Look for:
   - Unusual IP addresses
   - High request volumes
   - Failed authentication attempts
3. If suspicious: Reset service role key

### Google Cloud Audit
1. [Google Cloud Console](https://console.cloud.google.com/apis/api/maps-backend.googleapis.com/quotas)
2. Check Maps API usage spikes
3. Review billing alerts

### Database Activity
```sql
-- Check recent logins
SELECT * FROM auth.audit_log_entries
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC
LIMIT 100;

-- Check unusual data access
SELECT * FROM public.patients
WHERE updated_at > NOW() - INTERVAL '7 days'
ORDER BY updated_at DESC;
```

---

## 🚨 If Breach Detected

### Immediate Actions
1. **Disable compromised services** (revoke all API keys)
2. **Lock affected user accounts** (reset passwords)
3. **Preserve logs** (download for forensics)
4. **Notify users** (if PII accessed - legal requirement)

### Legal Compliance
- **UIDAI**: Report Aadhaar data breach to UIDAI within 72 hours
- **NDHM**: Notify NDHM security team
- **Users**: Email notification if health data accessed

### Contact
- **Security Team**: security@medaidsathi.com
- **UIDAI Grievance**: complaint@uidai.gov.in
- **NDHM Support**: support@nha.gov.in

---

## ✅ Verification Tests

After rotation, verify system still works:

```bash
# Test Supabase connection
npm run dev
# Open http://localhost:8080
# Try login/signup

# Test Google Maps
# Navigate to /doctors page
# Verify map loads

# Test ABHA integration
# Try ABHA authentication
# Verify health records fetch
```

---

## 📞 Need Help?

**Slack**: #security-incident (if internal)  
**Email**: security@medaidsathi.com  
**Phone**: +91-XXXX-XXXXXX (emergency only)

---

## 📚 References

- [Supabase Security Guide](https://supabase.com/docs/guides/platform/going-into-prod)
- [Google API Key Best Practices](https://cloud.google.com/docs/authentication/api-keys)
- [OWASP Secret Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [UIDAI Data Security Guidelines](https://uidai.gov.in/)

---

**Document Version**: 1.0  
**Last Updated**: November 3, 2025  
**Next Review**: Post-rotation verification
