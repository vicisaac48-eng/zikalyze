import { useEffect, useRef } from "react";
import { TrendingUp } from "lucide-react";
import { useIsNativeApp } from "@/hooks/useIsNativeApp";

interface LandingSplashProps {
  onComplete: () => void;
}

const LandingSplash = ({ onComplete }: LandingSplashProps) => {
  const isNativeApp = useIsNativeApp();
  
  // Store onComplete in ref to avoid effect re-runs on parent re-renders
  const onCompleteRef = useRef(onComplete);
  
  // Keep ref up-to-date with latest callback
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);
  
  // Auto-complete after 2 seconds for professional branded experience
  // Optimized duration provides branded experience without unnecessary delay
  // Effect runs only once on mount - timer won't reset on parent re-renders
  useEffect(() => {
    const timer = setTimeout(() => {
      onCompleteRef.current();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []); // Empty deps - run only once on mount

  return (
    <div 
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center landing-splash-fade-in overflow-hidden"
      style={{ 
        backgroundColor: isNativeApp ? '#B2EBE0' : '#0a0f1a',
        backgroundImage: isNativeApp ? 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.2) 0%, transparent 70%)' : 'none'
      }}
      role="status"
      aria-live="polite"
      aria-label="Loading Zikalyze application"
    >
      {/* Animated color bands - only show on native app for branded experience */}
      {isNativeApp && (
        <div className="absolute inset-0 overflow-hidden opacity-30">
          {/* Cyan band */}
          <div 
            className="absolute top-1/4 left-0 w-[200%] h-32 color-band"
            style={{ 
              background: 'linear-gradient(90deg, transparent 0%, #70ffc1 50%, transparent 100%)',
              animationDelay: '0s',
              filter: 'blur(40px)'
            }}
          />
          {/* Purple band */}
          <div 
            className="absolute top-1/2 left-0 w-[200%] h-32 color-band"
            style={{ 
              background: 'linear-gradient(90deg, transparent 0%, #c5a3ff 50%, transparent 100%)',
              animationDelay: '1s',
              filter: 'blur(40px)'
            }}
          />
          {/* Cyan band (bottom) */}
          <div 
            className="absolute top-3/4 left-0 w-[200%] h-32 color-band"
            style={{ 
              background: 'linear-gradient(90deg, transparent 0%, #70ffc1 50%, transparent 100%)',
              animationDelay: '0.5s',
              filter: 'blur(40px)'
            }}
          />
        </div>
      )}

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Logo with pulse animation - smaller on native app */}
        <div className={`logo-splash-pulse flex items-center justify-center rounded-2xl sm:rounded-3xl bg-primary ${
          isNativeApp ? 'w-20 h-20 sm:w-28 sm:h-28' : 'w-24 h-24 sm:w-32 sm:h-32'
        }`}>
          <TrendingUp className={`text-primary-foreground ${
            isNativeApp ? 'w-10 h-10 sm:w-14 sm:h-14' : 'w-12 h-12 sm:w-16 sm:h-16'
          }`} />
        </div>

        {/* Brand text */}
        <div className="text-center space-y-2">
          <h1 
            className="text-3xl sm:text-4xl font-bold tracking-tight"
            style={{ color: isNativeApp ? '#111827' : '#ffffff' }}
          >
            Zikalyze
          </h1>
          {isNativeApp && (
            <p className="text-sm sm:text-base font-medium" style={{ color: '#374151' }}>
              AI-Powered Trading Analysis
            </p>
          )}
        </div>

        {/* Loading indicator */}
        <div className="flex gap-2 mt-4">
          <div 
            className="w-2 h-2 rounded-full"
            style={{ 
              backgroundColor: '#70ffc1',
              animation: 'pulse 1.5s ease-in-out infinite',
              animationDelay: '0s'
            }}
          />
          <div 
            className="w-2 h-2 rounded-full"
            style={{ 
              backgroundColor: '#c5a3ff',
              animation: 'pulse 1.5s ease-in-out infinite',
              animationDelay: '0.3s'
            }}
          />
          <div 
            className="w-2 h-2 rounded-full"
            style={{ 
              backgroundColor: '#70ffc1',
              animation: 'pulse 1.5s ease-in-out infinite',
              animationDelay: '0.6s'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default LandingSplash;
