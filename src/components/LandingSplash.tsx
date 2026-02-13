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
        background: 'linear-gradient(135deg, #0a0f1a 0%, #0f1419 50%, #0a0f1a 100%)',
      }}
    >
      {/* Animated color bands in background */}
      <div className="absolute inset-0 overflow-hidden opacity-40">
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

      {/* Gradient overlay for depth */}
      <div 
        className="absolute inset-0 gradient-shimmer"
        style={{
          background: 'linear-gradient(45deg, rgba(112, 255, 193, 0.1) 0%, rgba(197, 163, 255, 0.1) 100%)',
          opacity: 0.3
        }}
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Logo with pulse animation */}
        <div className="logo-splash-pulse">
          <img 
            src={zikalyzeLogo}
            alt="Zikalyze"
            className="w-24 h-24 sm:w-32 sm:h-32 object-contain"
            style={{ 
              filter: 'drop-shadow(0 8px 24px rgba(112, 255, 193, 0.3))',
            }}
          />
        </div>

        {/* Brand text with gradient */}
        <div className="text-center space-y-2">
          <h1 
            className="text-3xl sm:text-4xl font-bold tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #70ffc1 0%, #c5a3ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Zikalyze
          </h1>
          <p className="text-sm sm:text-base text-gray-400 font-medium">
            AI-Powered Trading Analysis
          </p>
        </div>

        {/* Loading indicator */}
        <div className="flex gap-2 mt-4">
          <div 
            className="w-2 h-2 rounded-full bg-cyan-400"
            style={{ 
              animation: 'pulse 1.5s ease-in-out infinite',
              animationDelay: '0s'
            }}
          />
          <div 
            className="w-2 h-2 rounded-full bg-purple-400"
            style={{ 
              animation: 'pulse 1.5s ease-in-out infinite',
              animationDelay: '0.3s'
            }}
          />
          <div 
            className="w-2 h-2 rounded-full bg-cyan-400"
            style={{ 
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
