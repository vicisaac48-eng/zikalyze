import { useState, useEffect, useRef, useMemo, memo } from "react";
import { useTranslation } from "react-i18next";
import { CryptoPrice } from "@/hooks/useCryptoPrices";
import { usePriceAlerts } from "@/hooks/usePriceAlerts";
import { useCurrency } from "@/hooks/useCurrency";
import { TrendingUp, TrendingDown, Bell, X, BellRing, Search, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Top100CryptoListProps {
  onSelect: (symbol: string) => void;
  selected: string;
  prices?: CryptoPrice[];
  loading?: boolean;
}

// Track price changes for flash animations
type PriceFlash = "up" | "down" | null;

// Memoized PriceCell component - only re-renders when price or flash changes
const PriceCell = memo(({ 
  price, 
  flash, 
  formatPrice 
}: { 
  price: number; 
  flash: PriceFlash; 
  formatPrice: (p: number) => string;
}) => {
  return (
    <span
      className={`font-medium text-xs transition-all duration-150 inline-block sm:text-sm ${
        flash === "up"
          ? "animate-price-flash-up"
          : flash === "down"
            ? "animate-price-flash-down"
            : "text-foreground"
      }`}
    >
      {formatPrice(price)}
    </span>
  );
}, (prevProps, nextProps) => {
  // Only re-render if price or flash changed
  return prevProps.price === nextProps.price && 
         prevProps.flash === nextProps.flash;
});

PriceCell.displayName = "PriceCell";

// Memoized CryptoRow component - only re-renders when this crypto's data changes
const CryptoRow = memo(({ 
  crypto, 
  isSelected, 
  hasAlert, 
  flash,
  onSelect,
  onOpenAlert,
  formatPrice,
  currencySymbol
}: {
  crypto: CryptoPrice;
  isSelected: boolean;
  hasAlert: boolean;
  flash: PriceFlash;
  onSelect: (symbol: string) => void;
  onOpenAlert: (crypto: CryptoPrice, e: React.MouseEvent) => void;
  formatPrice: (p: number) => string;
  currencySymbol: string;
}) => {
  const isPositive = crypto.price_change_percentage_24h >= 0;
  
  return (
    <tr
      onClick={() => onSelect(crypto.symbol.toUpperCase())}
      className={`border-b border-border/50 cursor-pointer transition-colors hover:bg-secondary/50 ${
        isSelected ? "bg-primary/10" : ""
      }`}
    >
      <td className="py-2 pr-2 sm:py-3 sm:pr-4 lg:pr-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <img 
            src={crypto.image} 
            alt={crypto.name}
            className="w-7 h-7 rounded-full shrink-0 sm:w-10 sm:h-10"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="min-w-0">
            <div className="font-medium text-foreground text-xs truncate max-w-[140px] sm:text-sm sm:max-w-none lg:max-w-[220px]">{crypto.name}</div>
            <div className="text-xs text-muted-foreground font-semibold">{crypto.symbol.toUpperCase()}</div>
          </div>
        </div>
      </td>
      <td className="py-2 px-2 text-right sm:py-3 sm:px-3 lg:px-6 xl:px-8">
        <PriceCell 
          price={crypto.current_price}
          flash={flash}
          formatPrice={formatPrice}
        />
      </td>
      <td className="py-2 px-2 text-right sm:py-3 sm:px-3 lg:px-6 xl:px-8">
        <div className={`flex items-center justify-end gap-0.5 text-xs sm:gap-1 sm:text-sm ${isPositive ? "text-success" : "text-destructive"}`}>
          {isPositive ? <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <TrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
          {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
        </div>
      </td>
      <td className="py-2 px-2 text-right text-xs text-muted-foreground hidden sm:table-cell sm:py-3 sm:px-3 sm:text-sm lg:px-6 xl:px-8">
        {currencySymbol}{crypto.market_cap ? (crypto.market_cap / 1e9).toFixed(2) + "B" : "---"}
      </td>
      <td className="py-2 px-2 text-right text-xs text-muted-foreground hidden md:table-cell sm:py-3 sm:px-3 sm:text-sm lg:px-6 xl:px-8">
        {crypto.circulating_supply 
          ? (crypto.circulating_supply >= 1e9 
            ? (crypto.circulating_supply / 1e9).toFixed(2) + "B" 
            : crypto.circulating_supply >= 1e6 
              ? (crypto.circulating_supply / 1e6).toFixed(2) + "M"
              : crypto.circulating_supply.toLocaleString())
          : "---"} {crypto.symbol.toUpperCase()}
      </td>
      <td className="py-2 px-2 text-right text-xs text-muted-foreground hidden lg:table-cell sm:py-3 sm:px-3 sm:text-sm lg:px-6 xl:px-8">
        {crypto.high_24h ? formatPrice(crypto.high_24h) : "---"}
      </td>
      <td className="py-2 px-2 text-right text-xs text-muted-foreground hidden lg:table-cell sm:py-3 sm:px-3 sm:text-sm lg:px-6 xl:px-8">
        {crypto.low_24h ? formatPrice(crypto.low_24h) : "---"}
      </td>
      <td className="py-2 px-2 text-right text-xs text-muted-foreground hidden xl:table-cell sm:py-3 sm:px-3 sm:text-sm lg:px-6 xl:px-8">
        {(() => {
          const v = crypto.total_volume;
          if (!v) return "---";
          if (v >= 1e9) return `${currencySymbol}${(v / 1e9).toFixed(2)}B`;
          if (v >= 1e6) return `${currencySymbol}${(v / 1e6).toFixed(1)}M`;
          if (v >= 1e3) return `${currencySymbol}${(v / 1e3).toFixed(1)}K`;
          return `${currencySymbol}${v.toFixed(0)}`;
        })()}
      </td>
      <td className="py-2 pl-2 text-center sm:py-3 sm:pl-3 lg:pl-6">
        <Button
          variant="ghost"
          size="icon"
          className={`h-6 w-6 sm:h-8 sm:w-8 ${hasAlert ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
          onClick={(e) => onOpenAlert(crypto, e)}
        >
          {hasAlert ? <BellRing className="h-3 w-3 sm:h-4 sm:w-4" /> : <Bell className="h-3 w-3 sm:h-4 sm:w-4" />}
        </Button>
      </td>
    </tr>
  );
}, (prevProps, nextProps) => {
  // Only re-render if this specific crypto's relevant data changed
  return (
    prevProps.crypto.id === nextProps.crypto.id &&
    prevProps.crypto.current_price === nextProps.crypto.current_price &&
    prevProps.crypto.price_change_percentage_24h === nextProps.crypto.price_change_percentage_24h &&
    prevProps.crypto.market_cap === nextProps.crypto.market_cap &&
    prevProps.crypto.total_volume === nextProps.crypto.total_volume &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.hasAlert === nextProps.hasAlert &&
    prevProps.flash === nextProps.flash
  );
});

CryptoRow.displayName = "CryptoRow";

const Top100CryptoList = ({ onSelect, selected, prices: propPrices, loading: propLoading }: Top100CryptoListProps) => {
  // Use prices from props (required) - removes duplicate WebSocket connections
  const prices = propPrices ?? [];
  const pricesLoading = propLoading ?? false;
  const { alerts, loading: alertsLoading, createAlert, removeAlert, checkAlerts } = usePriceAlerts();
  const { formatPrice, symbol: currencySymbol } = useCurrency();
  const { t } = useTranslation();
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [selectedCryptoForAlert, setSelectedCryptoForAlert] = useState<CryptoPrice | null>(null);
  const [targetPrice, setTargetPrice] = useState("");
  const [alertCondition, setAlertCondition] = useState<"above" | "below">("above");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Track previous prices for flash animation
  const prevPricesRef = useRef<Map<string, number>>(new Map());
  const [priceFlashes, setPriceFlashes] = useState<Map<string, PriceFlash>>(new Map());
  const throttleTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const flashTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // UI Update throttling: max 1 update every 500ms
  const RENDER_THROTTLE_MS = 500;

  // Filter prices based on search query
  const filteredPrices = useMemo(() => {
    if (!searchQuery.trim()) return prices;
    const query = searchQuery.toLowerCase().trim();
    return prices.filter(
      (crypto) =>
        crypto.name.toLowerCase().includes(query) ||
        crypto.symbol.toLowerCase().includes(query)
    );
  }, [prices, searchQuery]);

  // Detect price changes and trigger flash animations with UI throttling
  useEffect(() => {
    if (prices.length === 0) return;

    const newFlashes = new Map<string, PriceFlash>();
    
    prices.forEach((crypto) => {
      const prevPrice = prevPricesRef.current.get(crypto.symbol);
      if (prevPrice !== undefined && prevPrice !== crypto.current_price) {
        // Check if this symbol is currently throttled
        const existingTimeout = throttleTimeoutRef.current.get(crypto.symbol);
        if (existingTimeout) {
          // Still throttled - skip UI update but store price
          prevPricesRef.current.set(crypto.symbol, crypto.current_price);
          return;
        }
        
        // Determine flash direction
        if (crypto.current_price > prevPrice) {
          newFlashes.set(crypto.symbol, "up");
        } else if (crypto.current_price < prevPrice) {
          newFlashes.set(crypto.symbol, "down");
        }
        
        // Set throttle timeout - prevents UI updates for this symbol for RENDER_THROTTLE_MS
        const throttleId = setTimeout(() => {
          throttleTimeoutRef.current.delete(crypto.symbol);
        }, RENDER_THROTTLE_MS);
        
        throttleTimeoutRef.current.set(crypto.symbol, throttleId);
      }
      // Always update the ref with current price
      prevPricesRef.current.set(crypto.symbol, crypto.current_price);
    });

    if (newFlashes.size > 0) {
      // Log flash animations for verification (development only)
      if (import.meta.env.DEV) {
        console.log(`[Flash Animation] ${newFlashes.size} price changes (throttled to ${RENDER_THROTTLE_MS}ms):`, 
          Array.from(newFlashes.keys()).join(', '));
      }
      
      setPriceFlashes(prev => {
        const merged = new Map(prev);
        newFlashes.forEach((value, key) => merged.set(key, value));
        return merged;
      });

      // Clear flashes after animation
      if (flashTimeoutRef.current) {
        clearTimeout(flashTimeoutRef.current);
      }
      
      flashTimeoutRef.current = setTimeout(() => {
        setPriceFlashes(prev => {
          const updated = new Map(prev);
          newFlashes.forEach((_, key) => updated.delete(key));
          return updated;
        });
      }, 2000);
    }
    
    // Cleanup function to clear any pending timeouts
    return () => {
      throttleTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
      throttleTimeoutRef.current.clear();
      if (flashTimeoutRef.current) {
        clearTimeout(flashTimeoutRef.current);
      }
    };
  }, [prices, RENDER_THROTTLE_MS]);

  // Log tracked cryptos for verification (runs once when prices are loaded, development only)
  const hasLoggedRef = useRef(false);
  useEffect(() => {
    if (import.meta.env.DEV && !hasLoggedRef.current && prices.length > 0) {
      console.log(`[Flash Animation] Tracking ${prices.length} cryptocurrencies for price updates`);
      hasLoggedRef.current = true;
    }
  }, [prices]);

  // Check alerts whenever prices update - use a ref to track last check time
  const lastAlertCheckRef = useRef<number>(0);
  
  useEffect(() => {
    if (prices.length > 0 && alerts.length > 0) {
      // Throttle alert checks to every 2 seconds to prevent spam
      const now = Date.now();
      if (now - lastAlertCheckRef.current > 2000) {
        lastAlertCheckRef.current = now;
        checkAlerts(prices);
      }
    }
  }, [prices, alerts, checkAlerts]);

  const handleOpenAlertDialog = (crypto: CryptoPrice, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCryptoForAlert(crypto);
    setTargetPrice(crypto.current_price.toString());
    setAlertDialogOpen(true);
  };

  const getAlertValidation = () => {
    if (!selectedCryptoForAlert || !targetPrice) return { valid: false, error: "" };
    
    const target = parseFloat(targetPrice);
    const current = selectedCryptoForAlert.current_price;
    
    if (isNaN(target) || target <= 0) {
      return { valid: false, error: "Enter a valid price" };
    }
    
    if (alertCondition === "above" && target <= current) {
      return { valid: false, error: "Target must be above current price" };
    }
    
    if (alertCondition === "below" && target >= current) {
      return { valid: false, error: "Target must be below current price" };
    }
    
    return { valid: true, error: "" };
  };

  const handleCreateAlert = async () => {
    const validation = getAlertValidation();
    if (!validation.valid || !selectedCryptoForAlert) return;

    const success = await createAlert(
      selectedCryptoForAlert.symbol,
      selectedCryptoForAlert.name,
      parseFloat(targetPrice),
      alertCondition,
      selectedCryptoForAlert.current_price
    );

    if (success) {
      setAlertDialogOpen(false);
    }
  };

  const handleRemoveAlert = async (alertId: string) => {
    await removeAlert(alertId);
  };

  if (pricesLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-3 sm:rounded-2xl sm:p-4 md:p-6">
        <h3 className="text-base font-bold text-foreground mb-3 sm:text-lg sm:mb-4">Top 100 Cryptocurrencies</h3>
        <div className="flex items-center justify-center py-8 sm:py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary sm:h-8 sm:w-8"></div>
        </div>
      </div>
    );
  }

  // Handle empty state when data fails to load
  if (!pricesLoading && prices.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-3 sm:rounded-2xl sm:p-4 md:p-6">
        <h3 className="text-base font-bold text-foreground mb-3 sm:text-lg sm:mb-4">Top 100 Cryptocurrencies</h3>
        <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
          <AlertCircle className="w-10 h-10 text-muted-foreground mb-3 sm:w-12 sm:h-12 sm:mb-4" />
          <h4 className="text-sm font-medium text-foreground mb-1.5 sm:text-base sm:mb-2">
            Failed to Load Cryptocurrencies
          </h4>
          <p className="text-xs text-muted-foreground mb-4 max-w-sm sm:text-sm sm:mb-6">
            Unable to fetch cryptocurrency data. Please check your internet connection and try again.
          </p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Reload Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-border bg-card p-3 mb-4 sm:rounded-2xl sm:p-4 md:p-6 md:mb-0" style={{ position: 'relative', zIndex: 0 }}>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-base font-bold text-foreground sm:text-lg">Top 100 Cryptocurrencies</h3>
          <div className="flex items-center gap-2">
            {alerts.length > 0 && (
              <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full flex items-center gap-1 sm:px-2 sm:py-1">
                <BellRing className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                {alerts.length}
              </span>
            )}
            <span className="text-xs text-muted-foreground hidden sm:inline">By Market Cap</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3 sm:mb-4">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground sm:left-3 sm:w-4 sm:h-4" />
          <Input
            type="text"
            placeholder="Search by name or symbol (e.g. GoMining, BTC)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-sm bg-secondary/50 h-9 sm:pl-10 sm:h-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground sm:right-3"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}
        </div>

        {/* Active Alerts */}
        {alerts.length > 0 && (
          <div className="mb-3 p-2 bg-secondary/50 rounded-lg sm:mb-4 sm:p-3">
            <div className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1 sm:mb-2">
              <BellRing className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              Active Price Alerts
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {alerts.map((alert) => {
                const crypto = prices.find(p => p.symbol.toUpperCase() === alert.symbol);
                const currentPrice = crypto?.current_price || 0;
                const progressPercent = alert.condition === "above"
                  ? Math.min(100, (currentPrice / alert.target_price) * 100)
                  : Math.min(100, (alert.target_price / currentPrice) * 100);

                return (
                  <div
                    key={alert.id}
                    className="relative flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 text-xs overflow-hidden"
                  >
                    {/* Progress bar background */}
                    <div 
                      className="absolute left-0 top-0 bottom-0 bg-primary/10 transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                    <div className="relative flex items-center gap-2">
                      <Bell className="w-3 h-3 text-primary" />
                      <span className="font-medium">{alert.symbol}</span>
                      <span className="text-muted-foreground">
                        {alert.condition} {formatPrice(alert.target_price)}
                      </span>
                      {crypto && (
                        <span className="text-muted-foreground">
                          (now: {formatPrice(currentPrice)})
                        </span>
                      )}
                      <button
                        onClick={() => handleRemoveAlert(alert.id)}
                        className="text-muted-foreground hover:text-destructive ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        <div className="-mx-3 px-3 pb-2 sm:-mx-0 sm:px-0 sm:pb-0">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b border-border">
                <th className="pb-2 pr-2 font-medium sm:pb-3 sm:pr-4 lg:pr-6">Name</th>
                <th className="pb-2 px-2 font-medium text-right sm:pb-3 sm:px-3 lg:px-6 xl:px-8">Price</th>
                <th className="pb-2 px-2 font-medium text-right sm:pb-3 sm:px-3 lg:px-6 xl:px-8">24h %</th>
                <th className="pb-2 px-2 font-medium text-right hidden sm:table-cell sm:pb-3 sm:px-3 lg:px-6 xl:px-8">Market Cap</th>
                <th className="pb-2 px-2 font-medium text-right hidden md:table-cell sm:pb-3 sm:px-3 lg:px-6 xl:px-8">Circulating Supply</th>
                <th className="pb-2 px-2 font-medium text-right hidden lg:table-cell sm:pb-3 sm:px-3 lg:px-6 xl:px-8">24h High</th>
                <th className="pb-2 px-2 font-medium text-right hidden lg:table-cell sm:pb-3 sm:px-3 lg:px-6 xl:px-8">24h Low</th>
                <th className="pb-2 px-2 font-medium text-right hidden xl:table-cell sm:pb-3 sm:px-3 lg:px-6 xl:px-8">Volume</th>
                <th className="pb-2 pl-2 font-medium text-center sm:pb-3 sm:pl-3 lg:pl-6">Alert</th>
              </tr>
            </thead>
            <tbody>
              {filteredPrices.map((crypto) => (
                <CryptoRow
                  key={crypto.id}
                  crypto={crypto}
                  isSelected={crypto.symbol.toUpperCase() === selected}
                  hasAlert={alerts.some(a => a.symbol === crypto.symbol.toUpperCase())}
                  flash={priceFlashes.get(crypto.symbol) || null}
                  onSelect={onSelect}
                  onOpenAlert={handleOpenAlertDialog}
                  formatPrice={formatPrice}
                  currencySymbol={currencySymbol}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alert Dialog */}
      <Dialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BellRing className="w-5 h-5 text-primary" />
              Set Price Alert
            </DialogTitle>
            <DialogDescription>
              Get notified when {selectedCryptoForAlert?.name} ({selectedCryptoForAlert?.symbol.toUpperCase()}) reaches your target price.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
              {selectedCryptoForAlert?.image && (
                <img 
                  src={selectedCryptoForAlert.image} 
                  alt={selectedCryptoForAlert.name}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div>
                <div className="font-medium">{selectedCryptoForAlert?.name}</div>
                <div className="text-sm text-muted-foreground">
                  Current: {selectedCryptoForAlert ? formatPrice(selectedCryptoForAlert.current_price) : "---"}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Alert Condition</label>
              <div className="flex gap-2">
                <Button
                  variant={alertCondition === "above" ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setAlertCondition("above")}
                >
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Price Above
                </Button>
                <Button
                  variant={alertCondition === "below" ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setAlertCondition("below")}
                >
                  <TrendingDown className="w-3 h-3 mr-1" />
                  Price Below
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Target Price (USD)</label>
              <Input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="Enter target price"
                step="any"
                className={`h-12 text-lg font-semibold ${!getAlertValidation().valid && targetPrice ? "border-destructive" : ""}`}
              />
              {!getAlertValidation().valid && targetPrice && (
                <p className="text-xs text-destructive">{getAlertValidation().error}</p>
              )}
            </div>

            <Button 
              onClick={handleCreateAlert} 
              className="w-full"
              disabled={!getAlertValidation().valid}
            >
              <Bell className="w-4 h-4 mr-2" />
              Create Alert
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Top100CryptoList;
