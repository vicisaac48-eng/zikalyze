import { useState, useCallback, useEffect } from "react";
import { useIsNativeApp } from "./useIsNativeApp";
import { SESSION_STORAGE_KEYS } from "@/constants/storage";

// Loading phases for dashboard pages
export type LoadingPhase = 'splash' | 'skeleton' | 'revealed';

interface UseDashboardLoadingOptions {
  /**
   * Session storage key to track if splash has been shown
   * e.g., SESSION_STORAGE_KEYS.DASHBOARD_SPLASH_SHOWN
   * NOTE: This parameter is kept for backward compatibility but is not used
   * since Auth/Dashboard pages never show splash (only Landing page shows splash)
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
   * Default: 200ms for responsive smooth transition
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
 * Loading Phases for Auth/Dashboard pages:
 * - First visit: Shows skeleton (phase 2) → revealed (phase 3)
 * - Subsequent visits: Shows content instantly (phase 3)
 * - NEVER shows splash (phase 1) - splash is ONLY for Landing page
 * 
 * The 3-phase loading (splash + skeleton + reveal) ONLY happens on Landing page
 * when users first open the app or after clearing app cache/long absence.
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
  skeletonDelay = 200
}: UseDashboardLoadingOptions) {
  const isNativeApp = useIsNativeApp();
  
  // Initialize loading phase based on native app status and session
  const [loadingPhase, setLoadingPhase] = useState<LoadingPhase>(() => {
    // Web always shows content immediately
    if (!isNativeApp) return 'revealed';
    
    // Check if page has been visited before
    const hasBeenVisited = sessionStorage.getItem(visitedKey);
    
    // Loading logic for Auth and Dashboard pages:
    // - NEVER show splash (phase 1) - splash is ONLY for Landing page
    // - First visit to page → show skeleton (phase 2) then reveal (phase 3)
    // - Subsequent visits → show content instantly (phase 3)
    if (!hasBeenVisited) {
      return 'skeleton'; // First visit - show skeleton only (NO splash)
    } else {
      return 'revealed'; // Subsequent visits - instant content
    }
  });
  
  // Handle splash completion - transition to skeleton phase
  const handleSplashComplete = useCallback(() => {
    setLoadingPhase('skeleton');
    sessionStorage.setItem(sessionKey, 'true');
  }, [sessionKey]);
  
  // Mark page as visited (called when skeleton completes)
  const markAsVisited = useCallback(() => {
    sessionStorage.setItem(visitedKey, 'true');
  }, [visitedKey]);
  
  // Auto-transition from skeleton to revealed when data is ready
  useEffect(() => {
    // Only apply to native apps in skeleton phase
    if (!isNativeApp || loadingPhase !== 'skeleton') return;
    
    if (isDataReady) {
      // Professional delay ensures skeleton is visible for smooth UX
      const timer = setTimeout(() => {
        setLoadingPhase('revealed');
        // Mark as visited when revealing content
        markAsVisited();
      }, skeletonDelay);
      
      return () => clearTimeout(timer);
    }
  }, [isNativeApp, loadingPhase, isDataReady, skeletonDelay, markAsVisited]);
  
  return {
    loadingPhase,
    handleSplashComplete,
    markAsVisited,
    isNativeApp
  };
}