# Push Notifications Setup Guide for Zikalyze Android App

## 🚨 CRITICAL: Firebase Configuration Required

Push notifications will **NOT** work on Android without completing this setup.

---

## Quick Fix (5 Minutes)

### Step 1: Get Firebase Configuration File

1. Go to **Firebase Console**: https://console.firebase.google.com
2. Select your **Zikalyze** project (or create a new one if none exists)
3. Click the **gear icon** ⚙️ > **Project settings**
4. Scroll down to **Your apps** section
5. Click on your **Android app** (or add new Android app if none exists)
   - **Package name:** `com.zikalyze.app`
   - **App nickname:** `Zikalyze`
6. Download **`google-services.json`**

### Step 2: Place Configuration File

```bash
# Copy the downloaded file to:
android/app/google-services.json
```

**File structure should be:**
```
zikalyze/
├── android/
│   ├── app/
│   │   ├── google-services.json  ← Place file here
│   │   └── src/
│   └── build.gradle
```

### Step 3: Rebuild App

```bash
# Sync Capacitor
npx cap sync android

# Open Android Studio
npx cap open android

# Build and run on device
# (Build > Build Bundle(s) / APK(s) > Build APK)
```

---

## Verification

### Check if Configuration is Loaded

After adding `google-services.json`, you should see in build logs:

✅ **Success:**
```
> Task :app:processDebugGoogleServices
Parsing json file: /path/to/google-services.json
```

❌ **Failure:**
```
google-services.json not found, google-services plugin not applied. 
Push Notifications won't work
```

### Test Push Notifications

1. **Install app on physical device** (not emulator)
2. **Open app** and go to Settings
3. **Enable notifications** when prompted
4. **Check logs** in Android Studio Logcat:
   ```
   [FCM] Token received: abc123...
   ```
5. **Send test notification** from Firebase Console:
   - Go to Firebase Console > Cloud Messaging
   - Click "Send your first message"
   - Enter title and body
   - Select your app
   - Send notification

If you see the notification on your device → **SUCCESS!** 🎉

---

## Already Implemented Fixes

✅ **AndroidManifest.xml** - Firebase Messaging Service configured  
✅ **MainActivity.java** - Notification channel created  
✅ **Capacitor config** - Push notifications enabled  
✅ **FCM Service** - Professional implementation  
✅ **Permission handling** - Proper request flow  

---

## What's Missing (YOU NEED TO ADD)

❌ **google-services.json** - Firebase configuration file  
   - **Why:** Contains Firebase project credentials
   - **How:** Download from Firebase Console (see Step 1 above)
   - **Where:** `android/app/google-services.json`

---

## Common Issues

### Issue: "Permission denied" or no prompt
**Solution:** Uninstall app, reinstall, and try again

### Issue: No token in logs
**Solution:** Verify `google-services.json` is in correct location

### Issue: Notifications work in foreground but not background
**Solution:** Ensure Firebase Messaging Service is in AndroidManifest.xml (already done ✅)

### Issue: "google-services.json not found" in build log
**Solution:** File not in correct location or incorrectly named

---

## Firebase Console Setup (If You Don't Have a Project)

### 1. Create Firebase Project

1. Go to https://console.firebase.google.com
2. Click **"Add project"**
3. Enter project name: **Zikalyze**
4. Enable Google Analytics (optional)
5. Click **"Create project"**

### 2. Add Android App

1. Click **Android icon** in project overview
2. Enter **package name**: `com.zikalyze.app`
3. Enter **app nickname**: `Zikalyze`
4. Click **"Register app"**
5. **Download `google-services.json`**
6. Click **"Next"** through remaining steps

### 3. Enable Cloud Messaging

1. Go to **Project Settings** > **Cloud Messaging** tab
2. Firebase Cloud Messaging API should be enabled
3. Copy **Server Key** (for backend if needed)

---

## Security Notes

⚠️ **Important:** `google-services.json` contains sensitive project configuration.

- ✅ **Safe to commit** to private repositories
- ❌ **Do NOT commit** to public repositories
- 🔒 **Add to `.gitignore`** if repository is public

**For public repos, add to `.gitignore`:**
```gitignore
# Firebase configuration (contains sensitive keys)
android/app/google-services.json
ios/App/GoogleService-Info.plist
```

---

## Support

If push notifications still don't work after following this guide:

1. Check Android Studio Logcat for errors
2. Verify `google-services.json` is valid JSON
3. Ensure Firebase project has Cloud Messaging enabled
4. Test on physical device (FCM doesn't work on emulators)
5. Check that notification permission is granted in device settings

---

## Next Steps

After completing this setup:

1. ✅ Test push notifications work
2. ✅ Configure notification preferences in app settings
3. ✅ Subscribe to crypto price alerts
4. ✅ Receive real-time notifications for your watchlist

**Need Help?** Check Firebase Console documentation or Android Studio logs for specific error messages.
