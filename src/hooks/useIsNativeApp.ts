import { useState, useEffect } from "react";
import { Capacitor } from "@capacitor/core";

// Extend Navigator interface for iOS standalone property
interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

/**
 * Hook to detect if the app is running as a native app or PWA in standalone mode.
 * Used to hide web-specific UI elements like cookie consent and PWA install banners.
 * 
 * Detection criteria:
 * - Running as Capacitor native app (Android/iOS) via Capacitor.isNativePlatform()
 * - Running in standalone mode (PWA installed)
 * - Running in fullscreen mode (TWA or similar)
 */
export function useIsNativeApp(): boolean {
  const [isNative, setIsNative] = useState(() => {
    // Initial synchronous check for Capacitor native platform
    // This ensures immediate correct state before first render
    return Capacitor.isNativePlatform();
  });

  useEffect(() => {
    const checkNativeMode = () => {
      // Primary check: Capacitor native platform detection (most reliable)
      if (Capacitor.isNativePlatform()) {
        return true;
      }
      
      // Check if running as installed PWA in standalone mode
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
      
      // Check if running in fullscreen mode (TWA)
      const isFullscreen = window.matchMedia("(display-mode: fullscreen)").matches;
      
      // Check iOS standalone mode (Safari on iOS)
      const nav = navigator as NavigatorWithStandalone;
      const isIOSStandalone = nav.standalone === true;

      return isStandalone || isFullscreen || isIOSStandalone;
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
