/**
 * Script to generate VAPID keys and TOTP encryption key
 * Run with: node scripts/generate-keys.js
 */

const crypto = require('crypto');

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
console.log('VAPID_PUBLIC_KEY:');
console.log(vapidKeys.publicKey);
console.log('\nVAPID_PRIVATE_KEY:');
console.log(vapidKeys.privateKey);

const totpKey = generateTOTPKey();
console.log('\nTOTP_ENCRYPTION_KEY:');
console.log(totpKey);

console.log('\n================================');
console.log('\n✅ Copy these values to your secrets!\n');
