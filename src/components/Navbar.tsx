import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Activity, LogOut, Gift } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import SettingsButton from "@/components/SettingsButton";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import { localDb } from '@/shared/services/local.db';
import { liveQuery } from 'dexie';
import { Link } from 'react-router-dom';

interface PendingHealthId {
  id?: string | number;
  health_id_number?: string;
  full_name?: string;
}

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [showPending, setShowPending] = useState<boolean>(false);
  const [pendingItems, setPendingItems] = useState<PendingHealthId[]>([]);

  useEffect(() => {
    // Use Dexie's liveQuery to get live updates of pending items
    const obs = liveQuery(() => localDb.health_ids.where('pending_verification').equals(true).toArray());
    const sub = obs.subscribe({
      next: (items: PendingHealthId[]) => {
        setPendingItems(items || []);
        setPendingCount((items || []).length);
      },
      error: (err) => console.warn('liveQuery error', err),
    });

    const onOnline = () => {
      // refresh snapshot when connection returns
      localDb.health_ids.where('pending_verification').equals(true).toArray().then(items => {
        setPendingItems(items || []);
        setPendingCount((items || []).length);
      }).catch(e => console.warn('Failed to refresh pending on online', e));
    };

    window.addEventListener('online', onOnline);

    return () => {
      try { sub.unsubscribe(); } catch (e) { console.warn('failed unsubscribe', e); }
      window.removeEventListener('online', onOnline);
    };
  }, []);

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
            <div className="relative flex items-center">
              <SettingsButton />
              {pendingCount > 0 && (
                <button
                  onClick={() => setShowPending(!showPending)}
                  title={`${pendingCount} pending health IDs`}
                  className="absolute -top-1 -right-2 inline-flex items-center justify-center rounded-full bg-rose-600 text-white text-xs px-2 py-0.5"
                >
                  {pendingCount}
                </button>
              )}

              {showPending && (
                <div className="absolute right-0 mt-10 w-80 bg-popover border border-border rounded-lg shadow-lg p-3 z-50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold">Pending Health IDs</p>
                    <button className="text-sm text-muted-foreground" onClick={() => setShowPending(false)}>Close</button>
                  </div>
                  <div className="max-h-56 overflow-auto">
                    {pendingItems.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No pending items</p>
                    ) : (
                      pendingItems.slice(0,5).map((p) => (
                        <div key={`${p.id ?? p.health_id_number}`} className="flex items-center justify-between gap-2 py-2 border-b last:border-b-0">
                          <div className="flex-1">
                            <p className="font-mono text-sm">{p.health_id_number}</p>
                            <p className="text-xs text-muted-foreground">{p.full_name || 'Unknown'}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                try { await navigator.clipboard.writeText(p.health_id_number || ''); }
                                catch (e) { console.warn('Clipboard failed', e); }
                              }}
                              className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80"
                            >Copy</button>
                            <Link to="/create-health-id" className="text-xs px-2 py-1 rounded bg-primary text-white">Open</Link>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="mt-3 text-right">
                    <Link to="/create-health-id" onClick={() => setShowPending(false)} className="text-sm text-primary">Manage Health IDs</Link>
                  </div>
                </div>
              )}
            </div>
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
            <div className="relative">
              <SettingsButton />
              {pendingCount > 0 && (
                <button
                  onClick={() => setShowPending(!showPending)}
                  title={`${pendingCount} pending health IDs`}
                  className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-rose-600 text-white text-xs px-2 py-0.5"
                >
                  {pendingCount}
                </button>
              )}
            </div>
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
