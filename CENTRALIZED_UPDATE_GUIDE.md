# 🔄 Centralized Update System - Complete Guide

## Overview

MedAid now has a **unified configuration system** that allows you to update settings, API endpoints, colors, and features across **all platforms** (Web, iOS, Android) from a **single location**.

---

## 📁 What Was Created

### New Directory: `/shared`

```
shared/
├── config/
│   └── api.config.ts           # API endpoints & environment
├── constants/
│   └── app.constants.ts        # Colors, settings, feature flags
├── services/
│   ├── http.client.ts          # HTTP client with interceptors
│   └── api.service.ts          # API methods with types
└── README.md                   # Documentation
```

---

## 🎯 How to Update Settings Globally

### 1️⃣ Change API URL (All Platforms)

**File**: `shared/config/api.config.ts`

```typescript
// Change this ONE line to switch environments
export const CURRENT_ENV = ENV.PRODUCTION;

// Or update the URL itself
export const API_BASE_URLS = {
  development: 'http://localhost:5000',
  staging: 'https://staging.yourapi.com',     // ← Update here
  production: 'https://api.yourcompany.com',  // ← Update here
};
```

**Result**: All platforms (web, iOS, Android) now use the new API URL automatically.

---

### 2️⃣ Change App Colors (All Platforms)

**File**: `shared/constants/app.constants.ts`

```typescript
export const COLORS = {
  PRIMARY: '#FF5722',              // ← Change main color here
  HEALTH_RECORDS: '#4CAF50',
  MEDICINE_SCANNER: '#9C27B0',
  MEDICAL_NEWS: '#2196F3',
  DISEASE_TRACKER: '#F44336',
  // ... etc
};
```

**Result**: Every screen on every platform now uses the new colors.

---

### 3️⃣ Enable/Disable Features (All Platforms)

**File**: `shared/constants/app.constants.ts`

```typescript
export const FEATURE_FLAGS = {
  HEALTH_RECORDS: true,
  MEDICINE_SCANNER: true,
  MEDICAL_NEWS: true,
  DISEASE_TRACKER: false,          // ← Turn off this feature
  VACCINATION_REMINDERS: true,
  TELEMEDICINE: false,             // ← Coming soon, keep disabled
};
```

**Result**: Features can be hidden/shown across all platforms instantly.

---

### 4️⃣ Update App Information (All Platforms)

**File**: `shared/constants/app.constants.ts`

```typescript
export const APP_INFO = {
  NAME: 'MedAid Pro',                        // ← Update name
  VERSION: '2.0.0',                          // ← Update version
  SUPPORT_EMAIL: 'help@yourcompany.com',     // ← Update email
  WEBSITE: 'https://yourcompany.com',        // ← Update website
};
```

**Result**: App info updated everywhere (headers, footers, about screens).

---

### 5️⃣ Change Cities/Categories (All Platforms)

**File**: `shared/constants/app.constants.ts`

```typescript
// Add or remove cities
export const INDIAN_CITIES = [
  'All',
  'Delhi',
  'Mumbai',
  'Bangalore',
  'Pune',              // ← Add new city
  'Ahmedabad',         // ← Add new city
];

// Add or remove news categories
export const NEWS_CATEGORIES = [
  'All',
  'Research',
  'Clinical Trial',
  'Review',
  'Case Study',
  'General',
  'Breaking News',     // ← Add new category
];
```

**Result**: Filters updated on all platforms automatically.

---

## 💻 How to Use in Code

### Web Application (React)

```typescript
// Import the API service
import { api } from '@/shared/services/api.service';
import { COLORS, FEATURE_FLAGS } from '@/shared/constants/app.constants';

// Fetch data (no axios needed!)
const MyComponent = () => {
  const [records, setRecords] = useState([]);
  
  useEffect(() => {
    api.healthRecords.getAll().then(setRecords);
  }, []);
  
  // Use centralized colors
  return (
    <div style={{ backgroundColor: COLORS.PRIMARY }}>
      {FEATURE_FLAGS.HEALTH_RECORDS && (
        <HealthRecordsModule />
      )}
    </div>
  );
};
```

---

### Mobile Application (React Native)

```typescript
// Import with relative path
import { api } from '../../../shared/services/api.service';
import { COLORS, INDIAN_CITIES } from '../../../shared/constants/app.constants';

// Fetch data (same API as web!)
const DiseaseTrackerScreen = () => {
  const [diseases, setDiseases] = useState([]);
  
  useEffect(() => {
    api.diseaseTracker.getAll().then(setDiseases);
  }, []);
  
  return (
    <View style={{ backgroundColor: COLORS.DISEASE_TRACKER }}>
      {INDIAN_CITIES.map(city => (
        <Button key={city} title={city} />
      ))}
    </View>
  );
};
```

---

## 🔧 Common Use Cases

### Use Case 1: Switch to Production API

```typescript
// In shared/config/api.config.ts
export const CURRENT_ENV = ENV.PRODUCTION;
```

✅ Done! All apps now hit production API.

---

### Use Case 2: Rebrand App Colors

```typescript
// In shared/constants/app.constants.ts
export const COLORS = {
  PRIMARY: '#1E88E5',           // Blue theme
  SUCCESS: '#43A047',
  ERROR: '#E53935',
  // ... update all colors
};
```

✅ Done! Entire app rebranded on all platforms.

---

### Use Case 3: Hide Feature Temporarily

```typescript
// In shared/constants/app.constants.ts
export const FEATURE_FLAGS = {
  MEDICINE_SCANNER: false,  // Hide scanner while fixing bug
};

// In components (all platforms)
if (FEATURE_FLAGS.MEDICINE_SCANNER) {
  return <ScannerComponent />;
}
return null; // Feature hidden
```

✅ Done! Scanner hidden on web, iOS, and Android.

---

### Use Case 4: Add New City to Disease Tracker

```typescript
// In shared/constants/app.constants.ts
export const INDIAN_CITIES = [
  'All',
  'Delhi',
  'Mumbai',
  'Bangalore',
  'Hyderabad',
  'Kolkata',
  'Chennai',
  'Pune',        // ← New city added
];
```

✅ Done! City appears in filters on all platforms.

---

### Use Case 5: Update Support Email

```typescript
// In shared/constants/app.constants.ts
export const APP_INFO = {
  SUPPORT_EMAIL: 'help@newcompany.com',
};

// Use in components
import { APP_INFO } from '@/shared/constants/app.constants';

const ContactScreen = () => (
  <a href={`mailto:${APP_INFO.SUPPORT_EMAIL}`}>
    Email Support
  </a>
);
```

✅ Done! Email updated everywhere.

---

## 📡 API Usage Examples

### Health Records

```typescript
import { api } from '../shared/services/api.service';

// Get all records
const records = await api.healthRecords.getAll();

// Get specific record
const record = await api.healthRecords.getById('MHI-123456');

// Create new record
const newRecord = await api.healthRecords.create({
  fullName: 'John Doe',
  dateOfBirth: '1990-01-01',
  bloodGroup: 'O+',
  allergies: ['Penicillin'],
  chronicConditions: [],
});

// Upload document
const formData = new FormData();
formData.append('document', file);
await api.healthRecords.uploadDocument(recordId, formData);
```

---

### Medicine Verification

```typescript
import { api } from '../shared/services/api.service';

// Verify barcode
const result = await api.medicineChecker.verify('8901234567890');

if (result.isAuthentic) {
  console.log(`✓ Authentic: ${result.medicineName}`);
} else {
  console.log(`⚠️ Could not verify`);
}

// Get scan history
const history = await api.medicineChecker.getHistory();

// Get statistics
const stats = await api.medicineChecker.getStats();
```

---

### Medical News

```typescript
import { api } from '../shared/services/api.service';

// Get latest news
const news = await api.medicalNews.getLatest();

// Get by category
const research = await api.medicalNews.getByCategory('research');

// Refresh feed
const updated = await api.medicalNews.refresh();
```

---

### Disease Tracker

```typescript
import { api } from '../shared/services/api.service';

// Get all disease data
const diseases = await api.diseaseTracker.getAll();

// Get by city
const delhiDiseases = await api.diseaseTracker.getByCity('Delhi');

// Get by severity
const critical = await api.diseaseTracker.getBySeverity('critical');
```

---

### Dashboard Summary

```typescript
import { api } from '../shared/services/api.service';

// Get complete summary
const summary = await api.dashboard.getSummary();

console.log(summary);
// {
//   healthRecords: { total: 150, recentlyAdded: 5 },
//   medicineScans: { total: 500, authentic: 480, authenticPercentage: 96 },
//   news: { total: 100, today: 5 },
//   diseases: { total: 18, highRisk: 3, locationsTracked: 6 }
// }
```

---

## 🎨 Available Constants

### Colors
```typescript
COLORS.PRIMARY
COLORS.SUCCESS
COLORS.ERROR
COLORS.WARNING
COLORS.INFO
COLORS.HEALTH_RECORDS
COLORS.MEDICINE_SCANNER
COLORS.MEDICAL_NEWS
COLORS.DISEASE_TRACKER
COLORS.SEVERITY_LOW
COLORS.SEVERITY_MEDIUM
COLORS.SEVERITY_HIGH
COLORS.SEVERITY_CRITICAL
```

### Arrays
```typescript
BLOOD_GROUPS              // ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
SEVERITY_LEVELS           // ['low', 'medium', 'high', 'critical']
DISEASE_TRENDS            // ['increasing', 'decreasing', 'stable']
NEWS_CATEGORIES           // ['All', 'Research', 'Clinical Trial', ...]
INDIAN_CITIES             // ['All', 'Delhi', 'Mumbai', ...]
```

### Settings
```typescript
APP_INFO.NAME
APP_INFO.VERSION
APP_INFO.SUPPORT_EMAIL
FEATURE_FLAGS.*
FILE_UPLOAD.MAX_SIZE_MB
PAGINATION.DEFAULT_PAGE_SIZE
```

---

## 🚀 Deployment Checklist

### Before Going to Production:

1. **Update API URL**
   ```typescript
   // shared/config/api.config.ts
   export const CURRENT_ENV = ENV.PRODUCTION;
   export const API_BASE_URLS = {
     production: 'https://api.yourcompany.com',
   };
   ```

2. **Update App Info**
   ```typescript
   // shared/constants/app.constants.ts
   export const APP_INFO = {
     VERSION: '1.0.0',
     SUPPORT_EMAIL: 'support@yourcompany.com',
     WEBSITE: 'https://yourcompany.com',
   };
   ```

3. **Enable Production Features**
   ```typescript
   // shared/constants/app.constants.ts
   export const FEATURE_FLAGS = {
     HEALTH_RECORDS: true,
     MEDICINE_SCANNER: true,
     MEDICAL_NEWS: true,
     DISEASE_TRACKER: true,
     VACCINATION_REMINDERS: true,
   };
   ```

4. **Update External Links**
   ```typescript
   // shared/constants/app.constants.ts
   export const EXTERNAL_LINKS = {
     PRIVACY_POLICY: 'https://yourcompany.com/privacy',
     TERMS_OF_SERVICE: 'https://yourcompany.com/terms',
     HELP_CENTER: 'https://help.yourcompany.com',
   };
   ```

---

## 🔄 Migration Guide

### Migrate Existing Code

**Before** (Old way):
```typescript
// Hardcoded API URL
const response = await axios.get('http://localhost:5000/api/health-records/all');
const records = response.data;

// Hardcoded color
<div style={{ backgroundColor: '#4CAF50' }}>
```

**After** (New centralized way):
```typescript
// Use centralized API
import { api } from '@/shared/services/api.service';
import { COLORS } from '@/shared/constants/app.constants';

const records = await api.healthRecords.getAll();

<div style={{ backgroundColor: COLORS.PRIMARY }}>
```

---

## 📚 Documentation Files

1. **`shared/README.md`** - Full documentation of the shared system
2. **`CENTRALIZED_UPDATE_GUIDE.md`** - This file (how to update globally)
3. **`shared/config/api.config.ts`** - API configuration with comments
4. **`shared/constants/app.constants.ts`** - All constants with comments
5. **`shared/services/api.service.ts`** - API methods with TypeScript types

---

## ✅ Benefits Summary

| Benefit | Before | After |
|---------|--------|-------|
| **Update API URL** | Change in 20+ files | Change in 1 file |
| **Change Colors** | Search entire codebase | Update 1 constant |
| **Toggle Features** | Comment out code | Set flag to false |
| **Type Safety** | Manual type checking | Full TypeScript support |
| **Error Handling** | Manual try/catch | Automatic with retries |
| **Authentication** | Manual token handling | Automatic injection |
| **Code Duplication** | Lots of axios calls | Single API service |
| **Platform Sync** | Manual updates | Automatic everywhere |

---

## 🆘 Troubleshooting

### Issue: Import errors in mobile app

**Solution**: Use relative paths in mobile
```typescript
// Mobile
import { api } from '../../../shared/services/api.service';

// Web (with path alias)
import { api } from '@/shared/services/api.service';
```

---

### Issue: API not responding

**Solution**: Check environment setting
```typescript
// shared/config/api.config.ts
console.log('Current API:', getApiUrl());
// Verify it's correct
```

---

### Issue: Colors not updating

**Solution**: Restart dev servers
```bash
# Web
npm run dev

# Mobile
cd mobile
npm start -- --reset-cache
```

---

## 🎉 Summary

You now have a **centralized configuration system** that allows you to:

✅ Update API URLs for all platforms from 1 file  
✅ Change app colors globally from 1 file  
✅ Enable/disable features with feature flags  
✅ Use type-safe API methods  
✅ Automatic error handling and retries  
✅ Consistent settings across web, iOS, Android  
✅ Easy maintenance and updates  

**To update settings on all platforms, just edit files in `/shared` directory!**

---

**Created**: November 3, 2025  
**Version**: 1.0.0  
**Platforms**: Web ✅ | iOS ✅ | Android ✅
