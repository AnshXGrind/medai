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
