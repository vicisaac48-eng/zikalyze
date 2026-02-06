import { Capacitor } from '@capacitor/core';

/**
 * Delay in milliseconds for "immediate" notification scheduling.
 * A small delay is needed because LocalNotifications.schedule() requires a future time.
 */
export const IMMEDIATE_NOTIFICATION_DELAY_MS = 100;

/**
 * Check if running on a native platform (Android/iOS) via Capacitor.
 */
export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * Generate a unique notification ID using timestamp + random.
 * Uses last 6 digits of timestamp + random 3 digits (0-999) to avoid collisions.
 */
export const generateNotificationId = (): number => {
  return (Date.now() % 1000000) * 1000 + Math.floor(Math.random() * 1000);
};

/**
 * Sanitize symbol for safe URL use (only allow alphanumeric and hyphen).
 */
export const sanitizeSymbol = (symbol: string): string => {
  return symbol.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
};
