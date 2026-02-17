# GitHub Actions Workflow - Debug Symbols Integration

## Overview

The Android build workflow has been updated to automatically collect native debug symbols alongside the AAB file, making Play Store deployment simpler and more reliable.

## What Changed

### Workflow Enhancement
Added automatic collection of native debug symbols in the GitHub Actions Android build workflow (`.github/workflows/android-build.yml`).

### Before
When running the workflow with `build_type: release`, you got:
- ✅ `zikalyze-release-apk` (APK for testing)
- ✅ `zikalyze-release-aab` (AAB for Play Store)
- ❌ Debug symbols (missing - had to build locally)

### After
When running the workflow with `build_type: release`, you now get:
- ✅ `zikalyze-release-apk` (APK for testing)
- ✅ `zikalyze-release-aab` (AAB for Play Store)
- ✅ `zikalyze-native-debug-symbols` (debug symbols ZIP - if native code exists) ⭐ **NEW**

**Note:** Debug symbols are only generated when your app includes native libraries (`.so` files). If no native code exists, the workflow will complete successfully without the debug symbols artifact, and the build summary will indicate this is normal behavior.

## How to Use

### Step 1: Trigger the Workflow

1. Go to: https://github.com/vicisaac48-eng/zikalyze/actions/workflows/android-build.yml
2. Click **"Run workflow"**
3. Select branch: `main`
4. Select build type: `release`
5. Click **"Run workflow"**

### Step 2: Wait for Build (5-10 minutes)

The workflow will:
1. Build web assets (`npm run build`)
2. Sync to Android (`npx cap sync android`)
3. Build release APK (`./gradlew assembleRelease`)
4. Build release AAB (`./gradlew bundleRelease`) ← **This also generates debug symbols**
5. Upload three artifacts to GitHub

### Step 3: Download Artifacts

Scroll to the **Artifacts** section at the bottom of the workflow run page:

1. **Download zikalyze-release-aab.zip**
   - Contains: `app-release.aab` (unsigned)
   - Size: ~10-30 MB

2. **Download zikalyze-native-debug-symbols.zip** ⭐ **NEW**
   - Contains: `native-debug-symbols.zip`
   - Size: ~5-15 MB
   - This is the file Play Store needs!

3. (Optional) Download zikalyze-release-apk.zip
   - Contains: `app-release-unsigned.apk`
   - For testing on device before Play Store upload

### Step 4: Sign the AAB

```bash
# Extract the AAB from the downloaded zip
unzip zikalyze-release-aab.zip

# Sign the AAB with your keystore
./scripts/auto_sign_aab.sh

# Debug symbols don't need signing - use as-is
```

### Step 5: Upload to Play Store

1. Go to [Google Play Console](https://play.google.com/console)
2. Navigate to: Your App → Release → Production (or Testing)
3. Click "Create new release"
4. **Upload the signed AAB** (e.g., `app-release-signed.aab`)
5. **Upload the debug symbols ZIP** (from the downloaded artifact)
   - Look for "Native debug symbols" section
   - Upload the `native-debug-symbols.zip` file directly
6. Add release notes
7. Submit for review

## Workflow Summary Output

When the workflow completes, you'll see a summary like this:

```
📱 Android Build Summary

| Property     | Value    |
|--------------|----------|
| Build Type   | release  |
| Triggered By | username |
| Commit       | abc1234  |

📥 Download Instructions

1. Scroll down to the Artifacts section below
2. Download zikalyze-release-aab for Play Store upload
3. Download zikalyze-native-debug-symbols (required by Play Store)
4. Upload BOTH files to Google Play Console

⚠️ Important: Play Store requires both AAB and debug symbols to avoid warnings
```

## Benefits

### ✅ Automation
- One workflow run produces everything needed for Play Store
- No need to run local builds just for debug symbols
- Consistent environment (GitHub Actions runner)

### ✅ Convenience
- Both files available in one place (workflow artifacts)
- 30-day retention for both AAB and debug symbols
- Can share workflow run link with team members

### ✅ Reliability
- Can't forget to generate debug symbols
- Workflow summary reminds you to download both
- Clear warnings about Play Store requirements

### ✅ Consistency
- Same build process for every release
- Reproducible builds with version tracking
- All artifacts tied to specific commit SHA

## Technical Details

### Artifact Upload Configuration

```yaml
- name: Check for Native Debug Symbols
  if: github.event.inputs.build_type == 'release'
  id: check_symbols
  run: |
    if [ -f "android/app/build/outputs/native-debug-symbols/release/native-debug-symbols.zip" ]; then
      echo "symbols_exist=true" >> $GITHUB_OUTPUT
      echo "✅ Native debug symbols found"
    else
      echo "symbols_exist=false" >> $GITHUB_OUTPUT
      echo "ℹ️ No native debug symbols generated (no native code in app)"
    fi

- name: Upload Native Debug Symbols
  if: github.event.inputs.build_type == 'release' && steps.check_symbols.outputs.symbols_exist == 'true'
  uses: actions/upload-artifact@v4
  with:
    name: zikalyze-native-debug-symbols
    path: android/app/build/outputs/native-debug-symbols/release/native-debug-symbols.zip
    retention-days: 30
```

**Key Points:**
- The workflow first checks if the debug symbols file exists
- Upload only occurs if the file is present
- This prevents "file not found" warnings when no native code exists
- Build summary adapts based on whether symbols were generated

### Build Output Locations

After `./gradlew bundleRelease`, these files are created:

```
android/app/build/outputs/
├── bundle/release/
│   └── app-release.aab                                    ← Always created, uploaded as zikalyze-release-aab
├── native-debug-symbols/release/
│   └── native-debug-symbols.zip                           ← Only if native code exists, uploaded as zikalyze-native-debug-symbols
└── apk/release/
    └── app-release-unsigned.apk                           ← Always created, uploaded as zikalyze-release-apk
```

**When are debug symbols generated?**
The `native-debug-symbols.zip` file is only created when your app includes native libraries. This happens when:
- Using Firebase SDK (includes native components)
- Using React Native modules
- Including custom native code (C/C++)
- Using third-party libraries with `.so` files

If your app is pure web/JavaScript (like a basic Capacitor app), no native symbols are generated, and that's perfectly normal.

### Artifact Naming

| Workflow Artifact Name          | Contains                    | Purpose                        |
|--------------------------------|----------------------------|--------------------------------|
| zikalyze-release-apk           | app-release-unsigned.apk   | Testing on device             |
| zikalyze-release-aab           | app-release.aab            | Play Store upload (after signing) |
| zikalyze-native-debug-symbols  | native-debug-symbols.zip   | Play Store debug symbol upload |

## Troubleshooting

### Artifact Not Found

**Problem:** `zikalyze-native-debug-symbols` artifact is missing

**Causes:**
- Workflow was run with `build_type: debug` (debug symbols only for release)
- App has no native libraries yet (debug symbols only generated when native code exists)
- Workflow failed before upload step
- Old workflow version (before this update)

**Solution:**
1. Re-run workflow with `build_type: release`
2. Check workflow logs - look for "No native debug symbols generated" message
3. This is NORMAL if your app has no native libraries (`.so` files) yet
4. Debug symbols will be automatically generated once native libraries are added (e.g., from Firebase SDK, native modules, etc.)
5. Ensure workflow file is up to date with latest changes

### Wrong File in Artifact

**Problem:** Downloaded artifact doesn't contain `native-debug-symbols.zip`

**Causes:**
- Downloaded wrong artifact (e.g., downloaded AAB instead of symbols)
- Artifact zip not extracted

**Solution:**
1. Verify you downloaded `zikalyze-native-debug-symbols.zip`
2. Extract the outer zip to reveal `native-debug-symbols.zip` inside
3. Upload the inner `native-debug-symbols.zip` to Play Store

### Upload Rejected by Play Store

**Problem:** Play Console rejects the debug symbols file

**Causes:**
- Version code mismatch between AAB and symbols
- Symbols from different build than AAB

**Solution:**
1. Download both AAB and symbols from the same workflow run
2. Ensure version codes match
3. Don't mix artifacts from different builds

## Best Practices

### 1. Always Use the Same Workflow Run
- Download AAB and debug symbols from the same workflow run
- Don't mix files from different builds
- Version codes must match exactly

### 2. Keep Workflow Artifacts
- GitHub retains artifacts for 30 days
- After 30 days, keep local copies if needed
- Store workflow run URL for reference

### 3. Verify Before Upload
```bash
# Check AAB version
unzip -p zikalyze-release-aab.zip app-release.aab | grep versionCode

# Verify debug symbols exist
unzip -l zikalyze-native-debug-symbols.zip
```

### 4. Document Your Process
- Note workflow run URL in release notes
- Track which commit SHA produced each release
- Keep mapping of Play Store version → workflow run

## Related Documentation

- **PLAYSTORE_DEBUG_SYMBOLS.md**: Complete guide on debug symbols
- **QUICK_FIX_DEBUG_SYMBOLS.md**: Quick reference
- **AAB_RELEASE_QUICKSTART.md**: Full release process
- **DEBUG_SYMBOLS_IMPLEMENTATION_SUMMARY.md**: Technical implementation

## Example Workflow Run

Here's what a successful release build looks like:

```
✅ Build Android
  ✅ Checkout repository
  ✅ Setup Node.js 22
  ✅ Set up JDK 21
  ✅ Setup Android SDK
  ✅ Install dependencies (npm ci)
  ✅ Build web assets (npm run build)
  ✅ Sync Capacitor (npx cap sync android)
  ✅ Make gradlew executable
  ✅ Build Release APK (./gradlew assembleRelease)
  ✅ Build Release AAB (./gradlew bundleRelease)
  ✅ Upload Release APK → zikalyze-release-apk
  ✅ Upload Release AAB → zikalyze-release-aab
  ✅ Upload Native Debug Symbols → zikalyze-native-debug-symbols ⭐ NEW
  ✅ Build Summary

📥 Artifacts (3)
  - zikalyze-release-apk (30 days)
  - zikalyze-release-aab (30 days)
  - zikalyze-native-debug-symbols (30 days) ⭐ NEW
```

---

**Last Updated:** February 17, 2026  
**Workflow Version:** android-build.yml (with debug symbols support)  
**Status:** ✅ Production Ready
