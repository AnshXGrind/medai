import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const navigation = useNavigation();

  const modules = [
    {
      id: 1,
      title: 'Health Records',
      icon: 'folder',
      color: '#4CAF50',
      description: 'Manage your digital health records',
      screen: 'Health Records'
    },
    {
      id: 2,
      title: 'Medicine Scanner',
      icon: 'scan',
      color: '#9C27B0',
      description: 'Verify medicine authenticity',
      screen: 'Scanner'
    },
    {
      id: 3,
      title: 'Medical News',
      icon: 'newspaper',
      color: '#2196F3',
      description: 'Latest research & health news',
      screen: 'News'
    },
    {
      id: 4,
      title: 'Disease Tracker',
      icon: 'map',
      color: '#F44336',
      description: 'Track local disease outbreaks',
      screen: 'Disease Tracker'
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerContent}>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.appName}>MedAid AI</Text>
          <Text style={styles.tagline}>Your Complete Healthcare Companion</Text>
        </View>
        <Ionicons name="medical" size={80} color="#fff" />
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="document-text" size={24} color="#4CAF50" />
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Health Records</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="scan" size={24} color="#9C27B0" />
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Scans</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="shield-checkmark" size={24} color="#2196F3" />
          <Text style={styles.statNumber}>100%</Text>
          <Text style={styles.statLabel}>Secure</Text>
        </View>
      </View>

      {/* Modules Grid */}
      <Text style={styles.sectionTitle}>Healthcare Modules</Text>
      <View style={styles.modulesGrid}>
        {modules.map((module) => (
          <TouchableOpacity
            key={module.id}
            style={[styles.moduleCard, { borderColor: module.color }]}
            onPress={() => navigation.navigate(module.screen as never)}
          >
            <View style={[styles.iconContainer, { backgroundColor: module.color }]}>
              <Ionicons name={module.icon as any} size={32} color="#fff" />
            </View>
            <Text style={styles.moduleTitle}>{module.title}</Text>
            <Text style={styles.moduleDescription}>{module.description}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Features Section */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>Why Choose MedAid?</Text>
        <View style={styles.featureItem}>
          <Ionicons name="shield-checkmark" size={24} color="#4CAF50" />
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Secure & Private</Text>
            <Text style={styles.featureDescription}>Your data is encrypted and protected</Text>
          </View>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="flash" size={24} color="#FF9800" />
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Fast & Reliable</Text>
            <Text style={styles.featureDescription}>Quick access to all health services</Text>
          </View>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="people" size={24} color="#2196F3" />
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>AI-Powered</Text>
            <Text style={styles.featureDescription}>Smart health insights & recommendations</Text>
          </View>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerCard: {
    backgroundColor: '#4CAF50',
    padding: 30,
    margin: 15,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerContent: {
    flex: 1,
  },
  welcomeText: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.9,
  },
  appName: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 5,
  },
  tagline: {
    color: '#fff',
    fontSize: 14,
    marginTop: 5,
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 15,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
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
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginBottom: 15,
    color: '#333',
  },
  modulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
  },
  moduleCard: {
    backgroundColor: '#fff',
    width: '46%',
    margin: '2%',
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  moduleDescription: {
    fontSize: 12,
    color: '#666',
  },
  featuresSection: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureText: {
    marginLeft: 15,
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});
