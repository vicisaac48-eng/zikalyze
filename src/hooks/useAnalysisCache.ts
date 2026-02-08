import { useCallback } from 'react';
import { useNetworkStatus } from './useNetworkStatus';

// No caching - always use real-time data
export interface CachedAnalysis {
  symbol: string;
  analysis: string;
  price: number;
  change: number;
  timestamp: number;
  version: string;
}

export function useAnalysisCache(symbol: string) {
  // Use the centralized network status hook instead of manual tracking
  const { isOffline } = useNetworkStatus();

  // No-op functions - caching disabled for real-time only mode
  const cacheAnalysis = useCallback((analysis: string, price: number, change: number) => {
    // No caching - real-time only
  }, []);

  const getCachedAnalysis = useCallback(() => {
    return null; // No cache
  }, []);

  const clearCache = useCallback(() => {
    // No cache to clear
  }, []);

  const markFreshData = useCallback(() => {
    // Always fresh
  }, []);

  const getCacheAge = useCallback(() => {
    return null;
  }, []);

  return {
    cachedAnalysis: null,
    isOffline,
    isUsingCache: false,
    lastCacheTime: null,
    cacheAnalysis,
    getCachedAnalysis,
    clearCache,
    markFreshData,
    getCacheAge,
    hasCache: false,
  };
}
