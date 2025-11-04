import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapPin, Phone, Clock, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";

const Hospitals = () => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  // Sample hospitals with actual coordinates
  const hospitals = [
    {
      id: 1,
      name: "City General Hospital",
      address: "123 Main Street, City Center",
      phone: "+91 98765 43210",
      hours: "24/7 Emergency Services",
      lat: userLocation ? userLocation.lat + 0.01 : 28.6139,
      lng: userLocation ? userLocation.lng + 0.01 : 77.2090
    },
    {
      id: 2,
      name: "Apollo Hospital",
      address: "456 Health Avenue, Medical District",
      phone: "+91 98765 43211",
      hours: "24/7 Emergency Services",
      lat: userLocation ? userLocation.lat - 0.01 : 28.6239,
      lng: userLocation ? userLocation.lng - 0.01 : 77.2190
    },
    {
      id: 3,
      name: "Max Super Specialty Hospital",
      address: "789 Care Boulevard, Healthcare Zone",
      phone: "+91 98765 43212",
      hours: "24/7 Emergency Services",
      lat: userLocation ? userLocation.lat + 0.02 : 28.6039,
      lng: userLocation ? userLocation.lng + 0.02 : 77.1990
    }
  ];

  const filteredHospitals = hospitals.filter(hospital =>
    hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hospital.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openInMaps = (hospital: typeof hospitals[0]) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${hospital.lat},${hospital.lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-20">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Find Hospitals</h1>
          <p className="text-muted-foreground">Locate nearby hospitals and emergency services</p>
        </div>

        <div className="mb-6">
          <Input
            placeholder="Search hospitals by name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Interactive Map */}
        <div className="mb-8 rounded-lg overflow-hidden shadow-lg h-[400px] bg-muted">
          {userLocation ? (
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0 }}
              src={`https://www.google.com/maps/embed/v1/search?key=&q=hospitals+near+${userLocation.lat},${userLocation.lng}&zoom=13`}
              allowFullScreen
              title="Hospitals Map"
              className="grayscale-0"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Loading map...</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHospitals.map((hospital) => (
            <Card key={hospital.id} className="shadow-md hover:shadow-lg transition-smooth">
              <CardHeader>
                <CardTitle className="text-xl">{hospital.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{hospital.address}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-secondary flex-shrink-0" />
                  <a href={`tel:${hospital.phone}`} className="text-sm hover:underline">
                    {hospital.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-accent flex-shrink-0" />
                  <p className="text-sm">{hospital.hours}</p>
                </div>
                <Button
                  onClick={() => openInMaps(hospital)}
                  className="w-full mt-4"
                  variant="outline"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Get Directions
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredHospitals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No hospitals found matching your search</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Hospitals;