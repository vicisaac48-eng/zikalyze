# 🚀 Sign AAB in GitHub Codespaces

This guide shows you how to sign your AAB file directly in GitHub Codespaces browser terminal.

## ✅ Prerequisites

- ✅ **JDK installed** (Codespaces has this by default)
- ✅ **Keystore file** (`my-release-key.jks` - already in your repo)
- ✅ **Keystore password** (you need to know this)

---

## 🎯 Method 1: Automated Script (Recommended)

### Step 1: Download AAB from GitHub Actions

1. Go to: https://github.com/vicisaac48-eng/zikalyze/actions/workflows/android-build.yml
2. Click on a recent workflow run with `build_type: release`
3. Scroll to **Artifacts** section
4. Download **zikalyze-release-aab.zip**

### Step 2: Upload to Codespaces

In Codespaces terminal:

```bash
# Create the directory if it doesn't exist
mkdir -p android/app/build/outputs/bundle/release

# Upload the AAB file using Codespaces file explorer
# Drag and drop the extracted app-release.aab to:
# android/app/build/outputs/bundle/release/app-release.aab
```

Or use the Codespaces upload feature:
- Right-click on `android/app/build/outputs/bundle/release/` folder
- Click "Upload..."
- Select your `app-release.aab` file

### Step 3: Set Your Keystore Password

Choose one of these methods:

**Option A: Environment Variable (Most Secure)**
```bash
export KEYSTORE_PASSWORD='your-password-here'
```

**Option B: Password File**
```bash
echo 'your-password-here' > keystore-password.txt
```

**Option C: Manual Entry**
The script will prompt you for the password if neither above is set.

### Step 4: Run the Auto-Signing Script

```bash
./scripts/auto_sign_aab.sh
```

That's it! The script will:
- ✅ Verify the AAB exists
- ✅ Check the keystore
- ✅ Get the password (from env var, file, or prompt)
- ✅ Sign the AAB
- ✅ Verify the signature

### Step 5: Download the Signed AAB

After signing, download the signed AAB:

1. Right-click on `android/app/build/outputs/bundle/release/app-release.aab`
2. Click "Download..."
3. Save to your local machine

Now you can upload it to Google Play Console!

---

## 🛠️ Method 2: Manual Signing

If you prefer to sign manually:

```bash
# Sign the AAB
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
  -keystore my-release-key.jks \
  android/app/build/outputs/bundle/release/app-release.aab \
  my-key-alias

# You'll be prompted for:
# 1. Keystore password
# 2. Key password (press Enter if same as keystore password)

# Verify the signature
jarsigner -verify android/app/build/outputs/bundle/release/app-release.aab
```

---

## 🔧 Troubleshooting

### "AAB file not found"
Make sure you've uploaded the AAB to the correct location:
```bash
ls -lh android/app/build/outputs/bundle/release/app-release.aab
```

### "jarsigner not found"
Codespaces should have JDK by default. If not:
```bash
sudo apt-get update
sudo apt-get install -y openjdk-17-jdk
```

### "Wrong password"
Double-check your keystore password. If you forgot it:
- ❌ There's no way to recover a lost keystore password
- ✅ You'll need to create a new keystore (but can't update existing apps)

### "Keystore not found"
Make sure `my-release-key.jks` exists in the repo root:
```bash
ls -lh my-release-key.jks
```

---

## 🔒 Security Best Practices

### DO ✅
- Use environment variables for passwords in Codespaces
- Delete `keystore-password.txt` after signing
- Download signed AAB and delete from Codespaces
- Keep keystore backed up in a secure location

### DON'T ❌
- Don't commit keystore passwords to git
- Don't share your keystore file publicly
- Don't lose your keystore (can't update app without it)

---

## 📋 Quick Command Reference

```bash
# Set password as environment variable
export KEYSTORE_PASSWORD='your-password'

# Auto-sign AAB
./scripts/auto_sign_aab.sh

# Sign with custom paths
./scripts/auto_sign_aab.sh \
  path/to/app.aab \
  path/to/keystore.jks \
  key-alias

# Verify signature
jarsigner -verify android/app/build/outputs/bundle/release/app-release.aab

# Check keystore contents
keytool -list -v -keystore my-release-key.jks

# Check AAB file size
du -h android/app/build/outputs/bundle/release/app-release.aab
```

---

## 🎓 Understanding the Workflow

```
┌─────────────────────────────────────────────────────────────┐
│  1. GitHub Actions builds unsigned AAB                      │
│     ↓                                                        │
│  2. Download AAB artifact from Actions                      │
│     ↓                                                        │
│  3. Upload AAB to Codespaces                                │
│     ↓                                                        │
│  4. Sign AAB in Codespaces with your keystore               │
│     ↓                                                        │
│  5. Download signed AAB from Codespaces                     │
│     ↓                                                        │
│  6. Upload signed AAB to Google Play Console                │
└─────────────────────────────────────────────────────────────┘
```

---

## 📞 Need Help?

See also:
- **Full Signing Guide:** `AAB_SIGNING_GUIDE.md`
- **Quick Start:** `AAB_RELEASE_QUICKSTART.md`
- **Troubleshooting:** `AAB_TROUBLESHOOTING.md`
- **Manual Signing:** `scripts/sign_aab.sh` (interactive)

---

**Happy Signing! 🎉**
