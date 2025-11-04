import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HealthNews from "@/components/HealthNews";
import GovtSchemes from "@/components/GovtSchemes";
import SOSButton from "@/components/SOSButton";
import VillageMode from "@/components/VillageMode";
import GovtSchemesBubble from "@/components/GovtSchemesBubble";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Stethoscope, 
  Brain, 
  MapPin, 
  FileText, 
  Video, 
  Globe,
  Shield,
  Zap,
  Users,
  ArrowRight,
  HeartPulse,
  Calendar
} from "lucide-react";

const Index = () => {
  const { t } = useLanguage();
  const [villageModeEnabled, setVillageModeEnabled] = useState(false);
  
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* SOS Emergency Button */}
      <SOSButton />
      
      {/* Government Schemes Floating Bubble */}
      <GovtSchemesBubble />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 border border-secondary/20 rounded-full mb-6">
              <Zap className="h-4 w-4 text-secondary" />
              <span className="text-sm font-medium text-secondary">AI-Powered Healthcare Platform</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                MedAid
              </span>
              <br />
              <span className="text-foreground">Empowering Every Voice</span>
              <br />
              <span className="text-foreground">with AI Healthcare</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Bridge India's healthcare gap with AI-driven symptom analysis, multilingual support, 
              and instant doctor consultations. Healthcare for all, in your language.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-glow transition-smooth text-lg px-8 group">
                  <span>Get Started Free</span>
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline" className="text-lg px-8 transition-smooth">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          {/* Village Mode Button */}
          <div className="flex justify-center mb-16 animate-fade-in">
            <div className="text-center space-y-4">
              <VillageMode 
                isEnabled={villageModeEnabled}
                onToggle={setVillageModeEnabled}
              />
              <p className="text-sm text-muted-foreground">
                Optimized for low bandwidth • 90% data saved • Works offline
              </p>
            </div>
          </div>

          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl font-bold mb-4">Comprehensive Healthcare Solutions</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From AI diagnosis to video consultations, everything you need in one platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="gradient-card border-0 shadow-md hover:shadow-lg transition-smooth animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="p-3 bg-primary/10 rounded-xl w-fit mb-4">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="animate-fade-in" data-animation-delay={index}>
                <div className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-lg text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Healthcare News Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-slide-up">
            <h2 className="text-4xl font-bold mb-4">Latest Healthcare News</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Stay informed with the latest prevention tips, health alerts, and medical breakthroughs
            </p>
          </div>
          <div className="max-w-5xl mx-auto">
            <HealthNews limit={4} showHeader={false} />
          </div>
        </div>
      </section>

      {/* Government Schemes Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-slide-up">
            <h2 className="text-4xl font-bold mb-4">Government Health Schemes</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Access government healthcare benefits and insurance schemes - Apply directly
            </p>
          </div>
          <div className="max-w-6xl mx-auto">
            <GovtSchemes limit={3} />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-primary opacity-90"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-primary-foreground">
            <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Healthcare Experience?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of users who trust MedAid for their healthcare needs
            </p>
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="text-lg px-8 shadow-lg hover:shadow-xl transition-smooth">
                Start Your Free Journey
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const features = [
  {
    icon: Brain,
    title: "AI Symptom Analysis",
    description: "Get instant AI-powered symptom analysis with text support in multiple languages."
  },
  {
    icon: Video,
    title: "Doctor Consultation",
    description: "Connect with verified doctors through secure video consultations from anywhere."
  },
  {
    icon: HeartPulse,
    title: "ASHA Worker Dashboard",
    description: "Unique resource allocation system for ASHA workers to request medicines, ambulance, and doctor visits with government tracking IDs."
  },
  {
    icon: Calendar,
    title: "Vaccination & Health Reminders",
    description: "Never miss important vaccines or checkups with AI-powered reminders integrated with local healthcare databases."
  },
  {
    icon: MapPin,
    title: "Hospital Locator",
    description: "Find nearby hospitals, clinics, and pharmacies with real-time availability information."
  },
  {
    icon: FileText,
    title: "Health Records",
    description: "Store and access your medical history with downloadable PDF reports anytime."
  },
  {
    icon: Globe,
    title: "Multilingual Support",
    description: "Access healthcare in English, Hindi, and Telugu with one-click translation."
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your health data is encrypted and protected with industry-standard security."
  },
  {
    icon: Zap,
    title: "Village Mode",
    description: "Optimized for low-bandwidth rural areas - 90% data savings, works offline, and 3x faster loading."
  }
];

const stats = [
  { value: "400M+", label: "Potential Users Reached" },
  { value: "24/7", label: "Healthcare Availability" },
  { value: "3", label: "Languages Supported" }
];

export default Index;
