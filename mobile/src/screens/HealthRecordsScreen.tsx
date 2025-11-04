import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

interface HealthRecord {
  _id: string;
  healthId: string;
  fullName: string;
  dateOfBirth: string;
  bloodGroup: string;
  allergies: string[];
  chronicConditions: string[];
  documents: Array<{
    name: string;
    uploadDate: string;
    type: string;
  }>;
}

export default function HealthRecordsScreen() {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    bloodGroup: 'A+',
    allergies: '',
    chronicConditions: '',
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await axios.get(`${API_URL}/health-records/all`);
      setRecords(response.data);
    } catch (error) {
      console.error('Error fetching records:', error);
    }
  };

  const createHealthId = async () => {
    try {
      const payload = {
        ...formData,
        allergies: formData.allergies.split(',').map(a => a.trim()).filter(Boolean),
        chronicConditions: formData.chronicConditions.split(',').map(c => c.trim()).filter(Boolean),
      };

      const response = await axios.post(`${API_URL}/health-records/create`, payload);
      Alert.alert('Success', `Health ID Created: ${response.data.healthId}`);
      setShowCreateForm(false);
      fetchRecords();
      setFormData({
        fullName: '',
        dateOfBirth: '',
        bloodGroup: 'A+',
        allergies: '',
        chronicConditions: '',
      });
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create Health ID');
    }
  };

  const uploadDocument = async (recordId: string) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
      });

      if (result.assets && result.assets[0]) {
        const formData = new FormData();
        formData.append('document', {
          uri: result.assets[0].uri,
          name: result.assets[0].name,
          type: result.assets[0].mimeType || 'application/octet-stream',
        } as any);

        await axios.post(`${API_URL}/health-records/${recordId}/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        Alert.alert('Success', 'Document uploaded successfully');
        fetchRecords();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload document');
    }
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Digital Health Records</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateForm(!showCreateForm)}
        >
          <Ionicons name={showCreateForm ? 'close' : 'add-circle'} size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {showCreateForm && (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Create Health ID</Text>

          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={formData.fullName}
            onChangeText={(text) => setFormData({ ...formData, fullName: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="Date of Birth (YYYY-MM-DD)"
            value={formData.dateOfBirth}
            onChangeText={(text) => setFormData({ ...formData, dateOfBirth: text })}
          />

          <View style={styles.bloodGroupContainer}>
            <Text style={styles.label}>Blood Group:</Text>
            <View style={styles.bloodGroupGrid}>
              {bloodGroups.map((bg) => (
                <TouchableOpacity
                  key={bg}
                  style={[
                    styles.bloodGroupButton,
                    formData.bloodGroup === bg && styles.bloodGroupButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, bloodGroup: bg })}
                >
                  <Text
                    style={[
                      styles.bloodGroupText,
                      formData.bloodGroup === bg && styles.bloodGroupTextActive,
                    ]}
                  >
                    {bg}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Allergies (comma-separated)"
            value={formData.allergies}
            onChangeText={(text) => setFormData({ ...formData, allergies: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="Chronic Conditions (comma-separated)"
            value={formData.chronicConditions}
            onChangeText={(text) => setFormData({ ...formData, chronicConditions: text })}
          />

          <TouchableOpacity style={styles.submitButton} onPress={createHealthId}>
            <Text style={styles.submitButtonText}>Create Health ID</Text>
          </TouchableOpacity>
        </View>
      )}

      {records.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="folder-open-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>No health records yet</Text>
          <Text style={styles.emptySubtext}>Create your Health ID to get started</Text>
        </View>
      ) : (
        <View style={styles.recordsList}>
          {records.map((record) => (
            <View key={record._id} style={styles.recordCard}>
              <View style={styles.recordHeader}>
                <View>
                  <Text style={styles.healthId}>{record.healthId}</Text>
                  <Text style={styles.recordName}>{record.fullName}</Text>
                </View>
                <View style={styles.bloodGroupBadge}>
                  <Text style={styles.bloodGroupBadgeText}>{record.bloodGroup}</Text>
                </View>
              </View>

              <View style={styles.recordDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="calendar" size={16} color="#666" />
                  <Text style={styles.detailText}>DOB: {record.dateOfBirth}</Text>
                </View>

                {record.allergies.length > 0 && (
                  <View style={styles.detailRow}>
                    <Ionicons name="warning" size={16} color="#F44336" />
                    <Text style={styles.detailText}>Allergies: {record.allergies.join(', ')}</Text>
                  </View>
                )}

                {record.chronicConditions.length > 0 && (
                  <View style={styles.detailRow}>
                    <Ionicons name="medical" size={16} color="#FF9800" />
                    <Text style={styles.detailText}>
                      Conditions: {record.chronicConditions.join(', ')}
                    </Text>
                  </View>
                )}

                <View style={styles.detailRow}>
                  <Ionicons name="document-text" size={16} color="#2196F3" />
                  <Text style={styles.detailText}>
                    Documents: {record.documents.length}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => uploadDocument(record._id)}
              >
                <Ionicons name="cloud-upload" size={20} color="#4CAF50" />
                <Text style={styles.uploadButtonText}>Upload Document</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  createButton: {
    padding: 5,
  },
  formContainer: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 15,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  bloodGroupContainer: {
    marginBottom: 15,
  },
  bloodGroupGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bloodGroupButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4CAF50',
    backgroundColor: '#fff',
  },
  bloodGroupButtonActive: {
    backgroundColor: '#4CAF50',
  },
  bloodGroupText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  bloodGroupTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
  recordsList: {
    padding: 15,
  },
  recordCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  healthId: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  recordName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  bloodGroupBadge: {
    backgroundColor: '#F44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  bloodGroupBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  recordDetails: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 10,
    marginTop: 15,
  },
  uploadButtonText: {
    marginLeft: 8,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});
