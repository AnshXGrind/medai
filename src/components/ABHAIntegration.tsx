import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Heart, 
  CheckCircle2, 
  Shield, 
  Link as LinkIcon, 
  Loader2,
  AlertCircle,
  FileText,
  QrCode,
  Download
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ABHAIntegrationProps {
  userId: string;
}

export const ABHAIntegration = ({ userId }: ABHAIntegrationProps) => {
  const [abhaNumber, setAbhaNumber] = useState("");
  const [isLinking, setIsLinking] = useState(false);
  const [isLinked, setIsLinked] = useState(false);
  const [linkedData, setLinkedData] = useState<{
    abhaNumber: string;
    abhaAddress: string;
    healthId: string;
    linkDate: string;
  } | null>(null);

  // Mock NDHM/ABDM integration
  const linkABHA = async () => {
    if (!abhaNumber || abhaNumber.length !== 14) {
      toast.error("Please enter a valid 14-digit ABHA number");
      return;
    }

    setIsLinking(true);

    try {
      // Simulate API call to ABDM (Ayushman Bharat Digital Mission)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock successful integration
      const mockABHAData = {
        abhaNumber: abhaNumber,
        abhaAddress: `${abhaNumber.replace(/-/g, '')}@abdm`,
        healthId: `HID-${abhaNumber.replace(/-/g, '').substring(0, 8)}`,
        linkDate: new Date().toISOString()
      };

      // Store ABHA link in database
      const { error } = await supabase
        .from('profiles')
        .update({
          abha_number: mockABHAData.abhaNumber,
          abha_address: mockABHAData.abhaAddress,
          health_id: mockABHAData.healthId,
          ndhm_linked: true,
          ndhm_link_date: mockABHAData.linkDate
        })
        .eq('id', userId);

      if (error) {
        console.error('Error linking ABHA:', error);
        toast.error("Failed to link ABHA account");
        return;
      }

      setLinkedData(mockABHAData);
      setIsLinked(true);

      toast.success("ABHA linked successfully!", {
        description: "Your health records are now connected to NDHM ecosystem"
      });

    } catch (error) {
      console.error('ABHA linking error:', error);
      toast.error("Failed to link ABHA");
    } finally {
      setIsLinking(false);
    }
  };

  const formatABHAInput = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const limited = cleaned.substring(0, 14);
    
    // Format as XX-XXXX-XXXX-XXXX
    const parts = [];
    if (limited.length >= 2) parts.push(limited.substring(0, 2));
    if (limited.length >= 6) parts.push(limited.substring(2, 6));
    if (limited.length >= 10) parts.push(limited.substring(6, 10));
    if (limited.length >= 14) parts.push(limited.substring(10, 14));
    else if (limited.length > 10) parts.push(limited.substring(10));
    
    return parts.join('-');
  };

  return (
    <Card className="shadow-md border-2 border-orange-200 dark:border-orange-800">
      <CardHeader className="p-4 md:p-6 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
            <Heart className="h-5 w-5 md:h-6 md:w-6 text-orange-600 dark:text-orange-300" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-base md:text-lg flex items-center gap-2">
              Ayushman Bharat Health Account (ABHA)
              <Badge variant="secondary" className="text-xs">
                NDHM Integrated
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Connect to National Digital Health Mission ecosystem
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 md:p-6 space-y-4">
        {/* Info Alert */}
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950">
          <Shield className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-xs md:text-sm">
            <strong>What is ABHA?</strong> Your unique health ID that links all your health records 
            across India's digital health ecosystem (hospitals, labs, doctors).
          </AlertDescription>
        </Alert>

        {!isLinked ? (
          <>
            {/* ABHA Number Input */}
            <div className="space-y-2">
              <Label htmlFor="abha" className="text-sm font-medium">
                Enter Your ABHA Number
              </Label>
              <Input
                id="abha"
                type="text"
                placeholder="XX-XXXX-XXXX-XXXX"
                value={formatABHAInput(abhaNumber)}
                onChange={(e) => setAbhaNumber(e.target.value.replace(/\D/g, ''))}
                maxLength={17} // 14 digits + 3 hyphens
                className="text-lg font-mono"
              />
              <p className="text-xs text-muted-foreground">
                14-digit ABHA number issued by ABDM
              </p>
            </div>

            {/* Link Button */}
            <Button
              onClick={linkABHA}
              disabled={isLinking || abhaNumber.length !== 14}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              {isLinking ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting to NDHM...
                </>
              ) : (
                <>
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Link ABHA Account
                </>
              )}
            </Button>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              <div className="p-3 bg-secondary rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <p className="text-xs font-semibold">Benefits</p>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Access records anywhere</li>
                  <li>• Share with any doctor</li>
                  <li>• Faster insurance claims</li>
                </ul>
              </div>
              
              <div className="p-3 bg-secondary rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <p className="text-xs font-semibold">Privacy</p>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• You control access</li>
                  <li>• Encrypted storage</li>
                  <li>• Consent-based sharing</li>
                </ul>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Linked State */}
            <div className="text-center space-y-4 py-4">
              <div className="flex justify-center">
                <div className="p-4 bg-green-100 dark:bg-green-900 rounded-full">
                  <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-300" />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-green-600 dark:text-green-400">
                  ABHA Linked Successfully
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Connected to National Digital Health Mission
                </p>
              </div>

              {/* ABHA Details */}
              <div className="space-y-3">
                <div className="p-4 bg-secondary rounded-lg text-left">
                  <div className="grid gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">ABHA Number</p>
                      <p className="text-lg font-mono font-bold">{linkedData?.abhaNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">ABHA Address</p>
                      <p className="text-sm font-mono">{linkedData?.abhaAddress}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Health ID</p>
                      <p className="text-sm font-mono">{linkedData?.healthId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Linked On</p>
                      <p className="text-sm">
                        {linkedData?.linkDate ? new Date(linkedData.linkDate).toLocaleDateString('en-IN') : '-'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="text-xs">
                    <QrCode className="h-3 w-3 mr-1" />
                    Show QR
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    <Download className="h-3 w-3 mr-1" />
                    Download Card
                  </Button>
                </div>
              </div>

              {/* NDHM Features */}
              <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950">
                <Heart className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-xs text-left">
                  <strong>🇮🇳 NDHM Features Enabled:</strong>
                  <ul className="mt-2 space-y-1">
                    <li>✓ Health records across all hospitals</li>
                    <li>✓ Digital prescriptions & lab reports</li>
                    <li>✓ Telemedicine consultations</li>
                    <li>✓ Insurance claim integration</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          </>
        )}

        {/* Mock Disclaimer */}
        <div className="p-3 bg-muted rounded-lg border-l-4 border-l-orange-500">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <strong>Demo Mode:</strong> This is a simulated ABHA integration for demonstration purposes. 
              In production, this would connect to the official ABDM/NDHM API gateway.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ABHAIntegration;
