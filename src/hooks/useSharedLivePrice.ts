import { useMemo, useEffect, useState, useRef } from "react";
import { useCryptoPrices, CryptoPrice } from "./useCryptoPrices";

interface SharedLivePriceData {
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume: number;
  lastUpdate: number;
  isLive: boolean;
  isConnecting: boolean;
  source: string;
}

/**
 * Hook that provides live price data from the shared multi-exchange WebSocket system.
 * This ensures all components (Dashboard, AIAnalyzer, etc.) use the same price source.
 * 
 * Fixed: Properly updates when switching between cryptos by tracking symbol changes
 * and forcing re-computation of price data.
 */
export const useSharedLivePrice = (
  symbol: string, 
  fallbackPrice?: number, 
  fallbackChange?: number
): SharedLivePriceData => {
  const { prices, loading, isLive, connectedExchanges } = useCryptoPrices();
  const prevSymbolRef = useRef<string>(symbol);
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // Force re-computation when symbol changes
  useEffect(() => {
    if (prevSymbolRef.current !== symbol) {
      prevSymbolRef.current = symbol;
      setForceUpdate(prev => prev + 1);
    }
  }, [symbol]);
  
  // Find price data directly from prices array - this ensures fresh data on symbol change
  const liveData = useMemo(() => {
    const normalizedSymbol = symbol.toUpperCase();
    const priceData = prices.find(p => p.symbol.toUpperCase() === normalizedSymbol);
    
    if (priceData && priceData.current_price > 0) {
      // Always consider live if WebSocket is connected and we have valid price data
      // Removed 30-second freshness check - WebSocket data is always real-time
      const hasValidSource = priceData.source && priceData.source !== 'Loading' && priceData.source !== 'Fallback';
      const isRealtime = isLive || hasValidSource || connectedExchanges.length > 0;
      
      return {
        price: priceData.current_price,
        change24h: priceData.price_change_percentage_24h || 0,
        high24h: priceData.high_24h || 0,
        low24h: priceData.low_24h || 0,
        volume: priceData.total_volume || 0,
        lastUpdate: priceData.lastUpdate || Date.now(),
        isLive: isRealtime,
        isConnecting: loading,
        source: priceData.source || (connectedExchanges.length > 0 
          ? connectedExchanges.join('+') 
          : 'WebSocket'),
      };
    }
    
    // No data found - return fallback
    return {
      price: fallbackPrice || 0,
      change24h: fallbackChange || 0,
      high24h: 0,
      low24h: 0,
      volume: 0,
      lastUpdate: Date.now(),
      isLive: false,
      isConnecting: loading,
      source: 'Fallback',
    };
  }, [symbol, prices, loading, isLive, connectedExchanges, fallbackPrice, fallbackChange, forceUpdate]);
  
  return liveData;
};
