import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIsNativeApp } from "@/hooks/useIsNativeApp";
import Landing from "@/pages/Landing";

/**
 * Wrapper component for Landing page route that handles mobile native app redirects.
 * 
 * On mobile native apps (Capacitor or PWA installed):
 * - Authenticated users are immediately redirected to /dashboard
 * - Landing page is never shown after login/signup
 * - This prevents the landing page from appearing when app is reopened
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
      navigate("/dashboard", { replace: true });
    }
  }, [isNativeApp, loading, user, navigate]);

  // If mobile native app and authenticated, don't render landing (redirect is happening)
  if (isNativeApp && !loading && user) {
    return null;
  }

  // Otherwise show landing page
  return <Landing />;
}
