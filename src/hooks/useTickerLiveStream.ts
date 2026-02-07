// ═══════════════════════════════════════════════════════════════════════════
// Real-Time Live Streaming Hook for Crypto Ticker
// Connects DIRECTLY to exchange WebSockets for instant price updates
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from "react";

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

// OKX symbol mappings (for KAS which isn't on Binance)
const OKX_TICKER_SYMBOLS: Record<string, string> = {
  KAS: "KAS-USDT",
};

export interface TickerPrice {
  symbol: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume: number;
  lastUpdate: number;
  source: string;
}

export const useTickerLiveStream = () => {
  const [tickerPrices, setTickerPrices] = useState<Record<string, TickerPrice>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [sources, setSources] = useState<string[]>([]);
  
  const binanceWsRef = useRef<WebSocket | null>(null);
  const okxWsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const okxReconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectionsInitializedRef = useRef(false);
  
  // Update a single ticker price
  const updateTicker = useCallback((symbol: string, data: Partial<TickerPrice>, source: string) => {
    setTickerPrices(prev => ({
      ...prev,
      [symbol]: {
        symbol,
        price: data.price ?? prev[symbol]?.price ?? 0,
        change24h: data.change24h ?? prev[symbol]?.change24h ?? 0,
        high24h: data.high24h ?? prev[symbol]?.high24h ?? 0,
        low24h: data.low24h ?? prev[symbol]?.low24h ?? 0,
        volume: data.volume ?? prev[symbol]?.volume ?? 0,
        lastUpdate: Date.now(),
        source,
      }
    }));
  }, []);

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
      
      ws.onopen = () => {
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
        console.log(`[Ticker LiveStream] Binance error, will reconnect...`);
      };
      
      ws.onclose = (e) => {
        setSources(prev => {
          const newSources = prev.filter(s => s !== "Binance");
          // Update connected status based on remaining sources
          setIsConnected(newSources.length > 0);
          return newSources;
        });
        
        // Reconnect after delay
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        const delay = 2000 + Math.random() * 2000;
        console.log(`[Ticker LiveStream] Binance disconnected (${e.code}), reconnecting in ${Math.round(delay)}ms...`);
        reconnectTimeoutRef.current = setTimeout(connectBinance, delay);
      };
      
      binanceWsRef.current = ws;
    } catch (err) {
      console.log(`[Ticker LiveStream] Binance connection failed:`, err);
    }
  }, [updateTicker]);

  // Connect to OKX for KAS (not on Binance)
  const connectOKX = useCallback(() => {
    if (okxWsRef.current?.readyState === WebSocket.OPEN) return;
    
    try {
      console.log(`[Ticker LiveStream] Connecting to OKX for KAS...`);
      const ws = new WebSocket("wss://ws.okx.com:8443/ws/v5/public");
      
      ws.onopen = () => {
        console.log(`[Ticker LiveStream] ✓ OKX connected for KAS`);
        setSources(prev => prev.includes("OKX") ? prev : [...prev, "OKX"]);
        setIsConnected(true);
        
        // Subscribe to KAS ticker
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
            // Extract symbol: KAS-USDT -> KAS
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
        if (okxReconnectTimeoutRef.current) {
          clearTimeout(okxReconnectTimeoutRef.current);
        }
        okxReconnectTimeoutRef.current = setTimeout(connectOKX, 3000);
      };
      
      okxWsRef.current = ws;
    } catch (err) {
      console.log(`[Ticker LiveStream] OKX connection failed:`, err);
    }
  }, [updateTicker]);

  // Initialize connections - only run once on mount
  useEffect(() => {
    if (connectionsInitializedRef.current) return;
    connectionsInitializedRef.current = true;
    
    console.log(`[Ticker LiveStream] 🚀 Starting real-time price streaming for ${TICKER_SYMBOLS.length} coins...`);
    
    // Connect to exchanges
    connectBinance();
    setTimeout(connectOKX, 500); // Slight delay for OKX
    
    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (okxReconnectTimeoutRef.current) {
        clearTimeout(okxReconnectTimeoutRef.current);
      }
      if (binanceWsRef.current) {
        binanceWsRef.current.close();
      }
      if (okxWsRef.current) {
        okxWsRef.current.close();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

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
