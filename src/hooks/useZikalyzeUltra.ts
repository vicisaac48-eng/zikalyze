// ═══════════════════════════════════════════════════════════════════════════════
// 🚀 useZikalyzeUltra — Hook for Zikalyze Ultra with Real-Time & Livestream
// ═══════════════════════════════════════════════════════════════════════════════
// Integrates the most advanced crypto analysis system with real-time WebSocket data
// Self-learning, adaptive ensemble, regime detection, quantum signal generation
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  ZikalyzeUltra, 
  UltraSignal, 
  UltraFeatures, 
  MarketRegime,
  getUltraInstance,
  analyzeWithUltra
} from '@/lib/zikalyze-brain/zikalyze-ultra';
import { ChartTrendInput } from '@/lib/zikalyze-brain/types';
import { LivestreamUpdate } from '@/lib/zikalyze-brain';

// Constants for configuration
const MAX_PRICE_HISTORY_LENGTH = 500;
const ONE_HOUR_MS = 3600000;

interface UseZikalyzeUltraOptions {
  /** Enable automatic analysis when chart data updates */
  autoAnalyze?: boolean;
  /** Minimum interval between auto-analyses in ms (default: 5000) */
  minAnalysisInterval?: number;
  /** Enable self-learning from price outcomes */
  enableLearning?: boolean;
}

interface UseZikalyzeUltraReturn {
  // Latest Ultra signal
  signal: UltraSignal | null;
  // Feature extraction results
  features: UltraFeatures | null;
  // Current market regime
  regime: MarketRegime | null;
  // Processing state
  isAnalyzing: boolean;
  // Error state
  error: string | null;
  // Manual analysis trigger
  analyze: (chartData: ChartTrendInput) => UltraSignal;
  // Feed livestream update for learning
  feedLivestreamUpdate: (update: LivestreamUpdate) => void;
  // Learn from actual outcome
  learnFromOutcome: (actualReturn: number) => void;
  // Get performance metrics
  getPerformanceMetrics: () => { 
    predictionCount: number; 
    avgConfidence: number;
    lastPrediction: number | null;
  };
  // Analysis stats
  analysisCount: number;
  lastAnalysisTime: number | null;
}

/**
 * React hook for Zikalyze Ultra with real-time and livestream integration
 * 
 * Features:
 * - Hyperdimensional feature extraction (100+ features)
 * - Adaptive ensemble system (self-evolving multi-model)
 * - Regime detection (volatile/trending/ranging)
 * - Quantum signal generation (ultra-precise signals)
 * - Self-learning memory system (learns from each analysis)
 * - Real-time WebSocket integration
 * 
 * Usage:
 * ```tsx
 * const { signal, analyze, feedLivestreamUpdate } = useZikalyzeUltra({ autoAnalyze: true });
 * 
 * // Feed real-time data
 * feedLivestreamUpdate({ symbol: 'BTC', price: 65000, ... });
 * 
 * // Manual analysis
 * const result = analyze(chartTrendData);
 * 
 * // Check signal
 * console.log(signal?.signal, signal?.confidence, signal?.direction);
 * ```
 */
export function useZikalyzeUltra(
  options: UseZikalyzeUltraOptions = {}
): UseZikalyzeUltraReturn {
  const { 
    autoAnalyze = false, 
    minAnalysisInterval = 5000,
    enableLearning = true 
  } = options;

  // Ultra instance (singleton for performance)
  const ultraRef = useRef<ZikalyzeUltra | null>(null);
  
  // State
  const [signal, setSignal] = useState<UltraSignal | null>(null);
  const [features, setFeatures] = useState<UltraFeatures | null>(null);
  const [regime, setRegime] = useState<MarketRegime | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisCount, setAnalysisCount] = useState(0);
  const [lastAnalysisTime, setLastAnalysisTime] = useState<number | null>(null);
  
  // Livestream price history for learning
  const priceHistoryRef = useRef<{ price: number; timestamp: number }[]>([]);
  const lastLivestreamRef = useRef<LivestreamUpdate | null>(null);

  // Initialize Ultra instance
  useEffect(() => {
    if (!ultraRef.current) {
      ultraRef.current = getUltraInstance();
      console.log('[ZikalyzeUltra] Initialized Ultra analyzer with real-time integration');
    }
  }, []);

  /**
   * Run Ultra analysis on chart data
   */
  const analyze = useCallback((chartData: ChartTrendInput): UltraSignal => {
    const startTime = Date.now();
    setIsAnalyzing(true);
    setError(null);

    try {
      if (!ultraRef.current) {
        ultraRef.current = getUltraInstance();
      }

      // Extract features
      const extractedFeatures = ultraRef.current.extractFeatures(chartData);
      setFeatures(extractedFeatures);

      // Detect regime
      const detectedRegime = ultraRef.current.detectRegime(extractedFeatures);
      setRegime(detectedRegime);

      // Generate signal
      const ultraSignal = ultraRef.current.generateSignal(chartData);
      setSignal(ultraSignal);

      // Update stats
      setAnalysisCount(prev => prev + 1);
      setLastAnalysisTime(Date.now());

      const processingTime = Date.now() - startTime;
      console.log(
        `[ZikalyzeUltra] Analysis complete in ${processingTime}ms | ` +
        `Signal: ${ultraSignal.signal} | Direction: ${ultraSignal.direction} | ` +
        `Confidence: ${(ultraSignal.confidence * 100).toFixed(1)}% | ` +
        `Regime: ${ultraSignal.regime}`
      );

      return ultraSignal;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ultra analysis failed';
      setError(errorMessage);
      console.error('[ZikalyzeUltra] Error:', errorMessage);
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  /**
   * Feed livestream update for continuous learning
   * Tracks price history to learn from outcomes
   */
  const feedLivestreamUpdate = useCallback((update: LivestreamUpdate) => {
    // Store in price history
    priceHistoryRef.current.push({
      price: update.price,
      timestamp: update.timestamp
    });

    // Keep last MAX_PRICE_HISTORY_LENGTH price points
    if (priceHistoryRef.current.length > MAX_PRICE_HISTORY_LENGTH) {
      priceHistoryRef.current.shift();
    }

    // Check if we can learn from previous prediction
    if (enableLearning && lastLivestreamRef.current && signal) {
      const previousPrice = lastLivestreamRef.current.price;
      const currentPrice = update.price;
      const actualReturn = (currentPrice - previousPrice) / previousPrice;

      // If significant time has passed (> 1 hour), learn from outcome
      const timeDiff = update.timestamp - lastLivestreamRef.current.timestamp;
      if (timeDiff >= ONE_HOUR_MS && ultraRef.current) {
        ultraRef.current.learn(actualReturn);
        console.log(
          `[ZikalyzeUltra] Learned from outcome: predicted ${signal.prediction.toFixed(4)}, ` +
          `actual ${actualReturn.toFixed(4)}`
        );
      }
    }

    lastLivestreamRef.current = update;
  }, [enableLearning, signal]);

  /**
   * Manual learning from actual outcome
   */
  const learnFromOutcome = useCallback((actualReturn: number) => {
    if (ultraRef.current && enableLearning) {
      ultraRef.current.learn(actualReturn);
      console.log(`[ZikalyzeUltra] Manual learning: actual return ${actualReturn.toFixed(4)}`);
    }
  }, [enableLearning]);

  /**
   * Get performance metrics
   */
  const getPerformanceMetrics = useCallback(() => {
    return {
      predictionCount: analysisCount,
      avgConfidence: signal?.confidence || 0,
      lastPrediction: signal?.prediction || null
    };
  }, [analysisCount, signal]);

  return {
    signal,
    features,
    regime,
    isAnalyzing,
    error,
    analyze,
    feedLivestreamUpdate,
    learnFromOutcome,
    getPerformanceMetrics,
    analysisCount,
    lastAnalysisTime
  };
}

export default useZikalyzeUltra;
