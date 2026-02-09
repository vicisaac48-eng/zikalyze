import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Sidebar from "@/components/dashboard/Sidebar";
import BottomNav from "@/components/dashboard/BottomNav";
import { PullToRefresh } from "@/components/PullToRefresh";
import { Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { useSharedLivePrice } from "@/hooks/useSharedLivePrice";
import { useIsNativeApp } from "@/hooks/useIsNativeApp";
import AIAnalyzer from "@/components/dashboard/AIAnalyzer";
import CryptoTicker from "@/components/dashboard/CryptoTicker";
import NewsEventsCalendar from "@/components/dashboard/NewsEventsCalendar";
import OnChainMetrics from "@/components/dashboard/OnChainMetrics";

const Analyzer = () => {
  const [selectedCrypto, setSelectedCrypto] = useState("BTC");
  const { getPriceBySymbol, loading, isLive, refetch } = useCryptoPrices();
  const { t } = useTranslation();
  const isNativeApp = useIsNativeApp();

  // Get live data from CryptoPrices first to avoid duplicate lookups
  const liveData = getPriceBySymbol(selectedCrypto);

  // Use shared live price for the selected crypto - unified price source with smooth interpolation
  const sharedLivePrice = useSharedLivePrice(
    selectedCrypto, 
    liveData?.current_price, 
    liveData?.price_change_percentage_24h
  );

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Use shared live price for consistent data with smooth interpolation (same as Dashboard)
  const selected = (() => {
    // Priority: Shared live price with valid price > CryptoPrice
    if (sharedLivePrice.price > 0) {
      return {
        name: liveData?.name || selectedCrypto,
        price: sharedLivePrice.price,
        change: sharedLivePrice.change24h,
        high24h: sharedLivePrice.high24h || liveData?.high_24h || 0,
        low24h: sharedLivePrice.low24h || liveData?.low_24h || 0,
        volume: sharedLivePrice.volume || liveData?.total_volume || 0,
        marketCap: liveData?.market_cap || 0,
      };
    }
    
    if (liveData) {
      return {
        name: liveData.name,
        price: liveData.current_price,
        change: liveData.price_change_percentage_24h,
        high24h: liveData.high_24h,
        low24h: liveData.low_24h,
        volume: liveData.total_volume,
        marketCap: liveData.market_cap,
      };
    }
    
    return { name: selectedCrypto, price: 0, change: 0, high24h: 0, low24h: 0, volume: 0, marketCap: 0 };
  })();

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <BottomNav />

      <main className="md:ml-16 lg:ml-64 pb-16 md:pb-0">
        {/* Header - Fixed positioning on Android for stable scrolling, sticky on web */}
        <header className={`fixed-header flex items-center justify-between border-b border-border bg-background px-3 py-2 sm:px-6 sm:py-4${isNativeApp ? ' android-fixed' : ''}`}>
          <h1 className="text-base font-bold text-foreground sm:text-xl md:text-2xl">{t("analyzer.title")}</h1>
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
          {/* Crypto Selection */}
          <CryptoTicker selected={selectedCrypto} onSelect={setSelectedCrypto} getPriceBySymbol={getPriceBySymbol} loading={loading} />

          {/* Selected Crypto Info */}
          <div className="rounded-xl border border-border bg-card p-4 sm:rounded-2xl sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/20 text-warning font-bold text-lg sm:h-12 sm:w-12 sm:text-xl">
                  {selectedCrypto.charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground sm:text-xl">{selected.name}</h2>
                  <span className="text-xs text-muted-foreground sm:text-sm">{selectedCrypto}/USD</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${loading ? "bg-warning" : isLive ? "bg-success" : "bg-muted-foreground"} animate-pulse`}
                  aria-label={loading ? "Loading" : isLive ? "Live" : "Not live"}
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4 sm:mt-6 sm:gap-4">
              <div>
                <div className="text-xs text-muted-foreground sm:text-sm">{t("analyzer.currentPrice")}</div>
                <div className="text-xl font-bold text-foreground sm:text-2xl">${selected.price.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground sm:text-sm">{t("analyzer.change24h")}</div>
                <div className={`text-xl font-bold sm:text-2xl ${selected.change >= 0 ? "text-success" : "text-destructive"}`}>
                  {selected.change >= 0 ? "+" : ""}{selected.change.toFixed(2)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground sm:text-sm">{t("analyzer.high24h")}</div>
                <div className="font-semibold text-foreground text-sm sm:text-base">
                  ${selected.high24h > 0 ? selected.high24h.toLocaleString() : "---"}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground sm:text-sm">{t("analyzer.low24h")}</div>
                <div className="font-semibold text-foreground text-sm sm:text-base">
                  ${selected.low24h > 0 ? selected.low24h.toLocaleString() : "---"}
                </div>
              </div>
            </div>
          </div>

          {/* Live On-Chain Data */}
          <OnChainMetrics
            crypto={selectedCrypto}
            price={selected.price}
            change={selected.change}
            volume={selected.volume}
            marketCap={selected.marketCap}
            coinGeckoId={liveData?.id}
          />

          {/* AI Analyzer & News Events Calendar Grid */}
          <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
            <AIAnalyzer 
              crypto={selectedCrypto} 
              price={selected.price} 
              change={selected.change}
              high24h={selected.high24h}
              low24h={selected.low24h}
              volume={selected.volume}
              marketCap={selected.marketCap}
              // Show live if either WebSocket source (useCryptoPrices or useSharedLivePrice/useTickerLiveStream) is connected
              isLive={isLive || sharedLivePrice.isLive}
            />
            <NewsEventsCalendar crypto={selectedCrypto} />
          </div>

          {/* Additional Analysis Tips */}
          <div className="rounded-xl border border-border bg-card p-4 sm:rounded-2xl sm:p-6">
            <h3 className="text-base font-semibold text-foreground mb-3 sm:text-lg sm:mb-4">{t("analyzer.analysisGuide")}</h3>
            <div className="grid gap-3 md:grid-cols-3 sm:gap-4">
              <div className="p-3 rounded-lg bg-secondary/50 sm:p-4 sm:rounded-xl">
                <h4 className="font-medium text-foreground mb-1.5 sm:mb-2">{t("analyzer.ictAnalysis")}</h4>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  {t("analyzer.ictDesc")}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50 sm:p-4 sm:rounded-xl">
                <h4 className="font-medium text-foreground mb-1.5 sm:mb-2">{t("analyzer.smartMoneyConcepts")}</h4>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  {t("analyzer.smartMoneyDesc")}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50 sm:p-4 sm:rounded-xl">
                <h4 className="font-medium text-foreground mb-1.5 sm:mb-2">{t("analyzer.vwapIndicator")}</h4>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  {t("analyzer.vwapDesc")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
    </PullToRefresh>
  );
};

export default Analyzer;
