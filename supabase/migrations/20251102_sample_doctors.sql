-- Create sample doctor users and profiles
-- Note: In production, doctors would register through the app
-- This is for testing and demonstration purposes

-- First, ensure the appointments table has realtime enabled
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

-- Sample Doctor 1: Dr. Rajesh Kumar - General Physician
DO $$
DECLARE
  doctor1_id UUID := '11111111-1111-1111-1111-111111111111';
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, full_name, created_at, updated_at)
  VALUES (doctor1_id, 'Dr. Rajesh Kumar', NOW(), NOW())
  ON CONFLICT (id) DO UPDATE
  SET full_name = 'Dr. Rajesh Kumar';

  -- Insert role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (doctor1_id, 'doctor')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Insert doctor profile (using the schema from 20251029 migration)
  INSERT INTO public.doctor_profiles (user_id, medical_id, specialty, consultation_fee, is_verified, is_online, created_at)
  VALUES (doctor1_id, 'MCI-12345', 'General Physician', 500, TRUE, TRUE, NOW())
  ON CONFLICT (user_id) DO UPDATE
  SET medical_id = 'MCI-12345',
      specialty = 'General Physician',
      consultation_fee = 500,
      is_verified = TRUE,
      is_online = TRUE;
END $$;

-- Sample Doctor 2: Dr. Priya Sharma - Cardiologist
DO $$
DECLARE
  doctor2_id UUID := '22222222-2222-2222-2222-222222222222';
BEGIN
  INSERT INTO public.profiles (id, full_name, created_at, updated_at)
  VALUES (doctor2_id, 'Dr. Priya Sharma', NOW(), NOW())
  ON CONFLICT (id) DO UPDATE
  SET full_name = 'Dr. Priya Sharma';

  INSERT INTO public.user_roles (user_id, role)
  VALUES (doctor2_id, 'doctor')
  ON CONFLICT (user_id, role) DO NOTHING;

  INSERT INTO public.doctor_profiles (user_id, medical_id, specialty, consultation_fee, is_verified, is_online, created_at)
  VALUES (doctor2_id, 'MCI-67890', 'Cardiologist', 1000, TRUE, TRUE, NOW())
  ON CONFLICT (user_id) DO UPDATE
  SET medical_id = 'MCI-67890',
      specialty = 'Cardiologist',
      consultation_fee = 1000,
      is_verified = TRUE,
      is_online = TRUE;
END $$;

-- Sample Doctor 3: Dr. Amit Patel - Pediatrician
DO $$
DECLARE
  doctor3_id UUID := '33333333-3333-3333-3333-333333333333';
BEGIN
  INSERT INTO public.profiles (id, full_name, created_at, updated_at)
  VALUES (doctor3_id, 'Dr. Amit Patel', NOW(), NOW())
  ON CONFLICT (id) DO UPDATE
  SET full_name = 'Dr. Amit Patel';

  INSERT INTO public.user_roles (user_id, role)
  VALUES (doctor3_id, 'doctor')
  ON CONFLICT (user_id, role) DO NOTHING;

  INSERT INTO public.doctor_profiles (user_id, medical_id, specialty, consultation_fee, is_verified, is_online, created_at)
  VALUES (doctor3_id, 'MCI-54321', 'Pediatrician', 600, TRUE, TRUE, NOW())
  ON CONFLICT (user_id) DO UPDATE
  SET medical_id = 'MCI-54321',
      specialty = 'Pediatrician',
      consultation_fee = 600,
      is_verified = TRUE,
      is_online = TRUE;
END $$;

-- Sample Doctor 4: Dr. Sunita Reddy - Dermatologist
DO $$
DECLARE
  doctor4_id UUID := '44444444-4444-4444-4444-444444444444';
BEGIN
  INSERT INTO public.profiles (id, full_name, created_at, updated_at)
  VALUES (doctor4_id, 'Dr. Sunita Reddy', NOW(), NOW())
  ON CONFLICT (id) DO UPDATE
  SET full_name = 'Dr. Sunita Reddy';

  INSERT INTO public.user_roles (user_id, role)
  VALUES (doctor4_id, 'doctor')
  ON CONFLICT (user_id, role) DO NOTHING;

  INSERT INTO public.doctor_profiles (user_id, medical_id, specialty, consultation_fee, is_verified, is_online, created_at)
  VALUES (doctor4_id, 'MCI-98765', 'Dermatologist', 700, TRUE, TRUE, NOW())
  ON CONFLICT (user_id) DO UPDATE
  SET medical_id = 'MCI-98765',
      specialty = 'Dermatologist',
      consultation_fee = 700,
      is_verified = TRUE,
      is_online = TRUE;
END $$;

-- Sample Doctor 5: Dr. Vikram Singh - Orthopedic Surgeon
DO $$
DECLARE
  doctor5_id UUID := '55555555-5555-5555-5555-555555555555';
BEGIN
  INSERT INTO public.profiles (id, full_name, created_at, updated_at)
  VALUES (doctor5_id, 'Dr. Vikram Singh', NOW(), NOW())
  ON CONFLICT (id) DO UPDATE
  SET full_name = 'Dr. Vikram Singh';

  INSERT INTO public.user_roles (user_id, role)
  VALUES (doctor5_id, 'doctor')
  ON CONFLICT (user_id, role) DO NOTHING;

  INSERT INTO public.doctor_profiles (user_id, medical_id, specialty, consultation_fee, is_verified, is_online, created_at)
  VALUES (doctor5_id, 'MCI-11223', 'Orthopedic Surgeon', 1200, TRUE, TRUE, NOW())
  ON CONFLICT (user_id) DO UPDATE
  SET medical_id = 'MCI-11223',
      specialty = 'Orthopedic Surgeon',
      consultation_fee = 1200,
      is_verified = TRUE,
      is_online = TRUE;
END $$;
