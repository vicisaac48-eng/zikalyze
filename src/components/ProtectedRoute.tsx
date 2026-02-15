import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import SessionTimeoutModal from "@/components/SessionTimeoutModal";
import { toast } from "sonner";
import { useIsNativeApp } from "@/hooks/useIsNativeApp";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const isNativeApp = useIsNativeApp();

  const handleTimeout = useCallback(async () => {
    await signOut();
    toast.info("You have been signed out due to inactivity");
    // On mobile native app, go to auth page instead of landing page
    // Landing page should only be visible on first install or explicit navigation
    navigate(isNativeApp ? "/auth" : "/");
  }, [signOut, navigate, isNativeApp]);

  const { showWarning, remainingTime, extendSession } = useSessionTimeout({
    timeoutMs: 15 * 60 * 1000, // 15 minutes
    warningMs: 2 * 60 * 1000, // 2 minutes warning
    onTimeout: handleTimeout,
  });

  useEffect(() => {
    // Only redirect to auth if loading is complete, no user, and NOT in demo mode
    // Demo mode is when loading is false and user is null (no wallet connected)
    // We allow access in demo mode so users can explore the app
    if (!loading && !user) {
      // User not logged in - allow demo mode access, don't redirect
      // The auth page is available via the nav menu if they want to sign in
    }
  }, [user, loading, navigate]);

  // No loading screens - instant navigation
  // Always allow access - demo mode when not logged in
  return (
    <>
      {children}
      <SessionTimeoutModal
        open={showWarning && !!user}
        remainingTime={remainingTime}
        onExtend={extendSession}
      />
    </>
  );
};

export default ProtectedRoute;
