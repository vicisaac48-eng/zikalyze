# 🔧 AAB UTF-8 Encoding Issue - Fixed

## Problem Description

When uploading `.aab` (Android App Bundle) files to GitHub Codespace and attempting to open them, an error appears:

```
/workspace/zikalyze/android/app/output/bundle/release/app-release.aab is not UTF-8 encoded
```

## Root Cause

AAB files are **binary files** (they're essentially ZIP archives containing Android app resources and compiled code). The error occurs when:

1. Git tries to process the file as text instead of binary
2. Text editors in Codespace attempt to open the binary file as text
3. No `.gitattributes` file exists to tell Git how to handle binary files

## Solution Implemented

### 1. Created `.gitattributes` File

A `.gitattributes` file has been added to the repository root to explicitly mark binary file types:

```gitattributes
# Android binary files
*.aab binary
*.apk binary
*.dex binary
*.so binary
*.jar binary
*.jks binary
*.keystore binary
```

This ensures Git and other tools treat these files as binary data, not text.

### 2. Updated `.gitignore` Files

Updated both root and `android/.gitignore` to exclude build artifacts:

**Root `.gitignore`:**
```gitignore
# Android build artifacts (binary files)
*.aab
*.apk
android/app/build/
android/app/output/
```

**`android/.gitignore`:**
```gitignore
# Android build artifacts (AAB and APK files)
*.aab
*.apk
app/build/outputs/
app/output/
output/
```

### 3. Why AAB Files Should Not Be Committed

AAB and APK files are **build artifacts** and should generally not be committed to Git because:

- They are large binary files (typically 10-50 MB)
- They change with every build
- They bloat repository size
- They should be generated from source code, not stored
- CI/CD pipelines should build them fresh
- Release artifacts should be stored in proper artifact repositories or GitHub Releases

## How to Handle AAB Files Correctly

### For Local Development

1. **Build the AAB:**
   ```bash
   cd android
   ./gradlew bundleRelease
   ```

2. **AAB Location:**
   ```
   android/app/build/outputs/bundle/release/app-release.aab
   ```

3. **The file is automatically ignored by Git** - it won't be committed.

### For Distribution

**Option 1: GitHub Releases (Recommended)**
1. Build your AAB locally
2. Create a release on GitHub
3. Attach the AAB file as a release asset
4. Users/testers can download from the release page

**Option 2: Google Play Console (Production)**
1. Build the AAB
2. Upload directly to Play Console
3. Google handles distribution

**Option 3: CI/CD Artifacts**
1. Let your CI/CD build the AAB
2. Store as workflow artifact (temporary)
3. Download when needed for testing

### For Codespace Users

If you need to access an AAB file in Codespace:

1. **Download from GitHub Releases:**
   ```bash
   cd /workspace/zikalyze
   wget https://github.com/vicisaac48-eng/zikalyze/releases/download/v1.0.0/app-release.aab
   ```

2. **Build it in Codespace:**
   ```bash
   cd /workspace/zikalyze/android
   ./gradlew bundleRelease
   ```

3. **Transfer from local machine using CLI:**
   ```bash
   # Upload to Codespace
   gh codespace cp app-release.aab remote:/workspace/zikalyze/
   ```

## Verification

To verify the fix works:

1. **Check Git attributes:**
   ```bash
   cd /workspace/zikalyze
   git check-attr -a app-release.aab
   # Should show: app-release.aab: binary: set
   ```

2. **Check if AAB is ignored:**
   ```bash
   cd /workspace/zikalyze
   touch test.aab
   git status
   # test.aab should NOT appear in untracked files
   rm test.aab
   ```

3. **Build and verify:**
   ```bash
   cd android
   ./gradlew bundleRelease
   ls -lh app/build/outputs/bundle/release/app-release.aab
   # File should exist
   
   git status
   # app-release.aab should NOT appear as untracked
   ```

## Important Notes

### ✅ Do This:
- Keep `.gitattributes` in your repository
- Let CI/CD build AAB files
- Use GitHub Releases for distributing AAB files
- Build AAB fresh for each release
- Store signing keys securely (not in Git)

### ❌ Don't Do This:
- Don't commit AAB or APK files to Git
- Don't try to open AAB files in text editors
- Don't force-add ignored AAB files with `git add -f`
- Don't remove the `.gitattributes` file

## File Types Marked as Binary

The following file types are now correctly marked as binary in `.gitattributes`:

**Android:**
- `*.aab` - Android App Bundle
- `*.apk` - Android Package
- `*.dex` - Dalvik Executable
- `*.so` - Native Library
- `*.jar` - Java Archive
- `*.jks` - Java KeyStore
- `*.keystore` - Android KeyStore

**Images:**
- `*.png`, `*.jpg`, `*.jpeg`, `*.gif`, `*.ico`, `*.webp`, `*.svg`

**Fonts:**
- `*.ttf`, `*.otf`, `*.woff`, `*.woff2`, `*.eot`

**Archives:**
- `*.zip`, `*.gz`, `*.tar`, `*.rar`, `*.7z`, `*.aar`

## Troubleshooting

### If you still see UTF-8 errors:

1. **Clear Git cache:**
   ```bash
   git rm --cached -r .
   git reset --hard
   ```

2. **Verify .gitattributes is being used:**
   ```bash
   git check-attr -a *.aab
   ```

3. **Don't open AAB files in editors:**
   - AAB files are binary and can't be edited as text
   - Use Android Studio or bundletool to inspect them

4. **Use bundletool for inspection:**
   ```bash
   # Install bundletool
   # Download from: https://github.com/google/bundletool/releases
   
   # Inspect AAB contents
   bundletool dump manifest --bundle=app-release.aab
   
   # Extract files
   unzip app-release.aab -d aab-contents/
   ```

## Summary

✅ **Fixed:** Binary files (especially `.aab`) are now correctly marked as binary in `.gitattributes`

✅ **Fixed:** Build artifacts are ignored in `.gitignore` to prevent accidental commits

✅ **Best Practice:** AAB files should be built locally or by CI/CD, not stored in Git

✅ **Distribution:** Use GitHub Releases or Google Play Console for distributing AAB files

---

**Date Fixed:** February 17, 2026

**Files Modified:**
- `.gitattributes` (created)
- `.gitignore` (updated)
- `android/.gitignore` (updated)

**Related Documentation:**
- [AAB_SIGNING_GUIDE.md](./AAB_SIGNING_GUIDE.md)
- [AAB_TROUBLESHOOTING.md](./AAB_TROUBLESHOOTING.md)
- [AAB_RELEASE_QUICKSTART.md](./AAB_RELEASE_QUICKSTART.md)
