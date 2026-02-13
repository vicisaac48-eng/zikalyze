import { TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

interface DashboardSplashProps {
  onComplete: () => void;
}

const DashboardSplash = ({ onComplete }: DashboardSplashProps) => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  
  // Start fade-out at 1000ms, complete at 1200ms for 200ms overlap with skeleton fade-in
  useEffect(() => {
    // Start fade-out 200ms before completion to overlap with skeleton fade-in
    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 1000);
    
    // Complete transition after fade-out animation finishes
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 1200);
    
    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center ${isFadingOut ? 'splash-fade-out' : 'splash-fade-in'}`}
      style={{ 
        backgroundColor: '#B2EBE0',
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.15) 0%, transparent 50%)'
      }}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Professional icon with shadow and pulse */}
        <div className="splash-icon">
          <TrendingUp 
            className="w-20 h-20 sm:w-24 sm:h-24" 
            style={{ color: '#111827' }}
            strokeWidth={2.5}
          />
        </div>
        
        {/* Subtle brand text */}
        <div className="text-center">
          <h2 
            className="text-xl font-bold tracking-tight" 
            style={{ color: '#111827', opacity: 0.9 }}
          >
            Zikalyze
          </h2>
          <p 
            className="text-sm mt-1" 
            style={{ color: '#111827', opacity: 0.6 }}
          >
            AI-Powered Trading Analysis
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardSplash;
