import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import { Users, Video, Clock, CheckCircle, XCircle, Shield, IdCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { formatHealthId } from "@/lib/universalHealthId";

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayConsultations: 0,
    todayAppointments: 0,
    pending: 0,
    completed: 0
  });
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadConsultations();
      loadAppointments();
      setupRealtimeSubscription();
    }
  }, [user]);

  const setupRealtimeSubscription = () => {
    // Subscribe to consultations
    const consultationsChannel = supabase
      .channel('consultations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'consultations'
        },
        () => {
          console.log('Consultations updated');
          loadConsultations();
        }
      )
      .subscribe();

    // Subscribe to appointments
    const appointmentsChannel = supabase
      .channel('appointments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `doctor_id=eq.${user?.id}`
        },
        (payload) => {
          console.log('New appointment received:', payload);
          loadAppointments();
          if (payload.eventType === 'INSERT') {
            toast.info("New appointment request received!", {
              description: "A patient has booked an appointment with you."
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(consultationsChannel);
      supabase.removeChannel(appointmentsChannel);
    };
  };

  const loadAppointments = async () => {
    const { data, error } = await supabase
      .from("appointments")
      .select("*, profiles!appointments_patient_id_fkey(full_name, health_id)")
      .eq("doctor_id", user?.id)
      .order("appointment_date", { ascending: true });

    if (!error && data) {
      setAppointments(data);
      
      // Update stats with appointments
      const today = new Date().toDateString();
      const todayAppointments = data.filter(a => 
        new Date(a.appointment_date).toDateString() === today
      ).length;
      
      setStats(prev => ({
        ...prev,
        todayAppointments,
        pending: prev.pending + data.filter(a => a.status === 'pending').length
      }));
    }
  };

  const loadConsultations = async () => {
    const { data, error } = await supabase
      .from("consultations")
      .select("*, profiles!consultations_patient_id_fkey(full_name, health_id)")
      .eq("doctor_id", user?.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setConsultations(data);
      
      // Calculate stats
      const today = new Date().toDateString();
      setStats(prev => ({
        ...prev,
        totalPatients: new Set(data.map(c => c.patient_id)).size,
        todayConsultations: data.filter(c => 
          new Date(c.created_at).toDateString() === today
        ).length,
        pending: data.filter(c => c.status === 'pending').length,
        completed: data.filter(c => c.status === 'completed').length
      }));
    }
  };

  const handleConsultation = async (consultationId: string, status: 'accepted' | 'declined') => {
    const { error } = await supabase
      .from("consultations")
      .update({ status })
      .eq("id", consultationId);

    if (error) {
      toast.error("Failed to update consultation");
    } else {
      toast.success(`Consultation ${status}`);
      loadConsultations();
    }
  };

  const handleAppointment = async (appointmentId: string, status: 'confirmed' | 'cancelled') => {
    const { error } = await supabase
      .from("appointments")
      .update({ status })
      .eq("id", appointmentId);

    if (error) {
      toast.error("Failed to update appointment");
    } else {
      toast.success(`Appointment ${status}`);
      loadAppointments();
    }
  };

  const pendingConsultations = consultations.filter(c => c.status === 'pending');
  const pendingAppointments = appointments.filter(a => a.status === 'pending');

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-20">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2">Doctor Dashboard</h1>
          <p className="text-muted-foreground">Manage your consultations and patient requests</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-md animate-slide-up">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Patients</p>
                  <p className="text-3xl font-bold">{stats.totalPatients}</p>
                </div>
                <div className="p-3 rounded-xl bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Today's Consultations</p>
                  <p className="text-3xl font-bold">{stats.todayConsultations}</p>
                </div>
                <div className="p-3 rounded-xl bg-secondary/10">
                  <Video className="h-6 w-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Today's Appointments</p>
                  <p className="text-3xl font-bold">{stats.todayAppointments}</p>
                </div>
                <div className="p-3 rounded-xl bg-accent/10">
                  <Clock className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Pending Requests</p>
                  <p className="text-3xl font-bold">{stats.pending}</p>
                </div>
                <div className="p-3 rounded-xl bg-accent/10">
                  <Clock className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Pending Appointments */}
          <Card className="shadow-md animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <CardHeader>
              <CardTitle>Pending Appointments</CardTitle>
              <CardDescription>New appointment requests</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingAppointments.length > 0 ? (
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {pendingAppointments.map((appointment) => (
                    <div 
                      key={appointment.id}
                      className="p-4 border border-border rounded-lg hover:shadow-md transition-smooth"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold">
                            {appointment.profiles?.full_name || 'Patient'}
                          </h4>
                          {appointment.profiles?.health_id && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <Shield className="h-3 w-3" />
                              <span className="font-mono">{formatHealthId(appointment.profiles.health_id)}</span>
                            </div>
                          )}
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(appointment.appointment_date).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short'
                            })}
                          </p>
                        </div>
                        <Badge variant={appointment.appointment_type === "video" ? "default" : "secondary"}>
                          {appointment.appointment_type === "video" ? "Video Call" : "In-Person"}
                        </Badge>
                      </div>
                      {appointment.notes && (
                        <div className="mb-3 p-2 bg-muted/50 rounded text-xs">
                          <p className="font-medium mb-1">Notes:</p>
                          <p className="text-muted-foreground">{appointment.notes}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <span className="font-medium">Fee: ₹{appointment.consultation_fee}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleAppointment(appointment.id, 'confirmed')}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Confirm
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handleAppointment(appointment.id, 'cancelled')}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No pending appointments
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Consultations */}
          <Card className="shadow-md animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <CardHeader>
              <CardTitle>Pending Consultations</CardTitle>
              <CardDescription>Symptom analysis requests</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingConsultations.length > 0 ? (
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {pendingConsultations.map((consultation) => (
                    <div 
                      key={consultation.id}
                      className="p-4 border border-border rounded-lg hover:shadow-md transition-smooth"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold">
                            {consultation.profiles?.full_name || 'Patient'}
                          </h4>
                          {consultation.profiles?.health_id && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <Shield className="h-3 w-3" />
                              <span className="font-mono">{formatHealthId(consultation.profiles.health_id)}</span>
                            </div>
                          )}
                          <p className="text-sm text-muted-foreground mt-1">
                            {consultation.symptoms}
                          </p>
                        </div>
                        <Badge variant={consultation.priority === "high" ? "destructive" : "secondary"}>
                          {consultation.priority}
                        </Badge>
                      </div>
                      {consultation.ai_analysis && (
                        <div className="mb-3 p-2 bg-muted/50 rounded text-xs">
                          <p className="font-medium mb-1">AI Analysis:</p>
                          <p className="text-muted-foreground line-clamp-2">
                            {consultation.ai_analysis}
                          </p>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(consultation.created_at).toLocaleString()}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleConsultation(consultation.id, 'accepted')}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Accept
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handleConsultation(consultation.id, 'declined')}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No pending consultations
                </div>
              )}
            </CardContent>
          </Card>

          {/* Profile & Settings */}
          <div className="space-y-4">
            <Card className="shadow-md animate-slide-up" style={{ animationDelay: '0.5s' }}>
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className="mt-1 bg-secondary">Online</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Specialty</p>
                  <p className="font-medium">General Physician</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Consultation Fee</p>
                  <p className="font-medium">₹500</p>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate("/doctor-profile")}
                >
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-md animate-slide-up" style={{ animationDelay: '0.6s' }}>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {
                    const nextConsultation = consultations.find(c => c.status === 'accepted');
                    if (nextConsultation) {
                      navigate(`/consultation/${nextConsultation.id}`);
                    } else {
                      toast.error("No active consultations");
                    }
                  }}
                >
                  <Video className="h-4 w-4 mr-2" />
                  Start Consultation
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate("/doctor-patients")}
                >
                  <Users className="h-4 w-4 mr-2" />
                  View All Patients
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
