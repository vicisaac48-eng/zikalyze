# Android Play Store Deployment Guide

This guide explains how to build and publish Zikalyze to the Google Play Store.

## Prerequisites

- Node.js 20 or higher
- Java JDK 17
- Android Studio (for local development)
- Google Play Console account
- Android signing keystore (for release builds - [see how to create one](#1-create-a-release-keystore))

## Quick Start

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build and sync with Android:**
   ```bash
   npm run android:build
   ```

3. **Open in Android Studio:**
   ```bash
   npm run android:open
   ```

4. **Run on a connected device:**
   ```bash
   npm run android:run
   ```

## Building for Play Store

### 1. Create a Release Keystore

Create a keystore for signing your app (do this once and keep it secure):

```bash
keytool -genkey -v -keystore zikalyze-release.keystore -alias zikalyze -keyalg RSA -keysize 2048 -validity 10000
```

Keep this keystore file secure - you'll need it for all future updates!

### 2. Configure Signing in Android Studio

1. Open the Android project: `npm run android:open`
2. Go to **Build > Generate Signed Bundle / APK**
3. Choose **Android App Bundle** (recommended for Play Store)
4. Select your keystore file and enter credentials
5. Choose **release** build variant
6. Build the AAB file

### 3. Using GitHub Actions (Automated)

For automated builds, add these secrets to your GitHub repository:

| Secret Name | Description |
|-------------|-------------|
| `ANDROID_KEYSTORE_BASE64` | Base64-encoded keystore file |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore password |
| `ANDROID_KEY_ALIAS` | Key alias (e.g., "zikalyze") |
| `ANDROID_KEY_PASSWORD` | Key password |

To encode your keystore:
```bash
base64 -w 0 zikalyze-release.keystore > keystore-base64.txt
```

Then trigger a release build via GitHub Actions workflow dispatch.

## Play Store Submission

### App Information Required

1. **App Name:** Zikalyze - AI Crypto Trading Analysis
2. **Short Description:** AI-powered cryptocurrency analysis for smarter trading
3. **Full Description:** (see below)
4. **App Category:** Finance
5. **Content Rating:** Everyone
6. **Privacy Policy:** https://zikalyze.com/privacy-policy

### Full Description Template

```
Zikalyze AI is a professional-grade cryptocurrency analysis platform designed to transform complex market data into actionable, high-signal insights.

KEY FEATURES:

📊 Multi-Timeframe Analysis
• Automatically scans trends across Weekly, Daily, 4H, 1H, and 15M charts
• Identifies trend alignment across multiple timeframes
• Provides confluence-based trading signals

🐋 Whale & Exchange Tracking
• Real-time whale accumulation monitoring
• Exchange inflows/outflows analysis
• Institutional sentiment indicators

🎯 Precision Entry Signals
• Clear Entry Zones for each asset
• Multiple take-profit targets
• Defined invalidation levels

📰 Macro Catalyst Awareness
• FOMC meeting integration
• CPI data tracking
• Major economic event calendar

💡 Smart Notifications
• Price alert system
• Technical breakout alerts
• Customizable notification preferences

ADDITIONAL FEATURES:
• Dark mode optimized interface
• Offline support for cached data
• Multi-language support
• Privacy-focused (no data collection)

DISCLAIMER:
Zikalyze is a cryptocurrency analysis tool, not financial advice. Trading cryptocurrencies carries significant risk. Past performance does not guarantee future results.
```

### Screenshots Required

Prepare screenshots for these device sizes:
- Phone (1080 x 1920 pixels or higher)
- 7-inch tablet (optional)
- 10-inch tablet (optional)

Recommended screenshots:
1. Dashboard overview
2. AI Analyzer in action
3. Price alerts feature
4. On-chain metrics
5. Settings page

### Store Listing Graphics

| Asset | Dimensions | Purpose |
|-------|------------|---------|
| Hi-res icon | 512 x 512 px | Store listing |
| Feature graphic | 1024 x 500 px | Promotional banner |
| Phone screenshots | 1080 x 1920 px | App preview |

## Version Management

Update version numbers in:

1. **package.json:**
   ```json
   "version": "1.0.0"
   ```

2. **android/app/build.gradle:**
   ```gradle
   versionCode 1
   versionName "1.0.0"
   ```

For each Play Store update:
- Increment `versionCode` by 1
- Update `versionName` as needed (semantic versioning)

## Troubleshooting

### Build Fails with SDK Error
Ensure Android SDK platform 35 is installed:
```bash
sdkmanager "platforms;android-35"
```

### APK Too Large
The app uses code splitting. If the APK is still too large:
1. Enable ProGuard in release builds
2. Use App Bundle format (AAB) instead of APK

### WebView Issues
If the WebView shows security warnings:
1. Ensure `android:usesCleartextTraffic="false"` in AndroidManifest.xml
2. All API calls should use HTTPS

## Security Notes

- Never commit your keystore or passwords to git
- Use GitHub Secrets for CI/CD signing
- Enable Play App Signing in Google Play Console
- Keep a secure backup of your keystore

## Useful Links

- [Google Play Console](https://play.google.com/console)
- [Capacitor Android Docs](https://capacitorjs.com/docs/android)
- [Play Store Guidelines](https://developer.android.com/distribute/best-practices/launch)
- [App Signing Documentation](https://developer.android.com/studio/publish/app-signing)
