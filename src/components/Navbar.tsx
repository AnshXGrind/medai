import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Activity, LogOut, Gift } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import SettingsButton from "@/components/SettingsButton";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { t } = useLanguage();

  return (
    <nav className="fixed top-0 w-full bg-card/80 backdrop-blur-lg border-b border-border z-50 transition-smooth">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-primary rounded-lg group-hover:shadow-glow transition-smooth">
              <Activity className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              MedAid
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-foreground hover:text-primary transition-smooth">
              {t('home')}
            </Link>
            <Link to="/about" className="text-foreground hover:text-primary transition-smooth">
              {t('about')}
            </Link>
            <Link to="/resources" className="text-foreground hover:text-primary transition-smooth">
              Resources
            </Link>
            <Link to="/offers" className="flex items-center gap-1.5 text-foreground hover:text-primary transition-smooth">
              <Gift className="h-4 w-4" />
              Offers
            </Link>
            <Link to="/contact" className="text-foreground hover:text-primary transition-smooth">
              {t('contact')}
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <LanguageSelector />
            <SettingsButton />
            {user ? (
              <Button 
                onClick={signOut} 
                variant="outline" 
                className="transition-smooth"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {t('signOut')}
              </Button>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="outline" className="transition-smooth">
                    {t('signIn')}
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button className="bg-primary hover:bg-primary/90 shadow-md hover:shadow-glow transition-smooth">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageSelector />
            <SettingsButton />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-foreground hover:text-primary transition-smooth"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 animate-fade-in">
            <div className="flex flex-col gap-3">
              <Link
                to="/"
                className="px-3 py-2 text-foreground hover:text-primary hover:bg-muted rounded-lg transition-smooth"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('home')}
              </Link>
              <Link
                to="/about"
                className="px-3 py-2 text-foreground hover:text-primary hover:bg-muted rounded-lg transition-smooth"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('about')}
              </Link>
              <Link
                to="/resources"
                className="px-3 py-2 text-foreground hover:text-primary hover:bg-muted rounded-lg transition-smooth"
                onClick={() => setIsMenuOpen(false)}
              >
                Resources
              </Link>
              <Link
                to="/offers"
                className="px-3 py-2 text-foreground hover:text-primary hover:bg-muted rounded-lg transition-smooth flex items-center gap-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Gift className="h-4 w-4" />
                Offers
              </Link>
              <Link
                to="/contact"
                className="px-3 py-2 text-foreground hover:text-primary hover:bg-muted rounded-lg transition-smooth"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('contact')}
              </Link>
              <div className="flex flex-col gap-2 pt-2 border-t border-border">
                {user ? (
                  <Button 
                    onClick={signOut} 
                    variant="outline" 
                    className="w-full"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('signOut')}
                  </Button>
                ) : (
                  <>
                    <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="w-full">
                        {t('signIn')}
                      </Button>
                    </Link>
                    <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full bg-primary">Get Started</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
