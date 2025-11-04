import { Link } from "react-router-dom";
import { Activity, Mail, Facebook, Twitter, Linkedin, Instagram, Stethoscope, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary rounded-lg">
                <Activity className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                MedAid
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Empowering Every Voice with AI Healthcare
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <a href="mailto:team.medaid@gmail.com" className="hover:text-primary transition-smooth">
                team.medaid@gmail.com
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-smooth">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-smooth">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-sm text-muted-foreground hover:text-primary transition-smooth">
                  Resources
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-smooth">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/offers" className="text-sm text-muted-foreground hover:text-primary transition-smooth">
                  Health Offers
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Access */}
          <div>
            <h3 className="font-semibold mb-4">Quick Access</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/auth">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <User className="h-4 w-4 mr-2" />
                    Patient Login
                  </Button>
                </Link>
              </li>
              <li>
                <Link to="/auth">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Stethoscope className="h-4 w-4 mr-2" />
                    Doctor Login
                  </Button>
                </Link>
              </li>
              <li>
                <Link to="/health-id-login" className="text-sm text-muted-foreground hover:text-primary transition-smooth flex items-center">
                  <Activity className="h-3 w-3 mr-2" />
                  Health ID Access
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li className="text-sm text-muted-foreground">AI Symptom Analysis</li>
              <li className="text-sm text-muted-foreground">Doctor Consultation</li>
              <li className="text-sm text-muted-foreground">Hospital Locator</li>
              <li className="text-sm text-muted-foreground">Health Records</li>
              <li className="text-sm text-muted-foreground">Universal Health ID</li>
            </ul>
          </div>

          {/* Legal & Social */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 mb-4">
              <li className="text-sm text-muted-foreground hover:text-primary cursor-pointer transition-smooth">
                Privacy Policy
              </li>
              <li className="text-sm text-muted-foreground hover:text-primary cursor-pointer transition-smooth">
                Terms of Service
              </li>
            </ul>
            <div className="flex gap-3">
              <a href="#" className="p-2 bg-muted hover:bg-primary hover:text-primary-foreground rounded-lg transition-smooth">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 bg-muted hover:bg-primary hover:text-primary-foreground rounded-lg transition-smooth">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 bg-muted hover:bg-primary hover:text-primary-foreground rounded-lg transition-smooth">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 bg-muted hover:bg-primary hover:text-primary-foreground rounded-lg transition-smooth">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} MedAid. All rights reserved. Built with ❤️ for India's Healthcare.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
