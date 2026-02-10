# AAB Release Quick Start Guide

## 🚀 How to Generate AAB for Google Play Store

### Method 1: GitHub Actions (Recommended)

1. **Trigger the workflow:**
   - Go to: https://github.com/vicisaac48-eng/zikalyze/actions/workflows/android-build.yml
   - Click **"Run workflow"**
   - Select branch: `main`
   - Select build type: `release`
   - Click **"Run workflow"**

2. **Download the AAB:**
   - Wait for workflow to complete (~5-10 minutes)
   - Scroll to **Artifacts** section
   - Download **zikalyze-release-aab.zip**
   - Extract to get `app-release.aab`

3. **Sign the AAB:**
   ```bash
   # Option A: Fully automated (zero input required)
   ./scripts/auto_sign_aab.sh
   
   # Option B: Interactive signing
   ./scripts/sign_aab.sh
   ```

4. **Upload to Play Store:**
   - Go to: https://play.google.com/console
   - Navigate to: Your App → Production → Create new release
   - Upload the signed AAB file
   - Add release notes
   - Submit for review

---

### Method 2: Local Build

```bash
# 1. Install dependencies
npm ci

# 2. Build web assets
npm run build

# 3. Sync to Android
npx cap sync android

# 4. Build AAB
cd android
./gradlew bundleRelease
cd ..

# 5. AAB output location
# android/app/build/outputs/bundle/release/app-release.aab

# 6. Sign the AAB
./scripts/auto_sign_aab.sh
```

---

## 📁 Important Files

- **Workflow:** `.github/workflows/android-build.yml`
- **Signing Script:** `scripts/auto_sign_aab.sh` (fully automated)
- **Manual Signing:** `scripts/sign_aab.sh` (interactive)
- **Detailed Guide:** `AAB_SIGNING_GUIDE.md`
- **Quick Reference:** `QUICK_START_SIGNING.md`
- **Troubleshooting:** `AAB_TROUBLESHOOTING.md`

---

## ⚙️ Build Configuration

- **Android SDK:** compileSdk 35, targetSdk 35, minSdk 23
- **Java Version:** 21 (Temurin distribution)
- **Node Version:** 22
- **AGP Version:** 8.7.2
- **Capacitor:** Synced with web build

---

## 🔒 Security Notes

- Keystores are automatically generated with secure random passwords
- Password saved to `keystore-password.txt` (gitignored)
- Never commit keystores or passwords to git
- Keep keystore backup in safe location (lose it = can't update app)

---

## 📥 Workflow Outputs

When you run the workflow with `build_type: release`, you get:

1. **zikalyze-release-apk** (unsigned APK for testing)
2. **zikalyze-release-aab** (unsigned AAB for Play Store)

Both are retained for 30 days in GitHub Actions artifacts.

---

## 🆘 Troubleshooting

If workflow fails:
1. Check workflow logs for errors
2. Verify all dependencies are installed
3. Ensure Android SDK is properly configured
4. See `AAB_TROUBLESHOOTING.md` for common issues

If signing fails:
1. Ensure `jarsigner` is available (comes with JDK)
2. Check keystore path is correct
3. Verify password in `keystore-password.txt`
4. Try automated script: `./scripts/auto_sign_aab.sh`

---

## ✅ Quick Checklist

Before uploading to Play Store:

- [ ] AAB built successfully
- [ ] AAB signed with release keystore
- [ ] Version code incremented in `android/app/build.gradle`
- [ ] Version name updated (e.g., 1.0.1 → 1.0.2)
- [ ] Release notes prepared
- [ ] Screenshots updated (if UI changed)
- [ ] Privacy policy link working
- [ ] Terms of service link working
- [ ] ProGuard rules verified (`scripts/verify_aab.py`)

---

## 📞 Support

- **Signing Documentation:** `AAB_SIGNING_GUIDE.md`
- **Play Store Graphics:** `PLAYSTORE_GRAPHICS.md`
- **Deployment Guide:** `docs/PLAYSTORE_DEPLOYMENT.md`
- **Production URLs:** `PRODUCTION_LINKS_GUIDE.md`
