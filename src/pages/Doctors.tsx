import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import { Video, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { z } from "zod";

const Doctors = () => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [symptoms, setSymptoms] = useState("");
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

      toast.success("Consultation request sent!");
      setSymptoms("");
      setSelectedDoctor(null);
    } catch (error) {
      toast.error("Failed to send request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-20">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Consult a Doctor</h1>
          <p className="text-muted-foreground">Choose from our verified healthcare professionals</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
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
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Request Consultation</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Doctor: Dr. {doctor.profiles?.full_name}
                          </p>
                          <Textarea
                            placeholder="Describe your symptoms..."
                            value={symptoms}
                            onChange={(e) => setSymptoms(e.target.value)}
                            className="min-h-[120px]"
                          />
                        </div>
                        <Button 
                          className="w-full"
                          onClick={requestConsultation}
                          disabled={isSubmitting}
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

        {doctors.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No doctors available at the moment</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Doctors;
