import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Heart, 
  CheckCircle2, 
  Shield, 
  Upload, 
  Loader2,
  AlertCircle,
  FileText,
  QrCode,
  IdCard,
  Camera,
  Eye,
  Download,
  CreditCard,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar
} from "lucide-react";
import { toast } from "sonner";

interface DocumentUpload {
  type: string;
  file: File | null;
  preview: string | null;
  verified: boolean;
  verificationStatus: 'pending' | 'verifying' | 'verified' | 'failed';
}

export default function CreateHealthID() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [healthIdCreated, setHealthIdCreated] = useState(false);
  const [generatedHealthId, setGeneratedHealthId] = useState("");

  // Form Data
  const [formData, setFormData] = useState({
    // Personal Details
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "male",
    bloodGroup: "A+",
    phone: "",
    email: "",
    
    // Address
    address: "",
    city: "",
    state: "",
    pincode: "",
    
    // Emergency Contact
    emergencyName: "",
    emergencyPhone: "",
    emergencyRelation: "",
    
    // Medical Info
    allergies: "",
    chronicDiseases: "",
    currentMedications: "",
    previousSurgeries: "",
    
    // Insurance
    insuranceProvider: "",
    insuranceNumber: "",
    insuranceValidity: ""
  });

  // Document Uploads
  const [documents, setDocuments] = useState<{
    aadhaar: DocumentUpload;
    abhaCard: DocumentUpload;
  }>({
    aadhaar: {
      type: "Aadhaar Card",
      file: null,
      preview: null,
      verified: false,
      verificationStatus: 'pending'
    },
    abhaCard: {
      type: "ABHA Card",
      file: null,
      preview: null,
      verified: false,
      verificationStatus: 'pending'
    }
  });

  const totalSteps = 5;
  const progressPercentage = (currentStep / totalSteps) * 100;

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle document upload
  const handleDocumentUpload = (docType: 'aadhaar' | 'abhaCard', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image (JPEG, PNG) or PDF file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should not exceed 5MB");
      return;
    }

    // Create preview for images
    const reader = new FileReader();
    reader.onloadend = () => {
      setDocuments(prev => ({
        ...prev,
        [docType]: {
          ...prev[docType],
          file: file,
          preview: file.type.startsWith('image/') ? reader.result as string : null,
          verificationStatus: 'pending'
        }
      }));
      toast.success(`${docType === 'aadhaar' ? 'Aadhaar' : 'ABHA'} card uploaded successfully`);
    };
    reader.readAsDataURL(file);
  };

  // Verify document
  const verifyDocument = async (docType: 'aadhaar' | 'abhaCard') => {
    if (!documents[docType].file) {
      toast.error("Please upload the document first");
      return;
    }

    setDocuments(prev => ({
      ...prev,
      [docType]: {
        ...prev[docType],
        verificationStatus: 'verifying'
      }
    }));

    // Simulate verification API call
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Mock verification success
    const isValid = Math.random() > 0.1; // 90% success rate

    setDocuments(prev => ({
      ...prev,
      [docType]: {
        ...prev[docType],
        verified: isValid,
        verificationStatus: isValid ? 'verified' : 'failed'
      }
    }));

    if (isValid) {
      toast.success(`${docType === 'aadhaar' ? 'Aadhaar' : 'ABHA'} card verified successfully`);
    } else {
      toast.error(`${docType === 'aadhaar' ? 'Aadhaar' : 'ABHA'} card verification failed. Please upload a valid document.`);
    }
  };

  // Validate current step
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // Personal Details
        if (!formData.firstName || !formData.lastName || !formData.dateOfBirth || !formData.phone) {
          toast.error("Please fill all required personal details");
          return false;
        }
        if (formData.phone.length !== 10) {
          toast.error("Please enter a valid 10-digit phone number");
          return false;
        }
        return true;

      case 2: // Address
        if (!formData.address || !formData.city || !formData.state || !formData.pincode) {
          toast.error("Please fill all address details");
          return false;
        }
        if (formData.pincode.length !== 6) {
          toast.error("Please enter a valid 6-digit pincode");
          return false;
        }
        return true;

      case 3: // Document Verification
        if (!documents.aadhaar.verified || !documents.abhaCard.verified) {
          toast.error("Please upload and verify both Aadhaar and ABHA cards");
          return false;
        }
        return true;

      case 4: // Medical History (optional, just validate format if provided)
        return true;

      case 5: // Review
        return true;

      default:
        return true;
    }
  };

  // Navigate between steps
  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Submit and create Health ID
  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Generate unique Health ID
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      const healthId = `MED-${timestamp}-${random}`;

      setGeneratedHealthId(healthId);
      setHealthIdCreated(true);

      toast.success("Health ID created successfully!", {
        description: `Your Health ID: ${healthId}`
      });

    } catch (error) {
      console.error('Error creating Health ID:', error);
      toast.error("Failed to create Health ID. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render success screen
  if (healthIdCreated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4">
        <div className="max-w-2xl mx-auto py-12">
          <Card className="shadow-xl border-2 border-green-500">
            <CardContent className="p-8 text-center space-y-6">
              <div className="flex justify-center">
                <div className="p-6 bg-green-100 dark:bg-green-900 rounded-full">
                  <CheckCircle2 className="h-20 w-20 text-green-600 dark:text-green-300" />
                </div>
              </div>

              <div>
                <h1 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  🎉 Health ID Created Successfully!
                </h1>
                <p className="text-muted-foreground">
                  Your unique health identifier has been generated
                </p>
              </div>

              {/* Health ID Card */}
              <div className="p-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl text-white shadow-lg">
                <div className="text-sm mb-2 opacity-90">MedAid Health ID</div>
                <div className="text-3xl font-bold font-mono mb-4">{generatedHealthId}</div>
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <div className="text-xs opacity-80">Holder Name</div>
                    <div className="text-sm font-semibold">
                      {formData.firstName} {formData.lastName}
                    </div>
                  </div>
                  <div className="p-2 bg-white rounded">
                    <QrCode className="h-12 w-12 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 text-xs opacity-80">
                  Valid from: {new Date().toLocaleDateString('en-IN')}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <CheckCircle2 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold">Documents Verified</p>
                  <p className="text-xs text-muted-foreground">Aadhaar + ABHA</p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold">Secure & Encrypted</p>
                  <p className="text-xs text-muted-foreground">NDHM Compliant</p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                  onClick={() => navigate('/health-records')}
                >
                  <Heart className="h-5 w-5 mr-2" />
                  View Health Dashboard
                </Button>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" onClick={() => window.print()}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Card
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/vaccination-reminders')}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Set Reminders
                  </Button>
                </div>
              </div>

              <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-xs text-left">
                  <strong>Important:</strong> Save your Health ID securely. You'll need it to access 
                  your medical records, book appointments, and get vaccinations.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Main form rendering
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-blue-600 rounded-full">
              <IdCard className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Create Your Health ID</h1>
          <p className="text-muted-foreground">
            Your unique identifier for accessing healthcare services across India
          </p>
        </div>

        {/* Progress Bar */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">Step {currentStep} of {totalSteps}</span>
                <span className="text-muted-foreground">{Math.round(progressPercentage)}% Complete</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className={currentStep >= 1 ? "text-primary font-semibold" : ""}>Personal</span>
                <span className={currentStep >= 2 ? "text-primary font-semibold" : ""}>Address</span>
                <span className={currentStep >= 3 ? "text-primary font-semibold" : ""}>Documents</span>
                <span className={currentStep >= 4 ? "text-primary font-semibold" : ""}>Medical</span>
                <span className={currentStep >= 5 ? "text-primary font-semibold" : ""}>Review</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Content */}
        <Card className="shadow-xl">
          <CardHeader className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700">
            <CardTitle className="text-xl">
              {currentStep === 1 && "📝 Personal Details"}
              {currentStep === 2 && "🏠 Address Information"}
              {currentStep === 3 && "🔐 Document Verification"}
              {currentStep === 4 && "🏥 Medical History"}
              {currentStep === 5 && "✅ Review & Submit"}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Let's start with your basic information"}
              {currentStep === 2 && "Where do you currently reside?"}
              {currentStep === 3 && "Verify your identity with Aadhaar and ABHA card"}
              {currentStep === 4 && "Help us understand your medical background (Optional)"}
              {currentStep === 5 && "Review all information before creating your Health ID"}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Step 1: Personal Details */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      placeholder="Enter first name"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">
                      Last Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      placeholder="Enter last name"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dob">
                      Date of Birth <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="dob"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender <span className="text-red-500">*</span></Label>
                    <select
                      id="gender"
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bloodGroup">Blood Group</Label>
                    <select
                      id="bloodGroup"
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.bloodGroup}
                      onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="10-digit mobile number"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                      maxLength={10}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address (Optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>

                <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-xs">
                    All your personal information is encrypted and stored securely as per NDHM guidelines.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Step 2: Address */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">
                    Full Address <span className="text-red-500">*</span>
                  </Label>
                  <textarea
                    id="address"
                    className="w-full min-h-20 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="House no., Building name, Street"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">
                      City <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="city"
                      placeholder="Enter city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">
                      State <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="state"
                      placeholder="Enter state"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pincode">
                      Pincode <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="pincode"
                      placeholder="6-digit pincode"
                      value={formData.pincode}
                      onChange={(e) => handleInputChange('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-4">Emergency Contact</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="emergencyName">Contact Name</Label>
                        <Input
                          id="emergencyName"
                          placeholder="Emergency contact person"
                          value={formData.emergencyName}
                          onChange={(e) => handleInputChange('emergencyName', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emergencyPhone">Contact Phone</Label>
                        <Input
                          id="emergencyPhone"
                          type="tel"
                          placeholder="10-digit mobile"
                          value={formData.emergencyPhone}
                          onChange={(e) => handleInputChange('emergencyPhone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                          maxLength={10}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyRelation">Relation</Label>
                      <Input
                        id="emergencyRelation"
                        placeholder="e.g., Father, Mother, Spouse"
                        value={formData.emergencyRelation}
                        onChange={(e) => handleInputChange('emergencyRelation', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Document Verification */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-sm">
                    <strong>Required:</strong> Please upload clear photos/scans of your Aadhaar Card and ABHA Card. 
                    Both documents are mandatory for Health ID creation.
                  </AlertDescription>
                </Alert>

                {/* Aadhaar Card Upload */}
                <Card className="border-2 border-dashed">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <IdCard className="h-8 w-8 text-blue-600" />
                        <div>
                          <h3 className="font-semibold">Aadhaar Card</h3>
                          <p className="text-xs text-muted-foreground">
                            Government-issued identity proof
                          </p>
                        </div>
                      </div>
                      {documents.aadhaar.verified && (
                        <Badge className="bg-green-500">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>

                    {documents.aadhaar.preview && (
                      <div className="relative">
                        <img 
                          src={documents.aadhaar.preview} 
                          alt="Aadhaar preview" 
                          className="w-full max-h-48 object-contain rounded-lg border"
                        />
                      </div>
                    )}

                    <div className="flex gap-2">
                      <label className="flex-1">
                        <Button variant="outline" className="w-full" asChild>
                          <span>
                            <Upload className="h-4 w-4 mr-2" />
                            {documents.aadhaar.file ? 'Change File' : 'Upload Aadhaar'}
                          </span>
                        </Button>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={(e) => handleDocumentUpload('aadhaar', e)}
                        />
                      </label>

                      {documents.aadhaar.file && !documents.aadhaar.verified && (
                        <Button
                          onClick={() => verifyDocument('aadhaar')}
                          disabled={documents.aadhaar.verificationStatus === 'verifying'}
                          className="flex-1"
                        >
                          {documents.aadhaar.verificationStatus === 'verifying' ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              Verify Document
                            </>
                          )}
                        </Button>
                      )}
                    </div>

                    {documents.aadhaar.verificationStatus === 'failed' && (
                      <Alert className="border-red-200 bg-red-50 dark:bg-red-950">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-xs">
                          Verification failed. Please ensure the document is clear and valid.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                {/* ABHA Card Upload */}
                <Card className="border-2 border-dashed">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Heart className="h-8 w-8 text-orange-600" />
                        <div>
                          <h3 className="font-semibold">ABHA Card</h3>
                          <p className="text-xs text-muted-foreground">
                            Ayushman Bharat Health Account
                          </p>
                        </div>
                      </div>
                      {documents.abhaCard.verified && (
                        <Badge className="bg-green-500">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>

                    {documents.abhaCard.preview && (
                      <div className="relative">
                        <img 
                          src={documents.abhaCard.preview} 
                          alt="ABHA preview" 
                          className="w-full max-h-48 object-contain rounded-lg border"
                        />
                      </div>
                    )}

                    <div className="flex gap-2">
                      <label className="flex-1">
                        <Button variant="outline" className="w-full" asChild>
                          <span>
                            <Upload className="h-4 w-4 mr-2" />
                            {documents.abhaCard.file ? 'Change File' : 'Upload ABHA Card'}
                          </span>
                        </Button>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={(e) => handleDocumentUpload('abhaCard', e)}
                        />
                      </label>

                      {documents.abhaCard.file && !documents.abhaCard.verified && (
                        <Button
                          onClick={() => verifyDocument('abhaCard')}
                          disabled={documents.abhaCard.verificationStatus === 'verifying'}
                          className="flex-1"
                        >
                          {documents.abhaCard.verificationStatus === 'verifying' ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              Verify Document
                            </>
                          )}
                        </Button>
                      )}
                    </div>

                    {documents.abhaCard.verificationStatus === 'failed' && (
                      <Alert className="border-red-200 bg-red-50 dark:bg-red-950">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-xs">
                          Verification failed. Please ensure the document is clear and valid.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-xs">
                    Your documents are verified using AI-powered OCR and government databases. 
                    All information is encrypted and stored securely.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Step 4: Medical History */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-sm">
                    This information is optional but helps healthcare providers give you better care.
                  </AlertDescription>
                </Alert>

                <Tabs defaultValue="medical" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="medical">Medical History</TabsTrigger>
                    <TabsTrigger value="insurance">Insurance</TabsTrigger>
                  </TabsList>

                  <TabsContent value="medical" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="allergies">Known Allergies</Label>
                      <textarea
                        id="allergies"
                        className="w-full min-h-20 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="e.g., Penicillin, Peanuts, Pollen"
                        value={formData.allergies}
                        onChange={(e) => handleInputChange('allergies', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="chronicDiseases">Chronic Diseases</Label>
                      <textarea
                        id="chronicDiseases"
                        className="w-full min-h-20 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="e.g., Diabetes, Hypertension, Asthma"
                        value={formData.chronicDiseases}
                        onChange={(e) => handleInputChange('chronicDiseases', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currentMedications">Current Medications</Label>
                      <textarea
                        id="currentMedications"
                        className="w-full min-h-20 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="List all medications you're currently taking"
                        value={formData.currentMedications}
                        onChange={(e) => handleInputChange('currentMedications', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="previousSurgeries">Previous Surgeries</Label>
                      <textarea
                        id="previousSurgeries"
                        className="w-full min-h-20 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="Any surgical procedures you've had"
                        value={formData.previousSurgeries}
                        onChange={(e) => handleInputChange('previousSurgeries', e.target.value)}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="insurance" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                      <select
                        id="insuranceProvider"
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={formData.insuranceProvider}
                        onChange={(e) => handleInputChange('insuranceProvider', e.target.value)}
                      >
                        <option value="">Select Insurance</option>
                        <option value="ayushman">Ayushman Bharat (PM-JAY)</option>
                        <option value="esis">ESIS - Employee State Insurance</option>
                        <option value="cghs">CGHS - Central Government Health Scheme</option>
                        <option value="star">Star Health Insurance</option>
                        <option value="hdfc">HDFC ERGO Health</option>
                        <option value="icici">ICICI Lombard Health</option>
                        <option value="lic">LIC Health Insurance</option>
                        <option value="sbi">SBI Health Insurance</option>
                        <option value="other">Other Private Insurance</option>
                        <option value="none">No Insurance</option>
                      </select>
                    </div>

                    {formData.insuranceProvider && formData.insuranceProvider !== 'none' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="insuranceNumber">Insurance Policy Number</Label>
                          <Input
                            id="insuranceNumber"
                            placeholder="Enter policy number"
                            value={formData.insuranceNumber}
                            onChange={(e) => handleInputChange('insuranceNumber', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="insuranceValidity">Valid Until</Label>
                          <Input
                            id="insuranceValidity"
                            type="date"
                            value={formData.insuranceValidity}
                            onChange={(e) => handleInputChange('insuranceValidity', e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                      </>
                    )}

                    {formData.insuranceProvider === 'ayushman' && (
                      <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950">
                        <Heart className="h-4 w-4 text-orange-600" />
                        <AlertDescription className="text-xs">
                          <strong>Ayushman Bharat (PM-JAY)</strong> provides health coverage of ₹5 lakh 
                          per family per year for secondary and tertiary hospitalization.
                        </AlertDescription>
                      </Alert>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {/* Step 5: Review */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-sm">
                    Please review all information carefully before submitting. You can go back to edit any section.
                  </AlertDescription>
                </Alert>

                {/* Personal Info */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-muted-foreground">Name:</span>
                        <p className="font-semibold">{formData.firstName} {formData.lastName}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Date of Birth:</span>
                        <p className="font-semibold">
                          {formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString('en-IN') : '-'}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Gender:</span>
                        <p className="font-semibold capitalize">{formData.gender}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Blood Group:</span>
                        <p className="font-semibold">{formData.bloodGroup}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Phone:</span>
                        <p className="font-semibold">{formData.phone}</p>
                      </div>
                      {formData.email && (
                        <div>
                          <span className="text-muted-foreground">Email:</span>
                          <p className="font-semibold">{formData.email}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Address */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <p>{formData.address}</p>
                    <p>{formData.city}, {formData.state} - {formData.pincode}</p>
                  </CardContent>
                </Card>

                {/* Documents */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Verified Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950 rounded">
                      <span className="text-sm">Aadhaar Card</span>
                      <Badge className="bg-green-500">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950 rounded">
                      <span className="text-sm">ABHA Card</span>
                      <Badge className="bg-green-500">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Insurance */}
                {formData.insuranceProvider && formData.insuranceProvider !== 'none' && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Insurance Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Provider:</span>
                        <p className="font-semibold capitalize">
                          {formData.insuranceProvider.replace('-', ' ')}
                        </p>
                      </div>
                      {formData.insuranceNumber && (
                        <div>
                          <span className="text-muted-foreground">Policy Number:</span>
                          <p className="font-semibold font-mono">{formData.insuranceNumber}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </CardContent>

          {/* Navigation Buttons */}
          <div className="p-6 border-t bg-muted/30">
            <div className="flex justify-between gap-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1 || isSubmitting}
              >
                Previous
              </Button>

              {currentStep < totalSteps ? (
                <Button onClick={handleNext}>
                  Next Step
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Health ID...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Create Health ID
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Info Section */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
            <CardContent className="p-4 text-center">
              <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-semibold mb-1">Secure & Encrypted</p>
              <p className="text-xs text-muted-foreground">
                256-bit AES encryption
              </p>
            </CardContent>
          </Card>

          <Card className="bg-green-50 dark:bg-green-950 border-green-200">
            <CardContent className="p-4 text-center">
              <Heart className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-semibold mb-1">NDHM Compliant</p>
              <p className="text-xs text-muted-foreground">
                Government certified
              </p>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 dark:bg-purple-950 border-purple-200">
            <CardContent className="p-4 text-center">
              <Building2 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-semibold mb-1">Pan-India Access</p>
              <p className="text-xs text-muted-foreground">
                10,000+ hospitals
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
