/**
 * Vercel Web Analytics initialization
 * 
 * This module initializes Vercel Web Analytics for tracking user interactions,
 * page views, and custom events in the application.
 * 
 * Documentation: https://vercel.com/docs/analytics
 */

import { inject } from '@vercel/analytics';

/**
 * Initialize Vercel Web Analytics
 * 
 * This function should be called once during app initialization.
 * It sets up the tracking script and enables analytics collection.
 * 
 * Note: Analytics will only be active when deployed to Vercel with
 * Web Analytics enabled in the project settings.
 */
export const initializeAnalytics = (): void => {
  try {
    inject();
    console.log('Vercel Web Analytics initialized successfully');
  } catch (error) {
    // Silently fail if analytics initialization fails
    // This ensures analytics issues don't break the application
    console.warn('Failed to initialize Vercel Web Analytics:', error);
  }
};

/**
 * Track a custom event
 * 
 * Usage example:
 * trackEvent('button_click', { button_id: 'submit', page: 'checkout' })
 * 
 * Note: Custom events require Pro/Enterprise plan
 * @param eventName - The name of the event
 * @param properties - Optional properties to attach to the event
 */
export const trackEvent = (
  eventName: string,
  properties?: Record<string, string | number | boolean>
): void => {
  if (typeof window !== 'undefined' && window.va) {
    window.va('event', {
      name: eventName,
      ...properties,
    });
  }
};

// Types are provided by @vercel/analytics package
