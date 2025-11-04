-- =====================================================
-- SECURITY & COMPLIANCE UPGRADE - MED-AID SAARTHI v2.0
-- =====================================================
-- This migration adds:
-- 1. Consent logging table (GDPR/DPDP compliance)
-- 2. Session management for JWT rotation
-- 3. Rate limiting tracking
-- 4. Enhanced audit fields
-- 5. Encrypted PHI columns
-- =====================================================

-- =====================================================
-- 1. CONSENT LOGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS consent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  purpose TEXT NOT NULL CHECK (purpose IN ('treatment', 'research', 'marketing', 'data_sharing', 'analytics')),
  granted BOOLEAN NOT NULL,
  consent_version TEXT NOT NULL,
  ip_address INET,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Index for fast lookups
  INDEX idx_consent_logs_user_purpose (user_id, purpose, consent_version, created_at DESC)
);

-- RLS: Users can only view their own consent logs
ALTER TABLE consent_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own consent logs"
  ON consent_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consent logs"
  ON consent_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all consent logs (for compliance)
CREATE POLICY "Admins can view all consent logs"
  ON consent_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- 2. SESSION MANAGEMENT (JWT Rotation)
-- =====================================================

CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL UNIQUE,
  refresh_token_hash TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  revoked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Index for fast lookups
  INDEX idx_user_sessions_user (user_id, created_at DESC),
  INDEX idx_user_sessions_token (session_id),
  INDEX idx_user_sessions_expires (expires_at)
);

-- RLS: Users can only manage their own sessions
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
  ON user_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON user_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON user_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON user_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Function to auto-cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM user_sessions
  WHERE expires_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. RATE LIMITING TRACKING
-- =====================================================

CREATE TABLE IF NOT EXISTS rate_limit_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL, -- Email or IP address
  endpoint TEXT NOT NULL,
  attempt_count INT NOT NULL DEFAULT 1,
  locked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint on identifier + endpoint
  UNIQUE (identifier, endpoint),
  
  -- Index for fast lookups
  INDEX idx_rate_limit_identifier (identifier, endpoint)
);

-- No RLS needed (server-side only)
ALTER TABLE rate_limit_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only"
  ON rate_limit_tracking FOR ALL
  USING (false); -- Block all public access

-- =====================================================
-- 4. ENHANCE PROFILES TABLE WITH ENCRYPTED COLUMNS
-- =====================================================

-- Add encrypted PHI columns (envelope encryption)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS encrypted_data JSONB DEFAULT '{}'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS encryption_key_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Add session tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_ip INET;

-- Add compliance flags
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS data_export_requested_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS data_deletion_requested_at TIMESTAMP WITH TIME ZONE;

-- =====================================================
-- 5. ENHANCE HEALTH_RECORDS WITH ENCRYPTION
-- =====================================================

ALTER TABLE health_records ADD COLUMN IF NOT EXISTS encrypted_record JSONB;
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS encryption_iv TEXT;
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS encryption_auth_tag TEXT;
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS encryption_key_id TEXT;

-- Add retention tracking
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS retention_expires_at TIMESTAMP WITH TIME ZONE;

-- =====================================================
-- 6. ENHANCE VERIFICATION_AUDIT_LOG
-- =====================================================

-- Add additional audit fields
ALTER TABLE verification_audit_log ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';
ALTER TABLE verification_audit_log ADD COLUMN IF NOT EXISTS device_info TEXT;
ALTER TABLE verification_audit_log ADD COLUMN IF NOT EXISTS session_id TEXT;

-- Add index for compliance queries
CREATE INDEX IF NOT EXISTS idx_audit_log_user_date ON verification_audit_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON verification_audit_log(action_type, created_at DESC);

-- =====================================================
-- 7. ENHANCE CONSULTATIONS WITH PRIVACY
-- =====================================================

ALTER TABLE consultations ADD COLUMN IF NOT EXISTS encrypted_notes JSONB;
ALTER TABLE consultations ADD COLUMN IF NOT EXISTS encryption_iv TEXT;
ALTER TABLE consultations ADD COLUMN IF NOT EXISTS notes_auth_tag TEXT;

-- =====================================================
-- 8. ENHANCE PRESCRIPTIONS WITH ENCRYPTION
-- =====================================================

ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS encrypted_medications JSONB;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS encryption_iv TEXT;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS medications_auth_tag TEXT;

-- =====================================================
-- 9. FILE UPLOAD SECURITY TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS secure_file_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  bucket_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  malware_scan_status TEXT DEFAULT 'pending' CHECK (malware_scan_status IN ('pending', 'clean', 'infected', 'error')),
  malware_scan_result JSONB,
  encryption_key_id TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accessed_at TIMESTAMP WITH TIME ZONE,
  
  -- Index
  INDEX idx_secure_files_user (user_id, uploaded_at DESC),
  INDEX idx_secure_files_scan (malware_scan_status)
);

-- RLS: Users can only see their own files
ALTER TABLE secure_file_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own files"
  ON secure_file_uploads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own files"
  ON secure_file_uploads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Doctors can view patient files if they have an active consultation
CREATE POLICY "Doctors can view patient files"
  ON secure_file_uploads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM consultations c
      INNER JOIN doctor_profiles dp ON c.doctor_id = dp.id
      WHERE dp.id = auth.uid()
        AND c.patient_id = secure_file_uploads.user_id
        AND c.status IN ('pending', 'in_progress')
    )
  );

-- =====================================================
-- 10. UTILITY FUNCTIONS
-- =====================================================

-- Function to log data access (for audit trail)
CREATE OR REPLACE FUNCTION log_data_access(
  p_user_id UUID,
  p_resource TEXT,
  p_action TEXT
)
RETURNS void AS $$
BEGIN
  INSERT INTO verification_audit_log (
    user_id,
    action_type,
    verification_method,
    verification_status,
    created_at
  ) VALUES (
    p_user_id,
    p_action,
    p_resource,
    'success',
    NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check data retention expiry
CREATE OR REPLACE FUNCTION check_retention_expiry()
RETURNS TABLE (
  table_name TEXT,
  record_id UUID,
  expires_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'health_records'::TEXT,
    id,
    retention_expires_at
  FROM health_records
  WHERE retention_expires_at < NOW()
    AND archived_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 11. IMMUTABLE AUDIT TRAIL TRIGGER
-- =====================================================

-- Prevent modification of audit logs (append-only)
CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'Audit logs are immutable and cannot be modified or deleted';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER immutable_audit_log
  BEFORE UPDATE OR DELETE ON verification_audit_log
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_log_modification();

-- =====================================================
-- 12. AUTOMATIC TIMESTAMP UPDATES
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to rate_limit_tracking
CREATE TRIGGER update_rate_limit_timestamp
  BEFORE UPDATE ON rate_limit_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Security & Compliance Upgrade Complete!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Added:';
  RAISE NOTICE '  ✅ Consent logging table';
  RAISE NOTICE '  ✅ Session management for JWT rotation';
  RAISE NOTICE '  ✅ Rate limiting tracking';
  RAISE NOTICE '  ✅ Enhanced audit fields';
  RAISE NOTICE '  ✅ Encrypted PHI columns';
  RAISE NOTICE '  ✅ File upload security';
  RAISE NOTICE '  ✅ Immutable audit trail';
  RAISE NOTICE '  ✅ Data retention tracking';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '  1. Rotate all API keys and secrets';
  RAISE NOTICE '  2. Enable JWT token rotation in app';
  RAISE NOTICE '  3. Configure malware scanning service';
  RAISE NOTICE '  4. Set up automated retention policy job';
  RAISE NOTICE '========================================';
END $$;
