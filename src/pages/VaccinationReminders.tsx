import VaccinationReminder from '@/components/VaccinationReminder';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function VaccinationReminders() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <VaccinationReminder />
      </main>
      <Footer />
    </div>
  );
}
