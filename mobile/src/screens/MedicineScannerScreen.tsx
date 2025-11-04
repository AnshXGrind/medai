import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

interface VerificationResult {
  barcode: string;
  isAuthentic: boolean;
  medicineName: string;
  manufacturer: string;
  batchNumber?: string;
  expiryDate?: string;
  verifiedAt: string;
}

export default function MedicineScannerScreen() {
  const [hasPermission, setHasPermission] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [history, setHistory] = useState<VerificationResult[]>([]);

  useEffect(() => {
    requestCameraPermission();
    fetchHistory();
  }, []);

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/medicine-checker/history`);
      setHistory(response.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    setScanning(false);
    verifyBarcode(data);
  };

  const verifyBarcode = async (barcode: string) => {
    try {
      const response = await axios.post(`${API_URL}/medicine-checker/verify`, { barcode });
      setResult(response.data);
      fetchHistory();
      
      if (response.data.isAuthentic) {
        Alert.alert('✓ Authentic Medicine', `${response.data.medicineName} is verified as authentic.`);
      } else {
        Alert.alert('⚠️ Warning', 'This medicine could not be verified. Please consult a pharmacist.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify medicine');
    }
  };

  const handleManualVerify = () => {
    if (manualBarcode.trim()) {
      verifyBarcode(manualBarcode);
      setManualBarcode('');
    }
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Ionicons name="camera-off" size={80} color="#ccc" />
        <Text style={styles.permissionText}>Camera permission denied</Text>
        <TouchableOpacity style={styles.button} onPress={requestCameraPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {scanning ? (
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            onBarcodeScanned={handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ['ean13', 'ean8', 'upc_e'],
            }}
          />
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setScanning(false)}
          >
            <Ionicons name="close-circle" size={50} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <Ionicons name="shield-checkmark" size={60} color="#9C27B0" />
            <Text style={styles.headerTitle}>Medicine Authenticator</Text>
            <Text style={styles.headerSubtitle}>Scan or enter barcode to verify</Text>
          </View>

          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[styles.scanButton, { backgroundColor: '#9C27B0' }]}
              onPress={() => setScanning(true)}
            >
              <Ionicons name="scan" size={40} color="#fff" />
              <Text style={styles.scanButtonText}>Scan Barcode</Text>
            </TouchableOpacity>

            <View style={styles.manualInput}>
              <TextInput
                style={styles.input}
                placeholder="Enter barcode manually"
                value={manualBarcode}
                onChangeText={setManualBarcode}
                keyboardType="numeric"
              />
              <TouchableOpacity
                style={styles.verifyButton}
                onPress={handleManualVerify}
              >
                <Ionicons name="checkmark-circle" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {result && (
            <View style={[
              styles.resultCard,
              { borderColor: result.isAuthentic ? '#4CAF50' : '#F44336' }
            ]}>
              <View style={styles.resultHeader}>
                <Ionicons
                  name={result.isAuthentic ? 'checkmark-circle' : 'warning'}
                  size={50}
                  color={result.isAuthentic ? '#4CAF50' : '#F44336'}
                />
                <Text style={[
                  styles.resultStatus,
                  { color: result.isAuthentic ? '#4CAF50' : '#F44336' }
                ]}>
                  {result.isAuthentic ? 'Authentic Medicine' : 'Verification Failed'}
                </Text>
              </View>

              <View style={styles.resultDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Medicine:</Text>
                  <Text style={styles.detailValue}>{result.medicineName}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Manufacturer:</Text>
                  <Text style={styles.detailValue}>{result.manufacturer}</Text>
                </View>
                {result.batchNumber && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Batch:</Text>
                    <Text style={styles.detailValue}>{result.batchNumber}</Text>
                  </View>
                )}
                {result.expiryDate && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Expiry:</Text>
                    <Text style={styles.detailValue}>{result.expiryDate}</Text>
                  </View>
                )}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Barcode:</Text>
                  <Text style={styles.detailValue}>{result.barcode}</Text>
                </View>
              </View>
            </View>
          )}

          {history.length > 0 && (
            <View style={styles.historyContainer}>
              <Text style={styles.historyTitle}>Recent Scans</Text>
              {history.map((item, index) => (
                <View key={index} style={styles.historyItem}>
                  <Ionicons
                    name={item.isAuthentic ? 'checkmark-circle' : 'close-circle'}
                    size={24}
                    color={item.isAuthentic ? '#4CAF50' : '#F44336'}
                  />
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyMedicine}>{item.medicineName}</Text>
                    <Text style={styles.historyBarcode}>{item.barcode}</Text>
                  </View>
                  <Text style={styles.historyDate}>
                    {new Date(item.verifiedAt).toLocaleDateString()}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={24} color="#2196F3" />
            <Text style={styles.infoText}>
              Scan the barcode on medicine packaging to verify authenticity and check expiry dates.
            </Text>
          </View>
        </>
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
    backgroundColor: '#9C27B0',
    padding: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 15,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 5,
  },
  actionContainer: {
    padding: 20,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    elevation: 3,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  manualInput: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  verifyButton: {
    backgroundColor: '#9C27B0',
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
    minHeight: 400,
  },
  cancelButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
  },
  permissionText: {
    fontSize: 18,
    color: '#999',
    marginTop: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#9C27B0',
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultCard: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    borderWidth: 3,
    elevation: 5,
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resultStatus: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  resultDetails: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
  },
  historyContainer: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 15,
    borderRadius: 15,
    elevation: 3,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyInfo: {
    flex: 1,
    marginLeft: 10,
  },
  historyMedicine: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  historyBarcode: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  historyDate: {
    fontSize: 12,
    color: '#999',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#1976D2',
  },
});
