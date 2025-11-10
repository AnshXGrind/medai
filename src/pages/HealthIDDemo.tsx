/**
 * Demo page to showcase Universal Health ID components
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HealthIDCard } from '@/components/HealthIDCard';
import QRCodeGenerator from '@/components/QRCodeGenerator';
import { 
  generateHealthId, 
  isValidHealthId, 
  formatHealthId,
  generateHealthIdQRData,
  getStateCode,
  calculateAge
} from '@/lib/universalHealthId';
import { Activity, IdCard, QrCode, FileText, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function HealthIDDemo() {
  const [generatedId, setGeneratedId] = useState('');
  const [validationResult, setValidationResult] = useState('');
  const [qrData, setQrData] = useState('');
  const [testId, setTestId] = useState('27-1234-5678-9012');

  const handleGenerateId = async () => {
    try {
      const stateCode = getStateCode('Maharashtra');
      const id = await generateHealthId(stateCode);
      setGeneratedId(id);
      toast.success('Health ID generated!');
    } catch (error) {
      toast.error('Failed to generate Health ID');
    }
  };

  const handleValidate = () => {
    const isValid = isValidHealthId(testId);
    setValidationResult(isValid ? '✅ Valid Health ID format' : '❌ Invalid format');
  };

  const handleGenerateQR = () => {
    const data = generateHealthIdQRData(
      '27-1234-5678-9012',
      'Demo User',
      '1990-01-15'
    );
    setQrData(data);
    toast.success('QR code generated!');
  };

  // Sample data for demo card
  const sampleHealthData = {
    healthId: '27-1234-5678-9012',
    fullName: 'John Doe',
    dateOfBirth: '1990-01-15',
    bloodGroup: 'A+',
    gender: 'Male',
    address: 'Mumbai, Maharashtra',
    verified: true,
    organDonor: true,
    issueDate: new Date().toISOString()
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Universal Health ID - Demo</h1>
              <p className="text-muted-foreground">Test all new features and components</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="card" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="card">
              <IdCard className="h-4 w-4 mr-2" />
              Health ID Card
            </TabsTrigger>
            <TabsTrigger value="generator">
              <Activity className="h-4 w-4 mr-2" />
              ID Generator
            </TabsTrigger>
            <TabsTrigger value="qr">
              <QrCode className="h-4 w-4 mr-2" />
              QR Code
            </TabsTrigger>
            <TabsTrigger value="utils">
              <FileText className="h-4 w-4 mr-2" />
              Utilities
            </TabsTrigger>
          </TabsList>

          {/* Health ID Card Demo */}
          <TabsContent value="card" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IdCard className="h-5 w-5" />
                  Digital Health ID Card
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold mb-2">✨ Features:</h3>
                  <ul className="space-y-1 text-sm">
                    <li>✅ Aadhaar-like professional design</li>
                    <li>✅ Embedded QR code for verification</li>
                    <li>✅ Download as PDF functionality</li>
                    <li>✅ Share via Web Share API</li>
                    <li>✅ Blood group & organ donor badges</li>
                    <li>✅ Emergency ICE notice</li>
                    <li>✅ Mini wallet card version</li>
                    <li>✅ Fully responsive & dark mode</li>
                  </ul>
                </div>

                <HealthIDCard
                  healthId={sampleHealthData.healthId}
                  fullName={sampleHealthData.fullName}
                  dateOfBirth={sampleHealthData.dateOfBirth}
                  bloodGroup={sampleHealthData.bloodGroup}
                  gender={sampleHealthData.gender}
                  address={sampleHealthData.address}
                  verified={sampleHealthData.verified}
                  organDonor={sampleHealthData.organDonor}
                  issueDate={sampleHealthData.issueDate}
                />

                <div className="flex gap-3">
                  <Button 
                    className="flex-1" 
                    size="lg"
                    onClick={() => window.location.href = '/health-id-demo-profile'}
                  >
                    View Full Profile with All Tabs →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ID Generator Demo */}
          <TabsContent value="generator" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Generate Health ID
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                    <p className="text-sm font-semibold mb-2">📋 Format: XX-XXXX-XXXX-XXXX</p>
                    <ul className="text-xs space-y-1">
                      <li>• XX: State Code (e.g., 27 = Maharashtra)</li>
                      <li>• XXXX: District Code</li>
                      <li>• XXXX-XXXX: Unique Number</li>
                    </ul>
                  </div>

                  <Button onClick={handleGenerateId} className="w-full" size="lg">
                    Generate New Health ID
                  </Button>

                  {generatedId && (
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        Generated Health ID:
                      </p>
                      <p className="font-mono text-2xl font-bold text-green-700 dark:text-green-400">
                        {generatedId}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        This ID is unique and ready to be stored in the database
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">State Codes:</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 bg-muted rounded">Maharashtra: 27</div>
                      <div className="p-2 bg-muted rounded">Delhi: 07</div>
                      <div className="p-2 bg-muted rounded">Karnataka: 29</div>
                      <div className="p-2 bg-muted rounded">Gujarat: 24</div>
                      <div className="p-2 bg-muted rounded">Tamil Nadu: 33</div>
                      <div className="p-2 bg-muted rounded">UP: 09</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Validate Health ID
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="testId">Enter Health ID to Validate</Label>
                    <Input
                      id="testId"
                      value={testId}
                      onChange={(e) => setTestId(e.target.value)}
                      placeholder="27-1234-5678-9012"
                      className="font-mono"
                    />
                  </div>

                  <Button onClick={handleValidate} className="w-full" variant="outline">
                    Validate Format
                  </Button>

                  {validationResult && (
                    <div className={`p-4 rounded-lg border ${
                      validationResult.includes('✅') 
                        ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                    }`}>
                      <p className="font-semibold">{validationResult}</p>
                    </div>
                  )}

                  <div className="space-y-2 text-sm">
                    <h4 className="font-semibold">Validation Rules:</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>✓ Must be 14 digits total</li>
                      <li>✓ Format: XX-XXXX-XXXX-XXXX</li>
                      <li>✓ Contains only numbers and dashes</li>
                      <li>✓ State code must be valid (01-37)</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* QR Code Demo */}
          <TabsContent value="qr" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  QR Code Generator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Button onClick={handleGenerateQR} className="w-full" size="lg">
                  Generate QR Code for Demo ID
                </Button>

                {qrData && (
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <h3 className="font-semibold">QR Code Preview:</h3>
                      <div className="flex justify-center p-6 bg-white rounded-lg border-2 border-dashed">
                        <QRCodeGenerator
                          value={qrData}
                          size={250}
                          errorCorrectionLevel="H"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold">QR Code Data:</h3>
                      <pre className="p-4 bg-muted rounded-lg text-xs overflow-auto max-h-[300px]">
                        {JSON.stringify(JSON.parse(qrData), null, 2)}
                      </pre>
                      <div className="space-y-2 text-sm">
                        <p className="font-semibold">Features:</p>
                        <ul className="space-y-1 text-muted-foreground">
                          <li>✓ High error correction (Level H)</li>
                          <li>✓ Scannable from 3+ meters</li>
                          <li>✓ Contains: ID, Name, DOB, Timestamp</li>
                          <li>✓ Secure JSON format</li>
                          <li>✓ Version controlled</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {!qrData && (
                  <div className="text-center py-12 text-muted-foreground">
                    <QrCode className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Click the button above to generate a QR code</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Utilities Demo */}
          <TabsContent value="utils" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Utility Functions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-muted rounded">
                      <p className="font-mono text-sm font-semibold mb-1">calculateAge()</p>
                      <p className="text-xs text-muted-foreground">
                        Age from DOB: {calculateAge('1990-01-15')} years
                      </p>
                    </div>

                    <div className="p-3 bg-muted rounded">
                      <p className="font-mono text-sm font-semibold mb-1">formatHealthId()</p>
                      <p className="text-xs text-muted-foreground">
                        27123456789012 → 27-1234-5678-9012
                      </p>
                    </div>

                    <div className="p-3 bg-muted rounded">
                      <p className="font-mono text-sm font-semibold mb-1">getStateCode()</p>
                      <p className="text-xs text-muted-foreground">
                        Maharashtra → 27
                      </p>
                    </div>

                    <div className="p-3 bg-muted rounded">
                      <p className="font-mono text-sm font-semibold mb-1">maskAadhaar()</p>
                      <p className="text-xs text-muted-foreground">
                        123456789012 → XXXX XXXX 9012
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Database Tables</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold mb-3">16 tables created:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        'health_ids',
                        'family_members',
                        'birth_certificates',
                        'vaccinations',
                        'medical_records',
                        'insurance_policies',
                        'lab_reports',
                        'hospitals',
                        'doctors',
                        'prescriptions',
                        'appointments',
                        'health_statistics',
                        'disease_outbreaks',
                        'emergency_contacts',
                        'insurance_claims',
                        'audit_logs'
                      ].map((table) => (
                        <div key={table} className="p-2 bg-primary/5 rounded text-xs font-mono">
                          {table}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 md:grid-cols-3">
                  <Button variant="outline" className="justify-start" onClick={() => window.location.href = '/create-health-id'}>
                    Create Health ID
                  </Button>
                  <Button variant="outline" className="justify-start" onClick={() => window.location.href = '/health-id-demo-profile'}>
                    View Sample Profile
                  </Button>
                  <Button variant="outline" className="justify-start" onClick={() => window.location.href = '/patient-dashboard'}>
                    Patient Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
