# 📺 Example Output: AAB Signing Script

This document shows example output from the AAB signing script to help you know what to expect.

---

## Example 1: First-Time Signing (No Keystore)

```bash
$ ./scripts/sign_aab.sh

================================================
Zikalyze AAB Signing Tool
================================================

✅ jarsigner found: /usr/bin/jarsigner

================================================
Checking AAB File
================================================

✅ AAB file found: android/app/build/outputs/bundle/release/app-release.aab
ℹ️  AAB size: 42M

================================================
Checking Keystore
================================================

⚠️  Keystore not found: zikalyze-release-key.jks

ℹ️  Do you want to create a new keystore? (y/n)
y

ℹ️  Creating new keystore...
⚠️  You will be prompted to enter passwords and your details
⚠️  IMPORTANT: Remember these passwords - you'll need them for future updates!

Enter keystore password: ********
Re-enter new password: ********
What is your first and last name?
  [Unknown]:  John Smith
What is the name of your organizational unit?
  [Unknown]:  Development
What is the name of your organization?
  [Unknown]:  Zikalyze
What is the name of your City or Locality?
  [Unknown]:  San Francisco
What is the name of your State or Province?
  [Unknown]:  California
What is the two-letter country code for this unit?
  [Unknown]:  US
Is CN=John Smith, OU=Development, O=Zikalyze, L=San Francisco, ST=California, C=US correct?
  [no]:  yes

Generating 2,048 bit RSA key pair and self-signed certificate (SHA256withRSA) with a validity of 10,000 days
	for: CN=John Smith, OU=Development, O=Zikalyze, L=San Francisco, ST=California, C=US

✅ Keystore created: zikalyze-release-key.jks

================================================
Signing AAB
================================================

ℹ️  Using keystore: zikalyze-release-key.jks
ℹ️  Using alias: zikalyze
ℹ️  Signing: android/app/build/outputs/bundle/release/app-release.aab

⚠️  You will be prompted for your keystore password

Enter Passphrase for keystore: ********
   adding: AndroidManifest.xml
   adding: BundleConfig.pb
   adding: base/dex/classes.dex
   adding: base/manifest/AndroidManifest.xml
   adding: base/resources.pb
   ... [many more files] ...
  signing: META-INF/MANIFEST.MF
  signing: META-INF/BNDLTOOL.SF
  signing: META-INF/BNDLTOOL.RSA

✅ AAB signed successfully!

================================================
Next Steps
================================================

✅ Your AAB is now signed and ready for Play Store upload!

ℹ️  Upload to Play Console:
ℹ️  1. Go to: https://play.google.com/console
ℹ️  2. Select your app
ℹ️  3. Navigate to: Release → Production (or Internal Testing)
ℹ️  4. Click 'Create new release'
ℹ️  5. Upload: android/app/build/outputs/bundle/release/app-release.aab
ℹ️  6. Fill in release notes
ℹ️  7. Click 'Review release' → 'Start rollout'

⚠️  IMPORTANT: Keep your keystore file safe!
⚠️  Location: zikalyze-release-key.jks
⚠️  You'll need it for ALL future app updates

Optional: Copy signed AAB to current directory? (y/n)
y
✅ Copied to: ./app-release-signed.aab

✅ Done!
```

---

## Example 2: Subsequent Signing (Keystore Exists)

```bash
$ ./scripts/sign_aab.sh

================================================
Zikalyze AAB Signing Tool
================================================

✅ jarsigner found: /usr/bin/jarsigner

================================================
Checking AAB File
================================================

✅ AAB file found: android/app/build/outputs/bundle/release/app-release.aab
ℹ️  AAB size: 42M

================================================
Checking Keystore
================================================

✅ Keystore found: zikalyze-release-key.jks

================================================
Signing AAB
================================================

ℹ️  Using keystore: zikalyze-release-key.jks
ℹ️  Using alias: zikalyze
ℹ️  Signing: android/app/build/outputs/bundle/release/app-release.aab

⚠️  You will be prompted for your keystore password

Enter Passphrase for keystore: ********
   adding: AndroidManifest.xml
   ... [many files] ...
  signing: META-INF/BNDLTOOL.RSA

✅ AAB signed successfully!

================================================
Next Steps
================================================

✅ Your AAB is now signed and ready for Play Store upload!

[... rest of output ...]
```

---

## Example 3: Signing with Verification

```bash
$ ./scripts/sign_aab.sh --verify

[... signing output ...]

✅ AAB signed successfully!

================================================
Verifying Signature
================================================

   s     12345 Wed Feb 10 12:00:00 UTC 2026 META-INF/MANIFEST.MF
         12345 Wed Feb 10 12:00:00 UTC 2026 META-INF/BNDLTOOL.SF
          1234 Wed Feb 10 12:00:00 UTC 2026 META-INF/BNDLTOOL.RSA
   m     12345 Wed Feb 10 12:00:00 UTC 2026 AndroidManifest.xml
   ... [many more files] ...

  s = signature was verified 
  m = entry is listed in manifest
  k = at least one certificate was found in keystore

- Signed by "CN=John Smith, OU=Development, O=Zikalyze, L=San Francisco, ST=California, C=US"
    Digest algorithm: SHA-256
    Signature algorithm: SHA256withRSA, 2048-bit key

jar verified.

✅ Signature verification passed!

[... next steps ...]
```

---

## Example 4: Custom Keystore and AAB Path

```bash
$ ./scripts/sign_aab.sh --keystore my-custom-key.jks --alias myalias --aab custom/path/app.aab

================================================
Zikalyze AAB Signing Tool
================================================

✅ jarsigner found: /usr/bin/jarsigner

================================================
Checking AAB File
================================================

✅ AAB file found: custom/path/app.aab
ℹ️  AAB size: 38M

================================================
Checking Keystore
================================================

✅ Keystore found: my-custom-key.jks

================================================
Signing AAB
================================================

ℹ️  Using keystore: my-custom-key.jks
ℹ️  Using alias: myalias
ℹ️  Signing: custom/path/app.aab

[... continues ...]
```

---

## Common Error Examples

### Error: AAB Not Found

```bash
❌ AAB file not found: android/app/build/outputs/bundle/release/app-release.aab
ℹ️  Build the AAB first with: cd android && ./gradlew bundleRelease
```

**Solution:** Build the AAB first.

---

### Error: jarsigner Not Found

```bash
❌ jarsigner not found!
ℹ️  jarsigner is part of the Java JDK
ℹ️  Install Java JDK: https://adoptium.net/
```

**Solution:** Install Java JDK.

---

### Error: Wrong Password

```bash
Enter Passphrase for keystore: ********
jarsigner: unable to recover key from keystore

❌ Failed to sign AAB
ℹ️  Common issues:
ℹ️    - Wrong keystore password
ℹ️    - Wrong key alias
ℹ️    - Keystore file is corrupted
```

**Solution:** Double-check your password or use the correct alias.

---

### Error: Wrong Alias

```bash
jarsigner: certificate chain not found for: wrongalias. wrongalias must reference a valid KeyStore key entry containing a private key and corresponding public key certificate chain.

❌ Failed to sign AAB
ℹ️  Common issues:
ℹ️    - Wrong keystore password
ℹ️    - Wrong key alias
ℹ️    - Keystore file is corrupted
```

**Solution:** List aliases with:
```bash
keytool -list -v -keystore zikalyze-release-key.jks
```

Then use the correct alias.

---

## 💡 Tips

1. **Save your output**: The first time you create a keystore, save the output showing your details
2. **Test with --verify**: Always verify your signature the first time
3. **Backup immediately**: After creating a keystore, back it up to multiple secure locations
4. **Password manager**: Use a password manager to store your keystore password

---

**Ready to sign?**
```bash
./scripts/sign_aab.sh
```
