import { useState } from "react";
import { Shield, Heart, Wallet, Stethoscope, X, ExternalLink, Info, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface GovtScheme {
  id: string;
  name: string;
  icon: React.ElementType;
  ministry: string;
  coverage: string;
  eligibility: string;
  color: string;
  tagline: string;
  benefits: string[];
  applyLink: string;
}

const GovtSchemesBubble = () => {
  const [selectedScheme, setSelectedScheme] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const govtSchemes: GovtScheme[] = [
    {
      id: "ab-pmjay",
      name: "Ayushman Bharat PM-JAY",
      icon: Shield,
      ministry: "Ministry of Health",
      coverage: "₹5 Lakh/family/year",
      eligibility: "10.74 crore poor families",
      color: "from-blue-600 to-cyan-600",
      tagline: "World's Largest Health Insurance",
      benefits: [
        "World's largest health insurance scheme",
        "25,000+ empanelled hospitals across India",
        "Paperless & cashless treatment",
        "1,573 medical procedures covered",
        "Pre and post hospitalization benefits"
      ],
      applyLink: "https://pmjay.gov.in/"
    },
    {
      id: "arogya-sanjeevani",
      name: "Arogya Sanjeevani Policy",
      icon: Heart,
      ministry: "IRDAI",
      coverage: "₹50,000-10,00,000",
      eligibility: "All age groups",
      color: "from-green-600 to-emerald-600",
      tagline: "Standard Health Insurance for All",
      benefits: [
        "Standardized health insurance product",
        "Hospitalization expenses covered",
        "Pre & post hospitalization care",
        "Day care procedures included",
        "Affordable premium options"
      ],
      applyLink: "https://www.irdai.gov.in/"
    },
    {
      id: "jan-aushadhi",
      name: "Jan Aushadhi Scheme",
      icon: Wallet,
      ministry: "Ministry of Chemicals",
      coverage: "Affordable medicines",
      eligibility: "All citizens",
      color: "from-purple-600 to-pink-600",
      tagline: "Affordable Quality Medicines",
      benefits: [
        "Generic medicines at 50-90% lower prices",
        "10,000+ Jan Aushadhi Kendras nationwide",
        "Quality assured by Bureau of Pharma PSUs",
        "2,000+ medicines & 300+ surgicals available",
        "Helping save ₹3,600+ crore annually"
      ],
      applyLink: "https://janaushadhi.gov.in/"
    },
    {
      id: "national-health",
      name: "National Health Mission",
      icon: Stethoscope,
      ministry: "Ministry of Health",
      coverage: "Comprehensive healthcare",
      eligibility: "All citizens",
      color: "from-orange-600 to-red-600",
      tagline: "Universal Health Coverage",
      benefits: [
        "Maternal & child health services",
        "Communicable disease control programs",
        "Free diagnostic services",
        "Strengthening health systems infrastructure",
        "Focus on rural and underserved areas"
      ],
      applyLink: "https://nhm.gov.in/"
    }
  ];

  const renderDetailCard = (scheme: GovtScheme) => {
    const Icon = scheme.icon;
    
    return (
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4"
        onClick={() => setSelectedScheme(null)}
      >
        <Card 
          className="max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-3 rounded-full bg-gradient-to-br",
                  scheme.color
                )}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{scheme.name}</h2>
                  <p className="text-sm text-muted-foreground">{scheme.ministry}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedScheme(null)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-secondary rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Coverage</p>
                <p className="text-lg font-bold">{scheme.coverage}</p>
              </div>
              <div className="p-4 bg-secondary rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <p className="text-lg font-bold text-green-600">FREE/Subsidized</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Info className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Eligibility</h3>
              </div>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                {scheme.eligibility}
              </p>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-3">Key Benefits</h3>
              <div className="space-y-2">
                {scheme.benefits.map((benefit: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                    <p className="text-sm">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>

            <Button
              className="w-full"
              onClick={() => window.open(scheme.applyLink, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Apply Now / Learn More
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <>
      {/* Single Government Schemes Bubble - Right Side Middle */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40">
        <div
          className={cn(
            "relative group cursor-pointer transition-all duration-500",
            isHovered && "scale-110"
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Main Bubble */}
          <div className="relative">
            {/* Outer pulse rings */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 opacity-20 animate-ping"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 opacity-40 blur-xl"></div>
            
            {/* Main bubble container */}
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-2xl flex items-center justify-center animate-float hover:from-emerald-600 hover:to-teal-700 transition-all duration-300">
              <Shield className="h-10 w-10 text-white drop-shadow-lg" />
              
              {/* FREE Badge */}
              <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-bold rounded-full shadow-lg animate-bounce">
                FREE
              </div>
              
              {/* Scheme Count */}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center text-emerald-600 font-bold text-xs shadow-lg border-2 border-emerald-500">
                {govtSchemes.length}
              </div>
            </div>
          </div>

          {/* Hover Tooltip - Slides from Left */}
          <div className={cn(
            "absolute right-full mr-4 top-1/2 -translate-y-1/2",
            "bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700",
            "w-72 p-4",
            "transition-all duration-300 ease-out",
            isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"
          )}>
            <div className="flex items-center gap-2 mb-3 border-b pb-2">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Government Schemes</h3>
                <p className="text-xs text-muted-foreground">Exclusive Benefits</p>
              </div>
            </div>
            
            <div className="space-y-2">
              {govtSchemes.map((scheme) => {
                const SchemeIcon = scheme.icon;
                return (
                  <button
                    key={scheme.id}
                    onClick={() => setSelectedScheme(scheme.id)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-all duration-200 text-left group/item"
                  >
                    <div className={cn(
                      "p-2 rounded-full bg-gradient-to-br",
                      scheme.color,
                      "group-hover/item:scale-110 transition-transform"
                    )}>
                      <SchemeIcon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{scheme.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{scheme.tagline}</p>
                    </div>
                    <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover/item:opacity-100 transition-opacity" />
                  </button>
                );
              })}
            </div>
            
            <div className="mt-3 pt-3 border-t text-center">
              <p className="text-[10px] text-muted-foreground">Click any scheme to learn more</p>
            </div>
          </div>

          {/* Sparkle effects on hover */}
          {isHovered && (
            <>
              <Sparkles className="absolute -top-2 -left-2 h-4 w-4 text-yellow-400 animate-pulse" />
              <Sparkles className="absolute -bottom-2 right-0 h-3 w-3 text-emerald-400 animate-pulse" style={{ animationDelay: '0.1s' }} />
              <Sparkles className="absolute top-0 -right-3 h-3 w-3 text-teal-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
            </>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedScheme && govtSchemes.find(s => s.id === selectedScheme) && (
        renderDetailCard(govtSchemes.find(s => s.id === selectedScheme)!)
      )}

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default GovtSchemesBubble;
