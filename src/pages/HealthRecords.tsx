import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FileText, Shield, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatHealthId } from "@/lib/universalHealthId";
import QRCodeGenerator from "@/components/QRCodeGenerator";

const HealthRecords = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showHealthIdCard, setShowHealthIdCard] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadRecords();
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, health_id")
      .eq("id", user?.id)
      .single();

    if (!error && data) {
      setUserProfile(data);
    }
  };

  const loadRecords = async () => {
    const { data, error } = await supabase
      .from("health_records")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setRecords(data);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-20">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Health Records</h1>
          <p className="text-muted-foreground">View and manage your medical history</p>
        </div>

        {/* Health ID Card Section */}
        {userProfile?.health_id && (
          <Card className="mb-8 shadow-lg border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle>Your Universal Health ID</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Securely access your health records anywhere
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHealthIdCard(!showHealthIdCard)}
                >
                  {showHealthIdCard ? 'Hide Card' : 'Show Card'}
                </Button>
              </div>
            </CardHeader>
            {showHealthIdCard && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Health ID Display */}
                  <div className="space-y-4">
                    <div className="p-4 bg-card rounded-lg border">
                      <Label className="text-xs text-muted-foreground">Health ID Number</Label>
                      <p className="text-2xl font-mono font-bold mt-2">
                        {formatHealthId(userProfile.health_id)}
                      </p>
                    </div>
                    <div className="p-4 bg-card rounded-lg border">
                      <Label className="text-xs text-muted-foreground">Holder Name</Label>
                      <p className="text-lg font-semibold mt-2">
                        {userProfile.full_name}
                      </p>
                    </div>
                    <Button className="w-full" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download Health ID Card
                    </Button>
                  </div>

                  {/* QR Code */}
                  <div className="flex flex-col items-center justify-center p-6 bg-card rounded-lg border">
                    <p className="text-sm text-muted-foreground mb-4">Scan for Quick Access</p>
                    <QRCodeGenerator 
                      value={userProfile.health_id}
                      size={200}
                    />
                    <p className="text-xs text-muted-foreground mt-4 text-center">
                      Show this QR code at hospitals for instant check-in
                    </p>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        )}

        <h2 className="text-2xl font-bold mb-4">Medical Records</h2>

        {records.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {records.map((record) => (
              <Card key={record.id} className="shadow-md hover:shadow-lg transition-smooth">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{record.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {new Date(record.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge>{record.record_type}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{record.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="shadow-md">
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No health records found</p>
              <p className="text-sm text-muted-foreground mt-2">
                Your medical records will appear here after consultations
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default HealthRecords;
