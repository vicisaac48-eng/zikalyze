import { useState, useEffect } from "react";

/**
 * Hook to track if this is the initial app load or just navigation.
 * Loading spinner should only show on:
 * - Initial app load
 * - Login/logout (auth state changes)
 * 
 * NOT on dashboard navigation between pages.
 */
export const useInitialLoad = () => {
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  useEffect(() => {
    // Mark that we've loaded at least once
    if (!hasLoadedOnce) {
      setHasLoadedOnce(true);
      // After a short delay, mark initial load as complete
      const timer = setTimeout(() => {
        setIsInitialLoad(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [hasLoadedOnce]);

  // Method to trigger loading state (for auth changes)
  const triggerLoad = () => {
    setIsInitialLoad(true);
    setTimeout(() => setIsInitialLoad(false), 100);
  };

  return {
    isInitialLoad,
    shouldShowLoader: isInitialLoad,
    triggerLoad,
  };
};
