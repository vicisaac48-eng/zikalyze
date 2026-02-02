import { useState, useEffect } from "react";

// Extend Navigator interface for iOS standalone property
interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

/**
 * Hook to detect if the app is running as a native app or PWA in standalone mode.
 * Used to hide web-specific UI elements like cookie consent and PWA install banners.
 * 
 * Detection criteria:
 * - Running in standalone mode (PWA installed)
 * - User agent contains "ZikalyzeApp" (Capacitor Android app)
 * - Running in fullscreen mode (TWA or similar)
 */
export function useIsNativeApp(): boolean {
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    const checkNativeMode = () => {
      // Check if running as installed PWA in standalone mode
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
      
      // Check if running in fullscreen mode (TWA)
      const isFullscreen = window.matchMedia("(display-mode: fullscreen)").matches;
      
      // Check if running as Capacitor Android app
      const isCapacitorApp = navigator.userAgent.includes("ZikalyzeApp");
      
      // Check iOS standalone mode (Safari on iOS)
      const nav = navigator as NavigatorWithStandalone;
      const isIOSStandalone = nav.standalone === true;

      return isStandalone || isFullscreen || isCapacitorApp || isIOSStandalone;
    };

    setIsNative(checkNativeMode());

    // Listen for changes in display mode (in case user installs PWA while using)
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleChange = () => setIsNative(checkNativeMode());
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return isNative;
}
