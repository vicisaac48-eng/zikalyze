# Google Play Store Debug Symbols Guide

## Problem Solved
This guide addresses the Google Play Store warnings:
- ⚠️ "This app bundle contains native code, and you have not uploaded debug symbol"
- Messages about Verizon code warnings
- ANR (Application Not Responding) and crash analysis limitations

## What Are Debug Symbols?

Debug symbols help Google Play Console analyze crashes and ANRs (Application Not Responding) in your app. When your app has native code (C/C++ libraries from Capacitor, Firebase, or other native dependencies), these symbols map crash reports to readable source code locations.

## Configuration Changes

### 1. Android Build Configuration (`android/app/build.gradle`)

We've added native debug symbol generation to the release build:

```gradle
buildTypes {
    release {
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        
        // Generate separate native debug symbols for Play Store
        ndk {
            debugSymbolLevel 'FULL'
        }
    }
}
```

**What this does:**
- `debugSymbolLevel 'FULL'` - Generates complete debug symbols for all native libraries
- Symbols are automatically separated from the APK/AAB
- Creates a `native-debug-symbols.zip` file in the build output

### 2. ProGuard Rules (`android/app/proguard-rules.pro`)

We've enabled source file and line number preservation:

```proguard
# Preserve the line number information for debugging stack traces
# This helps with crash reporting and ANR analysis in Play Console
-keepattributes SourceFile,LineNumberTable

# Keep source file name for better crash reports
-renamesourcefileattribute SourceFile
```

**What this does:**
- Preserves line numbers in stack traces
- Keeps source file names for better crash reports
- Makes Play Console crash reports more useful

## Building the App with Debug Symbols

### Step 1: Build the Release AAB

```bash
# From project root
cd android
./gradlew clean bundleRelease
```

### Step 2: Locate the Generated Files

After a successful build, you'll find:

**AAB File:**
```
android/app/build/outputs/bundle/release/app-release.aab
```

**Native Debug Symbols (NEW):**
```
android/app/build/outputs/native-debug-symbols/release/native-debug-symbols.zip
```

The `native-debug-symbols.zip` file contains:
- Debug symbols for all native libraries (.so files)
- Symbol information for Capacitor runtime
- Symbol information for Firebase and other native dependencies
- Mapping between machine code and source code

## Uploading to Google Play Console

### Method 1: Upload with AAB (Recommended)

1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app
3. Navigate to **Release** → **Production** (or Testing track)
4. Click **Create new release**
5. Upload `app-release.aab`
6. **Important:** Upload `native-debug-symbols.zip` in the same release
   - Look for "Native debug symbols" section
   - Click "Upload" and select the `native-debug-symbols.zip` file
7. Complete the release as normal

### Method 2: Upload Symbols Separately

If you've already uploaded an AAB and forgot the symbols:

1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app
3. Navigate to **Release** → **App bundle explorer**
4. Find the version you uploaded
5. Click **Downloads** tab
6. Upload the `native-debug-symbols.zip` file

### Method 3: Using Play Console API (Advanced)

```bash
# Using bundletool (if needed)
java -jar bundletool.jar upload-symbols \
  --package-name=com.zikalyze.app \
  --version-code=2 \
  --symbols-path=android/app/build/outputs/native-debug-symbols/release/native-debug-symbols.zip
```

## Verification

After uploading symbols, verify they're working:

1. Wait 24-48 hours for symbols to process
2. Go to **Quality** → **Android vitals** → **Crashes & ANRs**
3. Check that crash reports show:
   - ✅ Readable stack traces
   - ✅ Source file names
   - ✅ Line numbers
   - ✅ Native library names

### Before Upload (Without Symbols):
```
#00 pc 000000000001a5b4  /data/app/~~abc123/com.zikalyze.app/lib/arm64/libcapacitor.so
```

### After Upload (With Symbols):
```
#00 pc 000000000001a5b4  /data/app/~~abc123/com.zikalyze.app/lib/arm64/libcapacitor.so (Java_com_getcapacitor_Bridge_nativeSetServerPath+52)
```

## Important Notes

### Build Process
- **Always build with Gradle**: Don't use Android Studio's "Generate Signed Bundle" 
- Use command line: `cd android && ./gradlew bundleRelease`
- Symbols are automatically generated with this configuration

### File Sizes
- AAB size: ~10-30 MB (typical)
- Debug symbols: ~5-15 MB (depends on native dependencies)
- Total upload: AAB + symbols

### Retention
- Google keeps symbols for the lifetime of the app version
- Upload symbols with EVERY new release
- Old symbols don't work with new builds

### CI/CD Integration
If you use GitHub Actions or other CI/CD:

```yaml
# .github/workflows/android-release.yml
- name: Build Release AAB
  run: |
    cd android
    ./gradlew clean bundleRelease

- name: Upload AAB
  uses: actions/upload-artifact@v3
  with:
    name: app-release.aab
    path: android/app/build/outputs/bundle/release/app-release.aab

- name: Upload Debug Symbols
  uses: actions/upload-artifact@v3
  with:
    name: native-debug-symbols.zip
    path: android/app/build/outputs/native-debug-symbols/release/native-debug-symbols.zip
```

## Troubleshooting

### Symbols Not Generated
**Problem:** No `native-debug-symbols.zip` file after build

**Solution:**
```bash
# Clean and rebuild
cd android
./gradlew clean
./gradlew bundleRelease

# Check for symbols
ls -lh app/build/outputs/native-debug-symbols/release/
```

### Upload Rejected
**Problem:** Play Console rejects symbols file

**Causes:**
- Wrong version code (must match AAB)
- Corrupted zip file
- Symbols don't match AAB

**Solution:**
- Rebuild both AAB and symbols together
- Don't manually zip files
- Use the auto-generated `native-debug-symbols.zip`

### Crashes Still Unreadable
**Problem:** Crash reports don't show readable stack traces

**Wait Time:**
- Symbols take 24-48 hours to process
- New crashes after that will be readable
- Old crashes stay unreadable

### Verizon Code Messages
**Context:** Verizon has specific requirements for apps that might use their network features.

**This fix helps because:**
- Better crash reports help identify Verizon-specific issues
- Symbol information helps debug network-related problems
- Improved ANR analysis for all carriers

## Best Practices

1. **Always Upload Symbols**
   - Include symbols with every release
   - Never skip symbol upload

2. **Keep Symbols Safe**
   - Backup `native-debug-symbols.zip` files
   - Store them with the corresponding AAB
   - Tag in version control which commit built which AAB

3. **Version Matching**
   - Symbols must match AAB version exactly
   - Version code in build.gradle must be correct
   - Don't mix symbols from different builds

4. **Testing**
   - Test crash reporting in internal testing track
   - Verify symbols work before production release

5. **Documentation**
   - Document your build process
   - Include symbol upload in release checklist
   - Train team members on the process

## Quick Reference

### Build Commands
```bash
# Full build with symbols
cd /home/runner/work/zikalyze/zikalyze
npm run build                    # Build web assets
cd android
./gradlew clean bundleRelease    # Build AAB + symbols
```

### Output Locations
- **AAB**: `android/app/build/outputs/bundle/release/app-release.aab`
- **Symbols**: `android/app/build/outputs/native-debug-symbols/release/native-debug-symbols.zip`

### Upload Checklist
- [ ] Build AAB with `./gradlew bundleRelease`
- [ ] Verify `native-debug-symbols.zip` was created
- [ ] Sign AAB (if not auto-signed)
- [ ] Upload AAB to Play Console
- [ ] Upload `native-debug-symbols.zip` in same release
- [ ] Complete release notes and rollout
- [ ] Wait 24-48 hours for symbol processing
- [ ] Verify crash reports show readable traces

## Support

If you encounter issues:
1. Check Android Studio Build Analyzer
2. Review Gradle build logs: `./gradlew bundleRelease --info`
3. Verify NDK is installed in Android SDK Manager
4. Check Play Console documentation: https://support.google.com/googleplay/android-developer/answer/9848633

---

**Last Updated:** February 17, 2026
**Configuration Version:** build.gradle v2 (versionCode 2, versionName 1.1.0)
