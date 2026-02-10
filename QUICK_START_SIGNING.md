# 🚀 Quick Start: Sign Your AAB

> **❓ Confused about what information you need?** → See **[SIGNING_INFO_NEEDED.md](./SIGNING_INFO_NEEDED.md)** for a clear explanation.

This is a quick reference for signing your Android App Bundle (AAB). For complete details, see [AAB_SIGNING_GUIDE.md](./AAB_SIGNING_GUIDE.md).

## ⚡ Fastest Way to Sign Your AAB

### Step 1: Build the AAB

```bash
cd android
./gradlew bundleRelease
cd ..
```

### Step 2: Sign with Automated Script

```bash
./scripts/sign_aab.sh
```

That's it! The script will:
- ✅ Check if your AAB exists
- ✅ Help you create a keystore if needed
- ✅ Sign your AAB
- ✅ Guide you through upload

### Step 3: Upload to Play Store

1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app
3. **Release** → **Production** (or **Internal Testing**)
4. Upload: `android/app/build/outputs/bundle/release/app-release.aab`
5. Review and publish

---

## 📝 What You'll Need

### First Time Signing:

You'll be asked to create a keystore and provide:
- **Keystore password** (choose a strong one!)
- **Your name** or company name
- **Organization** (optional)
- **City/State/Country**

**⚠️ SAVE YOUR PASSWORD!** You'll need it for every update.

### Subsequent Signings:

Just your keystore password.

---

## 🔄 Alternative: Google Play App Signing

Don't want to manage keys yourself? Use Google Play App Signing:

1. Build AAB: `cd android && ./gradlew bundleRelease`
2. In Play Console: **Setup** → **App integrity** → Enable **"Play App Signing"**
3. Upload **unsigned** AAB - Google signs it automatically

**Benefits:**
- ✅ Google manages your signing key
- ✅ Can't lose your key
- ✅ No local signing needed

---

## 🆘 Common Issues

### "jarsigner: command not found"
Install Java JDK: https://adoptium.net/

### "AAB file not found"
Build it first: `cd android && ./gradlew bundleRelease`

### "Wrong password"
Double-check your password. If you forgot it, you need to create a new keystore (this becomes a new app).

---

## 📚 More Help

- **Complete guide**: [AAB_SIGNING_GUIDE.md](./AAB_SIGNING_GUIDE.md)
- **Troubleshooting**: [AAB_TROUBLESHOOTING.md](./AAB_TROUBLESHOOTING.md)
- **Deployment guide**: [docs/PLAYSTORE_DEPLOYMENT.md](./docs/PLAYSTORE_DEPLOYMENT.md)

---

## 💡 Pro Tips

1. **Backup your keystore** to multiple secure locations
2. **Use a password manager** to store your keystore password
3. **Test on Internal Testing** before going to Production
4. **Increment version code** in `android/app/build.gradle` for each update

---

**Your command from the issue:**
```bash
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
  -keystore zikalyze-release-key.jks \
  android/app/build/outputs/bundle/release/app-release.aab \
  zikalyze
```

This is exactly what our script does for you, plus error handling and verification! 🚀
