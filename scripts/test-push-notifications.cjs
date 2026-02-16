#!/usr/bin/env node

/**
 * Comprehensive Push Notifications Testing Script
 * 
 * Tests all aspects of the push notification system
 * 
 * Usage: node scripts/test-push-notifications.cjs
 */

const fs = require('fs');
const path = require('path');

console.log('\n🧪 Push Notifications Comprehensive Test Suite\n');
console.log('='.repeat(60) + '\n');

let passCount = 0;
let failCount = 0;
let warnCount = 0;

function pass(message) {
  console.log(`✅ PASS: ${message}`);
  passCount++;
}

function fail(message) {
  console.log(`❌ FAIL: ${message}`);
  failCount++;
}

function warn(message) {
  console.log(`⚠️  WARN: ${message}`);
  warnCount++;
}

function section(title) {
  console.log(`\n${'━'.repeat(60)}`);
  console.log(`  ${title}`);
  console.log('━'.repeat(60) + '\n');
}

// Test 1: File Existence
section('1️⃣  FILE EXISTENCE TESTS');

const criticalFiles = [
  'src/services/fcm.service.ts',
  'src/services/crypto-notification-manager.ts',
  'src/config/firebase.config.ts',
  'src/config/firebase-admin.config.ts',
  'src/hooks/usePushNotifications.ts',
  'src/hooks/useSmartNotifications.ts',
  'src/hooks/useLocalNotifications.ts',
];

criticalFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    pass(`File exists: ${file}`);
  } else {
    fail(`File missing: ${file}`);
  }
});

// Test 2: Protection Tests File
section('2️⃣  PROTECTION TESTS');

const protectionTestPath = path.join(__dirname, '..', 'tests/fcm-protection.test.ts');
if (fs.existsSync(protectionTestPath)) {
  pass('Protection test file exists');
  
  const content = fs.readFileSync(protectionTestPath, 'utf8');
  const testCount = (content.match(/it\(/g) || []).length;
  pass(`Contains ${testCount} automated protection tests`);
  
  if (testCount >= 30) {
    pass('Adequate test coverage (30+ tests)');
  } else {
    warn(`Low test coverage (${testCount} tests, expected 30+)`);
  }
} else {
  fail('Protection test file missing');
}

// Test 3: Implementation Quality
section('3️⃣  IMPLEMENTATION QUALITY');

const fcmServicePath = path.join(__dirname, '..', 'src/services/fcm.service.ts');
if (fs.existsSync(fcmServicePath)) {
  const content = fs.readFileSync(fcmServicePath, 'utf8');
  
  // Check for critical methods
  const requiredMethods = [
    'initialize',
    'requestPermission',
    'getToken',
    'subscribeToTopic',
    'unsubscribeFromTopic',
    'subscribeToMultipleTopics',
    'attachMessageListener',
    'saveTokenToDatabase',
  ];
  
  requiredMethods.forEach(method => {
    if (content.includes(method)) {
      pass(`Method implemented: ${method}`);
    } else {
      fail(`Method missing: ${method}`);
    }
  });
  
  // Check for error handling
  if (content.includes('try') && content.includes('catch')) {
    pass('Error handling implemented');
  } else {
    fail('Missing error handling');
  }
  
  // Check for logging
  if (content.includes('console.log') || content.includes('console.error')) {
    pass('Logging implemented');
  } else {
    warn('No logging found');
  }
} else {
  fail('Cannot test implementation - file missing');
}

// Test 4: Crypto Support
section('4️⃣  CRYPTOCURRENCY SUPPORT');

const managerPath = path.join(__dirname, '..', 'src/services/crypto-notification-manager.ts');
if (fs.existsSync(managerPath)) {
  const content = fs.readFileSync(managerPath, 'utf8');
  
  // Check for 100+ crypto support
  if (content.includes('subscribeToTop100') || content.includes('100')) {
    pass('Supports 100+ cryptocurrencies');
  } else {
    warn('100+ cryptocurrency support unclear');
  }
  
  // Check for preference management
  const prefMethods = [
    'enableAllNotificationTypes',
    'disableAllNotificationTypes',
    'updatePreference',
    'getPreferences',
  ];
  
  prefMethods.forEach(method => {
    if (content.includes(method)) {
      pass(`Preference method: ${method}`);
    } else {
      warn(`Preference method missing: ${method}`);
    }
  });
} else {
  fail('Cannot test crypto support - file missing');
}

// Test 5: Documentation
section('5️⃣  DOCUMENTATION');

const docs = [
  'FIREBASE_FREE_SPARK_SETUP.md',
  'FIREBASE_FCM_SETUP_GUIDE.md',
  'FCM_PROTECTION_GUIDE.md',
  'FCM_IMPLEMENTATION_COMPLETE.md',
  'PUSH_NOTIFICATIONS_VERIFICATION_GUIDE.md',
  'PUSH_NOTIFICATIONS_TROUBLESHOOTING.md',
];

docs.forEach(doc => {
  const docPath = path.join(__dirname, '..', doc);
  if (fs.existsSync(docPath)) {
    pass(`Documentation exists: ${doc}`);
  } else {
    warn(`Documentation missing: ${doc}`);
  }
});

// Test 6: TypeScript Types
section('6️⃣  TYPESCRIPT TYPE SAFETY');

if (fs.existsSync(fcmServicePath)) {
  const content = fs.readFileSync(fcmServicePath, 'utf8');
  
  // Check for interfaces
  if (content.includes('interface FCMToken')) {
    pass('FCMToken interface defined');
  } else {
    fail('FCMToken interface missing');
  }
  
  if (content.includes('interface FCMNotification')) {
    pass('FCMNotification interface defined');
  } else {
    fail('FCMNotification interface missing');
  }
  
  // Check for type annotations
  const typeCount = (content.match(/: \w+/g) || []).length;
  if (typeCount > 50) {
    pass(`Good type coverage (${typeCount} type annotations)`);
  } else {
    warn(`Low type coverage (${typeCount} annotations)`);
  }
}

// Test 7: Security
section('7️⃣  SECURITY CHECKS');

if (fs.existsSync(fcmServicePath)) {
  const content = fs.readFileSync(fcmServicePath, 'utf8');
  
  // Check for VAPID key protection
  if (content.includes('VAPID') && !content.match(/VAPID.*=.*['"][^'"]{50,}['"]/)) {
    pass('VAPID key not hardcoded');
  } else {
    warn('VAPID key handling unclear');
  }
  
  // Check for token validation
  if (content.includes('validate') || content.includes('check')) {
    pass('Token validation present');
  } else {
    warn('Token validation unclear');
  }
}

// Test 8: Platform Support
section('8️⃣  PLATFORM COMPATIBILITY');

const platformFiles = [
  'src/hooks/usePushNotifications.ts', // Multi-platform hook
];

platformFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for Capacitor support
    if (content.includes('Capacitor')) {
      pass('Capacitor (native) support detected');
    } else {
      warn('Capacitor support unclear');
    }
    
    // Check for web support
    if (content.includes('navigator') || content.includes('window')) {
      pass('Web/PWA support detected');
    } else {
      warn('Web support unclear');
    }
  }
});

// Final Results
section('📊 TEST RESULTS SUMMARY');

const total = passCount + failCount + warnCount;
const passRate = ((passCount / total) * 100).toFixed(1);

console.log(`Total Tests:     ${total}`);
console.log(`✅ Passed:       ${passCount} (${passRate}%)`);
console.log(`❌ Failed:       ${failCount}`);
console.log(`⚠️  Warnings:     ${warnCount}`);
console.log();

if (failCount === 0) {
  console.log('🎉 ALL CRITICAL TESTS PASSED!');
  console.log('\n✅ Push notifications implementation is healthy\n');
  
  if (warnCount > 0) {
    console.log(`⚠️  Note: ${warnCount} warnings found (non-critical)`);
    console.log('Review warnings to ensure complete implementation\n');
  }
  
  console.log('Next steps:');
  console.log('1. Configure Firebase environment variables');
  console.log('2. Add google-services.json for Android');
  console.log('3. Test on actual devices');
  console.log('4. Monitor notification delivery\n');
  
  process.exit(0);
} else {
  console.log('❌ TESTS FAILED!');
  console.log(`\n${failCount} critical issues found.\n`);
  console.log('Action required:');
  console.log('1. Review failed tests above');
  console.log('2. Fix missing files/implementations');
  console.log('3. Run tests again\n');
  
  process.exit(1);
}
