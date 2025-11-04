import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, 
  Video, 
  MapPin, 
  FileText, 
  Upload, 
  Heart, 
  Pill, 
  BadgeIndianRupee, 
  Shield, 
  Ambulance, 
  BarChart3,
  Calendar,
  Syringe,
  Activity,
  ChevronLeft,
  ChevronRight,
  Home,
  CreditCard,
  Stethoscope,
  Hospital,
  Newspaper,
  Gift,
  Map
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path?: string;
  badge?: string;
  color?: string;
}

const DashboardSidebar = ({ activeSection, onSectionChange }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const menuItems: MenuItem[] = [
    {
      id: "home",
      label: "Dashboard Home",
      icon: Home,
      path: "/patient-dashboard",
      color: "text-blue-600"
    },
    {
      id: "symptoms",
      label: "AI Symptom Analysis",
      icon: Brain,
      color: "text-purple-600"
    },
    {
      id: "doctors",
      label: "Find Doctors",
      icon: Stethoscope,
      path: "/doctors",
      color: "text-green-600"
    },
    {
      id: "hospitals",
      label: "Nearby Hospitals",
      icon: Hospital,
      color: "text-red-600"
    },
    {
      id: "appointments",
      label: "Appointments",
      icon: Calendar,
      badge: "New",
      color: "text-orange-600"
    },
    {
      id: "records",
      label: "Health Records",
      icon: FileText,
      path: "/health-records",
      color: "text-indigo-600"
    },
    {
      id: "prescriptions",
      label: "Upload Documents",
      icon: Upload,
      color: "text-teal-600"
    },
    {
      id: "vaccination",
      label: "Vaccination Tracker",
      icon: Syringe,
      path: "/enhanced-vaccination",
      color: "text-pink-600"
    },
    {
      id: "health-id",
      label: "Create Health ID",
      icon: CreditCard,
      path: "/create-health-id",
      color: "text-cyan-600"
    },
    {
      id: "emergency",
      label: "Emergency Services",
      icon: Ambulance,
      color: "text-red-700"
    },
    {
      id: "insights",
      label: "Health Insights",
      icon: BarChart3,
      color: "text-blue-700"
    },
    {
      id: "coach",
      label: "AI Health Coach",
      icon: Heart,
      color: "text-rose-600"
    },
    {
      id: "medicines",
      label: "Medicine Tracker",
      icon: Pill,
      color: "text-green-700"
    },
    {
      id: "subsidy",
      label: "Government Schemes",
      icon: BadgeIndianRupee,
      color: "text-amber-600"
    },
    {
      id: "news",
      label: "Health News",
      icon: Newspaper,
      color: "text-slate-600"
    },
    {
      id: "heatmap",
      label: "Disease Heatmap",
      icon: Map,
      color: "text-purple-700"
    },
  ];

  const handleMenuClick = (item: MenuItem) => {
    if (item.path) {
      navigate(item.path);
    } else if (onSectionChange) {
      onSectionChange(item.id);
    }
  };

  return (
    <div 
      className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-card border-r border-border transition-all duration-300 z-40",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Collapse Toggle */}
      <div className="absolute -right-3 top-6 z-50">
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6 rounded-full bg-background shadow-md"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>
      </div>

      {/* Sidebar Content */}
      <ScrollArea className="h-full py-4">
        <div className="space-y-1 px-2">
          {!collapsed && (
            <div className="px-3 py-2 mb-2">
              <h2 className="text-sm font-semibold text-muted-foreground">
                Quick Access
              </h2>
            </div>
          )}
          
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start relative group",
                  collapsed ? "px-2" : "px-3",
                  isActive && "bg-primary/10 hover:bg-primary/15"
                )}
                onClick={() => handleMenuClick(item)}
              >
                <Icon 
                  className={cn(
                    "h-4 w-4 flex-shrink-0",
                    collapsed ? "mx-auto" : "mr-3",
                    item.color
                  )} 
                />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left text-sm">
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
                
                {/* Tooltip for collapsed state */}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                    {item.label}
                    {item.badge && (
                      <span className="ml-2 bg-primary text-primary-foreground px-1 py-0.5 rounded text-xs">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </Button>
            );
          })}
        </div>

        {/* Bottom Actions */}
        {!collapsed && (
          <div className="px-4 py-4 mt-4 border-t border-border">
            <div className="text-xs text-muted-foreground space-y-2">
              <p className="flex items-center gap-2">
                <Shield className="h-3 w-3" />
                Privacy Protected
              </p>
              <p className="flex items-center gap-2">
                <Activity className="h-3 w-3" />
                Real-time Updates
              </p>
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default DashboardSidebar;
