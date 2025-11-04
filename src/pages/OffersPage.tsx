import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Percent, 
  Gift, 
  Tag, 
  TrendingDown,
  Clock,
  Star,
  Zap,
  Heart,
  ExternalLink,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Offer {
  id: string;
  title: string;
  description: string;
  discount: string;
  validUntil: string;
  category: string;
  provider: string;
  code?: string;
  link: string;
  featured: boolean;
  color: string;
}

const OffersPage = () => {
  const navigate = useNavigate();

  const offers: Offer[] = [
    {
      id: "1",
      title: "Free Health Checkup",
      description: "Complete health checkup package including blood tests, ECG, and consultation",
      discount: "100% OFF",
      validUntil: "2025-12-31",
      category: "Health Checkup",
      provider: "Apollo Hospitals",
      code: "MEDAID100",
      link: "https://www.apollohospitals.com/",
      featured: true,
      color: "from-blue-600 to-cyan-600"
    },
    {
      id: "2",
      title: "50% Off on Medicines",
      description: "Get 50% discount on all generic medicines at Jan Aushadhi Kendras",
      discount: "50% OFF",
      validUntil: "2025-11-30",
      category: "Medicines",
      provider: "Jan Aushadhi",
      link: "https://janaushadhi.gov.in/",
      featured: true,
      color: "from-green-600 to-emerald-600"
    },
    {
      id: "3",
      title: "Free COVID-19 Vaccination",
      description: "Get free COVID-19 booster dose at government hospitals",
      discount: "FREE",
      validUntil: "2025-12-31",
      category: "Vaccination",
      provider: "CoWIN",
      link: "https://www.cowin.gov.in/",
      featured: true,
      color: "from-purple-600 to-pink-600"
    },
    {
      id: "4",
      title: "30% Off Lab Tests",
      description: "Save 30% on all diagnostic tests including blood, urine, and imaging",
      discount: "30% OFF",
      validUntil: "2025-11-15",
      category: "Diagnostics",
      provider: "Dr. Lal PathLabs",
      code: "HEALTH30",
      link: "https://www.lalpathlabs.com/",
      featured: false,
      color: "from-orange-600 to-red-600"
    },
    {
      id: "5",
      title: "Free Teleconsultation",
      description: "First consultation free with top doctors via video call",
      discount: "100% OFF",
      validUntil: "2025-11-20",
      category: "Consultation",
      provider: "Practo",
      code: "FIRSTFREE",
      link: "https://www.practo.com/",
      featured: false,
      color: "from-indigo-600 to-blue-600"
    },
    {
      id: "6",
      title: "₹500 Off on Surgery",
      description: "Get ₹500 discount on elective surgeries at partner hospitals",
      discount: "₹500 OFF",
      validUntil: "2025-12-15",
      category: "Surgery",
      provider: "Max Healthcare",
      code: "SURGERY500",
      link: "https://www.maxhealthcare.in/",
      featured: false,
      color: "from-rose-600 to-pink-600"
    },
    {
      id: "7",
      title: "Free Mental Health Session",
      description: "One free counseling session with certified psychologists",
      discount: "FREE",
      validUntil: "2025-11-30",
      category: "Mental Health",
      provider: "MindPeers",
      link: "https://www.mindpeers.co/",
      featured: false,
      color: "from-teal-600 to-green-600"
    },
    {
      id: "8",
      title: "40% Off Dental Care",
      description: "Save 40% on dental checkups, cleaning, and minor procedures",
      discount: "40% OFF",
      validUntil: "2025-12-01",
      category: "Dental",
      provider: "Clove Dental",
      code: "SMILE40",
      link: "https://www.clovedental.in/",
      featured: false,
      color: "from-cyan-600 to-blue-600"
    },
    {
      id: "9",
      title: "Free Eye Checkup",
      description: "Comprehensive eye examination including vision test and retina scan",
      discount: "100% OFF",
      validUntil: "2025-11-25",
      category: "Eye Care",
      provider: "Centre For Sight",
      link: "https://www.centreforsight.net/",
      featured: true,
      color: "from-amber-600 to-orange-600"
    },
    {
      id: "10",
      title: "20% Off Physiotherapy",
      description: "Get 20% discount on physiotherapy sessions for pain management",
      discount: "20% OFF",
      validUntil: "2025-12-10",
      category: "Physiotherapy",
      provider: "PhysioFirst",
      code: "PHYSIO20",
      link: "https://www.physiofirst.in/",
      featured: false,
      color: "from-violet-600 to-purple-600"
    },
    {
      id: "11",
      title: "Free Diabetes Screening",
      description: "Complete diabetes screening including HbA1c and blood sugar tests",
      discount: "FREE",
      validUntil: "2025-12-05",
      category: "Screening",
      provider: "SRL Diagnostics",
      link: "https://www.srldiagnostics.com/",
      featured: false,
      color: "from-red-600 to-rose-600"
    },
    {
      id: "12",
      title: "₹1000 Off Health Insurance",
      description: "Get ₹1000 discount on annual health insurance premium",
      discount: "₹1000 OFF",
      validUntil: "2025-11-30",
      category: "Insurance",
      provider: "HDFC ERGO",
      code: "INSURE1000",
      link: "https://www.hdfcergo.com/",
      featured: true,
      color: "from-blue-600 to-indigo-600"
    }
  ];

  const featuredOffers = offers.filter(o => o.featured);
  const regularOffers = offers.filter(o => !o.featured);

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "medicines": return <Gift className="h-5 w-5" />;
      case "vaccination": return <Zap className="h-5 w-5" />;
      case "consultation": return <Heart className="h-5 w-5" />;
      case "diagnostics": return <Tag className="h-5 w-5" />;
      default: return <Percent className="h-5 w-5" />;
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    // Could add a toast notification here
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary via-accent to-secondary py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="h-10 w-10 text-white animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Exclusive Offers
            </h1>
            <Sparkles className="h-10 w-10 text-white animate-pulse" />
          </div>
          <p className="text-lg md:text-xl text-white/90 mb-6">
            Save big on healthcare services with our special deals and discounts
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge className="bg-white text-primary px-4 py-2 text-base">
              <Gift className="h-4 w-4 mr-2" />
              12 Active Offers
            </Badge>
            <Badge className="bg-white/90 text-primary px-4 py-2 text-base">
              <TrendingDown className="h-4 w-4 mr-2" />
              Save up to 100%
            </Badge>
            <Badge className="bg-white/80 text-primary px-4 py-2 text-base">
              <Clock className="h-4 w-4 mr-2" />
              Limited Time
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Featured Offers */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
            <h2 className="text-3xl font-bold">Featured Offers</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredOffers.map((offer) => (
              <Card 
                key={offer.id} 
                className="relative overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-primary/20"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${offer.color} opacity-20 rounded-bl-full`} />
                <Badge className="absolute top-4 right-4 bg-yellow-500 text-black font-bold">
                  <Star className="h-3 w-3 mr-1 fill-black" />
                  Featured
                </Badge>
                
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${offer.color}`}>
                      {getCategoryIcon(offer.category)}
                    </div>
                  </div>
                  <CardTitle className="text-xl mb-2">{offer.title}</CardTitle>
                  <Badge variant="outline" className="w-fit">
                    {offer.category}
                  </Badge>
                </CardHeader>
                
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {offer.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className={`text-2xl font-bold bg-gradient-to-r ${offer.color} bg-clip-text text-transparent`}>
                      {offer.discount}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Valid till {new Date(offer.validUntil).toLocaleDateString('en-IN', { 
                        day: 'numeric', 
                        month: 'short' 
                      })}
                    </div>
                  </div>

                  {offer.code && (
                    <div className="mb-4 p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Promo Code</p>
                      <div className="flex items-center justify-between">
                        <code className="font-mono font-bold text-primary">{offer.code}</code>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => copyCode(offer.code!)}
                        >
                          Copy
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      className="flex-1"
                      onClick={() => window.open(offer.link, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Claim Offer
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                    <span className="font-semibold">Provider:</span> {offer.provider}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Regular Offers */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Tag className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold">More Great Deals</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {regularOffers.map((offer) => (
              <Card 
                key={offer.id} 
                className="hover:shadow-lg transition-all duration-300 hover:scale-102"
              >
                <CardHeader className="pb-3">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${offer.color} flex items-center justify-center mb-3`}>
                    {getCategoryIcon(offer.category)}
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{offer.title}</CardTitle>
                </CardHeader>
                
                <CardContent>
                  <div className={`text-xl font-bold mb-2 bg-gradient-to-r ${offer.color} bg-clip-text text-transparent`}>
                    {offer.discount}
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {offer.description}
                  </p>

                  {offer.code && (
                    <div className="mb-3 p-2 bg-muted rounded text-center">
                      <code className="text-xs font-mono font-bold">{offer.code}</code>
                    </div>
                  )}

                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => window.open(offer.link, '_blank')}
                  >
                    Claim Now
                    <ArrowRight className="h-3 w-3 ml-2" />
                  </Button>

                  <p className="text-xs text-muted-foreground mt-2">
                    {offer.provider}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-12 text-center">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => navigate('/patient-dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OffersPage;
