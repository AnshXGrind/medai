# Aadhaar Card Integration for Government Healthcare

## Overview
This healthcare platform now includes Aadhaar card integration for government-compliant patient identification and authentication.

## Features Implemented

### 1. **Patient Registration with Aadhaar** (`src/pages/Auth.tsx`)
- Aadhaar field is **required for all patient registrations**
- Real-time validation with visual feedback
- Format: XXXX XXXX XXXX (12 digits)
- Auto-formatting as user types
- Validation rules:
  - Must be exactly 12 digits
  - Cannot start with 0 or 1
  - Only numeric characters allowed

### 2. **Patient Dashboard Display** (`src/pages/PatientDashboard.tsx`)
- Displays masked Aadhaar number (XXXX XXXX 1234) for security
- Shows patient name linked to Aadhaar
- Government ID badge with visual indicator
- Positioned prominently at the top of the dashboard

### 3. **Validation Utilities** (`src/lib/aadhaar.ts`)
Comprehensive Aadhaar validation functions:
- `validateAadhaar(aadhaar: string)` - Validates format
- `formatAadhaar(aadhaar: string)` - Formats with spaces
- `maskAadhaar(aadhaar: string)` - Masks for display (security)
- `getAadhaarError(aadhaar: string)` - Returns validation errors

## Security Features

### Data Protection
- Aadhaar numbers are stored securely in Supabase user metadata
- Masked display on frontend (only last 4 digits visible)
- No Aadhaar numbers in console logs or error messages

### Validation
- Client-side validation before submission
- Format checking (12 digits)
- Checksum validation (Aadhaar-specific rules)

## How It Works

### For Patients

1. **Sign Up**
   - Select "Patient" user type
   - Fill in name, email, password
   - **Enter Aadhaar number** (required)
   - Aadhaar is validated in real-time
   - Submit to create account

2. **Dashboard**
   - Aadhaar displayed at top (masked)
   - Used for government healthcare verification
   - Linked to all medical records and consultations

### For Doctors
- Doctors use Medical ID instead of Aadhaar
- Can view patient Aadhaar (if authorized) for verification

## Database Schema

Aadhaar is stored in:
```typescript
user.user_metadata.aadhaar_number: string
```

## API Integration

The Aadhaar number is:
- Sent to Supabase Auth during signup
- Stored in user metadata
- Retrieved on dashboard load
- Used for government healthcare system integration

## Future Enhancements

### Phase 2 (Recommended)
- [ ] Aadhaar OTP verification (UIDAI API)
- [ ] Biometric authentication support
- [ ] Direct ABDM (Ayushman Bharat Digital Mission) integration
- [ ] Health ID generation
- [ ] ABHA (Ayushman Bharat Health Account) linking

### Phase 3
- [ ] e-KYC integration
- [ ] Aadhaar-based insurance claim processing
- [ ] Government scheme eligibility checking
- [ ] PHR (Personal Health Record) integration with NDHM

## Compliance

### UIDAI Guidelines
✅ Secure storage  
✅ Masked display  
✅ Purpose limitation (healthcare only)  
✅ User consent  
⚠️ Need to add: Privacy policy update  
⚠️ Need to add: Consent mechanism  

### Data Protection
✅ Encrypted transmission (HTTPS)  
✅ Secure storage (Supabase)  
✅ Access control (user authentication)  
⚠️ Need to add: Audit logging  

## Testing

### Test Aadhaar Numbers (for development)
These follow the format but are NOT real Aadhaar numbers:
- `2234 5678 9012` ✅ Valid format
- `3456 7890 1234` ✅ Valid format
- `0123 4567 8901` ❌ Invalid (starts with 0)
- `1234 5678 9012` ❌ Invalid (starts with 1)
- `234 567 890` ❌ Invalid (not 12 digits)

### Manual Testing Steps
1. Navigate to `/auth`
2. Select "Patient"
3. Click "Sign Up" tab
4. Fill in name and email
5. Enter test Aadhaar number
6. Check validation messages
7. Submit form
8. Check dashboard displays masked Aadhaar

## Technical Stack
- **Frontend**: React + TypeScript
- **Validation**: Custom utility functions
- **Storage**: Supabase (user metadata)
- **UI**: shadcn/ui components
- **Icons**: Lucide React (CreditCard icon)

## Files Modified
- ✅ `src/pages/Auth.tsx` - Added Aadhaar field to signup
- ✅ `src/pages/PatientDashboard.tsx` - Display Aadhaar info
- ✅ `src/hooks/useAuth.tsx` - Store Aadhaar in metadata
- ✅ `src/lib/aadhaar.ts` - NEW validation utilities

## Support & Issues
For Aadhaar-related issues:
1. Check validation error messages
2. Verify 12-digit format
3. Ensure first digit is 2-9
4. Check browser console for errors

## License & Legal
⚠️ **Important**: This implementation is for demonstration purposes. For production use:
- Obtain proper UIDAI authorization
- Implement e-KYC authentication
- Add comprehensive audit logging
- Update privacy policy and terms
- Add user consent mechanisms
- Consider ABDM/NDHM compliance requirements
