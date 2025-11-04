# MedAid Deployment Guide

## Overview
This guide covers deploying the MedAid application with full AI symptom analysis capabilities.

## Prerequisites
- Supabase account ([https://supabase.com](https://supabase.com))
- Supabase CLI installed ([https://supabase.com/docs/guides/cli](https://supabase.com/docs/guides/cli))
- Lovable API Key for AI analysis

## Environment Variables

Create a `.env` file in the root directory with:

```env
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
VITE_SUPABASE_URL="https://your-project.supabase.co"
```

## Supabase Setup

### 1. Initialize Supabase Project

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-id
```

### 2. Run Database Migrations

```bash
# Apply all migrations
supabase db push
```

This will create the necessary tables:
- `consultations` - Stores patient consultation records
- `profiles` - User profile information
- `appointments` - Appointment bookings
- `documents` - Aadhaar and prescription uploads

### 3. Deploy Edge Functions

#### Install Supabase CLI
```bash
npm install -g supabase
```

#### Deploy the analyze-symptoms function
```bash
# Deploy the function
supabase functions deploy analyze-symptoms

# Set the LOVABLE_API_KEY secret (required for AI analysis)
supabase secrets set LOVABLE_API_KEY=your-lovable-api-key
```

#### Get your Lovable API Key
1. Sign up at [https://lovable.dev](https://lovable.dev)
2. Navigate to your project settings
3. Copy your API key
4. Set it as a secret in Supabase

### 4. Verify Deployment

```bash
# List deployed functions
supabase functions list

# Test the function
supabase functions invoke analyze-symptoms --body '{"symptoms":"headache and fever"}'
```

## Local Development

### Run Supabase Locally

```bash
# Start local Supabase
supabase start

# Serve functions locally
supabase functions serve analyze-symptoms
```

### Run the App

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Offline Mode

The app includes a **fallback offline AI analysis** that works without deployed Edge Functions. This provides:
- Pattern-based symptom analysis
- Common condition suggestions
- Emergency symptom detection
- Basic recommendations

However, for **full AI-powered analysis** with advanced diagnostics, you must:
1. Deploy the Edge Function
2. Set the LOVABLE_API_KEY

## Production Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel/Netlify

1. **Vercel:**
```bash
vercel --prod
```

2. **Netlify:**
```bash
netlify deploy --prod
```

### Environment Variables on Hosting Platform

Add these environment variables to your hosting platform:
- `VITE_SUPABASE_PROJECT_ID`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_URL`

## Troubleshooting

### "Failed to analyze symptoms" Error

**Cause:** Edge Function not deployed or LOVABLE_API_KEY not set

**Solution:**
1. Check if Edge Function is deployed: `supabase functions list`
2. Verify secrets are set: `supabase secrets list`
3. The app will automatically fall back to offline analysis

### Authentication Issues

**Cause:** User not signed in or session expired

**Solution:**
1. Ensure user is logged in
2. Check Supabase authentication settings
3. Verify JWT tokens are valid

### CORS Errors

**Cause:** Edge Function CORS headers not configured

**Solution:**
- The Edge Function already includes CORS headers
- Ensure your Supabase project allows requests from your domain

## Security Best Practices

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Rotate API keys regularly** - Update LOVABLE_API_KEY periodically
3. **Enable RLS (Row Level Security)** - On all Supabase tables
4. **Use environment-specific keys** - Different keys for dev/prod

## Database Schema

### Consultations Table
```sql
CREATE TABLE consultations (
  id UUID PRIMARY KEY,
  patient_id UUID REFERENCES auth.users(id),
  symptoms TEXT NOT NULL,
  analysis TEXT,
  status TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Enable RLS
```sql
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own consultations"
  ON consultations FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Users can insert own consultations"
  ON consultations FOR INSERT
  WITH CHECK (auth.uid() = patient_id);
```

## Support

For issues or questions:
1. Check the [Supabase Documentation](https://supabase.com/docs)
2. Review the [Edge Functions Guide](https://supabase.com/docs/guides/functions)
3. Open an issue on GitHub

## Features Status

✅ **Working Without Deployment:**
- User Authentication
- Aadhaar Upload
- Prescription Upload
- Appointment Booking
- Hospital Finder with Maps
- Offline AI Analysis (Fallback)
- Dark Mode
- Multi-language Support

⚠️ **Requires Deployment:**
- Full AI Symptom Analysis (Cloud-based)
- Advanced Disease Prediction
- Medical Knowledge Database

## Quick Start

For the fastest setup:

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in values
3. Run `npm install`
4. Run `npm run dev`
5. The app works in offline mode immediately!
6. Deploy Edge Functions when ready for full AI capabilities

---

**Note:** The app is fully functional without Edge Functions deployed. The offline analysis provides useful symptom insights while you set up the cloud services.
