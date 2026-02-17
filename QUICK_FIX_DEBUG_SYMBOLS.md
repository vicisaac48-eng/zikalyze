# Quick Fix: Debug Symbols for Play Store Warnings

## What Was Fixed

✅ **Problem:** Google Play Store showing warnings about missing native debug symbols
✅ **Solution:** Configured Android build to generate and separate debug symbols

## What Changed

### 1. `android/app/build.gradle`
Added native debug symbol generation:
```gradle
ndk {
    debugSymbolLevel 'FULL'
}
```

### 2. `android/app/proguard-rules.pro`
Enabled source file and line number preservation for better crash reports

## What You Need To Do

### Step 1: Rebuild Your App
```bash
cd android
./gradlew clean bundleRelease
```

### Step 2: Find The Generated Files
After build completes, you'll have TWO files:

1. **AAB File** (as before):
   ```
   android/app/build/outputs/bundle/release/app-release.aab
   ```

2. **Debug Symbols** (NEW):
   ```
   android/app/build/outputs/native-debug-symbols/release/native-debug-symbols.zip
   ```

### Step 3: Upload Both to Play Store

1. Open [Google Play Console](https://play.google.com/console)
2. Go to your app → Release → Production (or Testing)
3. Create new release
4. Upload the **app-release.aab** file
5. **IMPORTANT:** Also upload **native-debug-symbols.zip**
   - Look for "Native debug symbols" section on the same page
   - Click upload and select the zip file
6. Complete your release as normal

## Expected Result

✅ No more warnings about missing debug symbols
✅ Better crash reports in Play Console (with line numbers and source files)
✅ Easier to debug ANRs (Application Not Responding)
✅ Verizon code messages should be resolved

## Verification

After uploading (wait 24-48 hours for processing):
- Check Play Console → Quality → Android vitals → Crashes & ANRs
- Crash reports should now show readable stack traces with line numbers

## Need More Help?

See the comprehensive guide: `PLAYSTORE_DEBUG_SYMBOLS.md`

---

**Quick Summary:**
- Build creates AAB + debug symbols zip
- Upload both files to Play Console together
- Warnings will disappear after symbol processing
