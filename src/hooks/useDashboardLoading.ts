import { useState, useCallback, useEffect } from "react";
import { useIsNativeApp } from "./useIsNativeApp";
import { SESSION_STORAGE_KEYS } from "@/constants/storage";

// Loading phases for dashboard pages
export type LoadingPhase = 'splash' | 'skeleton' | 'revealed';

interface UseDashboardLoadingOptions {
  /**
   * Session storage key to track if splash has been shown
   * e.g., SESSION_STORAGE_KEYS.DASHBOARD_SPLASH_SHOWN
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
 * Custom hook for managing 3-phase loading (splash → skeleton → revealed)
 * Only applies to native mobile apps. Web shows instant content.
 * 
 * Professional Navigation-Aware Loading:
 * - First visit ever (Landing page): Shows splash + skeleton + content
 * - First navigation (Dashboard pages): Shows skeleton + content ONLY (no splash)
 * - Subsequent visits: Shows content instantly
 * 
 * This ensures navigation buttons never trigger splash screen after initial app load.
 * The splash is shown once globally on landing page, then all dashboard pages skip it.
 * 
 * Usage:
 * ```tsx
 * const { loadingPhase, handleSplashComplete, markAsVisited } = useDashboardLoading({
 *   sessionKey: SESSION_STORAGE_KEYS.ANALYTICS_SPLASH_SHOWN,
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
    
    // Check if ANY splash has been shown (landing or page-specific)
    // This ensures navigation buttons never show splash after initial app load
    // We check BOTH keys to support two scenarios:
    // 1. LANDING_SPLASH_SHOWN: User came from landing page (most common)
    // 2. sessionKey: Direct page access without landing (e.g., deep link, bookmark)
    const hasSeenAnySplash = sessionStorage.getItem(SESSION_STORAGE_KEYS.LANDING_SPLASH_SHOWN) || 
                             sessionStorage.getItem(sessionKey);
    const hasBeenVisited = sessionStorage.getItem(visitedKey);
    
    // Professional loading logic for navigation:
    // 1. Never seen ANY splash → show splash (first time ever on landing)
    // 2. Seen splash but not visited this page → show skeleton only (first navigation)
    // 3. Already visited this page → show content instantly (subsequent visits)
    if (!hasSeenAnySplash) {
      return 'splash'; // First time ever - show splash (only on landing page)
    } else if (!hasBeenVisited) {
      return 'skeleton'; // First navigation - show skeleton only
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