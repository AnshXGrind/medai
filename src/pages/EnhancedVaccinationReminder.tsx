import { useState, useEffect } from 'react';
import { Calendar, Bell, Plus, Check, Clock, AlertCircle, Syringe, Heart, Activity, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface Vaccination {
  id: string;
  name: string;
  dueDate: Date;
  status: 'upcoming' | 'due' | 'overdue' | 'completed';
  category: 'child' | 'adult' | 'elderly' | 'pregnant';
  description: string;
  ageGroup?: string;
  reminderDays: number;
  relatedDiseases?: string[];
}

interface DiseaseHistory {
  disease: string;
  diagnosedDate: string;
  status: 'active' | 'recovered';
  vaccinesNeeded: string[];
}

interface InsuranceScheme {
  id: string;
  name: string;
  description: string;
  coverage: string;
  eligibility: string;
  benefits: string[];
  applyLink: string;
}

export default function EnhancedVaccinationReminder() {
  const [activeTab, setActiveTab] = useState<'vaccinations' | 'diseases' | 'insurance'>('vaccinations');
  const [healthId, setHealthId] = useState("");
  const [healthIdLinked, setHealthIdLinked] = useState(false);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [diseaseHistory, setDiseaseHistory] = useState<DiseaseHistory[]>([]);
  const [recommendedVaccines, setRecommendedVaccines] = useState<Vaccination[]>([]);

  const insuranceSchemes: InsuranceScheme[] = [
    {
      id: '1',
      name: 'Ayushman Bharat (PM-JAY)',
      description: 'Pradhan Mantri Jan Arogya Yojana - World\'s largest health insurance scheme',
      coverage: '₹5 lakh per family per year',
      eligibility: 'Bottom 40% poorest families based on SECC 2011 data',
      benefits: [
        'Cashless hospitalization at empaneled hospitals',
        'Coverage for secondary and tertiary care',
        '1,393 procedures covered',
        'Pre and post-hospitalization expenses',
        'No premium payment required'
      ],
      applyLink: 'https://pmjay.gov.in/'
    },
    {
      id: '2',
      name: 'Employees State Insurance (ESI)',
      description: 'Health insurance for organized sector workers',
      coverage: '₹10,000-₹25,000 (varies by salary)',
      eligibility: 'Employees earning up to ₹21,000 per month',
      benefits: [
        'Medical care for self and family',
        'Sickness benefit at 70% of wages',
        'Maternity benefit for 26 weeks',
        'Disablement benefit',
        'Dependents benefit'
      ],
      applyLink: 'https://www.esic.nic.in/'
    },
    {
      id: '3',
      name: 'Central Government Health Scheme (CGHS)',
      description: 'Comprehensive health care facilities for Central Government employees',
      coverage: 'Comprehensive coverage with nominal contribution',
      eligibility: 'Central Government employees, pensioners, and their families',
      benefits: [
        'Treatment at CGHS dispensaries',
        'Emergency care at empaneled hospitals',
        'Cashless facility',
        'Medicines at CGHS rates',
        'Home visit services'
      ],
      applyLink: 'https://cghs.gov.in/'
    },
    {
      id: '4',
      name: 'Rashtriya Swasthya Bima Yojana (RSBY)',
      description: 'Health insurance for BPL families',
      coverage: '₹30,000 per family per year',
      eligibility: 'Below Poverty Line (BPL) families',
      benefits: [
        'Hospitalization coverage',
        'Smart card based cashless facility',
        'Coverage for pre-existing diseases',
        'Maternity coverage',
        'Transport allowance'
      ],
      applyLink: 'https://labour.gov.in/'
    },
    {
      id: '5',
      name: 'Aam Aadmi Bima Yojana (AABY)',
      description: 'Life and disability insurance for rural landless households',
      coverage: '₹30,000 natural death, ₹75,000 accidental death',
      eligibility: 'Rural landless households aged 18-59 years',
      benefits: [
        'Natural death coverage',
        'Accidental death coverage',
        'Permanent disability coverage',
        'Partial permanent disability coverage',
        'Scholarship for children'
      ],
      applyLink: 'https://www.india.gov.in/'
    },
    {
      id: '6',
      name: 'Universal Health Insurance Scheme (UHIS)',
      description: 'Affordable health insurance for low-income families',
      coverage: '₹1 lakh per family per year',
      eligibility: 'Families earning up to ₹1.5 lakh annually',
      benefits: [
        'Hospitalization expenses',
        'Day care procedures',
        'Pre and post hospitalization',
        'Ambulance charges',
        'Personal accident cover'
      ],
      applyLink: 'https://www.nic.in/'
    }
  ];

  // Default vaccinations
  const defaultVaccinations: Vaccination[] = [
    {
      id: '1',
      name: 'BCG Vaccine',
      dueDate: new Date(2025, 10, 15),
      status: 'upcoming',
      category: 'child',
      description: 'Tuberculosis protection',
      ageGroup: 'At birth',
      reminderDays: 7,
      relatedDiseases: ['Tuberculosis', 'TB']
    },
    {
      id: '2',
      name: 'Hepatitis B',
      dueDate: new Date(2025, 10, 10),
      status: 'due',
      category: 'child',
      description: 'Hepatitis B protection',
      ageGroup: '0-6 months',
      reminderDays: 7,
      relatedDiseases: ['Hepatitis B', 'Liver Disease']
    },
    {
      id: '3',
      name: 'DPT (Diphtheria, Pertussis, Tetanus)',
      dueDate: new Date(2025, 9, 28),
      status: 'overdue',
      category: 'child',
      description: 'Triple antigen vaccine',
      ageGroup: '6 weeks - 6 months',
      reminderDays: 7,
      relatedDiseases: ['Diphtheria', 'Whooping Cough', 'Tetanus']
    },
    {
      id: '4',
      name: 'COVID-19 Booster',
      dueDate: new Date(2025, 11, 1),
      status: 'upcoming',
      category: 'adult',
      description: 'COVID-19 booster dose',
      ageGroup: 'Adults 18+',
      reminderDays: 14,
      relatedDiseases: ['COVID-19', 'Coronavirus', 'Respiratory Infection']
    },
    {
      id: '5',
      name: 'Influenza (Flu) Vaccine',
      dueDate: new Date(2025, 11, 15),
      status: 'upcoming',
      category: 'elderly',
      description: 'Annual flu shot',
      ageGroup: '60+ years',
      reminderDays: 14,
      relatedDiseases: ['Influenza', 'Flu', 'Pneumonia']
    },
    {
      id: '6',
      name: 'Pneumococcal Vaccine',
      dueDate: new Date(2025, 10, 25),
      status: 'upcoming',
      category: 'elderly',
      description: 'Pneumonia prevention',
      ageGroup: '65+ years',
      reminderDays: 7,
      relatedDiseases: ['Pneumonia', 'Respiratory Infection']
    },
    {
      id: '7',
      name: 'Typhoid Vaccine',
      dueDate: new Date(2025, 11, 10),
      status: 'upcoming',
      category: 'adult',
      description: 'Typhoid fever prevention',
      ageGroup: 'All ages',
      reminderDays: 7,
      relatedDiseases: ['Typhoid', 'Typhoid Fever']
    },
    {
      id: '8',
      name: 'Rabies Vaccine',
      dueDate: new Date(2025, 11, 5),
      status: 'upcoming',
      category: 'adult',
      description: 'Post-exposure prophylaxis',
      ageGroup: 'As needed',
      reminderDays: 3,
      relatedDiseases: ['Rabies', 'Animal Bite']
    },
    {
      id: '9',
      name: 'Tetanus Toxoid (TT)',
      dueDate: new Date(2025, 10, 20),
      status: 'upcoming',
      category: 'pregnant',
      description: 'Maternal and neonatal tetanus prevention',
      ageGroup: 'Pregnant women',
      reminderDays: 7,
      relatedDiseases: ['Tetanus', 'Neonatal Tetanus']
    }
  ];

  // Link Health ID and fetch disease history
  const linkHealthId = async () => {
    if (!healthId || healthId.length < 10) {
      toast.error("Please enter a valid Health ID");
      return;
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock disease history from Health ID
    const mockDiseaseHistory: DiseaseHistory[] = [
      {
        disease: 'Diabetes Type 2',
        diagnosedDate: '2023-05-15',
        status: 'active',
        vaccinesNeeded: ['Influenza (Flu) Vaccine', 'Pneumococcal Vaccine', 'Hepatitis B']
      },
      {
        disease: 'Hypertension',
        diagnosedDate: '2022-08-20',
        status: 'active',
        vaccinesNeeded: ['Influenza (Flu) Vaccine', 'COVID-19 Booster']
      },
      {
        disease: 'Tuberculosis',
        diagnosedDate: '2020-03-10',
        status: 'recovered',
        vaccinesNeeded: ['BCG Vaccine', 'Pneumococcal Vaccine']
      },
      {
        disease: 'Pneumonia',
        diagnosedDate: '2021-12-05',
        status: 'recovered',
        vaccinesNeeded: ['Pneumococcal Vaccine', 'Influenza (Flu) Vaccine']
      }
    ];

    setDiseaseHistory(mockDiseaseHistory);
    setHealthIdLinked(true);

    // Generate recommended vaccines based on disease history
    const recommendations: Vaccination[] = [];
    mockDiseaseHistory.forEach(disease => {
      disease.vaccinesNeeded.forEach(vaccineName => {
        const existingVaccine = defaultVaccinations.find(v => v.name === vaccineName);
        if (existingVaccine && !recommendations.find(r => r.id === existingVaccine.id)) {
          recommendations.push({
            ...existingVaccine,
            status: 'due',
            description: `${existingVaccine.description} (Recommended for ${disease.disease})`
          });
        }
      });
    });

    setRecommendedVaccines(recommendations);
    setVaccinations(defaultVaccinations);

    toast.success(`Health ID linked successfully! Found ${mockDiseaseHistory.length} conditions in your medical history.`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'upcoming':
        return 'bg-blue-500';
      case 'due':
        return 'bg-orange-500';
      case 'overdue':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const markAsCompleted = (vaccineId: string) => {
    setVaccinations(prev =>
      prev.map(v => v.id === vaccineId ? { ...v, status: 'completed' as const } : v)
    );
    setRecommendedVaccines(prev =>
      prev.map(v => v.id === vaccineId ? { ...v, status: 'completed' as const } : v)
    );
    toast.success("Vaccination marked as completed");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-6xl mx-auto py-8 space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-blue-600 rounded-full">
              <Syringe className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Vaccination & Health Management</h1>
          <p className="text-muted-foreground">
            Personalized vaccination reminders based on your health history
          </p>
        </div>

        {/* Health ID Link Section */}
        {!healthIdLinked && (
          <Card className="shadow-lg border-2 border-blue-200">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-blue-600" />
                Link Your Health ID
              </CardTitle>
              <CardDescription>
                Enter your Health ID to get personalized vaccination recommendations based on your medical history
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="healthId">Health ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="healthId"
                    placeholder="Enter your MedAid Health ID"
                    value={healthId}
                    onChange={(e) => setHealthId(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={linkHealthId}>
                    Link Health ID
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Don't have a Health ID? <a href="/create-health-id" className="text-blue-600 hover:underline">Create one here</a>
                </p>
              </div>

              <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950">
                <Shield className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-xs">
                  Linking your Health ID allows us to analyze your disease history and recommend appropriate vaccinations.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {healthIdLinked && (
          <>
            {/* Tabs */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex rounded-lg border bg-muted p-1">
                <Button
                  variant={activeTab === 'vaccinations' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('vaccinations')}
                  className="gap-2"
                >
                  <Syringe className="h-4 w-4" />
                  Vaccinations
                </Button>
                <Button
                  variant={activeTab === 'diseases' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('diseases')}
                  className="gap-2"
                >
                  <Activity className="h-4 w-4" />
                  Disease History
                </Button>
                <Button
                  variant={activeTab === 'insurance' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('insurance')}
                  className="gap-2"
                >
                  <Shield className="h-4 w-4" />
                  Insurance Schemes
                </Button>
              </div>
            </div>

            {/* Vaccinations Tab */}
            {activeTab === 'vaccinations' && (
              <div className="space-y-6">
                {/* Recommended Vaccines */}
                {recommendedVaccines.length > 0 && (
                  <Card className="shadow-lg border-2 border-orange-200">
                    <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
                      <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-orange-600" />
                        Recommended for You
                      </CardTitle>
                      <CardDescription>
                        Based on your disease history, we recommend these vaccinations
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recommendedVaccines.map(vaccine => (
                          <Card key={vaccine.id} className="border-2 border-orange-100">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-lg">{vaccine.name}</h3>
                                  <p className="text-xs text-muted-foreground">{vaccine.description}</p>
                                </div>
                                <Badge className={getStatusColor(vaccine.status)}>
                                  {vaccine.status}
                                </Badge>
                              </div>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Calendar className="h-4 w-4" />
                                  Due: {vaccine.dueDate.toLocaleDateString('en-IN')}
                                </div>
                                {vaccine.relatedDiseases && (
                                  <div className="flex flex-wrap gap-1">
                                    {vaccine.relatedDiseases.map((disease, idx) => (
                                      <Badge key={idx} variant="outline" className="text-xs">
                                        {disease}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                              {vaccine.status !== 'completed' && (
                                <Button
                                  size="sm"
                                  className="w-full mt-3"
                                  onClick={() => markAsCompleted(vaccine.id)}
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Mark as Done
                                </Button>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* All Vaccinations */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Syringe className="h-5 w-5 text-blue-600" />
                      All Vaccinations Schedule
                    </CardTitle>
                    <CardDescription>
                      Complete vaccination schedule for all age groups
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {vaccinations.map(vaccine => (
                        <Card key={vaccine.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h3 className="font-semibold">{vaccine.name}</h3>
                                <p className="text-xs text-muted-foreground">{vaccine.description}</p>
                              </div>
                              <Badge className={getStatusColor(vaccine.status)}>
                                {vaccine.status}
                              </Badge>
                            </div>
                            <div className="space-y-1 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {vaccine.dueDate.toLocaleDateString('en-IN')}
                              </div>
                              <div>Category: {vaccine.category}</div>
                              {vaccine.ageGroup && <div>Age: {vaccine.ageGroup}</div>}
                            </div>
                            {vaccine.status !== 'completed' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full mt-2"
                                onClick={() => markAsCompleted(vaccine.id)}
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Done
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Disease History Tab */}
            {activeTab === 'diseases' && (
              <div className="space-y-6">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-red-600" />
                      Your Disease History
                    </CardTitle>
                    <CardDescription>
                      Medical conditions from your Health ID records
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {diseaseHistory.map((disease, index) => (
                        <Card key={index} className="border-2">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg">{disease.disease}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Diagnosed: {new Date(disease.diagnosedDate).toLocaleDateString('en-IN')}
                                </p>
                              </div>
                              <Badge className={disease.status === 'active' ? 'bg-orange-500' : 'bg-green-500'}>
                                {disease.status}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-sm font-semibold mb-2">Recommended Vaccines:</p>
                              <div className="flex flex-wrap gap-2">
                                {disease.vaccinesNeeded.map((vaccine, idx) => (
                                  <Badge key={idx} variant="outline">
                                    <Syringe className="h-3 w-3 mr-1" />
                                    {vaccine}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-sm">
                    <strong>Note:</strong> People with chronic conditions like diabetes and hypertension are at higher risk 
                    for infections. Regular vaccinations help prevent complications.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Insurance Tab */}
            {activeTab === 'insurance' && (
              <div className="space-y-6">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-green-600" />
                      Government Health Insurance Schemes
                    </CardTitle>
                    <CardDescription>
                      Available health insurance and wellness schemes in India
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {insuranceSchemes.map(scheme => (
                        <Card key={scheme.id} className="border-2 hover:shadow-lg transition-shadow">
                          <CardContent className="p-5 space-y-4">
                            <div>
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="font-bold text-lg">{scheme.name}</h3>
                                <Badge variant="secondary">Govt.</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{scheme.description}</p>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950 rounded">
                                <span className="text-sm font-semibold">Coverage</span>
                                <span className="text-sm text-green-600 dark:text-green-400 font-bold">
                                  {scheme.coverage}
                                </span>
                              </div>

                              <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded">
                                <p className="text-xs font-semibold mb-1">Eligibility:</p>
                                <p className="text-xs text-muted-foreground">{scheme.eligibility}</p>
                              </div>
                            </div>

                            <div>
                              <p className="text-xs font-semibold mb-2">Key Benefits:</p>
                              <ul className="space-y-1">
                                {scheme.benefits.slice(0, 3).map((benefit, idx) => (
                                  <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1">
                                    <Check className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span>{benefit}</span>
                                  </li>
                                ))}
                              </ul>
                              {scheme.benefits.length > 3 && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  +{scheme.benefits.length - 3} more benefits
                                </p>
                              )}
                            </div>

                            <Button className="w-full" asChild>
                              <a href={scheme.applyLink} target="_blank" rel="noopener noreferrer">
                                Learn More & Apply
                              </a>
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-sm">
                    <strong>Important:</strong> These schemes have different eligibility criteria. 
                    Visit the official websites or contact your nearest health center for detailed information and application process.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
