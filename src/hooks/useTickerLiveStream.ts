// ═══════════════════════════════════════════════════════════════════════════
// Real-Time Live Streaming Hook for Crypto Ticker
// Connects DIRECTLY to exchange WebSockets for instant price updates
// Multi-exchange fallback ensures real-time data even if primary fails
// Professional crypto spot-like update behavior with smooth interpolation
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from "react";

// Connection configuration - optimized for reliable real-time updates
const CONNECTION_TIMEOUT_MS = 5000;       // Reduced timeout for faster fallback
const RECONNECT_BASE_DELAY_MS = 1000;     // Faster initial reconnection
const RECONNECT_MAX_DELAY_MS = 30000;     // Maximum delay between reconnects
const RECONNECT_JITTER_MS = 1000;         // Random jitter added to reconnection delay
const MAX_RECONNECT_ATTEMPTS = 10;        // Reset backoff after this many attempts
const HEALTH_CHECK_INTERVAL_MS = 30000;   // Check connection health every 30 seconds

// ═══════════════════════════════════════════════════════════════════════════
// PING/PONG HEARTBEAT - Required by Binance for stable connections
// Binance sends ping frames every ~20 seconds, we must respond with pong
// ═══════════════════════════════════════════════════════════════════════════
const PING_INTERVAL_MS = 15000;           // Send ping every 15 seconds to keep connection alive
const PONG_TIMEOUT_MS = 5000;             // If no pong response within 5s, consider connection dead

// ═══════════════════════════════════════════════════════════════════════════
// PRE-EMPTIVE 24H RECONNECTION - Binance disconnects after 24 hours
// Reconnect proactively before timeout to ensure continuous streaming
// ═══════════════════════════════════════════════════════════════════════════
const CONNECTION_MAX_AGE_MS = 23 * 60 * 60 * 1000; // 23 hours - reconnect before 24h timeout

// ═══════════════════════════════════════════════════════════════════════════
// LIVE RESPONSIVE ANIMATION CONFIGURATION
// Fast updates with smooth interpolation - feels like real-time crypto exchange
// ═══════════════════════════════════════════════════════════════════════════
const UPDATE_THROTTLE_MS = 800;            // Fast responsive updates (800ms between updates)
const INTERPOLATION_STEPS = 10;            // Quick smooth transitions
const INTERPOLATION_INTERVAL_MS = 40;      // Fast frames (10 steps * 40ms = 400ms total animation)
const MAX_PRICE_CHANGE_PERCENT = 2.5;      // Allow up to 2.5% change per update for responsive feel
const SIGNIFICANT_CHANGE_THRESHOLD = 0.0002; // 0.0002 = 0.02% - trigger on smaller price changes

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
  const reconnectAttemptsRef = useRef<Record<string, number>>({ binance: 0, okx: 0, bybit: 0 });
  const lastMessageTimeRef = useRef<Record<string, number>>({ binance: 0, okx: 0, bybit: 0 });
  const healthCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Ping/Pong heartbeat tracking
  const pingIntervalsRef = useRef<Record<string, NodeJS.Timeout | null>>({ binance: null, okx: null, bybit: null });
  const lastPongTimeRef = useRef<Record<string, number>>({ binance: 0, okx: 0, bybit: 0 });
  
  // Connection age tracking for pre-emptive 24h reconnection
  const connectionStartTimeRef = useRef<Record<string, number>>({ binance: 0, okx: 0, bybit: 0 });
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CONNECTION HEALTH — Exponential backoff with jitter
  // ═══════════════════════════════════════════════════════════════════════════
  const getReconnectDelay = useCallback((exchange: string): number => {
    const attempts = reconnectAttemptsRef.current[exchange] || 0;
    // Exponential backoff: 1s, 2s, 4s, 8s... up to max
    const baseDelay = Math.min(RECONNECT_BASE_DELAY_MS * Math.pow(2, attempts), RECONNECT_MAX_DELAY_MS);
    const jitter = Math.random() * RECONNECT_JITTER_MS;
    return baseDelay + jitter;
  }, []);
  
  const resetReconnectAttempts = useCallback((exchange: string) => {
    reconnectAttemptsRef.current[exchange] = 0;
  }, []);
  
  const incrementReconnectAttempts = useCallback((exchange: string) => {
    const current = reconnectAttemptsRef.current[exchange] || 0;
    // Reset after max attempts to allow recovery
    reconnectAttemptsRef.current[exchange] = current >= MAX_RECONNECT_ATTEMPTS ? 0 : current + 1;
  }, []);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // STABLE UPDATE SYSTEM
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
  // PREMIUM SMOOTH PRICE INTERPOLATION
  // Ease-out cubic animation: fast start, gentle slowdown at the end
  // Total animation: 20 steps * 30ms = 600ms of buttery-smooth transition
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
        resetReconnectAttempts('binance');
        const now = Date.now();
        lastMessageTimeRef.current.binance = now;
        connectionStartTimeRef.current.binance = now; // Track connection start for 24h reconnect
        lastPongTimeRef.current.binance = now; // Initialize pong time
        console.log(`[Ticker LiveStream] ✓ Binance connected - LIVE streaming active`);
        setIsConnected(true);
        setSources(prev => prev.includes("Binance") ? prev : [...prev, "Binance"]);
        
        // Start heartbeat monitoring to detect dead connections
        // Binance sends data frequently; if no data for extended period, connection is dead
        if (pingIntervalsRef.current.binance) {
          clearInterval(pingIntervalsRef.current.binance);
        }
        pingIntervalsRef.current.binance = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            // Check if we received any data recently
            // Binance streams are high-frequency - if no messages, connection is dead
            const timeSinceLastMessage = Date.now() - lastPongTimeRef.current.binance;
            if (timeSinceLastMessage > PING_INTERVAL_MS + PONG_TIMEOUT_MS) {
              console.log(`[Ticker LiveStream] Binance no data for ${Math.round(timeSinceLastMessage / 1000)}s, reconnecting...`);
              ws.close();
              return;
            }
            // Note: Browser WebSocket API doesn't support ws.ping(), Binance handles pings at protocol level
            // We passively monitor message activity as proof of connection health
          }
        }, PING_INTERVAL_MS);
      };
      
      ws.onmessage = (event) => {
        const now = Date.now();
        lastMessageTimeRef.current.binance = now;
        lastPongTimeRef.current.binance = now; // Treat any message as a "pong" (connection is alive)
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
        // Clear ping interval on close
        if (pingIntervalsRef.current.binance) {
          clearInterval(pingIntervalsRef.current.binance);
          pingIntervalsRef.current.binance = null;
        }
        setSources(prev => {
          const newSources = prev.filter(s => s !== "Binance");
          // Update connected state based on remaining sources
          setIsConnected(newSources.length > 0);
          return newSources;
        });
        
        // Reconnect with exponential backoff
        if (reconnectTimeoutsRef.current.binance) {
          clearTimeout(reconnectTimeoutsRef.current.binance);
        }
        incrementReconnectAttempts('binance');
        const delay = getReconnectDelay('binance');
        console.log(`[Ticker LiveStream] Binance disconnected (${e.code}), reconnecting in ${Math.round(delay)}ms...`);
        reconnectTimeoutsRef.current.binance = setTimeout(connectBinance, delay);
      };
      
      binanceWsRef.current = ws;
    } catch (err) {
      console.log(`[Ticker LiveStream] Binance connection failed:`, err);
    }
  }, [updateTicker, resetReconnectAttempts, incrementReconnectAttempts, getReconnectDelay]);

  // Connect to OKX - Primary for KAS, fallback for all coins if Binance fails
  const connectOKX = useCallback(() => {
    if (okxWsRef.current?.readyState === WebSocket.OPEN) return;
    
    try {
      console.log(`[Ticker LiveStream] Connecting to OKX for ${Object.keys(OKX_TICKER_SYMBOLS).length} coins...`);
      const ws = new WebSocket("wss://ws.okx.com:8443/ws/v5/public");
      
      ws.onopen = () => {
        resetReconnectAttempts('okx');
        lastMessageTimeRef.current.okx = Date.now();
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
        lastMessageTimeRef.current.okx = Date.now();
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
        // Reconnect with exponential backoff
        if (reconnectTimeoutsRef.current.okx) {
          clearTimeout(reconnectTimeoutsRef.current.okx);
        }
        incrementReconnectAttempts('okx');
        const delay = getReconnectDelay('okx');
        console.log(`[Ticker LiveStream] OKX disconnected, reconnecting in ${Math.round(delay)}ms...`);
        reconnectTimeoutsRef.current.okx = setTimeout(connectOKX, delay);
      };
      
      okxWsRef.current = ws;
    } catch (err) {
      console.log(`[Ticker LiveStream] OKX connection failed:`, err);
    }
  }, [updateTicker, resetReconnectAttempts, incrementReconnectAttempts, getReconnectDelay]);

  // Connect to Bybit - Additional fallback exchange
  const connectBybit = useCallback(() => {
    if (bybitWsRef.current?.readyState === WebSocket.OPEN) return;
    
    try {
      console.log(`[Ticker LiveStream] Connecting to Bybit for ${Object.keys(BYBIT_TICKER_SYMBOLS).length} coins...`);
      const ws = new WebSocket("wss://stream.bybit.com/v5/public/spot");
      
      ws.onopen = () => {
        resetReconnectAttempts('bybit');
        lastMessageTimeRef.current.bybit = Date.now();
        console.log(`[Ticker LiveStream] ✓ Bybit connected - real-time streaming active`);
        setSources(prev => prev.includes("Bybit") ? prev : [...prev, "Bybit"]);
        setIsConnected(true);
        
        // Subscribe to all ticker symbols
        const symbols = Object.values(BYBIT_TICKER_SYMBOLS).map(s => `tickers.${s}`);
        ws.send(JSON.stringify({ op: "subscribe", args: symbols }));
      };
      
      ws.onmessage = (event) => {
        lastMessageTimeRef.current.bybit = Date.now();
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
        // Reconnect with exponential backoff
        if (reconnectTimeoutsRef.current.bybit) {
          clearTimeout(reconnectTimeoutsRef.current.bybit);
        }
        incrementReconnectAttempts('bybit');
        const delay = getReconnectDelay('bybit');
        console.log(`[Ticker LiveStream] Bybit disconnected, reconnecting in ${Math.round(delay)}ms...`);
        reconnectTimeoutsRef.current.bybit = setTimeout(connectBybit, delay);
      };
      
      bybitWsRef.current = ws;
    } catch (err) {
      console.log(`[Ticker LiveStream] Bybit connection failed:`, err);
    }
  }, [updateTicker, resetReconnectAttempts, incrementReconnectAttempts, getReconnectDelay]);

  // ═══════════════════════════════════════════════════════════════════════════
  // CONNECTION HEALTH CHECK — Detect stale connections and reconnect proactively
  // Also handles pre-emptive 24h reconnection to avoid Binance timeout
  // ═══════════════════════════════════════════════════════════════════════════
  const checkConnectionHealth = useCallback(() => {
    const now = Date.now();
    // Connection is stale if no data received for 2x health check interval
    const staleThreshold = HEALTH_CHECK_INTERVAL_MS * 2;
    
    // Check Binance - also check for 24h connection age
    if (binanceWsRef.current?.readyState === WebSocket.OPEN) {
      const lastMessage = lastMessageTimeRef.current.binance;
      const connectionStart = connectionStartTimeRef.current.binance;
      
      // Only check connection age if we have a valid start time (> 0)
      if (connectionStart > 0) {
        const connectionAge = now - connectionStart;
        // Pre-emptive reconnect before 24h timeout
        if (connectionAge > CONNECTION_MAX_AGE_MS) {
          console.log(`[Ticker LiveStream] Binance connection age ${Math.round(connectionAge / 3600000)}h, pre-emptive reconnect before 24h timeout...`);
          binanceWsRef.current.close();
          return; // Exit early, don't check stale
        }
      }
      // Stale connection detection
      if (lastMessage && now - lastMessage > staleThreshold) {
        console.log(`[Ticker LiveStream] Binance connection stale (${Math.round((now - lastMessage) / 1000)}s without data), reconnecting...`);
        binanceWsRef.current.close();
      }
    }
    
    // Check OKX - also check for 24h connection age
    if (okxWsRef.current?.readyState === WebSocket.OPEN) {
      const lastMessage = lastMessageTimeRef.current.okx;
      const connectionStart = connectionStartTimeRef.current.okx;
      
      if (connectionStart > 0) {
        const connectionAge = now - connectionStart;
        if (connectionAge > CONNECTION_MAX_AGE_MS) {
          console.log(`[Ticker LiveStream] OKX connection age ${Math.round(connectionAge / 3600000)}h, pre-emptive reconnect...`);
          okxWsRef.current.close();
          return;
        }
      }
      if (lastMessage && now - lastMessage > staleThreshold) {
        console.log(`[Ticker LiveStream] OKX connection stale, reconnecting...`);
        okxWsRef.current.close();
      }
    }
    
    // Check Bybit - also check for 24h connection age
    if (bybitWsRef.current?.readyState === WebSocket.OPEN) {
      const lastMessage = lastMessageTimeRef.current.bybit;
      const connectionStart = connectionStartTimeRef.current.bybit;
      
      if (connectionStart > 0) {
        const connectionAge = now - connectionStart;
        if (connectionAge > CONNECTION_MAX_AGE_MS) {
          console.log(`[Ticker LiveStream] Bybit connection age ${Math.round(connectionAge / 3600000)}h, pre-emptive reconnect...`);
          bybitWsRef.current.close();
          return;
        }
      }
      if (lastMessage && now - lastMessage > staleThreshold) {
        console.log(`[Ticker LiveStream] Bybit connection stale, reconnecting...`);
        bybitWsRef.current.close();
      }
    }
    
    // If no connections are active, try to reconnect all
    if (!binanceWsRef.current || binanceWsRef.current.readyState !== WebSocket.OPEN) {
      if (!reconnectTimeoutsRef.current.binance) {
        connectBinance();
      }
    }
    if (!okxWsRef.current || okxWsRef.current.readyState !== WebSocket.OPEN) {
      if (!reconnectTimeoutsRef.current.okx) {
        connectOKX();
      }
    }
    if (!bybitWsRef.current || bybitWsRef.current.readyState !== WebSocket.OPEN) {
      if (!reconnectTimeoutsRef.current.bybit) {
        connectBybit();
      }
    }
  }, [connectBinance, connectOKX, connectBybit]);

  // Initialize connections - connect to multiple exchanges for redundancy
  useEffect(() => {
    console.log(`[Ticker LiveStream] 🚀 Starting real-time price streaming for ${TICKER_SYMBOLS.length} coins...`);
    
    // Connect to all exchanges for maximum coverage and reliability
    // Binance first (most reliable), then OKX (for KAS), then Bybit (additional coverage)
    connectBinance();
    setTimeout(connectOKX, 300);  // Slight delay for OKX
    setTimeout(connectBybit, 600); // Slight delay for Bybit
    
    // Start health check interval
    healthCheckIntervalRef.current = setInterval(checkConnectionHealth, HEALTH_CHECK_INTERVAL_MS);
    
    // Cleanup on unmount
    return () => {
      // Copy ref values to local variables for cleanup
      const timeouts = { ...reconnectTimeoutsRef.current };
      const pingIntervals = { ...pingIntervalsRef.current };
      const binanceWs = binanceWsRef.current;
      const okxWs = okxWsRef.current;
      const bybitWs = bybitWsRef.current;
      const interpolations = { ...interpolationRef.current };
      const healthCheck = healthCheckIntervalRef.current;
      
      // Clear health check interval
      if (healthCheck) {
        clearInterval(healthCheck);
      }
      
      // Clear all ping intervals
      Object.values(pingIntervals).forEach(interval => {
        if (interval) {
          clearInterval(interval);
        }
      });
      
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
  }, [connectBinance, connectOKX, connectBybit, checkConnectionHealth]);

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
