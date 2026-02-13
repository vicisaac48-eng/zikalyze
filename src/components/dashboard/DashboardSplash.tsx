import { TrendingUp } from "lucide-react";
import { useEffect } from "react";

interface DashboardSplashProps {
  onComplete: () => void;
}

const DashboardSplash = ({ onComplete }: DashboardSplashProps) => {
  // Auto-complete after 1.2 seconds for a more professional feel
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 1200);
    
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center splash-fade-in"
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
