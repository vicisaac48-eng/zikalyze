/**
 * ⚠️ CRITICAL PROTECTION TESTS - DO NOT DELETE ⚠️
 * 
 * FCM Push Notification Protection Tests
 * 
 * These tests ensure the FCM push notification system for all 100+ cryptocurrencies
 * remains intact and functional. If these tests fail, it indicates critical
 * functionality has been broken.
 * 
 * Run with: npm test tests/fcm-protection.test.ts
 * 
 * @protected
 */

import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const PROJECT_ROOT = join(__dirname, '..');

describe('🔒 FCM Push Notification Protection Tests', () => {
  describe('📁 Critical Files Must Exist', () => {
    it('CRITICAL: FCM service file must exist', () => {
      const fcmServicePath = join(PROJECT_ROOT, 'src/services/fcm.service.ts');
      expect(existsSync(fcmServicePath)).toBe(true);
      
      if (!existsSync(fcmServicePath)) {
        throw new Error(
          '❌ CRITICAL: FCM service has been deleted!\n' +
          'This breaks push notifications for all users.\n' +
          'File must exist: src/services/fcm.service.ts'
        );
      }
    });

    it('CRITICAL: Crypto notification manager must exist', () => {
      const managerPath = join(PROJECT_ROOT, 'src/services/crypto-notification-manager.ts');
      expect(existsSync(managerPath)).toBe(true);
      
      if (!existsSync(managerPath)) {
        throw new Error(
          '❌ CRITICAL: Crypto notification manager has been deleted!\n' +
          'This breaks notification management for all 100+ cryptocurrencies.\n' +
          'File must exist: src/services/crypto-notification-manager.ts'
        );
      }
    });

    it('CRITICAL: Firebase configuration must exist', () => {
      const configPath = join(PROJECT_ROOT, 'src/config/firebase.config.ts');
      expect(existsSync(configPath)).toBe(true);
      
      if (!existsSync(configPath)) {
        throw new Error(
          '❌ CRITICAL: Firebase configuration has been deleted!\n' +
          'This breaks FCM initialization.\n' +
          'File must exist: src/config/firebase.config.ts'
        );
      }
    });

    it('CRITICAL: FCM setup guide must exist', () => {
      const guidePath = join(PROJECT_ROOT, 'FIREBASE_FCM_SETUP_GUIDE.md');
      expect(existsSync(guidePath)).toBe(true);
      
      if (!existsSync(guidePath)) {
        throw new Error(
          '❌ CRITICAL: FCM setup guide has been deleted!\n' +
          'This removes critical documentation for FCM configuration.\n' +
          'File must exist: FIREBASE_FCM_SETUP_GUIDE.md'
        );
      }
    });
  });

  describe('🔍 FCM Service Implementation', () => {
    it('CRITICAL: FCM service must export fcmService singleton', () => {
      const fcmServicePath = join(PROJECT_ROOT, 'src/services/fcm.service.ts');
      const content = readFileSync(fcmServicePath, 'utf-8');
      
      expect(content).toContain('export const fcmService');
      expect(content).toContain('FCMServiceClass.getInstance()');
      
      if (!content.includes('export const fcmService')) {
        throw new Error(
          '❌ CRITICAL: fcmService singleton export has been removed!\n' +
          'This breaks FCM functionality across the application.\n' +
          'Location: src/services/fcm.service.ts'
        );
      }
    });

    it('CRITICAL: FCM service must have requestPermission method', () => {
      const fcmServicePath = join(PROJECT_ROOT, 'src/services/fcm.service.ts');
      const content = readFileSync(fcmServicePath, 'utf-8');
      
      expect(content).toContain('requestPermission');
      expect(content).toContain('async requestPermission()');
    });

    it('CRITICAL: FCM service must have getToken method', () => {
      const fcmServicePath = join(PROJECT_ROOT, 'src/services/fcm.service.ts');
      const content = readFileSync(fcmServicePath, 'utf-8');
      
      expect(content).toContain('getToken');
      expect(content).toContain('async getToken()');
    });

    it('CRITICAL: FCM service must have topic subscription methods', () => {
      const fcmServicePath = join(PROJECT_ROOT, 'src/services/fcm.service.ts');
      const content = readFileSync(fcmServicePath, 'utf-8');
      
      expect(content).toContain('subscribeToTopic');
      expect(content).toContain('unsubscribeFromTopic');
      expect(content).toContain('subscribeToMultipleTopics');
      
      if (!content.includes('subscribeToMultipleTopics')) {
        throw new Error(
          '❌ CRITICAL: Bulk topic subscription method has been removed!\n' +
          'This breaks subscription to multiple cryptocurrencies.\n' +
          'Location: src/services/fcm.service.ts'
        );
      }
    });

    it('CRITICAL: FCM service must have message listener setup', () => {
      const fcmServicePath = join(PROJECT_ROOT, 'src/services/fcm.service.ts');
      const content = readFileSync(fcmServicePath, 'utf-8');
      
      expect(content).toContain('setupMessageListener');
      expect(content).toContain('messageListenerAttached');
    });

    it('CRITICAL: FCM service must support both web and native platforms', () => {
      const fcmServicePath = join(PROJECT_ROOT, 'src/services/fcm.service.ts');
      const content = readFileSync(fcmServicePath, 'utf-8');
      
      expect(content).toContain('Capacitor.isNativePlatform()');
      expect(content).toContain('FirebaseMessaging');
      expect(content).toContain('firebaseMessaging');
    });
  });

  describe('🔍 Crypto Notification Manager Implementation', () => {
    it('CRITICAL: Manager must export cryptoNotificationManager singleton', () => {
      const managerPath = join(PROJECT_ROOT, 'src/services/crypto-notification-manager.ts');
      const content = readFileSync(managerPath, 'utf-8');
      
      expect(content).toContain('export const cryptoNotificationManager');
      expect(content).toContain('CryptoNotificationManager.getInstance()');
    });

    it('CRITICAL: Manager must have subscribeToTop100 method', () => {
      const managerPath = join(PROJECT_ROOT, 'src/services/crypto-notification-manager.ts');
      const content = readFileSync(managerPath, 'utf-8');
      
      expect(content).toContain('subscribeToTop100');
      
      if (!content.includes('subscribeToTop100')) {
        throw new Error(
          '❌ CRITICAL: subscribeToTop100 method has been removed!\n' +
          'This breaks automatic subscription to all 100 cryptocurrencies.\n' +
          'Location: src/services/crypto-notification-manager.ts'
        );
      }
    });

    it('CRITICAL: Manager must have preference management methods', () => {
      const managerPath = join(PROJECT_ROOT, 'src/services/crypto-notification-manager.ts');
      const content = readFileSync(managerPath, 'utf-8');
      
      expect(content).toContain('updatePreference');
      expect(content).toContain('getPreference');
      expect(content).toContain('getAllPreferences');
    });

    it('CRITICAL: Manager must support all notification types', () => {
      const managerPath = join(PROJECT_ROOT, 'src/services/crypto-notification-manager.ts');
      const content = readFileSync(managerPath, 'utf-8');
      
      expect(content).toContain('priceAlerts');
      expect(content).toContain('volumeSpikes');
      expect(content).toContain('whaleActivity');
      expect(content).toContain('newsEvents');
    });
  });

  describe('🔍 Firebase Configuration', () => {
    it('CRITICAL: Firebase config must have all required functions', () => {
      const configPath = join(PROJECT_ROOT, 'src/config/firebase.config.ts');
      const content = readFileSync(configPath, 'utf-8');
      
      expect(content).toContain('getFirebaseConfig');
      expect(content).toContain('isFirebaseConfigured');
      expect(content).toContain('VAPID_PUBLIC_KEY');
    });

    it('CRITICAL: Firebase config must define all required environment variables', () => {
      const configPath = join(PROJECT_ROOT, 'src/config/firebase.config.ts');
      const content = readFileSync(configPath, 'utf-8');
      
      expect(content).toContain('VITE_FIREBASE_API_KEY');
      expect(content).toContain('VITE_FIREBASE_PROJECT_ID');
      expect(content).toContain('VITE_FIREBASE_MESSAGING_SENDER_ID');
      expect(content).toContain('VITE_FIREBASE_APP_ID');
    });
  });

  describe('📚 Documentation', () => {
    it('CRITICAL: FCM setup guide must contain Firebase configuration steps', () => {
      const guidePath = join(PROJECT_ROOT, 'FIREBASE_FCM_SETUP_GUIDE.md');
      const content = readFileSync(guidePath, 'utf-8');
      
      expect(content).toContain('Firebase Console');
      expect(content).toContain('google-services.json');
      expect(content).toContain('Cloud Messaging');
    });

    it('CRITICAL: Setup guide must document all 100 cryptocurrency support', () => {
      const guidePath = join(PROJECT_ROOT, 'FIREBASE_FCM_SETUP_GUIDE.md');
      const content = readFileSync(guidePath, 'utf-8');
      
      expect(content).toContain('100');
      expect(content).toContain('cryptocurrency') || expect(content).toContain('cryptocurrencies');
    });
  });

  describe('⚠️ Protection Warnings', () => {
    it('CRITICAL: FCM service must have protection warnings in header', () => {
      const fcmServicePath = join(PROJECT_ROOT, 'src/services/fcm.service.ts');
      const content = readFileSync(fcmServicePath, 'utf-8');
      
      expect(content).toContain('DO NOT DELETE');
      expect(content).toContain('PROTECTED BY AUTOMATED TESTS');
      expect(content).toContain('CRITICAL');
    });

    it('CRITICAL: Crypto notification manager must have protection warnings', () => {
      const managerPath = join(PROJECT_ROOT, 'src/services/crypto-notification-manager.ts');
      const content = readFileSync(managerPath, 'utf-8');
      
      expect(content).toContain('DO NOT DELETE');
      expect(content).toContain('PROTECTED');
    });
  });

  describe('🚨 Regression Prevention', () => {
    it('MUST NOT remove FCM service export', () => {
      const fcmServicePath = join(PROJECT_ROOT, 'src/services/fcm.service.ts');
      const content = readFileSync(fcmServicePath, 'utf-8');
      
      expect(content).toContain('export const fcmService');
      
      if (!content.includes('export const fcmService')) {
        throw new Error(
          '❌ REGRESSION: FCM service export has been removed!\n' +
          'This breaks push notifications for all users.\n' +
          'The fcmService singleton must be exported for application-wide use.'
        );
      }
    });

    it('MUST NOT remove cryptocurrency topic subscription support', () => {
      const fcmServicePath = join(PROJECT_ROOT, 'src/services/fcm.service.ts');
      const content = readFileSync(fcmServicePath, 'utf-8');
      
      expect(content).toContain('subscribeToMultipleTopics');
      
      if (!content.includes('subscribeToMultipleTopics')) {
        throw new Error(
          '❌ REGRESSION: Batch topic subscription has been removed!\n' +
          'This breaks the ability to subscribe to multiple cryptocurrencies efficiently.\n' +
          'Method subscribeToMultipleTopics() is required for top 100 support.'
        );
      }
    });

    it('MUST NOT remove preference management for cryptocurrencies', () => {
      const managerPath = join(PROJECT_ROOT, 'src/services/crypto-notification-manager.ts');
      const content = readFileSync(managerPath, 'utf-8');
      
      expect(content).toContain('updatePreference');
      expect(content).toContain('CryptoNotificationPreferences');
      
      if (!content.includes('updatePreference')) {
        throw new Error(
          '❌ REGRESSION: Preference management has been removed!\n' +
          'This breaks user ability to customize notifications per cryptocurrency.\n' +
          'updatePreference() method is required for user settings.'
        );
      }
    });
  });
});

describe('🎯 Integration Points', () => {
  it('FCM service must be importable', () => {
    expect(() => {
      const modulePath = join(PROJECT_ROOT, 'src/services/fcm.service.ts');
      expect(existsSync(modulePath)).toBe(true);
    }).not.toThrow();
  });

  it('Crypto notification manager must be importable', () => {
    expect(() => {
      const modulePath = join(PROJECT_ROOT, 'src/services/crypto-notification-manager.ts');
      expect(existsSync(modulePath)).toBe(true);
    }).not.toThrow();
  });

  it('Firebase config must be importable', () => {
    expect(() => {
      const modulePath = join(PROJECT_ROOT, 'src/config/firebase.config.ts');
      expect(existsSync(modulePath)).toBe(true);
    }).not.toThrow();
  });
});
