/**
 * Script to generate VAPID keys and TOTP encryption key
 * Run with: node scripts/generate-keys.js
 */

const crypto = require('crypto');
const fs = require('fs');
// Generate VAPID keys using Web Crypto compatible approach
function generateVAPIDKeys() {
  const { generateKeyPairSync } = require('crypto');
  
  // Generate ECDSA key pair on P-256 curve
  const { publicKey, privateKey } = generateKeyPairSync('ec', {
    namedCurve: 'prime256v1'
  });
  
  // Export keys in the format needed for web-push
  const publicKeyBuffer = publicKey.export({ type: 'spki', format: 'der' });
  const privateKeyBuffer = privateKey.export({ type: 'pkcs8', format: 'der' });
  
  // Extract the raw public key (last 65 bytes of SPKI)
  const rawPublicKey = publicKeyBuffer.slice(-65);
  
  // Extract the raw private key (32 bytes from PKCS8)
  const rawPrivateKey = privateKeyBuffer.slice(-32);
  
  // Convert to URL-safe base64
  const urlSafeBase64 = (buffer) => {
    return Buffer.from(buffer)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  };
  
  return {
    publicKey: urlSafeBase64(rawPublicKey),
    privateKey: urlSafeBase64(rawPrivateKey)
  };
}

// Generate TOTP encryption key (32 hex characters = 16 bytes)
function generateTOTPKey() {
  return crypto.randomBytes(16).toString('hex');
}

console.log('\n🔑 Generated Keys for Zikalyze\n');
console.log('================================\n');

const vapidKeys = generateVAPIDKeys();
const totpKey = generateTOTPKey();

// Persist sensitive keys to a local file with restricted permissions instead of logging them
const outputPath = 'generated-keys.json';
const keyData = {
  VAPID_PUBLIC_KEY: vapidKeys.publicKey,
  VAPID_PRIVATE_KEY: vapidKeys.privateKey,
  TOTP_ENCRYPTION_KEY: totpKey
};

fs.writeFileSync(outputPath, JSON.stringify(keyData, null, 2), { mode: 0o600 });

const mask = (value) => {
  if (!value || value.length <= 8) return '********';
  return value.slice(0, 4) + '...' + value.slice(-4);
};

console.log('VAPID_PUBLIC_KEY:');
console.log(vapidKeys.publicKey);
console.log('\nVAPID_PRIVATE_KEY (masked):');
console.log(mask(vapidKeys.privateKey));
console.log('\nTOTP_ENCRYPTION_KEY (masked):');
console.log(mask(totpKey));

console.log('\n================================');
console.log(`\n✅ Full key material has been written to "${outputPath}" with restricted permissions (0600).`);
console.log('   Copy these values from that file into your secrets store.\n');
