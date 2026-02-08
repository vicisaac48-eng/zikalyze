// ═══════════════════════════════════════════════════════════════════════════════
// 🚀 EXAMPLE: Using ZIKALYZE ULTRA in the Application
// ═══════════════════════════════════════════════════════════════════════════════
// This example shows how to integrate ULTRA features into your crypto analysis
// ═══════════════════════════════════════════════════════════════════════════════

import { 
  analyzeWithUltra, 
  ZikalyzeUltra,
  type UltraSignal,
  type UltraFeatures 
} from '@/lib/zikalyze-brain';
import type { ChartTrendInput } from '@/lib/zikalyze-brain/types';

// ═══════════════════════════════════════════════════════════════════════════════
// EXAMPLE 1: Quick Signal Generation
// ═══════════════════════════════════════════════════════════════════════════════

export function quickUltraAnalysis(chartData: ChartTrendInput) {
  // One-line signal generation
  const signal = analyzeWithUltra(chartData);
  
  console.log('🎯 Ultra Signal:', signal.signal);
  console.log('📊 Direction:', signal.direction);
  console.log('💪 Confidence:', (signal.confidence * 100).toFixed(1) + '%');
  console.log('📈 Prediction:', signal.prediction.toFixed(3));
  console.log('🌊 Regime:', signal.regime);
  
  return signal;
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXAMPLE 2: Detailed Analysis with Risk Assessment
// ═══════════════════════════════════════════════════════════════════════════════

export function detailedUltraAnalysis(chartData: ChartTrendInput) {
  const ultra = new ZikalyzeUltra();
  const signal = ultra.generateSignal(chartData);
  
  // Extract detailed information
  const analysis = {
    // Trading signal
    action: signal.signal,
    direction: signal.direction,
    confidence: signal.confidence,
    
    // Risk management
    risk: {
      volatility: signal.riskMetrics.volatility,
      sharpe: signal.riskMetrics.sharpeEstimate,
      maxDrawdown: signal.riskMetrics.maxDrawdown,
    },
    
    // Market context
    regime: signal.regime,
    
    // Model insights
    models: signal.modelWeights,
    features: signal.featureImportance,
  };
  
  // Display recommendations
  if (signal.confidence >= 0.7) {
    console.log('✅ HIGH CONFIDENCE SIGNAL');
    console.log('Recommended action:', signal.signal);
  } else if (signal.confidence >= 0.5) {
    console.log('⚠️ MODERATE CONFIDENCE SIGNAL');
    console.log('Consider waiting for stronger confirmation');
  } else {
    console.log('❌ LOW CONFIDENCE SIGNAL');
    console.log('Market conditions are unclear, avoid trading');
  }
  
  return analysis;
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXAMPLE 3: Position Sizing Based on ULTRA Metrics
// ═══════════════════════════════════════════════════════════════════════════════

export function calculatePositionSize(
  chartData: ChartTrendInput,
  accountBalance: number,
  riskPercentage: number = 2
) {
  const signal = analyzeWithUltra(chartData);
  
  // Base risk amount (e.g., 2% of account)
  const baseRiskAmount = accountBalance * (riskPercentage / 100);
  
  // Adjust based on confidence
  const confidenceMultiplier = signal.confidence;
  
  // Adjust based on volatility (higher vol = smaller position)
  const volatilityMultiplier = 1 / (1 + signal.riskMetrics.volatility * 2);
  
  // Adjust based on Sharpe ratio (better risk/reward = larger position)
  const sharpeMultiplier = Math.max(0.5, Math.min(1.5, 1 + signal.riskMetrics.sharpeEstimate * 0.3));
  
  // Calculate final position size
  const adjustedRiskAmount = baseRiskAmount * confidenceMultiplier * volatilityMultiplier * sharpeMultiplier;
  
  // Calculate position size based on max drawdown
  const stopLossDistance = signal.riskMetrics.maxDrawdown;
  const positionSize = stopLossDistance > 0 ? adjustedRiskAmount / stopLossDistance : 0;
  
  return {
    positionSize,
    riskAmount: adjustedRiskAmount,
    stopLossDistance,
    confidence: signal.confidence,
    signal: signal.signal,
    reasoning: `Position sized for ${(signal.confidence * 100).toFixed(0)}% confidence, ${(signal.riskMetrics.volatility * 100).toFixed(1)}% volatility`,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXAMPLE 4: Combining ULTRA with Existing Brain Analysis
// ═══════════════════════════════════════════════════════════════════════════════

interface StandardBrainResult {
  bias: 'LONG' | 'SHORT' | 'NEUTRAL';
  confidence: number;
}

export async function comprehensiveAnalysis(
  chartData: ChartTrendInput,
  standardBrainResult: StandardBrainResult
) {
  // Get ULTRA signal
  const ultraSignal = analyzeWithUltra(chartData);
  
  // Check for confluence
  const standardBullish = standardBrainResult.bias === 'LONG';
  const ultraBullish = ultraSignal.direction === 'LONG';
  const confluence = standardBullish === ultraBullish;
  
  // Combine confidence scores
  const combinedConfidence = (standardBrainResult.confidence + ultraSignal.confidence) / 2;
  
  return {
    // Combined verdict
    verdict: confluence ? 'STRONG_CONFLUENCE' : 'DIVERGENCE',
    overallBias: confluence ? ultraSignal.direction : 'NEUTRAL',
    confidence: combinedConfidence,
    
    // Individual analyses
    standard: {
      bias: standardBrainResult.bias,
      confidence: standardBrainResult.confidence,
    },
    ultra: {
      signal: ultraSignal.signal,
      direction: ultraSignal.direction,
      confidence: ultraSignal.confidence,
      regime: ultraSignal.regime,
    },
    
    // Recommendation
    recommendation: confluence && combinedConfidence >= 0.7 
      ? 'HIGH PROBABILITY TRADE' 
      : confluence && combinedConfidence >= 0.5
      ? 'MODERATE PROBABILITY TRADE'
      : 'AVOID - UNCLEAR SIGNALS',
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXAMPLE 5: Feature Extraction for Custom Analysis
// ═══════════════════════════════════════════════════════════════════════════════

export function extractAdvancedFeatures(chartData: ChartTrendInput): UltraFeatures {
  const ultra = new ZikalyzeUltra();
  const features = ultra.extractFeatures(chartData);
  
  // Analyze specific features
  console.log('📊 Hurst Exponent:', features.hurstExponent.toFixed(4));
  if (features.hurstExponent > 0.6) {
    console.log('  → Trending behavior detected');
  } else if (features.hurstExponent < 0.4) {
    console.log('  → Mean-reverting behavior detected');
  } else {
    console.log('  → Random walk behavior');
  }
  
  console.log('🔬 Entropy:', features.entropy.toFixed(4));
  if (features.entropy < 2) {
    console.log('  → High predictability');
  } else if (features.entropy > 3) {
    console.log('  → Low predictability');
  }
  
  console.log('📈 Average RSI:', (features.rsi.reduce((a, b) => a + b, 0) / features.rsi.length).toFixed(1));
  
  return features;
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXAMPLE 6: Self-Learning Loop with Feedback
// ═══════════════════════════════════════════════════════════════════════════════

export class UltraLearningTracker {
  private ultra: ZikalyzeUltra;
  private pendingPredictions: Map<string, { signal: UltraSignal; startPrice: number }>;
  
  constructor() {
    this.ultra = new ZikalyzeUltra();
    this.pendingPredictions = new Map();
  }
  
  /**
   * Make a prediction and store it for later feedback
   */
  predict(symbol: string, chartData: ChartTrendInput): UltraSignal {
    const signal = this.ultra.generateSignal(chartData);
    const currentPrice = chartData.candles[chartData.candles.length - 1].close;
    
    this.pendingPredictions.set(symbol, {
      signal,
      startPrice: currentPrice,
    });
    
    return signal;
  }
  
  /**
   * Provide feedback when outcome is known
   */
  provideFeedback(symbol: string, currentPrice: number) {
    const pending = this.pendingPredictions.get(symbol);
    if (!pending) return;
    
    // Calculate actual return
    const actualReturn = (currentPrice - pending.startPrice) / pending.startPrice;
    
    // Normalize to [-1, 1] range (assuming max 10% move)
    const normalizedReturn = Math.max(-1, Math.min(1, actualReturn * 10));
    
    // Learn from this outcome
    this.ultra.learn(normalizedReturn);
    
    // Remove from pending
    this.pendingPredictions.delete(symbol);
    
    console.log('📚 Learning feedback provided for', symbol);
    console.log('   Predicted:', pending.signal.prediction.toFixed(3));
    console.log('   Actual:', normalizedReturn.toFixed(3));
  }
  
  /**
   * Get performance statistics
   */
  getPerformance() {
    return this.ultra.getRegimePerformance();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXAMPLE 7: React Component Integration Helper
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Helper to get signal color class for styling
 */
export function getUltraSignalColor(signal: UltraSignal['signal']): string {
  if (signal === 'STRONG_BUY') return 'text-primary';
  if (signal === 'BUY') return 'text-primary/80';
  if (signal === 'STRONG_SELL') return 'text-red-600';
  if (signal === 'SELL') return 'text-red-500';
  return 'text-gray-500';
}

/**
 * Example React component structure (use this as reference in your JSX/TSX files)
 * 
 * ```tsx
 * function UltraSignalCard({ signal }: { signal: UltraSignal }) {
 *   return (
 *     <div className="ultra-signal-card">
 *       <h3>ULTRA AI Signal</h3>
 *       
 *       <div className={getUltraSignalColor(signal.signal)}>
 *         <strong>{signal.signal}</strong>
 *       </div>
 *       
 *       <div className="metrics">
 *         <div>
 *           <span>Direction:</span>
 *           <strong>{signal.direction}</strong>
 *         </div>
 *         <div>
 *           <span>Confidence:</span>
 *           <strong>{(signal.confidence * 100).toFixed(1)}%</strong>
 *         </div>
 *         <div>
 *           <span>Regime:</span>
 *           <strong>{signal.regime}</strong>
 *         </div>
 *       </div>
 *       
 *       <div className="risk-metrics">
 *         <h4>Risk Metrics</h4>
 *         <div>Volatility: {(signal.riskMetrics.volatility * 100).toFixed(2)}%</div>
 *         <div>Sharpe: {signal.riskMetrics.sharpeEstimate.toFixed(2)}</div>
 *       </div>
 *       
 *       <div className="feature-importance">
 *         <h4>Key Drivers</h4>
 *         <div>Momentum: {(signal.featureImportance.momentum * 100).toFixed(0)}%</div>
 *         <div>Volatility: {(signal.featureImportance.volatility * 100).toFixed(0)}%</div>
 *         <div>Volume: {(signal.featureImportance.volume * 100).toFixed(0)}%</div>
 *         <div>Fractal: {(signal.featureImportance.fractal * 100).toFixed(0)}%</div>
 *       </div>
 *     </div>
 *   );
 * }
 * ```
 */

// ═══════════════════════════════════════════════════════════════════════════════
// USAGE IN YOUR APPLICATION
// ═══════════════════════════════════════════════════════════════════════════════

/*
// In your analyzer component:
import { analyzeWithUltra } from '@/lib/zikalyze-brain';

function YourAnalyzerComponent({ chartData }) {
  const ultraSignal = analyzeWithUltra(chartData);
  
  return (
    <div>
      <h2>ULTRA AI Analysis</h2>
      <p>Signal: {ultraSignal.signal}</p>
      <p>Confidence: {(ultraSignal.confidence * 100).toFixed(1)}%</p>
      <p>Regime: {ultraSignal.regime}</p>
    </div>
  );
}

// For position sizing:
import { calculatePositionSize } from './ultra-examples';

const { positionSize, signal } = calculatePositionSize(
  chartData,
  10000, // $10,000 account
  2      // 2% risk per trade
);

console.log(`Position size: $${positionSize.toFixed(2)}`);
console.log(`Signal: ${signal}`);
*/
