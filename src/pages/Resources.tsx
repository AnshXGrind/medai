import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, HelpCircle } from "lucide-react";

const Resources = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-5xl font-bold mb-6">Resources & FAQs</h1>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about MedAid
            </p>
          </div>

          <div className="space-y-8">
            <Card className="shadow-lg border-0 gradient-card animate-slide-up">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <HelpCircle className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 gradient-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary/10 rounded-lg">
                    <BookOpen className="h-6 w-6 text-secondary" />
                  </div>
                  <CardTitle>Health Tips</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {healthTips.map((tip, index) => (
                    <div key={index} className="p-4 bg-muted/50 rounded-lg border border-border">
                      <h3 className="font-semibold mb-2">{tip.title}</h3>
                      <p className="text-sm text-muted-foreground">{tip.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

const faqs = [
  {
    question: "What is MedAid?",
    answer: "MedAid is an AI-powered healthcare platform that provides symptom analysis, doctor consultations, and hospital location services in multiple Indian languages including English, Hindi, and Telugu."
  },
  {
    question: "Is the AI symptom analysis accurate?",
    answer: "Our AI uses advanced models trained on medical databases. While highly accurate, it's designed to complement, not replace, professional medical advice. Always consult a doctor for serious conditions."
  },
  {
    question: "Which languages are supported?",
    answer: "MedAid currently supports English, Hindi, and Telugu with both text and voice input capabilities."
  },
  {
    question: "How do doctor consultations work?",
    answer: "After analyzing your symptoms, you can book a video consultation with verified doctors. Consultations are conducted securely through our platform."
  },
  {
    question: "Is my health data secure?",
    answer: "Yes! We use industry-standard encryption and security measures to protect your personal health information. Your data is never shared without your consent."
  },
  {
    question: "Can I download my health reports?",
    answer: "Absolutely! All consultations and AI analyses can be downloaded as PDF reports for your records."
  }
];

const healthTips = [
  {
    title: "Stay Hydrated",
    description: "Drink at least 8 glasses of water daily to maintain good health and body function."
  },
  {
    title: "Regular Exercise",
    description: "Aim for at least 30 minutes of physical activity daily to boost immunity and overall health."
  },
  {
    title: "Balanced Diet",
    description: "Include fruits, vegetables, proteins, and whole grains in your daily meals for optimal nutrition."
  },
  {
    title: "Quality Sleep",
    description: "Get 7-8 hours of quality sleep each night to support mental and physical health."
  },
  {
    title: "Regular Checkups",
    description: "Schedule annual health checkups to catch potential issues early and maintain preventive care."
  }
];

export default Resources;
