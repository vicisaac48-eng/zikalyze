import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIsNativeApp } from "@/hooks/useIsNativeApp";
import { ROUTES } from "@/constants/routes";
import Landing from "@/pages/Landing";
import { AuthLoadingScreen } from "./AuthLoadingScreen";

/**
 * Wrapper component for Landing page route that handles mobile native app redirects.
 * 
 * On mobile native apps (Capacitor or PWA installed):
 * - Shows loading screen while checking authentication state
 * - Authenticated users are immediately redirected to /dashboard
 * - Landing page is never shown after login/signup
 * - This prevents the landing page flash when app is reopened
 * 
 * On web apps:
 * - Normal behavior: show landing page, redirect happens in Landing.tsx
 */
export function LandingRoute() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const isNativeApp = useIsNativeApp();

  useEffect(() => {
    // Only apply override on mobile native apps
    if (!isNativeApp) return;
    
    // Wait for auth to load
    if (loading) return;
    
    // If user is authenticated on mobile native app, redirect to dashboard
    // This prevents landing page from ever showing after login
    if (user) {
      navigate(ROUTES.DASHBOARD, { replace: true });
    }
  }, [isNativeApp, loading, user, navigate]);

  // CRITICAL FIX: On mobile native apps, show loading screen while checking auth
  // This prevents the flash of landing page when reopening the app
  if (isNativeApp && loading) {
    return <AuthLoadingScreen />;
  }

  // If mobile native app and authenticated, don't render landing (redirect is happening)
  // Show loading screen during the brief redirect moment
  if (isNativeApp && user) {
    return <AuthLoadingScreen />;
  }

  // Otherwise show landing page (web apps or native apps with no auth)
  return <Landing />;
}
