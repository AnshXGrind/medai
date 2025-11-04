import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  ExternalLink,
  Heart,
  Shield,
  Users,
  Banknote,
  FileCheck,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

interface GovernmentScheme {
  id: string;
  name: string;
  shortName: string;
  description: string;
  benefits: string[];
  eligibility: string;
  category: string;
  applyUrl: string;
  detailsUrl: string;
  icon: React.ReactNode;
  isActive: boolean;
  deadline?: string;
}

const governmentSchemes: GovernmentScheme[] = [
  {
    id: "1",
    name: "Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana (AB-PMJAY)",
    shortName: "Ayushman Bharat",
    description: "World's largest health insurance scheme providing coverage of ₹5 lakh per family per year for secondary and tertiary care hospitalization.",
    benefits: [
      "Free treatment worth ₹5 lakhs per family annually",
      "Covers 50+ crore beneficiaries",
      "Cashless treatment at empaneled hospitals",
      "1,949 medical packages covered",
    ],
    eligibility: "Bottom 40% poor and vulnerable families",
    category: "Health Insurance",
    applyUrl: "https://pmjay.gov.in/",
    detailsUrl: "https://pmjay.gov.in/about/pmjay",
    icon: <Heart className="h-6 w-6" />,
    isActive: true,
  },
  {
    id: "2",
    name: "Ayushman Bharat Health Account (ABHA)",
    shortName: "ABHA",
    description: "Digital health ID for all Indians to store and access health records digitally across healthcare providers.",
    benefits: [
      "Unique health ID for lifetime",
      "Access medical records anytime, anywhere",
      "Link with hospitals and labs",
      "Secure and private data storage",
    ],
    eligibility: "All Indian citizens",
    category: "Digital Health",
    applyUrl: "https://abha.abdm.gov.in/",
    detailsUrl: "https://abdm.gov.in/abdm",
    icon: <FileCheck className="h-6 w-6" />,
    isActive: true,
  },
  {
    id: "3",
    name: "Pradhan Mantri Matru Vandana Yojana (PMMVY)",
    shortName: "Maternity Benefits",
    description: "Cash incentive of ₹5,000 to pregnant women and lactating mothers for the first living child.",
    benefits: [
      "₹5,000 direct cash transfer",
      "Compensation for wage loss",
      "Better nutrition for mother & child",
      "Three installment payments",
    ],
    eligibility: "Pregnant & lactating mothers (first child)",
    category: "Maternity",
    applyUrl: "https://pmmvy.wcd.gov.in/",
    detailsUrl: "https://www.india.gov.in/spotlight/pradhan-mantri-matru-vandana-yojana",
    icon: <Users className="h-6 w-6" />,
    isActive: true,
  },
  {
    id: "4",
    name: "Pradhan Mantri Suraksha Bima Yojana (PMSBY)",
    shortName: "Accident Insurance",
    description: "Accident insurance scheme offering coverage of ₹2 lakh at just ₹20 per year.",
    benefits: [
      "₹2 lakh coverage for accidental death",
      "₹1 lakh for partial disability",
      "Premium: Only ₹20/year",
      "Auto-renewal facility",
    ],
    eligibility: "Age 18-70 years with bank account",
    category: "Insurance",
    applyUrl: "https://www.jansuraksha.gov.in/",
    detailsUrl: "https://pmjay.gov.in/scheme/pmsby",
    icon: <Shield className="h-6 w-6" />,
    isActive: true,
  },
  {
    id: "5",
    name: "Rashtriya Swasthya Bima Yojana (RSBY)",
    shortName: "RSBY",
    description: "Health insurance for BPL families providing coverage up to ₹30,000 per family per year.",
    benefits: [
      "₹30,000 health coverage",
      "Smart card for cashless treatment",
      "Covers pre-existing conditions",
      "Maternity benefits included",
    ],
    eligibility: "BPL families",
    category: "Health Insurance",
    applyUrl: "https://labour.gov.in/rsby",
    detailsUrl: "https://www.india.gov.in/spotlight/rashtriya-swasthya-bima-yojana",
    icon: <Building2 className="h-6 w-6" />,
    isActive: true,
  },
  {
    id: "6",
    name: "Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP)",
    shortName: "Jan Aushadhi",
    description: "Provides quality medicines at affordable prices through dedicated Jan Aushadhi Kendras across India.",
    benefits: [
      "Medicines at 50-90% lower prices",
      "10,000+ Jan Aushadhi Kendras",
      "WHO-GMP certified medicines",
      "Over 1,500 medicines & 240 surgicals",
    ],
    eligibility: "All citizens",
    category: "Affordable Medicine",
    applyUrl: "https://janaushadhi.gov.in/",
    detailsUrl: "https://pharmaceuticals.gov.in/pmbjp",
    icon: <Banknote className="h-6 w-6" />,
    isActive: true,
  },
];

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    "Health Insurance": "bg-blue-500/10 text-blue-700 border-blue-500/20",
    "Digital Health": "bg-purple-500/10 text-purple-700 border-purple-500/20",
    Maternity: "bg-pink-500/10 text-pink-700 border-pink-500/20",
    Insurance: "bg-green-500/10 text-green-700 border-green-500/20",
    "Affordable Medicine": "bg-amber-500/10 text-amber-700 border-amber-500/20",
  };
  return colors[category] || "bg-gray-500/10 text-gray-700 border-gray-500/20";
};

interface GovtSchemesProps {
  limit?: number;
  compact?: boolean;
}

export const GovtSchemes = ({ limit, compact = false }: GovtSchemesProps) => {
  const displayedSchemes = limit ? governmentSchemes.slice(0, limit) : governmentSchemes;

  return (
    <Card className="shadow-md border-primary/10 overflow-hidden">
      <CardHeader className="pb-4 md:pb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg flex-shrink-0">
              <Building2 className="h-5 w-5 md:h-6 md:w-6 text-orange-600" />
            </div>
            <div>
              <CardTitle className="text-lg md:text-xl">Government Health Schemes</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Latest schemes - Direct access to apply
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 md:space-y-4 px-3 md:px-6">
        <div className="space-y-3 md:space-y-4">
          {displayedSchemes.map((scheme, index) => (
            <Card
              key={scheme.id}
              className="border-2 hover:border-primary/30 hover:shadow-lg transition-all animate-slide-up overflow-hidden"
            >
              <CardContent className="p-4 md:p-6">
                <div className="space-y-3 md:space-y-4">
                  {/* Header */}
                  <div className="flex items-start gap-3">
                    <div className={`p-2 md:p-3 rounded-lg flex-shrink-0 ${getCategoryColor(scheme.category).split(' ')[0]}`}>
                      <div className="text-current scale-90 md:scale-100">{scheme.icon}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-bold text-base md:text-lg">{scheme.shortName}</h3>
                        {scheme.isActive && (
                          <Badge className="bg-green-500 hover:bg-green-600 text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        )}
                      </div>
                      <Badge variant="outline" className={`${getCategoryColor(scheme.category)} text-xs mb-2`}>
                        {scheme.category}
                      </Badge>
                      <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 md:line-clamp-none">
                        {scheme.description}
                      </p>
                    </div>
                  </div>

                  {/* Benefits - Collapsible on mobile */}
                  {!compact && (
                    <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-lg p-3 md:p-4">
                      <h4 className="font-semibold text-xs md:text-sm mb-2 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
                        Key Benefits:
                      </h4>
                      <ul className="grid grid-cols-1 gap-2">
                        {scheme.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs md:text-sm">
                            <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="leading-tight">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Eligibility */}
                  <div className="flex items-start md:items-center gap-2 text-xs md:text-sm bg-blue-50 p-2 md:p-3 rounded-lg">
                    <Users className="h-3 w-3 md:h-4 md:w-4 text-blue-600 flex-shrink-0 mt-0.5 md:mt-0" />
                    <div className="flex flex-col md:flex-row md:items-center gap-1">
                      <span className="font-semibold">Eligibility:</span>
                      <span className="text-muted-foreground">{scheme.eligibility}</span>
                    </div>
                  </div>

                  {/* Action Buttons - Stacked on mobile */}
                  <div className="flex flex-col sm:flex-row gap-2 md:gap-3 pt-1 md:pt-2">
                    <Button
                      className="flex-1 touch-manipulation active:scale-95 text-sm md:text-base h-10 md:h-11"
                      onClick={() => window.open(scheme.applyUrl, "_blank")}
                    >
                      <span className="mr-2">Apply Now</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 touch-manipulation active:scale-95 text-sm md:text-base h-10 md:h-11"
                      onClick={() => window.open(scheme.detailsUrl, "_blank")}
                    >
                      <span className="mr-2">Details</span>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Help Section */}
        <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-start gap-2 md:gap-3">
              <Building2 className="h-4 w-4 md:h-5 md:w-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs md:text-sm">
                <p className="font-semibold text-orange-900 mb-1">Need Help?</p>
                <p className="text-orange-800 mb-2">
                  Visit your nearest CSC or call for assistance
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-8 touch-manipulation active:scale-95"
                    onClick={() => window.open("https://www.csc.gov.in/", "_blank")}
                  >
                    Find CSC
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-8 touch-manipulation active:scale-95"
                    onClick={() => window.open("tel:14555", "_blank")}
                  >
                    Call: 14555
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default GovtSchemes;
