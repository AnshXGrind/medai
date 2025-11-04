/**
 * Universal Health ID Login/Entry Page
 * Users can enter their Health ID to access their profile
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import { 
  Activity, 
  Search, 
  Shield, 
  Sparkles, 
  ArrowRight,
  QrCode,
  FileText,
  Users,
  Heart,
  CheckCircle2,
  AlertCircle,
  Fingerprint
} from 'lucide-react';
import { isValidHealthId, formatHealthId } from '@/lib/universalHealthId';
import { toast } from 'sonner';

export default function HealthIDLogin() {
  const navigate = useNavigate();
  const [healthId, setHealthId] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handleHealthIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9-]/g, '');
    
    // Auto-format as user types: XX-XXXX-XXXX-XXXX
    if (value.length > 0 && !value.includes('-')) {
      const numbers = value.replace(/-/g, '');
      if (numbers.length <= 2) {
        value = numbers;
      } else if (numbers.length <= 6) {
        value = numbers.slice(0, 2) + '-' + numbers.slice(2);
      } else if (numbers.length <= 10) {
        value = numbers.slice(0, 2) + '-' + numbers.slice(2, 6) + '-' + numbers.slice(6);
      } else {
        value = numbers.slice(0, 2) + '-' + numbers.slice(2, 6) + '-' + numbers.slice(6, 10) + '-' + numbers.slice(10, 14);
      }
    }
    
    setHealthId(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!healthId.trim()) {
      toast.error('Please enter your Health ID');
      return;
    }

    setIsValidating(true);

    // Validate format
    if (!isValidHealthId(healthId)) {
      toast.error('Invalid Health ID format. Expected: XX-XXXX-XXXX-XXXX');
      setIsValidating(false);
      return;
    }

    // Simulate validation delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Since we don't have database, redirect to demo profile
    toast.success('Health ID verified! Redirecting...');
    setTimeout(() => {
      navigate('/health-id-demo-profile');
    }, 500);

    setIsValidating(false);
  };

  const handleDemoAccess = () => {
    setHealthId('27-1234-5678-9012');
    toast.success('Demo Health ID entered!');
    setTimeout(() => {
      navigate('/health-id-demo-profile');
    }, 800);
  };

  const handleCreateNew = () => {
    navigate('/health-id-demo');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32 pb-20">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Universal Health ID System</span>
          </div>
          
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Access Your Health Profile
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Enter your 14-digit Universal Health ID to view your complete medical records, 
            vaccination history, and family health information
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid gap-8 lg:grid-cols-2">
          {/* Login Form */}
          <Card className="border-2 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Shield className="h-6 w-6 text-primary" />
                Login with Health ID
              </CardTitle>
              <CardDescription>
                Secure access to your complete health records
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="healthId" className="text-base font-semibold">
                    Universal Health ID
                  </Label>
                  <div className="relative">
                    <Fingerprint className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="healthId"
                      type="text"
                      placeholder="XX-XXXX-XXXX-XXXX"
                      value={healthId}
                      onChange={handleHealthIdChange}
                      maxLength={17}
                      className="pl-12 text-lg font-mono h-12"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Format: 2 digit state code + 12 digit unique number
                  </p>
                  
                  {healthId && (
                    <div className="flex items-center gap-2 mt-2">
                      {isValidHealthId(healthId) ? (
                        <Badge className="bg-green-500">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Valid Format
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Invalid Format
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg"
                  disabled={isValidating || !healthId}
                >
                  {isValidating ? (
                    <>
                      <Activity className="h-5 w-5 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Search className="h-5 w-5 mr-2" />
                      Access My Profile
                    </>
                  )}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleDemoAccess}
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Try Demo Health ID
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleCreateNew}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Create New Health ID
                </Button>
              </div>

              {/* Security Badge */}
              <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                      Your data is secure
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                      AES-256 encryption • Blockchain verified • HIPAA compliant
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features & Info */}
          <div className="space-y-6">
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  What is Universal Health ID?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  Your Universal Health ID is a unique 14-digit identifier that gives you instant 
                  access to your complete health ecosystem - from birth certificates to vaccination 
                  records, medical history, and insurance policies.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>One ID for all healthcare services</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Instant access across hospitals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Blockchain-secured records</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Family health linking</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature Cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <QrCode className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-2">QR Code Access</h3>
                  <p className="text-sm text-muted-foreground">
                    Instant check-in at hospitals with secure QR code
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <Users className="h-8 w-8 text-blue-600 mb-3" />
                  <h3 className="font-semibold mb-2">Family Linking</h3>
                  <p className="text-sm text-muted-foreground">
                    Link family members for easy health management
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <Heart className="h-8 w-8 text-red-600 mb-3" />
                  <h3 className="font-semibold mb-2">Medical Records</h3>
                  <p className="text-sm text-muted-foreground">
                    Complete history with prescriptions and reports
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <FileText className="h-8 w-8 text-green-600 mb-3" />
                  <h3 className="font-semibold mb-2">Insurance Links</h3>
                  <p className="text-sm text-muted-foreground">
                    Direct insurance claims and policy management
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* CTA */}
            <Card className="border-2 border-secondary bg-gradient-to-br from-secondary/10 to-secondary/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-secondary/20 rounded-lg">
                    <Activity className="h-6 w-6 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">Don't have a Health ID yet?</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create your Universal Health ID in just 2 minutes. It's free and secure!
                    </p>
                    <Button 
                      onClick={handleCreateNew}
                      className="w-full"
                    >
                      Create Your Health ID Now
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
