# Shared Configuration System

This directory contains centralized configuration, constants, and services that are shared across all platforms (Web, iOS, Android).

## 📁 Directory Structure

```
shared/
├── config/
│   └── api.config.ts          # API endpoints and environment configuration
├── constants/
│   └── app.constants.ts       # App-wide constants (colors, settings, etc.)
└── services/
    ├── http.client.ts         # HTTP client with interceptors
    └── api.service.ts         # API service layer with type definitions
```

## 🎯 Purpose

**Single source of truth** for:
- API endpoints
- Color schemes
- Feature flags
- App settings
- HTTP requests
- Type definitions

## 🚀 Usage

### Web Application

```typescript
// Import in any React component
import { api } from '@/shared/services/api.service';
import { COLORS, FEATURE_FLAGS } from '@/shared/constants/app.constants';
import { getApiUrl } from '@/shared/config/api.config';

// Use the API
const fetchData = async () => {
  const records = await api.healthRecords.getAll();
  console.log(records);
};

// Use constants
const backgroundColor = COLORS.PRIMARY;
const isFeatureEnabled = FEATURE_FLAGS.HEALTH_RECORDS;
```

### Mobile Application (React Native)

```typescript
// Import in any React Native screen
import { api } from '../../../shared/services/api.service';
import { COLORS, INDIAN_CITIES } from '../../../shared/constants/app.constants';

// Use the API
const NewsScreen = () => {
  const [news, setNews] = useState([]);
  
  useEffect(() => {
    api.medicalNews.getLatest().then(setNews);
  }, []);
  
  return (
    <View style={{ backgroundColor: COLORS.PRIMARY }}>
      {/* ... */}
    </View>
  );
};
```

## 🔧 Configuration Files

### 1. `api.config.ts`

**Controls**: API endpoints and environment settings

```typescript
// Change environment
export const CURRENT_ENV = ENV.PRODUCTION; // or DEVELOPMENT, STAGING

// API will automatically use correct URL:
// - DEVELOPMENT: http://localhost:5000
// - STAGING: https://staging-api.medaid.com
// - PRODUCTION: https://api.medaid.com
```

**Update API URLs**:
```typescript
export const API_BASE_URLS = {
  development: 'http://localhost:5000',
  staging: 'https://your-staging-url.com',
  production: 'https://your-production-url.com',
};
```

### 2. `app.constants.ts`

**Controls**: Everything else (colors, features, settings)

```typescript
// Enable/Disable features globally
export const FEATURE_FLAGS = {
  HEALTH_RECORDS: true,
  MEDICINE_SCANNER: true,
  MEDICAL_NEWS: true,
  DISEASE_TRACKER: true,
  VACCINATION_REMINDERS: true,
  TELEMEDICINE: false, // Turn on when ready
};

// Change app colors globally
export const COLORS = {
  PRIMARY: '#4CAF50', // Change this = changes everywhere
  MEDICINE_SCANNER: '#9C27B0',
  MEDICAL_NEWS: '#2196F3',
  // ... etc
};

// Update app info
export const APP_INFO = {
  NAME: 'MedAid',
  VERSION: '1.0.0',
  SUPPORT_EMAIL: 'support@medaid.com',
};
```

### 3. `http.client.ts`

**Controls**: HTTP requests with automatic:
- Authentication token injection
- Request/response logging
- Error handling
- Retry logic
- Timeout management

### 4. `api.service.ts`

**Controls**: All API calls with:
- TypeScript type safety
- Centralized request logic
- Easy-to-use methods

## 📝 Examples

### Example 1: Change API URL for Production

```typescript
// In shared/config/api.config.ts
export const CURRENT_ENV = ENV.PRODUCTION;

// That's it! All platforms now use production API
```

### Example 2: Change Primary Color

```typescript
// In shared/constants/app.constants.ts
export const COLORS = {
  PRIMARY: '#FF5722', // Changed from green to red
  // ...
};

// All platforms automatically use new color
```

### Example 3: Disable a Feature

```typescript
// In shared/constants/app.constants.ts
export const FEATURE_FLAGS = {
  DISEASE_TRACKER: false, // Hide this feature
  // ...
};

// Check in components:
if (FEATURE_FLAGS.DISEASE_TRACKER) {
  // Show disease tracker
}
```

### Example 4: Fetch Health Records

```typescript
// Web or Mobile - same code!
import { api } from '../shared/services/api.service';

const MyComponent = () => {
  const [records, setRecords] = useState([]);
  
  useEffect(() => {
    // No need to write axios.get() or fetch()
    api.healthRecords.getAll()
      .then(setRecords)
      .catch(console.error);
  }, []);
  
  return <div>{/* Render records */}</div>;
};
```

### Example 5: Verify Medicine Barcode

```typescript
import { api } from '../shared/services/api.service';

const verifyMedicine = async (barcode: string) => {
  try {
    const result = await api.medicineChecker.verify(barcode);
    
    if (result.isAuthentic) {
      alert(`✓ Authentic: ${result.medicineName}`);
    } else {
      alert(`⚠️ Warning: Could not verify`);
    }
  } catch (error) {
    console.error('Verification failed:', error);
  }
};
```

## 🔄 Update Workflow

### To Change API Endpoint:

1. Open `shared/config/api.config.ts`
2. Update `API_BASE_URLS` or `API_ENDPOINTS`
3. Save file
4. **All platforms automatically updated!**

### To Change App Settings:

1. Open `shared/constants/app.constants.ts`
2. Update relevant constant
3. Save file
4. **All platforms automatically updated!**

### To Add New API Method:

1. Open `shared/services/api.service.ts`
2. Add type interface (if needed)
3. Add method to relevant API object
4. Use in components immediately

Example:
```typescript
// Add to api.service.ts
export const healthRecordsApi = {
  // ... existing methods
  
  // New method
  search: async (query: string): Promise<HealthRecord[]> => {
    return apiClient.get(`/api/health-records/search?q=${query}`);
  },
};

// Use in components
const results = await api.healthRecords.search('diabetes');
```

## ✅ Benefits

1. **Single Source of Truth**: Change once, update everywhere
2. **Type Safety**: Full TypeScript support
3. **Consistency**: Same colors, settings across platforms
4. **Easy Updates**: No need to search multiple files
5. **Error Handling**: Automatic retry and error logging
6. **Authentication**: Auto-inject auth tokens
7. **Environment Management**: Easy dev/staging/prod switching
8. **Feature Flags**: Turn features on/off globally

## 🎨 Color Reference

Update all colors in `app.constants.ts`:

```typescript
COLORS.PRIMARY          // Main app color (#4CAF50)
COLORS.HEALTH_RECORDS   // Health module (#4CAF50)
COLORS.MEDICINE_SCANNER // Scanner module (#9C27B0)
COLORS.MEDICAL_NEWS     // News module (#2196F3)
COLORS.DISEASE_TRACKER  // Disease module (#F44336)
COLORS.SUCCESS          // Success messages (#4CAF50)
COLORS.ERROR            // Error messages (#F44336)
COLORS.WARNING          // Warnings (#FF9800)
```

## 🔐 Security

- Auth tokens automatically attached to requests
- Sensitive data never logged in production
- HTTPS enforced in production
- Request timeout prevents hanging
- Retry logic for network failures

## 📱 Platform Compatibility

- ✅ **Web**: React components
- ✅ **iOS**: React Native
- ✅ **Android**: React Native
- ✅ **TypeScript**: Full support
- ✅ **JavaScript**: Works without types

## 🆘 Troubleshooting

**Issue**: Import error in mobile app

```typescript
// Wrong
import { api } from '@/shared/services/api.service';

// Correct (use relative path in mobile)
import { api } from '../../../shared/services/api.service';
```

**Issue**: API not responding

1. Check `CURRENT_ENV` in `api.config.ts`
2. Verify backend is running
3. Check console for error logs

**Issue**: Colors not updating

1. Restart dev server
2. Clear cache: `npm start -- --reset-cache`
3. Rebuild app

---

## 📚 Quick Reference

### Import Paths

**Web**:
```typescript
import { api } from '@/shared/services/api.service';
import { COLORS } from '@/shared/constants/app.constants';
```

**Mobile**:
```typescript
import { api } from '../../../shared/services/api.service';
import { COLORS } from '../../../shared/constants/app.constants';
```

### API Methods

```typescript
// Health Records
api.healthRecords.getAll()
api.healthRecords.getById(healthId)
api.healthRecords.create(data)
api.healthRecords.uploadDocument(id, formData)

// Medicine Checker
api.medicineChecker.verify(barcode)
api.medicineChecker.getHistory()
api.medicineChecker.getStats()

// Medical News
api.medicalNews.getLatest()
api.medicalNews.getByCategory(category)
api.medicalNews.refresh()

// Disease Tracker
api.diseaseTracker.getAll()
api.diseaseTracker.getByCity(city)
api.diseaseTracker.getBySeverity(level)

// Dashboard
api.dashboard.getSummary()
```

---

**Last Updated**: November 3, 2025  
**Version**: 1.0.0
