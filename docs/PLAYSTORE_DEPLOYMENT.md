# 🚀 Play Store Deployment Guide

This guide walks you through generating an Android App Bundle (AAB) and uploading it to the Google Play Store.

## 📋 Prerequisites

Before you begin, make sure you have:

1. ✅ **Google Play Developer Account** - [Sign up here](https://play.google.com/console/signup) (one-time $25 fee)
2. ✅ **App listing created** on Google Play Console
3. ✅ **App signing key** set up (Google manages this for new apps)

## 🔧 Method 1: Generate AAB via GitHub Actions (Recommended)

This is the easiest method - no local setup required!

### Step 1: Trigger the Release Build

1. Go to the [Android Build Workflow](https://github.com/vicisaac48-eng/zikalyze/actions/workflows/android-build.yml)
2. Click **"Run workflow"** button (top right)
3. Select **build_type: `release`**
4. Click **"Run workflow"**

![Run Workflow](https://github.githubassets.com/images/modules/actions/workflow_run_button.png)

### Step 2: Download the AAB File

1. Wait for the build to complete (~3-5 minutes)
2. Click on the completed workflow run
3. Scroll to **"Artifacts"** section at the bottom
4. Download **`zikalyze-release-aab`**
5. Extract the ZIP to get `app-release.aab`

### Step 3: Upload to Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app (or create a new one)
3. Navigate to **Release** → **Production** (or Internal Testing for first release)
4. Click **"Create new release"**
5. Upload the `app-release.aab` file
6. Fill in release notes
7. Click **"Review release"** → **"Start rollout"**

> **Note:** For your first release, start with Internal Testing to verify everything works before going to Production.

---

## 🔧 Method 2: Build AAB Locally

If you prefer building locally or need to sign the app with your own keystore.

### Prerequisites for Local Build

- **Node.js 22+** - [Download](https://nodejs.org/)
- **Java JDK 21** - [Download Temurin](https://adoptium.net/)
- **Android Studio** or Android SDK Command Line Tools

### Step 1: Install Dependencies

```bash
# Clone the repository
git clone https://github.com/vicisaac48-eng/zikalyze.git
cd zikalyze

# Install Node.js dependencies
npm install
```

### Step 2: Build Web Assets

```bash
npm run build
```

### Step 3: Sync with Capacitor

```bash
npx cap sync android
```

### Step 4: Build the AAB

```bash
cd android
chmod +x gradlew

# Build unsigned release AAB
./gradlew bundleRelease
```

### Step 5: Find Your AAB

The AAB file will be at:
```
android/app/build/outputs/bundle/release/app-release.aab
```

---

## 🔐 Signing the AAB (Required for Play Store)

Google Play requires signed apps. You have two options:

### Option A: Google Play App Signing (Recommended)

Let Google manage your app signing key. This is the easiest and most secure option.

1. In Play Console, go to **Setup** → **App integrity**
2. Enable **"Play App Signing"**
3. Upload your unsigned AAB - Google will sign it automatically

### Option B: Sign Locally with Your Own Keystore

If you need to sign locally:

#### Create a Keystore (one-time)

```bash
keytool -genkey -v -keystore zikalyze-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias zikalyze
```

You'll be prompted to set:
- Keystore password
- Key password (can be same as keystore password)
- Your name, organization, and location

> ⚠️ **IMPORTANT:** Keep your keystore file and passwords safe! You'll need them for ALL future updates.

#### Sign the AAB

```bash
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
  -keystore zikalyze-release-key.jks \
  android/app/build/outputs/bundle/release/app-release.aab \
  zikalyze
```

---

## 📱 First-Time Play Store Setup

If this is your first time publishing to the Play Store:

### 1. Create Your App

1. Go to [Google Play Console](https://play.google.com/console)
2. Click **"Create app"**
3. Fill in:
   - App name: `Zikalyze AI`
   - Default language: English (US)
   - App or game: App
   - Free or paid: Free (or Paid if applicable)
4. Accept the Developer Program Policies

### 2. Complete Store Listing

Required information:
- **App name:** Zikalyze AI
- **Short description:** (up to 80 characters)
  ```
  AI-powered cryptocurrency analysis with real-time signals and whale tracking
  ```
- **Full description:** (up to 4000 characters)
  ```
  Zikalyze AI is your professional-grade cryptocurrency analysis companion. 
  
  🧠 AI-Powered Analysis
  • Multi-timeframe confluence detection across 5 timeframes
  • Hybrid neural network + algorithmic trading signals
  • Real-time whale tracking and exchange flow monitoring
  
  📊 Key Features
  • Entry zones with precise targets and invalidation levels
  • NLP sentiment analysis from news and social media
  • Real-time WebSocket connections to major exchanges
  • Push notifications for price alerts
  
  🔒 Privacy First
  • 100% client-side analysis - your data stays on your device
  • No account required for basic features
  • Transparent AI methodology
  ```
- **Screenshots:** Phone (2-8 images, 16:9 or 9:16 ratio)
- **App icon:** 512x512 PNG (already included in the app)
- **Feature graphic:** 1024x500 PNG

### 3. Set App Category

- **Category:** Finance
- **Tags:** Cryptocurrency, Trading, Finance, Analytics

### 4. Content Rating

Complete the content rating questionnaire:
- Generally suitable for all audiences
- No violence, gambling, or adult content

### 5. Data Safety

Declare what data your app collects:
- **Data collected:** Device identifiers (for push notifications if enabled)
- **Data shared:** None
- **Security practices:** Data encrypted in transit

---

## 🔄 Updating Your App

For subsequent releases:

### 1. Increment Version Numbers

Edit `android/app/build.gradle`:
```gradle
defaultConfig {
    versionCode 3        // Increment this (must be higher than previous)
    versionName "1.2.0"  // Update semantic version
}
```

Also update `package.json`:
```json
"version": "1.2.0"
```

### 2. Build New AAB

Follow Method 1 or Method 2 above to generate a new AAB.

### 3. Upload to Play Console

1. Go to your app in Play Console
2. Navigate to **Release** → **Production**
3. Click **"Create new release"**
4. Upload the new AAB
5. Add release notes describing changes
6. Submit for review

---

## 🧪 Testing Before Production

We recommend testing before releasing to production:

### Internal Testing Track

- Up to 100 testers
- Instant availability (no review)
- Good for initial testing

### Closed Testing Track

- Invite specific testers via email
- Review required (faster than production)
- Good for beta testing

### Open Testing Track

- Anyone can join via opt-in link
- Review required
- Good for public beta

---

## ❓ Troubleshooting

### "Version code already exists"

Increment `versionCode` in `android/app/build.gradle`. Each upload must have a higher version code.

### "Target SDK version is too low"

Update `targetSdkVersion` in `android/variables.gradle` to meet current Play Store requirements (usually Android 13+).

### "Missing store listing"

Complete all required fields in **Grow** → **Store listing** before submitting for review.

### "App rejected for policy violations"

Review the rejection email, make necessary changes, and resubmit. Common issues:
- Missing privacy policy URL
- Incorrect content rating
- Misleading app description

---

## 📚 Resources

- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [Play Console Academy](https://play.google.com/console/academy)
- [Android App Bundle Guide](https://developer.android.com/guide/app-bundle)
- [App Signing Documentation](https://developer.android.com/studio/publish/app-signing)

---

## 🎉 Success!

Once your app is approved (usually 1-3 days for first submission), it will be available on the Google Play Store!

Need help? Open an issue on [GitHub](https://github.com/vicisaac48-eng/zikalyze/issues).
