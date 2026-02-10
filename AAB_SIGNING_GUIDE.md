# 🔐 AAB Signing Guide

> **❓ Not sure what information you need to provide?** → **[Click here for a clear answer →](./SIGNING_INFO_NEEDED.md)**

This guide explains how to sign your Android App Bundle (AAB) for Google Play Store upload.

## 🎯 Quick Start

The easiest way to sign your AAB is using our automated script:

```bash
./scripts/sign_aab.sh
```

That's it! The script will guide you through the process.

---

## 📖 Understanding AAB Signing

### Why Do I Need to Sign My AAB?

Google Play Store requires all apps to be digitally signed to verify their authenticity and integrity. The signature:

- Proves you are the legitimate app developer
- Prevents tampering with your app
- Ensures updates come from the same developer

### Two Signing Options

#### Option 1: Google Play App Signing (Recommended) ⭐

**Best for:** Most developers, especially beginners

Let Google manage your signing key:

1. In Play Console: **Setup** → **App integrity**
2. Enable **"Play App Signing"**
3. Upload your **unsigned** AAB - Google signs it automatically
4. Google securely stores your signing key

**Advantages:**
- ✅ Google manages key security
- ✅ Can recover if you lose your upload key
- ✅ No local signing needed
- ✅ Easier workflow

**How to use:**
```bash
# Just build the AAB - no signing needed
cd android
./gradlew bundleRelease

# Upload the unsigned AAB directly to Play Console
# Google will sign it for you
```

#### Option 2: Sign Locally with Your Own Keystore

**Best for:** Advanced users who need full control

Sign the AAB yourself before uploading:

1. Create a keystore (one-time setup)
2. Sign the AAB with your keystore
3. Upload the signed AAB to Play Console

**Advantages:**
- ✅ Full control over signing process
- ✅ Can sign offline
- ✅ Use same key for multiple apps

**Disadvantages:**
- ⚠️ You must keep the keystore safe forever
- ⚠️ If you lose it, you can't update your app
- ⚠️ More complex workflow

---

## 🚀 Method 1: Using the Signing Script (Easiest)

### Prerequisites

- Java JDK installed (comes with `jarsigner` and `keytool`)
- AAB file built: `cd android && ./gradlew bundleRelease`

### Step 1: Run the Script

```bash
./scripts/sign_aab.sh
```

The script will:
1. ✅ Check if your AAB exists
2. ✅ Check if you have a keystore (or help you create one)
3. ✅ Sign your AAB
4. ✅ Verify the signature (optional)

### Step 2: Follow the Prompts

If you don't have a keystore, the script will ask if you want to create one:

```
⚠️  Keystore not found: zikalyze-release-key.jks
ℹ️  Do you want to create a new keystore? (y/n)
```

Type `y` and press Enter.

### Step 3: Create Your Keystore

You'll be asked for:

1. **Keystore password** - Choose a strong password (you'll need this for every update!)
2. **Key password** - Can be the same as keystore password
3. **Your details:**
   - First and last name: `Your Name` or `Your Company`
   - Organizational unit: `Development` (or leave blank)
   - Organization: `Your Company Name`
   - City/Locality: `Your City`
   - State/Province: `Your State`
   - Country code: `US` (two-letter code)

**⚠️ CRITICAL:** Write down your passwords! Store them in a password manager!

### Step 4: Sign the AAB

Enter your keystore password when prompted. The script will sign your AAB.

### Step 5: Verify (Optional)

Run with `--verify` to check the signature:

```bash
./scripts/sign_aab.sh --verify
```

---

## 🔧 Method 2: Manual Signing

### Step 1: Create a Keystore (One-Time Setup)

```bash
keytool -genkey -v \
  -keystore zikalyze-release-key.jks \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -alias zikalyze
```

**What this does:**
- Creates a keystore file: `zikalyze-release-key.jks`
- Generates an RSA key pair (2048-bit)
- Valid for 10,000 days (~27 years)
- Alias: `zikalyze` (the name of your key)

### Step 2: Build the AAB

```bash
cd android
./gradlew clean
./gradlew bundleRelease
```

Your AAB will be at:
```
android/app/build/outputs/bundle/release/app-release.aab
```

### Step 3: Sign the AAB

```bash
jarsigner -verbose \
  -sigalg SHA256withRSA \
  -digestalg SHA-256 \
  -keystore zikalyze-release-key.jks \
  android/app/build/outputs/bundle/release/app-release.aab \
  zikalyze
```

**Command breakdown:**
- `-verbose` - Show detailed signing process
- `-sigalg SHA256withRSA` - Signature algorithm (required by Play Store)
- `-digestalg SHA-256` - Digest algorithm (required by Play Store)
- `-keystore zikalyze-release-key.jks` - Your keystore file
- `android/app/build/outputs/bundle/release/app-release.aab` - AAB to sign
- `zikalyze` - Key alias from your keystore

### Step 4: Verify the Signature

```bash
jarsigner -verify -verbose -certs \
  android/app/build/outputs/bundle/release/app-release.aab
```

You should see:
```
jar verified.
```

---

## 🎛️ Advanced Usage

### Custom Keystore Location

```bash
./scripts/sign_aab.sh --keystore /path/to/my-keystore.jks --alias my-alias
```

### Custom AAB Path

```bash
./scripts/sign_aab.sh --aab /path/to/my-app.aab
```

### Sign and Verify

```bash
./scripts/sign_aab.sh --verify
```

### All Options

```bash
./scripts/sign_aab.sh \
  --keystore /path/to/keystore.jks \
  --alias my-key-alias \
  --aab /path/to/app.aab \
  --verify
```

---

## 🔒 Keystore Security Best Practices

### Protect Your Keystore

Your keystore is the key to your app's identity. **If you lose it, you can't update your app!**

**DO:**
- ✅ Store it in a secure location
- ✅ Back it up to multiple locations (encrypted cloud storage, external drive)
- ✅ Use a strong password
- ✅ Save passwords in a password manager
- ✅ Keep it private (never commit to Git)

**DON'T:**
- ❌ Commit it to version control
- ❌ Share it with anyone
- ❌ Store it only on one computer
- ❌ Use a weak or easy-to-guess password
- ❌ Email it or upload to unsecured locations

### Backup Your Keystore

```bash
# Backup to a secure location
cp zikalyze-release-key.jks ~/secure-backups/
cp zikalyze-release-key.jks /path/to/encrypted/cloud/storage/

# Verify backup
ls -lh ~/secure-backups/zikalyze-release-key.jks
```

### .gitignore Entry

Make sure your `.gitignore` includes:

```gitignore
# Signing keys - NEVER commit these!
*.jks
*.keystore
keystore.properties
```

---

## 🐛 Troubleshooting

### "jarsigner: command not found"

**Problem:** Java JDK not installed or not in PATH

**Solution:**
1. Install Java JDK: https://adoptium.net/
2. Verify installation: `java -version` and `jarsigner -version`

### "jarsigner: unable to open jar file"

**Problem:** AAB file doesn't exist or path is wrong

**Solution:**
```bash
# Build the AAB first
cd android
./gradlew bundleRelease

# Check it exists
ls -lh app/build/outputs/bundle/release/app-release.aab
```

### "jarsigner: keystore password was incorrect"

**Problem:** Wrong password or keystore is corrupted

**Solutions:**
1. Double-check your password
2. Make sure CAPS LOCK is off
3. If you truly forgot the password, you need to:
   - Create a new keystore
   - This will be a NEW app on Play Store (can't update existing)

### "jarsigner: certificate chain not found for: zikalyze"

**Problem:** Wrong alias or alias doesn't exist in keystore

**Solution:**
```bash
# List all aliases in your keystore
keytool -list -v -keystore zikalyze-release-key.jks

# Use the correct alias shown in the output
```

### Signature Verification Failed

**Problem:** AAB was modified after signing or signing failed

**Solution:**
```bash
# Re-sign the AAB
./scripts/sign_aab.sh

# Verify
jarsigner -verify -verbose android/app/build/outputs/bundle/release/app-release.aab
```

---

## 📤 After Signing: Upload to Play Store

### Step 1: Locate Your Signed AAB

```bash
android/app/build/outputs/bundle/release/app-release.aab
```

### Step 2: Upload to Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app
3. Navigate to: **Release** → **Production** (or **Internal Testing** for first release)
4. Click **"Create new release"**
5. Upload `app-release.aab`
6. Fill in release notes
7. Click **"Review release"** → **"Start rollout"**

### Step 3: First-Time Release

For your first release, use **Internal Testing**:

1. **Release** → **Testing** → **Internal testing**
2. Create release and upload signed AAB
3. Add test users (your email)
4. Test the internal release thoroughly
5. Only then promote to Production

---

## 🔄 Updating Your App

Every time you update your app:

### 1. Increment Version Code

Edit `android/app/build.gradle`:

```gradle
defaultConfig {
    versionCode 5        // Increment (was 4)
    versionName "1.3.0"  // Update version
}
```

### 2. Build New AAB

```bash
cd android
./gradlew clean
./gradlew bundleRelease
```

### 3. Sign with SAME Keystore

```bash
./scripts/sign_aab.sh
```

**⚠️ CRITICAL:** Always use the **SAME keystore** and **SAME alias** for updates!

### 4. Upload to Play Console

Same process as initial upload.

---

## 📋 Checklist: Signing Your AAB

Before signing:
- [ ] AAB built successfully
- [ ] Java JDK installed (jarsigner available)
- [ ] Keystore created and backed up
- [ ] Keystore password stored securely

Signing:
- [ ] Run `./scripts/sign_aab.sh` or manual jarsigner command
- [ ] Enter correct keystore password
- [ ] Signing completed successfully
- [ ] Signature verified

After signing:
- [ ] AAB ready at expected location
- [ ] Keystore backed up to secure location
- [ ] Ready to upload to Play Console

---

## 🆘 Need Help?

### Quick Reference

- **[What Information Do I Need? →](./SIGNING_INFO_NEEDED.md)** - Clear explanation of signing requirements
- **[Quick Start Guide](./QUICK_START_SIGNING.md)** - Fast track to signing
- **[Example Output](./SIGNING_EXAMPLES.md)** - See what to expect

### Check Existing Documentation

- [AAB Troubleshooting Guide](./AAB_TROUBLESHOOTING.md) - Common AAB issues
- [Play Store Deployment Guide](./docs/PLAYSTORE_DEPLOYMENT.md) - Complete deployment process

### Common Resources

- [Android App Signing](https://developer.android.com/studio/publish/app-signing)
- [Google Play Console](https://play.google.com/console)
- [Play App Signing](https://support.google.com/googleplay/android-developer/answer/9842756)

---

## 📚 Summary

| Method | Difficulty | Best For |
|--------|-----------|----------|
| **Google Play App Signing** | ⭐ Easiest | Most developers |
| **Automated Script** | ⭐⭐ Easy | Local signing |
| **Manual jarsigner** | ⭐⭐⭐ Advanced | Full control |

**Recommendation:** Start with Google Play App Signing for simplicity, or use our automated script for local signing.

---

**Remember:** Your keystore is like your app's birth certificate - keep it safe! 🔐
