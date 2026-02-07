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

// Minimum movement in pixels before determining scroll direction (horizontal vs vertical)
const DIRECTION_DETECTION_THRESHOLD = 10;

// Helper function to check if at the top of the scroll container
const checkIfAtTop = (): boolean => {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  return scrollTop <= 0;
};

// Helper function to check if an element or its parent has horizontal scrolling enabled
// Uses computed styles to detect horizontal scroll capability regardless of CSS framework
const isInHorizontalScrollArea = (element: EventTarget | null): boolean => {
  if (!element || !(element instanceof HTMLElement)) return false;
  
  let current: HTMLElement | null = element;
  while (current) {
    const style = window.getComputedStyle(current);
    const overflowX = style.overflowX;
    const hasHorizontalScroll = overflowX === 'auto' || overflowX === 'scroll';
    const canScrollHorizontally = current.scrollWidth > current.clientWidth;
    
    // Check computed style - this works regardless of CSS framework (Tailwind, CSS modules, etc.)
    if (hasHorizontalScroll && canScrollHorizontally) {
      return true;
    }
    
    current = current.parentElement;
  }
  return false;
};

/**
 * Hook for implementing native-style pull-to-refresh functionality.
 * Only active on native Android/PWA apps, does nothing on web.
 * 
 * IMPORTANT: This hook will NOT trigger pull-to-refresh when:
 * - User is scrolling horizontally (e.g., crypto cards)
 * - Touch started on a horizontal scroll container
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
  const startXRef = useRef<number>(0); // Track X position for horizontal detection
  const currentYRef = useRef<number>(0);
  const isAtTopRef = useRef<boolean>(true);
  // Use ref to avoid stale closure in event handlers
  const isPullingRef = useRef<boolean>(false);
  const isRefreshingRef = useRef<boolean>(false);
  const pullDistanceRef = useRef<number>(0);
  // Track if we've determined this is a horizontal scroll gesture
  const isHorizontalScrollRef = useRef<boolean>(false);
  const directionDeterminedRef = useRef<boolean>(false);

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

      // Check if touch started in a horizontal scroll area
      if (isInHorizontalScrollArea(e.target)) {
        isHorizontalScrollRef.current = true;
        directionDeterminedRef.current = true;
        return; // Don't start pull-to-refresh
      }

      isAtTopRef.current = checkIfAtTop();
      if (!isAtTopRef.current) return;

      startYRef.current = e.touches[0].clientY;
      startXRef.current = e.touches[0].clientX;
      currentYRef.current = startYRef.current;
      isPullingRef.current = true;
      isHorizontalScrollRef.current = false;
      directionDeterminedRef.current = false;
      setIsPulling(true);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isRefreshingRef.current || !isPullingRef.current) return;
      if (!isAtTopRef.current) return;
      
      // If already determined to be horizontal scroll, skip
      if (isHorizontalScrollRef.current) return;

      const currentX = e.touches[0].clientX;
      currentYRef.current = e.touches[0].clientY;
      
      const deltaX = Math.abs(currentX - startXRef.current);
      const deltaY = currentYRef.current - startYRef.current;
      const absDeltaY = Math.abs(deltaY);

      // Determine scroll direction on first significant movement
      if (!directionDeterminedRef.current && (deltaX > DIRECTION_DETECTION_THRESHOLD || absDeltaY > DIRECTION_DETECTION_THRESHOLD)) {
        directionDeterminedRef.current = true;
        
        // If horizontal movement is greater than vertical, this is a horizontal scroll
        if (deltaX > absDeltaY) {
          isHorizontalScrollRef.current = true;
          setPullDistance(0);
          setIsPulling(false);
          isPullingRef.current = false;
          return;
        }
      }

      // Only trigger pull-to-refresh on downward swipe
      if (deltaY <= 0) {
        setPullDistance(0);
        return;
      }

      // If we're not at top anymore, cancel the pull
      if (!checkIfAtTop() && deltaY > 0) {
        setPullDistance(0);
        return;
      }

      // Apply resistance to make the pull feel natural
      const resistedDistance = Math.min(
        deltaY * resistance,
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
      
      // Reset horizontal scroll tracking
      const wasHorizontalScroll = isHorizontalScrollRef.current;
      isHorizontalScrollRef.current = false;
      directionDeterminedRef.current = false;

      // Don't trigger refresh if this was a horizontal scroll
      if (wasHorizontalScroll) {
        return;
      }

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
