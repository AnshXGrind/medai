import { useState, FormEvent, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Link, useNavigate } from "react-router-dom";
import { Activity, User, Stethoscope, Loader2, CreditCard, Mail, Shield, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { validateHealthId, formatHealthId, getHealthIdError } from "@/lib/healthId";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { HealthIdCreationDialog } from "@/components/HealthIdCreationDialog";

const Auth = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<"patient" | "doctor">("patient");
  const [loading, setLoading] = useState(false);
  const { signUp, signIn, user } = useAuth();

  // Sign In State
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  // Sign Up State
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [medicalId, setMedicalId] = useState("");
  const [healthIdNumber, setHealthIdNumber] = useState("");
  const [healthIdError, setHealthIdError] = useState<string | null>(null);

  // Forgot Password State
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  
  // Health ID Creation Mode
  const [showHealthIdCreation, setShowHealthIdCreation] = useState(false);
  const [createHealthIdMode, setCreateHealthIdMode] = useState(false);

  // Redirect authenticated users
  useEffect(() => {
    if (user) {
      // Check user role from metadata and redirect
      const userRole = user.user_metadata?.role;
      
      if (userRole === "doctor") {
        navigate("/doctor-dashboard");
      } else {
        navigate("/patient-dashboard");
      }
    }
  }, [user, navigate]);

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!signInEmail || !signInPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    await signIn(signInEmail, signInPassword);
    setLoading(false);
  };

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail) {
      toast.error("Please enter your email address");
      return;
    }

    setResetLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Password reset email sent! Check your inbox.");
        setShowForgotPassword(false);
        setResetEmail("");
      }
    } catch (error) {
      toast.error("Failed to send reset email");
    } finally {
      setResetLoading(false);
    }
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!signUpName || !signUpEmail || !signUpPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    // Validate Health ID for patients
    if (userType === "patient") {
      if (!healthIdNumber) {
        toast.error("Health ID is required for government healthcare");
        return;
      }
      
      const healthIdValidationError = getHealthIdError(healthIdNumber);
      if (healthIdValidationError) {
        setHealthIdError(healthIdValidationError);
        toast.error(healthIdValidationError);
        return;
      }
    }

    if (userType === "doctor" && !medicalId) {
      toast.error("Doctor License ID is required for verification");
      return;
    }

    if (signUpPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    await signUp(signUpEmail, signUpPassword, signUpName, userType, medicalId, healthIdNumber);
    setLoading(false);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8 animate-fade-in">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="p-2 bg-primary rounded-lg">
                <Activity className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                MedAid
              </span>
            </Link>
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">
              {userType === "patient" 
                ? "Access your Health Profile and manage your complete medical journey" 
                : "Access your Professional Dashboard and manage your practice"
              }
            </p>
          </div>

          {/* Quick Access Health ID */}
          <Card className="mb-6 border-2 border-primary/20 bg-primary/5 animate-fade-in">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold">Have a Universal Health ID?</h3>
                    <p className="text-sm text-muted-foreground">Quick access to your profile</p>
                  </div>
                </div>
                <Link to="/health-id-login">
                  <Button variant="default">
                    Login with Health ID
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 gradient-card animate-slide-up">
            <CardHeader>
              <div className="flex gap-4 mb-4">
                <Button
                  variant={userType === "patient" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setUserType("patient")}
                >
                  <User className="h-4 w-4 mr-2" />
                  Patient
                </Button>
                <Button
                  variant={userType === "doctor" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setUserType("doctor")}
                >
                  <Stethoscope className="h-4 w-4 mr-2" />
                  Doctor
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="you@example.com"
                        className="transition-smooth"
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        disabled={loading}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input 
                        id="password" 
                        type="password"
                        placeholder="••••••••"
                        className="transition-smooth"
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        disabled={loading}
                        required
                      />
                    </div>
                    
                    <div className="flex items-center justify-end">
                      <Button
                        type="button"
                        variant="link"
                        className="text-xs md:text-sm text-primary hover:text-primary/80 p-0 h-auto"
                        onClick={() => setShowForgotPassword(true)}
                      >
                        Forgot password?
                      </Button>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary/90 transition-smooth"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        `Sign In as ${userType === "patient" ? "Patient" : "Doctor"}`
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        type="text" 
                        placeholder="John Doe"
                        className="transition-smooth"
                        value={signUpName}
                        onChange={(e) => setSignUpName(e.target.value)}
                        disabled={loading}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input 
                        id="signup-email" 
                        type="email" 
                        placeholder="you@example.com"
                        className="transition-smooth"
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        disabled={loading}
                        required
                      />
                    </div>
                    {userType === "patient" && (
                      <div className="space-y-2">
                        <Label htmlFor="healthId" className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          ABHA Health ID (Government ID)
                        </Label>
                        <Input 
                          id="healthId" 
                          type="text" 
                          placeholder="XXXX-XXXX-XXXX-XX"
                          maxLength={17}
                          className={`transition-smooth ${healthIdError ? 'border-red-500' : ''}`}
                          value={healthIdNumber}
                          onChange={(e) => {
                            const formatted = formatHealthId(e.target.value);
                            setHealthIdNumber(formatted);
                            setHealthIdError(null);
                          }}
                          onBlur={() => {
                            const error = getHealthIdError(healthIdNumber);
                            setHealthIdError(error);
                          }}
                          disabled={loading}
                          required
                        />
                        {healthIdError && (
                          <p className="text-sm text-red-500">{healthIdError}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            Required for government healthcare services (14 digits)
                          </p>
                          <Button
                            type="button"
                            variant="link"
                            size="sm"
                            className="text-xs text-primary hover:text-primary/80 p-0 h-auto"
                            onClick={() => setShowHealthIdCreation(true)}
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            Create with Govt Docs
                          </Button>
                        </div>
                        <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                          <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <AlertDescription className="text-xs">
                            Don't have a Health ID? Create one using age-appropriate government documents with complete privacy protection.
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}
                    {userType === "doctor" && (
                      <div className="space-y-2">
                        <Label htmlFor="medical-id" className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Doctor License ID
                        </Label>
                        <Input 
                          id="medical-id" 
                          type="text" 
                          placeholder="e.g., MCI-12345678 or State Medical Council ID"
                          className="transition-smooth"
                          value={medicalId}
                          onChange={(e) => setMedicalId(e.target.value)}
                          disabled={loading}
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          Enter your Medical Council of India (MCI) registration number or State Medical Council license number
                        </p>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input 
                        id="signup-password" 
                        type="password"
                        placeholder="••••••••"
                        className="transition-smooth"
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        disabled={loading}
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary/90 transition-smooth"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        `Sign Up as ${userType === "patient" ? "Patient" : "Doctor"}`
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <p className="text-center text-sm text-muted-foreground mt-6">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Reset Password
            </DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email Address</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="you@example.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                disabled={resetLoading}
                required
                className="transition-smooth"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetEmail("");
                }}
                disabled={resetLoading}
                className="touch-manipulation active:scale-95"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={resetLoading}
                className="bg-primary hover:bg-primary/90 touch-manipulation active:scale-95"
              >
                {resetLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Reset Link
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Health ID Creation Dialog */}
      <HealthIdCreationDialog
        open={showHealthIdCreation}
        onOpenChange={setShowHealthIdCreation}
        onHealthIdGenerated={(healthId) => {
          setHealthIdNumber(healthId);
          setHealthIdError(null);
          toast.success("Health ID created and added to the form!");
          setShowHealthIdCreation(false);
        }}
      />
    </div>
  );
};

export default Auth;
