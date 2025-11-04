import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  BadgeIndianRupee, 
  CheckCircle2,
  XCircle,
  Info,
  ExternalLink,
  FileText,
  Users,
  Home
} from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SubsidyScheme {
  name: string;
  description: string;
  eligible: boolean;
  amount: string;
  category: string;
  applyUrl: string;
}

export const SubsidyEligibilityChecker = () => {
  const [annualIncome, setAnnualIncome] = useState("");
  const [category, setCategory] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [hasAadhaar, setHasAadhaar] = useState(true);
  const [checked, setChecked] = useState(false);

  const schemes: SubsidyScheme[] = [
    {
      name: "Ayushman Bharat (PM-JAY)",
      description: "Health insurance coverage up to ₹5 lakhs per family per year",
      eligible: parseInt(annualIncome) < 500000,
      amount: "₹5,00,000",
      category: "Health Insurance",
      applyUrl: "https://pmjay.gov.in"
    },
    {
      name: "Pradhan Mantri Jan Arogya Yojana",
      description: "Free treatment for serious illnesses at empanelled hospitals",
      eligible: parseInt(annualIncome) < 300000,
      amount: "Free Treatment",
      category: "Healthcare",
      applyUrl: "https://pmjay.gov.in"
    },
    {
      name: "Senior Citizen Health Scheme",
      description: "Healthcare subsidy for citizens above 60 years",
      eligible: ageGroup === "60+",
      amount: "₹2,00,000",
      category: "Senior Care",
      applyUrl: "https://mohfw.gov.in"
    },
    {
      name: "Maternity Benefit Scheme",
      description: "Financial assistance for pregnant and lactating mothers",
      eligible: category === "women" && parseInt(annualIncome) < 400000,
      amount: "₹6,000",
      category: "Maternity",
      applyUrl: "https://wcd.nic.in"
    },
    {
      name: "Jan Aushadhi Scheme",
      description: "Access to affordable generic medicines at discounted rates",
      eligible: true,
      amount: "Up to 90% discount",
      category: "Medicine",
      applyUrl: "https://janaushadhi.gov.in"
    }
  ];

  const handleCheckEligibility = () => {
    if (!annualIncome || !category || !ageGroup) {
      toast.error("Please fill all the required fields");
      return;
    }
    
    setChecked(true);
    toast.success("Eligibility checked successfully!");
  };

  const eligibleSchemes = schemes.filter(scheme => scheme.eligible);

  return (
    <Card className="shadow-md">
      <CardHeader className="p-4 md:p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
            <BadgeIndianRupee className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-base md:text-lg">Subsidy Eligibility Checker</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Check your eligibility for government health schemes
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 md:p-6 space-y-4">
        {!checked ? (
          <div className="space-y-4">
            {/* Income Input */}
            <div className="space-y-2">
              <Label htmlFor="income" className="text-sm flex items-center gap-1">
                <BadgeIndianRupee className="h-4 w-4" />
                Annual Family Income
              </Label>
              <Input
                id="income"
                type="number"
                placeholder="Enter annual income in rupees"
                value={annualIncome}
                onChange={(e) => setAnnualIncome(e.target.value)}
                className="text-sm"
              />
            </div>

            {/* Category Selection */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm flex items-center gap-1">
                <Users className="h-4 w-4" />
                Category
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="obc">OBC</SelectItem>
                  <SelectItem value="sc">SC</SelectItem>
                  <SelectItem value="st">ST</SelectItem>
                  <SelectItem value="women">Women</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Age Group Selection */}
            <div className="space-y-2">
              <Label htmlFor="age" className="text-sm flex items-center gap-1">
                <Users className="h-4 w-4" />
                Age Group
              </Label>
              <Select value={ageGroup} onValueChange={setAgeGroup}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Select age group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-18">0-18 years</SelectItem>
                  <SelectItem value="18-35">18-35 years</SelectItem>
                  <SelectItem value="35-60">35-60 years</SelectItem>
                  <SelectItem value="60+">60+ years (Senior Citizen)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Aadhaar Check */}
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <input
                type="checkbox"
                id="aadhaar"
                checked={hasAadhaar}
                onChange={(e) => setHasAadhaar(e.target.checked)}
                className="h-4 w-4 text-primary"
              />
              <Label htmlFor="aadhaar" className="text-sm text-blue-800 dark:text-blue-200 cursor-pointer">
                I have Aadhaar Card (Required for most schemes)
              </Label>
            </div>

            {/* Check Button */}
            <Button 
              onClick={handleCheckEligibility}
              className="w-full h-10"
              disabled={!hasAadhaar}
            >
              <FileText className="h-4 w-4 mr-2" />
              Check Eligibility
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Eligibility Summary
              </h3>
              <p className="text-xs text-muted-foreground mb-2">
                Based on your information, you are eligible for <span className="font-bold text-primary">{eligibleSchemes.length}</span> out of {schemes.length} schemes.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">
                  Income: ₹{parseInt(annualIncome).toLocaleString()}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Category: {category.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Age: {ageGroup}
                </Badge>
              </div>
            </div>

            {/* Eligible Schemes */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {schemes.map((scheme, index) => (
                <div 
                  key={index}
                  className={`p-3 border rounded-lg transition-smooth ${
                    scheme.eligible 
                      ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' 
                      : 'border-border bg-muted/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{scheme.name}</h4>
                        {scheme.eligible ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{scheme.description}</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          {scheme.category}
                        </Badge>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                          {scheme.amount}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {scheme.eligible && (
                    <Button 
                      size="sm" 
                      className="w-full h-8 mt-2 text-xs"
                      onClick={() => {
                        toast.success(`Opening application for ${scheme.name}...`);
                        window.open(scheme.applyUrl, '_blank');
                      }}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Apply Now
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Reset Button */}
            <Button 
              variant="outline"
              onClick={() => setChecked(false)}
              className="w-full h-9 text-xs"
            >
              Check Again
            </Button>

            {/* Info Banner */}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-800 dark:text-blue-200">
                  <p className="font-medium mb-1">📋 Required Documents</p>
                  <ul className="text-blue-700 dark:text-blue-300 list-disc list-inside space-y-1">
                    <li>Aadhaar Card</li>
                    <li>Income Certificate</li>
                    <li>Category Certificate (if applicable)</li>
                    <li>Bank Account Details</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubsidyEligibilityChecker;
