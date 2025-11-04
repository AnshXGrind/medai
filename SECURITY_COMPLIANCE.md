# Security & Compliance Audit
## MedAid Saarthi Healthcare Platform

**Last Updated**: November 2, 2025  
**Version**: 1.0  
**Auditor**: Internal Review  
**Next Audit**: May 2026

---

## 🛡️ Current Security Posture

### ✅ What's Already Secure

#### 1. Aadhaar Handling (Excellent)
```
✅ Never stores raw Aadhaar numbers
✅ One-way SHA-256 hashing
✅ Only stores last 4 digits for display
✅ Audit logging for all Aadhaar access
✅ Anonymous health mode option
```

**Implementation**: `src/lib/secureAadhaar.ts`

**Evidence**:
```sql
-- Database schema (supabase/migrations/20251102_zero_aadhaar_storage.sql)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS aadhaar_last_four TEXT,  -- Display only
ADD COLUMN IF NOT EXISTS aadhaar_hash TEXT,        -- Verification only
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT FALSE;
```

#### 2. Authentication & Authorization
```
✅ Supabase Auth (industry standard)
✅ Row Level Security (RLS) policies
✅ Role-based access (patient/doctor)
✅ Secure session management
```

#### 3. Data Encryption
```
✅ HTTPS/TLS in transit
✅ Supabase encryption at rest (default)
✅ Secure password hashing (bcrypt via Supabase)
```

#### 4. Storage Security
```
✅ Supabase Storage with access policies
✅ Authenticated upload only
✅ Public read with bucket isolation
✅ File type validation
```

---

## ⚠️ Security Gaps & Remediation

### 1. Missing Privacy Policy ❌
**Risk**: Legal compliance issue (DPDP Act violation)  
**Impact**: High  
**Effort**: Low  

**Action**: Create `/privacy-policy` page

**Template Content**:
```markdown
# Privacy Policy

## Data We Collect
- Personal: Name, email, phone, Aadhaar (hashed)
- Health: Medical records, prescriptions, consultation notes
- Technical: IP address, device info, usage logs

## How We Use It
- Provide healthcare services
- Connect you with doctors
- Improve AI recommendations
- Comply with legal requirements

## Data Sharing
- Only with doctors you explicitly choose
- Never sold to third parties
- Government requests (with legal notice)

## Your Rights
- Access your data
- Correct inaccurate data
- Delete your account
- Export your records

## Security Measures
- Encryption in transit and at rest
- Regular security audits
- Access logging
- Multi-factor authentication (coming soon)

## Contact
For privacy concerns: privacy@medaid.in
Data Protection Officer: [Your Name]
```

**Due Date**: This week

---

### 2. No Two-Factor Authentication (2FA) ❌
**Risk**: Account takeover attacks  
**Impact**: High  
**Effort**: Medium  

**Implementation Plan**:
```typescript
// Add to src/hooks/useAuth.tsx

// 1. Enable MFA in Supabase
const enableMFA = async () => {
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
    friendlyName: 'MedAid 2FA'
  });
  
  // Show QR code to user
  return data.totp.qr_code;
};

// 2. Verify MFA on login
const verifyMFA = async (code: string) => {
  const { data, error } = await supabase.auth.mfa.verify({
    factorId: factors[0].id,
    code: code
  });
};
```

**Due Date**: Month 2

---

### 3. Session Timeout Not Configured ❌
**Risk**: Unattended device access  
**Impact**: Medium  
**Effort**: Low  

**Fix**:
```typescript
// Add to src/App.tsx or main.tsx

let inactivityTimer: NodeJS.Timeout;

const resetTimer = () => {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(async () => {
    await supabase.auth.signOut();
    toast.info("Session expired due to inactivity");
    navigate("/auth");
  }, 30 * 60 * 1000); // 30 minutes
};

// Track user activity
['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
  document.addEventListener(event, resetTimer, true);
});
```

**Due Date**: Month 1

---

### 4. No Rate Limiting ❌
**Risk**: Brute force attacks, API abuse  
**Impact**: Medium  
**Effort**: Medium  

**Fix**:
```sql
-- Add to Supabase Edge Function or use Supabase's built-in rate limiting

CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 0,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, endpoint, window_start)
);

-- Function to check rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_endpoint TEXT,
  p_limit INTEGER DEFAULT 100,
  p_window INTEGER DEFAULT 3600 -- 1 hour in seconds
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Count requests in current window
  SELECT COALESCE(SUM(request_count), 0) INTO v_count
  FROM public.rate_limits
  WHERE user_id = auth.uid()
    AND endpoint = p_endpoint
    AND window_start > NOW() - (p_window || ' seconds')::INTERVAL;
  
  IF v_count >= p_limit THEN
    RETURN FALSE; -- Rate limit exceeded
  END IF;
  
  -- Increment counter
  INSERT INTO public.rate_limits (user_id, endpoint, request_count)
  VALUES (auth.uid(), p_endpoint, 1)
  ON CONFLICT (user_id, endpoint, window_start)
  DO UPDATE SET request_count = rate_limits.request_count + 1;
  
  RETURN TRUE;
END;
$$;
```

**Due Date**: Month 2

---

### 5. Error Messages Leak Information ⚠️
**Risk**: Information disclosure  
**Impact**: Low  
**Effort**: Low  

**Current Issue**:
```typescript
// Bad: Reveals whether email exists
toast.error("Email not found in database");

// Good: Generic message
toast.error("Invalid email or password");
```

**Fix**: Review all error messages, make them generic

**Due Date**: Month 1

---

### 6. No Content Security Policy (CSP) ❌
**Risk**: XSS attacks  
**Impact**: Medium  
**Effort**: Low  

**Fix**: Add to `index.html`
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' 'unsafe-eval'; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: https:; 
               font-src 'self' data:; 
               connect-src 'self' https://*.supabase.co https://api.openai.com;">
```

**Due Date**: This week

---

### 7. No Input Validation on Backend ⚠️
**Risk**: SQL injection, data corruption  
**Impact**: High  
**Effort**: Medium  

**Current**: Only client-side validation  
**Needed**: Server-side validation

**Fix**: Add Supabase Edge Functions with validation
```typescript
// Example: supabase/functions/validate-consultation/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts";

const consultationSchema = z.object({
  symptoms: z.string().min(10).max(5000),
  priority: z.enum(['low', 'medium', 'high']),
  patient_id: z.string().uuid()
});

serve(async (req) => {
  try {
    const body = await req.json();
    const validated = consultationSchema.parse(body);
    
    // Proceed with database insert
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Invalid input" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
});
```

**Due Date**: Month 2

---

### 8. No Security Headers ❌
**Risk**: Various attacks (clickjacking, MIME sniffing)  
**Impact**: Medium  
**Effort**: Low  

**Fix**: Add to `netlify.toml` or `vercel.json`
```toml
# netlify.toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "geolocation=(self), microphone=(self), camera=(self)"
```

**Due Date**: This week

---

## 📋 DPDP Act 2023 Compliance Checklist

### Data Fiduciary Obligations

| Requirement | Status | Evidence |
|-------------|--------|----------|
| **1. Lawful purpose** | ✅ | Healthcare services (legitimate purpose) |
| **2. Data minimization** | ✅ | Only collect necessary fields |
| **3. Data accuracy** | ⚠️ | Need user profile update feature |
| **4. Storage limitation** | ❌ | No retention policy defined |
| **5. Reasonable security** | ✅ | Encryption, RLS, audit logs |
| **6. Transparency** | ❌ | Privacy policy missing |
| **7. Data Principal rights** | ⚠️ | Partial (can delete account, but no data export) |

### Actions Required

1. **Add Privacy Policy** (This week)
   - Template provided above
   - Add link in footer
   - Require acceptance on signup

2. **Implement Data Retention Policy** (Month 1)
   ```sql
   -- Auto-delete old consultation records after 7 years
   CREATE OR REPLACE FUNCTION delete_old_consultations()
   RETURNS void AS $$
   BEGIN
     DELETE FROM public.consultations
     WHERE created_at < NOW() - INTERVAL '7 years';
   END;
   $$ LANGUAGE plpgsql;
   
   -- Run daily
   SELECT cron.schedule('delete-old-data', '0 2 * * *', 'SELECT delete_old_consultations()');
   ```

3. **Add Data Export Feature** (Month 2)
   ```typescript
   // Add to PatientDashboard
   const exportMyData = async () => {
     const { data, error } = await supabase
       .from('profiles')
       .select('*, consultations(*), health_records(*)')
       .eq('id', user.id)
       .single();
     
     const blob = new Blob([JSON.stringify(data, null, 2)], {
       type: 'application/json'
     });
     const url = URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = `medaid-data-${Date.now()}.json`;
     a.click();
   };
   ```

4. **Appoint Data Protection Officer** (This week)
   - Add to footer: "DPO: [Your Name] | dpo@medaid.in"
   - Create email alias if needed

---

## 🔍 Security Audit Checklist

### Authentication & Session Management
- [x] Secure password storage (Supabase bcrypt)
- [x] Session tokens secure (httpOnly cookies)
- [ ] Two-factor authentication (2FA)
- [ ] Session timeout (30 min inactivity)
- [ ] Password reset secure (email link)
- [ ] Account lockout after failed attempts

### Authorization & Access Control
- [x] Role-based access control (RBAC)
- [x] Row-level security (RLS)
- [x] Principle of least privilege
- [ ] API endpoint authorization
- [ ] File upload permissions validated

### Data Protection
- [x] Encryption in transit (HTTPS/TLS)
- [x] Encryption at rest (Supabase default)
- [x] Sensitive data hashed (Aadhaar)
- [ ] PII tokenization (for analytics)
- [ ] Secure key management
- [x] Data backup (Supabase automatic)

### Input Validation & Sanitization
- [x] Client-side validation
- [ ] Server-side validation
- [ ] SQL injection prevention (using Supabase client - safe)
- [ ] XSS prevention (React escapes by default - safe)
- [ ] File upload validation
- [ ] CSRF protection (Supabase handles)

### Logging & Monitoring
- [x] Audit trail for Aadhaar access
- [ ] Security event logging
- [ ] Error logging (without PII)
- [ ] Real-time alerts (for attacks)
- [ ] Log retention policy (90 days)

### Infrastructure Security
- [x] HTTPS enforced
- [ ] Security headers (CSP, X-Frame-Options, etc.)
- [ ] DDoS protection (Cloudflare)
- [ ] Regular dependency updates
- [ ] Vulnerability scanning

### Compliance & Legal
- [ ] Privacy policy published
- [ ] Terms of service
- [ ] Cookie consent (if using cookies)
- [ ] Data processing agreement (with Supabase)
- [ ] DPDP Act compliance documented
- [ ] Security incident response plan

---

## 🚨 Incident Response Plan

### 1. Data Breach Response

**If raw Aadhaar numbers are exposed** (Currently impossible with your architecture, but plan anyway):

1. **Immediate** (0-1 hour):
   - Shut down affected systems
   - Preserve evidence (logs, snapshots)
   - Notify CTO/CEO (you)

2. **Short-term** (1-24 hours):
   - Assess scope (how many users affected)
   - Notify affected users via email
   - Notify authorities (CERT-In, Police if criminal)
   - Engage security consultant

3. **Long-term** (24+ hours):
   - Investigate root cause
   - Implement fixes
   - Conduct post-mortem
   - Update security policies
   - Offer credit monitoring to affected users (if financial impact)

### 2. Security Contact
- **Email**: security@medaid.in (create alias)
- **Response SLA**: 24 hours for critical, 72 hours for non-critical
- **Bug Bounty**: Consider in future (HackerOne, Bugcrowd)

---

## 📊 Security Metrics (KPIs)

### Track Monthly

| Metric | Target | Current |
|--------|--------|---------|
| Failed login attempts | < 100 | TBD |
| Data access anomalies | 0 | TBD |
| Unpatched vulnerabilities | 0 | TBD |
| Security incidents | 0 | TBD |
| Average response time | < 24h | TBD |

### Tools Needed

1. **Monitoring**: Set up Sentry (free tier)
   ```bash
   npm install @sentry/react
   ```

2. **Dependency Scanning**: GitHub Dependabot (free)
   - Already enabled if GitHub repo is public

3. **SAST (Static Analysis)**: Snyk (free for open source)
   ```bash
   npm install -g snyk
   snyk test
   ```

---

## ✅ 30-Day Security Sprint

### Week 1: Quick Wins
- [ ] Add privacy policy page
- [ ] Add security headers (netlify.toml)
- [ ] Add CSP meta tag
- [ ] Fix generic error messages
- [ ] Set up Sentry error tracking

### Week 2: Authentication
- [ ] Implement session timeout
- [ ] Add password strength meter
- [ ] Enable email verification (Supabase setting)
- [ ] Test 2FA (Supabase has built-in support)

### Week 3: Validation & Logging
- [ ] Add server-side validation (Edge Functions)
- [ ] Extend audit logging (all CRUD operations)
- [ ] Set up log retention policy
- [ ] Add rate limiting

### Week 4: Documentation & Compliance
- [ ] Document security measures (for ABDM)
- [ ] Create incident response runbook
- [ ] Write data retention policy
- [ ] Add data export feature

---

## 💰 Budget Estimation

### Free/Low Cost

| Item | Cost | Priority |
|------|------|----------|
| Privacy policy (DIY template) | ₹0 | High |
| Security headers | ₹0 | High |
| Sentry (error tracking) | ₹0 (< 5k events/month) | High |
| Snyk (dependency scanning) | ₹0 (open source) | Medium |
| Supabase 2FA | ₹0 (included) | High |

### Paid (Future)

| Item | Cost | Priority |
|------|------|----------|
| External security audit | ₹50k-2L | High (before gov partnership) |
| ISO 27001 certification | ₹2-5L | Medium (later) |
| Penetration testing | ₹1-3L | Medium |
| DDoS protection (Cloudflare Pro) | $20/month | Low (if needed) |
| Bug bounty program | Variable | Low (later) |

---

## 📞 Next Steps

This week (20 min/day):
1. [ ] Copy privacy policy template, customize for MedAid
2. [ ] Add privacy policy page to app
3. [ ] Add link in footer and signup flow
4. [ ] Add security headers to deployment config
5. [ ] Set up Sentry account
6. [ ] Run `npm audit` and fix any critical vulnerabilities
7. [ ] Document current security measures (for ABDM audit)

**Target**: Have privacy policy live + security headers deployed by end of week.

---

**Remember**: Security is ongoing, not one-time. Schedule monthly security reviews (1 hour) to stay up-to-date.
