import { useState, useEffect } from 'react';
import { MapPin, TrendingUp, TrendingDown, Minus, AlertTriangle, Map, Navigation, RefreshCw } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

interface Disease {
  name: string;
  cases: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  trend: 'increasing' | 'stable' | 'decreasing';
  lastWeekCases: number;
  changePercentage: number;
}

interface LocationData {
  _id: string;
  location: {
    coordinates: number[];
    city: string;
    state: string;
    country: string;
  };
  diseases: Disease[];
  reportDate: string;
  dataSource: string;
}

export default function LocalDiseaseTracker() {
  const [diseaseData, setDiseaseData] = useState<LocationData[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDiseaseData();
    getUserLocation();
  }, []);

  const fetchDiseaseData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/disease-tracker/all`);
      setDiseaseData(response.data.data);
    } catch (error) {
      console.error('Error fetching disease data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/disease-tracker/refresh`);
      setDiseaseData(response.data.data);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-5 h-5 text-red-500" />;
      case 'decreasing':
        return <TrendingDown className="w-5 h-5 text-green-500" />;
      case 'stable':
        return <Minus className="w-5 h-5 text-yellow-500" />;
      default:
        return <Minus className="w-5 h-5 text-gray-500" />;
    }
  };

  const filteredData = selectedCity === 'all' 
    ? diseaseData 
    : diseaseData.filter(data => data.location.city.toLowerCase() === selectedCity.toLowerCase());

  const cities = ['all', ...new Set(diseaseData.map(data => data.location.city))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl">
                <Map className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Local Disease Tracker</h1>
                <p className="text-gray-600 mt-1">Real-time disease trends in your area</p>
              </div>
            </div>
            <div className="flex gap-3">
              {userLocation && (
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                >
                  <Navigation className="w-5 h-5" />
                  Location Enabled
                </button>
              )}
              <button
                onClick={refreshData}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* City Filter */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Select Location</h3>
          <div className="flex gap-2 flex-wrap">
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCity === city
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {city === 'all' ? 'All Cities' : city}
              </button>
            ))}
          </div>
        </div>

        {/* Disease Cards by Location */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <RefreshCw className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading disease data...</p>
            </div>
          </div>
        ) : filteredData.length > 0 ? (
          <div className="space-y-6">
            {filteredData.map((locationData) => (
              <div key={locationData._id} className="bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Location Header */}
                <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-8 h-8" />
                      <div>
                        <h2 className="text-2xl font-bold">{locationData.location.city}</h2>
                        <p className="text-red-100">{locationData.location.state}, {locationData.location.country}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-red-100">Last Updated</p>
                      <p className="font-semibold">{new Date(locationData.reportDate).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>
                  <p className="text-sm text-red-100 mt-4">Data Source: {locationData.dataSource}</p>
                </div>

                {/* Diseases Grid */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {locationData.diseases.map((disease, idx) => (
                    <div
                      key={idx}
                      className={`border-2 rounded-xl p-5 ${getSeverityColor(disease.severity)}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-bold">{disease.name}</h3>
                        {getTrendIcon(disease.trend)}
                      </div>

                      <div className="space-y-2">
                        <div>
                          <p className="text-sm opacity-75">Current Cases</p>
                          <p className="text-3xl font-bold">{disease.cases}</p>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="opacity-75">Last Week</span>
                          <span className="font-semibold">{disease.lastWeekCases}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-semibold ${
                            disease.trend === 'increasing' ? 'text-red-700' :
                            disease.trend === 'decreasing' ? 'text-green-700' :
                            'text-yellow-700'
                          }`}>
                            {disease.trend === 'increasing' ? '↗' : disease.trend === 'decreasing' ? '↘' : '→'} 
                            {' '}{Math.abs(disease.changePercentage).toFixed(1)}%
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getSeverityColor(disease.severity)}`}>
                            {disease.severity.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {disease.severity === 'critical' || disease.severity === 'high' ? (
                        <div className="mt-3 pt-3 border-t border-current/20">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            <p className="text-xs font-semibold">High Alert Area</p>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Map className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No data available</h3>
            <p className="text-gray-600">Disease tracking data will appear here</p>
          </div>
        )}

        {/* Summary Stats */}
        {diseaseData.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Summary Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600 mb-1">Locations Tracked</p>
                <p className="text-3xl font-bold text-blue-900">{diseaseData.length}</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <p className="text-sm text-orange-600 mb-1">Total Cases</p>
                <p className="text-3xl font-bold text-orange-900">
                  {diseaseData.reduce((sum, loc) => 
                    sum + loc.diseases.reduce((dSum, d) => dSum + d.cases, 0), 0
                  )}
                </p>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-sm text-red-600 mb-1">High Risk Areas</p>
                <p className="text-3xl font-bold text-red-900">
                  {diseaseData.reduce((count, loc) => 
                    count + loc.diseases.filter(d => d.severity === 'high' || d.severity === 'critical').length, 0
                  )}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-600 mb-1">Diseases Monitored</p>
                <p className="text-3xl font-bold text-green-900">
                  {new Set(diseaseData.flatMap(loc => loc.diseases.map(d => d.name))).size}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info Panel */}
        <div className="mt-6 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl shadow-xl p-6 text-white">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-8 h-8 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-bold mb-2">Disease Surveillance System</h3>
              <p className="text-red-100 mb-3">
                Real-time tracking of infectious diseases across major Indian cities based on official health department data.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-300 rounded-full"></span>
                  <span>Low Severity: Normal monitoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-300 rounded-full"></span>
                  <span>Medium: Increased awareness</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-300 rounded-full"></span>
                  <span>High: Take precautions</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-300 rounded-full"></span>
                  <span>Critical: Immediate action needed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
