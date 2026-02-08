import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { CryptoPrice } from "@/hooks/useCryptoPrices";
import { useCurrency } from "@/hooks/useCurrency";
import { useTickerLiveStream } from "@/hooks/useTickerLiveStream";

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

// Micro sparkline component for price movement visualization
const MicroSparkline = ({ prices, isPositive }: { prices: number[]; isPositive: boolean }) => {
  if (prices.length < 2) return null;
  
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const height = 16;
  const width = 32;
  
  const points = prices.map((price, i) => {
    const x = (i / (prices.length - 1)) * width;
    const y = height - ((price - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <svg width={width} height={height} className="ml-1 hidden sm:block" viewBox={`0 0 ${width} ${height}`}>
      <polyline
        points={points}
        fill="none"
        stroke={isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

interface CryptoTickerProps {
  selected: string;
  onSelect: (symbol: string) => void;
  getPriceBySymbol: (symbol: string) => CryptoPrice | undefined;
  loading: boolean;
}

// Track recent prices for sparkline
type PriceHistory = Record<string, number[]>;
const MAX_PRICE_HISTORY = 8;

const CryptoTicker = ({ selected, onSelect, getPriceBySymbol, loading }: CryptoTickerProps) => {
  const { formatPrice } = useCurrency();
  // Use dedicated live stream for real-time prices with smooth interpolation
  const { getPrice, isConnected } = useTickerLiveStream();
  
  // Track price history for sparklines using ref to avoid re-render loops
  const priceHistoryRef = useRef<PriceHistory>({});
  const lastPricesRef = useRef<Record<string, number>>({});
  const [priceFlash, setPriceFlash] = useState<Record<string, "up" | "down" | null>>({});
  // Force re-render when sparkline data changes
  const [, forceUpdate] = useState(0);
  
  // Update price history when prices change
  useEffect(() => {
    const flashes: Record<string, "up" | "down" | null> = {};
    let historyChanged = false;
    
    cryptoMeta.forEach((crypto) => {
      const liveStreamPrice = getPrice(crypto.symbol);
      const parentPrice = getPriceBySymbol(crypto.symbol);
      
      const currentPrice = liveStreamPrice?.displayPrice && liveStreamPrice.displayPrice > 0
        ? liveStreamPrice.displayPrice
        : liveStreamPrice?.price && liveStreamPrice.price > 0
          ? liveStreamPrice.price
          : parentPrice?.current_price || 0;
      
      if (currentPrice > 0) {
        const lastPrice = lastPricesRef.current[crypto.symbol];
        
        // Track price direction for flash animation
        if (lastPrice !== undefined && lastPrice !== currentPrice) {
          flashes[crypto.symbol] = currentPrice > lastPrice ? "up" : "down";
        }
        
        lastPricesRef.current[crypto.symbol] = currentPrice;
        
        // Update price history for sparkline
        if (!priceHistoryRef.current[crypto.symbol]) {
          priceHistoryRef.current[crypto.symbol] = [];
        }
        const history = priceHistoryRef.current[crypto.symbol];
        if (history.length === 0 || history[history.length - 1] !== currentPrice) {
          priceHistoryRef.current[crypto.symbol] = [...history.slice(-MAX_PRICE_HISTORY + 1), currentPrice];
          historyChanged = true;
        }
      }
    });
    
    if (Object.keys(flashes).length > 0) {
      setPriceFlash(prev => ({ ...prev, ...flashes }));
      // Clear flash after animation
      setTimeout(() => {
        setPriceFlash(prev => {
          const updated = { ...prev };
          Object.keys(flashes).forEach(k => { updated[k] = null; });
          return updated;
        });
      }, 800);
    }
    
    // Trigger re-render when sparkline data changes
    if (historyChanged) {
      forceUpdate(n => n + 1);
    }
  }, [getPrice, getPriceBySymbol]);
  
  return (
    <div className="flex gap-2 overflow-x-auto horizontal-scroll-container pb-2 custom-scrollbar sm:flex-wrap sm:gap-3 sm:pb-0 sm:overflow-x-visible">
      {cryptoMeta.map((crypto) => {
        // Priority: Live stream > CryptoPrice from parent
        const liveStreamPrice = getPrice(crypto.symbol);
        const parentPrice = getPriceBySymbol(crypto.symbol);
        
        // Use smoothly interpolated displayPrice for professional spot-like display
        // Falls back to actual price if displayPrice not yet initialized
        const price = liveStreamPrice?.displayPrice && liveStreamPrice.displayPrice > 0
          ? liveStreamPrice.displayPrice
          : liveStreamPrice?.price && liveStreamPrice.price > 0
            ? liveStreamPrice.price
            : parentPrice?.current_price || 0;
        
        // Use smoothly interpolated displayChange24h - synced with price for professional display
        const change = liveStreamPrice?.displayChange24h !== undefined
          ? liveStreamPrice.displayChange24h
          : liveStreamPrice?.change24h !== undefined
            ? liveStreamPrice.change24h
            : parentPrice?.price_change_percentage_24h || 0;
        
        const isLive = liveStreamPrice?.lastUpdate && (Date.now() - liveStreamPrice.lastUpdate < 5000);
        const flash = priceFlash[crypto.symbol];
        const history = priceHistoryRef.current[crypto.symbol] || [];
        
        return (
          <button
            key={crypto.symbol}
            onClick={() => onSelect(crypto.symbol)}
            className={cn(
              "flex flex-col gap-1 rounded-xl border px-3 py-2 transition-all relative flex-shrink-0 min-w-[100px] sm:min-w-0 sm:px-4 sm:py-3",
              selected === crypto.symbol
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:border-primary/50",
              flash === "up" && "animate-ticker-flash-up",
              flash === "down" && "animate-ticker-flash-down"
            )}
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className={cn("font-bold text-sm sm:text-base", crypto.color)}>{crypto.symbol}</span>
              {isLive && (
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" title={`Live from ${liveStreamPrice?.source}`} />
              )}
              <span
                className={cn(
                  "text-[10px] sm:text-xs transition-colors duration-300 font-medium",
                  change >= 0 ? "text-success" : "text-destructive"
                )}
              >
                {change >= 0 ? "↗" : "↘"} {Math.abs(change).toFixed(2)}%
              </span>
              <MicroSparkline prices={history} isPositive={change >= 0} />
            </div>
            <div className="flex items-center gap-1">
              <span className={cn(
                "text-sm font-semibold transition-colors duration-300 sm:text-lg",
                isLive ? "text-foreground" : "text-muted-foreground",
                flash === "up" && "text-success",
                flash === "down" && "text-destructive"
              )}>
                {loading && !isConnected ? "..." : (price > 0 ? formatPrice(price) : "---")}
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
      })}
    </div>
  );
};

export default CryptoTicker;
