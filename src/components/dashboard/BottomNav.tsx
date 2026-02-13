import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  BarChart3,
  Brain,
  Settings,
  LogOut,
  MoreHorizontal,
  X,
  BellRing,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import zikalyzeLogo from "@/assets/zikalyze-logo.png";

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { signOut } = useAuth();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Shared styles for nav items
  const navItemBaseClass = "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors min-w-[48px]";

  const navItems = [
    { icon: LayoutDashboard, label: t("sidebar.dashboard", "Home"), path: "/dashboard" },
    { icon: BarChart3, label: t("sidebar.analytics", "Analytics"), path: "/dashboard/analytics" },
    { icon: Brain, label: t("sidebar.aiAnalyzer", "AI"), path: "/dashboard/analyzer" },
    { icon: Settings, label: t("sidebar.settings", "Settings"), path: "/dashboard/settings" },
  ];

  const handleLogout = async () => {
    setShowMoreMenu(false);
    setIsLoggingOut(true);
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
    }
  };

  if (isLoggingOut) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center md:hidden">
        <div className="flex flex-col items-center gap-4">
          <img 
            src={zikalyzeLogo} 
            alt="Loading" 
            className="loading-logo-rect logo-rotate"
          />
          <p className="text-sm text-muted-foreground">{t("sidebar.signingOut", "Signing out...")}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* More Menu Overlay - Android: ensure pointer-events auto for proper touch handling */}
      {showMoreMenu && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setShowMoreMenu(false)}
          style={{ pointerEvents: 'auto' }}
        />
      )}
      
      {/* More Menu Panel */}
      {showMoreMenu && (
        <div className="fixed bottom-16 right-2 z-50 bg-card border border-border rounded-xl shadow-lg p-2 min-w-[160px] md:hidden safe-area-inset-bottom">
          <button
            onClick={() => setShowMoreMenu(false)}
            className="absolute -top-2 -right-2 p-1 bg-card border border-border rounded-full"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
          <Link
            to="/dashboard/alerts"
            onClick={() => setShowMoreMenu(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
              location.pathname === "/dashboard/alerts"
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-secondary"
            )}
          >
            <BellRing className="h-4 w-4" />
            <span className="text-sm">{t("sidebar.alerts", "Alerts")}</span>
          </Link>
          <Link
            to="/dashboard/portfolio"
            onClick={() => setShowMoreMenu(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
              location.pathname === "/dashboard/portfolio"
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-secondary"
            )}
          >
            <Wallet className="h-4 w-4" />
            <span className="text-sm">{t("sidebar.portfolio", "Portfolio")}</span>
          </Link>
          <div className="my-1 border-t border-border" />
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm">{t("sidebar.logout", "Sign Out")}</span>
          </button>
        </div>
      )}

      {/* Bottom Navigation Bar - Hardware accelerated for smooth fixed positioning */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-sm safe-area-inset-bottom md:hidden" style={{ transform: 'translateZ(0)', willChange: 'transform' }}>
        <div className="flex items-center justify-around px-1 py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  navItemBaseClass,
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground active:bg-secondary"
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5",
                  isActive && "stroke-[2.5px]"
                )} />
                <span className={cn(
                  "text-[9px] font-medium",
                  isActive && "font-semibold"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
          {/* More Menu Button */}
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={cn(
              navItemBaseClass,
              showMoreMenu
                ? "text-primary"
                : "text-muted-foreground active:bg-secondary"
            )}
          >
            <MoreHorizontal className={cn(
              "h-5 w-5",
              showMoreMenu && "stroke-[2.5px]"
            )} />
            <span className={cn(
              "text-[9px] font-medium",
              showMoreMenu && "font-semibold"
            )}>
              {t("sidebar.more", "More")}
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default BottomNav;
