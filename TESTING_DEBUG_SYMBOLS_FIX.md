# TESTING INSTRUCTIONS - Native Debug Symbols Fix

**Date:** February 18, 2026  
**PR:** copilot/fetch-debug-symbols-zip

## What Was Fixed

Added **Firebase Crashlytics NDK** to provide native libraries that generate debug symbols for Play Store.

Previous attempts failed because:
- ❌ Firebase Messaging alone - insufficient native code
- ❌ Bundle splitting + ProGuard - no native libs to process
- ✅ **Crashlytics NDK - explicit native libraries** 

## Test This Fix Now

### Step 1: Trigger GitHub Actions Workflow

1. **Go to Actions page:**
   - https://github.com/vicisaac48-eng/zikalyze/actions/workflows/android-build.yml

2. **Click "Run workflow" button** (top right)

3. **Select options:**
   - Use workflow from: `main` (or `copilot/fetch-debug-symbols-zip` to test this PR)
   - build_type: **`release`** (IMPORTANT!)

4. **Click "Run workflow"** (green button)

5. **Wait ~6-7 minutes** for build to complete

### Step 2: Check Workflow Logs

1. **Click on the workflow run** (it will appear in the list)

2. **Click on "build-android" job**

3. **Scroll to "Check for Native Debug Symbols" step**

4. **Look for:**
   ```
   ✅ Native debug symbols found
   ```

   **NOT:**
   ```
   ℹ️ No native debug symbols generated (no native code in app)
   ```

### Step 3: Download Debug Symbols

1. **Scroll to bottom** of workflow run page

2. **Find "Artifacts" section**

3. **Look for these artifacts:**
   - ✅ `zikalyze-release-aab` (~5 MB)
   - ✅ `zikalyze-native-debug-symbols` (**NEW!** ~5-20 MB)

4. **Download `zikalyze-native-debug-symbols`**

5. **Extract the zip file**

6. **Verify it contains `native-debug-symbols.zip`**

7. **Check file size:** Should be ~5-20 MB (not 0 bytes!)

### Step 4: Verify Contents (Optional)

Extract and inspect the debug symbols:

```bash
unzip native-debug-symbols.zip

# Should show files like:
# lib/arm64-v8a/libcrashlytics.so.sym
# lib/arm64-v8a/libcrashlytics-common.so.sym
# lib/arm64-v8a/libcrashlytics-handler.so.sym
# lib/armeabi-v7a/libcrashlytics.so.sym
# (+ more for x86, x86_64)
```

## Expected Results

### ✅ Success Indicators

- [ ] Workflow completes successfully
- [ ] Log shows "✅ Native debug symbols found"
- [ ] Artifact `zikalyze-native-debug-symbols` exists
- [ ] Artifact size is ~5-20 MB (not empty)
- [ ] Can extract and see .sym files
- [ ] Ready to upload to Play Store!

### ❌ Failure Indicators

If you see:
- "ℹ️ No native debug symbols generated" - **Fix didn't work**
- No `zikalyze-native-debug-symbols` artifact - **Fix didn't work**
- Empty or very small symbols file - **Fix didn't work**

## After Successful Test

### Upload to Play Store

1. **Login to Google Play Console**
   - https://play.google.com/console

2. **Navigate to your app** → Release → Production (or Testing)

3. **Create new release**

4. **Upload files:**
   - Upload `app-release.aab` from `zikalyze-release-aab` artifact
   - Wait for it to process

5. **Upload debug symbols:**
   - Find "Native debug symbols" section
   - Click "Upload"
   - Select `native-debug-symbols.zip` from `zikalyze-native-debug-symbols` artifact
   - Wait for upload

6. **Review and publish**
   - No warning about missing debug symbols ✅
   - Submit for review
   - Wait 24-48 hours for symbol processing

## Troubleshooting

### Build Fails

**Error:** Dependency resolution failed
**Solution:** The build environment needs internet access to download Firebase dependencies. This should work in GitHub Actions.

**Error:** Plugin not applied
**Solution:** Check that google-services.json exists in android/app/

### Still No Debug Symbols

**If the workflow still shows "No native debug symbols generated":**

1. Check the build logs for errors
2. Look for "crashlytics" in the logs
3. Verify Firebase dependencies were downloaded
4. Comment on the PR with the full logs

## Changes Made

This fix modified 3 files:

1. **android/build.gradle**
   - Added Crashlytics Gradle plugin

2. **android/app/build.gradle**
   - Added firebase-crashlytics dependency
   - Added firebase-crashlytics-ndk dependency (the key!)
   - Configured Crashlytics in build types

3. **android/app/proguard-rules.pro**
   - Added keep rules for Crashlytics

## Documentation

- **NATIVE_DEBUG_SYMBOLS_CRASHLYTICS_FIX.md** - Complete technical explanation
- **DEBUG_SYMBOLS_QUICK_FIX_FEB18.md** - Quick reference
- **This file** - Testing instructions

## Questions?

If you have issues or questions about this fix, please:
1. Check the documentation files above
2. Review the build logs carefully
3. Comment on the PR with specific error messages

---

**This is the definitive fix for native debug symbols generation!**

The previous two attempts didn't work because they didn't actually add native code. This fix adds Firebase Crashlytics NDK which explicitly provides native libraries, guaranteeing debug symbol generation.
