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

-- Create doctor_profiles table for rates and availability
CREATE TABLE IF NOT EXISTS doctor_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  video_consultation_rate DECIMAL(10, 2),
  face_to_face_rate DECIMAL(10, 2),
  specialization TEXT,
  experience_years INTEGER,
  location TEXT,
  available_days TEXT[], -- Array of days like ['Monday', 'Tuesday']
  available_hours JSONB, -- Store time slots
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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
ALTER TABLE doctor_profiles ENABLE ROW LEVEL SECURITY;
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

-- Doctor profiles policies
CREATE POLICY "Anyone can view doctor profiles"
  ON doctor_profiles FOR SELECT
  USING (TRUE);

CREATE POLICY "Doctors can update their own profile"
  ON doctor_profiles FOR UPDATE
  USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can create their own profile"
  ON doctor_profiles FOR INSERT
  WITH CHECK (auth.uid() = doctor_id);

-- Hospitals policies
CREATE POLICY "Anyone can view hospitals"
  ON hospitals FOR SELECT
  USING (TRUE);

-- Create indexes
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_doctor_profiles_doctor ON doctor_profiles(doctor_id);
CREATE INDEX idx_hospitals_location ON hospitals USING gist(
  ll_to_earth(latitude, longitude)
);

-- Insert sample hospitals
INSERT INTO hospitals (name, address, latitude, longitude, phone, emergency_services) VALUES
  ('AIIMS Delhi', 'Ansari Nagar, New Delhi, Delhi 110029', 28.5672, 77.2100, '+91-11-26588500', TRUE),
  ('Apollo Hospital', 'Sarita Vihar, Delhi, 110076', 28.5355, 77.2860, '+91-11-26925858', TRUE),
  ('Max Super Speciality Hospital', 'Saket, New Delhi, Delhi 110017', 28.5245, 77.2066, '+91-11-26515050', TRUE),
  ('Fortis Hospital', 'Shalimar Bagh, Delhi, 110088', 28.7174, 77.1639, '+91-11-47135000', TRUE),
  ('Sir Ganga Ram Hospital', 'Rajinder Nagar, New Delhi, Delhi 110060', 28.6436, 77.1855, '+91-11-25750000', TRUE);
