import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { CryptoPrice } from "@/hooks/useCryptoPrices";
import { useCurrency } from "@/hooks/useCurrency";
import { useIsNativeApp } from "@/hooks/useIsNativeApp";

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
  const isNativeApp = useIsNativeApp();
  // Use shared price system (same as AI Analyzer) for better responsiveness
  // getPriceBySymbol already provides live WebSocket data from useCryptoPrices
  
  // Flash animation state for price changes (like Top100CryptoList and AI Analyzer)
  const [priceFlashes, setPriceFlashes] = useState<Map<string, "up" | "down">>(new Map());
  const prevPricesRef = useRef<Map<string, number>>(new Map());
  
  // Flash animation effect - detect price changes and trigger flash
  // This runs whenever getPriceBySymbol updates (real-time from WebSocket)
  useEffect(() => {
    // Track flash animation timeouts to clean them up properly
    const flashTimeouts = new Map<string, NodeJS.Timeout>();
    
    cryptoMeta.forEach((crypto) => {
      const priceData = getPriceBySymbol(crypto.symbol);
      const currentPrice = priceData?.current_price || 0;
      
      if (currentPrice > 0) {
        const prevPrice = prevPricesRef.current.get(crypto.symbol);
        
        // Update the previous price for next comparison
        prevPricesRef.current.set(crypto.symbol, currentPrice);
        
        // If we have a previous price and it changed, trigger flash
        if (prevPrice && prevPrice !== currentPrice) {
          const flash = currentPrice > prevPrice ? "up" : "down";
          setPriceFlashes(prev => new Map(prev).set(crypto.symbol, flash));
          
          // Clear any existing timeout for this symbol to prevent memory leaks
          const existingTimeout = flashTimeouts.get(crypto.symbol);
          if (existingTimeout) {
            clearTimeout(existingTimeout);
          }
          
          // Clear flash after animation completes (2000ms)
          const timeoutId = setTimeout(() => {
            setPriceFlashes(prev => {
              const next = new Map(prev);
              next.delete(crypto.symbol);
              return next;
            });
            flashTimeouts.delete(crypto.symbol);
          }, 2000);
          
          // Track this timeout so we can clean it up
          flashTimeouts.set(crypto.symbol, timeoutId);
        }
      }
    });
    
    return () => {
      // Clean up all pending flash animation timeouts
      flashTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
    };
  }, [getPriceBySymbol]); // React to price updates from shared WebSocket system
  
  return (
    <div 
      className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar sm:flex-wrap sm:gap-3 sm:pb-0 sm:overflow-x-visible"
      style={{
        // On Android native, enable horizontal touch scrolling specifically for CryptoTicker
        // This allows swiping through crypto cards while keeping pull-to-refresh working
        // Always set on native to ensure it overrides any parent touch-action settings
        touchAction: isNativeApp ? 'pan-x pan-y' : undefined,
        // Enable momentum scrolling on Android WebView for smooth horizontal scroll
        WebkitOverflowScrolling: isNativeApp ? 'touch' as any : undefined,
      }}
    >
      {cryptoMeta.map((crypto) => {
        // Use shared price system (same as AI Analyzer for consistent, fast updates)
        const priceData = getPriceBySymbol(crypto.symbol);
        
        const price = priceData?.current_price || 0;
        const change = priceData?.price_change_percentage_24h || 0;
        
        // Check if data is live based on lastUpdate and source
        const isLive = priceData?.lastUpdate && (Date.now() - priceData.lastUpdate < 10000) && 
                       priceData?.source && priceData.source !== 'Loading' && priceData.source !== 'Fallback';
        
        // Get flash animation state for this symbol
        const flash = priceFlashes.get(crypto.symbol);
        
        return (
          <button
            key={crypto.symbol}
            onClick={() => onSelect(crypto.symbol)}
            className={cn(
              "flex flex-col gap-1.5 rounded-xl border px-3 py-2 transition-all relative flex-shrink-0 min-w-[100px] sm:min-w-0 sm:px-4 sm:py-3",
              selected === crypto.symbol
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:border-primary/50"
            )}
          >
            <div className="flex items-center gap-2">
              <span className={cn("font-bold text-sm sm:text-base", crypto.color)}>{crypto.symbol}</span>
              {isLive && (
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" title={`Live from ${priceData?.source || 'WebSocket'}`} />
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
              // Flash animations for price changes (same as AI Analyzer and Top100CryptoList)
              flash === "up" && "animate-price-flash-up",
              flash === "down" && "animate-price-flash-down"
            )}>
              {loading ? "..." : (price > 0 ? formatPrice(price) : "---")}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default CryptoTicker;
