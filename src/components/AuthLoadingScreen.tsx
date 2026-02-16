import { TrendingUp } from "lucide-react";

/**
 * Full-screen loading indicator shown while checking authentication state.
 * Used specifically for mobile native apps to prevent landing page flash.
 * 
 * Shows a professional loading screen with the app logo while:
 * - Checking if user is authenticated
 * - Loading saved wallet from localStorage
 * - Determining which route to show
 * 
 * This prevents the jarring flash of landing page on mobile native apps
 * when reopening after being away for a while.
 */
export function AuthLoadingScreen() {
  return (
    <div 
      className="fixed inset-0 flex items-center justify-center"
      style={{ backgroundColor: '#0a0f1a' }}
    >
      {/* App logo with pulsing animation */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          {/* Outer pulse ring */}
          <div className="absolute inset-0 rounded-xl bg-primary opacity-20 animate-ping" 
               style={{ animationDuration: '2s' }} />
          
          {/* Logo container */}
          <div className="relative flex h-20 w-20 items-center justify-center rounded-xl bg-primary">
            <TrendingUp className="h-10 w-10 text-primary-foreground" />
          </div>
        </div>
        
        {/* Loading text - optional, can be removed for cleaner look */}
        <div className="text-sm text-gray-400 animate-pulse">
          Loading...
        </div>
      </div>
    </div>
  );
}
