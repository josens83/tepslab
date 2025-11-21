# TEPS Lab Mobile App

프리미엄 TEPS 학습 플랫폼 React Native 모바일 앱

## 📱 Features

### Core Features
- ✅ 강좌 탐색 및 수강
- ✅ 비디오 강의 시청
- ✅ 학습 진도 추적
- ✅ AI 튜터 챗봇
- ✅ 진단 테스트 및 문제 풀이
- ✅ 오프라인 학습 모드
- ✅ 푸시 알림
- ✅ 학습 통계 및 분석

### Technical Features
- React Native 0.73.2
- TypeScript
- React Navigation 6.x
- React Native Paper (Material Design)
- Firebase Cloud Messaging (FCM)
- SQLite for offline storage
- AsyncStorage for app data
- Zustand for state management

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- npm >= 9
- React Native CLI
- **iOS**: Xcode 14+, CocoaPods
- **Android**: Android Studio, JDK 11+

### Installation

```bash
# Clone the repository
cd mobile

# Install dependencies
npm install

# iOS specific
cd ios && pod install && cd ..

# Android specific (no additional steps needed)
```

### Environment Setup

Create `.env` file:
```bash
# API Configuration
API_URL=https://api.tepslab.com

# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_APP_ID=your_firebase_app_id
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
```

---

## 📲 Running the App

### Development

```bash
# Start Metro bundler
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

### Production Build

#### Android

```bash
# Generate release APK
cd android
./gradlew assembleRelease

# Output: android/app/build/outputs/apk/release/app-release.apk

# Generate AAB for Play Store
./gradlew bundleRelease

# Output: android/app/build/outputs/bundle/release/app-release.aab
```

#### iOS

```bash
# Open Xcode
open ios/TepsLab.xcworkspace

# Select "Generic iOS Device" or your device
# Product > Archive
# Distribute App > App Store Connect
```

---

## 🔧 Configuration

### Android

**build.gradle** (`android/app/build.gradle`):
```gradle
android {
    defaultConfig {
        applicationId "com.tepslab.app"
        minSdkVersion 23
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
    }

    signingConfigs {
        release {
            storeFile file('release.keystore')
            storePassword 'your-store-password'
            keyAlias 'your-key-alias'
            keyPassword 'your-key-password'
        }
    }
}
```

**Generate keystore**:
```bash
keytool -genkey -v -keystore release.keystore -alias tepslab-release \
  -keyalg RSA -keysize 2048 -validity 10000
```

### iOS

**Info.plist**:
- Privacy - Camera Usage Description
- Privacy - Microphone Usage Description
- Privacy - Photo Library Usage Description

**Signing**:
1. Add Apple Developer account in Xcode
2. Select team in Signing & Capabilities
3. Enable Push Notifications capability

---

## 📦 App Store Submission

### Google Play Store

1. **Prepare**:
   - Create app in Google Play Console
   - Fill app information, screenshots, descriptions
   - Set content rating, privacy policy
   - Create release (internal testing → production)

2. **Upload**:
   ```bash
   cd android
   ./gradlew bundleRelease
   ```
   Upload `app-release.aab` to Play Console

3. **Requirements**:
   - Privacy policy URL
   - App icon (512x512 px)
   - Feature graphic (1024x500 px)
   - Screenshots (phone, tablet, 7-inch tablet)
   - Short description (80 chars max)
   - Full description (4000 chars max)

### Apple App Store

1. **Prepare**:
   - Create app in App Store Connect
   - Fill app information
   - Set categories, keywords
   - Add screenshots for all device sizes

2. **Upload**:
   - Archive in Xcode
   - Validate → Upload to App Store
   - TestFlight for beta testing

3. **Requirements**:
   - App icon (1024x1024 px)
   - Screenshots (6.5", 5.5", 12.9")
   - Privacy policy URL
   - App description (4000 chars max)
   - Keywords (100 chars max)
   - Promotional text (170 chars)

---

## 🔔 Push Notifications

### Firebase Setup

1. Create Firebase project
2. Add iOS and Android apps
3. Download config files:
   - `google-services.json` → `android/app/`
   - `GoogleService-Info.plist` → `ios/TepsLab/`

4. Configure FCM:
   ```typescript
   // Already implemented in:
   // src/services/notificationService.ts
   ```

### Backend Integration

Send notifications via Firebase Admin SDK:
```typescript
// Server-side (already in backend)
await admin.messaging().send({
  token: deviceToken,
  notification: {
    title: '새 강의 업데이트',
    body: 'TEPS 문법 강의가 추가되었습니다.',
  },
  data: {
    type: 'new_course',
    courseId: '123',
  },
});
```

---

## 📦 Offline Mode

### Storage Strategy

- **SQLite**: Course content, lessons, videos
- **AsyncStorage**: User preferences, auth tokens
- **FileSystem**: Downloaded video files

### Implementation

```typescript
// Download course for offline
await downloadCourseOffline(courseId, courseData);

// Get offline courses
const courses = await getOfflineCourses();

// Sync when online
await syncPendingActions(apiClient);
```

### Storage Management

```typescript
// Check storage size
const {courses, lessons, totalMB} = await getOfflineStorageSize();

// Clear all offline data
await clearAllOfflineData();
```

---

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run E2E tests (Detox)
npm run test:e2e:ios
npm run test:e2e:android
```

---

## 📊 Performance Optimization

### Bundle Size
```bash
# Analyze bundle
npm run bundle:android
# Check: android/app/src/main/assets/index.android.bundle

npx react-native-bundle-visualizer
```

### Images
- Use WebP format
- Implement lazy loading
- Cache images with FastImage

### Videos
- Use HLS streaming
- Implement quality selection
- Prefetch next lesson

---

## 🐛 Debugging

### React Native Debugger
```bash
# Install
brew install --cask react-native-debugger

# Run
open "rndebugger://set-debugger-loc?host=localhost&port=8081"
```

### Flipper
- Built-in debugging tool
- Network inspector
- Layout inspector
- Crash reporter

### Logs
```bash
# iOS
npx react-native log-ios

# Android
npx react-native log-android
```

---

## 📄 License

Proprietary - TEPS Lab

---

## 🔗 Links

- [Backend API](https://api.tepslab.com)
- [Web App](https://tepslab.com)
- [Documentation](https://docs.tepslab.com)

---

## 👥 Team

TEPS Lab Development Team
- Email: dev@tepslab.com
- Support: support@tepslab.com
