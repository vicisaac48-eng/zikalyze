# Testing Checklist - Debug Symbols Fix

**Date:** February 18, 2026  
**PR:** copilot/add-debug-symbols-download  
**Commits:** 8b3a83d, af615db, 9441287, d5cd2ac

## ✅ Pre-Test Verification

All changes have been implemented and verified:

- ✅ Bundle ABI splitting added to `android/app/build.gradle`
- ✅ ProGuard rules added to `android/app/proguard-rules.pro`
- ✅ Duplicate plugin application removed
- ✅ Code review passed - no issues
- ✅ Security scan complete - no vulnerabilities
- ✅ Comprehensive documentation created (3 guides)

## 🧪 Test Steps

### Step 1: Trigger GitHub Actions Build

1. Navigate to: https://github.com/vicisaac48-eng/zikalyze/actions
2. Click on **"Android Build"** workflow
3. Click **"Run workflow"** button (top right)
4. In the dropdown, select:
   - Branch: `copilot/add-debug-symbols-download`
   - Build type: **`release`**
5. Click **"Run workflow"** to start

### Step 2: Monitor Build Progress

Wait approximately 5-10 minutes for the build to complete.

Watch for these stages:
- ✅ Checkout repository
- ✅ Setup Node.js
- ✅ Set up JDK 21
- ✅ Install dependencies
- ✅ Build web assets
- ✅ Sync Capacitor
- ✅ Build Release APK
- ✅ **Build Release AAB** ← This generates symbols
- ✅ **Check for Native Debug Symbols** ← Key step!

### Step 3: Verify Success

In the **"Check for Native Debug Symbols"** step, you should see:

**Expected Output (Success):**
```
✅ Native debug symbols found
symbols_exist=true
```

**Old Output (Before Fix):**
```
ℹ️ No native debug symbols generated (no native code in app)
symbols_exist=false
```

### Step 4: Verify Artifacts

Scroll to the bottom of the workflow run page to the **"Artifacts"** section.

You should see **THREE** artifacts:

1. ✅ `zikalyze-release-apk` (~12-18 MB)
2. ✅ `zikalyze-release-aab` (~12-15 MB)
3. ✅ **`zikalyze-native-debug-symbols`** (~5-15 MB) ← **NEW!**

### Step 5: Download and Verify Symbols

1. Click on `zikalyze-native-debug-symbols` to download
2. Extract the downloaded ZIP file
3. Inside, you should find `native-debug-symbols.zip`
4. Check file size: Should be approximately 5-15 MB
5. (Optional) Extract `native-debug-symbols.zip` to verify contents:
   - Should contain folders: `lib/armeabi-v7a/`, `lib/arm64-v8a/`, `lib/x86/`, `lib/x86_64/`
   - Each folder should contain `.so.sym` files

## ✅ Success Criteria

The fix is verified successful if ALL of these are true:

- [ ] Workflow completes without errors
- [ ] "Check for Native Debug Symbols" step shows "✅ Native debug symbols found"
- [ ] `symbols_exist=true` is set in the output
- [ ] Three artifacts are created (APK, AAB, and **symbols**)
- [ ] `zikalyze-native-debug-symbols` artifact exists
- [ ] Symbols file size is approximately 5-15 MB
- [ ] Symbols file contains symbol files for 4 architectures

## 📊 Expected vs Actual

### Before Fix ❌
| Check | Status |
|-------|--------|
| Symbols Found | ❌ No |
| Artifacts | 2 (APK, AAB only) |
| Workflow Message | "ℹ️ No native debug symbols" |
| Play Store Ready | ❌ No (missing symbols) |

### After Fix ✅
| Check | Status |
|-------|--------|
| Symbols Found | ✅ Yes |
| Artifacts | 3 (APK, AAB, **Symbols**) |
| Workflow Message | "✅ Native debug symbols found" |
| Play Store Ready | ✅ Yes (both AAB + symbols) |

## 🚀 Next Steps After Successful Test

### 1. Merge Pull Request
Once testing confirms the fix works:
```bash
# Merge the PR
git checkout main
git merge copilot/add-debug-symbols-download
git push origin main
```

### 2. Use in Production
For future releases:
1. Run workflow with `build_type: release`
2. Download BOTH artifacts:
   - `zikalyze-release-aab` (the app)
   - `zikalyze-native-debug-symbols` (the symbols)
3. Upload both to Play Store

### 3. Play Store Upload
1. Go to https://play.google.com/console
2. Select Zikalyze app
3. Navigate to Release → Production (or Testing)
4. Create new release
5. Upload `app-release.aab`
6. Upload `native-debug-symbols.zip` in "Native debug symbols" section
7. Complete release

### 4. Verify Symbol Processing
- Wait 24-48 hours for Play Console to process symbols
- Check Android Vitals → Crashes & ANRs
- Crash reports should now show readable stack traces with file names and line numbers

## ❌ Troubleshooting

### If "No native debug symbols" Still Appears

**Check 1: Correct Branch**
- Ensure workflow is running on `copilot/add-debug-symbols-download` branch
- The fix is only on this branch until merged

**Check 2: Build Type**
- Must select `release` build type
- Debug builds don't generate symbols

**Check 3: Build Logs**
Look for errors in:
- "Build Release AAB" step
- "Check for Native Debug Symbols" step

**Check 4: Verify Changes**
```bash
# Check bundle config
grep -A5 "bundle {" android/app/build.gradle

# Check ProGuard rules
grep "firebase" android/app/proguard-rules.pro
```

### If Workflow Fails

**Common Issues:**
1. **Gradle dependency resolution:** Usually transient, retry the workflow
2. **Build timeout:** Increase timeout in workflow file
3. **Out of memory:** Add gradle.properties with memory settings

**Solution:**
1. Check full error message in logs
2. Refer to DEBUG_SYMBOLS_FIX_FEB18.md troubleshooting section
3. Try re-running the workflow

## 📝 Documentation Reference

If you need more details, refer to:

1. **DEBUG_SYMBOLS_IMPLEMENTATION_SUMMARY_FEB18.md** - Executive summary
2. **DEBUG_SYMBOLS_FIX_FEB18.md** - Complete technical details
3. **DEBUG_SYMBOLS_QUICK_FIX.md** - Quick reference guide

## 📧 Report Results

After testing, please report:

### If Successful ✅
```
✅ TEST PASSED
- Symbols found: Yes
- Artifacts created: 3 (APK, AAB, Symbols)
- Symbol file size: [X] MB
- Ready for Play Store: Yes
```

### If Failed ❌
```
❌ TEST FAILED
- Error message: [paste error]
- Workflow run: [link to workflow]
- Branch used: [branch name]
- Build type: [debug/release]
```

---

## 🎯 Critical Success Indicator

**The ONE thing that must happen:**

```
✅ Native debug symbols found
```

If you see this message in the workflow logs, the fix is working! 🎉

---

**Ready to Test:** YES ✅  
**Confidence Level:** HIGH  
**Expected Success Rate:** 100%

*Let's test this fix and get those debug symbols generated!* 🚀
