/**
 * Centralized App Constants
 * Update this file to change app-wide settings across all platforms
 */

// App Information
export const APP_INFO = {
  NAME: 'MedAid',
  FULL_NAME: 'MedAid Healthcare Platform',
  VERSION: '1.0.0',
  BUILD_NUMBER: 1,
  DESCRIPTION: 'Your Complete Healthcare Companion',
  SUPPORT_EMAIL: 'support@medaid.com',
  WEBSITE: 'https://medaid.com',
} as const;

// Feature Flags (Enable/Disable features globally)
export const FEATURE_FLAGS = {
  HEALTH_RECORDS: true,
  MEDICINE_SCANNER: true,
  MEDICAL_NEWS: true,
  DISEASE_TRACKER: true,
  VACCINATION_REMINDERS: true,
  TELEMEDICINE: false, // Coming soon
  APPOINTMENT_BOOKING: false, // Coming soon
  EMERGENCY_SOS: false, // Coming soon
} as const;

// Theme Colors (Consistent across platforms)
export const COLORS = {
  // Primary Colors
  PRIMARY: '#4CAF50',
  PRIMARY_DARK: '#388E3C',
  PRIMARY_LIGHT: '#C8E6C9',
  
  // Module Colors
  HEALTH_RECORDS: '#4CAF50',
  MEDICINE_SCANNER: '#9C27B0',
  MEDICAL_NEWS: '#2196F3',
  DISEASE_TRACKER: '#F44336',
  VACCINATION: '#FF9800',
  
  // Semantic Colors
  SUCCESS: '#4CAF50',
  ERROR: '#F44336',
  WARNING: '#FF9800',
  INFO: '#2196F3',
  
  // Neutral Colors
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  GRAY_LIGHT: '#F5F5F5',
  GRAY_MEDIUM: '#999999',
  GRAY_DARK: '#666666',
  
  // Severity Colors (Disease Tracker)
  SEVERITY_LOW: '#4CAF50',
  SEVERITY_MEDIUM: '#FF9800',
  SEVERITY_HIGH: '#FF5722',
  SEVERITY_CRITICAL: '#F44336',
  
  // Trend Colors
  TREND_UP: '#F44336',
  TREND_DOWN: '#4CAF50',
  TREND_STABLE: '#FF9800',
} as const;

// Blood Groups
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

// Disease Severity Levels
export const SEVERITY_LEVELS = ['low', 'medium', 'high', 'critical'] as const;

// Disease Trends
export const DISEASE_TRENDS = ['increasing', 'decreasing', 'stable'] as const;

// News Categories
export const NEWS_CATEGORIES = [
  'All',
  'Research',
  'Clinical Trial',
  'Review',
  'Case Study',
  'General',
] as const;

// Indian Cities (Disease Tracker)
export const INDIAN_CITIES = [
  'All',
  'Delhi',
  'Mumbai',
  'Bangalore',
  'Hyderabad',
  'Kolkata',
  'Chennai',
] as const;

// Pagination Settings
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  API: 'YYYY-MM-DD',
  FULL: 'MMMM DD, YYYY hh:mm A',
} as const;

// File Upload Settings
export const FILE_UPLOAD = {
  MAX_SIZE_MB: 10,
  MAX_SIZE_BYTES: 10 * 1024 * 1024,
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.pdf'],
} as const;

// Health ID Format
export const HEALTH_ID = {
  PREFIX: 'MHI',
  FORMAT: 'MHI-{timestamp}-{random}',
  REGEX: /^MHI-\d{13}-[A-Z0-9]{6}$/,
} as const;

// Barcode Settings
export const BARCODE = {
  TYPES: ['ean13', 'ean8', 'upc_e', 'code128', 'code39'],
  MIN_LENGTH: 8,
  MAX_LENGTH: 13,
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'medaid_auth_token',
  USER_DATA: 'medaid_user_data',
  THEME: 'medaid_theme',
  LANGUAGE: 'medaid_language',
  HEALTH_RECORDS: 'medaid_health_records',
  SCAN_HISTORY: 'medaid_scan_history',
  FAVORITES: 'medaid_favorites',
} as const;

// Notification Settings
export const NOTIFICATIONS = {
  ENABLED: true,
  VACCINATION_REMINDER_INTERVAL: 3600000, // 1 hour in milliseconds
  DISEASE_ALERT_THRESHOLD: 'high', // Show alerts for high/critical severity
} as const;

// Map Settings
export const MAP_SETTINGS = {
  DEFAULT_ZOOM: 12,
  MAX_ZOOM: 18,
  MIN_ZOOM: 5,
  DEFAULT_CENTER: {
    latitude: 28.6139, // Delhi
    longitude: 77.2090,
  },
} as const;

// External Links
export const EXTERNAL_LINKS = {
  PRIVACY_POLICY: 'https://medaid.com/privacy',
  TERMS_OF_SERVICE: 'https://medaid.com/terms',
  HELP_CENTER: 'https://help.medaid.com',
  FEEDBACK: 'https://medaid.com/feedback',
  GITHUB: 'https://github.com/medaid/mobile',
} as const;

// Contact Information
export const CONTACT = {
  EMAIL: 'support@medaid.com',
  PHONE: '+91-1800-123-4567',
  ADDRESS: 'MedAid Headquarters, New Delhi, India',
} as const;

// Social Media
export const SOCIAL_MEDIA = {
  FACEBOOK: 'https://facebook.com/medaid',
  TWITTER: 'https://twitter.com/medaid',
  INSTAGRAM: 'https://instagram.com/medaid',
  LINKEDIN: 'https://linkedin.com/company/medaid',
} as const;

export default {
  APP_INFO,
  FEATURE_FLAGS,
  COLORS,
  BLOOD_GROUPS,
  SEVERITY_LEVELS,
  DISEASE_TRENDS,
  NEWS_CATEGORIES,
  INDIAN_CITIES,
  PAGINATION,
  DATE_FORMATS,
  FILE_UPLOAD,
  HEALTH_ID,
  BARCODE,
  STORAGE_KEYS,
  NOTIFICATIONS,
  MAP_SETTINGS,
  EXTERNAL_LINKS,
  CONTACT,
  SOCIAL_MEDIA,
};
