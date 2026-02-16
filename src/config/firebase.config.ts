/**
 * Firebase Configuration for Zikalyze
 * 
 * This module initializes Firebase and provides access to Firebase services
 * including Cloud Messaging for push notifications.
 * 
 * @module firebase.config
 */

import { Capacitor } from '@capacitor/core';

// Firebase configuration interface
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

// Get Firebase configuration from environment variables
const firebaseConfig: FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ''
};

// VAPID key for Web Push
export const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

/**
 * Check if Firebase is configured
 * @returns true if all required Firebase config values are present
 */
export function isFirebaseConfigured(): boolean {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId
  );
}

/**
 * Get Firebase configuration
 * @returns Firebase configuration object
 */
export function getFirebaseConfig(): FirebaseConfig {
  return firebaseConfig;
}

/**
 * Check if running on native platform
 * @returns true if running on Android or iOS
 */
export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Get platform name
 * @returns Platform name (web, android, ios)
 */
export function getPlatform(): string {
  return Capacitor.getPlatform();
}

// Log Firebase configuration status (without exposing sensitive data)
console.log('[Firebase Config] Configuration status:', {
  configured: isFirebaseConfigured(),
  platform: getPlatform(),
  hasVapidKey: !!VAPID_PUBLIC_KEY,
  projectId: firebaseConfig.projectId ? '✓' : '✗'
});

export default firebaseConfig;
