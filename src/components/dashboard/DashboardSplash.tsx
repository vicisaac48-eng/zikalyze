import { TrendingUp } from "lucide-react";

interface DashboardSplashProps {
  onComplete: () => void;
}

const DashboardSplash = ({ onComplete }: DashboardSplashProps) => {
  // Auto-complete after 1 second
  setTimeout(() => {
    onComplete();
  }, 1000);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center splash-fade-in"
      style={{ backgroundColor: '#B2EBE0' }}
    >
      <TrendingUp 
        className="w-16 h-16 sm:w-20 sm:h-20" 
        style={{ color: '#111827' }}
        strokeWidth={2.5}
      />
    </div>
  );
};

export default DashboardSplash;
