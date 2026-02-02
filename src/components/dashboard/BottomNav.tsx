import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  BarChart3,
  Brain,
  BellRing,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

const BottomNav = () => {
  const location = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { icon: LayoutDashboard, label: t("sidebar.dashboard", "Home"), path: "/dashboard" },
    { icon: BarChart3, label: t("sidebar.analytics", "Analytics"), path: "/dashboard/analytics" },
    { icon: Brain, label: t("sidebar.aiAnalyzer", "AI"), path: "/dashboard/analyzer" },
    { icon: BellRing, label: t("sidebar.alerts", "Alerts"), path: "/dashboard/alerts" },
    { icon: Wallet, label: t("sidebar.portfolio", "Portfolio"), path: "/dashboard/portfolio" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-sm safe-area-inset-bottom md:hidden">
      <div className="flex items-center justify-around px-1 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-[56px]",
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
                "text-[10px] font-medium",
                isActive && "font-semibold"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
