# 🚀 Quick Reference: AAB Files in Codespace

## ❌ Problem
```
Error: /workspace/zikalyze/android/app/output/bundle/release/app-release.aab is not UTF-8 encoded
```

## ✅ Solution (Already Applied)
- `.gitattributes` created - marks AAB as binary
- `.gitignore` updated - excludes build artifacts
- Binary files handled correctly by Git

## 📋 How to Work with AAB Files

### Build AAB in Codespace
```bash
cd /workspace/zikalyze/android
./gradlew bundleRelease
```
**Result:** `android/app/build/outputs/bundle/release/app-release.aab`

### Download AAB from Codespace
```bash
# Option 1: Use gh CLI
gh codespace cp remote:/workspace/zikalyze/android/app/build/outputs/bundle/release/app-release.aab ./app-release.aab

# Option 2: Download via Codespace UI
# Files → android/app/build/outputs/bundle/release/app-release.aab → Right-click → Download
```

### Upload AAB to Codespace
```bash
# Option 1: Use gh CLI
gh codespace cp ./app-release.aab remote:/workspace/zikalyze/

# Option 2: Upload via Codespace UI
# Files → Drag & drop file into Codespace file explorer
```

### Get AAB from GitHub Release
```bash
cd /workspace/zikalyze
wget https://github.com/vicisaac48-eng/zikalyze/releases/download/v1.0.0/app-release.aab
```

## ⚠️ Important Notes

### ✅ DO:
- Build AAB files fresh in Codespace
- Download AAB via CLI or UI (not Git)
- Use GitHub Releases for distribution
- Upload to Google Play Console directly

### ❌ DON'T:
- Don't commit AAB files to Git
- Don't try to open AAB in text editors
- Don't use `git add -f` for AAB files
- Don't expect to see AAB in git status

## 🔍 Verify Configuration

```bash
# Check if .aab files are binary
git check-attr -a test.aab
# Should show: test.aab: binary: set

# Check if .aab files are ignored
touch test.aab && git status
# test.aab should NOT appear
rm test.aab
```

## 📚 Full Documentation
See [AAB_UTF8_ENCODING_FIX.md](./AAB_UTF8_ENCODING_FIX.md) for complete details.

## 🆘 Still Having Issues?
1. Check `.gitattributes` exists
2. Run: `git check-attr -a *.aab`
3. Rebuild: `cd android && ./gradlew clean bundleRelease`
4. Use bundletool to inspect: `bundletool dump manifest --bundle=app-release.aab`
