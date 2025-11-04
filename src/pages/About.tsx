import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Heart, Globe, Zap } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-5xl font-bold mb-6">About MedAid</h1>
            <p className="text-xl text-muted-foreground">
              Bridging India's healthcare gap with AI-driven solutions
            </p>
          </div>

          <div className="space-y-12">
            <div className="animate-slide-up">
              <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                MedAid is dedicated to democratizing healthcare access across India, especially for the 400+ million rural smartphone users. 
                We combine cutting-edge AI technology with multilingual support to provide instant, accurate health guidance in English, 
                Hindi, and Telugu.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              {values.map((value, index) => (
                <Card key={index} className="gradient-card border-0 shadow-md hover:shadow-lg transition-smooth">
                  <CardContent className="p-6">
                    <div className="p-3 bg-primary/10 rounded-xl w-fit mb-4">
                      <value.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <h2 className="text-3xl font-bold mb-4">Our Impact</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                By leveraging AI and voice technology, we're making healthcare accessible to everyone, regardless of language barriers 
                or geographic location. Our platform reduces hospital overload through AI pre-diagnosis and promotes early detection 
                and preventive healthcare.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {impact.map((item, index) => (
                  <div key={index} className="text-center p-6 bg-muted/50 rounded-lg">
                    <div className="text-4xl font-bold text-primary mb-2">{item.value}</div>
                    <div className="text-sm text-muted-foreground">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="animate-slide-up" style={{ animationDelay: '0.6s' }}>
              <h2 className="text-3xl font-bold mb-4">Supporting Digital India</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                MedAid aligns with the Smart Bharat mission and Digital India initiative, using technology to bridge the urban-rural 
                healthcare divide. We're committed to making quality healthcare a fundamental right, not a privilege.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

const values = [
  {
    icon: Target,
    title: "Accessibility First",
    description: "Healthcare should be accessible to everyone, in their language, at their fingertips."
  },
  {
    icon: Heart,
    title: "Patient-Centric",
    description: "Every feature is designed with patient care and convenience as the top priority."
  },
  {
    icon: Globe,
    title: "Inclusive by Design",
    description: "Multilingual support ensures no one is left behind due to language barriers."
  },
  {
    icon: Zap,
    title: "Innovation Driven",
    description: "Leveraging AI and modern technology to provide instant, accurate health guidance."
  }
];

const impact = [
  { value: "400M+", label: "Potential Users" },
  { value: "24/7", label: "Availability" },
  { value: "3", label: "Languages" }
];

export default About;
