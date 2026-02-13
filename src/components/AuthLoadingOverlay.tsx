import zikalyzeLogo from "@/assets/zikalyze-logo.png";

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
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center auth-loading-overlay auth-overlay-fade-in">
      {/* Outer pulsing ring */}
      <div className="relative flex items-center justify-center">
        {/* Glow effect background */}
        <div className="absolute inset-0 auth-glow-pulse" />
        
        {/* Rotating outer ring */}
        <div className="absolute w-32 h-32 rounded-full border-2 border-primary/30 auth-ring-rotate" />
        <div className="absolute w-28 h-28 rounded-full border-2 border-primary/20 auth-ring-rotate-reverse" />
        
        {/* Logo container with shadow */}
        <div className="relative z-10">
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full auth-logo-glow" />
          <img
            src={zikalyzeLogo}
            alt="Zikalyze"
            width={96}
            height={96}
            className="relative z-10 logo-spin-professional drop-shadow-2xl"
          />
        </div>
      </div>
      
      {/* Loading text */}
      <div className="mt-8 flex items-center gap-2">
        <span className="text-sm font-medium text-primary/90">Authenticating</span>
        <div className="flex gap-1">
          <span className="auth-dot-pulse" style={{ animationDelay: "0s" }}>.</span>
          <span className="auth-dot-pulse" style={{ animationDelay: "0.2s" }}>.</span>
          <span className="auth-dot-pulse" style={{ animationDelay: "0.4s" }}>.</span>
        </div>
      </div>
    </div>
  );
}
