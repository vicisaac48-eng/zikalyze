import { useState } from "react";
import { useTranslation } from "react-i18next";
import Sidebar from "@/components/dashboard/Sidebar";
import BottomNav from "@/components/dashboard/BottomNav";
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
  const { prices, loading } = useCryptoPrices();
  const { formatPrice, symbol: currencySymbol } = useCurrency();
  const [timeframe, setTimeframe] = useState("24h");
  const { t } = useTranslation();
  const isNativeApp = useIsNativeApp();

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
    <div className="min-h-screen bg-background">
      <Sidebar />
      <BottomNav />

      <main className="md:ml-16 lg:ml-64 pb-16 md:pb-0">
        {/* Header - Fixed positioning on Android for stable scrolling, sticky on web */}
        <header className={`fixed-header flex items-center justify-between border-b border-border bg-background/95 backdrop-blur-sm px-3 py-2 sm:px-6 sm:py-4${isNativeApp ? ' android-fixed' : ''}`}>
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

        <div className={`p-3 space-y-3 sm:p-4 sm:space-y-4 md:p-6 md:space-y-6${isNativeApp ? ' android-fixed-content' : ''}`}>
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
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <PieChart className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">{t("analytics.totalMarketCap")}</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {currencySymbol}{loading ? "..." : (totalMarketCap / 1e12).toFixed(2)}T
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-chart-cyan/20">
                  <BarChart3 className="h-5 w-5 text-chart-cyan" />
                </div>
                <span className="text-sm text-muted-foreground">{t("analytics.volume24h")}</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {currencySymbol}{loading ? "..." : (totalVolume / 1e9).toFixed(2)}B
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className={cn("p-2 rounded-lg", avgChange >= 0 ? "bg-success/20" : "bg-destructive/20")}>
                  {avgChange >= 0 ? (
                    <TrendingUp className="h-5 w-5 text-success" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-destructive" />
                  )}
                </div>
                <span className="text-sm text-muted-foreground">{t("analytics.avgChange24h")}</span>
              </div>
              <div className={cn("text-2xl font-bold", avgChange >= 0 ? "text-success" : "text-destructive")}>
                {avgChange >= 0 ? "+" : ""}{avgChange.toFixed(2)}%
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-warning/20">
                  <Activity className="h-5 w-5 text-warning" />
                </div>
                <span className="text-sm text-muted-foreground">{t("analytics.trackedAssets")}</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {loading ? "..." : prices.length}
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <AnalyticsChart />
            </div>
            <div>
              <DonutChart />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <PredictiveChart />
            <VolumeChart crypto="BTC" coinGeckoId="bitcoin" />
          </div>

          {/* Top Gainers & Losers */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Top Gainers */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-success" />
                <h3 className="text-lg font-semibold text-foreground">{t("analytics.topGainers")}</h3>
              </div>
              <div className="space-y-3">
                {topGainers.map((coin, index) => (
                  <div key={coin.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                      <div>
                        <div className="font-semibold text-foreground">{coin.symbol.toUpperCase()}</div>
                        <div className="text-xs text-muted-foreground">{coin.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-foreground">{formatPrice(coin.current_price || 0)}</div>
                      <div className="text-sm text-success">+{coin.price_change_percentage_24h?.toFixed(2)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Losers */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingDown className="h-5 w-5 text-destructive" />
                <h3 className="text-lg font-semibold text-foreground">{t("analytics.topLosers")}</h3>
              </div>
              <div className="space-y-3">
                {topLosers.map((coin, index) => (
                  <div key={coin.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                      <div>
                        <div className="font-semibold text-foreground">{coin.symbol.toUpperCase()}</div>
                        <div className="text-xs text-muted-foreground">{coin.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-foreground">{formatPrice(coin.current_price || 0)}</div>
                      <div className="text-sm text-destructive">{coin.price_change_percentage_24h?.toFixed(2)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
