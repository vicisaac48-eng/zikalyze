// ═══════════════════════════════════════════════════════════════════════════════
// 📊 useChartAPI — React Hook for Chart API Integration
// ═══════════════════════════════════════════════════════════════════════════════
// Provides real-time chart analysis with all technical indicators
// Uses the new Chart API module from zikalyze-brain
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  analyzeChart, 
  fetchMultiTimeframeAnalysis,
  ChartAnalysisResult,
  ChartInterval,
  TechnicalIndicators,
  toChartTrendInput
} from '@/lib/zikalyze-brain/chart-api';
import { ChartTrendInput, MultiTimeframeInput } from '@/lib/zikalyze-brain/types';

export interface ChartAPIData {
  // Full analysis result
  analysis: ChartAnalysisResult | null;
  
  // Quick access to indicators
  indicators: TechnicalIndicators | null;
  
  // Trend data for AI Brain
  chartTrendInput: ChartTrendInput | null;
  
  // Multi-timeframe data
  multiTimeframe: MultiTimeframeInput | null;
  
  // Status
  isLoading: boolean;
  isLive: boolean;
  source: string;
  lastUpdated: number;
  error: string | null;
  
  // Actions
  refresh: () => Promise<void>;
}

const REFRESH_INTERVAL = 30000; // Refresh every 30 seconds for real-time analysis

export function useChartAPI(
  symbol: string,
  interval: ChartInterval = '1h',
  enableMultiTf: boolean = true
): ChartAPIData {
  const [analysis, setAnalysis] = useState<ChartAnalysisResult | null>(null);
  const [multiTimeframe, setMultiTimeframe] = useState<MultiTimeframeInput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState(0);
  
  const mountedRef = useRef(true);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSymbolRef = useRef(symbol);

  const fetchData = useCallback(async () => {
    if (!symbol) return;
    
    // Reset if symbol changed
    if (lastSymbolRef.current !== symbol) {
      lastSymbolRef.current = symbol;
      setAnalysis(null);
      setMultiTimeframe(null);
      setIsLoading(true);
    }

    try {
      // Fetch main analysis and multi-TF in parallel
      const promises: Promise<any>[] = [
        analyzeChart(symbol, interval, 100)
      ];
      
      if (enableMultiTf) {
        promises.push(fetchMultiTimeframeAnalysis(symbol));
      }
      
      const results = await Promise.all(promises);
      
      if (!mountedRef.current) return;
      
      const chartAnalysis = results[0] as ChartAnalysisResult | null;
      const mtfData = enableMultiTf ? results[1] as MultiTimeframeInput | null : null;
      
      if (chartAnalysis) {
        setAnalysis(chartAnalysis);
        console.log(`[useChartAPI] ${symbol} ${interval} loaded from ${chartAnalysis.source}: RSI=${chartAnalysis.indicators.rsi.toFixed(1)}, Trend=${chartAnalysis.trend}`);
      }
      
      if (mtfData) {
        setMultiTimeframe(mtfData);
        console.log(`[useChartAPI] ${symbol} Multi-TF confluence: ${mtfData.confluence.overallBias} (${mtfData.confluence.alignedTimeframes}/4 aligned)`);
      }
      
      setLastUpdated(Date.now());
      setError(null);
    } catch (e) {
      console.error(`[useChartAPI] Error fetching ${symbol}:`, e);
      if (mountedRef.current) {
        setError(e instanceof Error ? e.message : 'Unknown error');
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [symbol, interval, enableMultiTf]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await fetchData();
  }, [fetchData]);

  // Initial fetch and interval refresh
  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    
    // Set up refresh interval
    refreshIntervalRef.current = setInterval(fetchData, REFRESH_INTERVAL);
    
    return () => {
      mountedRef.current = false;
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [fetchData]);

  // Convert analysis to ChartTrendInput for AI Brain compatibility
  const chartTrendInput: ChartTrendInput | null = analysis ? toChartTrendInput(analysis) : null;

  return {
    analysis,
    indicators: analysis?.indicators || null,
    chartTrendInput,
    multiTimeframe,
    isLoading,
    isLive: analysis?.isLive || false,
    source: analysis?.source || 'none',
    lastUpdated,
    error,
    refresh
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎯 Quick indicator hooks for specific use cases
// ═══════════════════════════════════════════════════════════════════════════════

export function useRSI(symbol: string, interval: ChartInterval = '1h'): { rsi: number | null; isLoading: boolean } {
  const { indicators, isLoading } = useChartAPI(symbol, interval, false);
  return { rsi: indicators?.rsi || null, isLoading };
}

export function useEMAs(symbol: string, interval: ChartInterval = '1h'): { 
  ema9: number | null; 
  ema21: number | null; 
  ema50: number | null; 
  isLoading: boolean 
} {
  const { indicators, isLoading } = useChartAPI(symbol, interval, false);
  return {
    ema9: indicators?.ema9 || null,
    ema21: indicators?.ema21 || null,
    ema50: indicators?.ema50 || null,
    isLoading
  };
}

export function useMACD(symbol: string, interval: ChartInterval = '1h'): {
  macd: number | null;
  signal: number | null;
  histogram: number | null;
  isLoading: boolean;
} {
  const { indicators, isLoading } = useChartAPI(symbol, interval, false);
  return {
    macd: indicators?.macd.macd || null,
    signal: indicators?.macd.signal || null,
    histogram: indicators?.macd.histogram || null,
    isLoading
  };
}

export function useBollingerBands(symbol: string, interval: ChartInterval = '1h'): {
  upper: number | null;
  middle: number | null;
  lower: number | null;
  isLoading: boolean;
} {
  const { indicators, isLoading } = useChartAPI(symbol, interval, false);
  return {
    upper: indicators?.bollingerBands.upper || null,
    middle: indicators?.bollingerBands.middle || null,
    lower: indicators?.bollingerBands.lower || null,
    isLoading
  };
}

export function useTrendAnalysis(symbol: string): {
  trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL' | null;
  strength: number | null;
  confluence: MultiTimeframeInput['confluence'] | null;
  isLoading: boolean;
} {
  const { analysis, multiTimeframe, isLoading } = useChartAPI(symbol, '1h', true);
  return {
    trend: analysis?.trend || null,
    strength: analysis?.trendStrength || null,
    confluence: multiTimeframe?.confluence || null,
    isLoading
  };
}

export function useSupportResistance(symbol: string, interval: ChartInterval = '1h'): {
  support: number | null;
  resistance: number | null;
  isLoading: boolean;
} {
  const { analysis, isLoading } = useChartAPI(symbol, interval, false);
  return {
    support: analysis?.support || null,
    resistance: analysis?.resistance || null,
    isLoading
  };
}
