/**
 * ⚠️ CRITICAL: FIREBASE ADMIN CONFIGURATION (BLAZE PLAN) - DO NOT DELETE ⚠️
 * 
 * Server-side Firebase Admin SDK configuration for advanced features
 * Requires Firebase Blaze (paid) plan
 * 
 * 🔒 PROTECTED BY: tests/fcm-protection.test.ts
 * 📚 DOCUMENTATION: FIREBASE_BLAZE_PAID_SETUP.md
 * 
 * Features:
 * - Server-side messaging with elevated privileges
 * - Batch notifications (500+ per request)
 * - Topic management
 * - Advanced analytics
 * - Service account authentication
 * 
 * @module firebase-admin.config
 * @protected
 */

// Note: This configuration is for server-side/edge functions only
// For client-side, use firebase.config.ts

interface ServiceAccountCredentials {
  type: string;
  project_id: string;
  private_key?: string;
  client_email?: string;
}

/**
 * Get service account credentials from environment
 * @protected - Contains sensitive credentials
 */
export function getServiceAccountCredentials(): ServiceAccountCredentials | null {
  const projectId = Deno.env.get('GOOGLE_CLOUD_PROJECT_ID') || Deno.env.get('VITE_FIREBASE_PROJECT_ID');
  const privateKey = Deno.env.get('FIREBASE_SERVICE_ACCOUNT_KEY');
  const clientEmail = Deno.env.get('FIREBASE_SERVICE_ACCOUNT_EMAIL');

  if (!projectId) {
    console.warn('[Firebase Admin] Project ID not configured');
    return null;
  }

  return {
    type: "service_account",
    project_id: projectId,
    private_key: privateKey?.replace(/\\n/g, '\n'),
    client_email: clientEmail,
  };
}

/**
 * Check if Firebase Admin is properly configured
 * @returns true if all required credentials are present
 */
export function isAdminConfigured(): boolean {
  const credentials = getServiceAccountCredentials();
  return !!(
    credentials &&
    credentials.project_id &&
    credentials.private_key &&
    credentials.client_email
  );
}

/**
 * Get FCM v1 API server key
 * @returns Server key for FCM v1 API
 */
export function getFCMServerKey(): string | null {
  return Deno.env.get('FCM_SERVER_KEY_V1') || Deno.env.get('FCM_SERVER_KEY') || null;
}

/**
 * Get notification batch size (Blaze plan allows 500)
 * @returns Batch size for multicast messages
 */
export function getNotificationBatchSize(): number {
  const envBatchSize = Deno.env.get('NOTIFICATION_BATCH_SIZE');
  return envBatchSize ? parseInt(envBatchSize, 10) : 500;
}

/**
 * Get notification retry configuration
 * @returns Retry configuration object
 */
export function getRetryConfig(): { attempts: number; timeout: number } {
  const attempts = Deno.env.get('NOTIFICATION_RETRY_ATTEMPTS');
  const timeout = Deno.env.get('NOTIFICATION_TIMEOUT_MS');
  
  return {
    attempts: attempts ? parseInt(attempts, 10) : 3,
    timeout: timeout ? parseInt(timeout, 10) : 10000,
  };
}

/**
 * Check if advanced features are enabled
 * @returns Object with feature flags
 */
export function getFeatureFlags(): {
  analytics: boolean;
  crashlytics: boolean;
  performance: boolean;
  remoteConfig: boolean;
  abTesting: boolean;
} {
  return {
    analytics: Deno.env.get('ENABLE_FIREBASE_ANALYTICS') === 'true',
    crashlytics: Deno.env.get('ENABLE_CRASHLYTICS') === 'true',
    performance: Deno.env.get('ENABLE_PERFORMANCE_MONITORING') === 'true',
    remoteConfig: Deno.env.get('ENABLE_REMOTE_CONFIG') === 'true',
    abTesting: Deno.env.get('ENABLE_AB_TESTING') === 'true',
  };
}

/**
 * Get supported Firebase regions for multi-region deployment
 * @returns Array of region identifiers
 */
export function getFirebaseRegions(): string[] {
  const regions = Deno.env.get('FIREBASE_REGIONS');
  if (!regions) {
    return ['us-central1']; // Default region
  }
  return regions.split(',').map(r => r.trim());
}

/**
 * Get budget configuration
 * @returns Budget limits
 */
export function getBudgetLimits(): { daily: number; monthly: number } {
  const daily = Deno.env.get('FIREBASE_DAILY_BUDGET');
  const monthly = Deno.env.get('FIREBASE_MONTHLY_BUDGET');
  
  return {
    daily: daily ? parseFloat(daily) : 10,
    monthly: monthly ? parseFloat(monthly) : 200,
  };
}

// Log configuration status (without exposing sensitive data)
console.log('[Firebase Admin Config] Status:', {
  configured: isAdminConfigured(),
  projectId: getServiceAccountCredentials()?.project_id || 'not set',
  batchSize: getNotificationBatchSize(),
  retryAttempts: getRetryConfig().attempts,
  features: getFeatureFlags(),
  regions: getFirebaseRegions(),
  budget: getBudgetLimits(),
});

export default {
  getServiceAccountCredentials,
  isAdminConfigured,
  getFCMServerKey,
  getNotificationBatchSize,
  getRetryConfig,
  getFeatureFlags,
  getFirebaseRegions,
  getBudgetLimits,
};
