import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  TrendingUp,
  LayoutDashboard,
  BarChart3,
  Brain,
  Wallet,
  Settings,
  Search,
  LogOut,
  BellRing,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import zikalyzeLogo from "@/assets/zikalyze-logo.png";

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

const Sidebar = ({ isOpen = false, onToggle }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { t } = useTranslation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: t("sidebar.dashboard"), path: "/dashboard" },
    { icon: BarChart3, label: t("sidebar.analytics"), path: "/dashboard/analytics" },
    { icon: Brain, label: t("sidebar.aiAnalyzer"), path: "/dashboard/analyzer" },
    { icon: BellRing, label: t("sidebar.alerts"), path: "/dashboard/alerts" },
    { icon: Wallet, label: t("sidebar.portfolio"), path: "/dashboard/portfolio" },
    { icon: Settings, label: t("sidebar.settings"), path: "/dashboard/settings" },
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut();
    navigate("/");
  };

  if (isLoggingOut) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <img 
            src={zikalyzeLogo} 
            alt="Loading" 
            className="h-16 w-16 animate-pulse"
          />
          <p className="text-sm text-muted-foreground">{t("sidebar.signingOut")}</p>
        </div>
      </div>
    );
  }

  const handleNavClick = () => {
    // Close sidebar on mobile after navigation
    // Check if we're on mobile using matchMedia (more reliable than innerWidth)
    if (isOpen && onToggle && window.matchMedia('(max-width: 767px)').matches) {
      onToggle();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onToggle}
        />
      )}
      
      <aside className={cn(
        "fixed left-0 top-0 z-40 flex h-[100dvh] flex-col items-center border-r border-border bg-card pt-4 pb-20 transition-transform duration-300 ease-in-out safe-area-inset-top",
        // Hidden on mobile by default, shown when isOpen
        isOpen ? "translate-x-0" : "-translate-x-full",
        // Always visible on md and above
        "md:translate-x-0",
        // Width: 64px on mobile when open, 64px on md, 256px on lg
        "w-64 md:w-16 lg:w-64 lg:pt-6 lg:pb-24"
      )}>
        {/* Close button for mobile */}
        <button
          onClick={onToggle}
          className="absolute right-2 top-2 p-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground md:hidden"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Logo */}
        <Link to="/dashboard" className="mb-6 flex items-center gap-3 lg:mb-8" onClick={handleNavClick}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary lg:h-10 lg:w-10">
            <TrendingUp className="h-4 w-4 text-primary-foreground lg:h-5 lg:w-5" />
          </div>
          <span className="text-lg font-bold text-foreground md:hidden lg:block lg:text-xl">
            Zikalyze
          </span>
        </Link>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1.5 px-2 w-full lg:gap-2 lg:px-3 custom-scrollbar overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-2.5 py-2.5 transition-all lg:rounded-xl lg:px-3 lg:py-3",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground active:scale-95"
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0 lg:h-5 lg:w-5" />
              <span className="text-sm md:hidden lg:block">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions - Fixed to bottom of sidebar */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-1.5 px-2 py-4 bg-card border-t border-border lg:gap-2 lg:px-3 lg:py-5">
        <button className="flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-muted-foreground transition-all hover:bg-secondary hover:text-foreground active:scale-95 lg:rounded-xl lg:px-3 lg:py-3">
          <Search className="h-4 w-4 lg:h-5 lg:w-5" />
          <span className="text-sm md:hidden lg:block">{t("sidebar.search")}</span>
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-muted-foreground transition-all hover:bg-destructive/20 hover:text-destructive active:scale-95 lg:rounded-xl lg:px-3 lg:py-3"
        >
          <LogOut className="h-4 w-4 lg:h-5 lg:w-5" />
          <span className="text-sm md:hidden lg:block">{t("sidebar.logout")}</span>
        </button>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
