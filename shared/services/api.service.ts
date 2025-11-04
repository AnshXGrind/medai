/**
 * API Service Layer
 * Centralized API calls for all platforms
 * Use this service in both web and mobile apps
 */

import { apiClient } from './http.client';
import { API_ENDPOINTS } from '../config/api.config';

// Type Definitions
export interface HealthRecord {
  _id?: string;
  healthId: string;
  userId?: string;
  fullName: string;
  dateOfBirth: string;
  bloodGroup: string;
  allergies: string[];
  chronicConditions: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  documents: Array<{
    name: string;
    path: string;
    uploadDate: string;
    type: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface MedicineVerification {
  _id?: string;
  barcode: string;
  medicineName: string;
  manufacturer: string;
  isAuthentic: boolean;
  batchNumber?: string;
  expiryDate?: string;
  manufacturedDate?: string;
  verifiedAt: string;
  userId?: string;
}

export interface MedicalNews {
  _id?: string;
  title: string;
  summary: string;
  aiSummary: string;
  authors: string[];
  publicationDate: string;
  category: string;
  keywords: string[];
  externalLink: string;
  source?: string;
  doi?: string;
  createdAt?: string;
}

export interface DiseaseData {
  _id?: string;
  location: string;
  diseaseName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  cases: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  coordinates?: {
    lat: number;
    lng: number;
  };
  lastUpdated: string;
  description?: string;
}

export interface DashboardSummary {
  healthRecords: {
    total: number;
    recentlyAdded: number;
  };
  medicineScans: {
    total: number;
    authentic: number;
    fake: number;
    authenticPercentage: number;
  };
  news: {
    total: number;
    today: number;
  };
  diseases: {
    total: number;
    highRisk: number;
    locationsTracked: number;
  };
}

// Health Records API
export const healthRecordsApi = {
  // Get all health records
  getAll: async (): Promise<HealthRecord[]> => {
    return apiClient.get(API_ENDPOINTS.HEALTH_RECORDS.ALL);
  },

  // Get health record by ID
  getById: async (healthId: string): Promise<HealthRecord> => {
    return apiClient.get(API_ENDPOINTS.HEALTH_RECORDS.BY_ID(healthId));
  },

  // Create new health record
  create: async (data: Partial<HealthRecord>): Promise<HealthRecord> => {
    return apiClient.post(API_ENDPOINTS.HEALTH_RECORDS.CREATE, data);
  },

  // Upload document
  uploadDocument: async (id: string, formData: FormData): Promise<any> => {
    return apiClient.post(API_ENDPOINTS.HEALTH_RECORDS.UPLOAD(id), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Download document
  downloadDocument: async (id: string, docId: string): Promise<Blob> => {
    return apiClient.get(API_ENDPOINTS.HEALTH_RECORDS.DOWNLOAD(id, docId), {
      responseType: 'blob',
    });
  },
};

// Medicine Checker API
export const medicineCheckerApi = {
  // Verify barcode
  verify: async (barcode: string): Promise<MedicineVerification> => {
    return apiClient.post(API_ENDPOINTS.MEDICINE_CHECKER.VERIFY, { barcode });
  },

  // Get verification history
  getHistory: async (): Promise<MedicineVerification[]> => {
    return apiClient.get(API_ENDPOINTS.MEDICINE_CHECKER.HISTORY);
  },

  // Get statistics
  getStats: async (): Promise<any> => {
    return apiClient.get(API_ENDPOINTS.MEDICINE_CHECKER.STATS);
  },
};

// Medical News API
export const medicalNewsApi = {
  // Get latest news
  getLatest: async (): Promise<MedicalNews[]> => {
    return apiClient.get(API_ENDPOINTS.MEDICAL_NEWS.LATEST);
  },

  // Get news by category
  getByCategory: async (category: string): Promise<MedicalNews[]> => {
    return apiClient.get(API_ENDPOINTS.MEDICAL_NEWS.BY_CATEGORY(category));
  },

  // Refresh news feed
  refresh: async (): Promise<MedicalNews[]> => {
    return apiClient.post(API_ENDPOINTS.MEDICAL_NEWS.REFRESH);
  },
};

// Disease Tracker API
export const diseaseTrackerApi = {
  // Get all disease data
  getAll: async (): Promise<DiseaseData[]> => {
    return apiClient.get(API_ENDPOINTS.DISEASE_TRACKER.ALL);
  },

  // Get disease data by city
  getByCity: async (city: string): Promise<DiseaseData[]> => {
    return apiClient.get(API_ENDPOINTS.DISEASE_TRACKER.BY_CITY(city));
  },

  // Get disease data by severity
  getBySeverity: async (level: string): Promise<DiseaseData[]> => {
    return apiClient.get(API_ENDPOINTS.DISEASE_TRACKER.BY_SEVERITY(level));
  },
};

// Dashboard API
export const dashboardApi = {
  // Get dashboard summary
  getSummary: async (): Promise<DashboardSummary> => {
    return apiClient.get(API_ENDPOINTS.DASHBOARD.SUMMARY);
  },
};

// Export all APIs
export const api = {
  healthRecords: healthRecordsApi,
  medicineChecker: medicineCheckerApi,
  medicalNews: medicalNewsApi,
  diseaseTracker: diseaseTrackerApi,
  dashboard: dashboardApi,
};

export default api;
