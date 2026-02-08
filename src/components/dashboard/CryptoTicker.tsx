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
  // Use dedicated live stream for real-time prices with smooth interpolation
  const { getPrice, isConnected } = useTickerLiveStream();
  
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
                  "text-[10px] sm:text-xs transition-colors duration-300",
                  change >= 0 ? "text-success" : "text-destructive"
                )}
              >
                {change >= 0 ? "↗" : "↘"} {Math.abs(change).toFixed(2)}%
              </span>
            </div>
            <span className={cn(
              "text-sm font-semibold transition-colors duration-300 sm:text-lg",
              isLive ? "text-foreground" : "text-muted-foreground"
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
