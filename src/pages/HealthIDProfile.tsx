/**
 * Universal Health ID Profile Page
 * View and manage Health ID with family linking, records, etc.
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { HealthIDCard } from '@/components/HealthIDCard';
import { supabase } from '@/integrations/supabase/client';
import { 
  User, 
  Users, 
  FileText, 
  Syringe, 
  TestTube, 
  Heart,
  CreditCard,
  Calendar,
  AlertCircle,
  Edit,
  Share2,
  Download,
  QrCode,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';

interface AddressData {
  city?: string;
  state?: string;
  pincode?: string;
  address_line?: string;
}

interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

interface HealthIDData {
  id: string;
  health_id_number: string;
  full_name: string;
  date_of_birth: string;
  blood_group?: string;
  photo_url?: string;
  gender?: string;
  address?: AddressData;
  phone_number?: string;
  email?: string;
  verified: boolean;
  organ_donor: boolean;
  created_at: string;
  emergency_contacts?: EmergencyContact[];
}

interface FamilyMemberData {
  id: string;
  relationship: string;
  member?: {
    health_id_number: string;
    full_name: string;
    date_of_birth: string;
    blood_group?: string;
  };
}

interface VaccinationData {
  id: string;
  vaccine_name: string;
  dose_number: number;
  total_doses?: number;
  administered_date: string;
  hospital_name?: string;
  status: string;
}

interface MedicalRecordData {
  id: string;
  disease_name?: string;
  record_type: string;
  diagnosis_date: string;
  diagnosis?: string;
  doctor_name?: string;
}

interface InsurancePolicyData {
  id: string;
  provider_name: string;
  policy_type: string;
  policy_number: string;
  coverage_amount: number;
  end_date: string;
  status: string;
}

export default function HealthIDProfile() {
  const { healthId } = useParams<{ healthId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [healthIdData, setHealthIdData] = useState<HealthIDData | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberData[]>([]);
  const [vaccinations, setVaccinations] = useState<VaccinationData[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecordData[]>([]);
  const [insurancePolicies, setInsurancePolicies] = useState<InsurancePolicyData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      await loadHealthIDData();
    };
    fetchData();
  }, [healthId]);

  const loadHealthIDData = async () => {
    try {
      setLoading(true);

      // Load health ID data
      const { data: healthData, error: healthError } = await supabase
        .from('health_ids')
        .select('*')
        .eq('health_id_number', healthId)
        .single();

      if (healthError) throw healthError;
      setHealthIdData(healthData);

      // Load family members
      const { data: familyData } = await supabase
        .from('family_members')
        .select(`
          *,
          member:member_health_id (
            health_id_number,
            full_name,
            date_of_birth,
            blood_group
          )
        `)
        .eq('primary_health_id', healthData.id);

      setFamilyMembers(familyData || []);

      // Load vaccinations
      const { data: vaccinationsData } = await supabase
        .from('vaccinations')
        .select('*')
        .eq('health_id', healthData.id)
        .order('administered_date', { ascending: false })
        .limit(10);

      setVaccinations(vaccinationsData || []);

      // Load medical records
      const { data: recordsData } = await supabase
        .from('medical_records')
        .select('*')
        .eq('health_id', healthData.id)
        .order('diagnosis_date', { ascending: false })
        .limit(10);

      setMedicalRecords(recordsData || []);

      // Load insurance policies
      const { data: insuranceData } = await supabase
        .from('insurance_policies')
        .select('*')
        .eq('health_id', healthData.id)
        .eq('status', 'active');

      setInsurancePolicies(insuranceData || []);

    } catch (error) {
      console.error('Failed to load health ID data:', error);
      toast.error('Failed to load health ID information');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading Health ID...</p>
        </div>
      </div>
    );
  }

  if (!healthIdData) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Health ID not found. Please check the ID and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Universal Health ID</h1>
          <p className="text-muted-foreground">Complete health profile and records</p>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>

      {/* Health ID Card */}
      <HealthIDCard
        healthId={healthIdData.health_id_number}
        fullName={healthIdData.full_name}
        dateOfBirth={healthIdData.date_of_birth}
        bloodGroup={healthIdData.blood_group}
        photoUrl={healthIdData.photo_url}
        gender={healthIdData.gender}
        address={healthIdData.address ? `${healthIdData.address.city}, ${healthIdData.address.state}` : undefined}
        verified={healthIdData.verified}
        organDonor={healthIdData.organ_donor}
        issueDate={healthIdData.created_at}
      />

      {/* Tabs for different sections */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">
            <User className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="family">
            <Users className="h-4 w-4 mr-2" />
            Family
          </TabsTrigger>
          <TabsTrigger value="vaccinations">
            <Syringe className="h-4 w-4 mr-2" />
            Vaccinations
          </TabsTrigger>
          <TabsTrigger value="records">
            <FileText className="h-4 w-4 mr-2" />
            Records
          </TabsTrigger>
          <TabsTrigger value="insurance">
            <CreditCard className="h-4 w-4 mr-2" />
            Insurance
          </TabsTrigger>
          <TabsTrigger value="reports">
            <TestTube className="h-4 w-4 mr-2" />
            Reports
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{healthIdData.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">
                    {new Date(healthIdData.date_of_birth).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="font-medium capitalize">{healthIdData.gender || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Blood Group</p>
                  <p className="font-medium">{healthIdData.blood_group || 'Not specified'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{healthIdData.phone_number || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{healthIdData.email || 'Not provided'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contacts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Emergency Contacts</CardTitle>
              </CardHeader>
              <CardContent>
                {healthIdData.emergency_contacts && healthIdData.emergency_contacts.length > 0 ? (
                  <div className="space-y-2">
                    {healthIdData.emergency_contacts.map((contact: EmergencyContact, index: number) => (
                      <div key={index} className="p-2 bg-muted rounded">
                        <p className="font-medium text-sm">{contact.name}</p>
                        <p className="text-xs text-muted-foreground">{contact.phone}</p>
                        <p className="text-xs text-muted-foreground capitalize">{contact.relationship}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No emergency contacts added</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{vaccinations.length}</p>
                    <p className="text-xs text-muted-foreground">Vaccinations</p>
                  </div>
                  <Syringe className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{medicalRecords.length}</p>
                    <p className="text-xs text-muted-foreground">Medical Records</p>
                  </div>
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{insurancePolicies.length}</p>
                    <p className="text-xs text-muted-foreground">Insurance Policies</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{familyMembers.length}</p>
                    <p className="text-xs text-muted-foreground">Family Members</p>
                  </div>
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Family Tab */}
        <TabsContent value="family" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Family Members</h3>
            <Button>
              <Users className="h-4 w-4 mr-2" />
              Link Family Member
            </Button>
          </div>

          {familyMembers.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {familyMembers.map((member) => (
                <Card key={member.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{member.member?.full_name}</h4>
                        <Badge variant="outline" className="capitalize">{member.relationship}</Badge>
                      </div>
                      <p className="text-sm font-mono text-muted-foreground">
                        {member.member?.health_id_number}
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <span>{member.member?.blood_group}</span>
                        <span>•</span>
                        <span>
                          {member.member?.date_of_birth && 
                            new Date(member.member.date_of_birth).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No family members linked yet
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Vaccinations Tab */}
        <TabsContent value="vaccinations" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Vaccination History</h3>
            <Button>
              <Syringe className="h-4 w-4 mr-2" />
              Add Vaccination
            </Button>
          </div>

          {vaccinations.length > 0 ? (
            <div className="space-y-3">
              {vaccinations.map((vaccination) => (
                <Card key={vaccination.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-semibold">{vaccination.vaccine_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Dose {vaccination.dose_number} of {vaccination.total_doses || '?'}
                        </p>
                        <p className="text-sm">
                          Administered: {new Date(vaccination.administered_date).toLocaleDateString('en-IN')}
                        </p>
                        {vaccination.hospital_name && (
                          <p className="text-sm text-muted-foreground">{vaccination.hospital_name}</p>
                        )}
                      </div>
                      <Badge variant={vaccination.status === 'completed' ? 'default' : 'secondary'}>
                        {vaccination.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No vaccination records found
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Medical Records Tab */}
        <TabsContent value="records" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Medical History</h3>
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Add Record
            </Button>
          </div>

          {medicalRecords.length > 0 ? (
            <div className="space-y-3">
              {medicalRecords.map((record) => (
                <Card key={record.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{record.disease_name || record.record_type}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(record.diagnosis_date).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                        <Badge variant="outline" className="capitalize">{record.record_type}</Badge>
                      </div>
                      {record.diagnosis && (
                        <p className="text-sm">{record.diagnosis}</p>
                      )}
                      {record.doctor_name && (
                        <p className="text-sm text-muted-foreground">
                          Dr. {record.doctor_name}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No medical records found
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Insurance Tab */}
        <TabsContent value="insurance" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Insurance Policies</h3>
            <Button>
              <CreditCard className="h-4 w-4 mr-2" />
              Add Policy
            </Button>
          </div>

          {insurancePolicies.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {insurancePolicies.map((policy) => (
                <Card key={policy.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{policy.provider_name}</h4>
                          <p className="text-sm text-muted-foreground capitalize">{policy.policy_type}</p>
                        </div>
                        <Badge>{policy.status}</Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm">
                          <span className="text-muted-foreground">Policy No:</span> {policy.policy_number}
                        </p>
                        <p className="text-sm">
                          <span className="text-muted-foreground">Coverage:</span> ₹{policy.coverage_amount.toLocaleString('en-IN')}
                        </p>
                        <p className="text-sm">
                          <span className="text-muted-foreground">Valid till:</span> {new Date(policy.end_date).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No insurance policies found
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Lab Reports</h3>
            <Button>
              <TestTube className="h-4 w-4 mr-2" />
              Upload Report
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No lab reports available
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
