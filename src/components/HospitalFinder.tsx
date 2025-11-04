import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Navigation, Phone, AlertCircle, Loader2, ExternalLink, Search, Clock, Car } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Hospital {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  emergency_services: boolean;
  distance?: number;
  travelTime?: number; // in minutes
  accessibility?: 'excellent' | 'good' | 'moderate' | 'far';
}

const mockHospitals: Hospital[] = [
  {
    id: "1",
    name: "AIIMS Delhi",
    address: "Ansari Nagar, New Delhi, Delhi 110029",
    latitude: 28.5672,
    longitude: 77.2100,
    phone: "+91-11-26588500",
    emergency_services: true
  },
  {
    id: "2",
    name: "Apollo Hospital",
    address: "Sarita Vihar, Delhi, 110076",
    latitude: 28.5355,
    longitude: 77.2860,
    phone: "+91-11-26925858",
    emergency_services: true
  },
  {
    id: "3",
    name: "Max Super Speciality Hospital",
    address: "Saket, New Delhi, Delhi 110017",
    latitude: 28.5245,
    longitude: 77.2066,
    phone: "+91-11-26515050",
    emergency_services: true
  },
  {
    id: "4",
    name: "Fortis Hospital",
    address: "Shalimar Bagh, Delhi, 110088",
    latitude: 28.7174,
    longitude: 77.1639,
    phone: "+91-11-47135000",
    emergency_services: true
  },
  {
    id: "5",
    name: "Sir Ganga Ram Hospital",
    address: "Rajinder Nagar, New Delhi, Delhi 110060",
    latitude: 28.6436,
    longitude: 77.1855,
    phone: "+91-11-25750000",
    emergency_services: true
  }
];

export const HospitalFinder = () => {
  const [loading, setLoading] = useState(false);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance * 10) / 10; // Round to 1 decimal
  };

  const estimateTravelTime = (distance: number): number => {
    // Estimate travel time based on distance
    // Assuming average speed of 30 km/h in city (includes traffic)
    const averageSpeed = 30;
    const timeInHours = distance / averageSpeed;
    return Math.round(timeInHours * 60); // Convert to minutes
  };

  const getAccessibilityLevel = (distance: number): 'excellent' | 'good' | 'moderate' | 'far' => {
    if (distance <= 5) return 'excellent';
    if (distance <= 10) return 'good';
    if (distance <= 20) return 'moderate';
    return 'far';
  };

  const getAccessibilityColor = (level?: string) => {
    switch (level) {
      case 'excellent': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'good': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'far': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const processHospitals = (lat: number, lng: number) => {
    const hospitalsWithDetails = mockHospitals.map(hospital => {
      const distance = calculateDistance(lat, lng, hospital.latitude, hospital.longitude);
      const travelTime = estimateTravelTime(distance);
      const accessibility = getAccessibilityLevel(distance);
      
      return {
        ...hospital,
        distance,
        travelTime,
        accessibility
      };
    });

    // Sort by distance (nearest first)
    hospitalsWithDetails.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    setHospitals(hospitalsWithDetails);
  };

  const getCurrentLocation = () => {
    setLoading(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setLoading(false);
      toast.error("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        processHospitals(latitude, longitude);
        setLoading(false);
        toast.success("Location detected! Showing nearby hospitals");
      },
      (error) => {
        setLoading(false);
        let errorMsg = "Unable to get your location";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = "Location permission denied. Please enable location access.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = "Location information unavailable";
            break;
          case error.TIMEOUT:
            errorMsg = "Location request timed out";
            break;
        }
        
        setLocationError(errorMsg);
        toast.error(errorMsg);
        setHospitals(mockHospitals);
      }
    );
  };

  const searchByPincodeOrArea = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a pincode or area name");
      return;
    }

    setSearchLoading(true);
    setLocationError(null);

    try {
      // Improved geocoding with better query parameters
      // If it's a 6-digit number, treat as pincode
      const isPincode = /^\d{6}$/.test(searchQuery.trim());
      
      let query = searchQuery;
      if (isPincode) {
        query = `Pincode ${searchQuery}, India`;
      } else {
        query = `${searchQuery}, India`;
      }
      
      // Use Nominatim API with improved parameters
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `format=json&` +
        `q=${encodeURIComponent(query)}&` +
        `countrycodes=in&` +
        `limit=5&` +
        `addressdetails=1`
      );
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        // Filter results for better accuracy
        let bestMatch = data[0];
        
        if (isPincode) {
          // For pincodes, prefer results that mention postal/postcode
          const postalMatch = data.find((item: { type?: string; category?: string }) => 
            item.type === 'postcode' || 
            item.category === 'place' ||
            item.type === 'postal_code'
          );
          if (postalMatch) {
            bestMatch = postalMatch;
          }
        } else {
          // For area names, prefer populated places
          const placeMatch = data.find((item: { type?: string }) => 
            ['city', 'town', 'village', 'suburb', 'neighbourhood'].includes(item.type || '')
          );
          if (placeMatch) {
            bestMatch = placeMatch;
          }
        }
        
        const { lat, lon } = bestMatch;
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);
        
        setUserLocation({ lat: latitude, lng: longitude });
        processHospitals(latitude, longitude);
        toast.success(`Found location for "${searchQuery}"`);
      } else {
        toast.error("Location not found. Please try a different pincode or area.");
        setHospitals(mockHospitals);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      toast.error("Failed to search location. Please try again.");
      setHospitals(mockHospitals);
    } finally {
      setSearchLoading(false);
    }
  };

  const openGoogleMaps = (hospital: Hospital) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const callHospital = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  useEffect(() => {
    // Show all hospitals on load
    setHospitals(mockHospitals);
  }, []);

  return (
    <Card className="shadow-md touch-manipulation">
      <CardHeader className="p-4 md:p-6">
        <div className="flex items-center gap-2 md:gap-3 mb-4">
          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
            <MapPin className="h-5 w-5 md:h-6 md:w-6 text-green-600 dark:text-green-300" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-base md:text-lg">Nearby Hospitals</CardTitle>
            <CardDescription className="text-xs md:text-sm">Find accessible hospitals near you</CardDescription>
          </div>
        </div>

        {/* Search by Pincode or Area */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Enter pincode or area name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchByPincodeOrArea()}
              className="text-sm"
            />
            <Button
              onClick={searchByPincodeOrArea}
              disabled={searchLoading}
              size="sm"
              className="h-10 px-4 touch-manipulation active:scale-95"
            >
              {searchLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Search className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Search</span>
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-xs text-muted-foreground">OR</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          <Button
            onClick={getCurrentLocation}
            disabled={loading}
            size="sm"
            variant="outline"
            className="w-full h-9 text-xs md:text-sm touch-manipulation active:scale-95"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Navigation className="h-4 w-4 mr-1" />
            )}
            Use My Current Location
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 md:p-6 space-y-3">
        {locationError && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs md:text-sm text-yellow-800 dark:text-yellow-200">{locationError}</p>
          </div>
        )}

        {userLocation && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-xs md:text-sm text-green-800 dark:text-green-200 flex items-center gap-2">
              <Navigation className="h-4 w-4" />
              <span className="font-medium">Location set:</span> Showing {hospitals.length} hospitals sorted by accessibility
            </p>
          </div>
        )}

        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {hospitals.map((hospital) => (
            <div
              key={hospital.id}
              className="p-3 md:p-4 border border-border rounded-lg hover:shadow-md transition-smooth touch-manipulation"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm md:text-base line-clamp-1">{hospital.name}</h4>
                    <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mt-1">{hospital.address}</p>
                  </div>
                  {hospital.emergency_services && (
                    <Badge variant="destructive" className="text-xs flex-shrink-0">Emergency</Badge>
                  )}
                </div>

                {hospital.distance !== undefined && (
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={`text-xs ${getAccessibilityColor(hospital.accessibility)}`}>
                      {hospital.accessibility === 'excellent' && '🟢 Very Close'}
                      {hospital.accessibility === 'good' && '🔵 Nearby'}
                      {hospital.accessibility === 'moderate' && '🟡 Moderate'}
                      {hospital.accessibility === 'far' && '🟠 Far'}
                    </Badge>
                    <span className="text-xs md:text-sm font-medium text-primary flex items-center gap-1">
                      <Car className="h-3 w-3" />
                      {hospital.distance} km
                    </span>
                    <span className="text-xs md:text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      ~{hospital.travelTime} min
                    </span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button
                    onClick={() => openGoogleMaps(hospital)}
                    size="sm"
                    className="flex-1 h-9 text-xs md:text-sm touch-manipulation active:scale-95"
                  >
                    <ExternalLink className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    Get Directions
                  </Button>
                  {hospital.phone && (
                    <Button
                      onClick={() => callHospital(hospital.phone!)}
                      size="sm"
                      variant="outline"
                      className="flex-1 h-9 text-xs md:text-sm touch-manipulation active:scale-95"
                    >
                      <Phone className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                      Call
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default HospitalFinder;
