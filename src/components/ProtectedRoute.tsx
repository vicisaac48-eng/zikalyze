import { useEffect, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import zikalyzeLogo from "@/assets/zikalyze-logo.png";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import SessionTimeoutModal from "@/components/SessionTimeoutModal";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const handleTimeout = useCallback(async () => {
    await signOut();
    toast.info("You have been signed out due to inactivity");
    navigate("/");
  }, [signOut, navigate]);

  const { showWarning, remainingTime, extendSession } = useSessionTimeout({
    timeoutMs: 15 * 60 * 1000, // 15 minutes
    warningMs: 2 * 60 * 1000, // 2 minutes warning
    onTimeout: handleTimeout,
  });

  useEffect(() => {
    // Wait until auth loading completes before handling initial load state
    if (loading) return;
    
    if (isInitialLoad) {
      // Fade out after initial load completes
      setIsFadingOut(true);
      const timer = setTimeout(() => {
        setIsInitialLoad(false);
        setIsFadingOut(false);
      }, 300); // Match fade-out animation duration
      return () => clearTimeout(timer);
    }
  }, [loading, isInitialLoad]);

  useEffect(() => {
    // Only redirect to auth if loading is complete, no user, and NOT in demo mode
    // Demo mode is when loading is false and user is null (no wallet connected)
    // We allow access in demo mode so users can explore the app
    if (!loading && !user) {
      // User not logged in - allow demo mode access, don't redirect
      // The auth page is available via the nav menu if they want to sign in
    }
  }, [user, loading, navigate]);

  // Only show loading on initial load or when auth is actually loading
  // NOT on navigation between pages
  if ((loading && isInitialLoad) || isFadingOut) {
    return (
      <div 
        className={`fixed inset-0 flex items-center justify-center ${isFadingOut ? 'fade-out' : 'fade-in'}`}
        style={{ backgroundColor: '#0a0f1a' }}
      >
        <img 
          src={zikalyzeLogo} 
          alt="Loading"
          className="loading-logo-rect logo-rotate"
          style={{ 
            filter: 'none', 
            boxShadow: 'none' 
          }}
        />
      </div>
    );
  }

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
