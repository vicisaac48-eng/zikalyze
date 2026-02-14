import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useIsNativeApp } from "./useIsNativeApp";
import { LOCAL_STORAGE_KEYS, SESSION_STORAGE_KEYS } from "@/constants/storage";

/**
 * Hook to restore the last visited route for native mobile apps.
 * 
 * Behavior:
 * - Saves the current route to localStorage whenever the user navigates (native apps only)
 * - On app mount, restores the last route if available
 * - Only applies to authenticated routes (dashboard pages)
 * - Does not apply to web apps, only native mobile apps
 * - Sets a session flag to prevent splash on intermediate page during restoration
 * 
 * Usage:
 * Call this hook once in your app's root component after authentication is loaded.
 * 
 * @param isAuthenticated - Whether the user is currently authenticated
 */
export function useRouteRestoration(isAuthenticated: boolean) {
  const location = useLocation();
  const navigate = useNavigate();
  const isNativeApp = useIsNativeApp();

  // Save current route to localStorage whenever it changes (native apps only)
  useEffect(() => {
    if (!isNativeApp || !isAuthenticated) return;

    // Only save authenticated routes (dashboard pages)
    const currentPath = location.pathname;
    if (currentPath.startsWith('/dashboard')) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEYS.LAST_ROUTE, currentPath);
      } catch (error) {
        console.error('Failed to save last route:', error);
      }
    }
  }, [location.pathname, isNativeApp, isAuthenticated]);

  // Restore last route on app mount (native apps only)
  useEffect(() => {
    if (!isNativeApp || !isAuthenticated) return;

    // Only restore once on initial mount when on landing or root page
    const currentPath = location.pathname;
    const isOnLandingOrRoot = currentPath === '/' || currentPath === '/dashboard';
    
    if (!isOnLandingOrRoot) return;

    try {
      const lastRoute = localStorage.getItem(LOCAL_STORAGE_KEYS.LAST_ROUTE);
      
      // If there's a saved route and it's different from current
      if (lastRoute && lastRoute !== currentPath && lastRoute.startsWith('/dashboard')) {
        // Set session flag to indicate route restoration will occur
        // This prevents splash on intermediate /dashboard page
        sessionStorage.setItem(SESSION_STORAGE_KEYS.ROUTE_RESTORATION_PENDING, 'true');
        
        // Navigate immediately to the saved route
        // The target page will show the splash instead of the intermediate page
        navigate(lastRoute, { replace: true });
      }
    } catch (error) {
      console.error('Failed to restore last route:', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isNativeApp]); // Only run when authentication or platform changes

  return null;
}

/**
 * Clear the saved route from localStorage.
 * Call this on logout to ensure clean state.
 */
export function clearLastRoute() {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.LAST_ROUTE);
  } catch (error) {
    console.error('Failed to clear last route:', error);
  }
}
