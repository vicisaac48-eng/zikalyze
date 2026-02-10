# 📋 What Information Do You Need to Sign Your AAB?

**Quick Answer:** For most users, you don't need ANY information upfront! Just run:

```bash
./scripts/sign_aab.sh
```

The script uses smart defaults and will guide you through the process. However, if you want to customize the signing process, here's what you might need:

---

## 🎯 Information Required (Only If Customizing)

### Option 1: Use Defaults (Recommended for First-Time Users)

**You need:** Nothing! Just run the script.

The script will automatically use:
- **Keystore file**: `zikalyze-release-key.jks` (created in current directory)
- **Key alias**: `zikalyze`
- **AAB file**: `android/app/build/outputs/bundle/release/app-release.aab`

If the keystore doesn't exist, the script will offer to create it for you.

### Option 2: Custom Files (Advanced Users)

If you already have a keystore or want to use different files, provide:

1. **Keystore file name and location**
   - Example: `my-release-key.jks` or `/path/to/my-keystore.jks`
   - Default: `zikalyze-release-key.jks`

2. **Key alias** (the name of your key inside the keystore)
   - Example: `my-key-alias`
   - Default: `zikalyze`

3. **AAB file name and location** (if not in default location)
   - Example: `app-release.aab` or `custom/path/app.aab`
   - Default: `android/app/build/outputs/bundle/release/app-release.aab`

4. **Keystore password** (you'll be prompted when needed)
   - This is the password you set when creating the keystore
   - The script will ask for it when signing

---

## 🚀 How to Run the Signing Command

### Quick Start (Most Users)

```bash
# Step 1: Build the AAB
cd android
./gradlew bundleRelease
cd ..

# Step 2: Sign it (using defaults)
./scripts/sign_aab.sh
```

### Custom Files

```bash
./scripts/sign_aab.sh --keystore my-release-key.jks --alias my-key-alias --aab /path/to/app.aab
```

### All Options

```bash
./scripts/sign_aab.sh \
  --keystore <keystore-file-name> \
  --alias <key-alias-name> \
  --aab <aab-file-path> \
  --verify
```

---

## 📝 Pre-Signing Checklist

Before running the signing command, make sure:

- [ ] **AAB is built**: Run `cd android && ./gradlew bundleRelease`
- [ ] **Java JDK installed**: Run `jarsigner -version` to verify
- [ ] **Know where your files are**:
  - Where is your keystore? (or create new one)
  - Where is your AAB file?
  - What is your key alias? (if using existing keystore)

If you're unsure about any of these, just run `./scripts/sign_aab.sh` and let the script guide you!

---

## 🔍 Finding Your Information

### Where is my AAB file?

After building with `./gradlew bundleRelease`, your AAB is at:
```
android/app/build/outputs/bundle/release/app-release.aab
```

Verify it exists:
```bash
ls -lh android/app/build/outputs/bundle/release/app-release.aab
```

### Where is my keystore file?

If you created it before, common locations:
- Current directory: `./your-keystore.jks`
- Home directory: `~/keystores/your-keystore.jks`
- Android folder: `./android/your-keystore.jks`

Find it:
```bash
find . -name "*.jks" 2>/dev/null
```

### What is my key alias?

If you forgot your key alias, list all aliases in your keystore:
```bash
keytool -list -v -keystore your-keystore.jks
```

Look for "Alias name:" in the output.

### I don't have a keystore yet

Perfect! The script will create one for you. Just run:
```bash
./scripts/sign_aab.sh
```

When prompted, choose `y` to create a new keystore.

---

## 💡 Example Scenarios

### Scenario 1: First-Time User

**What you have:**
- Just built the AAB for the first time
- No keystore yet
- Want to use defaults

**What to do:**
```bash
./scripts/sign_aab.sh
```

**What you'll be asked:**
1. Create new keystore? → Type `y`
2. Enter new password → Choose a strong password
3. Enter your details → Name, organization, city, etc.
4. Done! AAB is signed.

---

### Scenario 2: Existing Keystore (Different Name)

**What you have:**
- AAB: `android/app/build/outputs/bundle/release/app-release.aab`
- Keystore: `my-app-key.jks` (in current directory)
- Alias: `myapp`

**What to do:**
```bash
./scripts/sign_aab.sh --keystore my-app-key.jks --alias myapp
```

---

### Scenario 3: All Custom Files

**What you have:**
- AAB: `builds/my-app.aab`
- Keystore: `/secure/keys/release.jks`
- Alias: `release-key`

**What to do:**
```bash
./scripts/sign_aab.sh \
  --keystore /secure/keys/release.jks \
  --alias release-key \
  --aab builds/my-app.aab
```

---

## ⚠️ Important Notes

1. **Keystore Password**: You'll ALWAYS be asked for your keystore password when signing. This is normal and secure - the script never stores passwords.

2. **Same Keystore for Updates**: For app updates, you MUST use the SAME keystore and alias. If you lose your keystore, you can't update your app on Play Store!

3. **Backup Your Keystore**: Immediately after creating a keystore, back it up to:
   - Password manager (as a file attachment)
   - Cloud storage (encrypted)
   - External drive
   - USB stick (in safe place)

4. **Don't Commit to Git**: The script automatically ensures `.jks` files are in `.gitignore` to prevent accidentally committing your keystore.

---

## 🆘 Troubleshooting

### "I don't know what information to provide"

→ Just run `./scripts/sign_aab.sh` without any options. The script will use defaults and guide you through the process.

### "AAB file not found"

→ Build it first:
```bash
cd android && ./gradlew bundleRelease
```

### "jarsigner: command not found"

→ Install Java JDK from: https://adoptium.net/

### "I forgot my keystore password"

→ Unfortunately, there's no way to recover it. You'll need to create a new keystore, which means publishing as a new app on Play Store. This is why backing up and storing passwords is critical!

### "Wrong keystore alias"

→ List all aliases:
```bash
keytool -list -v -keystore your-keystore.jks
```

Then use the correct alias shown in the output.

---

## 📚 Related Documentation

- **Quick Start**: [QUICK_START_SIGNING.md](./QUICK_START_SIGNING.md)
- **Complete Guide**: [AAB_SIGNING_GUIDE.md](./AAB_SIGNING_GUIDE.md)
- **Example Output**: [SIGNING_EXAMPLES.md](./SIGNING_EXAMPLES.md)
- **Troubleshooting**: [AAB_TROUBLESHOOTING.md](./AAB_TROUBLESHOOTING.md)

---

## 🎯 Summary: What Do You Actually Need?

**For most users:** Nothing! Just run `./scripts/sign_aab.sh`

**If customizing:**
- Keystore file name (default: `zikalyze-release-key.jks`)
- Key alias (default: `zikalyze`)
- AAB file location (default: `android/app/build/outputs/bundle/release/app-release.aab`)
- Keystore password (you'll be prompted)

**Can't find your files?** Use the commands in the "Finding Your Information" section above.

**Still confused?** Just run the script - it will tell you exactly what it needs!

```bash
./scripts/sign_aab.sh
```
