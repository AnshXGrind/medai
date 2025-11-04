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
INSERT INTO asha_resource_requests (
  asha_id,
  resource_type,
  patient_name,
  patient_contact,
  village_name,
  urgency,
  status,
  details,
  government_id,
  created_at
)
SELECT
  auth.uid(),
  'Medicine',
  'Demo Patient',
  '+91-9999999999',
  'Sample Village',
  'medium',
  'approved',
  'Sample medicine request for demonstration',
  'JAN-AUS-123456',
  NOW() - INTERVAL '2 days'
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1);
