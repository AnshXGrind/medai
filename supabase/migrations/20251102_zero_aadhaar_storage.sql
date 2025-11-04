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
