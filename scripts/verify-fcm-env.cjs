#!/usr/bin/env node

/**
 * FCM Environment Variables Verification Script
 * 
 * Verifies that all required Firebase Cloud Messaging environment
 * variables are properly configured.
 * 
 * Usage: node scripts/verify-fcm-env.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying FCM Environment Configuration...\n');

// Required environment variables
const REQUIRED_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_VAPID_PUBLIC_KEY',
];

// Optional but recommended
const OPTIONAL_VARS = [
  'FCM_SERVER_KEY',
  'FIREBASE_SERVICE_ACCOUNT',
];

// Load .env file
const envPath = path.join(__dirname, '..', '.env');
const envLocalPath = path.join(__dirname, '..', '.env.local');

let envContent = '';
if (fs.existsSync(envPath)) {
  envContent += fs.readFileSync(envPath, 'utf8');
}
if (fs.existsSync(envLocalPath)) {
  envContent += '\n' + fs.readFileSync(envLocalPath, 'utf8');
}

// Parse environment variables
const envVars = {};
envContent.split('\n').forEach(line => {
  line = line.trim();
  if (line && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  }
});

// Check required variables
let hasErrors = false;
let hasWarnings = false;

console.log('✅ REQUIRED VARIABLES:\n');
REQUIRED_VARS.forEach(varName => {
  const value = process.env[varName] || envVars[varName];
  if (value) {
    const displayValue = value.substring(0, 20) + '...';
    console.log(`  ✓ ${varName}: ${displayValue}`);
  } else {
    console.log(`  ✗ ${varName}: MISSING`);
    hasErrors = true;
  }
});

console.log('\n⚠️  OPTIONAL VARIABLES:\n');
OPTIONAL_VARS.forEach(varName => {
  const value = process.env[varName] || envVars[varName];
  if (value) {
    const displayValue = value.substring(0, 20) + '...';
    console.log(`  ✓ ${varName}: ${displayValue}`);
  } else {
    console.log(`  - ${varName}: Not set (optional)`);
    hasWarnings = true;
  }
});

// Check google-services.json
console.log('\n📱 ANDROID CONFIGURATION:\n');
const googleServicesPath = path.join(__dirname, '..', 'android', 'app', 'google-services.json');
if (fs.existsSync(googleServicesPath)) {
  try {
    const googleServices = JSON.parse(fs.readFileSync(googleServicesPath, 'utf8'));
    console.log(`  ✓ google-services.json exists`);
    console.log(`  ✓ Project ID: ${googleServices.project_info.project_id}`);
    console.log(`  ✓ Package name: ${googleServices.client[0].client_info.android_client_info.package_name}`);
  } catch (e) {
    console.log(`  ✗ google-services.json invalid: ${e.message}`);
    hasErrors = true;
  }
} else {
  console.log(`  - google-services.json: Not found (required for Android)`);
  hasWarnings = true;
}

// Check service worker
console.log('\n🌐 WEB CONFIGURATION:\n');
const swPath = path.join(__dirname, '..', 'public', 'firebase-messaging-sw.js');
if (fs.existsSync(swPath)) {
  console.log(`  ✓ firebase-messaging-sw.js exists`);
} else {
  console.log(`  - firebase-messaging-sw.js: Not found (required for web push)`);
  hasWarnings = true;
}

// Final status
console.log('\n' + '='.repeat(60));
if (hasErrors) {
  console.log('❌ VERIFICATION FAILED: Missing required configuration');
  console.log('\nTo fix:');
  console.log('1. Copy .env.example to .env');
  console.log('2. Fill in all required variables from Firebase Console');
  console.log('3. For Android: Add google-services.json to android/app/');
  console.log('4. Run this script again');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  VERIFICATION PASSED: But some optional items missing');
  console.log('\nFor full functionality, consider:');
  console.log('- Adding google-services.json for Android support');
  console.log('- Setting FCM_SERVER_KEY for server-side notifications');
  console.log('- Adding firebase-messaging-sw.js for web push');
  process.exit(0);
} else {
  console.log('✅ VERIFICATION PASSED: All configurations present!');
  console.log('\n🚀 FCM is ready to use!');
  console.log('\nNext steps:');
  console.log('1. Run protection tests: npm test tests/fcm-protection.test.ts');
  console.log('2. Test notifications: npm run test:notifications');
  console.log('3. Deploy to production');
  process.exit(0);
}
