import { cn } from "@/lib/utils";
import { CryptoPrice } from "@/hooks/useCryptoPrices";
import { useCurrency } from "@/hooks/useCurrency";

// Fallback prices for immediate display when live data is unavailable
const FALLBACK_PRICES: Record<string, { price: number; change: number }> = {
  BTC: { price: 83000, change: 0.5 },
  ETH: { price: 2700, change: -1.2 },
  SOL: { price: 117, change: -0.8 },
  XRP: { price: 1.75, change: -0.5 },
  DOGE: { price: 0.18, change: 1.2 },
  KAS: { price: 0.085, change: 2.5 },
  ADA: { price: 0.65, change: -0.3 },
  AVAX: { price: 25, change: 0.8 },
  LINK: { price: 15, change: -0.6 },
  DOT: { price: 5.5, change: 0.2 },
};

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
  
  return (
    <div className="flex flex-wrap gap-3">
      {cryptoMeta.map((crypto) => {
        const livePrice = getPriceBySymbol(crypto.symbol);
        // Use live price if available, otherwise use fallback
        const fallback = FALLBACK_PRICES[crypto.symbol];
        const price = (livePrice?.current_price && livePrice.current_price > 0) 
          ? livePrice.current_price 
          : fallback?.price || 0;
        const change = (livePrice?.current_price && livePrice.current_price > 0)
          ? livePrice.price_change_percentage_24h 
          : fallback?.change || 0;
        
        return (
          <button
            key={crypto.symbol}
            onClick={() => onSelect(crypto.symbol)}
            className={cn(
              "flex flex-col gap-1 rounded-xl border px-4 py-3 transition-all",
              selected === crypto.symbol
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:border-primary/50"
            )}
          >
            <div className="flex items-center gap-2">
              <span className={cn("font-bold", crypto.color)}>{crypto.symbol}</span>
              <span
                className={cn(
                  "text-xs",
                  change >= 0 ? "text-success" : "text-destructive"
                )}
              >
                {change >= 0 ? "↗" : "↘"} {Math.abs(change).toFixed(2)}%
              </span>
            </div>
            <span className="text-lg font-semibold text-foreground">
              {loading ? "..." : formatPrice(price)}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default CryptoTicker;
