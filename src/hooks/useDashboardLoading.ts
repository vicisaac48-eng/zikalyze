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
   * Condition to determine when data is ready
   * e.g., !loading && data.length > 0
   */
  isDataReady?: boolean;
  
  /**
   * Delay before transitioning from skeleton to revealed (in ms)
   * Default: 400ms for professional smooth transition
   */
  skeletonDelay?: number;
}

/**
 * Custom hook for managing 3-phase loading (splash → skeleton → revealed)
 * Only applies to native mobile apps. Web shows instant content.
 * 
 * Usage:
 * ```tsx
 * const { loadingPhase, handleSplashComplete } = useDashboardLoading({
 *   sessionKey: SESSION_STORAGE_KEYS.ANALYTICS_SPLASH_SHOWN,
 *   isDataReady: !loading && prices.length > 0,
 *   skeletonDelay: 400
 * });
 * ```
 */
export function useDashboardLoading({
  sessionKey,
  isDataReady = true,
  skeletonDelay = 400
}: UseDashboardLoadingOptions) {
  const isNativeApp = useIsNativeApp();
  
  // Initialize loading phase based on native app status and session
  const [loadingPhase, setLoadingPhase] = useState<LoadingPhase>(() => {
    // Web always shows content immediately
    if (!isNativeApp) return 'revealed';
    
    // Check if splash has been shown in this session
    const hasSeenSplash = sessionStorage.getItem(sessionKey);
    return hasSeenSplash ? 'revealed' : 'splash';
  });
  
  // Handle splash completion - transition to skeleton phase
  const handleSplashComplete = useCallback(() => {
    setLoadingPhase('skeleton');
    sessionStorage.setItem(sessionKey, 'true');
  }, [sessionKey]);
  
  // Auto-transition from skeleton to revealed when data is ready
  useEffect(() => {
    // Only apply to native apps in skeleton phase
    if (!isNativeApp || loadingPhase !== 'skeleton') return;
    
    if (isDataReady) {
      // Professional delay ensures skeleton is visible for smooth UX
      const timer = setTimeout(() => {
        setLoadingPhase('revealed');
      }, skeletonDelay);
      
      return () => clearTimeout(timer);
    }
  }, [isNativeApp, loadingPhase, isDataReady, skeletonDelay]);
  
  return {
    loadingPhase,
    handleSplashComplete,
    isNativeApp
  };
}