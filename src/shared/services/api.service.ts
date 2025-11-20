import { apiClient } from './http.client';
import { API_ENDPOINTS } from '../../shared/config/api.config';

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

// Health Records API
export const healthRecordsApi = {
  // Get all health records
  getAll: async (): Promise<HealthRecord[]> => {
    return apiClient.get(API_ENDPOINTS.HEALTH_RECORDS.ALL as string) as Promise<HealthRecord[]>;
  },

  // Get health record by ID
  getById: async (healthId: string): Promise<HealthRecord> => {
    return apiClient.get(API_ENDPOINTS.HEALTH_RECORDS.BY_ID(healthId) as string) as Promise<HealthRecord>;
  },

  // Create new health record
  create: async (data: Partial<HealthRecord>): Promise<HealthRecord> => {
    return apiClient.post(API_ENDPOINTS.HEALTH_RECORDS.CREATE as string, data) as Promise<HealthRecord>;
  },
};

export default { healthRecordsApi };
