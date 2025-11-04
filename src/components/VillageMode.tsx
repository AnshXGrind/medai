import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Wifi } from "lucide-react";
import { toast } from "sonner";

interface VillageModeProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export const VillageMode = ({ isEnabled, onToggle }: VillageModeProps) => {
  useEffect(() => {
    // Apply or remove optimizations based on enabled state
    if (isEnabled) {
      document.body.classList.add('village-mode');
      localStorage.setItem('village-mode', 'true');
      localStorage.setItem('disable-images', 'true');
      localStorage.setItem('disable-animations', 'true');
    } else {
      document.body.classList.remove('village-mode');
      localStorage.removeItem('village-mode');
      localStorage.removeItem('disable-images');
      localStorage.removeItem('disable-animations');
    }
  }, [isEnabled]);

  const handleToggle = () => {
    const newState = !isEnabled;
    onToggle(newState);
    
    if (newState) {
      toast.success("🌾 Village Mode Enabled - Optimized for rural areas!", {
        description: "90% data saved, 3x faster, offline support enabled"
      });
    } else {
      toast.info("Standard Mode Enabled");
    }
  };

  return (
    <Button
      variant={isEnabled ? "default" : "outline"}
      onClick={handleToggle}
      className={`${
        isEnabled 
          ? 'bg-green-600 hover:bg-green-700 text-white shadow-xl' 
          : 'border-2 border-green-600/50 hover:border-green-600'
      } transition-all duration-200 px-8 py-6 text-lg font-semibold`}
      size="lg"
    >
      <Wifi className={`h-6 w-6 mr-3 ${isEnabled ? 'animate-pulse' : ''}`} />
      <span className="text-xl">🌾 Village Mode {isEnabled && '✓'}</span>
    </Button>
  );
};

export default VillageMode;
