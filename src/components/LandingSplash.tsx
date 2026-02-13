import { useEffect } from "react";
import zikalyzeLogo from "@/assets/zikalyze-logo.png";

interface LandingSplashProps {
  onComplete: () => void;
}

const LandingSplash = ({ onComplete }: LandingSplashProps) => {
  // Auto-complete after 2 seconds for professional branded experience
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div 
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center landing-splash-fade-in overflow-hidden"
      style={{ 
        backgroundColor: '#B2EBE0',
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.2) 0%, transparent 70%)'
      }}
      role="status"
      aria-live="polite"
      aria-label="Loading Zikalyze application"
    >
      {/* Animated color bands - darker versions for contrast on mint background */}
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

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Logo with pulse animation */}
        <div className="logo-splash-pulse">
          <img 
            src={zikalyzeLogo}
            alt="Zikalyze"
            className="w-24 h-24 sm:w-32 sm:h-32 object-contain"
            style={{ 
              filter: 'drop-shadow(0 8px 24px rgba(17, 24, 39, 0.15))',
            }}
          />
        </div>

        {/* Brand text */}
        <div className="text-center space-y-2">
          <h1 
            className="text-3xl sm:text-4xl font-bold tracking-tight"
            style={{ color: '#111827' }}
          >
            Zikalyze
          </h1>
          <p className="text-sm sm:text-base font-medium" style={{ color: '#374151' }}>
            AI-Powered Trading Analysis
          </p>
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
