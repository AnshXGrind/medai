import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Pill, 
  Package, 
  MapPin, 
  Search, 
  CheckCircle2, 
  XCircle,
  Clock,
  IndianRupee,
  TrendingDown,
  AlertCircle,
  Navigation
} from "lucide-react";
import { toast } from "sonner";

interface Medicine {
  name: string;
  genericName: string;
  price: number;
  marketPrice: number;
  available: boolean;
  stock: 'high' | 'medium' | 'low' | 'out';
  location: string;
  distance?: number;
}

interface PHCCenter {
  name: string;
  address: string;
  distance: number;
  medicines: number;
  lastUpdated: string;
  open: boolean;
}

export const JanAushadhiStockTracker = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState<'medicine' | 'centers'>('medicine');

  const medicines: Medicine[] = [
    {
      name: "Paracetamol 500mg",
      genericName: "Paracetamol",
      price: 2.5,
      marketPrice: 15,
      available: true,
      stock: 'high',
      location: "Jan Aushadhi Kendra, Connaught Place",
      distance: 2.3
    },
    {
      name: "Metformin 500mg",
      genericName: "Metformin Hydrochloride",
      price: 4.2,
      marketPrice: 28,
      available: true,
      stock: 'medium',
      location: "PHC Saket",
      distance: 3.8
    },
    {
      name: "Amlodipine 5mg",
      genericName: "Amlodipine Besylate",
      price: 3.8,
      marketPrice: 35,
      available: true,
      stock: 'low',
      location: "Jan Aushadhi Kendra, Dwarka",
      distance: 8.5
    },
    {
      name: "Atorvastatin 10mg",
      genericName: "Atorvastatin Calcium",
      price: 5.5,
      marketPrice: 45,
      available: false,
      stock: 'out',
      location: "PHC Rohini",
      distance: 12.0
    },
    {
      name: "Omeprazole 20mg",
      genericName: "Omeprazole",
      price: 3.0,
      marketPrice: 22,
      available: true,
      stock: 'high',
      location: "Jan Aushadhi Kendra, Lajpat Nagar",
      distance: 5.2
    }
  ];

  const phcCenters: PHCCenter[] = [
    {
      name: "Jan Aushadhi Kendra - Connaught Place",
      address: "Block B, Connaught Place, New Delhi",
      distance: 2.3,
      medicines: 450,
      lastUpdated: "1 hour ago",
      open: true
    },
    {
      name: "Primary Health Center - Saket",
      address: "Saket District Centre, Delhi",
      distance: 3.8,
      medicines: 280,
      lastUpdated: "30 mins ago",
      open: true
    },
    {
      name: "Jan Aushadhi Kendra - Dwarka",
      address: "Sector 12, Dwarka, New Delhi",
      distance: 8.5,
      medicines: 520,
      lastUpdated: "2 hours ago",
      open: true
    },
    {
      name: "PHC Rohini",
      address: "Sector 15, Rohini, Delhi",
      distance: 12.0,
      medicines: 195,
      lastUpdated: "45 mins ago",
      open: false
    }
  ];

  const getStockColor = (stock: string) => {
    switch (stock) {
      case 'high': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'out': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const calculateSavings = (marketPrice: number, janAushadhiPrice: number) => {
    const savings = marketPrice - janAushadhiPrice;
    const percentage = Math.round((savings / marketPrice) * 100);
    return { amount: savings, percentage };
  };

  const filteredMedicines = medicines.filter(med => 
    searchQuery === "" || 
    med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    med.genericName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="shadow-md">
      <CardHeader className="p-4 md:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
            <Pill className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-base md:text-lg">Jan Aushadhi & PHC Stock Tracker</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Find affordable generic medicines near you
            </CardDescription>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search medicine or generic name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>
          <Button 
            size="sm" 
            className="h-10 px-4"
            onClick={() => toast.success("Searching nearby Jan Aushadhi Kendras...")}
          >
            <Navigation className="h-4 w-4 mr-1" />
            Nearby
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 md:p-6 space-y-4">
        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-border">
          <button
            onClick={() => setSelectedTab('medicine')}
            className={`pb-2 px-3 text-sm font-medium transition-colors ${
              selectedTab === 'medicine'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Medicines
          </button>
          <button
            onClick={() => setSelectedTab('centers')}
            className={`pb-2 px-3 text-sm font-medium transition-colors ${
              selectedTab === 'centers'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Centers
          </button>
        </div>

        {/* Medicines Tab */}
        {selectedTab === 'medicine' && (
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {filteredMedicines.map((med, index) => {
              const savings = calculateSavings(med.marketPrice, med.price);
              
              return (
                <div 
                  key={index}
                  className="p-3 border border-border rounded-lg hover:shadow-md transition-smooth"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{med.name}</h4>
                        {med.available ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{med.genericName}</p>
                    </div>
                    <Badge className={`text-xs ${getStockColor(med.stock)}`}>
                      {med.stock === 'high' && 'In Stock'}
                      {med.stock === 'medium' && 'Limited'}
                      {med.stock === 'low' && 'Low Stock'}
                      {med.stock === 'out' && 'Out of Stock'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div>
                      <p className="text-xs text-muted-foreground">Jan Aushadhi Price</p>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400 flex items-center">
                        <IndianRupee className="h-4 w-4" />
                        {med.price.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Market Price</p>
                      <p className="text-sm text-muted-foreground line-through flex items-center">
                        <IndianRupee className="h-3 w-3" />
                        {med.marketPrice.toFixed(2)}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                        <TrendingDown className="h-3 w-3" />
                        Save {savings.percentage}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span className="line-clamp-1">{med.location}</span>
                    </div>
                    {med.distance && (
                      <span className="text-xs font-medium text-primary">
                        {med.distance} km
                      </span>
                    )}
                  </div>

                  {med.available && (
                    <Button 
                      size="sm" 
                      className="w-full h-8 mt-2 text-xs"
                      onClick={() => toast.success(`Reserved ${med.name} at ${med.location}`)}
                    >
                      <Package className="h-3 w-3 mr-1" />
                      Reserve Medicine
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Centers Tab */}
        {selectedTab === 'centers' && (
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {phcCenters.map((center, index) => (
              <div 
                key={index}
                className="p-3 border border-border rounded-lg hover:shadow-md transition-smooth"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{center.name}</h4>
                      {center.open ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                          Open
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs">
                          Closed
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {center.address}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">{center.distance} km</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      {center.medicines} medicines
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {center.lastUpdated}
                    </span>
                  </div>
                </div>

                <Button 
                  size="sm" 
                  variant="outline"
                  className="w-full h-8 mt-2 text-xs"
                  onClick={() => toast.info(`Getting directions to ${center.name}...`)}
                >
                  <Navigation className="h-3 w-3 mr-1" />
                  Get Directions
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Info Banner */}
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">💊 Save up to 90% on medicines!</p>
              <p className="text-blue-700 dark:text-blue-300">
                Jan Aushadhi Kendras provide quality generic medicines at affordable prices. Stock updated every 2 hours.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default JanAushadhiStockTracker;
