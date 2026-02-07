import { useEffect, useCallback } from "react";
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

  // Redirect to login if not authenticated (no demo mode)
  useEffect(() => {
    if (!loading && !user) {
      toast.info("Please sign in to access the dashboard");
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // Seamless loading with logo - matches index.html background exactly
  if (loading) {
    return (
      <div 
        className="fixed inset-0 flex items-center justify-center"
        style={{ backgroundColor: '#0a0f1a' }}
      >
        <img 
          src={zikalyzeLogo} 
          alt="Loading"
          width={64}
          height={64}
          className="h-16 w-16 animate-spin-slow opacity-80"
        />
      </div>
    );
  }

  // Only allow authenticated users - no demo mode
  if (!user) {
    return null;
  }

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
