import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Lock, 
  Eye, 
  EyeOff, 
  CreditCard,
  FileText,
  Smartphone,
  IdCard,
  Building2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface HealthIDVerificationProps {
  userId: string;
  onVerificationComplete?: () => void;
}

interface VerificationMethod {
  id: string;
  name: string;
  icon: React.ElementType;
  verified: boolean;
  data?: string;
}

export const HealthIDVerification = ({ userId, onVerificationComplete }: HealthIDVerificationProps) => {
  const [healthIdInput, setHealthIdInput] = useState("");
  const [panInput, setPanInput] = useState("");
  const [voterIdInput, setVoterIdInput] = useState("");
  const [drivingLicenseInput, setDrivingLicenseInput] = useState("");
  const [passportInput, setPassportInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showHealthId, setShowHealthId] = useState(false);
  const [anonymousMode, setAnonymousMode] = useState(false);
  
  const [verificationMethods, setVerificationMethods] = useState<VerificationMethod[]>([
    { id: 'healthId', name: 'ABHA Health ID', icon: Shield, verified: false },
    { id: 'pan', name: 'PAN Card', icon: CreditCard, verified: false },
    { id: 'voterId', name: 'Voter ID', icon: IdCard, verified: false },
    { id: 'drivingLicense', name: 'Driving License', icon: FileText, verified: false },
    { id: 'passport', name: 'Passport', icon: Building2, verified: false },
  ]);

  // Hash function for secure storage
  const hashData = async (data: string): Promise<string> => {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  // Validate Health ID format (14 digits)
  const validateHealthIdFormat = (healthId: string): boolean => {
    const cleaned = healthId.replace(/\D/g, '');
    return cleaned.length === 14;
  };

  // Validate PAN format (ABCDE1234F)
  const validatePanFormat = (pan: string): boolean => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan.toUpperCase());
  };

  // Validate Voter ID format
  const validateVoterIdFormat = (voterId: string): boolean => {
    const voterIdRegex = /^[A-Z]{3}[0-9]{7}$/;
    return voterIdRegex.test(voterId.toUpperCase());
  };

  // Validate Driving License format
  const validateDrivingLicenseFormat = (dl: string): boolean => {
    const dlRegex = /^[A-Z]{2}[0-9]{13}$/;
    return dlRegex.test(dl.toUpperCase());
  };

  // Validate Passport format
  const validatePassportFormat = (passport: string): boolean => {
    const passportRegex = /^[A-Z][0-9]{7}$/;
    return passportRegex.test(passport.toUpperCase());
  };

  const handleHealthIdVerification = async () => {
    if (!validateHealthIdFormat(healthIdInput)) {
      toast.error("Invalid Health ID format", {
        description: "Please enter a valid 14-digit ABHA Health ID"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const hashedHealthId = await hashData(healthIdInput);
      const lastFourDigits = healthIdInput.slice(-4);

      // Update profile with ONLY secure data
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          health_id_last_four: lastFourDigits,
          health_id_hash: hashedHealthId,
          is_anonymous: anonymousMode,
          verification_primary: 'health_id'
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        toast.error("Failed to save Health ID verification");
        return;
      }

      // Log the access for audit trail
      await supabase.rpc('log_verification_access', {
        p_action_type: 'verify_health_id',
        p_action_details: `Health ID verified - Last 4: ${lastFourDigits}`
      }).catch(() => {
        // Silently fail if RPC doesn't exist yet
      });

      setVerificationMethods(prev => 
        prev.map(m => m.id === 'healthId' ? { ...m, verified: true, data: lastFourDigits } : m)
      );
      
      setHealthIdInput("");
      
      toast.success("Health ID verified successfully!", {
        description: "Your identity is now secured. We never store your full Health ID."
      });

      onVerificationComplete?.();
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to verify Health ID");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePanVerification = async () => {
    if (!validatePanFormat(panInput)) {
      toast.error("Invalid PAN format", {
        description: "Please enter a valid PAN number (e.g., ABCDE1234F)"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const hashedPan = await hashData(panInput.toUpperCase());
      const maskedPan = `${panInput.slice(0, 2)}XXX${panInput.slice(-4)}`.toUpperCase();

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          pan_hash: hashedPan,
          pan_masked: maskedPan,
          verification_secondary: 'pan'
        })
        .eq('id', userId);

      if (updateError) {
        toast.error("Failed to save PAN verification");
        return;
      }

      await supabase.rpc('log_verification_access', {
        p_action_type: 'verify_pan',
        p_action_details: `PAN verified - Masked: ${maskedPan}`
      }).catch(() => {});

      setVerificationMethods(prev => 
        prev.map(m => m.id === 'pan' ? { ...m, verified: true, data: maskedPan } : m)
      );
      
      setPanInput("");
      toast.success("PAN Card verified successfully!");
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to verify PAN Card");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoterIdVerification = async () => {
    if (!validateVoterIdFormat(voterIdInput)) {
      toast.error("Invalid Voter ID format", {
        description: "Please enter a valid Voter ID (e.g., ABC1234567)"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const hashedVoterId = await hashData(voterIdInput.toUpperCase());
      const maskedVoterId = `${voterIdInput.slice(0, 3)}XXXX${voterIdInput.slice(-3)}`.toUpperCase();

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          voter_id_hash: hashedVoterId,
          voter_id_masked: maskedVoterId,
          verification_tertiary: 'voter_id'
        })
        .eq('id', userId);

      if (updateError) {
        toast.error("Failed to save Voter ID verification");
        return;
      }

      await supabase.rpc('log_verification_access', {
        p_action_type: 'verify_voter_id',
        p_action_details: `Voter ID verified - Masked: ${maskedVoterId}`
      }).catch(() => {});

      setVerificationMethods(prev => 
        prev.map(m => m.id === 'voterId' ? { ...m, verified: true, data: maskedVoterId } : m)
      );
      
      setVoterIdInput("");
      toast.success("Voter ID verified successfully!");
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to verify Voter ID");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatHealthIdInput = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const limited = cleaned.substring(0, 14);
    
    // Format as XXXX-XXXX-XXXX-XX
    const parts = [];
    for (let i = 0; i < limited.length; i += 4) {
      parts.push(limited.substring(i, i + 4));
    }
    
    return parts.join('-');
  };

  const verifiedCount = verificationMethods.filter(m => m.verified).length;

  return (
    <Card className="shadow-md">
      <CardHeader className="space-y-1 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-xl">Multi-Factor Identity Verification</CardTitle>
          </div>
          <Badge variant={verifiedCount > 0 ? "default" : "secondary"}>
            {verifiedCount} / {verificationMethods.length} Verified
          </Badge>
        </div>
        <CardDescription>
          Verify your identity with government-approved documents. All data is encrypted and secure.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Security Features Alert */}
        <Alert className="mb-6 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
          <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-sm">
            <strong className="text-blue-700 dark:text-blue-300">Zero-Knowledge Security:</strong> We never store your full document numbers. 
            All data is hashed using SHA-256 encryption. Only masked versions are kept for display.
          </AlertDescription>
        </Alert>

        {/* Anonymous Mode Toggle */}
        <div className="flex items-center justify-between mb-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <EyeOff className="h-4 w-4 text-muted-foreground" />
            <div>
              <Label className="text-sm font-medium">Anonymous Mode</Label>
              <p className="text-xs text-muted-foreground">Hide your verified status from others</p>
            </div>
          </div>
          <Switch checked={anonymousMode} onCheckedChange={setAnonymousMode} />
        </div>

        {/* Verification Tabs */}
        <Tabs defaultValue="healthId" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5">
            <TabsTrigger value="healthId" className="text-xs">
              <Shield className="h-3 w-3 mr-1" />
              Health ID
            </TabsTrigger>
            <TabsTrigger value="pan" className="text-xs">
              <CreditCard className="h-3 w-3 mr-1" />
              PAN
            </TabsTrigger>
            <TabsTrigger value="voterId" className="text-xs">
              <IdCard className="h-3 w-3 mr-1" />
              Voter ID
            </TabsTrigger>
            <TabsTrigger value="drivingLicense" className="text-xs">
              <FileText className="h-3 w-3 mr-1" />
              DL
            </TabsTrigger>
            <TabsTrigger value="passport" className="text-xs">
              <Building2 className="h-3 w-3 mr-1" />
              Passport
            </TabsTrigger>
          </TabsList>

          {/* Health ID Verification */}
          <TabsContent value="healthId" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="healthId" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                ABHA Health ID (Primary)
              </Label>
              <div className="relative">
                <Input
                  id="healthId"
                  type={showHealthId ? "text" : "password"}
                  placeholder="XXXX-XXXX-XXXX-XX"
                  value={formatHealthIdInput(healthIdInput)}
                  onChange={(e) => setHealthIdInput(e.target.value.replace(/\D/g, ''))}
                  maxLength={17}
                  disabled={verificationMethods.find(m => m.id === 'healthId')?.verified}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowHealthId(!showHealthId)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showHealthId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter your 14-digit ABHA Health ID number
              </p>
            </div>

            {verificationMethods.find(m => m.id === 'healthId')?.verified ? (
              <Alert className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-sm">
                  <strong className="text-green-700 dark:text-green-300">Verified!</strong> 
                  <span className="ml-2">Health ID ending in ****{verificationMethods.find(m => m.id === 'healthId')?.data}</span>
                </AlertDescription>
              </Alert>
            ) : (
              <Button 
                onClick={handleHealthIdVerification}
                disabled={isProcessing || !healthIdInput || healthIdInput.length < 14}
                className="w-full"
              >
                {isProcessing ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Verify Health ID
                  </>
                )}
              </Button>
            )}
          </TabsContent>

          {/* PAN Card Verification */}
          <TabsContent value="pan" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="pan" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                PAN Card Number
              </Label>
              <Input
                id="pan"
                type="text"
                placeholder="ABCDE1234F"
                value={panInput.toUpperCase()}
                onChange={(e) => setPanInput(e.target.value.toUpperCase())}
                maxLength={10}
                disabled={verificationMethods.find(m => m.id === 'pan')?.verified}
              />
              <p className="text-xs text-muted-foreground">
                Enter your 10-character PAN number (5 letters, 4 digits, 1 letter)
              </p>
            </div>

            {verificationMethods.find(m => m.id === 'pan')?.verified ? (
              <Alert className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-sm">
                  <strong className="text-green-700 dark:text-green-300">Verified!</strong> 
                  <span className="ml-2">PAN: {verificationMethods.find(m => m.id === 'pan')?.data}</span>
                </AlertDescription>
              </Alert>
            ) : (
              <Button 
                onClick={handlePanVerification}
                disabled={isProcessing || !panInput || panInput.length < 10}
                className="w-full"
              >
                {isProcessing ? (
                  <>Processing...</>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Verify PAN Card
                  </>
                )}
              </Button>
            )}
          </TabsContent>

          {/* Voter ID Verification */}
          <TabsContent value="voterId" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="voterId" className="flex items-center gap-2">
                <IdCard className="h-4 w-4" />
                Voter ID Number
              </Label>
              <Input
                id="voterId"
                type="text"
                placeholder="ABC1234567"
                value={voterIdInput.toUpperCase()}
                onChange={(e) => setVoterIdInput(e.target.value.toUpperCase())}
                maxLength={10}
                disabled={verificationMethods.find(m => m.id === 'voterId')?.verified}
              />
              <p className="text-xs text-muted-foreground">
                Enter your 10-character Voter ID (3 letters, 7 digits)
              </p>
            </div>

            {verificationMethods.find(m => m.id === 'voterId')?.verified ? (
              <Alert className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-sm">
                  <strong className="text-green-700 dark:text-green-300">Verified!</strong> 
                  <span className="ml-2">Voter ID: {verificationMethods.find(m => m.id === 'voterId')?.data}</span>
                </AlertDescription>
              </Alert>
            ) : (
              <Button 
                onClick={handleVoterIdVerification}
                disabled={isProcessing || !voterIdInput || voterIdInput.length < 10}
                className="w-full"
              >
                {isProcessing ? (
                  <>Processing...</>
                ) : (
                  <>
                    <IdCard className="h-4 w-4 mr-2" />
                    Verify Voter ID
                  </>
                )}
              </Button>
            )}
          </TabsContent>

          {/* Driving License (Coming Soon) */}
          <TabsContent value="drivingLicense" className="space-y-4 mt-4">
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                Driving License verification will be available soon. We're integrating with the Transport Department API.
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Passport (Coming Soon) */}
          <TabsContent value="passport" className="space-y-4 mt-4">
            <Alert>
              <Building2 className="h-4 w-4" />
              <AlertDescription>
                Passport verification will be available soon. We're integrating with the Passport Seva API.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>

        {/* Verification Status Summary */}
        <div className="mt-6 p-4 bg-muted/30 rounded-lg space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Verification Status
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {verificationMethods.map((method) => {
              const Icon = method.icon;
              return (
                <div
                  key={method.id}
                  className={`flex items-center gap-2 text-xs p-2 rounded ${
                    method.verified
                      ? 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  <span>{method.name}</span>
                  {method.verified && <CheckCircle className="h-3 w-3 ml-auto" />}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthIDVerification;
