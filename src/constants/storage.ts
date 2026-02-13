/**
 * Session and Local Storage Constants
 * 
 * Centralized storage keys for type safety and consistency across the application.
 */

export const SESSION_STORAGE_KEYS = {
  /** Dashboard splash screen shown flag (native app only) */
  DASHBOARD_SPLASH_SHOWN: 'dashboard_splash_shown',
  
  /** Landing page splash screen shown flag (native app only) */
  LANDING_SPLASH_SHOWN: 'landing_splash_shown',
} as const;

export const LOCAL_STORAGE_KEYS = {
  /** Last selected cryptocurrency symbol */
  LAST_CRYPTO: 'last_crypto',
  
  /** User wallet session data */
  WALLET_SESSION: 'wallet_session',
  
  /** Cookie consent status */
  COOKIE_CONSENT: 'cookieConsent',
} as const;
