import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Languages, Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { languages, Language } from "@/lib/translations";
import { toast } from "sonner";

export const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setOpen(false);
    toast.success(`✓ Language changed to ${languages[lang]}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Languages className="h-4 w-4" />
          <span className="hidden sm:inline">{languages[language]}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Select Language / भाषा चुनें
          </DialogTitle>
          <DialogDescription>
            Choose your preferred language for the interface
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 py-4">
          {(Object.keys(languages) as Language[]).map((lang) => (
            <Button
              key={lang}
              variant={language === lang ? "default" : "outline"}
              className="h-auto py-4 flex flex-col items-center gap-2 relative"
              onClick={() => handleLanguageChange(lang)}
            >
              {language === lang && (
                <Check className="h-4 w-4 absolute top-2 right-2" />
              )}
              <span className="text-lg font-semibold">{languages[lang]}</span>
              <span className="text-xs opacity-70">
                {lang === 'en' && 'English'}
                {lang === 'hi' && 'हिंदी'}
                {lang === 'te' && 'తెలుగు'}
                {lang === 'kn' && 'ಕನ್ನಡ'}
                {lang === 'ml' && 'മലയാളം'}
                {lang === 'ta' && 'தமிழ்'}
                {lang === 'gu' && 'ગુજરાતી'}
                {lang === 'pa' && 'ਪੰਜਾਬੀ'}
              </span>
            </Button>
          ))}
        </div>
        <div className="text-xs text-muted-foreground text-center">
          💡 Tip: The AI chatbot can help you in your preferred language
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LanguageSelector;
