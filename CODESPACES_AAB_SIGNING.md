# 🚀 Sign AAB in GitHub Codespaces

This guide shows you how to sign your AAB file directly in GitHub Codespaces browser terminal.

## ✅ Prerequisites

- ✅ **JDK installed** (Codespaces has this by default)
- ✅ **Keystore file** (`my-release-key.jks` - already in your repo)
- ✅ **Keystore password** (you need to know this)

---

## 🎯 Method 1: Automated Script (Recommended)

### Step 1: Download and Extract AAB from GitHub Actions

1. Go to: https://github.com/vicisaac48-eng/zikalyze/actions/workflows/android-build.yml
2. Click on a recent workflow run with `build_type: release`
3. Scroll to **Artifacts** section
4. Download **zikalyze-release-aab.zip** (saves to your Downloads folder)
5. **UNZIP the file** - Extract `zikalyze-release-aab.zip` to get `app-release.aab`
   - On Windows: Right-click → Extract All
   - On Mac: Double-click the .zip file
   - On Linux: `unzip zikalyze-release-aab.zip`

📦 **After extraction, you should have:** `app-release.aab` (the unsigned AAB file)

### Step 2: Upload to Codespaces

**Open GitHub Codespaces first, then:**

**Method A: Using File Explorer (Easiest)**
1. In Codespaces, create the directory structure:
   ```bash
   mkdir -p android/app/build/outputs/bundle/release
   ```
2. In Codespaces file explorer (left sidebar), navigate to:
   `android/app/build/outputs/bundle/release/`
3. Right-click on the `release` folder → Click "Upload..."
4. Select your **extracted** `app-release.aab` file from Downloads
5. The file will be uploaded as: `android/app/build/outputs/bundle/release/app-release.aab`

**Method B: Using Drag and Drop**
- Drag the extracted `app-release.aab` from your Downloads folder
- Drop it into: `android/app/build/outputs/bundle/release/` in Codespaces file explorer

✅ **Verify upload:**
```bash
ls -lh android/app/build/outputs/bundle/release/app-release.aab
# Should show file size (typically 5-15 MB)
```

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

**Important:** The signing happens **in-place** - the same `app-release.aab` file gets signed!

After signing successfully, download the **now-signed** AAB:

1. In Codespaces file explorer, navigate to: `android/app/build/outputs/bundle/release/`
2. Right-click on `app-release.aab`
3. Click "Download..."
4. Save to your local machine (e.g., Downloads folder)

📦 **The file location is the SAME:** `android/app/build/outputs/bundle/release/app-release.aab`
   - Before signing: Unsigned AAB
   - After signing: **Signed AAB** (ready for Play Store!)

✅ The signed AAB can now be uploaded to Google Play Console!

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
┌─────────────────────────────────────────────────────────────────┐
│  1. GitHub Actions builds unsigned AAB                          │
│     ├─ Workflow creates: app-release.aab                        │
│     └─ Uploaded as artifact: zikalyze-release-aab.zip           │
│                                                                  │
│  2. Download AAB artifact from GitHub Actions                   │
│     ├─ Download: zikalyze-release-aab.zip → Your computer       │
│     └─ **UNZIP to extract: app-release.aab**                    │
│                                                                  │
│  3. Upload extracted AAB to Codespaces                          │
│     ├─ Upload: app-release.aab                                  │
│     └─ To: android/app/build/outputs/bundle/release/            │
│                                                                  │
│  4. Sign AAB in Codespaces with your keystore                   │
│     ├─ Run: ./scripts/auto_sign_aab.sh                          │
│     └─ Signs in-place (same file gets signed)                   │
│                                                                  │
│  5. Download signed AAB from Codespaces                         │
│     ├─ File: android/app/build/outputs/bundle/release/app-release.aab │
│     └─ Right-click → Download                                   │
│                                                                  │
│  6. Upload signed AAB to Google Play Console                    │
│     └─ Ready for production! ✅                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## ❓ Frequently Asked Questions (FAQ)

### Q1: Do I need to unzip the file downloaded from GitHub Actions?

**A: YES!** ✅ 

When you download `zikalyze-release-aab.zip` from GitHub Actions artifacts, you **must unzip it** to extract the `app-release.aab` file inside.

- **Downloaded file:** `zikalyze-release-aab.zip` (ZIP archive)
- **After unzipping:** `app-release.aab` (the actual AAB file)
- **Upload to Codespaces:** The extracted `app-release.aab` file

### Q2: What exactly do I upload to Codespaces?

**A:** Upload the **extracted** `app-release.aab` file (NOT the .zip file)

**File path in Codespaces:** `android/app/build/outputs/bundle/release/app-release.aab`

### Q3: Where do I get the signed AAB after signing in Codespaces?

**A:** The **same location!** The signing happens in-place.

**Before signing:**
- Location: `android/app/build/outputs/bundle/release/app-release.aab`
- Status: Unsigned AAB

**After signing:**
- Location: `android/app/build/outputs/bundle/release/app-release.aab` (SAME FILE)
- Status: **Signed AAB** ✅

The `jarsigner` command signs the AAB file directly - it doesn't create a new file.

### Q4: How do I download the signed AAB from Codespaces?

**A:** Right-click on the same file and download it:

1. In Codespaces file explorer: `android/app/build/outputs/bundle/release/`
2. Right-click on `app-release.aab`
3. Click "Download..."
4. Save to your computer

### Q5: How can I tell if the AAB is signed?

**A:** Use the verify command:

```bash
jarsigner -verify android/app/build/outputs/bundle/release/app-release.aab
```

✅ **If signed:** `jar verified.`
❌ **If unsigned:** `jar is unsigned.`

### Q6: Do I need to rename the file after signing?

**A: NO!** The file name stays the same: `app-release.aab`

The signature is embedded inside the AAB file - you don't need to rename it.

### Q7: Complete file flow summary?

```
GitHub Actions Artifact (Download)
    ↓
zikalyze-release-aab.zip (on your computer)
    ↓ UNZIP
app-release.aab (extracted, unsigned)
    ↓ UPLOAD to Codespaces
android/app/build/outputs/bundle/release/app-release.aab (unsigned)
    ↓ RUN ./scripts/auto_sign_aab.sh
android/app/build/outputs/bundle/release/app-release.aab (SIGNED ✅ - same file!)
    ↓ DOWNLOAD from Codespaces
app-release.aab (on your computer, signed)
    ↓ UPLOAD to Play Store
Google Play Console ✅
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
