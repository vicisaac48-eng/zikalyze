// ═══════════════════════════════════════════════════════════════════════════════
// 📊 useRealTimeFearGreed — Real-time Fear & Greed Index for AI Brain Integration
// ═══════════════════════════════════════════════════════════════════════════════
// Provides real-time Fear & Greed index data with automatic refresh
// Used by AI brain for accurate sentiment-based analysis
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from "react";
import { safeFetch } from "@/lib/fetchWithRetry";

export interface FearGreedData {
  value: number;
  label: string;
  previousValue: number;
  previousLabel: string;
  timestamp: number;
  apiTimestamp: number; // Timestamp from API (when data was generated)
  isLive: boolean;
  source: string;
  // Derived metrics for AI analysis
  trend: 'RISING' | 'FALLING' | 'STABLE';
  extremeLevel: 'EXTREME_FEAR' | 'FEAR' | 'NEUTRAL' | 'GREED' | 'EXTREME_GREED';
  aiWeight: number; // 0-1 weight for AI decision making
  dataAgeHours: number; // How old the API data is in hours
}

const REFRESH_INTERVAL = 60000; // Refresh every 60 seconds
const API_TIMEOUT = 8000;

// Label to extreme level mapping
const labelToExtremeLevel = (value: number): FearGreedData['extremeLevel'] => {
  if (value <= 20) return 'EXTREME_FEAR';
  if (value <= 35) return 'FEAR';
  if (value <= 65) return 'NEUTRAL';
  if (value <= 80) return 'GREED';
  return 'EXTREME_GREED';
};

// Calculate AI weight based on Fear & Greed extremes
const calculateAIWeight = (value: number): number => {
  // Extreme values (very low or very high) should have more weight in AI decisions
  const distanceFromNeutral = Math.abs(value - 50);
  return Math.min(1, (distanceFromNeutral / 50) * 0.8 + 0.2);
};

// Determine trend based on current vs previous value
const determineTrend = (current: number, previous: number): FearGreedData['trend'] => {
  const diff = current - previous;
  if (diff > 3) return 'RISING';
  if (diff < -3) return 'FALLING';
  return 'STABLE';
};

/**
 * Fetch Fear & Greed Index from Alternative.me API
 */
async function fetchFearGreedIndex(): Promise<{
  value: number;
  label: string;
  previousValue: number;
  previousLabel: string;
  timestamp: number;
  previousTimestamp: number;
} | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    const response = await fetch('https://api.alternative.me/fng/?limit=2', {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) throw new Error('Fear & Greed API failed');
    
    const data = await response.json();
    
    if (data.data && data.data.length >= 2) {
      const currentTimestamp = parseInt(data.data[0].timestamp) * 1000; // Convert to milliseconds
      const previousTimestamp = parseInt(data.data[1].timestamp) * 1000;
      
      // Validate data freshness - ensure current data is less than 48 hours old
      const now = Date.now();
      const dataAge = now - currentTimestamp;
      const maxAge = 48 * 60 * 60 * 1000; // 48 hours in milliseconds
      
      if (dataAge > maxAge) {
        console.warn(`[FearGreed] Data is stale: ${(dataAge / (60 * 60 * 1000)).toFixed(1)} hours old`);
        throw new Error('Data too old - not real-time');
      }
      
      console.log(`[FearGreed] Real-time data verified: ${(dataAge / (60 * 60 * 1000)).toFixed(1)} hours old`);
      
      return {
        value: parseInt(data.data[0].value),
        label: data.data[0].value_classification,
        previousValue: parseInt(data.data[1].value),
        previousLabel: data.data[1].value_classification,
        timestamp: currentTimestamp,
        previousTimestamp: previousTimestamp
      };
    }
    throw new Error('Invalid data format');
  } catch (error) {
    console.warn('[FearGreed] API fetch failed:', error);
    return null;
  }
}

/**
 * Hook that provides real-time Fear & Greed index data.
 * Automatically refreshes and provides derived metrics for AI analysis.
 */
export function useRealTimeFearGreed(): FearGreedData {
  const [data, setData] = useState<FearGreedData>({
    value: 50,
    label: 'Neutral',
    previousValue: 50,
    previousLabel: 'Neutral',
    timestamp: Date.now(),
    apiTimestamp: Date.now(),
    isLive: false,
    source: 'initializing',
    trend: 'STABLE',
    extremeLevel: 'NEUTRAL',
    aiWeight: 0.2,
    dataAgeHours: 0
  });

  const mountedRef = useRef(true);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchRef = useRef<number>(0);

  const fetchData = useCallback(async () => {
    const now = Date.now();
    
    // Rate limit: don't fetch more than once per 30 seconds
    if (now - lastFetchRef.current < 30000) {
      return;
    }
    lastFetchRef.current = now;

    const result = await fetchFearGreedIndex();
    
    if (!mountedRef.current) return;
    
    if (result) {
      const dataAge = now - result.timestamp;
      const dataAgeHours = dataAge / (1000 * 60 * 60);
      
      const newData: FearGreedData = {
        value: result.value,
        label: result.label,
        previousValue: result.previousValue,
        previousLabel: result.previousLabel,
        timestamp: now, // When we fetched it
        apiTimestamp: result.timestamp, // When API generated it
        isLive: dataAgeHours < 24, // Consider live if less than 24 hours old
        source: 'Alternative.me',
        trend: determineTrend(result.value, result.previousValue),
        extremeLevel: labelToExtremeLevel(result.value),
        aiWeight: calculateAIWeight(result.value),
        dataAgeHours: dataAgeHours
      };
      
      setData(newData);
      console.log(`[FearGreed] LIVE: ${result.value} (${result.label}) | Age: ${dataAgeHours.toFixed(1)}h | Trend: ${newData.trend} | AI Weight: ${newData.aiWeight.toFixed(2)}`);
    } else {
      // Keep existing data but mark as potentially stale
      const age = (now - data.apiTimestamp) / (1000 * 60 * 60);
      setData(prev => ({
        ...prev,
        isLive: age < 24, // Still live if API data < 24 hours old
        source: 'cached',
        dataAgeHours: age
      }));
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    
    // Initial fetch
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

  return data;
}

/**
 * Get sentiment adjustment for AI analysis based on Fear & Greed
 * 
 * The modifier represents how Fear & Greed affects market analysis:
 * - At EXTREMES: Uses contrarian approach (extreme fear = bullish opportunity, extreme greed = bearish opportunity)
 * - At MODERATE levels: Describes current sentiment (fear = bearish mood, greed = bullish mood)
 * 
 * Returns a bias modifier (-0.15 to 0.15) where:
 *   Positive = Bullish bias adjustment
 *   Negative = Bearish bias adjustment
 */
export function getFearGreedBiasModifier(fearGreed: FearGreedData): {
  modifier: number;
  contrarian: boolean;
  description: string;
} {
  const value = fearGreed.value;
  
  // Contrarian signals at EXTREME levels (<=20 or >=80)
  if (value <= 20) {
    return {
      modifier: 0.15, // Bullish contrarian - buy when others are fearful
      contrarian: true,
      description: 'Extreme fear - potential buying opportunity (contrarian)'
    };
  }
  if (value >= 80) {
    return {
      modifier: -0.15, // Bearish contrarian - sell when others are greedy
      contrarian: true,
      description: 'Extreme greed - potential selling opportunity (contrarian)'
    };
  }
  
  // Sentiment-following at MODERATE levels - describes current market mood
  if (value <= 35) {
    return {
      modifier: -0.05, // Market is fearful, current sentiment is bearish
      contrarian: false,
      description: 'Fear - market sentiment is currently bearish'
    };
  }
  if (value >= 65) {
    return {
      modifier: 0.05, // Market is greedy, current sentiment is bullish
      contrarian: false,
      description: 'Greed - market sentiment is currently bullish'
    };
  }
  
  return {
    modifier: 0,
    contrarian: false,
    description: 'Neutral sentiment - no significant bias'
  };
}

export default useRealTimeFearGreed;
