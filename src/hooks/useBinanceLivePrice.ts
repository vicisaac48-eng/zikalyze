import { useState, useEffect, useRef, useCallback } from "react";
import { 
  ExponentialBackoff, 
  NetworkQualityDetector, 
  HeartbeatMonitor,
  DataCache 
} from "@/lib/websocket-resilience";

interface LivePriceData {
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

// Supabase project URL for WebSocket proxy
const SUPABASE_PROJECT_ID = "eqtzrftndyninwasclfd";
const WS_PROXY_URL = `wss://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/crypto-ws-proxy`;

// Binance direct WebSocket as fallback
const BINANCE_WS_URL = "wss://stream.binance.com:9443/ws";

const MAX_RECONNECT_ATTEMPTS = 10; // Increased for better resilience

export const useBinanceLivePrice = (symbol: string, fallbackPrice?: number, fallbackChange?: number) => {
  const [liveData, setLiveData] = useState<LivePriceData>({
    price: fallbackPrice || 0,
    change24h: fallbackChange || 0,
    high24h: 0,
    low24h: 0,
    volume: 0,
    lastUpdate: Date.now(),
    isLive: false,
    isConnecting: true,
    source: 'initializing',
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const useProxyRef = useRef(true); // Try proxy first
  const connectionStartTimeRef = useRef<number>(0);

  // Resilience utilities
  const backoffRef = useRef(new ExponentialBackoff(1000, 60000, 0.3));
  const networkQualityRef = useRef(new NetworkQualityDetector());
  const heartbeatRef = useRef(new HeartbeatMonitor(30000, 60000));
  const dataCacheRef = useRef(new DataCache<LivePriceData>(300000));

  const cleanup = useCallback(() => {
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    heartbeatRef.current.stop();
    if (wsRef.current) {
      try {
        wsRef.current.onclose = null;
        wsRef.current.onerror = null;
        wsRef.current.onmessage = null;
        wsRef.current.onopen = null;
        wsRef.current.close();
      } catch {
        // Ignore cleanup errors
      }
      wsRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (!isMountedRef.current) return;
    
    cleanup();

    // Build WebSocket URL
    let wsUrl: string;
    let sourceName: string;
    
    if (useProxyRef.current) {
      // Use server-side proxy (bypasses CORS, more reliable)
      wsUrl = `${WS_PROXY_URL}?symbol=${symbol.toUpperCase()}`;
      sourceName = 'Binance (Proxy)';
    } else {
      // Direct Binance connection (fallback)
      wsUrl = `${BINANCE_WS_URL}/${symbol.toLowerCase()}usdt@ticker`;
      sourceName = 'Binance (Direct)';
    }

    console.log(`[LivePrice] Connecting to ${sourceName} for ${symbol} (attempt ${backoffRef.current.getAttempt() + 1})`);
    connectionStartTimeRef.current = Date.now();

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      // Adaptive connection timeout based on network quality
      const timeout = networkQualityRef.current.getRecommendedTimeout();
      connectionTimeoutRef.current = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          console.log(`[LivePrice] Connection timeout for ${symbol} after ${timeout}ms`);
          ws.close();
        }
      }, timeout);

      ws.onopen = () => {
        if (!isMountedRef.current) return;
        
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
        }

        // Record connection time for network quality
        const connectionTime = Date.now() - connectionStartTimeRef.current;
        networkQualityRef.current.recordConnectionTime(connectionTime);
        const networkQuality = networkQualityRef.current.getQuality();
        
        console.log(`[LivePrice] Connected to ${sourceName} for ${symbol} in ${connectionTime}ms (network: ${networkQuality})`);
        
        // Reset backoff on successful connection
        backoffRef.current.reset();
        
        setLiveData(prev => ({ 
          ...prev, 
          isLive: true, 
          isConnecting: false,
          source: sourceName,
        }));

        // Start heartbeat monitoring
        heartbeatRef.current.start({
          onTimeout: () => {
            console.warn(`[LivePrice] Heartbeat timeout for ${symbol}, reconnecting...`);
            ws.close(); // Will trigger onclose and reconnection
          },
          onHeartbeat: () => {
            // Send ping if WebSocket supports it (some servers respond to any message)
            try {
              if (ws.readyState === WebSocket.OPEN) {
                // Most crypto WebSockets don't need explicit pings, 
                // they keep alive automatically or respond to data subscription
                heartbeatRef.current.recordPong();
              }
            } catch (e) {
              console.warn('[LivePrice] Heartbeat send failed:', e);
            }
          }
        });
      };

      ws.onmessage = (event) => {
        if (!isMountedRef.current) return;
        
        // Record pong for heartbeat
        heartbeatRef.current.recordPong();
        
        try {
          const data = JSON.parse(event.data);
          
          // Handle proxy format
          if (data.type === 'ticker' && data.source === 'binance') {
            const newData = {
              price: data.price,
              change24h: data.change24h,
              high24h: data.high24h,
              low24h: data.low24h,
              volume: data.volume,
              lastUpdate: Date.now(),
              isLive: true,
              isConnecting: false,
              source: 'Binance (Proxy)',
            };
            setLiveData(newData);
            // Cache the data
            dataCacheRef.current.set(symbol, newData);
            return;
          }
          
          // Handle proxy connection confirmation
          if (data.type === 'connected') {
            console.log(`[LivePrice] Proxy confirmed connection for ${symbol}`);
            return;
          }
          
          // Handle direct Binance format
          if (data.c) {
            const newData = {
              price: parseFloat(data.c),
              change24h: parseFloat(data.P),
              high24h: parseFloat(data.h),
              low24h: parseFloat(data.l),
              volume: parseFloat(data.q),
              lastUpdate: Date.now(),
              isLive: true,
              isConnecting: false,
              source: 'Binance (Direct)',
            };
            setLiveData(newData);
            // Cache the data
            dataCacheRef.current.set(symbol, newData);
          }
        } catch {
          // Silent parse error
        }
      };

      ws.onerror = (error) => {
        console.log(`[LivePrice] WebSocket error for ${symbol}:`, error);
      };

      ws.onclose = () => {
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
        }
        heartbeatRef.current.stop();
        if (!isMountedRef.current) return;
        
        console.log(`[LivePrice] Disconnected from ${sourceName} for ${symbol}`);
        
        // Try cached data during reconnection
        const cachedData = dataCacheRef.current.get(symbol);
        if (cachedData) {
          const cacheAge = dataCacheRef.current.getAge(symbol);
          console.log(`[LivePrice] Using cached data (${Math.round((cacheAge || 0) / 1000)}s old) while reconnecting`);
          setLiveData({ ...cachedData, isLive: false, isConnecting: true, source: 'Cached' });
        }
        
        // Check if should retry
        if (backoffRef.current.getAttempt() >= MAX_RECONNECT_ATTEMPTS) {
          console.warn(`[LivePrice] Max reconnection attempts reached for ${symbol}`);
          setLiveData(prev => ({ 
            ...prev, 
            isLive: false, 
            isConnecting: false,
            price: fallbackPrice || prev.price,
            change24h: fallbackChange || prev.change24h,
            source: 'Offline',
          }));
          
          // Final retry after long delay
          reconnectTimeoutRef.current = setTimeout(() => {
            if (isMountedRef.current) {
              backoffRef.current.reset();
              useProxyRef.current = true;
              connect();
            }
          }, 60000); // 1 minute
          return;
        }
        
        // Switch between proxy and direct on failures
        if (backoffRef.current.getAttempt() === 3 && useProxyRef.current) {
          console.log(`[LivePrice] Switching to direct Binance connection`);
          useProxyRef.current = false;
        } else if (backoffRef.current.getAttempt() === 6 && !useProxyRef.current) {
          console.log(`[LivePrice] Switching back to proxy connection`);
          useProxyRef.current = true;
        }
        
        setLiveData(prev => ({ 
          ...prev, 
          isLive: false, 
          isConnecting: true,
        }));
        
        // Exponential backoff with jitter
        const delay = backoffRef.current.getNextDelay();
        reconnectTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) connect();
        }, delay);
      };
    } catch (e) {
      console.log(`[LivePrice] Failed to create WebSocket:`, e);
      
      setLiveData(prev => ({ 
        ...prev, 
        isLive: false, 
        isConnecting: true,
      }));
      
      const delay = backoffRef.current.getNextDelay();
      reconnectTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) connect();
      }, delay);
    }
  }, [symbol, fallbackPrice, fallbackChange, cleanup]);

  useEffect(() => {
    isMountedRef.current = true;
    backoffRef.current.reset();
    useProxyRef.current = true;
    
    // Small delay before connecting
    const initTimeout = setTimeout(() => {
      if (isMountedRef.current) {
        connect();
      }
    }, 300);

    return () => {
      isMountedRef.current = false;
      clearTimeout(initTimeout);
      cleanup();
    };
  }, [symbol, connect, cleanup]);

  // Update with fallback data when props change and not live
  useEffect(() => {
    if (!liveData.isLive) {
      setLiveData(prev => ({ 
        ...prev, 
        price: fallbackPrice || prev.price,
        change24h: fallbackChange || prev.change24h,
      }));
    }
  }, [fallbackPrice, fallbackChange, liveData.isLive]);

  return liveData;
};
