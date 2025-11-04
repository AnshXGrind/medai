-- =====================================================
-- Migration: Enable Row Level Security (RLS) on all PII tables
-- Author: Security Team
-- Date: November 2025
-- Purpose: Protect sensitive health data and PII
-- =====================================================

-- =====================================================
-- 1. PATIENTS TABLE
-- =====================================================

-- Enable RLS
ALTER TABLE IF EXISTS public.patients ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS user_own_patient_data ON public.patients;
DROP POLICY IF EXISTS service_role_patients_full_access ON public.patients;

-- Policy: Users can only access their own data
CREATE POLICY user_own_patient_data ON public.patients
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Service role has full access (backend operations)
CREATE POLICY service_role_patients_full_access ON public.patients
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- =====================================================
-- 2. HEALTH RECORDS TABLE
-- =====================================================

-- Enable RLS
ALTER TABLE IF EXISTS public.health_records ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS user_own_health_records ON public.health_records;
DROP POLICY IF EXISTS doctor_read_patient_records ON public.health_records;
DROP POLICY IF EXISTS service_role_health_records_full_access ON public.health_records;

-- Policy: Users can manage their own health records
CREATE POLICY user_own_health_records ON public.health_records
  FOR ALL
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

-- Policy: Doctors can read records for their patients (with active appointment)
CREATE POLICY doctor_read_patient_records ON public.health_records
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.appointments
      WHERE appointments.doctor_id = auth.uid()
        AND appointments.patient_id = health_records.patient_id
        AND appointments.status IN ('scheduled', 'in_progress')
    )
  );

-- Policy: Service role has full access
CREATE POLICY service_role_health_records_full_access ON public.health_records
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- =====================================================
-- 3. APPOINTMENTS TABLE
-- =====================================================

-- Enable RLS
ALTER TABLE IF EXISTS public.appointments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS patient_own_appointments ON public.appointments;
DROP POLICY IF EXISTS doctor_own_appointments ON public.appointments;
DROP POLICY IF EXISTS service_role_appointments_full_access ON public.appointments;

-- Policy: Patients can view/manage their appointments
CREATE POLICY patient_own_appointments ON public.appointments
  FOR ALL
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

-- Policy: Doctors can view/manage appointments where they are the doctor
CREATE POLICY doctor_own_appointments ON public.appointments
  FOR ALL
  USING (auth.uid() = doctor_id)
  WITH CHECK (auth.uid() = doctor_id);

-- Policy: Service role has full access
CREATE POLICY service_role_appointments_full_access ON public.appointments
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- =====================================================
-- 4. PRESCRIPTIONS TABLE
-- =====================================================

-- Enable RLS
ALTER TABLE IF EXISTS public.prescriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS patient_view_own_prescriptions ON public.prescriptions;
DROP POLICY IF EXISTS doctor_manage_prescriptions ON public.prescriptions;
DROP POLICY IF EXISTS service_role_prescriptions_full_access ON public.prescriptions;

-- Policy: Patients can view their prescriptions
CREATE POLICY patient_view_own_prescriptions ON public.prescriptions
  FOR SELECT
  USING (auth.uid() = patient_id);

-- Policy: Doctors can create/update prescriptions for their patients
CREATE POLICY doctor_manage_prescriptions ON public.prescriptions
  FOR ALL
  USING (
    auth.uid() = doctor_id
    OR EXISTS (
      SELECT 1 FROM public.appointments
      WHERE appointments.doctor_id = auth.uid()
        AND appointments.patient_id = prescriptions.patient_id
    )
  )
  WITH CHECK (
    auth.uid() = doctor_id
  );

-- Policy: Service role has full access
CREATE POLICY service_role_prescriptions_full_access ON public.prescriptions
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- =====================================================
-- 5. AUDIT LOGS TABLE (Critical: Service role only)
-- =====================================================

-- Enable RLS
ALTER TABLE IF EXISTS public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS service_role_audit_logs_insert ON public.audit_logs;
DROP POLICY IF EXISTS service_role_audit_logs_read ON public.audit_logs;

-- Policy: Only service role can insert audit logs (append-only)
CREATE POLICY service_role_audit_logs_insert ON public.audit_logs
  FOR INSERT
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Policy: Only service role can read audit logs
CREATE POLICY service_role_audit_logs_read ON public.audit_logs
  FOR SELECT
  USING (auth.role() = 'service_role');

-- No UPDATE or DELETE allowed on audit_logs (append-only)

-- =====================================================
-- 6. ABHA CREDENTIALS TABLE (Encrypted sensitive data)
-- =====================================================

-- Enable RLS
ALTER TABLE IF EXISTS public.abha_credentials ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS user_own_abha_credentials ON public.abha_credentials;
DROP POLICY IF EXISTS service_role_abha_full_access ON public.abha_credentials;

-- Policy: Users can only access their own ABHA credentials
CREATE POLICY user_own_abha_credentials ON public.abha_credentials
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Service role has full access (for NDHM integration)
CREATE POLICY service_role_abha_full_access ON public.abha_credentials
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- =====================================================
-- 7. VERIFICATION & TESTING
-- =====================================================

-- Verify RLS is enabled on all tables
DO $$
DECLARE
  table_record RECORD;
  rls_enabled BOOLEAN;
BEGIN
  FOR table_record IN 
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN ('patients', 'health_records', 'appointments', 'prescriptions', 'audit_logs', 'abha_credentials')
  LOOP
    SELECT relrowsecurity INTO rls_enabled
    FROM pg_class
    WHERE relname = table_record.tablename;
    
    IF NOT rls_enabled THEN
      RAISE EXCEPTION 'RLS not enabled on table: %', table_record.tablename;
    END IF;
    
    RAISE NOTICE 'RLS enabled on: %', table_record.tablename;
  END LOOP;
END $$;

-- =====================================================
-- 8. INDEXES FOR RLS PERFORMANCE
-- =====================================================

-- Index on user_id for patients table (speeds up RLS checks)
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON public.patients(user_id);

-- Index on patient_id for health_records
CREATE INDEX IF NOT EXISTS idx_health_records_patient_id ON public.health_records(patient_id);

-- Index on patient_id and doctor_id for appointments
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON public.appointments(doctor_id);

-- Index on patient_id and doctor_id for prescriptions
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON public.prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor_id ON public.prescriptions(doctor_id);

-- =====================================================
-- DONE: RLS enabled on all PII tables
-- =====================================================

COMMENT ON TABLE public.patients IS 'RLS enabled - users can only access their own data';
COMMENT ON TABLE public.health_records IS 'RLS enabled - patients and authorized doctors only';
COMMENT ON TABLE public.appointments IS 'RLS enabled - patients and doctors involved only';
COMMENT ON TABLE public.prescriptions IS 'RLS enabled - patients view, doctors manage';
COMMENT ON TABLE public.audit_logs IS 'RLS enabled - service role only (append-only)';
COMMENT ON TABLE public.abha_credentials IS 'RLS enabled - encrypted credentials, user-only access';
