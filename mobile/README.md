# MedAid Mobile App

React Native mobile application for MedAid healthcare platform with iOS and Android support.

## Features

- 📱 **Cross-platform**: Works on both iOS and Android
- 🏥 **Health Records**: Digital health ID and document management
- 💊 **Medicine Scanner**: Barcode scanning for medicine verification
- 📰 **Medical News**: Latest research and health updates
- 🗺️ **Disease Tracker**: Real-time disease outbreak monitoring
- 🔒 **Secure**: Encrypted data storage and transmission

## Technology Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation (Bottom Tabs + Stack)
- **UI Components**: React Native core components
- **Icons**: Expo Vector Icons (Ionicons)
- **HTTP Client**: Axios
- **Camera**: Expo Camera & Barcode Scanner
- **Location**: Expo Location
- **Document Picker**: Expo Document Picker

## Prerequisites

- Node.js 16+ and npm/yarn
- Expo CLI: `npm install -g expo-cli`
- iOS: Xcode 13+ (macOS only)
- Android: Android Studio with Android SDK

## Installation

1. Navigate to mobile directory:
```bash
cd mobile
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

## Running on Devices

### iOS (macOS only)
```bash
npm run ios
```

### Android
```bash
npm run android
```

### Web Browser (for testing)
```bash
npm run web
```

## Project Structure

```
mobile/
├── src/
│   └── screens/
│       ├── HomeScreen.tsx              # Dashboard with module cards
│       ├── HealthRecordsScreen.tsx     # Health ID management
│       ├── MedicineScannerScreen.tsx   # Barcode scanner
│       ├── NewsScreen.tsx              # Medical news feed
│       ├── DiseaseTrackerScreen.tsx    # Disease monitoring
│       └── ProfileScreen.tsx           # User profile
├── App.tsx                             # Main navigation setup
├── app.json                            # Expo configuration
├── package.json                        # Dependencies
└── tsconfig.json                       # TypeScript config
```

## Key Components

### 1. Home Screen
- Quick stats dashboard
- Module shortcuts (Health Records, Scanner, News, Disease Tracker)
- Feature highlights
- Navigation to all modules

### 2. Health Records Screen
- Create Health ID with unique identifier
- Blood group selection (A+, A-, B+, B-, AB+, AB-, O+, O-)
- Allergies and chronic conditions tracking
- Document upload (images, PDFs)
- Record viewing and management

### 3. Medicine Scanner Screen
- Camera barcode scanning
- Manual barcode entry
- Authenticity verification
- Manufacturer details
- Batch number and expiry date
- Scan history with 5 recent verifications

### 4. News Screen
- Medical research articles
- Category filters (Research, Clinical Trial, Review, Case Study, General)
- Keyword search
- AI-generated summaries
- Author information and publication dates
- External links to full articles

### 5. Disease Tracker Screen
- GPS location detection
- City filters (Delhi, Mumbai, Bangalore, Hyderabad, Kolkata, Chennai)
- Disease severity levels (Low, Medium, High, Critical)
- Case counts and trends (Increasing, Decreasing, Stable)
- Real-time statistics dashboard
- High-risk area alerts

### 6. Profile Screen
- User information
- Account settings
- Privacy & security options
- Notification preferences
- Language selection
- Theme toggle (Light/Dark mode)
- Help center and support

## API Configuration

The app connects to the backend API at `http://localhost:5000/api` by default.

To change the API URL, update the `API_URL` constant in each screen file:

```typescript
const API_URL = 'https://your-production-api.com/api';
```

## Permissions Required

### iOS (Info.plist)
- **Camera**: Medicine barcode scanning
- **Location**: Disease tracking based on user location

### Android (AndroidManifest.xml)
- **CAMERA**: Barcode scanning
- **ACCESS_FINE_LOCATION**: GPS location
- **ACCESS_COARSE_LOCATION**: Approximate location
- **READ_EXTERNAL_STORAGE**: Document uploads
- **WRITE_EXTERNAL_STORAGE**: Document storage

## Building for Production

### Android APK
```bash
npm run build:android
```

### iOS IPA (macOS only)
```bash
npm run build:ios
```

## Testing

### Run on iOS Simulator (macOS)
```bash
expo start --ios
```

### Run on Android Emulator
```bash
expo start --android
```

### Physical Device Testing
1. Install **Expo Go** app from App Store/Play Store
2. Scan the QR code shown in terminal
3. App will load on your device

## Troubleshooting

### Dependencies not found
```bash
cd mobile
rm -rf node_modules package-lock.json
npm install
```

### Metro bundler cache issues
```bash
expo start -c
```

### iOS build errors
```bash
cd ios
pod install
cd ..
npm run ios
```

### Android build errors
```bash
cd android
./gradlew clean
cd ..
npm run android
```

## Environment Variables

Create a `.env` file in the mobile directory:

```env
API_URL=http://localhost:5000/api
GOOGLE_MAPS_API_KEY=your_api_key_here
```

## Features Comparison

| Feature | Web App | Mobile App |
|---------|---------|------------|
| Health Records | ✅ | ✅ |
| Medicine Scanner | ✅ (Simulated) | ✅ (Real Camera) |
| Medical News | ✅ | ✅ |
| Disease Tracker | ✅ | ✅ (GPS) |
| Offline Support | ❌ | ⏳ Coming Soon |
| Push Notifications | ❌ | ⏳ Coming Soon |

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Email: support@medaid.com
- GitHub Issues: [github.com/medaid/mobile/issues](https://github.com/medaid/mobile/issues)
- Documentation: [docs.medaid.com](https://docs.medaid.com)

## Roadmap

- [ ] Offline mode with local storage
- [ ] Push notifications for health reminders
- [ ] Biometric authentication
- [ ] Health data export (PDF reports)
- [ ] Telemedicine video calls
- [ ] Appointment booking
- [ ] Prescription management
- [ ] Emergency SOS with location sharing

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Platform**: iOS 13+, Android 6.0+
