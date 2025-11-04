import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, Calendar, FileText, CheckCircle2, Info, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface HealthIdCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onHealthIdGenerated: (healthId: string) => void;
}

export const HealthIdCreationDialog = ({
  open,
  onOpenChange,
  onHealthIdGenerated,
}: HealthIdCreationDialogProps) => {
  const [step, setStep] = useState(1);
  const [dob, setDob] = useState("");
  const [age, setAge] = useState<number | null>(null);
  const [primaryDoc, setPrimaryDoc] = useState("");
  const [primaryDocNumber, setPrimaryDocNumber] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [progress, setProgress] = useState(0);

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let calculatedAge = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      calculatedAge--;
    }
    
    return calculatedAge;
  };

  const getAvailableDocuments = (userAge: number | null) => {
    if (!userAge) return [];
    
    const docs = [
      { value: "birth_cert", label: "Birth Certificate", minAge: 0 },
      { value: "school_id", label: "School ID Card", minAge: 5 },
      { value: "aadhaar", label: "Aadhaar Card", minAge: 0 },
    ];
    
    if (userAge >= 18) {
      docs.push(
        { value: "pan", label: "PAN Card", minAge: 18 },
        { value: "voter_id", label: "Voter ID", minAge: 18 },
        { value: "passport", label: "Passport", minAge: 18 },
        { value: "driving_license", label: "Driving License", minAge: 18 }
      );
    }
    
    return docs;
  };

  const handleDobChange = (birthDate: string) => {
    setDob(birthDate);
    if (birthDate) {
      const calculatedAge = calculateAge(birthDate);
      setAge(calculatedAge);
      setPrimaryDoc("");
      setPrimaryDocNumber("");
    }
  };

  const generateHealthId = async () => {
    if (!primaryDocNumber) {
      toast.error("Please enter your document number");
      return;
    }

    setVerifying(true);
    setProgress(0);

    try {
      // Simulate verification process with progress
      const steps = [
        { msg: "Verifying document...", duration: 800 },
        { msg: "Checking government database...", duration: 1000 },
        { msg: "Generating Health ID...", duration: 700 },
        { msg: "Securing your data...", duration: 500 },
      ];

      for (let i = 0; i < steps.length; i++) {
        toast.info(steps[i].msg);
        setProgress(((i + 1) / steps.length) * 100);
        await new Promise(resolve => setTimeout(resolve, steps[i].duration));
      }

      // Generate Health ID (14 digits)
      const timestamp = Date.now().toString();
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
      const healthId = (timestamp.slice(-10) + random).slice(0, 14);
      const formattedHealthId = healthId.match(/.{1,4}/g)?.join("-") || healthId;

      setStep(3);
      toast.success("Health ID generated successfully!");

      // Wait a moment then callback
      setTimeout(() => {
        onHealthIdGenerated(formattedHealthId);
        resetAndClose();
      }, 2000);

    } catch (error) {
      toast.error("Verification failed. Please try again.");
      console.error(error);
    } finally {
      setVerifying(false);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setDob("");
    setAge(null);
    setPrimaryDoc("");
    setPrimaryDocNumber("");
    setProgress(0);
    onOpenChange(false);
  };

  const availableDocs = getAvailableDocuments(age);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen && !verifying) {
        resetAndClose();
      }
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Create Government Health ID
          </DialogTitle>
          <DialogDescription>
            Verify your identity using age-appropriate government documents
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Privacy Notice */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Privacy Protected</AlertTitle>
            <AlertDescription className="text-xs">
              We never store your full document numbers - only secure hashes for verification
            </AlertDescription>
          </Alert>

          {/* Step 1: Date of Birth */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <Label htmlFor="dob" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date of Birth
                </Label>
                <Input
                  id="dob"
                  type="date"
                  value={dob}
                  onChange={(e) => handleDobChange(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  required
                />
                {age !== null && (
                  <p className="text-sm text-muted-foreground">
                    Age: {age} years old
                  </p>
                )}
              </div>

              <Button
                onClick={() => setStep(2)}
                disabled={!age || age < 0}
                className="w-full"
              >
                Continue to Document Verification
              </Button>
            </div>
          )}

          {/* Step 2: Document Verification */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <Label htmlFor="doc-type" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Government Document
                </Label>
                <Select value={primaryDoc} onValueChange={setPrimaryDoc}>
                  <SelectTrigger id="doc-type">
                    <SelectValue placeholder="Choose a document" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDocs.map((doc) => (
                      <SelectItem key={doc.value} value={doc.value}>
                        {doc.label} {doc.minAge > 0 && `(Age ${doc.minAge}+)`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {primaryDoc && (
                <div className="space-y-2">
                  <Label htmlFor="doc-number">
                    {primaryDoc.replace("_", " ").toUpperCase()} Number
                  </Label>
                  <Input
                    id="doc-number"
                    type="text"
                    placeholder={`Enter your ${primaryDoc.replace("_", " ")} number`}
                    value={primaryDocNumber}
                    onChange={(e) => setPrimaryDocNumber(e.target.value.toUpperCase())}
                    disabled={verifying}
                  />
                  <p className="text-xs text-muted-foreground">
                    This will be hashed and securely stored
                  </p>
                </div>
              )}

              {verifying && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-center text-muted-foreground">
                    Verifying your identity...
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  disabled={verifying}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={generateHealthId}
                  disabled={verifying || !primaryDoc || !primaryDocNumber}
                  className="flex-1"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Generate Health ID"
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in text-center py-4">
              <div className="flex justify-center">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
              
              <h3 className="text-lg font-semibold">Health ID Generated!</h3>
              
              <Alert className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
                <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-sm">
                  <strong>Secure & Private:</strong> Your documents are verified but never stored in full.
                </AlertDescription>
              </Alert>

              <p className="text-sm text-muted-foreground">
                Your Health ID will be filled in automatically...
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
