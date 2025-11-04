import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Phone,
  MapPin,
  Ambulance,
  Hospital,
  QrCode,
  Navigation,
  Clock,
  User,
  Heart,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface EmergencyContact {
  name: string;
  number: string;
  icon: React.ReactNode;
}

interface NearbyHospital {
  name: string;
  distance: string;
  address: string;
  phone: string;
  emergency: boolean;
}

export const SOSButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [nearbyHospitals, setNearbyHospitals] = useState<NearbyHospital[]>([]);
  const { user } = useAuth();

  // Emergency contacts
  const emergencyContacts: EmergencyContact[] = [
    { name: "Ambulance (108)", number: "108", icon: <Ambulance className="h-5 w-5" /> },
    { name: "Police (100)", number: "100", icon: <AlertCircle className="h-5 w-5" /> },
    { name: "Fire (101)", number: "101", icon: <AlertCircle className="h-5 w-5" /> },
    { name: "Women Helpline", number: "1091", icon: <Phone className="h-5 w-5" /> },
  ];

  // Mock nearby hospitals - In production, use Google Maps API or similar
  const mockHospitals: NearbyHospital[] = useMemo(() => [
    {
      name: "Apollo Hospital",
      distance: "1.2 km",
      address: "Jubilee Hills, Hyderabad",
      phone: "040-23607777",
      emergency: true,
    },
    {
      name: "CARE Hospital",
      distance: "2.5 km",
      address: "Banjara Hills, Hyderabad",
      phone: "040-61656565",
      emergency: true,
    },
    {
      name: "Yashoda Hospital",
      distance: "3.8 km",
      address: "Somajiguda, Hyderabad",
      phone: "040-44774477",
      emergency: true,
    },
  ], []);

  useEffect(() => {
    if (isOpen) {
      // Get user location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
            setNearbyHospitals(mockHospitals);
            toast.success("Location detected");
          },
          (error) => {
            console.error("Location error:", error);
            toast.error("Unable to get location");
            setNearbyHospitals(mockHospitals);
          }
        );
      }
    }
  }, [isOpen, mockHospitals]);

  const handleEmergencyCall = (number: string) => {
    window.location.href = `tel:${number}`;
    toast.success(`Calling ${number}...`);
  };

  const handleShareLocation = () => {
    if (location) {
      const locationUrl = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
      navigator.clipboard.writeText(locationUrl);
      toast.success("Location copied to clipboard!");
      
      // Share via WhatsApp
      const message = `🆘 EMERGENCY! I need help at: ${locationUrl}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`);
    } else {
      toast.error("Location not available");
    }
  };

  const handleFindAmbulance = () => {
    if (location) {
      // Open Google Maps with ambulance search
      window.open(
        `https://www.google.com/maps/search/ambulance+near+me/@${location.lat},${location.lng},15z`
      );
    } else {
      toast.error("Location not available");
    }
  };

  const generateMedicalQR = () => {
    setShowQR(true);
    
    // Medical info for QR code
    const medicalInfo = {
      name: user?.user_metadata?.full_name || "Patient",
      aadhaar: user?.user_metadata?.aadhaar_number || "Not provided",
      blood: "O+", // In production, fetch from user profile
      allergies: "None", // In production, fetch from user profile
      emergency_contact: "Emergency Contact Number",
    };
    
    toast.success("Medical QR Code generated");
  };

  return (
    <>
      {/* Floating SOS Button - Responsive positioning */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 h-14 w-14 md:h-16 md:w-16 rounded-full bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-2xl hover:shadow-red-500/50 z-50 animate-pulse hover:animate-none hover:scale-110 transition-all duration-300 border-4 border-white"
        aria-label="Emergency SOS"
      >
        <div className="flex flex-col items-center">
          <AlertCircle className="h-6 w-6 md:h-8 md:w-8 text-white drop-shadow-lg" />
          <span className="text-[10px] md:text-xs font-bold text-white mt-0.5">SOS</span>
        </div>
      </Button>

      {/* SOS Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 md:p-6 gap-3 md:gap-6">
          <DialogHeader className="pb-2 md:pb-4">
            <DialogTitle className="flex items-center gap-2 text-xl md:text-2xl text-red-600">
              <AlertCircle className="h-5 w-5 md:h-6 md:w-6 animate-pulse" />
              Emergency SOS
            </DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              Quick access to emergency services, nearby hospitals, and ambulance tracking
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 md:space-y-6">
            {/* Emergency Contacts */}
            <div>
              <h3 className="font-semibold mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base">
                <Phone className="h-4 w-4 md:h-5 md:w-5 text-red-600" />
                Emergency Helplines
              </h3>
              <div className="grid grid-cols-2 gap-2 md:gap-3">
                {emergencyContacts.map((contact) => (
                  <Card
                    key={contact.number}
                    className="cursor-pointer hover:shadow-lg active:scale-95 transition-all border-red-200 hover:border-red-400 touch-manipulation"
                    onClick={() => handleEmergencyCall(contact.number)}
                  >
                    <CardContent className="p-3 md:p-4">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="p-1.5 md:p-2 bg-red-100 rounded-lg text-red-600 flex-shrink-0">
                          {contact.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-xs md:text-sm truncate">{contact.name}</p>
                          <p className="text-base md:text-lg font-bold text-red-600">{contact.number}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="font-semibold mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base">
                <Navigation className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-2 md:gap-3">
                <Button
                  variant="outline"
                  className="h-auto py-3 md:py-4 flex flex-col items-start gap-1 md:gap-2 text-left touch-manipulation active:scale-95"
                  onClick={handleFindAmbulance}
                >
                  <Ambulance className="h-4 w-4 md:h-5 md:w-5 text-red-600" />
                  <div>
                    <p className="font-semibold text-xs md:text-sm">Find Ambulance</p>
                    <p className="text-[10px] md:text-xs text-muted-foreground">Near you</p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-3 md:py-4 flex flex-col items-start gap-1 md:gap-2 text-left touch-manipulation active:scale-95"
                  onClick={handleShareLocation}
                >
                  <MapPin className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-xs md:text-sm">Share Location</p>
                    <p className="text-[10px] md:text-xs text-muted-foreground">WhatsApp</p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-3 md:py-4 flex flex-col items-start gap-1 md:gap-2 text-left touch-manipulation active:scale-95"
                  onClick={generateMedicalQR}
                >
                  <QrCode className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
                  <div>
                    <p className="font-semibold text-xs md:text-sm">Medical QR</p>
                    <p className="text-[10px] md:text-xs text-muted-foreground">Scan code</p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-3 md:py-4 flex flex-col items-start gap-1 md:gap-2 text-left touch-manipulation active:scale-95"
                  onClick={() => window.open("/health-records")}
                >
                  <Heart className="h-4 w-4 md:h-5 md:w-5 text-pink-600" />
                  <div>
                    <p className="font-semibold text-xs md:text-sm">Records</p>
                    <p className="text-[10px] md:text-xs text-muted-foreground">Access</p>
                  </div>
                </Button>
              </div>
            </div>

            {/* Medical QR Code Display */}
            {showQR && (
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-6 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <QrCode className="h-12 w-12 text-purple-600" />
                    <div className="space-y-2">
                      <h4 className="font-bold text-lg">Medical QR Code</h4>
                      <div className="bg-white p-4 rounded-lg border-2 border-purple-300">
                        {/* Placeholder for actual QR code */}
                        <div className="w-48 h-48 bg-purple-100 flex items-center justify-center">
                          <div className="text-center">
                            <User className="h-12 w-12 mx-auto mb-2 text-purple-600" />
                            <p className="text-sm font-semibold">
                              {user?.user_metadata?.full_name || "Patient"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Scan for medical details
                            </p>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground max-w-xs">
                        Show this QR code to emergency responders for instant access to your
                        medical information
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Nearby Hospitals */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Hospital className="h-5 w-5 text-blue-600" />
                Nearby Hospitals (Emergency Ready)
              </h3>
              <div className="space-y-2">
                {nearbyHospitals.map((hospital, index) => (
                  <Card
                    key={index}
                    className="cursor-pointer hover:shadow-md transition-all"
                    onClick={() => handleEmergencyCall(hospital.phone)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold">{hospital.name}</p>
                            {hospital.emergency && (
                              <Badge variant="destructive" className="text-xs">
                                24/7 Emergency
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {hospital.distance}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {hospital.phone}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {hospital.address}
                          </p>
                        </div>
                        <Button size="sm" variant="outline">
                          <Navigation className="h-4 w-4 mr-1" />
                          Navigate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Emergency Info */}
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-amber-900 mb-1">
                      What to do in an emergency:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-amber-800">
                      <li>Stay calm and call emergency services immediately</li>
                      <li>Share your location with responders</li>
                      <li>Show your Medical QR Code to paramedics</li>
                      <li>Follow emergency operator instructions</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SOSButton;
