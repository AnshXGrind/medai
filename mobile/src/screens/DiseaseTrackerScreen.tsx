import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

interface DiseaseData {
  _id: string;
  location: string;
  diseaseName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  cases: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  lastUpdated: string;
}

const CITIES = ['All', 'Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Kolkata', 'Chennai'];

export default function DiseaseTrackerScreen() {
  const [diseases, setDiseases] = useState<DiseaseData[]>([]);
  const [filteredDiseases, setFilteredDiseases] = useState<DiseaseData[]>([]);
  const [selectedCity, setSelectedCity] = useState('All');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    requestLocationPermission();
    fetchDiseases();
  }, []);

  useEffect(() => {
    filterDiseases();
  }, [selectedCity, diseases]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const fetchDiseases = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/disease-tracker/all`);
      setDiseases(response.data);
    } catch (error) {
      console.error('Error fetching diseases:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDiseases = () => {
    if (selectedCity === 'All') {
      setFilteredDiseases(diseases);
    } else {
      setFilteredDiseases(diseases.filter((d) => d.location === selectedCity));
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: '#4CAF50',
      medium: '#FF9800',
      high: '#FF5722',
      critical: '#F44336',
    };
    return colors[severity as keyof typeof colors] || '#999';
  };

  const getTrendIcon = (trend: string) => {
    const icons = {
      increasing: 'trending-up',
      decreasing: 'trending-down',
      stable: 'remove',
    };
    return icons[trend as keyof typeof icons] || 'remove';
  };

  const getTrendColor = (trend: string) => {
    const colors = {
      increasing: '#F44336',
      decreasing: '#4CAF50',
      stable: '#FF9800',
    };
    return colors[trend as keyof typeof colors] || '#999';
  };

  const totalCases = filteredDiseases.reduce((sum, d) => sum + d.cases, 0);
  const highRiskAreas = filteredDiseases.filter((d) => d.severity === 'high' || d.severity === 'critical').length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Disease Tracker</Text>
          <Text style={styles.headerSubtitle}>Real-time outbreak monitoring</Text>
        </View>
        <TouchableOpacity onPress={fetchDiseases} disabled={loading}>
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {location && (
        <View style={styles.locationBar}>
          <Ionicons name="location" size={20} color="#F44336" />
          <Text style={styles.locationText}>
            Lat: {location.coords.latitude.toFixed(4)}, Long: {location.coords.longitude.toFixed(4)}
          </Text>
        </View>
      )}

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="people" size={24} color="#F44336" />
          <Text style={styles.statNumber}>{totalCases.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Total Cases</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="warning" size={24} color="#FF5722" />
          <Text style={styles.statNumber}>{highRiskAreas}</Text>
          <Text style={styles.statLabel}>High Risk Areas</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="location" size={24} color="#2196F3" />
          <Text style={styles.statNumber}>{filteredDiseases.length}</Text>
          <Text style={styles.statLabel}>Locations</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.citiesContainer}>
        {CITIES.map((city) => (
          <TouchableOpacity
            key={city}
            style={[
              styles.cityButton,
              selectedCity === city && styles.cityButtonActive,
            ]}
            onPress={() => setSelectedCity(city)}
          >
            <Text
              style={[
                styles.cityText,
                selectedCity === city && styles.cityTextActive,
              ]}
            >
              {city}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.diseasesList}>
        {filteredDiseases.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="shield-checkmark-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>No disease data</Text>
            <Text style={styles.emptySubtext}>Select a different location</Text>
          </View>
        ) : (
          filteredDiseases.map((disease) => (
            <View key={disease._id} style={styles.diseaseCard}>
              <View style={styles.diseaseHeader}>
                <View style={styles.diseaseInfo}>
                  <Text style={styles.diseaseName}>{disease.diseaseName}</Text>
                  <View style={styles.locationRow}>
                    <Ionicons name="location" size={14} color="#666" />
                    <Text style={styles.locationName}>{disease.location}</Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.severityBadge,
                    { backgroundColor: getSeverityColor(disease.severity) },
                  ]}
                >
                  <Text style={styles.severityText}>{disease.severity.toUpperCase()}</Text>
                </View>
              </View>

              <View style={styles.diseaseStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statItemNumber}>{disease.cases.toLocaleString()}</Text>
                  <Text style={styles.statItemLabel}>Cases</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statItem}>
                  <View style={styles.trendContainer}>
                    <Ionicons
                      name={getTrendIcon(disease.trend) as any}
                      size={20}
                      color={getTrendColor(disease.trend)}
                    />
                    <Text style={[styles.trendText, { color: getTrendColor(disease.trend) }]}>
                      {disease.trend}
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={styles.lastUpdated}>
                Updated: {new Date(disease.lastUpdated).toLocaleString()}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      {highRiskAreas > 0 && (
        <View style={styles.alertBanner}>
          <Ionicons name="warning" size={20} color="#fff" />
          <Text style={styles.alertText}>
            {highRiskAreas} high-risk area{highRiskAreas > 1 ? 's' : ''} detected
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#F44336',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 5,
  },
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 12,
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 10,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#333',
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 15,
    marginTop: 15,
    marginBottom: 10,
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  citiesContainer: {
    paddingHorizontal: 15,
    marginVertical: 10,
  },
  cityButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cityButtonActive: {
    backgroundColor: '#F44336',
    borderColor: '#F44336',
  },
  cityText: {
    color: '#666',
    fontWeight: 'bold',
  },
  cityTextActive: {
    color: '#fff',
  },
  diseasesList: {
    flex: 1,
    padding: 15,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 5,
  },
  diseaseCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
  },
  diseaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  diseaseInfo: {
    flex: 1,
  },
  diseaseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationName: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666',
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  severityText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  diseaseStats: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 15,
    marginBottom: 10,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statItemNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statItemLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#f0f0f0',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  lastUpdated: {
    fontSize: 11,
    color: '#999',
    textAlign: 'right',
  },
  alertBanner: {
    backgroundColor: '#FF5722',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  alertText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 10,
  },
});
