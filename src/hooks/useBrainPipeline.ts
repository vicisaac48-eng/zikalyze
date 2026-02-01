// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 useBrainPipeline — React Hook for Enhanced Zikalyze AI Brain Pipeline
// ═══════════════════════════════════════════════════════════════════════════════
// Integrates the complete brain pipeline with React state management
// Self-learns from live chart data and WebSocket livestream
// ICT/SMC analysis with multi-timeframe confluence
// Unified Brain - Most advanced crypto AI
// Only sends accurate information after strict verification!
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  ZikalyzeBrainPipeline, 
  SelfLearningBrainPipeline,
  UnifiedBrain,
  BrainPipelineOutput,
  SelfLearningOutput,
  UnifiedBrainOutput,
  AnalysisInput,
  ChartTrendInput,
  LivestreamUpdate,
  ICTSMCAnalysis,
  EmergenceState
} from '@/lib/zikalyze-brain';

interface UseBrainPipelineOptions {
  autoLearn?: boolean;  // Enable automatic learning from outcomes
  language?: string;    // Language for analysis output
  selfLearning?: boolean; // Enable self-learning mode
  unified?: boolean;    // Enable unified brain (default: true)
}

interface UseBrainPipelineReturn {
  // Pipeline output
  output: BrainPipelineOutput | SelfLearningOutput | null;
  // Unified Brain output
  unifiedOutput: UnifiedBrainOutput | null;
  // ICT/SMC Analysis
  ictAnalysis: ICTSMCAnalysis | null;
  hasICTSetup: boolean;
  // Processing state
  isProcessing: boolean;
  error: string | null;
  // Pipeline actions
  processInput: (input: AnalysisInput) => Promise<BrainPipelineOutput>;
  processWithLearning: (
    input: AnalysisInput, 
    chartData?: ChartTrendInput, 
    livestreamUpdate?: LivestreamUpdate
  ) => Promise<SelfLearningOutput>;
  // Unified Brain
  analyze: (
    input: AnalysisInput,
    chartData?: ChartTrendInput,
    livestreamUpdate?: LivestreamUpdate
  ) => Promise<UnifiedBrainOutput>;
  clearOutput: () => void;
  // Self-learning actions
  feedChartData: (symbol: string, chartData: ChartTrendInput) => void;
  feedLivestreamUpdate: (update: LivestreamUpdate) => void;
  verifyPatternOutcome: (symbol: string, timestamp: number, outcome: 'CORRECT' | 'INCORRECT') => void;
  // Learning and stats
  storageStats: { goodCount: number; badCount: number; learningCount: number };
  learningAdjustment: number;
  hasReliableData: (symbol: string) => boolean;
  // Processing metrics
  lastProcessingTime: number;
  averageProcessingTime: number;
  // Self-learning status
  isSelfLearningEnabled: boolean;
  isUnifiedBrainEnabled: boolean;
  // 🌐 Emergence — AI Brain Working Together as One
  getEmergenceState: () => EmergenceState | null;
  formatEmergenceStatus: () => string;
}

/**
 * React hook for the Zikalyze AI Brain Pipeline
 * 
 * Features:
 * - Active Crypto Direct Source (read, learn, adapt)
 * - AI Analyzer (human-readable processing)
 * - Attention AI Algorithm (filter, verify, calculate)
 * - Hidden data storage (good/bad separation)
 * - Double verification before output
 * - Self-learning from live chart data
 * - Self-learning from WebSocket livestream
 * - Only sends accurate information after strict verification
 * 
 * Usage:
 * ```tsx
 * const { output, processInput, processWithLearning, isProcessing } = useBrainPipeline({ selfLearning: true });
 * 
 * // Process with self-learning (recommended)
 * const result = await processWithLearning(
 *   { crypto: 'BTC', price: 65000, change: 2.5 },
 *   chartTrendData,  // from useChartTrendData hook
 *   livestreamUpdate // from WebSocket
 * );
 * 
 * // Basic processing (without self-learning)
 * const result = await processInput({
 *   crypto: 'BTC',
 *   price: 65000,
 *   change: 2.5,
 *   high24h: 66000,
 *   low24h: 64000,
 *   volume: 1000000000
 * });
 * ```
 */
export function useBrainPipeline(
  options: UseBrainPipelineOptions = {}
): UseBrainPipelineReturn {
  const { autoLearn = true, language = 'en', selfLearning = true, unified = true } = options;
  
  // Pipeline instances - singleton per hook instance
  const pipelineRef = useRef<ZikalyzeBrainPipeline | null>(null);
  const selfLearningPipelineRef = useRef<SelfLearningBrainPipeline | null>(null);
  const unifiedBrainRef = useRef<UnifiedBrain | null>(null);
  
  // State
  const [output, setOutput] = useState<BrainPipelineOutput | SelfLearningOutput | null>(null);
  const [unifiedOutput, setUnifiedOutput] = useState<UnifiedBrainOutput | null>(null);
  const [ictAnalysis, setIctAnalysis] = useState<ICTSMCAnalysis | null>(null);
  const [hasICTSetup, setHasICTSetup] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storageStats, setStorageStats] = useState({ goodCount: 0, badCount: 0, learningCount: 0 });
  const [learningAdjustment, setLearningAdjustment] = useState(0);
  const [lastProcessingTime, setLastProcessingTime] = useState(0);
  const [processingTimes, setProcessingTimes] = useState<number[]>([]);
  
  // Initialize pipeline on mount
  useEffect(() => {
    if (!pipelineRef.current) {
      pipelineRef.current = new ZikalyzeBrainPipeline();
      console.log('[Brain Pipeline] Initialized Zikalyze AI Brain Pipeline');
    }
    if (!selfLearningPipelineRef.current && selfLearning) {
      selfLearningPipelineRef.current = new SelfLearningBrainPipeline();
      console.log('[Brain Pipeline] Initialized Self-Learning Brain Pipeline');
    }
    if (!unifiedBrainRef.current && unified) {
      unifiedBrainRef.current = new UnifiedBrain();
      console.log('[Brain Pipeline] Initialized Unified Brain');
    }
  }, [selfLearning, unified]);

  /**
   * Process input through the brain pipeline (basic mode)
   */
  const processInput = useCallback(async (input: AnalysisInput): Promise<BrainPipelineOutput> => {
    if (!pipelineRef.current) {
      pipelineRef.current = new ZikalyzeBrainPipeline();
    }
    
    setIsProcessing(true);
    setError(null);
    
    const startTime = performance.now();
    
    try {
      // Add language to input if specified
      const enrichedInput: AnalysisInput = {
        ...input,
        language
      };
      
      // Process through the complete pipeline
      const result = pipelineRef.current.process(enrichedInput);
      
      // Calculate processing time
      const processingTime = performance.now() - startTime;
      setLastProcessingTime(processingTime);
      setProcessingTimes(prev => [...prev.slice(-19), processingTime]); // Keep last 20
      
      // Update state
      setOutput(result);
      setStorageStats(pipelineRef.current.getStorageStats());
      setLearningAdjustment(pipelineRef.current.getLearningAdjustment());
      
      // Log processing stats
      console.log(
        `[Brain Pipeline] Processed ${input.crypto} in ${result.processingTimeMs}ms | ` +
        `Bias: ${result.bias} | Confidence: ${(result.confidence * 100).toFixed(0)}% | ` +
        `Double Verified: ${result.doubleVerified ? '✓' : '✗'}`
      );
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Pipeline processing failed';
      setError(errorMessage);
      console.error('[Brain Pipeline] Error:', errorMessage);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [language]);

  /**
   * Process input with self-learning from live chart and livestream data
   * Only sends accurate information after strict verification
   * Includes ICT/SMC multi-timeframe analysis
   */
  const processWithLearning = useCallback(async (
    input: AnalysisInput,
    chartData?: ChartTrendInput,
    livestreamUpdate?: LivestreamUpdate
  ): Promise<SelfLearningOutput> => {
    if (!selfLearningPipelineRef.current) {
      selfLearningPipelineRef.current = new SelfLearningBrainPipeline();
    }
    
    setIsProcessing(true);
    setError(null);
    
    const startTime = performance.now();
    
    try {
      // Add language to input if specified
      const enrichedInput: AnalysisInput = {
        ...input,
        language
      };
      
      // Process with self-learning
      const result = selfLearningPipelineRef.current.processWithLearning(
        enrichedInput,
        chartData,
        livestreamUpdate
      );
      
      // Calculate processing time
      const processingTime = performance.now() - startTime;
      setLastProcessingTime(processingTime);
      setProcessingTimes(prev => [...prev.slice(-19), processingTime]);
      
      // Update state
      setOutput(result);
      setStorageStats(selfLearningPipelineRef.current.getStorageStats());
      setLearningAdjustment(selfLearningPipelineRef.current.getLearningAdjustment());
      
      // Update ICT analysis state
      if (result.ictAnalysis) {
        setIctAnalysis(result.ictAnalysis);
        setHasICTSetup(result.hasICTSetup);
      }
      
      // Log processing stats with learning and ICT info
      console.log(
        `[SelfLearning] Processed ${input.crypto} in ${result.processingTimeMs}ms | ` +
        `Bias: ${result.bias} | Accurate: ${result.isAccurate ? '✓' : '✗'} | ` +
        `ICT Setup: ${result.hasICTSetup ? '✓' : '✗'} | ` +
        `Chart Learn: ${result.learnedFromLiveChart ? '✓' : '✗'} | ` +
        `Score: ${(result.combinedLearningScore * 100).toFixed(0)}%`
      );
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Self-learning pipeline failed';
      setError(errorMessage);
      console.error('[SelfLearning] Error:', errorMessage);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [language]);

  /**
   * Clear current output
   */
  const clearOutput = useCallback(() => {
    setOutput(null);
    setUnifiedOutput(null);
    setError(null);
    setIctAnalysis(null);
    setHasICTSetup(false);
  }, []);

  /**
   * Run unified brain analysis - Most comprehensive analysis
   * Combines ETF, Macro, Sentiment, On-Chain, ICT/SMC, and Self-Learning
   */
  const analyze = useCallback(async (
    input: AnalysisInput,
    chartData?: ChartTrendInput,
    livestreamUpdate?: LivestreamUpdate
  ): Promise<UnifiedBrainOutput> => {
    if (!unifiedBrainRef.current) {
      unifiedBrainRef.current = new UnifiedBrain();
    }
    
    setIsProcessing(true);
    setError(null);
    
    const startTime = performance.now();
    
    try {
      // Add language to input if specified
      const enrichedInput: AnalysisInput = {
        ...input,
        language
      };
      
      // Run unified brain analysis
      const result = unifiedBrainRef.current.analyze(
        enrichedInput,
        chartData,
        livestreamUpdate
      );
      
      // Calculate processing time
      const processingTime = performance.now() - startTime;
      setLastProcessingTime(processingTime);
      setProcessingTimes(prev => [...prev.slice(-19), processingTime]);
      
      // Update state
      setUnifiedOutput(result);
      setStorageStats(unifiedBrainRef.current.getStorageStats());
      setLearningAdjustment(unifiedBrainRef.current.getLearningAdjustment());
      
      // Update ICT analysis state
      if (result.ictAnalysis) {
        setIctAnalysis(result.ictAnalysis);
        setHasICTSetup(result.hasICTSetup);
      }
      
      // Log unified brain stats
      console.log(
        `[UnifiedBrain] Processed ${input.crypto} in ${result.processingTimeMs}ms | ` +
        `Bias: ${result.bias} | Accuracy: ${result.accuracyScore.toFixed(0)}% | ` +
        `ICT: ${result.hasICTSetup ? '✓' : '✗'} | Macro: ${result.macroImpact} | ` +
        `Verified: ${result.isVerified ? '✓' : '✗'}`
      );
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unified brain analysis failed';
      setError(errorMessage);
      console.error('[UnifiedBrain] Error:', errorMessage);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [language]);

  /**
   * Feed chart data for continuous learning
   */
  const feedChartData = useCallback((symbol: string, chartData: ChartTrendInput) => {
    if (selfLearningPipelineRef.current) {
      selfLearningPipelineRef.current.feedChartData(symbol, chartData);
    }
    if (unifiedBrainRef.current) {
      unifiedBrainRef.current.feedChartData(symbol, chartData);
    }
  }, []);

  /**
   * Feed livestream update for continuous learning
   */
  const feedLivestreamUpdate = useCallback((update: LivestreamUpdate) => {
    if (selfLearningPipelineRef.current) {
      selfLearningPipelineRef.current.feedLivestreamUpdate(update);
    }
    if (unifiedBrainRef.current) {
      unifiedBrainRef.current.feedLivestreamUpdate(update);
    }
  }, []);

  /**
   * Verify pattern outcome for learning improvement
   */
  const verifyPatternOutcome = useCallback((
    symbol: string, 
    timestamp: number, 
    outcome: 'CORRECT' | 'INCORRECT'
  ) => {
    if (selfLearningPipelineRef.current) {
      selfLearningPipelineRef.current.verifyPatternOutcome(symbol, timestamp, outcome);
    }
    if (unifiedBrainRef.current) {
      unifiedBrainRef.current.verifyPatternOutcome(symbol, timestamp, outcome);
    }
  }, []);

  /**
   * Check if reliable data is available for a symbol
   */
  const hasReliableData = useCallback((symbol: string): boolean => {
    if (unifiedBrainRef.current) {
      return unifiedBrainRef.current.hasReliableData(symbol);
    }
    if (selfLearningPipelineRef.current) {
      return selfLearningPipelineRef.current.hasReliableData(symbol);
    }
    return false;
  }, []);

  /**
   * Get current emergence state - shows how AI components are working together
   */
  const getEmergenceState = useCallback((): EmergenceState | null => {
    if (unifiedBrainRef.current) {
      return unifiedBrainRef.current.getEmergenceState();
    }
    return null;
  }, []);

  /**
   * Format emergence status as human-readable string
   */
  const formatEmergenceStatus = useCallback((): string => {
    if (unifiedBrainRef.current) {
      return unifiedBrainRef.current.formatEmergenceStatus();
    }
    return '⏳ Emergence engine not initialized';
  }, []);

  /**
   * Calculate average processing time
   */
  const averageProcessingTime = processingTimes.length > 0
    ? processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length
    : 0;

  return {
    output,
    unifiedOutput,
    ictAnalysis,
    hasICTSetup,
    isProcessing,
    error,
    processInput,
    processWithLearning,
    analyze,
    clearOutput,
    feedChartData,
    feedLivestreamUpdate,
    verifyPatternOutcome,
    storageStats,
    learningAdjustment,
    hasReliableData,
    lastProcessingTime,
    averageProcessingTime,
    isSelfLearningEnabled: selfLearning,
    isUnifiedBrainEnabled: unified,
    // 🌐 Emergence - AI Brain Working Together as One
    getEmergenceState,
    formatEmergenceStatus
  };
}

export default useBrainPipeline;
