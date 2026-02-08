// ═══════════════════════════════════════════════════════════════════════════
// Real-Time Live Streaming Hook for Crypto Ticker
// Connects DIRECTLY to exchange WebSockets for instant price updates
// Multi-exchange fallback ensures real-time data even if primary fails
// Professional crypto spot-like update behavior with smooth interpolation
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from "react";

// Connection configuration
const CONNECTION_TIMEOUT_MS = 8000;    // Timeout before trying fallback exchanges
const RECONNECT_BASE_DELAY_MS = 2000;  // Base delay for reconnection
const RECONNECT_JITTER_MS = 2000;      // Random jitter added to reconnection delay

// ═══════════════════════════════════════════════════════════════════════════
// PROFESSIONAL CRYPTO SPOT MARKET UPDATE CONFIGURATION
// Matches standard exchange display behavior - not too fast, not aggressive
// ═══════════════════════════════════════════════════════════════════════════
const UPDATE_THROTTLE_MS = 1500;        // Standard crypto spot update interval (1.5s)
const INTERPOLATION_STEPS = 8;          // Smooth transition steps for price changes
const INTERPOLATION_INTERVAL_MS = 150;  // Time between interpolation steps (150ms * 8 = 1.2s total)
const MAX_PRICE_CHANGE_PERCENT = 2;     // Max % change per update cycle (anti-manipulation)
const SIGNIFICANT_CHANGE_THRESHOLD = 0.0001; // 0.01% - minimum change to trigger interpolation

// The 10 specific coins to track with live streaming
export const TICKER_SYMBOLS = ["BTC", "ETH", "SOL", "XRP", "DOGE", "KAS", "ADA", "AVAX", "LINK", "DOT"];

// Binance symbol mappings (lowercase with usdt)
const BINANCE_TICKER_SYMBOLS: Record<string, string> = {
  BTC: "btcusdt",
  ETH: "ethusdt", 
  SOL: "solusdt",
  XRP: "xrpusdt",
  DOGE: "dogeusdt",
  ADA: "adausdt",
  AVAX: "avaxusdt",
  LINK: "linkusdt",
  DOT: "dotusdt",
};

// OKX symbol mappings - ALL ticker symbols for fallback when Binance fails
const OKX_TICKER_SYMBOLS: Record<string, string> = {
  BTC: "BTC-USDT",
  ETH: "ETH-USDT",
  SOL: "SOL-USDT",
  XRP: "XRP-USDT",
  DOGE: "DOGE-USDT",
  KAS: "KAS-USDT",
  ADA: "ADA-USDT",
  AVAX: "AVAX-USDT",
  LINK: "LINK-USDT",
  DOT: "DOT-USDT",
};

// Bybit symbol mappings - Additional fallback exchange
const BYBIT_TICKER_SYMBOLS: Record<string, string> = {
  BTC: "BTCUSDT",
  ETH: "ETHUSDT",
  SOL: "SOLUSDT",
  XRP: "XRPUSDT",
  DOGE: "DOGEUSDT",
  KAS: "KASUSDT",
  ADA: "ADAUSDT",
  AVAX: "AVAXUSDT",
  LINK: "LINKUSDT",
  DOT: "DOTUSDT",
};

export interface TickerPrice {
  symbol: string;
  price: number;          // Target/actual price from exchange
  displayPrice: number;   // Smoothly interpolated display price
  change24h: number;
  displayChange24h: number; // Smoothly interpolated 24h change
  high24h: number;
  low24h: number;
  volume: number;
  lastUpdate: number;
  source: string;
}

/**
 * Internal type for tracking pending updates from WebSocket before throttling/interpolation.
 * Stores raw exchange data that will be processed and smoothed before display.
 */
interface PendingUpdate {
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume: number;
  source: string;
  timestamp: number;
}

export const useTickerLiveStream = () => {
  const [tickerPrices, setTickerPrices] = useState<Record<string, TickerPrice>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [sources, setSources] = useState<string[]>([]);
  
  const binanceWsRef = useRef<WebSocket | null>(null);
  const okxWsRef = useRef<WebSocket | null>(null);
  const bybitWsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PROFESSIONAL SMOOTH UPDATE SYSTEM
  // Tracks pending updates and interpolation state for each symbol
  // ═══════════════════════════════════════════════════════════════════════════
  const pendingUpdatesRef = useRef<Record<string, PendingUpdate>>({});
  const lastUpdateTimeRef = useRef<Record<string, number>>({});
  const interpolationRef = useRef<Record<string, {
    startPrice: number;
    endPrice: number;
    startChange: number;
    endChange: number;
    step: number;
    intervalId: NodeJS.Timeout | null;
  }>>({});
  
  // ═══════════════════════════════════════════════════════════════════════════
  // SMOOTH PRICE INTERPOLATION
  // Creates gradual, professional transitions between price updates
  // ═══════════════════════════════════════════════════════════════════════════
  const startInterpolation = useCallback((symbol: string, fromPrice: number, toPrice: number, fromChange: number, toChange: number) => {
    // Clear any existing interpolation
    if (interpolationRef.current[symbol]?.intervalId) {
      clearInterval(interpolationRef.current[symbol].intervalId);
    }
    
    // Initialize interpolation state
    interpolationRef.current[symbol] = {
      startPrice: fromPrice,
      endPrice: toPrice,
      startChange: fromChange,
      endChange: toChange,
      step: 0,
      intervalId: null,
    };
    
    // Run interpolation steps
    const intervalId = setInterval(() => {
      const interp = interpolationRef.current[symbol];
      if (!interp || interp.step >= INTERPOLATION_STEPS) {
        if (interp?.intervalId) {
          clearInterval(interp.intervalId);
          interp.intervalId = null; // Clear reference to prevent double-clearing
        }
        return;
      }
      
      interp.step++;
      const progress = interp.step / INTERPOLATION_STEPS;
      
      // Ease-out cubic for natural deceleration (like real market displays)
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      
      // Calculate interpolated values
      const interpolatedPrice = interp.startPrice + (interp.endPrice - interp.startPrice) * easedProgress;
      const interpolatedChange = interp.startChange + (interp.endChange - interp.startChange) * easedProgress;
      
      setTickerPrices(prev => {
        const current = prev[symbol];
        if (!current) return prev;
        return {
          ...prev,
          [symbol]: {
            ...current,
            displayPrice: interpolatedPrice,
            displayChange24h: interpolatedChange,
          }
        };
      });
    }, INTERPOLATION_INTERVAL_MS);
    
    interpolationRef.current[symbol].intervalId = intervalId;
  }, []);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // THROTTLED UPDATE PROCESSING
  // Applies professional update rate limits matching standard crypto spots
  // ═══════════════════════════════════════════════════════════════════════════
  const processPendingUpdate = useCallback((symbol: string) => {
    const pending = pendingUpdatesRef.current[symbol];
    if (!pending) return;
    
    const now = Date.now();
    const lastUpdate = lastUpdateTimeRef.current[symbol] || 0;
    
    // Enforce throttle - professional spot-like update timing
    if (now - lastUpdate < UPDATE_THROTTLE_MS) {
      return;
    }
    
    lastUpdateTimeRef.current[symbol] = now;
    
    setTickerPrices(prev => {
      const current = prev[symbol];
      // Use nullish coalescing to properly handle 0 values
      const currentPrice = current?.displayPrice ?? current?.price ?? pending.price;
      const currentChange = current?.displayChange24h ?? current?.change24h ?? pending.change24h;
      
      // Validate price change isn't too aggressive (anti-manipulation)
      let targetPrice = pending.price;
      if (currentPrice > 0) {
        const changePercent = Math.abs((targetPrice - currentPrice) / currentPrice) * 100;
        if (changePercent > MAX_PRICE_CHANGE_PERCENT) {
          // Clamp to max allowed change for smooth, non-aggressive movement
          const direction = targetPrice > currentPrice ? 1 : -1;
          targetPrice = currentPrice * (1 + (direction * MAX_PRICE_CHANGE_PERCENT / 100));
        }
      }
      
      // Start smooth interpolation if price changed meaningfully
      const priceDiff = Math.abs(targetPrice - currentPrice);
      const significantChange = currentPrice > 0 ? priceDiff / currentPrice > SIGNIFICANT_CHANGE_THRESHOLD : true;
      
      if (significantChange && currentPrice > 0) {
        startInterpolation(symbol, currentPrice, targetPrice, currentChange, pending.change24h);
      }
      
      return {
        ...prev,
        [symbol]: {
          symbol,
          price: pending.price,         // Store actual price
          displayPrice: current?.displayPrice || pending.price,  // Display will interpolate
          change24h: pending.change24h,  // Store actual change
          displayChange24h: current?.displayChange24h || pending.change24h, // Display will interpolate
          high24h: pending.high24h,
          low24h: pending.low24h,
          volume: pending.volume,
          lastUpdate: now,
          source: pending.source,
        }
      };
    });
    
    // Clear processed update
    delete pendingUpdatesRef.current[symbol];
  }, [startInterpolation]);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // QUEUE UPDATE FOR PROCESSING
  // Stores incoming WebSocket data and schedules processing
  // ═══════════════════════════════════════════════════════════════════════════
  const queueUpdate = useCallback((symbol: string, data: Partial<TickerPrice>, source: string) => {
    // Store pending update (latest data wins)
    pendingUpdatesRef.current[symbol] = {
      price: data.price || 0,
      change24h: data.change24h || 0,
      high24h: data.high24h || 0,
      low24h: data.low24h || 0,
      volume: data.volume || 0,
      source,
      timestamp: Date.now(),
    };
    
    // Process immediately if throttle period has passed
    processPendingUpdate(symbol);
  }, [processPendingUpdate]);
  
  // Legacy updateTicker for compatibility - now queues for smooth processing
  const updateTicker = useCallback((symbol: string, data: Partial<TickerPrice>, source: string) => {
    queueUpdate(symbol, data, source);
  }, [queueUpdate]);

  // Connect to Binance combined stream for 9 coins
  const connectBinance = useCallback(() => {
    if (binanceWsRef.current?.readyState === WebSocket.OPEN) return;
    
    try {
      // Build combined stream URL for all Binance-supported coins
      const streams = Object.values(BINANCE_TICKER_SYMBOLS)
        .map(s => `${s}@ticker`)
        .join("/");
      
      const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams}`;
      console.log(`[Ticker LiveStream] Connecting to Binance for ${Object.keys(BINANCE_TICKER_SYMBOLS).length} coins...`);
      
      const ws = new WebSocket(wsUrl);
      
      // Connection timeout - if not connected within timeout, close and rely on fallback exchanges
      const connectionTimeout = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          console.log(`[Ticker LiveStream] Binance connection timeout, using fallback exchanges...`);
          ws.close();
        }
      }, CONNECTION_TIMEOUT_MS);
      
      ws.onopen = () => {
        clearTimeout(connectionTimeout);
        console.log(`[Ticker LiveStream] ✓ Binance connected - LIVE streaming active`);
        setIsConnected(true);
        setSources(prev => prev.includes("Binance") ? prev : [...prev, "Binance"]);
      };
      
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.data) {
            const ticker = message.data;
            // Extract symbol: btcusdt -> BTC
            const rawSymbol = (ticker.s || "").toLowerCase();
            
            // Find matching symbol
            const entry = Object.entries(BINANCE_TICKER_SYMBOLS).find(
              ([_, v]) => v === rawSymbol
            );
            
            if (entry && ticker.c) {
              const [symbol] = entry;
              const price = parseFloat(ticker.c);
              
              if (price > 0) {
                updateTicker(symbol, {
                  price,
                  change24h: parseFloat(ticker.P || "0"),
                  high24h: parseFloat(ticker.h || "0"),
                  low24h: parseFloat(ticker.l || "0"),
                  volume: parseFloat(ticker.q || "0"),
                }, "Binance");
              }
            }
          }
        } catch {
          // Silent parse errors
        }
      };
      
      ws.onerror = () => {
        clearTimeout(connectionTimeout);
        console.log(`[Ticker LiveStream] Binance error, will use fallback exchanges...`);
      };
      
      ws.onclose = (e) => {
        clearTimeout(connectionTimeout);
        setSources(prev => {
          const newSources = prev.filter(s => s !== "Binance");
          // Update connected state based on remaining sources
          setIsConnected(newSources.length > 0);
          return newSources;
        });
        
        // Reconnect after delay with jitter
        if (reconnectTimeoutsRef.current.binance) {
          clearTimeout(reconnectTimeoutsRef.current.binance);
        }
        const delay = RECONNECT_BASE_DELAY_MS + Math.random() * RECONNECT_JITTER_MS;
        console.log(`[Ticker LiveStream] Binance disconnected (${e.code}), reconnecting in ${Math.round(delay)}ms...`);
        reconnectTimeoutsRef.current.binance = setTimeout(connectBinance, delay);
      };
      
      binanceWsRef.current = ws;
    } catch (err) {
      console.log(`[Ticker LiveStream] Binance connection failed:`, err);
    }
  }, [updateTicker]);

  // Connect to OKX - Primary for KAS, fallback for all coins if Binance fails
  const connectOKX = useCallback(() => {
    if (okxWsRef.current?.readyState === WebSocket.OPEN) return;
    
    try {
      console.log(`[Ticker LiveStream] Connecting to OKX for ${Object.keys(OKX_TICKER_SYMBOLS).length} coins...`);
      const ws = new WebSocket("wss://ws.okx.com:8443/ws/v5/public");
      
      ws.onopen = () => {
        console.log(`[Ticker LiveStream] ✓ OKX connected - real-time streaming active`);
        setSources(prev => prev.includes("OKX") ? prev : [...prev, "OKX"]);
        setIsConnected(true);
        
        // Subscribe to ALL ticker symbols for full coverage
        ws.send(JSON.stringify({
          op: "subscribe",
          args: Object.values(OKX_TICKER_SYMBOLS).map(instId => ({
            channel: "tickers",
            instId,
          })),
        }));
      };
      
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.arg?.channel === "tickers" && message.data?.[0]) {
            const ticker = message.data[0];
            // Extract symbol: BTC-USDT -> BTC
            const instId = ticker.instId || "";
            
            const entry = Object.entries(OKX_TICKER_SYMBOLS).find(
              ([_, v]) => v === instId
            );
            
            if (entry && ticker.last) {
              const [symbol] = entry;
              const price = parseFloat(ticker.last);
              const open = parseFloat(ticker.sodUtc8 || ticker.open24h || "0");
              
              if (price > 0) {
                updateTicker(symbol, {
                  price,
                  change24h: open > 0 ? ((price - open) / open) * 100 : 0,
                  high24h: parseFloat(ticker.high24h || "0"),
                  low24h: parseFloat(ticker.low24h || "0"),
                  volume: parseFloat(ticker.vol24h || "0") * price,
                }, "OKX");
              }
            }
          }
        } catch {
          // Silent parse errors
        }
      };
      
      ws.onerror = () => {
        console.log(`[Ticker LiveStream] OKX error`);
      };
      
      ws.onclose = () => {
        setSources(prev => {
          const newSources = prev.filter(s => s !== "OKX");
          setIsConnected(newSources.length > 0);
          return newSources;
        });
        // Reconnect after delay
        if (reconnectTimeoutsRef.current.okx) {
          clearTimeout(reconnectTimeoutsRef.current.okx);
        }
        reconnectTimeoutsRef.current.okx = setTimeout(connectOKX, 3000);
      };
      
      okxWsRef.current = ws;
    } catch (err) {
      console.log(`[Ticker LiveStream] OKX connection failed:`, err);
    }
  }, [updateTicker]);

  // Connect to Bybit - Additional fallback exchange
  const connectBybit = useCallback(() => {
    if (bybitWsRef.current?.readyState === WebSocket.OPEN) return;
    
    try {
      console.log(`[Ticker LiveStream] Connecting to Bybit for ${Object.keys(BYBIT_TICKER_SYMBOLS).length} coins...`);
      const ws = new WebSocket("wss://stream.bybit.com/v5/public/spot");
      
      ws.onopen = () => {
        console.log(`[Ticker LiveStream] ✓ Bybit connected - real-time streaming active`);
        setSources(prev => prev.includes("Bybit") ? prev : [...prev, "Bybit"]);
        setIsConnected(true);
        
        // Subscribe to all ticker symbols
        const symbols = Object.values(BYBIT_TICKER_SYMBOLS).map(s => `tickers.${s}`);
        ws.send(JSON.stringify({ op: "subscribe", args: symbols }));
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.topic?.startsWith('tickers.') && data.data) {
            const ticker = data.data;
            // Extract symbol: BTCUSDT -> BTC
            const rawSymbol = ticker.symbol?.replace(/USDT$/, '').toUpperCase();
            
            const entry = Object.entries(BYBIT_TICKER_SYMBOLS).find(
              ([symbol]) => symbol === rawSymbol
            );
            
            if (entry && ticker.lastPrice) {
              const [symbol] = entry;
              const price = parseFloat(ticker.lastPrice);
              
              if (price > 0) {
                updateTicker(symbol, {
                  price,
                  change24h: parseFloat(ticker.price24hPcnt || '0') * 100,
                  high24h: parseFloat(ticker.highPrice24h || '0'),
                  low24h: parseFloat(ticker.lowPrice24h || '0'),
                  volume: parseFloat(ticker.turnover24h || '0'),
                }, "Bybit");
              }
            }
          }
        } catch {
          // Silent parse errors
        }
      };
      
      ws.onerror = () => {
        console.log(`[Ticker LiveStream] Bybit error`);
      };
      
      ws.onclose = () => {
        setSources(prev => {
          const newSources = prev.filter(s => s !== "Bybit");
          setIsConnected(newSources.length > 0);
          return newSources;
        });
        // Reconnect after delay
        if (reconnectTimeoutsRef.current.bybit) {
          clearTimeout(reconnectTimeoutsRef.current.bybit);
        }
        reconnectTimeoutsRef.current.bybit = setTimeout(connectBybit, 3000);
      };
      
      bybitWsRef.current = ws;
    } catch (err) {
      console.log(`[Ticker LiveStream] Bybit connection failed:`, err);
    }
  }, [updateTicker]);

  // Initialize connections - connect to multiple exchanges for redundancy
  useEffect(() => {
    console.log(`[Ticker LiveStream] 🚀 Starting real-time price streaming for ${TICKER_SYMBOLS.length} coins...`);
    
    // Connect to all exchanges for maximum coverage and reliability
    // Binance first (most reliable), then OKX (for KAS), then Bybit (additional coverage)
    connectBinance();
    setTimeout(connectOKX, 300);  // Slight delay for OKX
    setTimeout(connectBybit, 600); // Slight delay for Bybit
    
    // Cleanup on unmount
    return () => {
      // Copy ref values to local variables for cleanup
      const timeouts = { ...reconnectTimeoutsRef.current };
      const binanceWs = binanceWsRef.current;
      const okxWs = okxWsRef.current;
      const bybitWs = bybitWsRef.current;
      const interpolations = { ...interpolationRef.current };
      
      // Clear all reconnect timeouts
      Object.values(timeouts).forEach(timeout => {
        clearTimeout(timeout);
      });
      
      // Clear all interpolation intervals
      Object.values(interpolations).forEach(interp => {
        if (interp.intervalId) {
          clearInterval(interp.intervalId);
        }
      });
      
      // Close all WebSocket connections
      if (binanceWs) {
        binanceWs.close();
      }
      if (okxWs) {
        okxWs.close();
      }
      if (bybitWs) {
        bybitWs.close();
      }
    };
  }, [connectBinance, connectOKX, connectBybit]);

  // Helper to get price for a symbol
  const getPrice = useCallback((symbol: string): TickerPrice | undefined => {
    return tickerPrices[symbol.toUpperCase()];
  }, [tickerPrices]);

  return {
    tickerPrices,
    isConnected,
    sources,
    getPrice,
  };
};
