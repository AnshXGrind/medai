# MedAid Saarthi - MVP Scope Definition

## 🎯 Core Problem Statement
**Rural India faces healthcare access barriers**: 70% of population in villages, limited medical infrastructure, fragmented health records, language barriers, and lack of emergency coordination.

## 🚀 MVP Goal (3-6 Months)
Build a **minimal but functional healthcare platform** that demonstrates value and can be expanded modularly.

---

## MVP Features (Must-Have)

### 1. User Authentication & Identity ✅ (Already Implemented)
- [x] Patient and Doctor signup/login
- [x] Aadhaar integration (secure, last-4-digits display)
- [x] ABHA (Ayushman Bharat Health Account) linking
- [x] Anonymous health mode for sensitive consultations

**Measurable Outcome**: User can sign up in < 2 minutes

### 2. Medical Record Upload & Storage ✅ (Already Implemented)
- [x] Upload prescriptions (image/PDF)
- [x] Upload Aadhaar card (for verification)
- [x] Secure storage (Supabase with encryption)
- [x] Support for all image formats including HEIC

**Measurable Outcome**: User can upload and retrieve documents in < 30 seconds

### 3. AI-Powered Health Analysis 🔄 (Partially Implemented)
- [x] AI Health Chatbot (PreventiveAICoach)
- [x] Symptom analysis
- [ ] **MVP GOAL**: Medical report summarization
  - Extract key findings from prescription images
  - Highlight critical values (blood sugar, BP, etc.)
  - Flag abnormal results
  - Generate patient-friendly summary in Hindi/English

**Measurable Outcome**: Generate summary within 5 minutes of upload

**Technical Approach**:
- Option A: Use OpenAI GPT-4 Vision API (for OCR + interpretation)
- Option B: Google Cloud Vision (OCR) + Gemini (interpretation)
- Option C: Local OCR (Tesseract) + lightweight medical NLP

### 4. Doctor Access & Sharing 🔄 (Partially Implemented)
- [x] Doctor dashboard
- [x] Patient consultation booking
- [x] Video consultation interface (placeholder)
- [ ] **MVP GOAL**: Secure record sharing
  - Patient generates time-limited share link
  - Doctor views medical summary + original documents
  - Audit trail of access (who viewed what, when)

**Measurable Outcome**: Patient shares record with doctor in < 1 minute

### 5. Health Records Vault ✅ (Implemented)
- [x] Centralized storage
- [x] Chronological view
- [x] Download/print functionality

**Measurable Outcome**: User accesses 2-year history in < 10 seconds

---

## MVP Success Metrics (3-6 Months)

### User Metrics
- [ ] 500 patient signups (pilot with 1-2 clinics)
- [ ] 50 doctor signups
- [ ] 1000+ medical records uploaded
- [ ] 100+ consultations booked

### Technical Metrics
- [ ] 99% uptime
- [ ] < 3 second page load time
- [ ] < 5% error rate
- [ ] Mobile-responsive (works on basic smartphones)

### Compliance Metrics
- [ ] DPDP Act compliance (India's data protection law)
- [ ] ABDM integration ready (ABHA linking works)
- [ ] Security audit passed (external review)
- [ ] Audit logs for all sensitive operations

---

## What's NOT in MVP (Future Phases)

### Phase 2 (6-12 Months)
- Pharmacy integration (medicine ordering)
- Lab test booking and results
- Insurance claim assistance
- Advanced telemedicine (WebRTC video)
- Multi-language support beyond Hindi/English

### Phase 3 (12-18 Months)
- Government scheme eligibility checker (expanded)
- Hospital finder with bed availability
- Emergency ambulance routing (real-time GPS)
- Wearable device integration (fitness trackers)
- Predictive health analytics

### Phase 4 (18+ Months)
- Complete ecosystem (Jan Aushadhi stock tracker)
- Government health heatmap
- ASHA worker module (village health workers)
- Blockchain-based health records
- International patient support

---

## MVP Technical Stack (Current)

### Frontend
- **Framework**: React 18 + TypeScript
- **UI**: shadcn/ui + Tailwind CSS
- **Routing**: React Router v6
- **State**: React Query (TanStack Query)
- **Icons**: Lucide React

### Backend
- **BaaS**: Supabase (PostgreSQL + Auth + Storage)
- **Auth**: Supabase Auth + Row Level Security (RLS)
- **Storage**: Supabase Storage (encrypted)
- **Database**: PostgreSQL 15

### AI/ML
- **Current**: Rule-based chatbot (keyword matching)
- **MVP Target**: OpenAI GPT-4 Vision / Google Gemini
- **Future**: Custom ML models (TensorFlow/PyTorch)

### Deployment
- **Frontend**: Vercel / Netlify
- **Backend**: Supabase Cloud
- **CDN**: Cloudflare (for India edge caching)

---

## MVP Development Timeline (3-6 Months)

### Month 1-2: Foundation Strengthening
- [ ] Enhance security (DPDP compliance)
- [ ] Add AI report summarization (core MVP feature)
- [ ] Implement secure sharing mechanism
- [ ] Add comprehensive audit logging
- [ ] Write unit tests (80% coverage target)

### Month 3-4: User Testing & Iteration
- [ ] Pilot with 1 clinic (50-100 patients)
- [ ] User feedback collection
- [ ] Bug fixes and UX improvements
- [ ] Performance optimization
- [ ] Mobile app (React Native) - optional

### Month 5-6: Scale & Launch
- [ ] Onboard 3-5 clinics (500 patients)
- [ ] Marketing and outreach
- [ ] Government partnership discussions
- [ ] Prepare pitch deck and investor meetings
- [ ] Launch public beta

---

## Key Risks & Mitigation

### Technical Risks
| Risk | Impact | Mitigation |
|------|--------|-----------|
| AI accuracy low | High | Use GPT-4 Vision + human review workflow |
| Supabase scalability | Medium | Plan for self-hosted PostgreSQL if needed |
| Image upload fails | High | Fallback to localStorage, retry mechanism |
| ABHA API changes | Medium | Mock layer + adapter pattern |

### Business Risks
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Doctors don't adopt | High | Free tier + training sessions |
| Patients don't trust | High | Privacy-first marketing + ABDM certification |
| Government delays | Medium | Focus on private clinics first |
| Funding shortage | High | Bootstrap + incubator programs |

---

## Success Criteria (MVP Launch)

✅ **Technical**
- User can upload report and get AI summary in < 5 minutes
- Doctor can access shared records securely
- 99% uptime for 30 days
- Security audit passed

✅ **User**
- 500+ active patients
- 50+ active doctors
- 70%+ user satisfaction (NPS > 50)
- 80%+ mobile users (responsive design)

✅ **Business**
- 1-2 clinic partnerships confirmed
- Pitch deck ready for investors
- Government meeting scheduled (State Health Dept)
- Media coverage (1-2 articles)

---

## Next Steps (This Week)

1. **[Day 1-2]** Integrate AI report summarization
   - Set up OpenAI API key
   - Build image-to-text pipeline
   - Test with sample prescriptions

2. **[Day 3-4]** Implement secure sharing
   - Generate time-limited tokens
   - Build doctor view page
   - Add access audit log

3. **[Day 5-7]** User testing prep
   - Create demo video (your video editing skills!)
   - Write user onboarding guide
   - Set up analytics (PostHog/Mixpanel)

---

## Contact & Resources

**Project Lead**: You (CEO, Video Editor, Freelancer)
**GitHub**: https://github.com/AnshXGrind/medaid-sathi-extract
**Documentation**: See `/docs` folder for technical details

**Daily Time Budget**: 20-25 minutes
- 10 min: Code/feature development
- 5 min: Documentation/planning
- 5 min: Learning (ABDM docs, health tech regulations)
- 5 min: User feedback/testing

---

## References
- National Health Authority: https://nha.gov.in
- ABDM APIs: https://sandbox.abdm.gov.in
- India Health Tech Report: [Link to relevant research]
- DPDP Act 2023: [Link to legal text]
