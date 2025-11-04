import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, User, Calendar } from "lucide-react";

const DoctorPatients = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patients, setPatients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (user) {
      loadPatients();
    }
  }, [user]);

  const loadPatients = async () => {
    const { data, error } = await supabase
      .from("consultations")
      .select("patient_id, profiles!consultations_patient_id_fkey(full_name), created_at, status")
      .eq("doctor_id", user?.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      // Group by patient_id to get unique patients with their latest consultation
      const uniquePatients = data.reduce((acc: any[], curr) => {
        if (!acc.find(p => p.patient_id === curr.patient_id)) {
          acc.push(curr);
        }
        return acc;
      }, []);
      
      setPatients(uniquePatients);
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-20">
        <Button
          variant="ghost"
          onClick={() => navigate("/doctor-dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Your Patients</h1>
          <p className="text-muted-foreground">
            View all patients who have consulted with you
          </p>
        </div>

        <div className="mb-6">
          <Input
            placeholder="Search patients by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => (
            <Card key={patient.patient_id} className="shadow-md hover:shadow-lg transition-smooth">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {patient.profiles?.full_name || "Patient"}
                  </CardTitle>
                  <Badge variant={
                    patient.status === "completed" ? "default" :
                    patient.status === "accepted" ? "secondary" :
                    "outline"
                  }>
                    {patient.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Last consultation: {new Date(patient.created_at).toLocaleDateString()}</span>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    // Navigate to patient history or details
                    navigate(`/patient-history/${patient.patient_id}`);
                  }}
                >
                  View History
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPatients.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery ? "No patients found matching your search" : "No patients yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorPatients;