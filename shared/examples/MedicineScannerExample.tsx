/**
 * Example: Medicine Scanner Using Centralized System
 * React Native mobile example
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Camera, CameraView } from 'expo-camera';

// ✅ Import centralized services and constants
import { api } from '../../../shared/services/api.service';
import { COLORS, BARCODE } from '../../../shared/constants/app.constants';
import type { MedicineVerification } from '../../../shared/services/api.service';

export default function MedicineScannerExample() {
  const [hasPermission, setHasPermission] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<MedicineVerification | null>(null);
  const [history, setHistory] = useState<MedicineVerification[]>([]);

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
      // ✅ Use centralized API
      const data = await api.medicineChecker.getHistory();
      setHistory(data.slice(0, 5)); // Last 5 scans
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    setScanning(false);
    
    // ✅ Validate barcode length using centralized constants
    if (data.length < BARCODE.MIN_LENGTH || data.length > BARCODE.MAX_LENGTH) {
      Alert.alert('Invalid Barcode', 'Barcode length is invalid');
      return;
    }

    try {
      // ✅ Use centralized API
      const verification = await api.medicineChecker.verify(data);
      setResult(verification);
      fetchHistory();

      if (verification.isAuthentic) {
        Alert.alert(
          '✓ Authentic Medicine',
          `${verification.medicineName} is verified as authentic.`
        );
      } else {
        Alert.alert(
          '⚠️ Warning',
          'This medicine could not be verified. Please consult a pharmacist.'
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify medicine');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: COLORS.GRAY_LIGHT }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: COLORS.MEDICINE_SCANNER }]}>
        <Text style={styles.headerTitle}>Medicine Scanner</Text>
      </View>

      {scanning ? (
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            onBarcodeScanned={handleBarCodeScanned}
            barcodeScannerSettings={{
              // ✅ Use centralized barcode types
              barcodeTypes: BARCODE.TYPES as any,
            }}
          />
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setScanning(false)}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <TouchableOpacity
            style={[styles.scanButton, { backgroundColor: COLORS.MEDICINE_SCANNER }]}
            onPress={() => setScanning(true)}
          >
            <Text style={styles.scanButtonText}>Start Scanning</Text>
          </TouchableOpacity>

          {/* Result */}
          {result && (
            <View style={[
              styles.resultCard,
              { 
                borderColor: result.isAuthentic ? COLORS.SUCCESS : COLORS.ERROR,
                backgroundColor: COLORS.WHITE 
              }
            ]}>
              <View style={[
                styles.statusBadge,
                { backgroundColor: result.isAuthentic ? COLORS.SUCCESS : COLORS.ERROR }
              ]}>
                <Text style={styles.statusText}>
                  {result.isAuthentic ? '✓ AUTHENTIC' : '⚠️ UNVERIFIED'}
                </Text>
              </View>

              <Text style={styles.medicineName}>{result.medicineName}</Text>
              <Text style={styles.manufacturer}>{result.manufacturer}</Text>

              {result.batchNumber && (
                <Text style={styles.detail}>Batch: {result.batchNumber}</Text>
              )}
              {result.expiryDate && (
                <Text style={styles.detail}>Expiry: {result.expiryDate}</Text>
              )}
              <Text style={styles.detail}>Barcode: {result.barcode}</Text>
            </View>
          )}

          {/* History */}
          {history.length > 0 && (
            <View style={[styles.historyContainer, { backgroundColor: COLORS.WHITE }]}>
              <Text style={styles.historyTitle}>Recent Scans</Text>
              {history.map((item, index) => (
                <View key={index} style={styles.historyItem}>
                  <View style={[
                    styles.historyStatus,
                    { backgroundColor: item.isAuthentic ? COLORS.SUCCESS : COLORS.ERROR }
                  ]} />
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyMedicine}>{item.medicineName}</Text>
                    <Text style={[styles.historyBarcode, { color: COLORS.GRAY_DARK }]}>
                      {item.barcode}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  scanButton: {
    margin: 20,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cancelButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 15,
    borderRadius: 10,
  },
  cancelText: {
    color: '#fff',
    fontSize: 16,
  },
  resultCard: {
    margin: 20,
    padding: 20,
    borderRadius: 15,
    borderWidth: 3,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 15,
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  medicineName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  manufacturer: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  detail: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  historyContainer: {
    margin: 20,
    padding: 15,
    borderRadius: 15,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyStatus: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  historyInfo: {
    flex: 1,
  },
  historyMedicine: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  historyBarcode: {
    fontSize: 12,
    marginTop: 2,
  },
});
