# 🏥 Universal Health ID Platform

## 🎯 Overview

Transform MedAid Sathi into a comprehensive **Universal Health ID System** - India's Aadhaar for Healthcare. This platform provides a unified digital identity for all citizens, linking health records, vaccinations, insurance, and medical history in one secure, blockchain-verified system.

## ✨ New Features

### 1. **Universal Health ID System**
- ✅ 14-digit unique Health ID (Format: XX-XXXX-XXXX-XXXX)
- ✅ State-code based ID generation (XX = State Code)
- ✅ QR code for instant verification
- ✅ Beautiful digital Health ID card (Aadhaar-like design)
- ✅ Downloadable PDF Health ID card
- ✅ Emergency ICE (In Case of Emergency) mode
- ✅ Blockchain audit trail (Polygon Amoy)

### 2. **Family Linking**
- Link spouse, children, parents, and other family members
- Shared family health dashboard
- Consent-based access control
- Family health insurance management

### 3. **Complete Health Records**
- 📄 Digital birth certificates
- 💉 Complete vaccination history (0-100 years)
- 🏥 Medical records timeline
- 💊 Prescription management
- 🧪 Lab reports (blood tests, X-rays, MRI, CT scans)
- 🩺 Chronic disease tracking
- ⚠️ Allergy records
- 🧬 Family medical history

### 4. **Vaccination Management**
- Age-based vaccination schedule
- Automated reminders (SMS/Email/Push)
- Digital vaccination certificates with QR
- Vaccine passport for international travel
- Next dose calculator
- Vaccination camp finder
- Side effects tracking

### 5. **Insurance Integration**
- PMJAY, ESIC, and private insurance cards
- Coverage details and limits
- Cashless treatment verification
- Claim history and tracking
- Pre-authorization requests
- TPA integration
- Family floater management
- Policy renewal reminders

### 6. **Hospital Network**
- Hospital registration portal
- Doctor verification system
- Patient check-in via Health ID QR scan
- Digital prescription system
- Lab test ordering
- Billing integration
- Bed availability checker
- OPD/IPD management

### 7. **Government Analytics Dashboard**
- Real-time health statistics (state/district-wise)
- Disease outbreak mapping with heatmap
- Vaccination coverage tracker
- Hospital utilization metrics
- Insurance claim analytics
- Budget impact calculator
- Population health trends
- Epidemic prediction AI

### 8. **Emergency Features**
- 🚨 Emergency Health ID access (no password required)
- Critical info display (blood group, allergies, emergency contacts)
- ICE contacts (In Case of Emergency)
- Organ donor status
- Blood donor registry
- Medical alert bracelet integration
- Emergency room quick check-in

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Polygon Amoy testnet access (for blockchain)

### Installation

```powershell
# Clone the repository
git clone https://github.com/AnshXGrind/medai.git
cd medai

# Install dependencies
npm install

# Copy environment file
copy .env.example .env

# Edit .env and add your credentials:
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
# VITE_POLYGON_RPC_URL=your_polygon_rpc_url
# VITE_POLYGON_PRIVATE_KEY=your_private_key
```

### Database Setup

1. **Apply the migration**:

```powershell
# Option 1: Using Supabase CLI
supabase db push

# Option 2: Using PowerShell script
.\apply-migration.ps1

# Option 3: Manual (Supabase Dashboard)
# - Go to SQL Editor in Supabase Dashboard
# - Copy contents of supabase/migrations/20251104_universal_health_id_system.sql
# - Paste and run
```

2. **Verify migration**:

```powershell
.\verify-migration.ps1
```

### Run Development Server

```powershell
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```powershell
npm run build
npm run preview
```

## 📊 Database Schema

### Core Tables

| Table | Description | Key Fields |
|-------|-------------|------------|
| `health_ids` | Universal Health ID records | `health_id_number`, `user_id`, `full_name`, `blood_group` |
| `family_members` | Family linkage | `primary_health_id`, `member_health_id`, `relationship` |
| `birth_certificates` | Digital birth certificates | `certificate_number`, `birth_date`, `verified` |
| `vaccinations` | Complete vaccination records | `vaccine_name`, `dose_number`, `administered_date` |
| `medical_records` | Medical history | `disease_name`, `diagnosis`, `treatment` |
| `insurance_policies` | Insurance coverage | `provider_name`, `policy_number`, `coverage_amount` |
| `insurance_claims` | Claim tracking | `claim_number`, `status`, `claim_amount` |
| `lab_reports` | Lab test results | `report_type`, `test_date`, `results` |
| `hospitals` | Healthcare facilities | `name`, `type`, `empaneled`, `verified` |
| `doctors` | Medical professionals | `registration_number`, `specialization`, `verified` |
| `prescriptions` | Digital prescriptions | `prescription_number`, `medicines`, `diagnosis` |
| `appointments` | Appointment booking | `appointment_date`, `status`, `fee_amount` |
| `health_statistics` | Government analytics | `state`, `metric_type`, `metric_value` |
| `disease_outbreaks` | Epidemic tracking | `disease_name`, `severity`, `total_cases` |
| `emergency_contacts` | ICE contacts | `contact_name`, `phone_number`, `relationship` |
| `audit_logs` | Activity trail | `action`, `resource_type`, `blockchain_hash` |

## 🔒 Security Features

### Data Encryption
- **Aadhaar numbers**: AES-256-GCM client-side encryption
- **Medical records**: Encrypted storage URLs
- **Lab reports**: End-to-end encryption
- **Personal data**: HMAC-SHA256 signing

### Access Control
- **Row Level Security (RLS)**: Supabase policies per table
- **Owner-only access**: Users can only see their own records
- **Emergency ICE mode**: Limited public access to critical info
- **Doctor access**: Consent-based record sharing
- **Audit logging**: Complete activity trail with blockchain verification

### Blockchain Integration
- **Polygon Amoy testnet**: Immutable audit trail
- **Critical events**: Health ID creation, vaccination records, birth certificates
- **Hash storage**: On-chain verification of record integrity
- **Smart contracts**: Future support for insurance claims automation

## 🎨 UI/UX Design

### Design System
- **Shadcn/UI components**: Consistent, accessible components
- **Tailwind CSS**: Utility-first styling
- **Dark mode**: Full dark mode support
- **Responsive**: Mobile-first design
- **Accessibility**: WCAG 2.1 AA compliant

### Color Scheme
```css
--primary: Healthcare blue
--secondary: Trust green
--accent: Innovation purple
--destructive: Alert red
--muted: Neutral gray
```

### Typography
- **Font family**: Inter (system font fallback)
- **Font sizes**: Responsive scale (rem-based)
- **Line heights**: Optimized for readability

## 📱 Mobile Support

### Progressive Web App (PWA)
- ✅ Install to home screen
- ✅ Offline support (Service Worker)
- ✅ Push notifications
- ✅ Background sync
- ✅ App-like experience

### Responsive Breakpoints
```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

## 🌐 Multi-Language Support

Supported languages:
- English (en)
- Hindi (hi)
- Bengali (bn)
- Telugu (te)
- Marathi (mr)
- Tamil (ta)
- Gujarati (gu)
- Kannada (kn)
- Malayalam (ml)
- Punjabi (pa)

## 📋 API Integration

### Supabase Client

```typescript
import { supabase } from '@/integrations/supabase/client';

// Create Health ID
const { data, error } = await supabase
  .from('health_ids')
  .insert({
    user_id: user.id,
    health_id_number: generatedId,
    full_name: 'John Doe',
    date_of_birth: '1990-01-01',
    blood_group: 'A+'
  });

// Fetch Health ID
const { data } = await supabase
  .from('health_ids')
  .select('*')
  .eq('health_id_number', healthId)
  .single();
```

### Health ID Utilities

```typescript
import { 
  generateHealthId, 
  isValidHealthId, 
  verifyHealthId 
} from '@/lib/universalHealthId';

// Generate new Health ID
const healthId = await generateHealthId('27'); // Maharashtra

// Validate format
const isValid = isValidHealthId('27-1234-5678-9012');

// Verify exists and active
const result = await verifyHealthId('27-1234-5678-9012');
```

### QR Code Generation

```typescript
import { QRCodeGenerator } from '@/components/QRCodeGenerator';

<QRCodeGenerator
  value={healthIdData}
  size={200}
  errorCorrectionLevel="H"
  onDataUrl={(url) => console.log(url)}
/>
```

### PDF Export

```typescript
import { downloadHealthIDCardAsPDF } from '@/lib/pdfExport';

const cardElement = document.getElementById('health-card');
await downloadHealthIDCardAsPDF(cardElement, 'health-id-card.pdf');
```

## 🧪 Testing

```powershell
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test
npm test -- healthId.test.ts
```

## 📦 Deployment

### Netlify

```powershell
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

### Vercel

```powershell
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Self-Hosted

```powershell
# Build
npm run build

# The dist/ folder contains production files
# Serve with any static host (nginx, Apache, etc.)
```

## 🔧 Environment Variables

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Blockchain (Polygon Amoy)
VITE_POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
VITE_POLYGON_PRIVATE_KEY=your_private_key
VITE_POLYGON_CONTRACT_ADDRESS=your_contract_address

# SMS/Email (Optional)
VITE_TWILIO_ACCOUNT_SID=your_twilio_sid
VITE_TWILIO_AUTH_TOKEN=your_twilio_token
VITE_SENDGRID_API_KEY=your_sendgrid_key

# Maps (Optional)
VITE_GOOGLE_MAPS_API_KEY=your_maps_key

# Analytics (Optional)
VITE_GA_TRACKING_ID=your_ga_id
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Aadhaar**: Inspiration for universal identity system
- **Ayushman Bharat**: Healthcare insurance integration
- **ABHA**: National Digital Health Mission
- **Polygon**: Blockchain infrastructure
- **Supabase**: Backend infrastructure
- **Shadcn/UI**: Beautiful component library

## 📞 Support

- 📧 Email: support@medai.health
- 💬 Discord: [Join our community](https://discord.gg/medai)
- 🐛 Issues: [GitHub Issues](https://github.com/AnshXGrind/medai/issues)
- 📖 Docs: [Full Documentation](https://docs.medai.health)

## 🗺️ Roadmap

### Phase 1 (Completed) ✅
- [x] Universal Health ID generation
- [x] Digital Health ID card
- [x] QR code verification
- [x] Database schema
- [x] Basic UI components

### Phase 2 (In Progress) 🚧
- [ ] Vaccination certificate generation
- [ ] Birth certificate digitization
- [ ] Insurance integration
- [ ] Hospital onboarding portal
- [ ] Government analytics dashboard

### Phase 3 (Planned) 📅
- [ ] AI-powered health insights
- [ ] Telemedicine integration
- [ ] Medicine delivery tracking
- [ ] Health wallet (payments)
- [ ] International health passport

### Phase 4 (Future) 🔮
- [ ] Wearable device integration
- [ ] Genomic data storage
- [ ] Clinical trials matching
- [ ] Research data anonymization
- [ ] Global health record exchange

---

**Made with ❤️ in India for a healthier tomorrow**
