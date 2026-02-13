import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Search, User, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import Sidebar from "@/components/dashboard/Sidebar";
import BottomNav from "@/components/dashboard/BottomNav";
import CryptoTicker from "@/components/dashboard/CryptoTicker";
import { PullToRefresh } from "@/components/PullToRefresh";
import { usePriceData } from "@/contexts/PriceDataContext";
import { useIsNativeApp } from "@/hooks/useIsNativeApp";
import DashboardSplash from "@/components/dashboard/DashboardSplash";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";
import { SESSION_STORAGE_KEYS, LOCAL_STORAGE_KEYS } from "@/constants/storage";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ErrorBoundary, { ChartErrorFallback, MinimalErrorFallback } from "@/components/ErrorBoundary";

// Lazy load heavy chart components to reduce initial bundle
const PriceChart = lazy(() => import("@/components/dashboard/PriceChart"));
const VolumeChart = lazy(() => import("@/components/dashboard/VolumeChart"));
const AIMetrics = lazy(() => import("@/components/dashboard/AIMetrics"));
const AIAnalyzer = lazy(() => import("@/components/dashboard/AIAnalyzer"));
const Top100CryptoList = lazy(() => import("@/components/dashboard/Top100CryptoList"));
const OnChainMetrics = lazy(() => import("@/components/dashboard/OnChainMetrics"));
const SentimentAnalysis = lazy(() => import("@/components/dashboard/SentimentAnalysis"));

// Skeleton loaders for lazy components
const ChartSkeleton = () => (
  <div className="rounded-xl border border-border bg-card p-4 sm:rounded-2xl sm:p-6">
    <Skeleton className="h-5 w-24 mb-3 sm:h-6 sm:w-32 sm:mb-4" />
    <Skeleton className="h-[200px] w-full sm:h-[300px]" />
  </div>
);

const MetricsSkeleton = () => (
  <div className="rounded-xl border border-border bg-card p-4 space-y-3 sm:rounded-2xl sm:p-6 sm:space-y-4">
    <Skeleton className="h-5 w-20 sm:h-6 sm:w-24" />
    <Skeleton className="h-16 w-full sm:h-20" />
    <Skeleton className="h-16 w-full sm:h-20" />
  </div>
);

// Loading phases enum
type LoadingPhase = 'splash' | 'skeleton' | 'revealed';

const Dashboard = () => {
  // Restore last viewed crypto from localStorage, default to BTC
  const [selectedCrypto, setSelectedCrypto] = useState(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_KEYS.LAST_CRYPTO) || "BTC";
    } catch {
      return "BTC";
    }
  });
  const [userName, setUserName] = useState<string | null>(null);
  const { prices, loading, isLive, getPriceBySymbol, refetch } = usePriceData();
  const { t } = useTranslation();
  const isNativeApp = useIsNativeApp();
  
  // 3-Phase loading state - ONLY for native mobile app
  const [loadingPhase, setLoadingPhase] = useState<LoadingPhase>(() => {
    // Only show splash on native app
    if (!isNativeApp) return 'revealed';
    
    // Check if this is the first visit to dashboard in this session
    const hasSeenSplash = sessionStorage.getItem(SESSION_STORAGE_KEYS.DASHBOARD_SPLASH_SHOWN);
    return hasSeenSplash ? 'revealed' : 'splash';
  });

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Save selected crypto to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.LAST_CRYPTO, selectedCrypto);
    } catch (error) {
      console.error("Error saving last crypto:", error);
    }
  }, [selectedCrypto]);

  useEffect(() => {
    const session = localStorage.getItem(LOCAL_STORAGE_KEYS.WALLET_SESSION);
    if (session) {
      const parsed = JSON.parse(session);
      setUserName(parsed.name || null);
    }
  }, []);

  // Phase 1: Splash → Phase 2: Skeleton after 1 second
  const handleSplashComplete = useCallback(() => {
    setLoadingPhase('skeleton');
    sessionStorage.setItem(SESSION_STORAGE_KEYS.DASHBOARD_SPLASH_SHOWN, 'true');
  }, []);

  // Phase 2: Skeleton → Phase 3: Revealed when data is loaded (only for native app)
  useEffect(() => {
    if (!isNativeApp) return; // Skip for web
    
    if (loadingPhase === 'skeleton' && !loading && prices.length > 0) {
      // Professional delay to ensure skeleton is visible and smooth transition
      const timer = setTimeout(() => {
        setLoadingPhase('revealed');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isNativeApp, loadingPhase, loading, prices]);

  // Get selected crypto from live prices
  const liveData = getPriceBySymbol(selectedCrypto);
  const selected = liveData 
    ? { 
        name: liveData.name, 
        price: liveData.current_price, 
        change: liveData.price_change_percentage_24h,
        high24h: liveData.high_24h,
        low24h: liveData.low_24h,
        volume: liveData.total_volume,
        marketCap: liveData.market_cap
      }
    : { name: selectedCrypto, price: 0, change: 0, high24h: 0, low24h: 0, volume: 0, marketCap: 0 };

  // Phase 1: Show splash screen
  if (loadingPhase === 'splash') {
    return (
      <>
        <Sidebar />
        <BottomNav />
        <DashboardSplash onComplete={handleSplashComplete} />
      </>
    );
  }

  // Phase 2: Show skeleton loader
  if (loadingPhase === 'skeleton') {
    return (
      <>
        <Sidebar />
        <BottomNav />
        <DashboardSkeleton />
      </>
    );
  }

  // Phase 3: Revealed content with staggered animations (only for native app)
  const isRevealing = isNativeApp && loadingPhase === 'revealed';

  return (
    <>
      <Sidebar />
      <BottomNav />
      
      <main className="md:ml-16 lg:ml-64 pb-bottom-nav md:pb-0">
        {/* Header - Fixed positioning on Android for stable scrolling like WhatsApp, sticky on web */}
        <header className={`fixed-header flex items-center justify-between border-b border-border bg-background px-3 py-2 sm:px-6 sm:py-4${isNativeApp ? ' android-fixed' : ''}${isRevealing ? ' card-reveal' : ''}`} style={isRevealing ? { animationDelay: '0s' } : undefined}>
          <h1 className="text-base font-bold text-foreground sm:text-xl md:text-2xl">{t("dashboard.title")}</h1>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t("dashboard.searchPlaceholder")}
                className="w-48 lg:w-64 bg-secondary border-border pl-10"
              />
            </div>
            <div className="flex items-center gap-1.5 sm:gap-3">
              {userName && (
                <span className="text-xs font-medium text-foreground hidden sm:block sm:text-sm">
                  {userName}
                </span>
              )}
              {/* Settings link on mobile */}
              <Link to="/dashboard/settings" className="md:hidden">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" className="rounded-full bg-secondary h-8 w-8 sm:h-10 sm:w-10">
                <User className="h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" />
              </Button>
            </div>
          </div>
        </header>

        <PullToRefresh onRefresh={handleRefresh}>
          <div className="min-h-screen min-h-[100dvh] bg-background texture-noise custom-scrollbar">
            <div className="main-content px-3 pb-4 sm:px-4 sm:pb-6 md:px-6 space-y-3 sm:space-y-4 md:space-y-6">
          {/* Crypto Ticker */}
          <div className={isRevealing ? 'card-reveal' : ''} style={isRevealing ? { animationDelay: '0.05s' } : undefined}>
            <CryptoTicker selected={selectedCrypto} onSelect={setSelectedCrypto} getPriceBySymbol={getPriceBySymbol} loading={loading} />
          </div>

          {/* Time Filter */}
          <div className={`flex gap-1.5 overflow-x-auto pb-1 sm:gap-2 custom-scrollbar${isRevealing ? ' card-reveal' : ''}`} style={isRevealing ? { animationDelay: '0.15s' } : undefined}>
            {["1s", "5s", "1m", "5m", "15m", "1h"].map((time) => (
              <button
                key={time}
                className={`rounded-lg px-2.5 py-1 text-xs whitespace-nowrap transition-all sm:px-3 sm:text-sm ${
                  time === "1m"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                }`}
              >
                {time}
              </button>
            ))}
          </div>

          {/* Live On-Chain Data */}
          <div className={isRevealing ? 'card-reveal' : ''} style={isRevealing ? { animationDelay: '0.25s' } : undefined}>
            <ErrorBoundary componentName="On-Chain Metrics" fallback={<MinimalErrorFallback />}>
              <Suspense fallback={<MetricsSkeleton />}>
                <OnChainMetrics
                  crypto={selectedCrypto}
                  price={selected.price}
                  change={selected.change}
                  volume={liveData?.total_volume}
                  marketCap={liveData?.market_cap}
                  coinGeckoId={liveData?.id}
                />
              </Suspense>
            </ErrorBoundary>
          </div>

          {/* AI Analyzer & Sentiment Analysis Grid */}
          <div className={`grid gap-4 md:gap-6 lg:grid-cols-2${isRevealing ? ' card-reveal' : ''}`} style={isRevealing ? { animationDelay: '0.35s' } : undefined}>
            <ErrorBoundary componentName="AI Analyzer" fallback={<ChartErrorFallback />}>
              <Suspense fallback={<ChartSkeleton />}>
                <AIAnalyzer 
                  crypto={selectedCrypto} 
                  price={selected.price} 
                  change={selected.change}
                  high24h={liveData?.high_24h}
                  low24h={liveData?.low_24h}
                  volume={liveData?.total_volume}
                  marketCap={liveData?.market_cap}
                  isLive={isLive}
                />
              </Suspense>
            </ErrorBoundary>
            <ErrorBoundary componentName="Sentiment Analysis" fallback={<ChartErrorFallback />}>
              <Suspense fallback={<ChartSkeleton />}>
                <SentimentAnalysis
                  crypto={selectedCrypto}
                  price={selected.price}
                  change={selected.change}
                />
              </Suspense>
            </ErrorBoundary>
          </div>

          {/* Charts Grid */}
          <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              <ErrorBoundary componentName="Price Chart" fallback={<ChartErrorFallback />}>
                <Suspense fallback={<ChartSkeleton />}>
                  <PriceChart crypto={selectedCrypto} coinGeckoId={liveData?.id} change24h={selected.change} />
                </Suspense>
              </ErrorBoundary>
              <ErrorBoundary componentName="Volume Chart" fallback={<ChartErrorFallback />}>
                <Suspense fallback={<ChartSkeleton />}>
                  <VolumeChart crypto={selectedCrypto} coinGeckoId={liveData?.id} />
                </Suspense>
              </ErrorBoundary>
            </div>
            <div className="space-y-4 md:space-y-6">
              <ErrorBoundary componentName="AI Metrics" fallback={<MinimalErrorFallback />}>
                <Suspense fallback={<MetricsSkeleton />}>
                  <AIMetrics 
                    price={selected.price}
                    change={selected.change}
                    high24h={liveData?.high_24h}
                    low24h={liveData?.low_24h}
                    volume={liveData?.total_volume}
                    marketCap={liveData?.market_cap}
                  />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>

          {/* Top 100 Crypto List */}
          <div className={isRevealing ? 'card-reveal' : ''} style={isRevealing ? { animationDelay: '0.55s' } : undefined}>
            <ErrorBoundary componentName="Crypto List" fallback={<ChartErrorFallback />}>
              <Suspense fallback={<ChartSkeleton />}>
                <Top100CryptoList selected={selectedCrypto} onSelect={setSelectedCrypto} prices={prices} loading={loading} />
              </Suspense>
            </ErrorBoundary>
          </div>
            </div>
          </div>
        </PullToRefresh>
      </main>
    </>
  );
};

export default Dashboard;
