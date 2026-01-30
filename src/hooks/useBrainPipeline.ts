// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 useBrainPipeline — React Hook for Enhanced Zikalyze AI Brain Pipeline
// ═══════════════════════════════════════════════════════════════════════════════
// Integrates the complete brain pipeline with React state management
// All processing happens in a second with double verification!
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  ZikalyzeBrainPipeline, 
  BrainPipelineOutput,
  AnalysisInput 
} from '@/lib/zikalyze-brain';

interface UseBrainPipelineOptions {
  autoLearn?: boolean;  // Enable automatic learning from outcomes
  language?: string;    // Language for analysis output
}

interface UseBrainPipelineReturn {
  // Pipeline output
  output: BrainPipelineOutput | null;
  // Processing state
  isProcessing: boolean;
  error: string | null;
  // Pipeline actions
  processInput: (input: AnalysisInput) => Promise<BrainPipelineOutput>;
  clearOutput: () => void;
  // Learning and stats
  storageStats: { goodCount: number; badCount: number; learningCount: number };
  learningAdjustment: number;
  // Processing metrics
  lastProcessingTime: number;
  averageProcessingTime: number;
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
 * 
 * Usage:
 * ```tsx
 * const { output, processInput, isProcessing } = useBrainPipeline();
 * 
 * // Process crypto data
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
  const { autoLearn = true, language = 'en' } = options;
  
  // Pipeline instance - singleton per hook instance
  const pipelineRef = useRef<ZikalyzeBrainPipeline | null>(null);
  
  // State
  const [output, setOutput] = useState<BrainPipelineOutput | null>(null);
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
      console.log('[Brain Pipeline] Initialized Zikalyze AI Brain Pipeline v1.0');
    }
  }, []);

  /**
   * Process input through the brain pipeline
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
   * Clear current output
   */
  const clearOutput = useCallback(() => {
    setOutput(null);
    setError(null);
  }, []);

  /**
   * Calculate average processing time
   */
  const averageProcessingTime = processingTimes.length > 0
    ? processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length
    : 0;

  return {
    output,
    isProcessing,
    error,
    processInput,
    clearOutput,
    storageStats,
    learningAdjustment,
    lastProcessingTime,
    averageProcessingTime
  };
}

export default useBrainPipeline;
