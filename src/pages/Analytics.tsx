import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Sidebar from "@/components/dashboard/Sidebar";
import BottomNav from "@/components/dashboard/BottomNav";
import { PullToRefresh } from "@/components/PullToRefresh";
import { Search, User, TrendingUp, TrendingDown, BarChart3, Activity, PieChart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { useCurrency } from "@/hooks/useCurrency";
import { useIsNativeApp } from "@/hooks/useIsNativeApp";
import AnalyticsChart from "@/components/dashboard/AnalyticsChart";
import PredictiveChart from "@/components/dashboard/PredictiveChart";
import DonutChart from "@/components/dashboard/DonutChart";
import VolumeChart from "@/components/dashboard/VolumeChart";
import { cn } from "@/lib/utils";

const Analytics = () => {
  const { prices, loading, refetch } = useCryptoPrices();
  const { formatPrice, symbol: currencySymbol } = useCurrency();
  const [timeframe, setTimeframe] = useState("24h");
  const { t } = useTranslation();
  const isNativeApp = useIsNativeApp();

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const timeframes = ["1h", "24h", "7d", "30d", "1y"];

  // Calculate market stats
  const totalMarketCap = prices.reduce((sum, p) => sum + (p.market_cap || 0), 0);
  const totalVolume = prices.reduce((sum, p) => sum + (p.total_volume || 0), 0);
  const avgChange = prices.length > 0 
    ? prices.reduce((sum, p) => sum + (p.price_change_percentage_24h || 0), 0) / prices.length 
    : 0;

  const topGainers = [...prices].sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0)).slice(0, 3);
  const topLosers = [...prices].sort((a, b) => (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0)).slice(0, 3);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <BottomNav />

      <main className="md:ml-16 lg:ml-64 pb-16 md:pb-0">
        {/* Header - Fixed positioning on Android for stable scrolling, sticky on web */}
        <header className={`fixed-header flex items-center justify-between border-b border-border bg-background px-3 py-2 sm:px-6 sm:py-4${isNativeApp ? ' android-fixed' : ''}`}>
          <h1 className="text-base font-bold text-foreground sm:text-xl md:text-2xl">{t("analytics.title")}</h1>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t("common.search")}
                className="w-64 bg-secondary border-border pl-10"
              />
            </div>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 sm:h-10 sm:w-10">
              <User className="h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" />
            </Button>
          </div>
        </header>

        <div className="main-content p-3 space-y-3 sm:p-4 sm:space-y-4 md:p-6 md:space-y-6">
          {/* Timeframe Filter */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:gap-2 custom-scrollbar">
            {timeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap sm:px-4 sm:py-2 sm:text-sm",
                  timeframe === tf
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Market Overview Stats */}
          <div className="grid gap-3 grid-cols-2 md:grid-cols-4 sm:gap-4">
            <div className="rounded-xl border border-border bg-card p-4 sm:rounded-2xl sm:p-6">
              <div className="flex items-center gap-2 mb-2 sm:gap-3 sm:mb-3">
                <div className="p-1.5 rounded-lg bg-primary/20 sm:p-2">
                  <PieChart className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
                </div>
                <span className="text-xs text-muted-foreground sm:text-sm">{t("analytics.totalMarketCap")}</span>
              </div>
              <div className="text-xl font-bold text-foreground sm:text-2xl">
                {currencySymbol}{loading ? "..." : (totalMarketCap / 1e12).toFixed(2)}T
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 sm:rounded-2xl sm:p-6">
              <div className="flex items-center gap-2 mb-2 sm:gap-3 sm:mb-3">
                <div className="p-1.5 rounded-lg bg-chart-cyan/20 sm:p-2">
                  <BarChart3 className="h-4 w-4 text-chart-cyan sm:h-5 sm:w-5" />
                </div>
                <span className="text-xs text-muted-foreground sm:text-sm">{t("analytics.volume24h")}</span>
              </div>
              <div className="text-xl font-bold text-foreground sm:text-2xl">
                {currencySymbol}{loading ? "..." : (totalVolume / 1e9).toFixed(2)}B
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 sm:rounded-2xl sm:p-6">
              <div className="flex items-center gap-2 mb-2 sm:gap-3 sm:mb-3">
                <div className={cn("p-1.5 rounded-lg sm:p-2", avgChange >= 0 ? "bg-success/20" : "bg-destructive/20")}>
                  {avgChange >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-success sm:h-5 sm:w-5" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-destructive sm:h-5 sm:w-5" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground sm:text-sm">{t("analytics.avgChange24h")}</span>
              </div>
              <div className={cn("text-xl font-bold sm:text-2xl", avgChange >= 0 ? "text-success" : "text-destructive")}>
                {avgChange >= 0 ? "+" : ""}{avgChange.toFixed(2)}%
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 sm:rounded-2xl sm:p-6">
              <div className="flex items-center gap-2 mb-2 sm:gap-3 sm:mb-3">
                <div className="p-1.5 rounded-lg bg-warning/20 sm:p-2">
                  <Activity className="h-4 w-4 text-warning sm:h-5 sm:w-5" />
                </div>
                <span className="text-xs text-muted-foreground sm:text-sm">{t("analytics.trackedAssets")}</span>
              </div>
              <div className="text-xl font-bold text-foreground sm:text-2xl">
                {loading ? "..." : prices.length}
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <AnalyticsChart />
            </div>
            <div>
              <DonutChart />
            </div>
          </div>

          <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
            <PredictiveChart />
            <VolumeChart crypto="BTC" coinGeckoId="bitcoin" />
          </div>

          {/* Top Gainers & Losers */}
          <div className="grid gap-4 md:gap-6 md:grid-cols-2">
            {/* Top Gainers */}
            <div className="rounded-xl border border-border bg-card p-4 sm:rounded-2xl sm:p-6">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <TrendingUp className="h-4 w-4 text-success sm:h-5 sm:w-5" />
                <h3 className="text-base font-semibold text-foreground sm:text-lg">{t("analytics.topGainers")}</h3>
              </div>
              <div className="space-y-2 sm:space-y-3">
                {topGainers.map((coin, index) => (
                  <div key={coin.id} className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/50 sm:p-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-xs font-medium text-muted-foreground sm:text-sm">#{index + 1}</span>
                      <div>
                        <div className="text-sm font-semibold text-foreground sm:text-base">{coin.symbol.toUpperCase()}</div>
                        <div className="text-[10px] text-muted-foreground sm:text-xs">{coin.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-foreground sm:text-base">{formatPrice(coin.current_price || 0)}</div>
                      <div className="text-xs text-success sm:text-sm">+{coin.price_change_percentage_24h?.toFixed(2)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Losers */}
            <div className="rounded-xl border border-border bg-card p-4 sm:rounded-2xl sm:p-6">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <TrendingDown className="h-4 w-4 text-destructive sm:h-5 sm:w-5" />
                <h3 className="text-base font-semibold text-foreground sm:text-lg">{t("analytics.topLosers")}</h3>
              </div>
              <div className="space-y-2 sm:space-y-3">
                {topLosers.map((coin, index) => (
                  <div key={coin.id} className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/50 sm:p-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-xs font-medium text-muted-foreground sm:text-sm">#{index + 1}</span>
                      <div>
                        <div className="text-sm font-semibold text-foreground sm:text-base">{coin.symbol.toUpperCase()}</div>
                        <div className="text-[10px] text-muted-foreground sm:text-xs">{coin.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-foreground sm:text-base">{formatPrice(coin.current_price || 0)}</div>
                      <div className="text-xs text-destructive sm:text-sm">{coin.price_change_percentage_24h?.toFixed(2)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
    </PullToRefresh>
  );
};

export default Analytics;
