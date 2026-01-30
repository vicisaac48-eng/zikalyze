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
  
  return (
    <div className="flex flex-wrap gap-3">
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
        
        return (
          <button
            key={crypto.symbol}
            onClick={() => onSelect(crypto.symbol)}
            className={cn(
              "flex flex-col gap-1 rounded-xl border px-4 py-3 transition-all relative",
              selected === crypto.symbol
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:border-primary/50"
            )}
          >
            <div className="flex items-center gap-2">
              <span className={cn("font-bold", crypto.color)}>{crypto.symbol}</span>
              {isLive && (
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" title={`Live from ${liveStreamPrice?.source}`} />
              )}
              <span
                className={cn(
                  "text-xs",
                  change >= 0 ? "text-success" : "text-destructive"
                )}
              >
                {change >= 0 ? "↗" : "↘"} {Math.abs(change).toFixed(2)}%
              </span>
            </div>
            <span className={cn(
              "text-lg font-semibold text-foreground transition-colors",
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
