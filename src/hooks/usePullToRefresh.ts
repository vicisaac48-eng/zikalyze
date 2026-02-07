import { useState, useEffect, useCallback, useRef } from "react";
import { useIsNativeApp } from "./useIsNativeApp";

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number; // Distance to pull before triggering refresh (default: 80px)
  maxPull?: number; // Maximum pull distance (default: 150px)
  resistance?: number; // Resistance factor (0-1, default: 0.5)
  disabled?: boolean; // Disable the hook
}

interface UsePullToRefreshReturn {
  pullDistance: number;
  isRefreshing: boolean;
  isPulling: boolean;
  canRefresh: boolean; // True when pulled past threshold
  containerRef: React.RefObject<HTMLElement>;
  contentStyle: React.CSSProperties;
  indicatorStyle: React.CSSProperties;
}

// Helper function to check if at the top of the scroll container
const checkIfAtTop = (): boolean => {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  return scrollTop <= 0;
};

/**
 * Hook for implementing native-style pull-to-refresh functionality.
 * Only active on native Android/PWA apps, does nothing on web.
 */
export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  maxPull = 150,
  resistance = 0.5,
  disabled = false,
}: UsePullToRefreshOptions): UsePullToRefreshReturn {
  const isNativeApp = useIsNativeApp();
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);

  const containerRef = useRef<HTMLElement>(null);
  const startYRef = useRef<number>(0);
  const currentYRef = useRef<number>(0);
  const isAtTopRef = useRef<boolean>(true);
  // Use ref to avoid stale closure in event handlers
  const isPullingRef = useRef<boolean>(false);
  const isRefreshingRef = useRef<boolean>(false);
  const pullDistanceRef = useRef<number>(0);

  const canRefresh = pullDistance >= threshold;

  // Sync refs with state
  useEffect(() => {
    isPullingRef.current = isPulling;
  }, [isPulling]);

  useEffect(() => {
    isRefreshingRef.current = isRefreshing;
  }, [isRefreshing]);

  useEffect(() => {
    pullDistanceRef.current = pullDistance;
  }, [pullDistance]);

  // Handle the refresh action
  const handleRefresh = useCallback(async () => {
    if (isRefreshingRef.current) return;

    setIsRefreshing(true);
    try {
      await onRefresh();
    } catch (error) {
      console.error("Pull-to-refresh error:", error);
    } finally {
      setIsRefreshing(false);
      setPullDistance(0);
    }
  }, [onRefresh]);

  // Touch event handlers
  useEffect(() => {
    // Only enable on native app and when not disabled
    if (!isNativeApp || disabled) return;

    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (isRefreshingRef.current) return;

      isAtTopRef.current = checkIfAtTop();
      if (!isAtTopRef.current) return;

      startYRef.current = e.touches[0].clientY;
      currentYRef.current = startYRef.current;
      isPullingRef.current = true;
      setIsPulling(true);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isRefreshingRef.current || !isPullingRef.current) return;
      if (!isAtTopRef.current) return;

      currentYRef.current = e.touches[0].clientY;
      const rawDistance = currentYRef.current - startYRef.current;

      // Only trigger pull-to-refresh on downward swipe
      if (rawDistance <= 0) {
        setPullDistance(0);
        return;
      }

      // If we're not at top anymore, cancel the pull
      if (!checkIfAtTop() && rawDistance > 0) {
        setPullDistance(0);
        return;
      }

      // Apply resistance to make the pull feel natural
      const resistedDistance = Math.min(
        rawDistance * resistance,
        maxPull
      );

      // Prevent default scroll when pulling to refresh
      if (resistedDistance > 10) {
        e.preventDefault();
      }

      setPullDistance(resistedDistance);
    };

    const handleTouchEnd = () => {
      if (isRefreshingRef.current) return;

      const canTriggerRefresh = pullDistanceRef.current >= threshold;
      
      isPullingRef.current = false;
      setIsPulling(false);

      if (canTriggerRefresh && isAtTopRef.current) {
        handleRefresh();
      } else {
        // Animate back to zero
        setPullDistance(0);
      }
    };

    // Add touch event listeners
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });
    container.addEventListener("touchcancel", handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [isNativeApp, disabled, handleRefresh, resistance, maxPull, threshold]);

  // Content transform style
  const contentStyle: React.CSSProperties = {
    transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : "none",
    transition: isPulling ? "none" : "transform 0.3s ease-out",
  };

  // Indicator style
  const indicatorStyle: React.CSSProperties = {
    transform: `translateY(${Math.min(pullDistance - 60, 0)}px) rotate(${pullDistance * 2}deg)`,
    opacity: pullDistance > 10 ? Math.min(pullDistance / threshold, 1) : 0,
    transition: isPulling ? "none" : "transform 0.3s ease-out, opacity 0.3s ease-out",
  };

  // Return no-op values for web
  if (!isNativeApp || disabled) {
    return {
      pullDistance: 0,
      isRefreshing: false,
      isPulling: false,
      canRefresh: false,
      containerRef: containerRef as React.RefObject<HTMLElement>,
      contentStyle: {},
      indicatorStyle: { opacity: 0 },
    };
  }

  return {
    pullDistance,
    isRefreshing,
    isPulling,
    canRefresh,
    containerRef: containerRef as React.RefObject<HTMLElement>,
    contentStyle,
    indicatorStyle,
  };
}
