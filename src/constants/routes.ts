/**
 * Route Constants
 * 
 * Centralized route paths for type safety and consistency across the application.
 */

export const ROUTES = {
  /** Landing page route */
  LANDING: '/',
  
  /** Authentication page route */
  AUTH: '/auth',
  
  /** Login page route (redirects to auth) */
  LOGIN: '/login',
  
  /** Dashboard home route */
  DASHBOARD: '/dashboard',
  
  /** Dashboard portfolio route */
  DASHBOARD_PORTFOLIO: '/dashboard/portfolio',
  
  /** Dashboard analytics route */
  DASHBOARD_ANALYTICS: '/dashboard/analytics',
  
  /** Dashboard analyzer route */
  DASHBOARD_ANALYZER: '/dashboard/analyzer',
  
  /** Dashboard alerts route */
  DASHBOARD_ALERTS: '/dashboard/alerts',
  
  /** Dashboard settings route */
  DASHBOARD_SETTINGS: '/dashboard/settings',
} as const;
