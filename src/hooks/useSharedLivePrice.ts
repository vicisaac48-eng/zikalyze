import { useMemo, useEffect, useState, useRef, useCallback } from "react";
import { useCryptoPrices, CryptoPrice } from "./useCryptoPrices";
import { useTickerLiveStream } from "./useTickerLiveStream";

// ═══════════════════════════════════════════════════════════════════════════
// LIVE RESPONSIVE ANIMATION CONFIGURATION (matching useTickerLiveStream)
// Fast responsive updates: feels like real-time crypto exchange
// ═══════════════════════════════════════════════════════════════════════════
const UPDATE_THROTTLE_MS = 800;            // Fast responsive updates (800ms)
const INTERPOLATION_STEPS = 10;            // Quick smooth transitions
const INTERPOLATION_INTERVAL_MS = 40;      // Fast frames (10 steps * 40ms = 400ms total animation)
const PRICE_CHANGE_THRESHOLD = 0.0001;     // 0.01% - minimum price change to trigger interpolation

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
 * PREMIUM SMOOTH ANIMATION: Uses interpolated values from useTickerLiveStream for
 * buttery-smooth price transitions matching the CryptoTicker cards.
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
  // Use ticker live stream for smooth interpolated values
  const { getPrice: getTickerPrice } = useTickerLiveStream();
  
  const prevSymbolRef = useRef<string>(symbol);
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // Smooth interpolation state
  const [displayPrice, setDisplayPrice] = useState<number>(0);
  const [displayChange, setDisplayChange] = useState<number>(0);
  const interpolationRef = useRef<{
    startPrice: number;
    endPrice: number;
    startChange: number;
    endChange: number;
    step: number;
    intervalId: ReturnType<typeof setInterval> | null;
    lastUpdateTime: number;
  }>({
    startPrice: 0,
    endPrice: 0,
    startChange: 0,
    endChange: 0,
    step: 0,
    intervalId: null,
    lastUpdateTime: 0,
  });
  
  // Helper to reset interpolation state
  const resetInterpolation = useCallback(() => {
    if (interpolationRef.current.intervalId) {
      clearInterval(interpolationRef.current.intervalId);
      interpolationRef.current.intervalId = null;
    }
    interpolationRef.current = {
      startPrice: 0,
      endPrice: 0,
      startChange: 0,
      endChange: 0,
      step: 0,
      intervalId: null,
      lastUpdateTime: 0,
    };
  }, []);
  
  // Force re-computation when symbol changes
  useEffect(() => {
    if (prevSymbolRef.current !== symbol) {
      prevSymbolRef.current = symbol;
      // Reset interpolation on symbol change
      resetInterpolation();
      setForceUpdate(prev => prev + 1);
    }
  }, [symbol, resetInterpolation]);
  
  // Cleanup interpolation on unmount
  useEffect(() => {
    return () => {
      resetInterpolation();
    };
  }, [resetInterpolation]);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PREMIUM SMOOTH PRICE INTERPOLATION
  // Ease-out cubic animation: fast start, gentle slowdown at the end
  // Total animation: 20 steps * 30ms = 600ms of buttery-smooth transition
  // ═══════════════════════════════════════════════════════════════════════════
  const startInterpolation = useCallback((fromPrice: number, toPrice: number, fromChange: number, toChange: number) => {
    // Clear any existing interpolation
    if (interpolationRef.current.intervalId) {
      clearInterval(interpolationRef.current.intervalId);
    }
    
    // Initialize interpolation state
    interpolationRef.current = {
      ...interpolationRef.current,
      startPrice: fromPrice,
      endPrice: toPrice,
      startChange: fromChange,
      endChange: toChange,
      step: 0,
      lastUpdateTime: Date.now(),
    };
    
    // Run interpolation steps
    const intervalId = setInterval(() => {
      const interp = interpolationRef.current;
      if (interp.step >= INTERPOLATION_STEPS) {
        if (interp.intervalId) {
          clearInterval(interp.intervalId);
          interp.intervalId = null;
        }
        // Set final values
        setDisplayPrice(interp.endPrice);
        setDisplayChange(interp.endChange);
        return;
      }
      
      interp.step++;
      const progress = interp.step / INTERPOLATION_STEPS;
      
      // Ease-out cubic for natural deceleration (like real market displays)
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      
      // Calculate interpolated values
      const interpolatedPrice = interp.startPrice + (interp.endPrice - interp.startPrice) * easedProgress;
      const interpolatedChange = interp.startChange + (interp.endChange - interp.startChange) * easedProgress;
      
      setDisplayPrice(interpolatedPrice);
      setDisplayChange(interpolatedChange);
    }, INTERPOLATION_INTERVAL_MS);
    
    interpolationRef.current.intervalId = intervalId;
  }, []);
  
  // Find price data and apply smooth interpolation - also track if ticker stream is used
  const { liveData, hasTickerStreamInterpolation } = useMemo(() => {
    const normalizedSymbol = symbol.toUpperCase();
    
    // First try to get smooth interpolated price from ticker stream
    const tickerPrice = getTickerPrice(normalizedSymbol);
    
    // Fall back to prices array if ticker doesn't have this symbol
    const priceData = prices.find(p => p.symbol.toUpperCase() === normalizedSymbol);
    
    // Prefer ticker stream's smoothly interpolated displayPrice
    if (tickerPrice && tickerPrice.displayPrice > 0) {
      return {
        liveData: {
          price: tickerPrice.displayPrice,
          change24h: tickerPrice.displayChange24h ?? tickerPrice.change24h ?? 0,
          high24h: tickerPrice.high24h || priceData?.high_24h || 0,
          low24h: tickerPrice.low24h || priceData?.low_24h || 0,
          volume: tickerPrice.volume || priceData?.total_volume || 0,
          lastUpdate: tickerPrice.lastUpdate || Date.now(),
          isLive: true,
          isConnecting: loading,
          source: tickerPrice.source || 'LiveStream',
        },
        hasTickerStreamInterpolation: true,
      };
    }
    
    if (priceData && priceData.current_price > 0) {
      // Always consider live if WebSocket is connected and we have valid price data
      // Removed 30-second freshness check - WebSocket data is always real-time
      const hasValidSource = priceData.source && priceData.source !== 'Loading' && priceData.source !== 'Fallback';
      const isRealtime = isLive || hasValidSource || connectedExchanges.length > 0;
      
      return {
        liveData: {
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
        },
        hasTickerStreamInterpolation: false,
      };
    }
    
    // No data found - return fallback
    return {
      liveData: {
        price: fallbackPrice || 0,
        change24h: fallbackChange || 0,
        high24h: 0,
        low24h: 0,
        volume: 0,
        lastUpdate: Date.now(),
        isLive: false,
        isConnecting: loading,
        source: 'Fallback',
      },
      hasTickerStreamInterpolation: false,
    };
    // Note: forceUpdate is intentionally included to trigger re-renders when WebSocket receives updates
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, prices, loading, isLive, connectedExchanges, fallbackPrice, fallbackChange, forceUpdate, getTickerPrice]);
  
  // Apply smooth interpolation when price changes (for symbols not in ticker stream)
  useEffect(() => {
    // Skip if the ticker stream already provides smooth interpolation
    if (hasTickerStreamInterpolation) {
      return; // Ticker stream handles interpolation
    }
    
    const now = Date.now();
    const lastUpdate = interpolationRef.current.lastUpdateTime || 0;
    
    // Throttle updates - only animate if enough time has passed
    if (now - lastUpdate < UPDATE_THROTTLE_MS) {
      return;
    }
    
    // Initialize display price if not set
    if (displayPrice === 0 && liveData.price > 0) {
      setDisplayPrice(liveData.price);
      setDisplayChange(liveData.change24h);
      interpolationRef.current.lastUpdateTime = now;
      return;
    }
    
    // Start smooth interpolation if price changed meaningfully
    // Use safe division with a reasonable minimum to prevent floating point precision issues
    const safeDisplayPrice = Math.max(displayPrice, 1.0);  // Minimum $1 denominator for safe division
    if (liveData.price > 0 && Math.abs(liveData.price - displayPrice) / safeDisplayPrice > PRICE_CHANGE_THRESHOLD) {
      startInterpolation(displayPrice, liveData.price, displayChange, liveData.change24h);
    }
  }, [liveData.price, liveData.change24h, displayPrice, displayChange, startInterpolation, hasTickerStreamInterpolation]);
  
  // If ticker stream provides smooth interpolation, use it directly
  if (hasTickerStreamInterpolation) {
    return liveData;
  }
  
  // Otherwise, return our own interpolated values
  return {
    ...liveData,
    price: displayPrice > 0 ? displayPrice : liveData.price,
    change24h: displayPrice > 0 ? displayChange : liveData.change24h,
  };
};
