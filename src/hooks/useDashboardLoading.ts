import { useState, useCallback, useEffect } from "react";
import { useIsNativeApp } from "./useIsNativeApp";
import { useNetworkSpeed, getAdaptiveSkeletonDelay } from "./useNetworkSpeed";
import { SESSION_STORAGE_KEYS } from "@/constants/storage";

// Loading phases for dashboard pages
export type LoadingPhase = 'splash' | 'skeleton' | 'revealed';

interface UseDashboardLoadingOptions {
  /**
   * Session storage key to track if splash has been shown
   * e.g., SESSION_STORAGE_KEYS.DASHBOARD_SPLASH_SHOWN
   * NOTE: This parameter is kept for backward compatibility but is not used
   * The hook now uses global LANDING_SPLASH_SHOWN flag instead
   */
  sessionKey: string;
  
  /**
   * Session storage key to track if page has been visited via navigation
   * e.g., SESSION_STORAGE_KEYS.DASHBOARD_VISITED
   */
  visitedKey: string;
  
  /**
   * Condition to determine when data is ready
   * e.g., !loading && data.length > 0
   */
  isDataReady?: boolean;
  
  /**
   * Delay before transitioning from skeleton to revealed (in ms)
   * Default: Adaptive based on network speed (200-800ms)
   * - Fast network (4G): 200ms
   * - Medium network (3G): 400ms
   * - Slow network (2G): 600ms
   * - Very slow (slow-2G): 800ms
   * Industry standard pattern for responsive UX
   */
  skeletonDelay?: number;
}

/**
 * Custom hook for managing loading phases for Auth and Dashboard pages
 * Only applies to native mobile apps. Web shows instant content.
 * 
 * NOTE: Named `useDashboardLoading` for historical reasons but is used by both
 * Dashboard pages and Auth page. Could be renamed to `usePageLoading` in future.
 * 
 * Loading Phases (Mobile Native App Only):
 * - First visit to page: Skeleton (phase 1) → Reveal (phase 2)
 * - Subsequent visits to same page: Instant content (phase 2)
 * 
 * NOTE: Splash screen has been removed from dashboard pages as of 2026-02-14.
 * Only Landing page shows splash screen now.
 * 
 * Usage:
 * ```tsx
 * const { loadingPhase, handleSplashComplete, markAsVisited } = useDashboardLoading({
 *   sessionKey: SESSION_STORAGE_KEYS.ANALYTICS_SPLASH_SHOWN, // kept for compatibility
 *   visitedKey: SESSION_STORAGE_KEYS.ANALYTICS_VISITED,
 *   isDataReady: !loading && prices.length > 0,
 *   skeletonDelay: 200
 * });
 * ```
 */
export function useDashboardLoading({
  sessionKey,
  visitedKey,
  isDataReady = true,
  skeletonDelay
}: UseDashboardLoadingOptions) {
  const isNativeApp = useIsNativeApp();
  const networkSpeed = useNetworkSpeed();
  
  // Calculate adaptive skeleton delay based on network speed
  // If custom delay provided, use it; otherwise use network-based adaptive delay
  const adaptiveSkeletonDelay = skeletonDelay ?? getAdaptiveSkeletonDelay(networkSpeed);
  
  // Initialize loading phase based on native app status and session
  const [loadingPhase, setLoadingPhase] = useState<LoadingPhase>(() => {
    // Web always shows content immediately
    if (!isNativeApp) return 'revealed';
    
    // SSR-safe: Check if we're in browser environment
    if (typeof window === 'undefined') return 'revealed';
    
    try {
      // Check if route restoration is pending
      // If so, skip all loading on this intermediate page
      const isRestorationPending = sessionStorage.getItem(SESSION_STORAGE_KEYS.ROUTE_RESTORATION_PENDING);
      if (isRestorationPending) {
        // Clear the flag immediately
        sessionStorage.removeItem(SESSION_STORAGE_KEYS.ROUTE_RESTORATION_PENDING);
        return 'revealed'; // Skip all loading phases on intermediate page
      }
      
      // Check if page has been visited before
      const hasBeenVisited = sessionStorage.getItem(visitedKey);
      
      // Mobile Native App Loading Logic (Splash removed):
      // - First visit to page → show skeleton only (phase 1)
      // - Subsequent visits to same page → instant content (phase 2)
      // No splash screen on dashboard pages
      if (!hasBeenVisited) {
        return 'skeleton'; // First visit to this page - show skeleton only
      } else {
        return 'revealed'; // Subsequent visits - instant content
      }
    } catch (error) {
      // If sessionStorage access fails (e.g., private browsing), show skeleton
      // This ensures graceful degradation
      console.warn('Failed to access sessionStorage, defaulting to skeleton:', error);
      return 'skeleton';
    }
  });
  
  /**
   * Handle splash completion - DEPRECATED
   * 
   * @deprecated Dashboard pages no longer show splash screen as of 2026-02-14.
   * This function is kept for backward compatibility but is now a no-op.
   * Will be removed in a future cleanup phase.
   */
  const handleSplashComplete = useCallback(() => {
    // No-op: Splash phase removed from dashboard pages
    // This function is kept for backward compatibility with existing code
  }, []);
  
  // Mark page as visited (called when skeleton completes)
  const markAsVisited = useCallback(() => {
    try {
      sessionStorage.setItem(visitedKey, 'true');
    } catch (error) {
      // Silently fail if sessionStorage is unavailable
      console.warn('Failed to mark page as visited:', error);
    }
  }, [visitedKey]);
  
  // Auto-transition from skeleton to revealed when data is ready
  useEffect(() => {
    // Only apply to native apps in skeleton phase
    if (!isNativeApp || loadingPhase !== 'skeleton') return;
    
    if (isDataReady) {
      // Adaptive delay based on network speed ensures optimal UX
      // Fast network: 200ms, Slow network: up to 800ms
      const timer = setTimeout(() => {
        setLoadingPhase('revealed');
        // Mark as visited when revealing content
        markAsVisited();
      }, adaptiveSkeletonDelay);
      
      return () => clearTimeout(timer);
    }
  }, [isNativeApp, loadingPhase, isDataReady, adaptiveSkeletonDelay, markAsVisited]);
  
  return {
    loadingPhase,
    handleSplashComplete,
    markAsVisited,
    isNativeApp
  };
}