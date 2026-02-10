# 🔧 AAB Troubleshooting Guide

This guide helps diagnose and fix issues when uploading Android App Bundles (AAB) to Google Play Store.

## 🚨 Common AAB Upload Problems

### Problem: "AAB was not accepted" or "Upload failed"

**Most Common Causes:**

1. **ProGuard/Minification Issues** (90% of cases)
   - WebView JavaScript interfaces are stripped out
   - App crashes immediately after launch
   - Blank screen or "Page not found" errors

2. **Version Code Not Incremented**
   - Each new upload must have a higher `versionCode`
   - Play Store rejects if version code is same or lower

3. **Missing Privacy Policy**
   - Play Store requires accessible privacy policy URL
   - Required for all apps

4. **Signing Issues**
   - Wrong keystore or unsigned AAB
   - Keystore password mismatch

5. **Manifest Issues**
   - Missing required permissions
   - Activity not exported properly

---

## 🔍 Step 1: Verify Your AAB

Run our verification script:

```bash
python3 scripts/verify_aab.py
```

This will check:
- ✅ Build configuration
- ✅ ProGuard rules
- ✅ Manifest configuration
- ✅ Privacy policy compliance
- ✅ AAB file integrity

---

## 🛠️ Step 2: Common Fixes

### Fix 1: Update ProGuard Rules (CRITICAL)

**Problem:** App crashes or shows blank screen after upload

**Solution:** The ProGuard rules have been updated in `android/app/proguard-rules.pro`

Key rules that MUST be present:
```proguard
# Keep JavaScript interfaces for WebView
-keepattributes JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface public *;
}

# Keep Capacitor classes
-keep class com.getcapacitor.** { *; }

# Preserve line numbers for debugging
-keepattributes SourceFile,LineNumberTable
```

**Test:** After updating, rebuild:
```bash
cd android
./gradlew clean
./gradlew bundleRelease
```

### Fix 2: Increment Version Code

**Problem:** "Version code X has already been used"

**Solution:** Edit `android/app/build.gradle`:

```gradle
defaultConfig {
    versionCode 5  // Increment this number (was 4)
    versionName "1.2.1"  // Update version name too
}
```

**Rules:**
- Each upload needs `versionCode` higher than previous
- `versionName` is user-facing (e.g., "1.2.0" → "1.2.1")
- Never reuse version codes

### Fix 3: Ensure Privacy Policy is Accessible

**Problem:** Play Store requires privacy policy URL

**Solution:** 
- ✅ Privacy policy is at: `https://zikalyze.com/privacy.html`
- ✅ Terms of service is at: `https://zikalyze.com/terms.html`

**Verify these URLs work:**
```bash
curl -I https://zikalyze.com/privacy.html
# Should return: HTTP/1.1 200 OK
```

**In Play Console:**
- Go to: **Store presence** → **Store listing**
- Add privacy policy URL: `https://zikalyze.com/privacy.html`

### Fix 4: Check Signing Configuration

**For unsigned AAB (most common):**

Use Google Play App Signing (recommended):
1. In Play Console: **Setup** → **App integrity**
2. Enable **"Play App Signing"**
3. Upload unsigned AAB - Google signs it automatically

**For custom keystore:**

Create `android/keystore.properties`:
```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=YOUR_KEY_ALIAS
storeFile=path/to/your/keystore.jks
```

Add to `android/app/build.gradle`:
```gradle
signingConfigs {
    release {
        def keystorePropertiesFile = rootProject.file("keystore.properties")
        def keystoreProperties = new Properties()
        keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
        
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
        storeFile file(keystoreProperties['storeFile'])
        storePassword keystoreProperties['storePassword']
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
    }
}
```

### Fix 5: Verify Manifest Permissions

**Problem:** App can't access network or crashes on startup

**Check:** `android/app/src/main/AndroidManifest.xml`

Required permissions:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

Main activity must be exported:
```xml
<activity
    android:name=".MainActivity"
    android:exported="true">
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>
</activity>
```

---

## 🧪 Step 3: Test Your AAB

### Test on Real Device (IMPORTANT!)

```bash
# Build the release AAB
cd android
./gradlew bundleRelease

# Generate APKs from AAB for testing
# Install bundletool first:
# https://github.com/google/bundletool/releases

bundletool build-apks \
  --bundle=app/build/outputs/bundle/release/app-release.aab \
  --output=test.apks

# Install on connected device
bundletool install-apks --apks=test.apks
```

### What to Test:

1. ✅ App launches without crashing
2. ✅ All pages load correctly
3. ✅ No blank screens
4. ✅ Network requests work
5. ✅ All features function properly
6. ✅ No JavaScript errors in LogCat

### Check LogCat for Errors:

```bash
adb logcat | grep -i "error\|exception\|crash"
```

Common errors to look for:
- `ClassNotFoundException` → ProGuard issue
- `MethodNotFoundException` → ProGuard stripped a method
- `SecurityException` → Missing permission

---

## 📤 Step 4: Upload to Play Console

### Before Uploading:

- [x] Version code incremented
- [x] ProGuard rules updated
- [x] Tested on real device
- [x] No crashes or errors
- [x] Privacy policy accessible

### Upload Process:

1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app
3. Navigate to: **Release** → **Production** (or **Internal Testing**)
4. Click **"Create new release"**
5. Upload `app-release.aab`
6. Fill in release notes
7. Click **"Review release"** → **"Start rollout"**

### For First-Time Upload:

Start with **Internal Testing**:
1. **Release** → **Testing** → **Internal testing**
2. Create release and upload AAB
3. Add test users (your email)
4. Test the internal release
5. Only then move to Production

---

## 🐛 Advanced Debugging

### Check AAB Contents with Bundletool

```bash
# List all files in the AAB
bundletool dump manifest --bundle=app-release.aab

# Extract the AAB to inspect
unzip app-release.aab -d aab-contents/
```

### Analyze APK Size

```bash
bundletool get-size total --apks=test.apks
```

### Check for Obfuscation Issues

If app works in debug but fails in release:

1. Disable minification temporarily:
   ```gradle
   buildTypes {
       release {
           minifyEnabled false  // Temporary
       }
   }
   ```

2. Rebuild and test
3. If it works, ProGuard rules are the issue
4. Re-enable and fix ProGuard rules

---

## 📋 Checklist for Successful Upload

- [ ] Run `python3 scripts/verify_aab.py` - all checks pass
- [ ] Version code incremented from previous upload
- [ ] ProGuard rules include Capacitor/WebView keeps
- [ ] Built with: `cd android && ./gradlew bundleRelease`
- [ ] AAB file exists at: `android/app/build/outputs/bundle/release/app-release.aab`
- [ ] Tested on real Android device (not just emulator)
- [ ] App launches without crashes
- [ ] All features work correctly
- [ ] Privacy policy URL accessible: https://zikalyze.com/privacy.html
- [ ] Terms of service URL accessible: https://zikalyze.com/terms.html
- [ ] Upload to Internal Testing first (recommended)

---

## 🆘 Still Having Issues?

### Error Messages and Solutions

**"Your App Bundle contains Java/Kotlin code"**
- This is normal for Capacitor apps
- Ensure ProGuard rules are correct

**"Native libraries not found"**
- Usually not an issue for Capacitor
- Check if any plugins use native code

**"Manifest merger failed"**
- Check for conflicting permissions
- Run: `./gradlew :app:processReleaseManifest`

**"APK signature verification failed"**
- Signing issue
- Use Play App Signing or verify keystore

**"Duplicate resources"**
- Run: `./gradlew clean` then rebuild

### Get Build Logs

```bash
cd android
./gradlew bundleRelease --stacktrace --info > build.log 2>&1
```

Review `build.log` for detailed error messages.

### Play Console Rejection Reasons

If your AAB is rejected:

1. Check email from Google Play for specific reason
2. Go to Play Console → **Policy status**
3. Common rejections:
   - Missing privacy policy → Add to store listing
   - Missing permissions declaration → Update data safety form
   - Broken functionality → Fix and reupload
   - Security issues → Update dependencies

---

## 🎯 Quick Fix Commands

```bash
# 1. Clean build
cd android && ./gradlew clean

# 2. Verify configuration
python3 scripts/verify_aab.py

# 3. Update version (edit build.gradle)
# versionCode 5 (increment from 4)

# 4. Rebuild AAB
./gradlew bundleRelease

# 5. Check AAB was created
ls -lh app/build/outputs/bundle/release/app-release.aab

# 6. Upload to Play Console
# https://play.google.com/console
```

---

## 📚 Additional Resources

- [Play Console](https://play.google.com/console)
- [Android App Bundle Documentation](https://developer.android.com/guide/app-bundle)
- [Bundletool](https://github.com/google/bundletool)
- [ProGuard Manual](https://www.guardsquare.com/manual/home)
- [Capacitor Android Documentation](https://capacitorjs.com/docs/android)

---

**Need More Help?**

Open an issue with:
1. Output from `scripts/verify_aab.py`
2. Build logs from `./gradlew bundleRelease --stacktrace`
3. LogCat errors from device testing
4. Exact error message from Play Console
