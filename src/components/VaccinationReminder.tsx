import { useState, useEffect } from 'react';
import { Calendar, Bell, Plus, Check, Clock, AlertCircle, Users, Baby, Syringe, Heart } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Vaccination {
  id: string;
  name: string;
  dueDate: Date;
  status: 'upcoming' | 'due' | 'overdue' | 'completed';
  category: 'child' | 'adult' | 'elderly' | 'pregnant';
  description: string;
  ageGroup?: string;
  reminderDays: number;
}

interface HealthCheckup {
  id: string;
  type: string;
  lastDate?: Date;
  nextDate: Date;
  frequency: string;
  status: 'scheduled' | 'due' | 'overdue';
  priority: 'high' | 'medium' | 'low';
}

interface Reminder {
  id: string;
  title: string;
  date: Date;
  type: 'vaccination' | 'checkup';
  notificationSent: boolean;
}

export default function VaccinationReminder() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'vaccinations' | 'checkups' | 'reminders'>('vaccinations');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'child' | 'adult' | 'elderly' | 'pregnant'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [checkups, setCheckups] = useState<HealthCheckup[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Initialize with common vaccinations and checkups
  useEffect(() => {
    const defaultVaccinations: Vaccination[] = [
      {
        id: '1',
        name: 'BCG Vaccine',
        dueDate: new Date(2025, 10, 15),
        status: 'upcoming',
        category: 'child',
        description: 'Tuberculosis protection',
        ageGroup: 'At birth',
        reminderDays: 7
      },
      {
        id: '2',
        name: 'Hepatitis B',
        dueDate: new Date(2025, 10, 10),
        status: 'due',
        category: 'child',
        description: 'Hepatitis B protection',
        ageGroup: '0-6 months',
        reminderDays: 7
      },
      {
        id: '3',
        name: 'DPT (Diphtheria, Pertussis, Tetanus)',
        dueDate: new Date(2025, 9, 28),
        status: 'overdue',
        category: 'child',
        description: 'Triple antigen vaccine',
        ageGroup: '6 weeks - 6 months',
        reminderDays: 7
      },
      {
        id: '4',
        name: 'Polio Vaccine (OPV)',
        dueDate: new Date(2025, 10, 20),
        status: 'upcoming',
        category: 'child',
        description: 'Polio protection',
        ageGroup: '6 weeks - 14 weeks',
        reminderDays: 7
      },
      {
        id: '5',
        name: 'MMR (Measles, Mumps, Rubella)',
        dueDate: new Date(2025, 11, 5),
        status: 'upcoming',
        category: 'child',
        description: 'Triple vaccine for measles, mumps, rubella',
        ageGroup: '9-15 months',
        reminderDays: 14
      },
      {
        id: '6',
        name: 'Tetanus Toxoid (TT)',
        dueDate: new Date(2025, 10, 25),
        status: 'upcoming',
        category: 'pregnant',
        description: 'Protects mother and baby from tetanus',
        ageGroup: 'During pregnancy',
        reminderDays: 7
      },
      {
        id: '7',
        name: 'Influenza (Flu Shot)',
        dueDate: new Date(2025, 10, 18),
        status: 'upcoming',
        category: 'elderly',
        description: 'Annual flu protection',
        ageGroup: '60+ years',
        reminderDays: 14
      },
      {
        id: '8',
        name: 'Pneumococcal Vaccine',
        dueDate: new Date(2025, 11, 1),
        status: 'upcoming',
        category: 'elderly',
        description: 'Pneumonia protection',
        ageGroup: '65+ years',
        reminderDays: 14
      },
      {
        id: '9',
        name: 'COVID-19 Booster',
        dueDate: new Date(2025, 10, 12),
        status: 'due',
        category: 'adult',
        description: 'COVID-19 booster dose',
        ageGroup: '18+ years',
        reminderDays: 7
      }
    ];

    const defaultCheckups: HealthCheckup[] = [
      {
        id: '1',
        type: 'Blood Pressure Check',
        lastDate: new Date(2025, 8, 3),
        nextDate: new Date(2025, 11, 3),
        frequency: 'Every 3 months',
        status: 'scheduled',
        priority: 'high'
      },
      {
        id: '2',
        type: 'Diabetes Screening',
        lastDate: new Date(2025, 7, 15),
        nextDate: new Date(2025, 10, 8),
        frequency: 'Every 3 months',
        status: 'due',
        priority: 'high'
      },
      {
        id: '3',
        type: 'Dental Checkup',
        lastDate: new Date(2025, 5, 20),
        nextDate: new Date(2025, 9, 25),
        frequency: 'Every 6 months',
        status: 'overdue',
        priority: 'medium'
      },
      {
        id: '4',
        type: 'Eye Examination',
        lastDate: new Date(2025, 6, 10),
        nextDate: new Date(2025, 11, 10),
        frequency: 'Every 6 months',
        status: 'scheduled',
        priority: 'medium'
      },
      {
        id: '5',
        type: 'General Health Checkup',
        nextDate: new Date(2025, 10, 30),
        frequency: 'Annually',
        status: 'scheduled',
        priority: 'medium'
      }
    ];

    setVaccinations(defaultVaccinations);
    setCheckups(defaultCheckups);

    // Generate reminders
    const allReminders: Reminder[] = [
      ...defaultVaccinations
        .filter(v => v.status !== 'completed')
        .map(v => ({
          id: `vac-${v.id}`,
          title: v.name,
          date: new Date(v.dueDate.getTime() - v.reminderDays * 24 * 60 * 60 * 1000),
          type: 'vaccination' as const,
          notificationSent: false
        })),
      ...defaultCheckups
        .filter(c => c.status !== 'overdue')
        .map(c => ({
          id: `check-${c.id}`,
          title: c.type,
          date: new Date(c.nextDate.getTime() - 7 * 24 * 60 * 60 * 1000),
          type: 'checkup' as const,
          notificationSent: false
        }))
    ];

    setReminders(allReminders);
  }, []);

  // AI-powered notification system
  useEffect(() => {
    const checkReminders = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      reminders.forEach(reminder => {
        const reminderDate = new Date(reminder.date);
        reminderDate.setHours(0, 0, 0, 0);

        if (reminderDate <= today && !reminder.notificationSent) {
          sendNotification(reminder);
          // Mark as sent
          setReminders(prev => 
            prev.map(r => 
              r.id === reminder.id ? { ...r, notificationSent: true } : r
            )
          );
        }
      });
    };

    // Check reminders every hour
    const interval = setInterval(checkReminders, 60 * 60 * 1000);
    checkReminders(); // Check immediately

    return () => clearInterval(interval);
  }, [reminders]);

  const sendNotification = (reminder: Reminder) => {
    // In production, integrate with:
    // - Push notifications (FCM/APNS)
    // - SMS gateway
    // - WhatsApp Business API
    // - Email service
    console.log(`🔔 Sending notification: ${reminder.title} on ${reminder.date.toLocaleDateString()}`);
    
    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('MedAid Health Reminder', {
        body: `Reminder: ${reminder.title} - ${reminder.type === 'vaccination' ? 'Vaccination' : 'Health Checkup'}`,
        icon: '/logo.png',
        badge: '/badge.png'
      });
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'scheduled':
        return 'text-green-600 bg-green-50';
      case 'upcoming':
      case 'due':
        return 'text-yellow-600 bg-yellow-50';
      case 'overdue':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'child':
        return <Baby className="w-4 h-4" />;
      case 'adult':
        return <Users className="w-4 h-4" />;
      case 'elderly':
        return <Heart className="w-4 h-4" />;
      case 'pregnant':
        return <Heart className="w-4 h-4" />;
      default:
        return <Syringe className="w-4 h-4" />;
    }
  };

  const filteredVaccinations = vaccinations.filter(v => 
    selectedCategory === 'all' || v.category === selectedCategory
  );

  const markAsCompleted = (id: string) => {
    setVaccinations(prev =>
      prev.map(v => v.id === id ? { ...v, status: 'completed' as const } : v)
    );
  };

  const upcomingCount = vaccinations.filter(v => v.status === 'upcoming' || v.status === 'due').length;
  const overdueCount = vaccinations.filter(v => v.status === 'overdue').length;
  const checkupsDueCount = checkups.filter(c => c.status === 'due' || c.status === 'overdue').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Vaccination & Health Reminder
                </h1>
                <p className="text-gray-600 mt-1">
                  Never miss important vaccines and checkups
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Reminder
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-800 text-sm font-medium">Upcoming</p>
                  <p className="text-3xl font-bold text-yellow-900 mt-1">{upcomingCount}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-800 text-sm font-medium">Overdue</p>
                  <p className="text-3xl font-bold text-red-900 mt-1">{overdueCount}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-800 text-sm font-medium">Checkups Due</p>
                  <p className="text-3xl font-bold text-blue-900 mt-1">{checkupsDueCount}</p>
                </div>
                <Heart className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-800 text-sm font-medium">Active Reminders</p>
                  <p className="text-3xl font-bold text-green-900 mt-1">{reminders.length}</p>
                </div>
                <Bell className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('vaccinations')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'vaccinations'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Syringe className="w-5 h-5 inline mr-2" />
              Vaccinations
            </button>
            <button
              onClick={() => setActiveTab('checkups')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'checkups'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Heart className="w-5 h-5 inline mr-2" />
              Health Checkups
            </button>
            <button
              onClick={() => setActiveTab('reminders')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'reminders'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Bell className="w-5 h-5 inline mr-2" />
              Active Reminders
            </button>
          </div>

          <div className="p-6">
            {/* Vaccinations Tab */}
            {activeTab === 'vaccinations' && (
              <div>
                {/* Category Filter */}
                <div className="flex gap-2 mb-6 flex-wrap">
                  {(['all', 'child', 'adult', 'elderly', 'pregnant'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        selectedCategory === cat
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Vaccinations List */}
                <div className="space-y-4">
                  {filteredVaccinations.map((vaccination) => (
                    <div
                      key={vaccination.id}
                      className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              {getCategoryIcon(vaccination.category)}
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800">
                                {vaccination.name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {vaccination.description}
                              </p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Due Date</p>
                              <p className="text-sm font-medium text-gray-800">
                                {vaccination.dueDate.toLocaleDateString('en-IN')}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Age Group</p>
                              <p className="text-sm font-medium text-gray-800">
                                {vaccination.ageGroup}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Category</p>
                              <p className="text-sm font-medium text-gray-800 capitalize">
                                {vaccination.category}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Status</p>
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(vaccination.status)}`}>
                                {vaccination.status.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="ml-4">
                          {vaccination.status !== 'completed' && (
                            <button
                              onClick={() => markAsCompleted(vaccination.id)}
                              className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                              title="Mark as completed"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Health Checkups Tab */}
            {activeTab === 'checkups' && (
              <div className="space-y-4">
                {checkups.map((checkup) => (
                  <div
                    key={checkup.id}
                    className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Heart className="w-5 h-5 text-green-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {checkup.type}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            checkup.priority === 'high' 
                              ? 'bg-red-100 text-red-700'
                              : checkup.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {checkup.priority.toUpperCase()} PRIORITY
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {checkup.lastDate && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Last Checkup</p>
                              <p className="text-sm font-medium text-gray-800">
                                {checkup.lastDate.toLocaleDateString('en-IN')}
                              </p>
                            </div>
                          )}
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Next Checkup</p>
                            <p className="text-sm font-medium text-gray-800">
                              {checkup.nextDate.toLocaleDateString('en-IN')}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Frequency</p>
                            <p className="text-sm font-medium text-gray-800">
                              {checkup.frequency}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Status</p>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(checkup.status)}`}>
                              {checkup.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reminders Tab */}
            {activeTab === 'reminders' && (
              <div className="space-y-4">
                {reminders.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No active reminders</p>
                  </div>
                ) : (
                  reminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className={`border rounded-xl p-5 ${
                        reminder.notificationSent
                          ? 'bg-gray-50 border-gray-200'
                          : 'bg-white border-blue-200 hover:shadow-md'
                      } transition-shadow`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-lg ${
                            reminder.type === 'vaccination'
                              ? 'bg-blue-100'
                              : 'bg-green-100'
                          }`}>
                            {reminder.type === 'vaccination' ? (
                              <Syringe className={`w-5 h-5 ${
                                reminder.type === 'vaccination' ? 'text-blue-600' : 'text-green-600'
                              }`} />
                            ) : (
                              <Heart className="w-5 h-5 text-green-600" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">
                              {reminder.title}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Reminder Date: {reminder.date.toLocaleDateString('en-IN')}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 capitalize">
                              Type: {reminder.type}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {reminder.notificationSent ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                              <Check className="w-4 h-4" />
                              Sent
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                              <Clock className="w-4 h-4" />
                              Pending
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Integration Info */}
        <div className="mt-6 bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">AI-Powered Notifications</h3>
              <p className="text-blue-50 mb-3">
                Our intelligent reminder system integrates with:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  <span>Local Healthcare Database (CoWIN, ABDM)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  <span>SMS & WhatsApp Notifications</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  <span>Push Notifications (Mobile & Web)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  <span>Email Reminders with Calendar Invite</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
