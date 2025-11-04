# 🚀 Universal Health ID - Quick Reference

## 🎯 Core Concepts

### Health ID Format
```
XX-XXXX-XXXX-XXXX
││  │     │     └─ Random (4 digits)
││  │     └─────── Random (4 digits)  
││  └───────────── District Code (4 digits)
│└──────────────── State Code (2 digits)

Example: 27-3456-7890-1234
```

### State Codes
```typescript
Maharashtra: 27
Delhi: 07
Karnataka: 29
Gujarat: 24
Tamil Nadu: 33
// See STATE_CODES in universalHealthId.ts for all codes
```

## 📦 Core Files

| File | Purpose |
|------|---------|
| `src/lib/universalHealthId.ts` | Health ID utilities & validation |
| `src/lib/pdfExport.ts` | PDF generation functions |
| `src/components/QRCodeGenerator.tsx` | QR code component |
| `src/components/HealthIDCard.tsx` | Digital card component |
| `src/pages/HealthIDProfile.tsx` | Profile page |
| `supabase/migrations/20251104_*.sql` | Database schema |

## 🔧 Common Tasks

### 1. Generate Health ID
```typescript
import { generateHealthId } from '@/lib/universalHealthId';

const healthId = await generateHealthId('27'); // Maharashtra
// Returns: "27-3456-7890-1234"
```

### 2. Validate Health ID
```typescript
import { isValidHealthId, verifyHealthId } from '@/lib/universalHealthId';

// Format check
const isValid = isValidHealthId('27-3456-7890-1234');

// Database check
const result = await verifyHealthId('27-3456-7890-1234');
if (result.exists && result.active) {
  console.log('Valid Health ID!', result.data);
}
```

### 3. Create Health ID in Database
```typescript
import { supabase } from '@/integrations/supabase/client';
import { generateHealthId } from '@/lib/universalHealthId';

const healthId = await generateHealthId('27');

const { data, error } = await supabase
  .from('health_ids')
  .insert({
    user_id: user.id,
    health_id_number: healthId,
    full_name: 'John Doe',
    date_of_birth: '1990-01-01',
    blood_group: 'A+',
    gender: 'male',
    phone_number: '+91-9876543210',
    email: 'john@example.com'
  })
  .select()
  .single();
```

### 4. Generate QR Code
```typescript
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { generateHealthIdQRData } from '@/lib/universalHealthId';

const qrData = generateHealthIdQRData(
  '27-3456-7890-1234',
  'John Doe',
  '1990-01-01'
);

// In component:
<QRCodeGenerator
  value={qrData}
  size={200}
  errorCorrectionLevel="H"
  onDataUrl={(url) => console.log(url)}
/>
```

### 5. Download Health ID Card as PDF
```typescript
import { downloadHealthIDCardAsPDF } from '@/lib/pdfExport';

const cardElement = document.getElementById('health-card');
await downloadHealthIDCardAsPDF(
  cardElement,
  'health-id-27-3456-7890-1234.pdf'
);
```

### 6. Link Family Member
```typescript
const { data, error } = await supabase
  .from('family_members')
  .insert({
    primary_health_id: primaryId,
    member_health_id: memberId,
    relationship: 'spouse',
    consent_given: true,
    consent_date: new Date().toISOString()
  });
```

### 7. Add Vaccination Record
```typescript
const { data, error } = await supabase
  .from('vaccinations')
  .insert({
    health_id: healthIdUuid,
    vaccine_name: 'COVID-19 Covishield',
    dose_number: 1,
    total_doses: 2,
    administered_date: '2024-01-15',
    hospital_name: 'City Hospital',
    doctor_name: 'Dr. Smith',
    batch_number: 'ABC123',
    status: 'completed'
  });
```

### 8. Add Medical Record
```typescript
const { data, error } = await supabase
  .from('medical_records')
  .insert({
    health_id: healthIdUuid,
    record_type: 'consultation',
    disease_name: 'Diabetes Type 2',
    diagnosis_date: '2024-01-15',
    diagnosis: 'High blood sugar levels',
    treatment: 'Metformin 500mg',
    doctor_name: 'Dr. Sharma',
    hospital_name: 'Apollo Hospital',
    status: 'active',
    is_chronic: true
  });
```

### 9. Query Health Records
```typescript
// Get all vaccinations
const { data: vaccinations } = await supabase
  .from('vaccinations')
  .select('*')
  .eq('health_id', healthIdUuid)
  .order('administered_date', { ascending: false });

// Get medical history
const { data: records } = await supabase
  .from('medical_records')
  .select('*')
  .eq('health_id', healthIdUuid)
  .order('diagnosis_date', { ascending: false });

// Get active insurance
const { data: insurance } = await supabase
  .from('insurance_policies')
  .select('*')
  .eq('health_id', healthIdUuid)
  .eq('status', 'active');
```

### 10. Encrypt Aadhaar (Before Storage)
```typescript
// Use existing security module
import { encryptData, decryptData } from '@/config/security';

// Encrypt before storage
const { ciphertext, iv } = await encryptData(aadhaarNumber);

await supabase
  .from('health_ids')
  .update({
    aadhaar_number_encrypted: ciphertext,
    aadhaar_iv: iv
  })
  .eq('id', healthIdUuid);

// Decrypt when needed
const decrypted = await decryptData(ciphertext, iv);
```

## 🎨 UI Components

### Health ID Card
```tsx
import { HealthIDCard } from '@/components/HealthIDCard';

<HealthIDCard
  healthId="27-3456-7890-1234"
  fullName="John Doe"
  dateOfBirth="1990-01-01"
  bloodGroup="A+"
  photoUrl="/path/to/photo.jpg"
  gender="Male"
  address="Mumbai, Maharashtra"
  verified={true}
  organDonor={false}
  issueDate="2024-01-15T00:00:00Z"
/>
```

### QR Code
```tsx
import { QRCodeGenerator } from '@/components/QRCodeGenerator';

<QRCodeGenerator
  value={qrData}
  size={200}
  errorCorrectionLevel="H"
  foregroundColor="#000000"
  backgroundColor="#FFFFFF"
  onDataUrl={(url) => setQrUrl(url)}
/>
```

## 🔒 Security Best Practices

### 1. Never Store Plaintext Aadhaar
```typescript
// ❌ WRONG
aadhaar_number: '1234-5678-9012'

// ✅ CORRECT
aadhaar_number_encrypted: encryptedValue
aadhaar_iv: initializationVector
```

### 2. Use Row Level Security
```sql
-- Already configured in migration
-- Users can only access their own records
CREATE POLICY "Users can view own health ID" ON health_ids
  FOR SELECT USING (auth.uid() = user_id);
```

### 3. Validate Input
```typescript
import { isValidHealthId, isValidAadhaar, isValidBloodGroup } from '@/lib/universalHealthId';

if (!isValidHealthId(healthId)) {
  throw new Error('Invalid Health ID format');
}

if (!isValidAadhaar(aadhaar)) {
  throw new Error('Invalid Aadhaar format');
}

if (!isValidBloodGroup(bloodGroup)) {
  throw new Error('Invalid blood group');
}
```

### 4. Mask Sensitive Data
```typescript
import { maskAadhaar } from '@/lib/universalHealthId';

const masked = maskAadhaar('123456789012');
// Returns: "XXXX XXXX 9012"
```

### 5. Audit Trail
```typescript
// Log every access
await supabase
  .from('audit_logs')
  .insert({
    health_id: healthIdUuid,
    user_id: currentUserId,
    action: 'view_record',
    resource_type: 'medical_record',
    resource_id: recordId,
    ip_address: userIp,
    blockchain_hash: txHash
  });
```

## 🚨 Emergency ICE Mode

### Enable ICE Mode
```typescript
await supabase
  .from('health_ids')
  .update({ ice_mode_enabled: true })
  .eq('id', healthIdUuid);
```

### ICE Mode Public Access
```typescript
// Public can view minimal info when ICE mode enabled
const { data } = await supabase
  .from('health_ids')
  .select('health_id_number, blood_group, emergency_contacts')
  .eq('ice_mode_enabled', true)
  .eq('health_id_number', healthId)
  .single();
```

## 📱 Mobile/PWA Features

### Install as PWA
```typescript
// PWA install prompt is automatic
// See: src/components/PWAInstallPrompt.tsx
```

### Offline Support
```typescript
// Service Worker handles offline caching
// See: public/service-worker.js
```

### Share Health ID
```typescript
if (navigator.share) {
  await navigator.share({
    title: 'My Health ID',
    text: `Health ID: ${healthId}`,
    url: `/health-id/${healthId}`
  });
}
```

## 🌐 API Endpoints (Supabase)

### REST API
```bash
# Get Health ID
GET https://your-project.supabase.co/rest/v1/health_ids?health_id_number=eq.27-3456-7890-1234

# Create Health ID
POST https://your-project.supabase.co/rest/v1/health_ids
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "user_id": "uuid",
  "health_id_number": "27-3456-7890-1234",
  "full_name": "John Doe",
  "date_of_birth": "1990-01-01"
}
```

### GraphQL (If Enabled)
```graphql
query GetHealthID {
  health_idsCollection(filter: { health_id_number: { eq: "27-3456-7890-1234" } }) {
    edges {
      node {
        id
        health_id_number
        full_name
        blood_group
        verified
      }
    }
  }
}
```

## 🐛 Troubleshooting

### Issue: Health ID generation fails
```typescript
// Check Supabase connection
const { data, error } = await supabase.from('health_ids').select('count');
if (error) console.error('Connection error:', error);

// Check uniqueness collision (rare)
// Retry with different state/district code
```

### Issue: QR code not rendering
```typescript
// Ensure qrcode package is installed
// npm install qrcode @types/qrcode

// Check canvas support
const canvas = document.createElement('canvas');
if (!canvas.getContext) {
  console.error('Canvas not supported');
}
```

### Issue: PDF download fails
```typescript
// Ensure html2canvas and jspdf installed
// npm install html2canvas jspdf

// Check element exists
const element = document.getElementById('health-card');
if (!element) {
  console.error('Card element not found');
}
```

### Issue: Types not recognized
```typescript
// Regenerate types from Supabase
// supabase gen types typescript --local > src/integrations/supabase/types.ts

// Or manually add to types.ts
```

## 📊 Database Queries

### Find all family members
```sql
SELECT 
  hm.health_id_number as member_id,
  hm.full_name as member_name,
  fm.relationship
FROM family_members fm
JOIN health_ids hp ON fm.primary_health_id = hp.id
JOIN health_ids hm ON fm.member_health_id = hm.id
WHERE hp.health_id_number = '27-3456-7890-1234';
```

### Vaccination coverage report
```sql
SELECT 
  vaccine_name,
  COUNT(*) as total_doses,
  COUNT(DISTINCT health_id) as unique_patients
FROM vaccinations
WHERE administered_date >= CURRENT_DATE - INTERVAL '1 year'
GROUP BY vaccine_name
ORDER BY total_doses DESC;
```

### Disease outbreak tracking
```sql
SELECT 
  disease_name,
  location->>'state' as state,
  location->>'district' as district,
  total_cases,
  active_cases,
  severity
FROM disease_outbreaks
WHERE status = 'active'
ORDER BY severity DESC, total_cases DESC;
```

## 🎯 Testing

### Unit Tests
```typescript
// src/lib/__tests__/universalHealthId.test.ts
import { generateHealthId, isValidHealthId } from '../universalHealthId';

test('generates valid health ID', async () => {
  const id = await generateHealthId('27');
  expect(isValidHealthId(id)).toBe(true);
});
```

### Integration Tests
```typescript
// Test Health ID creation flow
test('create health ID workflow', async () => {
  const healthId = await generateHealthId('27');
  const { data } = await supabase
    .from('health_ids')
    .insert({ health_id_number: healthId, ... })
    .select()
    .single();
  
  expect(data.health_id_number).toBe(healthId);
});
```

## 📚 Additional Resources

- **Full Documentation**: `README_UNIVERSAL_HEALTH_ID.md`
- **Implementation Summary**: `IMPLEMENTATION_SUMMARY.md`
- **Migration File**: `supabase/migrations/20251104_universal_health_id_system.sql`
- **Setup Script**: `setup-universal-health-id.ps1`

## 🆘 Support

**Common Commands:**
```powershell
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Apply migration
.\setup-universal-health-id.ps1
```

**Environment Variables:**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
VITE_POLYGON_PRIVATE_KEY=your_private_key
```

---

**Quick Links:**
- 🏠 [Home](/)
- 🆔 [Create Health ID](/create-health-id)
- 👤 [View Profile](/health-id/YOUR-ID)
- 📊 [Patient Dashboard](/patient-dashboard)
- 🏥 [Doctor Dashboard](/doctor-dashboard)

**Version:** 1.0.0  
**Last Updated:** November 4, 2025
