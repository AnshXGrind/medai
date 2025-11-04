/**
 * Demo Health ID Profile with mock data (no database required)
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HealthIDCard } from '@/components/HealthIDCard';
import { 
  User, Heart, Shield, FileText, Users, Activity, 
  Calendar, MapPin, Phone, Mail, AlertCircle
} from 'lucide-react';
import { calculateAge } from '@/lib/universalHealthId';

export default function HealthIDProfileDemo() {
  console.log('HealthIDProfileDemo component rendering...');
  
  // Mock Health ID data
  const healthData = {
    healthId: '27-1234-5678-9012',
    fullName: 'John Doe',
    dateOfBirth: '1990-01-15',
    bloodGroup: 'A+',
    gender: 'Male',
    phone: '+91 98765 43210',
    email: 'john.doe@example.com',
    address: '123 Main Street, Andheri West, Mumbai, Maharashtra - 400058',
    verified: true,
    organDonor: true,
    issueDate: '2024-01-15T10:00:00Z',
    aadhaarLinked: true,
    insuranceLinked: true
  };

  // Mock family members
  const familyMembers = [
    {
      id: '1',
      healthId: '27-2345-6789-0123',
      name: 'Jane Doe',
      relation: 'Spouse',
      age: 32,
      bloodGroup: 'B+'
    },
    {
      id: '2',
      healthId: '27-3456-7890-1234',
      name: 'Alice Doe',
      relation: 'Daughter',
      age: 8,
      bloodGroup: 'A+'
    }
  ];

  // Mock vaccination records
  const vaccinations = [
    {
      id: '1',
      vaccineName: 'COVID-19 (Covishield)',
      dose: 'Dose 2',
      date: '2021-08-15',
      nextDue: null,
      center: 'City Hospital, Mumbai'
    },
    {
      id: '2',
      vaccineName: 'Influenza',
      dose: 'Annual',
      date: '2024-09-20',
      nextDue: '2025-09-20',
      center: 'Care Clinic, Mumbai'
    },
    {
      id: '3',
      vaccineName: 'Hepatitis B',
      dose: 'Complete',
      date: '1990-03-01',
      nextDue: null,
      center: 'Government Hospital'
    }
  ];

  // Mock medical records
  const medicalRecords = [
    {
      id: '1',
      type: 'Consultation',
      title: 'Annual Health Checkup',
      date: '2024-10-15',
      doctor: 'Dr. Sharma',
      hospital: 'Apollo Hospital',
      summary: 'Routine checkup - All vitals normal'
    },
    {
      id: '2',
      type: 'Lab Report',
      title: 'Blood Test - Complete',
      date: '2024-09-28',
      doctor: 'Dr. Patel',
      hospital: 'Diagnostic Center',
      summary: 'All parameters within normal range'
    },
    {
      id: '3',
      type: 'Prescription',
      title: 'Vitamin D Supplement',
      date: '2024-08-10',
      doctor: 'Dr. Kumar',
      hospital: 'City Clinic',
      summary: 'Vitamin D3 - 60,000 IU weekly'
    }
  ];

  // Mock insurance
  const insurance = [
    {
      id: '1',
      provider: 'Star Health Insurance',
      policyNumber: 'SH-2024-123456',
      coverageAmount: '₹5,00,000',
      validUntil: '2025-12-31',
      status: 'Active',
      claimsMade: 0
    }
  ];

  // Mock lab reports
  const labReports = [
    {
      id: '1',
      testName: 'Complete Blood Count (CBC)',
      date: '2024-10-01',
      status: 'Normal',
      lab: 'PathLab, Mumbai'
    },
    {
      id: '2',
      testName: 'Lipid Profile',
      date: '2024-09-15',
      status: 'Normal',
      lab: 'Dr. Lal PathLabs'
    },
    {
      id: '3',
      testName: 'Blood Sugar (Fasting)',
      date: '2024-08-20',
      status: 'Normal',
      lab: 'Metropolis Healthcare'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">Health ID Profile</h1>
                <p className="text-muted-foreground">Demo Profile with Sample Data</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-sm">
              🎭 Demo Mode
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Alert Banner */}
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-amber-900 dark:text-amber-100">
                  Demo Profile - Sample Data Only
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  This is a demonstration profile showing how the Health ID system works. 
                  To create a real Health ID, apply the database migration and use the "Create Health ID" page.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health ID Card */}
        <HealthIDCard
          healthId={healthData.healthId}
          fullName={healthData.fullName}
          dateOfBirth={healthData.dateOfBirth}
          bloodGroup={healthData.bloodGroup}
          gender={healthData.gender}
          address={healthData.address}
          verified={healthData.verified}
          organDonor={healthData.organDonor}
          issueDate={healthData.issueDate}
        />

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Age</p>
                  <p className="text-2xl font-bold">{calculateAge(healthData.dateOfBirth)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Family Members</p>
                  <p className="text-2xl font-bold">{familyMembers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Heart className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vaccinations</p>
                  <p className="text-2xl font-bold">{vaccinations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Insurance</p>
                  <p className="text-2xl font-bold">{insurance.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabbed Content */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="family">Family</TabsTrigger>
            <TabsTrigger value="vaccinations">Vaccinations</TabsTrigger>
            <TabsTrigger value="records">Records</TabsTrigger>
            <TabsTrigger value="insurance">Insurance</TabsTrigger>
            <TabsTrigger value="reports">Lab Reports</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Full Name</span>
                    <span className="font-semibold">{healthData.fullName}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Date of Birth</span>
                    <span className="font-semibold">{healthData.dateOfBirth}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Blood Group</span>
                    <span className="font-semibold">{healthData.bloodGroup}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Gender</span>
                    <span className="font-semibold">{healthData.gender}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Organ Donor</span>
                    <span className="font-semibold">{healthData.organDonor ? '✅ Yes' : '❌ No'}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Contact Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground mt-1" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-semibold">{healthData.phone}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground mt-1" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-semibold">{healthData.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                      <div>
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p className="font-semibold">{healthData.address}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Linked Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200">
                    <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                      ✓
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Aadhaar Linked</p>
                      <p className="text-xs text-muted-foreground">Verified</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200">
                    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                      ✓
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Insurance Active</p>
                      <p className="text-xs text-muted-foreground">₹5L Coverage</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200">
                    <div className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
                      3
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Hospital Network</p>
                      <p className="text-xs text-muted-foreground">Linked to 3 hospitals</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Family Tab */}
          <TabsContent value="family" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Family Members ({familyMembers.length})
                  </span>
                  <Button size="sm">Add Member</Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {familyMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{member.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {member.relation} • Age {member.age} • {member.bloodGroup}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono mt-1">
                            {member.healthId}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">View Profile</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vaccinations Tab */}
          <TabsContent value="vaccinations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Vaccination Records ({vaccinations.length})
                  </span>
                  <Button size="sm">Add Vaccination</Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {vaccinations.map((vax) => (
                    <div key={vax.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{vax.vaccineName}</h4>
                          <p className="text-sm text-muted-foreground">{vax.dose}</p>
                        </div>
                        <Badge variant={vax.nextDue ? "default" : "secondary"}>
                          {vax.nextDue ? 'Active' : 'Complete'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                        <div>
                          <p className="text-muted-foreground">Date Given</p>
                          <p className="font-semibold flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {vax.date}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Vaccination Center</p>
                          <p className="font-semibold flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {vax.center}
                          </p>
                        </div>
                      </div>
                      {vax.nextDue && (
                        <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-950/20 rounded border border-amber-200">
                          <p className="text-sm">
                            <strong>Next Due:</strong> {vax.nextDue}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Records Tab */}
          <TabsContent value="records" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Medical Records ({medicalRecords.length})
                  </span>
                  <Button size="sm">Add Record</Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {medicalRecords.map((record) => (
                    <div key={record.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{record.type}</Badge>
                            <h4 className="font-semibold">{record.title}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{record.summary}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {record.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {record.doctor}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {record.hospital}
                            </span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">View</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insurance Tab */}
          <TabsContent value="insurance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Insurance Policies ({insurance.length})
                  </span>
                  <Button size="sm">Link Policy</Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {insurance.map((policy) => (
                    <div key={policy.id} className="p-4 border-2 border-primary/20 rounded-lg bg-primary/5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-lg">{policy.provider}</h4>
                          <p className="text-sm text-muted-foreground font-mono">{policy.policyNumber}</p>
                        </div>
                        <Badge className="bg-green-500">{policy.status}</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Coverage</p>
                          <p className="font-bold text-lg text-primary">{policy.coverageAmount}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Valid Until</p>
                          <p className="font-semibold">{policy.validUntil}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Claims Made</p>
                          <p className="font-semibold">{policy.claimsMade}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lab Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Lab Reports ({labReports.length})
                  </span>
                  <Button size="sm">Upload Report</Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {labReports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div>
                        <h4 className="font-semibold">{report.testName}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {report.lab} • {report.date}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={report.status === 'Normal' ? 'default' : 'destructive'}>
                          {report.status}
                        </Badge>
                        <Button variant="outline" size="sm">View Report</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => window.location.href = '/health-id-demo'}>
                ← Back to Demo
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/create-health-id'}>
                Create Real Health ID
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/'}>
                Go to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
