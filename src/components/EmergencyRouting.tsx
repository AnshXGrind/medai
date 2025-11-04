import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Ambulance, 
  MapPin, 
  Phone, 
  Navigation, 
  Clock,
  AlertCircle,
  Shield,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

interface EmergencyFacility {
  id: string;
  name: string;
  type: 'ambulance' | 'phc' | 'hospital';
  distance: number;
  eta: number;
  phone: string;
  available: boolean;
  lat: number;
  lng: number;
}

export const EmergencyRouting = () => {
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearestFacilities, setNearestFacilities] = useState<EmergencyFacility[]>([]);
  const [emergencyActive, setEmergencyActive] = useState(false);

  // Mock facilities data
  const mockFacilities: EmergencyFacility[] = [
    {
      id: '1',
      name: '108 Ambulance Service',
      type: 'ambulance',
      distance: 0.8,
      eta: 4,
      phone: '108',
      available: true,
      lat: 28.7041,
      lng: 77.1025
    },
    {
      id: '2',
      name: 'Primary Health Center - Connaught Place',
      type: 'phc',
      distance: 1.2,
      eta: 6,
      phone: '+91-11-23417000',
      available: true,
      lat: 28.6328,
      lng: 77.2197
    },
    {
      id: '3',
      name: 'AIIMS Emergency',
      type: 'hospital',
      distance: 2.5,
      eta: 12,
      phone: '+91-11-26588500',
      available: true,
      lat: 28.5672,
      lng: 77.2100
    }
  ];

  const detectLocation = () => {
    setIsDetectingLocation(true);
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setNearestFacilities(mockFacilities);
          setIsDetectingLocation(false);
          
          toast.success("Location detected", {
            description: "Finding nearest emergency facilities..."
          });
        },
        (error) => {
          console.error("Location error:", error);
          setIsDetectingLocation(false);
          // Use mock location for demo
          setUserLocation({ lat: 28.7041, lng: 77.1025 });
          setNearestFacilities(mockFacilities);
          toast.info("Using approximate location for demo");
        }
      );
    } else {
      setIsDetectingLocation(false);
      toast.error("Geolocation not supported");
    }
  };

  const activateEmergency = (facility: EmergencyFacility) => {
    setEmergencyActive(true);
    
    toast.success("Emergency alert sent!", {
      description: `${facility.name} has been notified. ETA: ${facility.eta} minutes`
    });

    // Simulate emergency notification
    setTimeout(() => {
      toast.info("Emergency services en route", {
        description: "Track the ambulance in real-time"
      });
    }, 2000);
  };

  const openInMaps = (facility: EmergencyFacility) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${facility.lat},${facility.lng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const callFacility = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  return (
    <div className="space-y-4">
      {/* Emergency Header */}
      <Card className="border-2 border-red-500 dark:border-red-800 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600 rounded-lg">
              <Ambulance className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">Emergency Routing</CardTitle>
              <CardDescription className="text-xs">
                Find nearest medical help instantly
              </CardDescription>
            </div>
            <Badge className="bg-red-600 text-white">LIVE</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <Alert className="border-red-200 bg-red-50 dark:bg-red-950 mb-4">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-xs">
              <strong>For life-threatening emergencies:</strong> Call 108 (Ambulance) or 102 (Health) immediately
            </AlertDescription>
          </Alert>

          {!userLocation ? (
            <Button 
              onClick={detectLocation}
              disabled={isDetectingLocation}
              className="w-full bg-red-600 hover:bg-red-700"
              size="lg"
            >
              {isDetectingLocation ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Detecting Location...
                </>
              ) : (
                <>
                  <Navigation className="h-5 w-5 mr-2" />
                  Find Nearest Help
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <MapPin className="h-4 w-4" />
                <span>Your location detected</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nearest Facilities */}
      {nearestFacilities.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Nearest Emergency Facilities</h3>
          
          {nearestFacilities.map((facility) => (
            <Card key={facility.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Facility Header */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {facility.type === 'ambulance' ? (
                          <Ambulance className="h-4 w-4 text-red-600" />
                        ) : facility.type === 'phc' ? (
                          <Shield className="h-4 w-4 text-blue-600" />
                        ) : (
                          <MapPin className="h-4 w-4 text-green-600" />
                        )}
                        <h4 className="font-semibold">{facility.name}</h4>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Navigation className="h-3 w-3" />
                          {facility.distance} km away
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          ETA: {facility.eta} min
                        </span>
                      </div>
                    </div>
                    <Badge 
                      variant={facility.available ? "default" : "secondary"}
                      className={facility.available ? "bg-green-600" : ""}
                    >
                      {facility.available ? "Available" : "Busy"}
                    </Badge>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      onClick={() => callFacility(facility.phone)}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      <Phone className="h-3 w-3 mr-1" />
                      Call
                    </Button>
                    <Button
                      onClick={() => openInMaps(facility)}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      <MapPin className="h-3 w-3 mr-1" />
                      Navigate
                    </Button>
                    {facility.type === 'ambulance' && (
                      <Button
                        onClick={() => activateEmergency(facility)}
                        variant="destructive"
                        size="sm"
                        className="text-xs"
                        disabled={emergencyActive}
                      >
                        <Ambulance className="h-3 w-3 mr-1" />
                        Alert
                      </Button>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div className="text-xs text-muted-foreground">
                    📞 {facility.phone}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Emergency Numbers Reference */}
      <Card className="bg-secondary">
        <CardContent className="p-4">
          <h4 className="font-semibold mb-3 text-sm">Emergency Helpline Numbers</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Ambulance className="h-3 w-3" />
              <span><strong>108:</strong> Ambulance</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-3 w-3" />
              <span><strong>102:</strong> Health</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-3 w-3" />
              <span><strong>104:</strong> Medical Helpline</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3" />
              <span><strong>1075:</strong> Women Helpline</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmergencyRouting;
