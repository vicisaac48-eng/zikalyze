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
  
  /** Portfolio page splash screen shown flag (native app only) */
  PORTFOLIO_SPLASH_SHOWN: 'portfolio_splash_shown',
  
  /** Analytics page splash screen shown flag (native app only) */
  ANALYTICS_SPLASH_SHOWN: 'analytics_splash_shown',
  
  /** Analyzer page splash screen shown flag (native app only) */
  ANALYZER_SPLASH_SHOWN: 'analyzer_splash_shown',
  
  /** Alerts page splash screen shown flag (native app only) */
  ALERTS_SPLASH_SHOWN: 'alerts_splash_shown',
  
  /** Settings page splash screen shown flag (native app only) */
  SETTINGS_SPLASH_SHOWN: 'settings_splash_shown',
  
  /** Dashboard page visited via navigation flag (native app only) */
  DASHBOARD_VISITED: 'dashboard_visited',
  
  /** Portfolio page visited via navigation flag (native app only) */
  PORTFOLIO_VISITED: 'portfolio_visited',
  
  /** Analytics page visited via navigation flag (native app only) */
  ANALYTICS_VISITED: 'analytics_visited',
  
  /** Analyzer page visited via navigation flag (native app only) */
  ANALYZER_VISITED: 'analyzer_visited',
  
  /** Alerts page visited via navigation flag (native app only) */
  ALERTS_VISITED: 'alerts_visited',
  
  /** Settings page visited via navigation flag (native app only) */
  SETTINGS_VISITED: 'settings_visited',
} as const;

export const LOCAL_STORAGE_KEYS = {
  /** Last selected cryptocurrency symbol */
  LAST_CRYPTO: 'last_crypto',
  
  /** User wallet session data */
  WALLET_SESSION: 'wallet_session',
  
  /** Cookie consent status */
  COOKIE_CONSENT: 'cookieConsent',
  
  /** PWA install banner dismissed flag */
  PWA_INSTALL_DISMISSED: 'pwa-install-dismissed',
  
  /** Last visited route for native mobile app restoration */
  LAST_ROUTE: 'last_route',
} as const;
