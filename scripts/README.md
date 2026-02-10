# 🔐 AAB Signing Scripts

This directory contains scripts to help you sign your Android App Bundle (AAB) for Google Play Store.

## 🚀 Quick Start - Automated Signing

**Can't follow manual steps? Just run this:**

```bash
./scripts/auto_sign_aab.sh
```

Or the even simpler wrapper:

```bash
./scripts/sign.sh
```

Both do the SAME thing - completely automated AAB signing!

## 📜 Available Scripts

### 1. `auto_sign_aab.sh` ⭐ **RECOMMENDED**

**Fully automated** - Does everything with zero manual input:
- ✅ Builds the AAB
- ✅ Creates keystore (default password: `zikalyze2024`)
- ✅ Signs the AAB
- ✅ Verifies signature
- ✅ Copies `zikalyze-signed.aab` to root directory

**Usage:**
```bash
./scripts/auto_sign_aab.sh
```

**Documentation:** [ONE_COMMAND_SIGNING.md](../ONE_COMMAND_SIGNING.md)

---

### 2. `sign.sh`

Simple wrapper for `auto_sign_aab.sh` - use this if you want an even shorter command!

**Usage:**
```bash
./scripts/sign.sh
```

---

### 3. `sign_aab.sh`

**Semi-automated** - Prompts you for input (password, keystore creation, etc.)

**Usage:**
```bash
./scripts/sign_aab.sh
```

**Options:**
```bash
--keystore <path>     Path to keystore file
--alias <alias>       Key alias
--aab <path>          Path to AAB file
--verify              Verify signature after signing
--help                Show help
```

**Documentation:** [AAB_SIGNING_GUIDE.md](../AAB_SIGNING_GUIDE.md)

---

### 4. `verify_aab.py`

Python script to verify AAB configuration and requirements.

**Usage:**
```bash
python3 scripts/verify_aab.py
```

**Documentation:** [AAB_TROUBLESHOOTING.md](../AAB_TROUBLESHOOTING.md)

---

## 🎯 Which Script Should I Use?

| Situation | Script to Use | Why |
|-----------|--------------|-----|
| **First time signing** | `auto_sign_aab.sh` | Easiest - everything automated |
| **Don't want to type long paths** | `sign.sh` | Shortest command |
| **Want control over passwords** | `sign_aab.sh` | Prompts you for input |
| **Already have keystore** | Any of the above | All work with existing keystores |
| **Troubleshooting AAB** | `verify_aab.py` | Checks your AAB configuration |

## 📚 Full Documentation

- **One Command Signing:** [ONE_COMMAND_SIGNING.md](../ONE_COMMAND_SIGNING.md)
- **Complete Signing Guide:** [AAB_SIGNING_GUIDE.md](../AAB_SIGNING_GUIDE.md)
- **Quick Start:** [QUICK_START_SIGNING.md](../QUICK_START_SIGNING.md)
- **Visual Example:** [AUTOMATED_SIGNING_EXAMPLE.md](../AUTOMATED_SIGNING_EXAMPLE.md)
- **Troubleshooting:** [AAB_TROUBLESHOOTING.md](../AAB_TROUBLESHOOTING.md)
- **Play Store Guide:** [docs/PLAYSTORE_DEPLOYMENT.md](../docs/PLAYSTORE_DEPLOYMENT.md)

## 🔑 Default Credentials

The `auto_sign_aab.sh` script uses these defaults:

- **Keystore file:** `zikalyze-release-key.jks`
- **Keystore password:** `zikalyze2024`
- **Key alias:** `zikalyze`

**⚠️ IMPORTANT:** Save these credentials! You need them for app updates!

## 📁 Output Files

After running the automated script, you'll get:

- `zikalyze-signed.aab` - Your signed app (upload this to Play Store)
- `zikalyze-release-key.jks` - Your keystore (keep this safe!)

## 🆘 Common Issues

### "Permission denied"
Make scripts executable:
```bash
chmod +x scripts/*.sh
```

### "Java not found"
Install Java JDK: https://adoptium.net/

### "AAB build failed"
Make sure dependencies are installed:
```bash
npm install
```

## 💡 Pro Tip

For the simplest experience:

```bash
# Just run this one command
./scripts/auto_sign_aab.sh

# Wait 3-5 minutes
# Upload zikalyze-signed.aab to Play Store
# Done! 🎉
```

---

**Need more help?** See [ONE_COMMAND_SIGNING.md](../ONE_COMMAND_SIGNING.md)
