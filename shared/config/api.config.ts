/**
 * Centralized API Configuration
 * Update this file to change API endpoints across all platforms
 */

// Environment Detection
export const ENV = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
} as const;

// Current Environment (Change this for different deployments)
export const CURRENT_ENV = ENV.DEVELOPMENT;

// API Base URLs for different environments
export const API_BASE_URLS = {
  [ENV.DEVELOPMENT]: 'http://localhost:5000',
  [ENV.STAGING]: 'https://staging-api.medaid.com',
  [ENV.PRODUCTION]: 'https://api.medaid.com',
} as const;

// Get current API URL based on environment
export const getApiUrl = () => {
  return API_BASE_URLS[CURRENT_ENV];
};

// API Endpoints
export const API_ENDPOINTS = {
  // Health Records
  HEALTH_RECORDS: {
    BASE: '/api/health-records',
    ALL: '/api/health-records/all',
    CREATE: '/api/health-records/create',
    BY_ID: (healthId: string) => `/api/health-records/${healthId}`,
    UPLOAD: (id: string) => `/api/health-records/${id}/upload`,
    DOWNLOAD: (id: string, docId: string) => `/api/health-records/${id}/download/${docId}`,
  },
  
  // Medicine Checker
  MEDICINE_CHECKER: {
    BASE: '/api/medicine-checker',
    VERIFY: '/api/medicine-checker/verify',
    HISTORY: '/api/medicine-checker/history',
    STATS: '/api/medicine-checker/stats',
  },
  
  // Medical News
  MEDICAL_NEWS: {
    BASE: '/api/medical-news',
    LATEST: '/api/medical-news/latest',
    BY_CATEGORY: (category: string) => `/api/medical-news/category/${category}`,
    REFRESH: '/api/medical-news/refresh',
  },
  
  // Disease Tracker
  DISEASE_TRACKER: {
    BASE: '/api/disease-tracker',
    ALL: '/api/disease-tracker/all',
    BY_CITY: (city: string) => `/api/disease-tracker/city/${city}`,
    BY_SEVERITY: (level: string) => `/api/disease-tracker/severity/${level}`,
  },
  
  // Dashboard
  DASHBOARD: {
    BASE: '/api/dashboard',
    SUMMARY: '/api/dashboard/summary',
  },
} as const;

// API Configuration
export const API_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// Build complete API URL
export const buildApiUrl = (endpoint: string) => {
  return `${getApiUrl()}${endpoint}`;
};

export default {
  ENV,
  CURRENT_ENV,
  API_BASE_URLS,
  API_ENDPOINTS,
  API_CONFIG,
  getApiUrl,
  buildApiUrl,
};
