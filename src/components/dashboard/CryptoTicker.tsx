import { useState, useEffect, useRef } from "react";
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

interface CryptoTickerProps {
  selected: string;
  onSelect: (symbol: string) => void;
  getPriceBySymbol: (symbol: string) => CryptoPrice | undefined;
  loading: boolean;
}

const CryptoTicker = ({ selected, onSelect, getPriceBySymbol, loading }: CryptoTickerProps) => {
  const { formatPrice } = useCurrency();
  // Use dedicated live stream for real-time prices
  const { getPrice, isConnected, sources } = useTickerLiveStream();
  
  // Flash animation state for price changes (like Top100CryptoList)
  const [priceFlashes, setPriceFlashes] = useState<Map<string, "up" | "down">>(new Map());
  const prevPricesRef = useRef<Map<string, number>>(new Map());
  
  // Throttle price updates to prevent too-frequent changes (1500ms minimum between updates)
  const lastUpdateTimesRef = useRef<Map<string, number>>(new Map());
  const THROTTLE_MS = 1500; // Update at most once every 1.5 seconds per symbol
  
  // Flash animation effect - detect price changes and trigger flash (throttled)
  useEffect(() => {
    cryptoMeta.forEach((crypto) => {
      const liveStreamPrice = getPrice(crypto.symbol);
      const currentPrice = liveStreamPrice?.price || 0;
      
      if (currentPrice > 0) {
        const now = Date.now();
        const lastUpdate = lastUpdateTimesRef.current.get(crypto.symbol) || 0;
        
        // Throttle: Only process if enough time has passed since last update
        if (now - lastUpdate >= THROTTLE_MS) {
          const prevPrice = prevPricesRef.current.get(crypto.symbol);
          
          if (prevPrice && prevPrice !== currentPrice) {
            // Price changed - trigger flash animation
            const flash = currentPrice > prevPrice ? "up" : "down";
            setPriceFlashes(prev => new Map(prev).set(crypto.symbol, flash));
            
            // Clear flash after animation completes (600ms)
            setTimeout(() => {
              setPriceFlashes(prev => {
                const next = new Map(prev);
                next.delete(crypto.symbol);
                return next;
              });
            }, 600);
          }
          
          // Update refs
          prevPricesRef.current.set(crypto.symbol, currentPrice);
          lastUpdateTimesRef.current.set(crypto.symbol, now);
        }
      }
    });
  }, [getPrice]); // Re-run when prices update
  
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar sm:flex-wrap sm:gap-3 sm:pb-0 sm:overflow-x-visible">
      {cryptoMeta.map((crypto) => {
        // Priority: Live stream > CryptoPrice from parent
        const liveStreamPrice = getPrice(crypto.symbol);
        const parentPrice = getPriceBySymbol(crypto.symbol);
        
        // Use live stream price if available, else parent's price
        const price = liveStreamPrice?.price && liveStreamPrice.price > 0
          ? liveStreamPrice.price
          : parentPrice?.current_price || 0;
        
        const change = liveStreamPrice?.price && liveStreamPrice.price > 0
          ? liveStreamPrice.change24h
          : parentPrice?.price_change_percentage_24h || 0;
        
        const isLive = liveStreamPrice?.lastUpdate && (Date.now() - liveStreamPrice.lastUpdate < 5000);
        
        // Get flash animation state for this symbol
        const flash = priceFlashes.get(crypto.symbol);
        
        return (
          <button
            key={crypto.symbol}
            onClick={() => onSelect(crypto.symbol)}
            className={cn(
              "flex flex-col gap-1 rounded-xl border px-3 py-2 transition-all relative flex-shrink-0 min-w-[100px] sm:min-w-0 sm:px-4 sm:py-3",
              selected === crypto.symbol
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:border-primary/50"
            )}
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className={cn("font-bold text-sm sm:text-base", crypto.color)}>{crypto.symbol}</span>
              {isLive && (
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" title={`Live from ${liveStreamPrice?.source}`} />
              )}
              <span
                className={cn(
                  "text-[10px] sm:text-xs",
                  change >= 0 ? "text-success" : "text-destructive"
                )}
              >
                {change >= 0 ? "↗" : "↘"} {Math.abs(change).toFixed(2)}%
              </span>
            </div>
            <span className={cn(
              "text-sm font-semibold transition-colors sm:text-lg",
              isLive ? "text-foreground" : "text-muted-foreground",
              // Flash animations for price changes (like Top100CryptoList)
              flash === "up" && "animate-price-flash-up",
              flash === "down" && "animate-price-flash-down"
            )}>
              {loading && !isConnected ? "..." : (price > 0 ? formatPrice(price) : "---")}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default CryptoTicker;
