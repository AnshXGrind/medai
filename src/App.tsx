import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorProfile from "./pages/DoctorProfile";
import DoctorPatients from "./pages/DoctorPatients";
import Doctors from "./pages/Doctors";
import Hospitals from "./pages/Hospitals";
import HealthRecords from "./pages/HealthRecords";
import ConsultationRoom from "./pages/ConsultationRoom";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Resources from "./pages/Resources";
import NotFound from "./pages/NotFound";
import EmergencyHelp from "./pages/EmergencyHelp";
import VaccinationReminders from "./pages/VaccinationReminders";
import CreateHealthID from "./pages/CreateHealthID";
import EnhancedVaccinationReminder from "./pages/EnhancedVaccinationReminder";
import OffersPage from "./pages/OffersPage";
import HealthIDDemo from "./pages/HealthIDDemo";
import HealthIDProfileDemo from "./pages/HealthIDProfileDemo";
import HealthIDLogin from "./pages/HealthIDLogin";
// Note: HealthIDProfile temporarily disabled due to missing DB tables
// import HealthIDProfile from "./pages/HealthIDProfile";

// Optimized QueryClient configuration for better performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
      retry: 1, // Reduce retries for faster failure
      refetchOnWindowFocus: false, // Reduce unnecessary refetches
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <PWAInstallPrompt />
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/patient-dashboard" element={<PatientDashboard />} />
            <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
            <Route path="/doctor-profile" element={<DoctorProfile />} />
            <Route path="/doctor-patients" element={<DoctorPatients />} />
            <Route path="/consultation/:id" element={<ConsultationRoom />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/hospitals" element={<Hospitals />} />
            <Route path="/health-records" element={<HealthRecords />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/emergency" element={<EmergencyHelp />} />
            <Route path="/vaccination-reminders" element={<VaccinationReminders />} />
            <Route path="/create-health-id" element={<CreateHealthID />} />
            <Route path="/health-id-login" element={<HealthIDLogin />} />
            <Route path="/health-id/:healthId" element={<HealthIDProfileDemo />} />
            <Route path="/health-id-demo" element={<HealthIDDemo />} />
            <Route path="/health-id-demo-profile" element={<HealthIDProfileDemo />} />
            <Route path="/enhanced-vaccination" element={<EnhancedVaccinationReminder />} />
            <Route path="/offers" element={<OffersPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
