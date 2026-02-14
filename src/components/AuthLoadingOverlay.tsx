import { TrendingUp } from "lucide-react";

interface AuthLoadingOverlayProps {
  isVisible: boolean;
}

/**
 * Professional loading overlay shown during authentication on native mobile app only.
 * Features:
 * - Smooth fade-in animation
 * - Spinning logo with glow effect
 * - Pulsing outer ring
 * - Loading text with dots animation
 * - Glassmorphism backdrop
 */
export function AuthLoadingOverlay({ isVisible }: AuthLoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center auth-loading-overlay auth-overlay-fade-in"
      role="status"
      aria-live="polite"
      aria-label="Authenticating your credentials"
    >
      {/* Outer pulsing ring */}
      <div className="relative flex items-center justify-center">
        {/* Glow effect background */}
        <div className="absolute inset-0 auth-glow-pulse" />
        
        {/* Rotating outer ring */}
        <div className="absolute w-24 h-24 rounded-full border-2 border-primary/30 auth-ring-rotate" />
        <div className="absolute w-20 h-20 rounded-full border-2 border-primary/20 auth-ring-rotate-reverse" />
        
        {/* Logo container with shadow - Smaller size for mobile */}
        <div className="relative z-10">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full auth-logo-glow" />
          <div className="relative z-10 flex items-center justify-center w-14 h-14 rounded-2xl bg-primary logo-spin-professional drop-shadow-2xl">
            <TrendingUp className="w-7 h-7 text-primary-foreground" />
          </div>
        </div>
      </div>
      
      {/* Loading text */}
      <div className="mt-8 flex items-center gap-2">
        <span className="text-sm font-medium text-primary/90" aria-label="Authentication in progress">
          Authenticating
        </span>
        <div className="flex gap-1" aria-hidden="true">
          <span className="auth-dot-pulse" style={{ animationDelay: "0s" }}>.</span>
          <span className="auth-dot-pulse" style={{ animationDelay: "0.2s" }}>.</span>
          <span className="auth-dot-pulse" style={{ animationDelay: "0.4s" }}>.</span>
        </div>
      </div>
    </div>
  );
}
