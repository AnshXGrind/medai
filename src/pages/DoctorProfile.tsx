import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ArrowLeft, Shield, CheckCircle } from "lucide-react";

const DoctorProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    specialty: "",
    consultation_fee: 500,
    is_online: false,
    medical_id: ""
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user?.id)
      .single();

    const { data: doctorData } = await supabase
      .from("doctor_profiles")
      .select("*")
      .eq("user_id", user?.id)
      .single();

    if (profileData && doctorData) {
      setProfile({
        full_name: profileData.full_name || "",
        specialty: doctorData.specialty || "",
        consultation_fee: doctorData.consultation_fee || 500,
        is_online: doctorData.is_online || false,
        medical_id: doctorData.medical_id || ""
      });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Update profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ full_name: profile.full_name })
        .eq("id", user?.id);

      if (profileError) throw profileError;

      // Update doctor_profiles table
      const { error: doctorError } = await supabase
        .from("doctor_profiles")
        .update({
          specialty: profile.specialty,
          consultation_fee: profile.consultation_fee,
          is_online: profile.is_online
        })
        .eq("user_id", user?.id);

      if (doctorError) throw doctorError;

      toast.success("Profile updated successfully!");
      navigate("/doctor-dashboard");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-20 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/doctor-dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Edit Your Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                placeholder="Dr. John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="medical_id" className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Doctor License ID
              </Label>
              <div className="relative">
                <Input
                  id="medical_id"
                  value={profile.medical_id}
                  disabled
                  className="bg-muted font-mono pr-24"
                />
                <Badge className="absolute right-2 top-2 bg-green-500 text-white">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                This is your verified medical license ID registered during sign-up
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty">Specialty</Label>
              <Input
                id="specialty"
                value={profile.specialty}
                onChange={(e) => setProfile({ ...profile, specialty: e.target.value })}
                placeholder="General Physician"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fee">Consultation Fee (₹)</Label>
              <Input
                id="fee"
                type="number"
                value={profile.consultation_fee}
                onChange={(e) => setProfile({ ...profile, consultation_fee: parseInt(e.target.value) })}
                min="0"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="online">Online Status</Label>
                <p className="text-sm text-muted-foreground">
                  Show as available for consultations
                </p>
              </div>
              <Switch
                id="online"
                checked={profile.is_online}
                onCheckedChange={(checked) => setProfile({ ...profile, is_online: checked })}
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DoctorProfile;