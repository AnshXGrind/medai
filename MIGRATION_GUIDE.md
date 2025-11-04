# Migration Guide: Converting Existing Code to Centralized System

## Overview

This guide shows you how to convert your existing MedAid components to use the new centralized configuration system.

---

## 🔄 Step-by-Step Migration

### Step 1: Replace Hardcoded API URLs

#### Before:
```typescript
// ❌ OLD: Hardcoded API URL
const API_URL = 'http://localhost:5000/api';

const response = await axios.get(`${API_URL}/health-records/all`);
const records = response.data;
```

#### After:
```typescript
// ✅ NEW: Centralized API
import { api } from '../shared/services/api.service';

const records = await api.healthRecords.getAll();
```

---

### Step 2: Replace Hardcoded Colors

#### Before:
```typescript
// ❌ OLD: Hardcoded colors
<div style={{ backgroundColor: '#4CAF50' }}>
<span style={{ color: '#F44336' }}>Error</span>
<button style={{ backgroundColor: '#9C27B0' }}>Scan</button>
```

#### After:
```typescript
// ✅ NEW: Centralized colors
import { COLORS } from '../shared/constants/app.constants';

<div style={{ backgroundColor: COLORS.PRIMARY }}>
<span style={{ color: COLORS.ERROR }}>Error</span>
<button style={{ backgroundColor: COLORS.MEDICINE_SCANNER }}>Scan</button>
```

---

### Step 3: Replace Hardcoded Arrays

#### Before:
```typescript
// ❌ OLD: Hardcoded blood groups
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// ❌ OLD: Hardcoded cities
const cities = ['All', 'Delhi', 'Mumbai', 'Bangalore'];

// ❌ OLD: Hardcoded categories
const categories = ['All', 'Research', 'Clinical Trial'];
```

#### After:
```typescript
// ✅ NEW: Centralized arrays
import { BLOOD_GROUPS, INDIAN_CITIES, NEWS_CATEGORIES } from '../shared/constants/app.constants';

// Use directly
{BLOOD_GROUPS.map(bg => <option key={bg}>{bg}</option>)}
{INDIAN_CITIES.map(city => <Button key={city}>{city}</Button>)}
{NEWS_CATEGORIES.map(cat => <Tab key={cat}>{cat}</Tab>)}
```

---

### Step 4: Replace Manual Axios Calls

#### Before:
```typescript
// ❌ OLD: Manual axios configuration
const fetchNews = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/medical-news/latest', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      timeout: 30000
    });
    
    if (response.status === 200) {
      setNews(response.data);
    }
  } catch (error) {
    if (error.response?.status === 401) {
      // Handle unauthorized
    } else if (error.response?.status === 500) {
      // Handle server error
    }
    console.error('Error:', error);
  }
};
```

#### After:
```typescript
// ✅ NEW: Centralized API (handles everything automatically!)
import { api } from '../shared/services/api.service';

const fetchNews = async () => {
  try {
    // Auth token, headers, timeout, error handling all automatic!
    const news = await api.medicalNews.getLatest();
    setNews(news);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

### Step 5: Replace File Upload Logic

#### Before:
```typescript
// ❌ OLD: Manual validation
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

const handleFileUpload = (file: File) => {
  if (file.size > MAX_FILE_SIZE) {
    alert('File too large');
    return;
  }
  
  if (!ALLOWED_TYPES.includes(file.type)) {
    alert('Invalid file type');
    return;
  }
  
  // Upload logic...
};
```

#### After:
```typescript
// ✅ NEW: Centralized validation
import { FILE_UPLOAD } from '../shared/constants/app.constants';
import { api } from '../shared/services/api.service';

const handleFileUpload = async (file: File, recordId: string) => {
  if (file.size > FILE_UPLOAD.MAX_SIZE_BYTES) {
    alert(`File must be less than ${FILE_UPLOAD.MAX_SIZE_MB}MB`);
    return;
  }
  
  if (!FILE_UPLOAD.ALLOWED_TYPES.includes(file.type)) {
    alert(`Allowed types: ${FILE_UPLOAD.ALLOWED_EXTENSIONS.join(', ')}`);
    return;
  }
  
  const formData = new FormData();
  formData.append('document', file);
  
  await api.healthRecords.uploadDocument(recordId, formData);
};
```

---

### Step 6: Add Feature Flags

#### Before:
```typescript
// ❌ OLD: Always shows feature
return (
  <div>
    <HealthRecords />
    <MedicineScanner />
    <DiseaseTracker />
  </div>
);
```

#### After:
```typescript
// ✅ NEW: Feature flags control visibility
import { FEATURE_FLAGS } from '../shared/constants/app.constants';

return (
  <div>
    {FEATURE_FLAGS.HEALTH_RECORDS && <HealthRecords />}
    {FEATURE_FLAGS.MEDICINE_SCANNER && <MedicineScanner />}
    {FEATURE_FLAGS.DISEASE_TRACKER && <DiseaseTracker />}
  </div>
);
```

---

## 📝 Complete Module Migration Example

### Before: DigitalHealthRecordHub.tsx

```typescript
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function DigitalHealthRecordHub() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/health-records/all`);
      setRecords(response.data);
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  };

  const createRecord = async (data: any) => {
    try {
      const response = await axios.post(`${API_URL}/health-records/create`, data);
      alert(`Health ID: ${response.data.healthId}`);
      fetchRecords();
    } catch (error) {
      console.error('Error creating record:', error);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5' }}>
      <h1 style={{ color: '#4CAF50' }}>Health Records</h1>
      
      <select>
        {bloodGroups.map((bg) => (
          <option key={bg} value={bg}>{bg}</option>
        ))}
      </select>

      {/* Rest of component... */}
    </div>
  );
}
```

### After: DigitalHealthRecordHub.tsx (Migrated)

```typescript
import React, { useState, useEffect } from 'react';
import { api } from '../shared/services/api.service';
import { COLORS, BLOOD_GROUPS } from '../shared/constants/app.constants';
import type { HealthRecord } from '../shared/services/api.service';

export default function DigitalHealthRecordHub() {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const data = await api.healthRecords.getAll();
      setRecords(data);
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  };

  const createRecord = async (formData: Partial<HealthRecord>) => {
    try {
      const newRecord = await api.healthRecords.create(formData);
      alert(`Health ID: ${newRecord.healthId}`);
      fetchRecords();
    } catch (error) {
      console.error('Error creating record:', error);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: COLORS.GRAY_LIGHT }}>
      <h1 style={{ color: COLORS.HEALTH_RECORDS }}>Health Records</h1>
      
      <select>
        {BLOOD_GROUPS.map((bg) => (
          <option key={bg} value={bg}>{bg}</option>
        ))}
      </select>

      {/* Rest of component... */}
    </div>
  );
}
```

---

## 🎯 Quick Migration Checklist

For each component/screen, update:

- [ ] Replace `axios` imports with `api` service
- [ ] Replace hardcoded API URLs with `api.*` methods
- [ ] Replace color hex codes with `COLORS.*`
- [ ] Replace blood group arrays with `BLOOD_GROUPS`
- [ ] Replace city arrays with `INDIAN_CITIES`
- [ ] Replace category arrays with `NEWS_CATEGORIES`
- [ ] Replace severity levels with `SEVERITY_LEVELS`
- [ ] Replace trend types with `DISEASE_TRENDS`
- [ ] Add feature flags where appropriate
- [ ] Replace file upload validation with `FILE_UPLOAD.*`
- [ ] Add TypeScript types from `api.service.ts`
- [ ] Remove manual error handling (it's automatic now!)

---

## 📦 Import Reference

### For Web Components:
```typescript
import { api } from '../shared/services/api.service';
import { 
  COLORS, 
  BLOOD_GROUPS, 
  INDIAN_CITIES,
  NEWS_CATEGORIES,
  SEVERITY_LEVELS,
  DISEASE_TRENDS,
  FEATURE_FLAGS,
  FILE_UPLOAD,
  APP_INFO
} from '../shared/constants/app.constants';
import type { 
  HealthRecord, 
  MedicineVerification, 
  MedicalNews, 
  DiseaseData 
} from '../shared/services/api.service';
```

### For Mobile Screens:
```typescript
import { api } from '../../../shared/services/api.service';
import { 
  COLORS, 
  BLOOD_GROUPS, 
  INDIAN_CITIES,
  // ... etc
} from '../../../shared/constants/app.constants';
```

---

## 🔍 Find & Replace Guide

Use your editor's find & replace to speed up migration:

| Find | Replace With |
|------|--------------|
| `'http://localhost:5000'` | Remove (use `api.*` methods) |
| `axios.get(` | `api.*` (find appropriate method) |
| `axios.post(` | `api.*` (find appropriate method) |
| `'#4CAF50'` | `COLORS.PRIMARY` or `COLORS.HEALTH_RECORDS` |
| `'#9C27B0'` | `COLORS.MEDICINE_SCANNER` |
| `'#2196F3'` | `COLORS.MEDICAL_NEWS` |
| `'#F44336'` | `COLORS.ERROR` or `COLORS.DISEASE_TRACKER` |
| `'#FF9800'` | `COLORS.WARNING` |
| `['A+', 'A-', 'B+',` | `BLOOD_GROUPS` |
| `['All', 'Delhi', 'Mumbai',` | `INDIAN_CITIES` |
| `['All', 'Research', 'Clinical Trial',` | `NEWS_CATEGORIES` |

---

## 🧪 Testing After Migration

After migrating, test:

1. **API Calls Work**
   ```typescript
   // Test in console
   import { api } from './shared/services/api.service';
   api.healthRecords.getAll().then(console.log);
   ```

2. **Colors Render Correctly**
   - Check all buttons, headers, badges
   - Verify consistency across screens

3. **Arrays Populate Correctly**
   - Check dropdowns, filters, buttons
   - Verify all options appear

4. **Feature Flags Work**
   - Toggle a flag to `false`
   - Verify feature hides

5. **File Upload Validation**
   - Try uploading oversized file
   - Try uploading wrong file type

---

## 🚀 Benefits After Migration

✅ **Easier Updates**: Change API URL in 1 place  
✅ **Consistent Colors**: Same colors everywhere  
✅ **Type Safety**: Full TypeScript support  
✅ **Less Code**: No more axios boilerplate  
✅ **Auto Error Handling**: Retries and logging built-in  
✅ **Auto Auth**: Tokens injected automatically  
✅ **Feature Control**: Easy enable/disable  
✅ **Better Maintenance**: Single source of truth  

---

## 📚 Next Steps

1. Start with one module (e.g., HealthRecords)
2. Test thoroughly
3. Migrate remaining modules one by one
4. Update mobile screens
5. Remove old axios imports
6. Delete hardcoded constants

---

**Need Help?** Check:
- `shared/README.md` - Full documentation
- `shared/examples/` - Complete examples
- `CENTRALIZED_UPDATE_GUIDE.md` - Update guide

---

**Created**: November 3, 2025  
**Version**: 1.0.0
