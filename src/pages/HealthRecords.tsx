import React, { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FileText, Shield, Download, QrCode } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatHealthId } from "@/lib/universalHealthId";
import QRCodeGenerator from "@/components/QRCodeGenerator";
import QRCodeScanner from "@/components/QRCodeScanner";
import { Tables } from "@/integrations/supabase/types";

// Memoized record card for smoother UI
const RecordCard = React.memo(({ record }: { record: Tables<'health_records'> }) => (
  <Card className="shadow-md hover:shadow-lg transition-smooth card-hover dark:border-border/50">
    <CardHeader>
      <div className="flex items-start justify-between">
        <div className="p-2 bg-primary/10 rounded-lg dark:bg-primary/20">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <CardTitle className="text-lg">{record.title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {new Date(record.created_at).toLocaleDateString()}
          </p>
        </div>
        <Badge className="dark:bg-accent/20 dark:text-accent-foreground dark:border-accent/30">{record.record_type}</Badge>
      </div>
    </CardHeader>
    <CardContent>
      <p className="text-sm">{record.description}</p>
    </CardContent>
  </Card>
));

const HealthRecords = () => {
  const [records, setRecords] = useState<Tables<'health_records'>[]>([]);
  const [userProfile, setUserProfile] = useState<{ full_name: string } | null>(null);
  const [healthId, setHealthId] = useState<string | null>(null);
  const [showHealthIdCard, setShowHealthIdCard] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const { user } = useAuth();

  const loadUserProfile = useCallback(async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user?.id)
      .single();

    if (!error && data) {
      setUserProfile(data);
    }

    // Also load health ID
    const { data: healthIdData, error: healthIdError } = await supabase
      .from("health_ids")
      .select("health_id_number")
      .eq("user_id", user?.id)
      .single();

    if (!healthIdError && healthIdData) {
      setHealthId(healthIdData.health_id_number);
    }
  }, [user?.id]);

  const loadRecords = useCallback(async () => {
    const { data, error } = await supabase
      .from("health_records")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setRecords(data);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      loadRecords();
      loadUserProfile();
    }
  }, [user, loadRecords, loadUserProfile]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-20">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Health Records</h1>
          <p className="text-muted-foreground">View and manage your medical history</p>
        </div>

        {/* Health ID Card Section */}
        {healthId && userProfile && (
          <Card className="mb-8 shadow-lg border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10 dark:border-primary/30 card-hover">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="h-8 w-8 text-primary dark:text-primary animate-pulse-glow" />
                  <div>
                    <CardTitle className="dark:text-foreground">Your Universal Health ID</CardTitle>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                      Securely access your health records anywhere
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHealthIdCard(!showHealthIdCard)}
                  className="dark:border-border dark:hover:bg-accent/10 button-glow"
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
                    <div className="p-4 bg-card rounded-lg border dark:border-border/50 dark:bg-card/50">
                      <Label className="text-xs text-muted-foreground dark:text-muted-foreground">Health ID Number</Label>
                      <p className="text-2xl font-mono font-bold mt-2 dark:text-foreground">
                        {formatHealthId(healthId)}
                      </p>
                    </div>
                    <div className="p-4 bg-card rounded-lg border dark:border-border/50 dark:bg-card/50">
                      <Label className="text-xs text-muted-foreground dark:text-muted-foreground">Holder Name</Label>
                      <p className="text-lg font-semibold mt-2 dark:text-foreground">
                        {userProfile.full_name}
                      </p>
                    </div>
                    <Button className="w-full dark:bg-primary dark:hover:bg-primary/90 button-glow" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download Health ID Card
                    </Button>
                  </div>

                  {/* QR Code */}
                  <div className="flex flex-col items-center justify-center p-6 bg-card rounded-lg border dark:border-border/50 dark:bg-card/50">
                    <p className="text-sm text-muted-foreground mb-4 dark:text-muted-foreground">Scan for Quick Access</p>
                    <QRCodeGenerator 
                      value={healthId}
                      size={200}
                    />
                    <p className="text-xs text-muted-foreground mt-4 text-center dark:text-muted-foreground">
                      Show this QR code at hospitals for instant check-in
                    </p>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* Quick Access Scanner */}
        <div className="mb-8">
          <Card className="shadow-lg border-2 border-primary/20 dark:border-primary/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg dark:bg-primary/20">
                    <QrCode className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="dark:text-foreground">Quick Access Scanner</CardTitle>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                      Scan Health ID QR codes for instant access
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowScanner(!showScanner)}
                  className="dark:border-border dark:hover:bg-accent/10 button-glow"
                >
                  {showScanner ? 'Hide Scanner' : 'Open Scanner'}
                </Button>
              </div>
            </CardHeader>
            {showScanner && (
              <CardContent>
                <QRCodeScanner
                  onScanSuccess={(data) => {
                    console.log('Scanned:', data);
                    // Here you would handle the scanned data
                    // For example, navigate to the health record or show patient info
                  }}
                  onScanError={(error) => {
                    console.error('Scan error:', error);
                  }}
                />
              </CardContent>
            )}
          </Card>
        </div>

        <h2 className="text-2xl font-bold mb-4 dark:text-foreground">Medical Records</h2>

        {records.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {records.map((record) => (
              <RecordCard key={record.id} record={record} />
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
