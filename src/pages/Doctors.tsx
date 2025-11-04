import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import { Video, Star, Search, Shield, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { z } from "zod";
import { formatHealthId, isValidHealthId } from "@/lib/universalHealthId";

const Doctors = () => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [symptoms, setSymptoms] = useState("");
  const [healthId, setHealthId] = useState("");
  const [healthIdVerified, setHealthIdVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    const { data, error } = await supabase
      .from("doctor_profiles")
      .select("*, profiles!doctor_profiles_user_id_fkey(full_name)")
      .eq("is_verified", true);

    if (!error && data) {
      setDoctors(data);
    }
  };

  const symptomSchema = z.object({
    symptoms: z.string()
      .trim()
      .min(10, "Please provide more detail (at least 10 characters)")
      .max(2000, "Please keep under 2000 characters")
      .regex(/^[a-zA-Z0-9\s.,!?'-]+$/, "Only letters, numbers, and basic punctuation allowed")
  });

  const requestConsultation = async () => {
    // Validate Health ID first
    if (!healthId || !isValidHealthId(healthId)) {
      toast.error("Please enter a valid Universal Health ID");
      return;
    }

    const result = symptomSchema.safeParse({ symptoms });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("consultations")
        .insert({
          patient_id: user?.id,
          doctor_id: selectedDoctor.user_id,
          symptoms: result.data.symptoms,
          priority: "medium"
        });

      if (error) throw error;

      toast.success("Consultation request sent with verified Health ID!");
      setSymptoms("");
      setHealthId("");
      setHealthIdVerified(false);
      setSelectedDoctor(null);
    } catch (error) {
      toast.error("Failed to send request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHealthIdChange = (value: string) => {
    const formatted = formatHealthId(value);
    setHealthId(formatted);
    setHealthIdVerified(isValidHealthId(formatted));
  };

  const filteredDoctors = doctors.filter((doctor) => {
    const searchLower = searchQuery.toLowerCase();
    const name = doctor.profiles?.full_name?.toLowerCase() || '';
    const specialty = doctor.specialty?.toLowerCase() || '';
    
    return name.includes(searchLower) || specialty.includes(searchLower);
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-20">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Consult a Doctor</h1>
          <p className="text-muted-foreground">Choose from our verified healthcare professionals</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search doctors by name or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2"
                onClick={() => setSearchQuery('')}
              >
                Clear
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''} found
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <Card key={doctor.id} className="shadow-md hover:shadow-lg transition-smooth">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      Dr. {doctor.profiles?.full_name || 'Doctor'}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {doctor.specialty || 'General Physician'}
                    </p>
                  </div>
                  {doctor.is_online && (
                    <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded-full text-xs">
                      Online
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Consultation Fee: ₹{doctor.consultation_fee || 500}
                  </p>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full"
                        onClick={() => setSelectedDoctor(doctor)}
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Book Consultation
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Request Consultation</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-4">
                            Doctor: Dr. {doctor.profiles?.full_name}
                          </p>
                          
                          {/* Health ID Input */}
                          <div className="space-y-2 mb-4">
                            <Label htmlFor="healthId" className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-primary" />
                              Universal Health ID <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                              <Input
                                id="healthId"
                                type="text"
                                placeholder="XX-XXXX-XXXX-XXXX"
                                value={healthId}
                                onChange={(e) => handleHealthIdChange(e.target.value)}
                                maxLength={17}
                                className={`font-mono ${healthIdVerified ? 'border-green-500' : ''}`}
                              />
                              {healthIdVerified && (
                                <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                              )}
                            </div>
                            {healthIdVerified && (
                              <p className="text-xs text-green-600 flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Health ID verified
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Required for secure healthcare records access
                            </p>
                          </div>

                          {/* Symptoms Textarea */}
                          <div className="space-y-2">
                            <Label htmlFor="symptoms">Describe your symptoms</Label>
                            <Textarea
                              id="symptoms"
                              placeholder="Please describe what you're experiencing..."
                              value={symptoms}
                              onChange={(e) => setSymptoms(e.target.value)}
                              className="min-h-[120px]"
                            />
                          </div>
                        </div>
                        <Button 
                          className="w-full"
                          onClick={requestConsultation}
                          disabled={isSubmitting || !healthIdVerified}
                        >
                          {isSubmitting ? "Sending..." : "Send Request"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDoctors.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No doctors found matching "{searchQuery}"
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setSearchQuery('')}
            >
              Clear Search
            </Button>
          </div>
        )}

        {doctors.length === 0 && !searchQuery && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No doctors available at the moment</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Doctors;
