import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Sidebar from "@/components/dashboard/Sidebar";
import BottomNav from "@/components/dashboard/BottomNav";
import { PullToRefresh } from "@/components/PullToRefresh";
import { Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
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

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const cryptoData: Record<string, { name: string; price: number; change: number }> = {
    BTC: { name: "Bitcoin", price: getPriceBySymbol("BTC")?.current_price || 86512, change: getPriceBySymbol("BTC")?.price_change_percentage_24h || -4.87 },
    ETH: { name: "Ethereum", price: getPriceBySymbol("ETH")?.current_price || 2842, change: getPriceBySymbol("ETH")?.price_change_percentage_24h || -5.46 },
    SOL: { name: "Solana", price: getPriceBySymbol("SOL")?.current_price || 127.18, change: getPriceBySymbol("SOL")?.price_change_percentage_24h || -6.85 },
    XRP: { name: "Ripple", price: getPriceBySymbol("XRP")?.current_price || 2.05, change: getPriceBySymbol("XRP")?.price_change_percentage_24h || -6.63 },
    DOGE: { name: "Dogecoin", price: getPriceBySymbol("DOGE")?.current_price || 0.1376, change: getPriceBySymbol("DOGE")?.price_change_percentage_24h || -7.84 },
    KAS: { name: "Kaspa", price: getPriceBySymbol("KAS")?.current_price || 0.12, change: getPriceBySymbol("KAS")?.price_change_percentage_24h || 2.5 },
    ADA: { name: "Cardano", price: getPriceBySymbol("ADA")?.current_price || 0.45, change: getPriceBySymbol("ADA")?.price_change_percentage_24h || -3.2 },
    AVAX: { name: "Avalanche", price: getPriceBySymbol("AVAX")?.current_price || 28.5, change: getPriceBySymbol("AVAX")?.price_change_percentage_24h || -4.1 },
    LINK: { name: "Chainlink", price: getPriceBySymbol("LINK")?.current_price || 14.2, change: getPriceBySymbol("LINK")?.price_change_percentage_24h || -2.8 },
    DOT: { name: "Polkadot", price: getPriceBySymbol("DOT")?.current_price || 5.8, change: getPriceBySymbol("DOT")?.price_change_percentage_24h || -3.5 },
  };

  const selected = cryptoData[selectedCrypto];

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
                  ${getPriceBySymbol(selectedCrypto)?.high_24h?.toLocaleString() || "---"}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground sm:text-sm">{t("analyzer.low24h")}</div>
                <div className="font-semibold text-foreground text-sm sm:text-base">
                  ${getPriceBySymbol(selectedCrypto)?.low_24h?.toLocaleString() || "---"}
                </div>
              </div>
            </div>
          </div>

          {/* Live On-Chain Data */}
          <OnChainMetrics
            crypto={selectedCrypto}
            price={selected.price}
            change={selected.change}
          />

          {/* AI Analyzer & News Events Calendar Grid */}
          <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
            <AIAnalyzer 
              crypto={selectedCrypto} 
              price={selected.price} 
              change={selected.change}
              high24h={getPriceBySymbol(selectedCrypto)?.high_24h}
              low24h={getPriceBySymbol(selectedCrypto)?.low_24h}
              volume={getPriceBySymbol(selectedCrypto)?.total_volume}
              marketCap={getPriceBySymbol(selectedCrypto)?.market_cap}
              isLive={isLive}
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
