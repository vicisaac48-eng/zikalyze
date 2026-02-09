import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { CryptoPrice, useCryptoPrices } from "@/hooks/useCryptoPrices";
import { useCurrency } from "@/hooks/useCurrency";

const cryptoMeta = [
  { symbol: "BTC", name: "Bitcoin", color: "text-warning" },
  { symbol: "ETH", name: "Ethereum", color: "text-muted-foreground" },
  { symbol: "SOL", name: "Solana", color: "text-chart-cyan" },
  { symbol: "XRP", name: "Ripple", color: "text-muted-foreground" },
  { symbol: "DOGE", name: "Dogecoin", color: "text-warning" },
  { symbol: "KAS", name: "Kaspa", color: "text-chart-cyan" },
  { symbol: "ADA", name: "Cardano", color: "text-primary" },
  { symbol: "AVAX", name: "Avalanche", color: "text-destructive" },
  { symbol: "LINK", name: "Chainlink", color: "text-primary" },
  { symbol: "DOT", name: "Polkadot", color: "text-chart-pink" },
];

interface CryptoTickerProps {
  selected: string;
  onSelect: (symbol: string) => void;
  getPriceBySymbol: (symbol: string) => CryptoPrice | undefined;
  loading: boolean;
  isLive: boolean;
}

// Individual ticker card component - uses useCryptoPrices directly like Top100CryptoList
const TickerCard = ({ 
  crypto, 
  isSelected, 
  onSelect, 
  parentPrice, 
  formatPrice,
  loading,
  isLive: parentIsLive
}: { 
  crypto: { symbol: string; name: string; color: string };
  isSelected: boolean;
  onSelect: () => void;
  parentPrice?: CryptoPrice;
  formatPrice: (price: number) => string;
  loading: boolean;
  isLive: boolean;
}) => {
  // Use parentPrice directly from useCryptoPrices - same pattern as Top100CryptoList
  const price = parentPrice?.current_price || 0;
  const change = parentPrice?.price_change_percentage_24h || 0;
  const isLive = parentIsLive;
  
  // Flash animation state
  const [flash, setFlash] = useState<"up" | "down" | null>(null);
  const lastPriceRef = useRef<number>(0);
  const lastFlashTimeRef = useRef<number>(0);
  const flashTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const MIN_FLASH_INTERVAL_MS = 1500;
  const MIN_PRICE_CHANGE_PERCENT = 0.02;
  
  // Track price changes and trigger flash animation
  useEffect(() => {
    if (price > 0) {
      const now = Date.now();
      const lastPrice = lastPriceRef.current;
      const lastFlashTime = lastFlashTimeRef.current;
      
      // Only flash if: price changed significantly AND enough time has passed
      if (lastPrice > 0 && lastPrice !== price) {
        const changePercent = Math.abs((price - lastPrice) / lastPrice) * 100;
        
        if (changePercent >= MIN_PRICE_CHANGE_PERCENT && (now - lastFlashTime) >= MIN_FLASH_INTERVAL_MS) {
          const direction = price > lastPrice ? "up" : "down";
          setFlash(direction);
          lastFlashTimeRef.current = now;
          
          // Clear any existing timeout before setting new one
          if (flashTimeoutRef.current) {
            clearTimeout(flashTimeoutRef.current);
          }
          // Clear flash after animation (use same interval for consistency)
          flashTimeoutRef.current = setTimeout(() => setFlash(null), MIN_FLASH_INTERVAL_MS);
        }
      }
      
      lastPriceRef.current = price;
    }
  }, [price, crypto.symbol]);
  
  // Cleanup timeout on unmount only
  useEffect(() => {
    return () => {
      if (flashTimeoutRef.current) {
        clearTimeout(flashTimeoutRef.current);
      }
    };
  }, []);
  
  return (
    <button
      onClick={onSelect}
      className={cn(
        // Use transition-colors instead of transition-all to prevent card body movement
        "flex flex-col gap-1 rounded-xl border px-2.5 py-2 transition-colors duration-200 relative flex-shrink-0 min-w-[90px] sm:min-w-0 sm:px-4 sm:py-3",
        isSelected
          ? "border-primary bg-primary/10"
          : "border-border bg-card hover:border-primary/50",
        flash === "up" && "animate-ticker-flash-up",
        flash === "down" && "animate-ticker-flash-down"
      )}
    >
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span className={cn("font-bold text-sm sm:text-base", crypto.color)}>{crypto.symbol}</span>
        {isLive && (
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" title="Live WebSocket" />
        )}
        <span
          className={cn(
            "text-[10px] sm:text-xs transition-colors duration-300 font-medium",
            change >= 0 ? "text-success" : "text-destructive"
          )}
        >
          {change >= 0 ? "↗" : "↘"} {Math.abs(change).toFixed(2)}%
        </span>
      </div>
      <div className="flex items-center gap-1">
        <span className={cn(
          "text-sm font-semibold transition-colors duration-300 sm:text-lg",
          isLive ? "text-foreground" : "text-muted-foreground",
          flash === "up" && "text-success",
          flash === "down" && "text-destructive"
        )}>
          {loading && !isLive ? "..." : (price > 0 ? formatPrice(price) : "---")}
        </span>
        {/* Movement indicator badge */}
        {change !== 0 && (
          <span className={cn(
            "text-[10px] px-1 py-0.5 rounded-sm hidden sm:inline-block",
            change >= 0 ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
          )}>
            {change >= 0 ? "+" : ""}{change.toFixed(1)}%
          </span>
        )}
      </div>
    </button>
  );
};

const CryptoTicker = ({ selected, onSelect, getPriceBySymbol, loading, isLive }: CryptoTickerProps) => {
  const { formatPrice } = useCurrency();
  
  return (
    <div className="flex gap-2 overflow-x-auto horizontal-scroll-container pb-2 custom-scrollbar sm:flex-wrap sm:gap-3 sm:pb-0 sm:overflow-x-visible">
      {cryptoMeta.map((crypto) => (
        <TickerCard
          key={crypto.symbol}
          crypto={crypto}
          isSelected={selected === crypto.symbol}
          onSelect={() => onSelect(crypto.symbol)}
          parentPrice={getPriceBySymbol(crypto.symbol)}
          formatPrice={formatPrice}
          loading={loading}
          isLive={isLive}
        />
      ))}
    </div>
  );
};

export default CryptoTicker;
