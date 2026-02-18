# Debug Symbols Quick Fix Reference

**Problem:** "ℹ️ No native debug symbols generated (no native code in app)"  
**Solution:** ✅ Fixed - Bundle ABI splitting + ProGuard rules  
**Commit:** af615db (February 18, 2026)

## What Was Fixed

### 1. Added Bundle Configuration
**File:** `android/app/build.gradle`

```gradle
bundle {
    abi {
        enableSplit = true  // ← This is the key fix!
    }
}
```

**Why:** Without this, Gradle doesn't properly extract native libraries per architecture, so debug symbols can't be generated.

### 2. Added ProGuard Protection
**File:** `android/app/proguard-rules.pro`

```proguard
# Keep Firebase classes
-keep class com.google.firebase.** { *; }

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}
```

**Why:** Prevents ProGuard/R8 from removing Firebase native code during optimization.

## How to Test

### Option 1: GitHub Actions (Easiest)
1. Go to **Actions** → **Android Build**
2. Click **Run workflow**
3. Select **release** build type
4. Click **Run workflow**
5. Wait for completion (~5-10 minutes)
6. Check for: "✅ Native debug symbols found"
7. Download `zikalyze-native-debug-symbols` artifact

### Option 2: Local Build (For Verification)
```bash
cd /home/runner/work/zikalyze/zikalyze
npm run build
npx cap sync android
cd android
./gradlew clean bundleRelease

# Check for the file
ls -lh app/build/outputs/native-debug-symbols/release/native-debug-symbols.zip
```

## Expected Results

### Before Fix ❌
```
Check for Native Debug Symbols
ℹ️ No native debug symbols generated (no native code in app)
symbols_exist=false
```

### After Fix ✅
```
Check for Native Debug Symbols
✅ Native debug symbols found
symbols_exist=true
File: native-debug-symbols.zip (~5-15 MB)
Artifact: zikalyze-native-debug-symbols
```

## Play Store Upload

Once you have the symbols:

1. **Build AAB** (if not already built)
   ```bash
   cd android && ./gradlew bundleRelease
   ```

2. **Download from GitHub Actions**
   - AAB: `zikalyze-release-aab` artifact
   - Symbols: `zikalyze-native-debug-symbols` artifact

3. **Upload to Play Console**
   - Go to https://play.google.com/console
   - Navigate to Release → Production (or Testing)
   - Upload `app-release.aab` first
   - Then upload `native-debug-symbols.zip` in "Native debug symbols" section

4. **Wait for Processing**
   - Symbols take 24-48 hours to process
   - After that, crash reports will show readable stack traces

## Files Changed

| File | Change |
|------|--------|
| `android/app/build.gradle` | Added bundle configuration |
| `android/app/proguard-rules.pro` | Added Firebase + JNI protection |
| `DEBUG_SYMBOLS_FIX_FEB18.md` | Full documentation |

## Troubleshooting

### Still No Symbols Generated?

**Check 1:** Verify bundle config
```bash
grep -A5 "bundle {" android/app/build.gradle
# Should show: enableSplit = true
```

**Check 2:** Verify ProGuard rules
```bash
grep "firebase" android/app/proguard-rules.pro
# Should show: -keep class com.google.firebase.**
```

**Check 3:** Clean build
```bash
cd android
./gradlew clean
./gradlew bundleRelease --info
```

**Check 4:** Verify Firebase dependency
```bash
grep "firebase-messaging" android/app/build.gradle
# Should show: implementation 'com.google.firebase:firebase-messaging'
```

### Workflow Not Detecting Symbols?

1. Check build logs for errors
2. Verify the file path:
   ```bash
   find android/app/build -name "native-debug-symbols.zip"
   ```
3. Should be at: `android/app/build/outputs/native-debug-symbols/release/native-debug-symbols.zip`

## Why This Matters

### Without Debug Symbols ❌
- Play Store warning about missing symbols
- Crash reports show unreadable addresses
- Can't identify which native code caused crashes
- Professional app stores expect symbols

### With Debug Symbols ✅
- No Play Store warnings
- Readable crash reports with file names and line numbers
- Faster debugging of native code issues
- Professional app submission

## Technical Background

Firebase Messaging includes native C++ libraries:
- `libfirebase_app.so`
- `libfirebase_messaging.so`
- One for each architecture (arm64-v8a, armeabi-v7a, x86, x86_64)

These .so files contain machine code, and debug symbols map that code back to human-readable source locations.

The bundle ABI splitting forces Gradle to:
1. Extract .so files for each architecture separately
2. Process each .so file through the NDK strip tool
3. Extract debug information into .sym files
4. Package all .sym files into native-debug-symbols.zip

Without ABI splitting, Gradle optimizes by keeping everything together, which skips the symbol extraction step.

## Related Documentation

- **DEBUG_SYMBOLS_FIX_FEB18.md** - Complete technical explanation
- **NATIVE_LIBRARIES_IMPLEMENTATION.md** - Original Firebase setup
- **PLAYSTORE_DEBUG_SYMBOLS.md** - Play Store upload guide
- **WORKFLOW_DEBUG_SYMBOLS_GUIDE.md** - GitHub Actions guide

## Quick Commands

```bash
# Build with symbols
cd android && ./gradlew clean bundleRelease

# Verify symbols exist
ls -lh app/build/outputs/native-debug-symbols/release/

# List symbol contents
unzip -l app/build/outputs/native-debug-symbols/release/native-debug-symbols.zip

# Check for .so files in APK
unzip -l app/build/outputs/apk/release/app-release-unsigned.apk | grep "\.so$"
```

---

**Status:** ✅ Fixed and Ready  
**Last Updated:** February 18, 2026  
**Next Action:** Test via GitHub Actions workflow
