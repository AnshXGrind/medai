i d-- Migration: Add Health ID and Multi-Factor Verification Columns
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
