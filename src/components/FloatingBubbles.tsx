import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  Shield, 
  Heart, 
  Wallet, 
  Users, 
  Baby, 
  Home,
  Briefcase,
  Stethoscope,
  X,
  ExternalLink,
  Info,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface InsuranceScheme {
  id: string;
  name: string;
  icon: React.ElementType;
  type: "health" | "life" | "accident" | "maternity";
  provider: string;
  coverage: string;
  premium: string;
  color: string;
  benefits: string[];
  eligibility: string;
  applyLink: string;
}

interface GovtScheme {
  id: string;
  name: string;
  icon: React.ElementType;
  ministry: string;
  coverage: string;
  eligibility: string;
  color: string;
  benefits: string[];
  applyLink: string;
}

type Bubble = (InsuranceScheme & { category: 'insurance' }) | (GovtScheme & { category: 'govt' });

const FloatingBubbles = () => {
  const navigate = useNavigate();
  const [selectedBubble, setSelectedBubble] = useState<string | null>(null);
  const [hoveredBubble, setHoveredBubble] = useState<string | null>(null);

  const insuranceSchemes: InsuranceScheme[] = [
    {
      id: "ayushman",
      name: "Ayushman Bharat",
      icon: Shield,
      type: "health",
      provider: "Govt of India",
      coverage: "₹5 Lakh/year",
      premium: "FREE",
      color: "from-blue-500 to-cyan-500",
      benefits: [
        "Cashless treatment at 25,000+ hospitals",
        "Secondary & tertiary care coverage",
        "Pre & post hospitalization",
        "Covers 1,573 medical procedures"
      ],
      eligibility: "Low-income families (SECC database)",
      applyLink: "https://pmjay.gov.in/"
    },
    {
      id: "esi",
      name: "ESI Scheme",
      icon: Briefcase,
      type: "health",
      provider: "ESIC",
      coverage: "Full medical care",
      premium: "1.75% of wages",
      color: "from-green-500 to-emerald-500",
      benefits: [
        "Medical benefit for self & family",
        "Sickness benefit (cash)",
        "Maternity benefit",
        "Disability & dependents benefit"
      ],
      eligibility: "Employees earning ≤₹21,000/month",
      applyLink: "https://www.esic.in/"
    },
    {
      id: "cghs",
      name: "CGHS",
      icon: Stethoscope,
      type: "health",
      provider: "Central Govt",
      coverage: "Comprehensive healthcare",
      premium: "₹125-1000/month",
      color: "from-purple-500 to-pink-500",
      benefits: [
        "OPD & IPD treatment",
        "Diagnostic tests",
        "Medicine supply",
        "Specialized treatment"
      ],
      eligibility: "Central Govt employees & pensioners",
      applyLink: "https://cghs.gov.in/"
    },
    {
      id: "pmsby",
      name: "PM Suraksha Bima",
      icon: Shield,
      type: "accident",
      provider: "Govt of India",
      coverage: "₹2 Lakh",
      premium: "₹12/year",
      color: "from-orange-500 to-red-500",
      benefits: [
        "Accidental death cover",
        "Permanent disability cover",
        "Partial disability cover",
        "Auto-renewal facility"
      ],
      eligibility: "Age 18-70 with bank account",
      applyLink: "https://www.jansuraksha.gov.in/"
    },
    {
      id: "pmjjby",
      name: "PM Jeevan Jyoti",
      icon: Heart,
      type: "life",
      provider: "Govt of India",
      coverage: "₹2 Lakh",
      premium: "₹436/year",
      color: "from-rose-500 to-pink-500",
      benefits: [
        "Life insurance cover",
        "Death benefit to nominee",
        "Renewable term insurance",
        "Easy enrollment"
      ],
      eligibility: "Age 18-50 with bank account",
      applyLink: "https://www.jansuraksha.gov.in/"
    },
    {
      id: "rsby",
      name: "RSBY",
      icon: Users,
      type: "health",
      provider: "Ministry of Labour",
      coverage: "₹30,000/year",
      premium: "₹30/year",
      color: "from-indigo-500 to-blue-500",
      benefits: [
        "Cashless hospitalization",
        "Smart card based",
        "Covers entire family",
        "Pre-existing diseases covered"
      ],
      eligibility: "BPL families",
      applyLink: "https://labour.gov.in/"
    },
    {
      id: "jssy",
      name: "Janani Suraksha Yojana",
      icon: Baby,
      type: "maternity",
      provider: "Ministry of Health",
      coverage: "₹600-1400",
      premium: "FREE",
      color: "from-pink-500 to-rose-500",
      benefits: [
        "Cash assistance for delivery",
        "Free institutional delivery",
        "Post-delivery care",
        "Nutrition support"
      ],
      eligibility: "Pregnant women (BPL)",
      applyLink: "https://nhm.gov.in/jsy"
    },
    {
      id: "aam-aadmi",
      name: "Aam Aadmi Bima Yojana",
      icon: Home,
      type: "life",
      provider: "Govt of India",
      coverage: "₹75,000",
      premium: "₹200/year",
      color: "from-teal-500 to-green-500",
      benefits: [
        "Natural death cover",
        "Accidental death cover",
        "Disability benefit",
        "Scholarship for children"
      ],
      eligibility: "Rural landless households",
      applyLink: "https://socialsecurity.gov.in/"
    }
  ];

  const govtSchemes: GovtScheme[] = [
    {
      id: "ab-pmjay",
      name: "Ayushman Bharat PM-JAY",
      icon: Shield,
      ministry: "Ministry of Health",
      coverage: "₹5 Lakh/family/year",
      eligibility: "10.74 crore poor families",
      color: "from-blue-600 to-cyan-600",
      benefits: [
        "World's largest health insurance",
        "25,000+ empanelled hospitals",
        "Paperless & cashless treatment",
        "1,573 procedures covered"
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
      benefits: [
        "Standard health insurance",
        "Hospitalization expenses",
        "Pre & post hospitalization",
        "Day care procedures"
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
      benefits: [
        "Generic medicines at low cost",
        "10,000+ Jan Aushadhi Kendras",
        "Save up to 90% on medicines",
        "Quality assured by BPPI"
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
      benefits: [
        "Maternal & child health",
        "Communicable disease control",
        "Free diagnostics",
        "Strengthening health systems"
      ],
      applyLink: "https://nhm.gov.in/"
    }
  ];

  // Combine all for floating bubbles
  const allBubbles = [
    ...insuranceSchemes.map(s => ({ ...s, category: 'insurance' })),
    ...govtSchemes.map(s => ({ ...s, category: 'govt' }))
  ];

  const renderBubbleContent = (bubble: Bubble) => {
    const Icon = bubble.icon;
    
    return (
      <div
        className={cn(
          "relative group cursor-pointer transition-all duration-300",
          hoveredBubble === bubble.id && "scale-110 z-50"
        )}
        onMouseEnter={() => setHoveredBubble(bubble.id)}
        onMouseLeave={() => setHoveredBubble(null)}
        onClick={() => setSelectedBubble(bubble.id)}
      >
        <div className={cn(
          "w-24 h-24 rounded-full bg-gradient-to-br shadow-lg flex items-center justify-center",
          "hover:shadow-2xl transition-all duration-300 animate-float",
          bubble.color
        )}>
          <Icon className="h-10 w-10 text-white" />
        </div>
        
        {/* Tooltip on hover */}
        {hoveredBubble === bubble.id && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground rounded-lg shadow-xl whitespace-nowrap z-50 animate-fade-in">
            <p className="font-semibold text-sm">{bubble.name}</p>
            <p className="text-xs text-muted-foreground">
              {bubble.category === 'insurance' ? bubble.coverage : bubble.ministry}
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderDetailCard = (bubble: Bubble) => {
    const Icon = bubble.icon;
    const isInsurance = bubble.category === 'insurance';
    
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
        <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-3 rounded-full bg-gradient-to-br",
                  bubble.color
                )}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{bubble.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {isInsurance ? bubble.provider : bubble.ministry}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedBubble(null)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-secondary rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Coverage</p>
                <p className="text-lg font-bold">{bubble.coverage}</p>
              </div>
              {isInsurance && (
                <div className="p-4 bg-secondary rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Premium</p>
                  <p className="text-lg font-bold text-green-600">{bubble.premium}</p>
                </div>
              )}
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Info className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Eligibility</h3>
              </div>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                {bubble.eligibility}
              </p>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-3">Key Benefits</h3>
              <div className="space-y-2">
                {bubble.benefits.map((benefit: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                    <p className="text-sm">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                className="flex-1"
                onClick={() => window.open(bubble.applyLink, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Apply Now
              </Button>
              <Button 
                variant="outline"
                onClick={() => setSelectedBubble(null)}
              >
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <>
      {/* Floating Bubbles Container */}
      <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
        {/* Special Offers Bubble - Center Top */}
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 pointer-events-auto">
          <div 
            className="relative group cursor-pointer"
            onClick={() => navigate('/offers')}
            onMouseEnter={() => setHoveredBubble('offers')}
            onMouseLeave={() => setHoveredBubble(null)}
          >
            <div className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center shadow-2xl",
              "bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500",
              "transition-all duration-300 hover:scale-110 animate-float",
              "border-4 border-white/50 hover:border-white/80",
              "relative overflow-hidden"
            )}>
              {/* Pulse animation overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-rose-500 animate-pulse opacity-50" />
              
              {/* Icon */}
              <Sparkles className="h-10 w-10 text-white relative z-10 animate-pulse" />
              
              {/* Badge */}
              <Badge className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 shadow-lg animate-bounce">
                HOT
              </Badge>
            </div>
            
            {/* Hover tooltip */}
            {hoveredBubble === 'offers' && (
              <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-black/90 text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap shadow-xl animate-fade-in z-[60]">
                🎁 Exclusive Offers!
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black/90 rotate-45" />
              </div>
            )}
          </div>
        </div>

        {/* Top Left - Insurance Bubbles */}
        <div className="absolute top-24 left-4 space-y-4 pointer-events-auto">
          {insuranceSchemes.slice(0, 2).map((scheme, idx) => (
            <div 
              key={scheme.id}
              className="animate-float"
            >
              {renderBubbleContent({ ...scheme, category: 'insurance' })}
            </div>
          ))}
        </div>

        {/* Top Right - Govt Schemes */}
        <div className="absolute top-24 right-4 space-y-4 pointer-events-auto">
          {govtSchemes.slice(0, 2).map((scheme, idx) => (
            <div 
              key={scheme.id}
              className="animate-float"
            >
              {renderBubbleContent({ ...scheme, category: 'govt' })}
            </div>
          ))}
        </div>

        {/* Bottom Left - More Insurance */}
        <div className="absolute bottom-24 left-4 space-y-4 pointer-events-auto">
          {insuranceSchemes.slice(2, 4).map((scheme, idx) => (
            <div 
              key={scheme.id}
              className="animate-float"
            >
              {renderBubbleContent({ ...scheme, category: 'insurance' })}
            </div>
          ))}
        </div>

        {/* Bottom Right - More Schemes */}
        <div className="absolute bottom-24 right-4 space-y-4 pointer-events-auto">
          {govtSchemes.slice(2, 4).map((scheme, idx) => (
            <div 
              key={scheme.id}
              className="animate-float"
            >
              {renderBubbleContent({ ...scheme, category: 'govt' })}
            </div>
          ))}
        </div>

        {/* Middle bubbles for larger screens */}
        <div className="hidden xl:block">
          {/* Left Middle */}
          <div className="absolute top-1/2 left-4 transform -translate-y-1/2 space-y-4 pointer-events-auto">
            {insuranceSchemes.slice(4, 6).map((scheme, idx) => (
              <div 
                key={scheme.id}
                className="animate-float"
              >
                {renderBubbleContent({ ...scheme, category: 'insurance' })}
              </div>
            ))}
          </div>

          {/* Right Middle */}
          <div className="absolute top-1/2 right-4 transform -translate-y-1/2 space-y-4 pointer-events-auto">
            {insuranceSchemes.slice(6, 8).map((scheme, idx) => (
              <div 
                key={scheme.id}
                className="animate-float"
              >
                {renderBubbleContent({ ...scheme, category: 'insurance' })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedBubble && renderDetailCard(
        allBubbles.find(b => b.id === selectedBubble) as Bubble
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

export default FloatingBubbles;
