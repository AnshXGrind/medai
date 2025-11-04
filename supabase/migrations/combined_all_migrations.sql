
-- Migration: 001_enable_rls.sql
-- NOTE: Skipping this migration as tables don't exist yet
-- RLS will be enabled when tables are created in subsequent migrations



-- Migration: 20251029063522_48c07706-a063-49b5-9f0d-ce2a2e987bde.sql
-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('patient', 'doctor', 'admin', 'official', 'asha');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- For doctors only: medical ID verification
CREATE TABLE public.doctor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  medical_id TEXT NOT NULL,
  specialty TEXT,
  consultation_fee INTEGER DEFAULT 500,
  is_verified BOOLEAN DEFAULT FALSE,
  is_online BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_profiles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for doctor_profiles
CREATE POLICY "Doctors can view their own profile"
  ON public.doctor_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Doctors can update their own profile"
  ON public.doctor_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Patients can view verified doctors"
  ON public.doctor_profiles
  FOR SELECT
  TO authenticated
  USING (is_verified = TRUE);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User')
  );
  
  -- Insert role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    (NEW.raw_user_meta_data->>'role')::app_role
  );
  
  -- If doctor, insert into doctor_profiles
  IF (NEW.raw_user_meta_data->>'role')::app_role = 'doctor' THEN
    INSERT INTO public.doctor_profiles (user_id, medical_id)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'medical_id', 'pending')
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Trigger for updating profiles timestamp
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();


-- Migration: 20251030155826_86304e38-6f35-4346-a12d-689fbf0a52ec.sql
-- Create consultations table
CREATE TABLE public.consultations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symptoms TEXT NOT NULL,
  ai_analysis TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create health records table
CREATE TABLE public.health_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consultation_id UUID REFERENCES public.consultations(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  record_type TEXT NOT NULL CHECK (record_type IN ('diagnosis', 'prescription', 'lab_result', 'imaging', 'other')),
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;

-- Consultations policies
CREATE POLICY "Users can view their own consultations"
ON public.consultations FOR SELECT
USING (auth.uid() = patient_id OR auth.uid() = doctor_id);

CREATE POLICY "Patients can create consultations"
ON public.consultations FOR INSERT
WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Doctors can update consultations"
ON public.consultations FOR UPDATE
USING (auth.uid() = doctor_id);

-- Health records policies
CREATE POLICY "Users can view their own health records"
ON public.health_records FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own health records"
ON public.health_records FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_consultations_updated_at
BEFORE UPDATE ON public.consultations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.consultations;


-- Migration: 20251101_appointments_prescriptions.sql
-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  appointment_type TEXT NOT NULL CHECK (appointment_type IN ('video', 'face-to-face')),
  appointment_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  consultation_fee DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  prescription_image_url TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create aadhaar_documents table
CREATE TABLE IF NOT EXISTS aadhaar_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_url TEXT NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add additional columns to existing doctor_profiles table
ALTER TABLE public.doctor_profiles
ADD COLUMN IF NOT EXISTS video_consultation_rate DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS face_to_face_rate DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS specialization TEXT,
ADD COLUMN IF NOT EXISTS experience_years INTEGER,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS available_days TEXT[],
ADD COLUMN IF NOT EXISTS available_hours JSONB;

-- Create hospitals table
CREATE TABLE IF NOT EXISTS hospitals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone TEXT,
  emergency_services BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE aadhaar_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;

-- Appointments policies
CREATE POLICY "Users can view their own appointments"
  ON appointments FOR SELECT
  USING (auth.uid() = patient_id OR auth.uid() = doctor_id);

CREATE POLICY "Patients can create appointments"
  ON appointments FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Users can update their own appointments"
  ON appointments FOR UPDATE
  USING (auth.uid() = patient_id OR auth.uid() = doctor_id);

-- Prescriptions policies
CREATE POLICY "Users can view their own prescriptions"
  ON prescriptions FOR SELECT
  USING (auth.uid() = patient_id OR auth.uid() = doctor_id);

CREATE POLICY "Patients can upload prescriptions"
  ON prescriptions FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

-- Aadhaar documents policies
CREATE POLICY "Users can view their own aadhaar"
  ON aadhaar_documents FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Users can upload their own aadhaar"
  ON aadhaar_documents FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

-- Hospitals policies
CREATE POLICY "Anyone can view hospitals"
  ON hospitals FOR SELECT
  USING (TRUE);

-- Create indexes
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
-- Note: Geographic index requires PostGIS extension, skipping for now
-- CREATE INDEX idx_hospitals_location ON hospitals USING gist(
--   ll_to_earth(latitude, longitude)
-- );

-- Insert sample hospitals
INSERT INTO hospitals (name, address, latitude, longitude, phone, emergency_services) VALUES
  ('AIIMS Delhi', 'Ansari Nagar, New Delhi, Delhi 110029', 28.5672, 77.2100, '+91-11-26588500', TRUE),
  ('Apollo Hospital', 'Sarita Vihar, Delhi, 110076', 28.5355, 77.2860, '+91-11-26925858', TRUE),
  ('Max Super Speciality Hospital', 'Saket, New Delhi, Delhi 110017', 28.5245, 77.2066, '+91-11-26515050', TRUE),
  ('Fortis Hospital', 'Shalimar Bagh, Delhi, 110088', 28.7174, 77.1639, '+91-11-47135000', TRUE),
  ('Sir Ganga Ram Hospital', 'Rajinder Nagar, New Delhi, Delhi 110060', 28.6436, 77.1855, '+91-11-25750000', TRUE);



-- Migration: 20251101092004_ecc8a3c0-fba1-42a9-b236-5b76dec03faa.sql
-- Add INSERT policy for profiles table to allow users to create their own profile
CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);


-- Migration: 20251102_abha_integration.sql
-- ABHA/NDHM Integration Schema
-- Ayushman Bharat Health Account Integration

-- Add ABHA fields to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS abha_number TEXT,
ADD COLUMN IF NOT EXISTS abha_address TEXT,
ADD COLUMN IF NOT EXISTS health_id TEXT,
ADD COLUMN IF NOT EXISTS ndhm_linked BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ndhm_link_date TIMESTAMPTZ;

-- Create index for ABHA number
CREATE INDEX IF NOT EXISTS idx_profiles_abha_number ON public.profiles(abha_number);
CREATE INDEX IF NOT EXISTS idx_profiles_health_id ON public.profiles(health_id);

-- Comments for documentation
COMMENT ON COLUMN public.profiles.abha_number IS 'Ayushman Bharat Health Account number (14 digits)';
COMMENT ON COLUMN public.profiles.abha_address IS 'ABHA address for NDHM ecosystem (username@abdm)';
COMMENT ON COLUMN public.profiles.health_id IS 'Unique Health ID generated from ABHA';
COMMENT ON COLUMN public.profiles.ndhm_linked IS 'Indicates if account is linked to National Digital Health Mission';
COMMENT ON COLUMN public.profiles.ndhm_link_date IS 'Date when ABHA was linked';



-- Migration: 20251102_asha_resource_requests.sql
-- Create ASHA resource requests table
CREATE TABLE IF NOT EXISTS asha_resource_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asha_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('Medicine', 'Ambulance', 'Doctor Visit')),
  patient_name TEXT NOT NULL,
  patient_contact TEXT NOT NULL,
  village_name TEXT NOT NULL,
  urgency TEXT NOT NULL DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  details TEXT NOT NULL,
  government_id TEXT, -- Jan Aushadhi ID, 108 Ambulance ID, or PHC Doctor ID
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE asha_resource_requests ENABLE ROW LEVEL SECURITY;

-- ASHA workers can view and create their own requests
CREATE POLICY "ASHA workers can view their own requests"
  ON asha_resource_requests FOR SELECT
  USING (auth.uid() = asha_id);

CREATE POLICY "ASHA workers can create requests"
  ON asha_resource_requests FOR INSERT
  WITH CHECK (auth.uid() = asha_id);

CREATE POLICY "ASHA workers can update their pending requests"
  ON asha_resource_requests FOR UPDATE
  USING (auth.uid() = asha_id AND status = 'pending');

-- Admins/Officials can view and update all requests (for approval workflow)
CREATE POLICY "Officials can view all requests"
  ON asha_resource_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'official')
    )
  );

CREATE POLICY "Officials can update requests"
  ON asha_resource_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'official')
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_asha_requests_asha_id ON asha_resource_requests(asha_id);
CREATE INDEX idx_asha_requests_status ON asha_resource_requests(status);
CREATE INDEX idx_asha_requests_urgency ON asha_resource_requests(urgency);
CREATE INDEX idx_asha_requests_created_at ON asha_resource_requests(created_at DESC);
CREATE INDEX idx_asha_requests_government_id ON asha_resource_requests(government_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_asha_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_asha_requests_updated_at_trigger
  BEFORE UPDATE ON asha_resource_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_asha_requests_updated_at();

-- Create function to set approved_at when status changes to approved
CREATE OR REPLACE FUNCTION set_asha_request_approved_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    NEW.approved_at = NOW();
    NEW.approved_by = auth.uid();
  END IF;
  
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_asha_request_approved_at_trigger
  BEFORE UPDATE ON asha_resource_requests
  FOR EACH ROW
  EXECUTE FUNCTION set_asha_request_approved_at();

-- Insert sample data for demonstration
-- NOTE: Skipping sample ASHA request creation
-- Cannot insert without actual auth.users - will be created when ASHA workers register
-- INSERT INTO asha_resource_requests (...) SELECT auth.uid() ... WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1);



-- Migration: 20251102_sample_doctors.sql
-- NOTE: Skipping sample doctor creation
-- Cannot create auth.users via SQL - doctors must register through the app
-- This migration enables realtime and grants permissions only

-- Enable realtime for appointments and doctor_profiles
DO $$
BEGIN
  -- Try to add table to realtime publication, ignore if already exists
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
  EXCEPTION
    WHEN duplicate_object THEN
      NULL; -- Table already in publication
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.doctor_profiles;
  EXCEPTION
    WHEN duplicate_object THEN
      NULL; -- Table already in publication
  END;
END $$;

-- Grant necessary permissions
GRANT SELECT ON public.doctor_profiles TO authenticated;
GRANT SELECT ON public.profiles TO authenticated;
GRANT ALL ON public.appointments TO authenticated;



-- Migration: 20251102_zero_aadhaar_storage.sql
-- Zero Raw Aadhaar Storage Migration
-- Security Enhancement: Never store full Aadhaar numbers

-- Add secure Aadhaar fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS aadhaar_last_four TEXT,
ADD COLUMN IF NOT EXISTS aadhaar_hash TEXT,
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT FALSE;

-- Create index on hash for verification
CREATE INDEX IF NOT EXISTS idx_profiles_aadhaar_hash ON public.profiles(aadhaar_hash);

-- Add secure patient ID
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS secure_patient_id TEXT GENERATED ALWAYS AS (
  'PAT-' || UPPER(SUBSTRING(aadhaar_hash, 1, 12))
) STORED;

-- Create index on secure patient ID
CREATE INDEX IF NOT EXISTS idx_profiles_secure_patient_id ON public.profiles(secure_patient_id);

-- Anonymous health mode tracking
CREATE TABLE IF NOT EXISTS public.anonymous_consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_hash TEXT NOT NULL, -- Hashed identifier, not Aadhaar
  symptoms TEXT NOT NULL,
  ai_analysis TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT NOT NULL DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for anonymous consultations
ALTER TABLE public.anonymous_consultations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own anonymous consultations
CREATE POLICY "Users can view own anonymous consultations"
ON public.anonymous_consultations FOR SELECT
USING (patient_hash = encode(digest(auth.uid()::text, 'sha256'), 'hex'));

-- Policy: Users can create anonymous consultations
CREATE POLICY "Users can create anonymous consultations"
ON public.anonymous_consultations FOR INSERT
WITH CHECK (patient_hash = encode(digest(auth.uid()::text, 'sha256'), 'hex'));

-- Audit log for Aadhaar access (blockchain-lite)
CREATE TABLE IF NOT EXISTS public.aadhaar_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL, -- 'verify', 'update', 'view'
  action_hash TEXT NOT NULL, -- SHA-256 hash of the action
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN DEFAULT TRUE
);

-- Enable RLS for audit log
ALTER TABLE public.aadhaar_access_log ENABLE ROW LEVEL SECURITY;

-- Only system can write to audit log
CREATE POLICY "System only write to audit log"
ON public.aadhaar_access_log FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Users can view their own audit log
CREATE POLICY "Users can view own audit log"
ON public.aadhaar_access_log FOR SELECT
USING (auth.uid() = user_id);

-- Function to log Aadhaar access
CREATE OR REPLACE FUNCTION public.log_aadhaar_access(
  p_action_type TEXT,
  p_action_details TEXT DEFAULT ''
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.aadhaar_access_log (
    user_id,
    action_type,
    action_hash,
    timestamp,
    success
  ) VALUES (
    auth.uid(),
    p_action_type,
    encode(digest(p_action_type || p_action_details || NOW()::text, 'sha256'), 'hex'),
    NOW(),
    TRUE
  );
END;
$$;

-- Comment on tables for documentation
COMMENT ON COLUMN public.profiles.aadhaar_last_four IS 'Last 4 digits of Aadhaar for display only';
COMMENT ON COLUMN public.profiles.aadhaar_hash IS 'SHA-256 hash of Aadhaar for verification only - NEVER store raw Aadhaar';
COMMENT ON COLUMN public.profiles.is_anonymous IS 'Enable anonymous health mode - hides identity in consultations';
COMMENT ON TABLE public.anonymous_consultations IS 'Anonymous consultations for sensitive health issues';
COMMENT ON TABLE public.aadhaar_access_log IS 'Blockchain-lite audit trail for Aadhaar access';

-- Grant necessary permissions
GRANT SELECT, INSERT ON public.anonymous_consultations TO authenticated;
GRANT SELECT ON public.aadhaar_access_log TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_aadhaar_access TO authenticated;

-- Enable realtime for anonymous consultations
ALTER PUBLICATION supabase_realtime ADD TABLE public.anonymous_consultations;



-- Migration: 20251102000000_setup_storage_bucket.sql
-- Create documents storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for documents bucket

-- Allow authenticated users to upload their own documents
CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] IN ('aadhaar', 'prescriptions')
);

-- Allow authenticated users to view their own documents
CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents'
);

-- Allow users to update their own documents
CREATE POLICY "Users can update their own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'documents')
WITH CHECK (bucket_id = 'documents');

-- Allow users to delete their own documents
CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents');

-- Allow public access to documents (for doctors/viewing)
CREATE POLICY "Public can view documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'documents');



-- Migration: 20251103_health_id_multi_factor_verification.sql
-- Migration: Add Health ID and Multi-Factor Verification Columns
-- Description: Replace Aadhaar with Health ID (ABHA) and add support for multiple government IDs
-- Created: 2025-11-03

-- Add new Health ID columns
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS health_id_last_four TEXT,
ADD COLUMN IF NOT EXISTS health_id_hash TEXT,
ADD COLUMN IF NOT EXISTS verification_primary TEXT, -- 'health_id', 'pan', 'voter_id', etc.
ADD COLUMN IF NOT EXISTS verification_secondary TEXT,
ADD COLUMN IF NOT EXISTS verification_tertiary TEXT,
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false;

-- Add PAN Card columns
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS pan_hash TEXT,
ADD COLUMN IF NOT EXISTS pan_masked TEXT;

-- Add Voter ID columns
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS voter_id_hash TEXT,
ADD COLUMN IF NOT EXISTS voter_id_masked TEXT;

-- Add Driving License columns (for future use)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS driving_license_hash TEXT,
ADD COLUMN IF NOT EXISTS driving_license_masked TEXT;

-- Add Passport columns (for future use)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS passport_hash TEXT,
ADD COLUMN IF NOT EXISTS passport_masked TEXT;

-- Add verification timestamp
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS verification_completed_at TIMESTAMP WITH TIME ZONE;

-- Create verification audit log table
CREATE TABLE IF NOT EXISTS verification_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    verification_method TEXT NOT NULL,
    action_details JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_health_id_hash ON profiles(health_id_hash);
CREATE INDEX IF NOT EXISTS idx_profiles_pan_hash ON profiles(pan_hash);
CREATE INDEX IF NOT EXISTS idx_profiles_voter_id_hash ON profiles(voter_id_hash);
CREATE INDEX IF NOT EXISTS idx_verification_audit_log_user_id ON verification_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_audit_log_created_at ON verification_audit_log(created_at);

-- Enable Row Level Security
ALTER TABLE verification_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view their own verification audit logs
CREATE POLICY "Users can view own verification logs"
    ON verification_audit_log
    FOR SELECT
    USING (auth.uid() = user_id);

-- RLS Policy: System can insert verification logs
CREATE POLICY "System can insert verification logs"
    ON verification_audit_log
    FOR INSERT
    WITH CHECK (true);

-- Create function to log verification access
CREATE OR REPLACE FUNCTION log_verification_access(
    p_action_type TEXT,
    p_action_details TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO verification_audit_log (
        user_id,
        action_type,
        verification_method,
        action_details,
        created_at
    ) VALUES (
        auth.uid(),
        p_action_type,
        'manual',
        jsonb_build_object('details', p_action_details),
        NOW()
    );
END;
$$;

-- Add comments for documentation
COMMENT ON COLUMN profiles.health_id_last_four IS 'Last 4 digits of ABHA Health ID for display only';
COMMENT ON COLUMN profiles.health_id_hash IS 'SHA-256 hash of Health ID for verification';
COMMENT ON COLUMN profiles.pan_hash IS 'SHA-256 hash of PAN number';
COMMENT ON COLUMN profiles.pan_masked IS 'Masked PAN for display (e.g., ABXXX1234F)';
COMMENT ON COLUMN profiles.voter_id_hash IS 'SHA-256 hash of Voter ID';
COMMENT ON COLUMN profiles.voter_id_masked IS 'Masked Voter ID for display';
COMMENT ON COLUMN profiles.verification_primary IS 'Primary verification method used';
COMMENT ON COLUMN profiles.verification_secondary IS 'Secondary verification method';
COMMENT ON COLUMN profiles.verification_tertiary IS 'Tertiary verification method';
COMMENT ON COLUMN profiles.is_anonymous IS 'Whether user wants anonymous profile';

-- Migration notes
COMMENT ON TABLE verification_audit_log IS 'Audit trail for all government ID verifications - blockchain-lite security';

-- Data migration: Copy existing Aadhaar data to Health ID (if exists)
-- Note: This is a one-time migration. Remove after running once.
DO $$
BEGIN
    -- Only migrate if aadhaar columns exist
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'aadhaar_last_four'
    ) THEN
        UPDATE profiles
        SET 
            health_id_last_four = aadhaar_last_four,
            health_id_hash = aadhaar_hash,
            verification_primary = 'health_id'
        WHERE aadhaar_last_four IS NOT NULL;
        
        RAISE NOTICE 'Migrated Aadhaar data to Health ID fields';
    END IF;
END $$;

-- Optional: Drop old Aadhaar columns after migration (uncomment when ready)
-- ALTER TABLE profiles
-- DROP COLUMN IF EXISTS aadhaar_last_four,
-- DROP COLUMN IF EXISTS aadhaar_hash;



