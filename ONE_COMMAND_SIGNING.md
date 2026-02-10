# 🚀 ONE COMMAND AAB SIGNING

**Can't follow the manual steps? No problem!**

This is the easiest way to sign your AAB for Google Play Store - just ONE command!

## ⚡ THE ONE COMMAND

```bash
./scripts/auto_sign_aab.sh
```

That's it! Everything is automated:
- ✅ Builds the release AAB
- ✅ Creates a keystore (if needed)
- ✅ Signs the AAB
- ✅ Verifies the signature
- ✅ Copies the signed AAB to the root directory

**No questions asked, no manual input needed!**

---

## 📋 What It Does

When you run the script, it automatically:

1. **Checks dependencies** - Makes sure Java and signing tools are installed
2. **Builds your app** - Creates the release AAB from your code
3. **Creates keystore** - Generates a signing key with default credentials (if you don't have one)
4. **Signs the AAB** - Digitally signs your app bundle
5. **Verifies signature** - Confirms the signing was successful
6. **Copies the file** - Places `zikalyze-signed.aab` in the root directory for easy access

**Want to see exactly what it looks like when you run it?**
📸 **[See Example Output](./AUTOMATED_SIGNING_EXAMPLE.md)** - Visual walkthrough with screenshots of the process!

---

## 📦 What You Get

After running the script, you'll find:

- **zikalyze-signed.aab** - Your signed app bundle, ready for upload
- **zikalyze-release-key.jks** - Your keystore file (keep this safe!)

---

## 🔑 Important: Save Your Credentials

The script uses these default credentials:

- **Keystore Password:** `zikalyze2024`
- **Key Alias:** `zikalyze`
- **Keystore File:** `zikalyze-release-key.jks`

**⚠️ CRITICAL: You MUST keep the keystore file and password safe!**

Without them, you cannot update your app on Google Play Store!

### How to Backup Your Keystore

```bash
# Copy to a safe location (example)
cp zikalyze-release-key.jks ~/Dropbox/zikalyze-backup/
# Or upload to cloud storage, USB drive, etc.
```

---

## 🚀 Upload to Google Play

Once the script completes:

1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app (or create a new one)
3. Navigate to: **Release** → **Production** (or **Internal Testing** for testing first)
4. Click **"Create new release"**
5. Upload: `zikalyze-signed.aab` (from your root directory)
6. Fill in release notes
7. Click **"Review release"** → **"Start rollout"**

---

## 🆘 Troubleshooting

### "Java not found"
Install Java JDK: https://adoptium.net/

### "Permission denied"
Make the script executable:
```bash
chmod +x ./scripts/auto_sign_aab.sh
```

### "Build failed"
Make sure you're in the project root directory and have all dependencies installed:
```bash
npm install
```

### Want to change the password?
Edit `scripts/auto_sign_aab.sh` and change these lines:
```bash
KEYSTORE_PASSWORD="your-password-here"
KEY_PASSWORD="your-password-here"
```

---

## 🎯 Quick Comparison

| Method | Commands | Manual Steps | Time |
|--------|----------|--------------|------|
| **Manual signing** | 5-10+ commands | Many | 10-15 min |
| **Semi-automated** | `./scripts/sign_aab.sh` | Few prompts | 5-10 min |
| **Fully automated** | `./scripts/auto_sign_aab.sh` | Zero! | 2-5 min |

---

## 💡 Pro Tips

1. **First time?** Use Internal Testing first to test the upload
2. **Increment version** - Update version in `android/app/build.gradle` before each build
3. **Test locally** - Make sure your app works before signing
4. **Backup keystore** - Store it in multiple secure locations

---

## 📚 More Information

- **Full signing guide:** [AAB_SIGNING_GUIDE.md](./AAB_SIGNING_GUIDE.md)
- **Quick reference:** [QUICK_START_SIGNING.md](./QUICK_START_SIGNING.md)
- **Troubleshooting:** [AAB_TROUBLESHOOTING.md](./AAB_TROUBLESHOOTING.md)
- **Play Store guide:** [docs/PLAYSTORE_DEPLOYMENT.md](./docs/PLAYSTORE_DEPLOYMENT.md)

---

## ✨ That's It!

You asked for help because you couldn't follow the steps - now you don't need to!

Just run:
```bash
./scripts/auto_sign_aab.sh
```

And you're done! 🎉

---

**Questions?** Check the troubleshooting guides above or open an issue on GitHub.
