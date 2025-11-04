import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, CheckCircle, AlertCircle, Lock, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { processAadhaarSecurely, displayMaskedAadhaar, validateAadhaarFormat } from "@/lib/secureAadhaar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";

interface SecureAadhaarVerificationProps {
  userId: string;
  onVerificationComplete?: () => void;
}

export const SecureAadhaarVerification = ({ userId, onVerificationComplete }: SecureAadhaarVerificationProps) => {
  const [aadhaarInput, setAadhaarInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [showAadhaar, setShowAadhaar] = useState(false);
  const [anonymousMode, setAnonymousMode] = useState(false);
  const [lastFourDigits, setLastFourDigits] = useState<string | null>(null);

  const handleVerification = async () => {
    if (!validateAadhaarFormat(aadhaarInput)) {
      toast.error("Invalid Aadhaar format", {
        description: "Please enter a valid 12-digit Aadhaar number"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Process Aadhaar securely - this NEVER stores the raw number
      const secureData = await processAadhaarSecurely(aadhaarInput);

      if (!secureData.isValid) {
        toast.error("Invalid Aadhaar number");
        setIsProcessing(false);
        return;
      }

      // Update profile with ONLY secure data
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          aadhaar_last_four: secureData.lastFourDigits,
          aadhaar_hash: secureData.hashedToken,
          is_anonymous: anonymousMode
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        toast.error("Failed to save Aadhaar verification");
        return;
      }

      // Log the access for audit trail (blockchain-lite)
      await supabase.rpc('log_aadhaar_access', {
        p_action_type: 'verify',
        p_action_details: `Aadhaar verified - Last 4: ${secureData.lastFourDigits}`
      });

      setLastFourDigits(secureData.lastFourDigits);
      setIsVerified(true);
      
      // Clear the input immediately after processing
      setAadhaarInput("");
      
      toast.success("Aadhaar verified successfully!", {
        description: "Your identity is now secured. We never store your full Aadhaar number."
      });

      onVerificationComplete?.();
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to verify Aadhaar");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatAadhaarInput = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const limited = cleaned.substring(0, 12);
    
    // Format as XXXX-XXXX-XXXX
    const parts = [];
    for (let i = 0; i < limited.length; i += 4) {
      parts.push(limited.substring(i, i + 4));
    }
    
    return parts.join('-');
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="p-4 md:p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
            <Shield className="h-5 w-5 md:h-6 md:w-6 text-green-600 dark:text-green-300" />
          </div>
          <div>
            <CardTitle className="text-base md:text-lg">Secure Aadhaar Verification</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Zero raw data storage - We protect your privacy
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 md:p-6 space-y-4">
        {/* Security Notice */}
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950">
          <Lock className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-xs md:text-sm">
            <strong>100% Secure:</strong> We only store the last 4 digits and a one-way encrypted hash. 
            Your full Aadhaar number is NEVER stored in our database.
          </AlertDescription>
        </Alert>

        {!isVerified ? (
          <>
            {/* Anonymous Mode Toggle */}
            <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Anonymous Health Mode</Label>
                <p className="text-xs text-muted-foreground">
                  Hide your identity for sensitive consultations
                </p>
              </div>
              <Switch
                checked={anonymousMode}
                onCheckedChange={setAnonymousMode}
              />
            </div>

            {/* Aadhaar Input */}
            <div className="space-y-2">
              <Label htmlFor="aadhaar" className="text-sm font-medium">
                Enter Aadhaar Number
              </Label>
              <div className="relative">
                <Input
                  id="aadhaar"
                  type={showAadhaar ? "text" : "password"}
                  placeholder="XXXX-XXXX-XXXX"
                  value={formatAadhaarInput(aadhaarInput)}
                  onChange={(e) => setAadhaarInput(e.target.value.replace(/\D/g, ''))}
                  maxLength={14} // 12 digits + 2 hyphens
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowAadhaar(!showAadhaar)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showAadhaar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                12-digit Aadhaar number (will be securely hashed)
              </p>
            </div>

            {/* Verify Button */}
            <Button
              onClick={handleVerification}
              disabled={isProcessing || aadhaarInput.length !== 12}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Lock className="h-4 w-4 mr-2 animate-pulse" />
                  Securing...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Verify & Secure
                </>
              )}
            </Button>
          </>
        ) : (
          <>
            {/* Verified State */}
            <div className="text-center space-y-4 py-6">
              <div className="flex justify-center">
                <div className="p-4 bg-green-100 dark:bg-green-900 rounded-full">
                  <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-300" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-600 dark:text-green-400">
                  Verification Complete
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Your Aadhaar is securely verified
                </p>
              </div>
              
              {/* Display Only Last 4 Digits */}
              <div className="p-4 bg-secondary rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Stored Information</p>
                <p className="text-2xl font-mono font-bold tracking-wider">
                  {lastFourDigits ? displayMaskedAadhaar(lastFourDigits) : 'XXXX-XXXX-XXXX'}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  ✓ Encrypted hash stored | ✓ Full number never saved
                </p>
              </div>

              {anonymousMode && (
                <Alert className="border-purple-200 bg-purple-50 dark:bg-purple-950">
                  <AlertCircle className="h-4 w-4 text-purple-600" />
                  <AlertDescription className="text-xs">
                    <strong>Anonymous Mode Enabled:</strong> Your identity will be hidden in consultations
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </>
        )}

        {/* Security Features List */}
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-xs font-semibold mb-2">Security Features:</p>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-600" />
              SHA-256 encryption
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-600" />
              One-way hashing (irreversible)
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-600" />
              Audit trail logging
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-600" />
              Anonymous health mode available
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecureAadhaarVerification;
