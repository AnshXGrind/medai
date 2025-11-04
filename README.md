# 🏥 MED-AID SAARTHI - Revolutionary Healthcare Platform

> **Bridging the Healthcare Gap in Rural & Urban India with AI, Privacy & Government Integration**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Security: Zero Raw Aadhaar](https://img.shields.io/badge/Security-Zero%20Raw%20Aadhaar-green.svg)](https://github.com)
[![NDHM: Integrated](https://img.shields.io/badge/NDHM-Integrated-orange.svg)](https://github.com)

## 📚 Strategic Documentation

**New to the project? Start here:**
- 🎯 **[MVP Scope](./MVP_SCOPE.md)** - What we're building and why (3-6 month plan)
- 🚀 **[Quick Start Guide](./QUICK_START.md)** - Your 7-day implementation plan
- 🗺️ **[Technical Roadmap](./ROADMAP.md)** - 6/12/18-month strategic plan
- 🏛️ **[Government Integration](./GOVERNMENT_INTEGRATION.md)** - ABDM APIs and compliance
- 🔐 **[Security & Compliance](./SECURITY_COMPLIANCE.md)** - DPDP Act and audit checklist
- 💼 **[Pitch Deck](./PITCH_DECK.md)** - Investor and government presentation

**For developers:**
- 📖 [Deployment Guide](./DEPLOYMENT.md)
- 🔧 [Storage Setup](./STORAGE_SETUP.md)
- 🆔 [Aadhaar Integration](./AADHAAR_INTEGRATION.md)
- 🏥 [Sample Doctors Setup](./SAMPLE_DOCTORS_SETUP.md)
- 🌾 [Village Mode Features](./VILLAGE_MODE_FEATURES.md)
- 📋 [System Overview](./SYSTEM_OVERVIEW.md)

## 🌟 Revolutionary Features

### 🔐 **World-Class Privacy & Security**

#### Zero Raw Aadhaar Storage (CRITICAL DIFFERENTIATOR)
- ✅ **NEVER stores full Aadhaar numbers**
- ✅ **Only last 4 digits + SHA-256 one-way hash**
- ✅ **Irreversible encryption** - cannot be decrypted
- ✅ **GDPR/Privacy compliant** from day one
- ✅ **Blockchain-lite audit trail** - every Aadhaar access logged

**Why this matters:** Unlike traditional systems that store sensitive IDs in plain text, we protect citizen privacy at the architecture level. This builds trust and meets international privacy standards.

#### Anonymous Health Mode
- 🎭 **Hide identity for sensitive consultations**
- 🔒 **End-to-end privacy for personal health issues**
- 💚 **Shows empathy + ethical tech design**

### 🇮🇳 **Government Integration**

#### ABHA/NDHM Integration (Ayushman Bharat)
- 🏥 **Links to National Digital Health Mission**
- 📱 **ABHA number integration** (14-digit health ID)
- 🔗 **ABHA address** (username@abdm)
- 📊 **Cross-hospital health record access**
- 💳 **Insurance claim integration ready**

**Impact:** Connects rural patients to India's digital health ecosystem, enabling seamless healthcare across all facilities.

### 🤖 **AI-Powered Intelligence**

#### AI Health Insights Dashboard
- 📊 **Real-time disease outbreak prediction**
- 📈 **District-level health analytics**
- 🗺️ **Geo-mapped health trends**
- 🎯 **ML-powered recommendations** for govt action
- 📉 **Aggregated, anonymized data** (privacy-protected)

**Example Insight:** *"80% of fever cases in past 7 days from East Delhi → AI recommends increasing dengue prevention measures"*

### 🚨 **Emergency Response System**

#### Geo-Mapping + Emergency Routing
- 🗺️ **Google Maps/OpenStreetMap integration**
- 🚑 **Finds nearest PHC, hospital, ambulance**
- ⏱️ **Real-time ETA calculation**
- 📍 **GPS-based location detection**
- 📞 **One-tap emergency calls** (108/102/104)
- 🔔 **Push notifications to nearest doctors**

### 💊 **Comprehensive Healthcare Features**

- 🏥 **Hospital Finder** with pincode-accurate search
- 👨‍⚕️ **Doctor Appointment Booking** (video & in-person)
- 💬 **AI Symptom Analysis** (local fallback + cloud AI)
- 🗣️ **8 Indian Languages** supported
- 📱 **Mobile-first design** (optimized for rural areas)
- 🌙 **Dark mode** for accessibility
- 🎯 **Village Mode** (simplified UI for low-literacy users)

## 🛡️ Security Architecture

```
User Aadhaar Input (12 digits)
         ↓
   [SHA-256 Hash]
         ↓
    Store Only:
    - Last 4 digits (display)
    - Hashed token (verification)
    - Audit log entry
         ↓
   Original Aadhaar DELETED
   (Never touches database)
```

### Security Features:
- ✅ One-way encryption (SHA-256)
- ✅ Tamper-proof audit logs
- ✅ Row-level security (RLS) in database
- ✅ Anonymous consultation option
- ✅ Encrypted data transmission
- ✅ No third-party tracking

## 🏗️ Tech Stack

- **Frontend:** React 18.3, TypeScript, Vite 5.4
- **UI:** shadcn-ui, Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Real-time:** Supabase Realtime subscriptions
- **Maps:** Google Maps API / OpenStreetMap
- **AI:** Lovable AI + local fallback
- **Security:** SHA-256 hashing, RLS policies
- **Languages:** i18n with 8 Indian languages

## 📊 Impact Metrics

- 🎯 **Zero raw Aadhaar storage** = 100% privacy protection
- 🏥 **NDHM integration** = Access to pan-India health records
- 🚑 **Emergency routing** = Faster response times
- 📈 **AI insights** = Proactive disease prevention
- 🌍 **8 languages** = Inclusive for all Indians

## 🚀 Getting Started

### Prerequisites
- Node.js & npm ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- Supabase account

### Installation

```sh
# Clone the repository
git clone https://github.com/AnshXGrind/MED-AID-SAARTHI.git

# Navigate to project
cd MED-AID-SAARTHI

# Install dependencies
npm install

# Start development server
npm run dev
```

### Database Setup

Run the migrations in your Supabase SQL Editor:

1. `20251029063522_*.sql` - Initial schema
2. `20251102_zero_aadhaar_storage.sql` - **Security migration**
3. `20251102_abha_integration.sql` - NDHM integration
4. `20251102_sample_doctors.sql` - Sample data

## 📖 Key Documentation

- **Zero Aadhaar Storage:** See `src/lib/secureAadhaar.ts`
- **Anonymous Mode:** See `src/components/SecureAadhaarVerification.tsx`
- **ABHA Integration:** See `src/components/ABHAIntegration.tsx`
- **Emergency Routing:** See `src/components/EmergencyRouting.tsx`
- **AI Insights:** See `src/components/HealthInsightsDashboard.tsx`

## 🎯 Pitch Highlights

### For Judges/Investors:

1. **Privacy-First Architecture** 
   - Zero raw Aadhaar storage differentiates us from ALL competitors
   - Blockchain-lite audit trail shows accountability
   
2. **Government Integration**
   - ABHA/NDHM ready = seamless national health ecosystem fit
   - Shows understanding of India's digital health vision
   
3. **AI + Ethics**
   - ML-powered insights WITHOUT compromising individual privacy
   - Anonymous mode shows empathy for sensitive health issues
   
4. **Real-World Impact**
   - Emergency routing can save lives (measurable impact)
   - Multi-language = truly inclusive
   - Rural-focused (Village Mode) addresses real gaps

5. **Scalable & Secure**
   - Built on enterprise-grade Supabase
   - Real-time capabilities
   - Production-ready security

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines.

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Built with [Lovable](https://lovable.dev)
- Inspired by India's digital health mission
- For the people of India 🇮🇳

---

**Made with ❤️ for bridging healthcare gaps in India**
