import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Video, Mic, MicOff, VideoOff, PhoneOff, MessageSquare, ArrowLeft } from "lucide-react";

const ConsultationRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [consultation, setConsultation] = useState<any>(null);
  const [notes, setNotes] = useState("");
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);

  useEffect(() => {
    if (id) {
      loadConsultation();
    }
  }, [id]);

  const loadConsultation = async () => {
    const { data, error } = await supabase
      .from("consultations")
      .select("*, profiles!consultations_patient_id_fkey(full_name)")
      .eq("id", id)
      .single();

    if (!error && data) {
      setConsultation(data);
      setNotes(data.ai_analysis || "");
    }
  };

  const handleEndConsultation = async () => {
    // Block saving notes that contain harmful instructions
    try {
      const contentSafety = await import('@/lib/contentSafety');
      if (contentSafety.isHarmful(notes)) {
        toast.error("Notes contain content that cannot be saved for safety reasons.");
        navigate('/emergency');
        return;
      }
    } catch (e) {
      // If dynamic import fails, continue but log
      console.error('Content safety check failed', e);
    }
    const { error } = await supabase
      .from("consultations")
      .update({ 
        status: "completed",
        ai_analysis: notes 
      })
      .eq("id", id);

    if (error) {
      toast.error("Failed to end consultation");
    } else {
      toast.success("Consultation completed successfully!");
      navigate("/doctor-dashboard");
    }
  };

  if (!consultation) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24">
          <p>Loading consultation...</p>
        </div>
      </div>
    );
  }

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Area */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Video Consultation with {consultation.profiles?.full_name}
                </CardTitle>
                <Badge>{consultation.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg aspect-video flex items-center justify-center mb-4">
                <div className="text-center">
                  <Video className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Video consultation interface (WebRTC integration required)
                  </p>
                </div>
              </div>

              {/* Video Controls */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  size="lg"
                  variant={isMicOn ? "default" : "destructive"}
                  className="rounded-full h-14 w-14"
                  onClick={() => setIsMicOn(!isMicOn)}
                >
                  {isMicOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
                </Button>
                <Button
                  size="lg"
                  variant={isVideoOn ? "default" : "destructive"}
                  className="rounded-full h-14 w-14"
                  onClick={() => setIsVideoOn(!isVideoOn)}
                >
                  {isVideoOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
                </Button>
                <Button
                  size="lg"
                  variant="destructive"
                  className="rounded-full h-14 w-14"
                  onClick={handleEndConsultation}
                >
                  <PhoneOff className="h-6 w-6" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Patient Info & Notes */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Patient Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{consultation.profiles?.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Symptoms</p>
                  <p className="text-sm">{consultation.symptoms}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Priority</p>
                  <Badge variant={consultation.priority === "high" ? "destructive" : "secondary"}>
                    {consultation.priority}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Consultation Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Add your notes, diagnosis, and prescription here..."
                  className="min-h-[200px]"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationRoom;