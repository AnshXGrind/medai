import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar, Video, Users, Loader2, Clock, IndianRupee, MapPin, Award, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Doctor {
  id: string;
  full_name: string;
  specialization?: string;
  video_rate?: number;
  face_to_face_rate?: number;
  medical_id?: string;
  location?: string;
  experience_years?: number;
}

interface AppointmentBookingProps {
  userId: string;
  onBookingComplete?: () => void;
}

export const AppointmentBooking = ({ userId, onBookingComplete }: AppointmentBookingProps) => {
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [appointmentType, setAppointmentType] = useState<"video" | "face-to-face">("video");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    loadDoctors();
    setupRealtimeSubscription();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setupRealtimeSubscription = () => {
    // Subscribe to real-time changes in doctor_profiles
    const channel = supabase
      .channel('doctor-profiles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'doctor_profiles'
        },
        () => {
          console.log('Doctor profiles updated, reloading...');
          loadDoctors();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const loadDoctors = async () => {
    try {
      // Get doctor profiles with user information and medical IDs
      // Using the schema from 20251029 migration (user_id, medical_id, specialty, consultation_fee)
      const { data: doctorProfiles, error } = await supabase
        .from('doctor_profiles')
        .select('user_id, specialty, consultation_fee, medical_id, is_verified, is_online')
        .eq('is_verified', true);

      if (error) {
        console.error('Error loading doctors:', error);
        setMockDoctors();
        return;
      }

      if (doctorProfiles && doctorProfiles.length > 0) {
        // Get user profiles separately for doctor names
        const userIds = doctorProfiles.map(p => p.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds);

        const formattedDoctors: Doctor[] = doctorProfiles.map(profile => {
          const userProfile = profiles?.find(p => p.id === profile.user_id);
          return {
            id: profile.user_id,
            full_name: userProfile?.full_name || 'Doctor',
            specialization: profile.specialty || 'General Physician',
            video_rate: profile.consultation_fee || 500,
            face_to_face_rate: Math.floor((profile.consultation_fee || 500) * 1.5),
            medical_id: profile.medical_id || 'Not specified',
            location: 'Available Online', // Can be enhanced later
            experience_years: 10 // Can be enhanced later
          };
        });
        
        console.log('Loaded doctors from database:', formattedDoctors);
        setDoctors(formattedDoctors);
      } else {
        console.log('No doctors found in database, using mock data');
        setMockDoctors();
      }
    } catch (error) {
      console.error('Error loading doctors:', error);
      setMockDoctors();
    }
  };

  const setMockDoctors = () => {
    // Fallback to mock data if no doctors in database
    const mockDoctors: Doctor[] = [
      {
        id: "doc1",
        full_name: "Dr. Rajesh Kumar",
        specialization: "General Physician",
        video_rate: 500,
        face_to_face_rate: 800,
        medical_id: "MCI-12345",
        location: "AIIMS Delhi, New Delhi",
        experience_years: 12
      },
      {
        id: "doc2",
        full_name: "Dr. Priya Sharma",
        specialization: "Cardiologist",
        video_rate: 1000,
        face_to_face_rate: 1500,
        medical_id: "MCI-67890",
        location: "Apollo Hospital, Delhi",
        experience_years: 15
      },
      {
        id: "doc3",
        full_name: "Dr. Amit Patel",
        specialization: "Pediatrician",
        video_rate: 600,
        face_to_face_rate: 900,
        medical_id: "MCI-54321",
        location: "Max Hospital, Saket",
        experience_years: 8
      }
    ];
    
    setDoctors(mockDoctors);
  };

  const getSelectedDoctorDetails = () => {
    return doctors.find(d => d.id === selectedDoctor);
  };

  const getConsultationFee = () => {
    const doctor = getSelectedDoctorDetails();
    if (!doctor) return 0;
    return appointmentType === "video" ? doctor.video_rate : doctor.face_to_face_rate;
  };

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !appointmentDate || !appointmentTime) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);

    try {
      const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
      const fee = getConsultationFee();

      // Insert appointment into database
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          patient_id: userId,
          doctor_id: selectedDoctor,
          appointment_type: appointmentType,
          appointment_date: appointmentDateTime.toISOString(),
          consultation_fee: fee,
          notes: notes,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Error booking appointment:', error);
        toast.error("Failed to book appointment. Please try again.");
        return;
      }

      toast.success("Appointment booked successfully! The doctor will be notified.", {
        description: "You'll receive a confirmation once the doctor accepts."
      });
      
      // Reset form
      setSelectedDoctor("");
      setAppointmentDate("");
      setAppointmentTime("");
      setNotes("");
      onBookingComplete?.();
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to book appointment");
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <Card className="shadow-md touch-manipulation">
      <CardHeader className="p-4 md:p-6">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <Calendar className="h-5 w-5 md:h-6 md:w-6 text-purple-600 dark:text-purple-300" />
          </div>
          <div>
            <CardTitle className="text-base md:text-lg">Book Appointment</CardTitle>
            <CardDescription className="text-xs md:text-sm">Schedule consultation with a doctor</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 md:p-6 space-y-4">
        {/* Doctor Selection */}
        <div className="space-y-2">
          <Label htmlFor="doctor" className="text-xs md:text-sm">Select Doctor *</Label>
          <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
            <SelectTrigger id="doctor" className="h-10 text-sm">
              <SelectValue placeholder="Choose a doctor" />
            </SelectTrigger>
            <SelectContent>
              {doctors.map((doctor) => (
                <SelectItem key={doctor.id} value={doctor.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{doctor.full_name}</span>
                    {doctor.specialization && (
                      <Badge variant="outline" className="ml-2 text-xs">{doctor.specialization}</Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Doctor Details Card */}
        {selectedDoctor && getSelectedDoctorDetails() && (
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200 dark:border-blue-800 rounded-lg space-y-3">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-sm md:text-base">Doctor Details</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Badge className="bg-green-600 hover:bg-green-700">
                  ID: {getSelectedDoctorDetails()?.medical_id || 'Not Available'}
                </Badge>
              </div>
              <div className="text-sm">
                <p className="font-medium text-base">{getSelectedDoctorDetails()?.full_name}</p>
                {getSelectedDoctorDetails()?.specialization && (
                  <p className="text-muted-foreground">
                    <Star className="h-3 w-3 inline mr-1" />
                    {getSelectedDoctorDetails()?.specialization}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{getSelectedDoctorDetails()?.location || 'Location not specified'}</span>
              </div>
              {getSelectedDoctorDetails()?.experience_years && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Award className="h-4 w-4" />
                  <span>{getSelectedDoctorDetails()?.experience_years} years of experience</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Appointment Type */}
        <div className="space-y-2">
          <Label className="text-xs md:text-sm">Appointment Type *</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={appointmentType === "video" ? "default" : "outline"}
              onClick={() => setAppointmentType("video")}
              className="h-auto py-3 flex-col gap-1 touch-manipulation active:scale-95"
            >
              <Video className="h-5 w-5" />
              <span className="text-xs font-medium">Video Call</span>
              {selectedDoctor && (
                <span className="text-xs flex items-center">
                  <IndianRupee className="h-3 w-3" />
                  {getSelectedDoctorDetails()?.video_rate || 0}
                </span>
              )}
            </Button>
            <Button
              type="button"
              variant={appointmentType === "face-to-face" ? "default" : "outline"}
              onClick={() => setAppointmentType("face-to-face")}
              className="h-auto py-3 flex-col gap-1 touch-manipulation active:scale-95"
            >
              <Users className="h-5 w-5" />
              <span className="text-xs font-medium">In-Person</span>
              {selectedDoctor && (
                <span className="text-xs flex items-center">
                  <IndianRupee className="h-3 w-3" />
                  {getSelectedDoctorDetails()?.face_to_face_rate || 0}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Date Selection */}
        <div className="space-y-2">
          <Label htmlFor="date" className="text-xs md:text-sm">Appointment Date *</Label>
          <input
            type="date"
            id="date"
            min={today}
            title="Select appointment date"
            value={appointmentDate}
            onChange={(e) => setAppointmentDate(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {/* Time Selection */}
        <div className="space-y-2">
          <Label htmlFor="time" className="text-xs md:text-sm flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Appointment Time *
          </Label>
          <input
            type="time"
            id="time"
            title="Select appointment time"
            value={appointmentTime}
            onChange={(e) => setAppointmentTime(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-xs md:text-sm">Additional Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Any specific concerns or requirements..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[80px] text-sm"
          />
        </div>

        {/* Consultation Fee */}
        {selectedDoctor && (
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Consultation Fee:</span>
              <span className="text-lg font-bold text-primary flex items-center">
                <IndianRupee className="h-5 w-5" />
                {getConsultationFee()}
              </span>
            </div>
          </div>
        )}

        {/* Book Button */}
        <Button
          onClick={handleBookAppointment}
          disabled={loading || !selectedDoctor || !appointmentDate || !appointmentTime}
          className="w-full h-11 touch-manipulation active:scale-95"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Booking...
            </>
          ) : (
            <>
              <Calendar className="h-4 w-4 mr-2" />
              Book Appointment
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AppointmentBooking;
