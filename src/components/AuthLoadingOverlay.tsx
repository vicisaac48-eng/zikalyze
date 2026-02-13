import zikalyzeLogo from "@/assets/zikalyze-logo.png";

interface AuthLoadingOverlayProps {
  isVisible: boolean;
}

/**
 * Loading overlay shown during authentication on native mobile app only.
 * Shows a spinning logo in center while auth page is visible (faded) in background.
 */
export function AuthLoadingOverlay({ isVisible }: AuthLoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center auth-loading-overlay">
      {/* Spinning logo */}
      <div className="relative">
        <img
          src={zikalyzeLogo}
          alt="Zikalyze"
          width={80}
          height={80}
          className="logo-spin"
        />
      </div>
    </div>
  );
}
