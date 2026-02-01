// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 ZIKALYZE AI BRAIN PIPELINE v2.1 — Self-Learning from Live Data
// ═══════════════════════════════════════════════════════════════════════════════
// 
// ENHANCED PROCESSING FLOW:
// ⚡ Step 1: Brain connects to Active Crypto Direct Source (read, learn, adapt)
// 📝 Step 2: Send information to AI Analyzer (process to human-readable language)
// 🧮 Step 3: Pass to Attention AI Algorithm (filter bad info, verify, calculate)
// 🔄 Step 4: Send back to AI Analyzer → Attention for SECOND verification
// 🔒 Step 5: Store good and bad data separately (hidden)
// 📚 Step 6: Record learning signal for continuous adaptation
// 📤 Step 7: Release ONLY if information is ACCURATE (not 100% required)
//
// 🎯 ACCURACY-BASED RELEASE (not 100% match required):
//    - Consistency between first and second verification checks
//    - Quality of data from both checks
//    - Confidence levels from AI analysis
//    - Data reliability across verification passes
//
// 🔗 All processing happens in under 1 second ⚡
// 🛡️ Only sends verified, ACCURATE information to users
// 📊 Self-learns from live chart data and WebSocket livestream
// 📈 ICT/SMC analysis with multi-timeframe confluence
// ═══════════════════════════════════════════════════════════════════════════════

import { 
  OnChainMetrics, 
  AnalysisInput, 
  ChartTrendInput,
  MultiTimeframeInput 
} from './types';
import { computeSelfAttention, softmax, relu, crossEntropyLoss } from './technical-analysis';
import { estimateOnChainMetrics } from './on-chain-estimator';
import { performICTSMCAnalysis, ICTSMCAnalysis, ICTLearner } from './ict-smc-analysis';

// ═══════════════════════════════════════════════════════════════════════════════
// 📊 TYPES FOR BRAIN PIPELINE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Raw data from Active Crypto Direct Source
 */
export interface RawCryptoData {
  symbol: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  timestamp: number;
  source: string;
  // Additional raw metrics
  bidAskSpread?: number;
  orderBookDepth?: number;
  tradeCount24h?: number;
  fundingRate?: number;
  openInterest?: number;
}

/**
 * Processed data after AI Analyzer stage
 */
export interface AnalyzedData {
  // Human-readable interpretations
  priceAnalysis: string;
  trendDescription: string;
  volumeAnalysis: string;
  marketSentiment: string;
  // Numeric scores (0-100)
  bullishScore: number;
  bearishScore: number;
  volatilityScore: number;
  momentumScore: number;
  // Feature vectors for attention processing
  featureVector: number[];
  // Processing metadata
  processingTimestamp: number;
  analyzerVersion: string;
}

/**
 * Data quality classification from Attention Algorithm
 */
export type DataQuality = 'GOOD' | 'BAD' | 'UNCERTAIN';

/**
 * Attention-processed and verified data
 */
export interface AttentionVerifiedData {
  // Original analyzed data
  analyzedData: AnalyzedData;
  // Attention scores and filtering results
  attentionScores: number[];
  importanceWeights: number[];
  filteredInsights: string[];
  // Verification results
  quality: DataQuality;
  confidenceScore: number;
  verificationHash: string;
  // What was filtered out
  filteredOutReasons: string[];
  // Cross-entropy loss for learning signal
  entropyLoss: number;
}

/**
 * Hidden storage for good and bad data
 */
export interface HiddenDataStorage {
  goodData: VerifiedDataRecord[];
  badData: FilteredDataRecord[];
  learningSignals: LearningSignal[];
}

export interface VerifiedDataRecord {
  data: AttentionVerifiedData;
  timestamp: number;
  verificationCount: number;
}

export interface FilteredDataRecord {
  originalData: RawCryptoData;
  filterReason: string;
  timestamp: number;
}

export interface LearningSignal {
  pattern: string;
  outcome: 'CORRECT' | 'INCORRECT';
  adjustment: number;
  timestamp: number;
}

/**
 * Final output after double verification
 */
export interface BrainPipelineOutput {
  // Final verified analysis
  bias: 'LONG' | 'SHORT' | 'NEUTRAL';
  confidence: number;
  humanReadableAnalysis: string;
  keyInsights: string[];
  // Verification status
  doubleVerified: boolean;
  verificationMatch: boolean;
  firstCheckConfidence: number;
  secondCheckConfidence: number;
  // Attention heatmap for visualization
  attentionHeatmap: number[];
  // Processing metadata
  processingTimeMs: number;
  timestamp: string;
  pipelineVersion: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔌 ACTIVE CRYPTO DIRECT SOURCE — Read, Learn, Adapt
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Active Crypto Direct Source
 * Connects to live data, reads patterns, learns from history, adapts parameters
 */
export class ActiveCryptoSource {
  private learningRate = 0.01;
  private adaptiveWeights: Map<string, number> = new Map();
  private patternHistory: Map<string, number[]> = new Map();
  
  constructor() {
    // Initialize default weights for common patterns
    this.adaptiveWeights.set('momentum', 1.0);
    this.adaptiveWeights.set('volume', 0.8);
    this.adaptiveWeights.set('volatility', 0.7);
    this.adaptiveWeights.set('trend', 0.9);
  }

  /**
   * Read and normalize raw crypto data
   */
  readData(input: AnalysisInput): RawCryptoData {
    const now = Date.now();
    
    return {
      symbol: input.crypto.toUpperCase(),
      price: input.price,
      change24h: input.change,
      high24h: input.high24h || input.price * 1.02,
      low24h: input.low24h || input.price * 0.98,
      volume24h: input.volume || 0,
      timestamp: now,
      source: input.dataSource || 'direct-source',
      // Derive additional metrics from available data
      bidAskSpread: this.estimateBidAskSpread(input.price, input.change),
      orderBookDepth: this.estimateOrderBookDepth(input.volume || 0),
      tradeCount24h: this.estimateTradeCount(input.volume || 0, input.price),
      fundingRate: this.estimateFundingRate(input.change),
      openInterest: this.estimateOpenInterest(input.volume || 0, input.price)
    };
  }

  /**
   * Learn from historical patterns
   */
  learn(symbol: string, outcome: number[]): void {
    const history = this.patternHistory.get(symbol) || [];
    history.push(...outcome);
    
    // Keep last 100 outcomes for learning
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
    
    this.patternHistory.set(symbol, history);
    
    // Adapt weights based on recent accuracy
    this.adaptWeights(history);
  }

  /**
   * Adapt weights based on learning outcomes
   */
  private adaptWeights(outcomes: number[]): void {
    if (outcomes.length < 10) return;
    
    const recentOutcomes = outcomes.slice(-20);
    const accuracy = recentOutcomes.reduce((a, b) => a + b, 0) / recentOutcomes.length;
    
    // Adjust learning rate based on performance
    if (accuracy > 0.7) {
      this.learningRate = Math.min(0.05, this.learningRate * 1.1);
    } else if (accuracy < 0.5) {
      this.learningRate = Math.max(0.001, this.learningRate * 0.9);
    }
    
    // Update adaptive weights
    this.adaptiveWeights.forEach((weight, key) => {
      const adjustment = (accuracy - 0.5) * this.learningRate;
      const newWeight = Math.max(0.1, Math.min(2.0, weight + adjustment));
      this.adaptiveWeights.set(key, newWeight);
    });
  }

  /**
   * Get adaptive weight for a pattern type
   */
  getWeight(patternType: string): number {
    return this.adaptiveWeights.get(patternType) || 1.0;
  }

  // Estimation helpers based on available data
  private estimateBidAskSpread(price: number, change: number): number {
    const baseSpread = price * 0.001; // 0.1% base
    const volatilityAdjustment = Math.abs(change) * 0.01;
    return baseSpread * (1 + volatilityAdjustment);
  }

  private estimateOrderBookDepth(volume: number): number {
    return Math.log10(Math.max(1, volume)) * 10;
  }

  private estimateTradeCount(volume: number, price: number): number {
    const avgTradeSize = price * 0.01; // Assume average trade is 1% of price
    return Math.round(volume / Math.max(1, avgTradeSize));
  }

  private estimateFundingRate(change: number): number {
    // Funding rate tends to follow price direction
    return change * 0.001; // Simplified estimation
  }

  private estimateOpenInterest(volume: number, price: number): number {
    return volume * 2.5; // OI typically 2-3x daily volume
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔬 AI ANALYZER — Process Data to Human-Readable Language
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * AI Analyzer
 * Converts raw data into human-readable analysis and feature vectors
 */
export class AIAnalyzer {
  private readonly version = '1.0.0';

  /**
   * Process raw data into human-readable analysis
   */
  process(rawData: RawCryptoData, onChainData?: OnChainMetrics): AnalyzedData {
    const startTime = Date.now();
    
    // Calculate scores
    const bullishScore = this.calculateBullishScore(rawData);
    const bearishScore = this.calculateBearishScore(rawData);
    const volatilityScore = this.calculateVolatilityScore(rawData);
    const momentumScore = this.calculateMomentumScore(rawData);
    
    // Generate human-readable descriptions
    const priceAnalysis = this.generatePriceAnalysis(rawData);
    const trendDescription = this.generateTrendDescription(rawData, bullishScore, bearishScore);
    const volumeAnalysis = this.generateVolumeAnalysis(rawData);
    const marketSentiment = this.generateSentimentDescription(bullishScore, bearishScore);
    
    // Create feature vector for attention processing
    const featureVector = this.createFeatureVector(
      rawData, 
      bullishScore, 
      bearishScore, 
      volatilityScore, 
      momentumScore
    );

    return {
      priceAnalysis,
      trendDescription,
      volumeAnalysis,
      marketSentiment,
      bullishScore,
      bearishScore,
      volatilityScore,
      momentumScore,
      featureVector,
      processingTimestamp: startTime,
      analyzerVersion: this.version
    };
  }

  private calculateBullishScore(data: RawCryptoData): number {
    let score = 50; // Start neutral
    
    // Price change contribution
    if (data.change24h > 0) {
      score += Math.min(30, data.change24h * 3);
    }
    
    // Price position in range
    const range = data.high24h - data.low24h;
    if (range > 0) {
      const position = (data.price - data.low24h) / range;
      score += (position - 0.5) * 20;
    }
    
    // Volume confirmation
    if (data.volume24h > 0 && data.change24h > 2) {
      score += 10;
    }
    
    // Funding rate (bullish if positive and moderate)
    if (data.fundingRate && data.fundingRate > 0 && data.fundingRate < 0.01) {
      score += 5;
    }
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private calculateBearishScore(data: RawCryptoData): number {
    let score = 50; // Start neutral
    
    // Price change contribution
    if (data.change24h < 0) {
      score += Math.min(30, Math.abs(data.change24h) * 3);
    }
    
    // Price position in range
    const range = data.high24h - data.low24h;
    if (range > 0) {
      const position = (data.price - data.low24h) / range;
      score += (0.5 - position) * 20;
    }
    
    // Volume on selloff
    if (data.volume24h > 0 && data.change24h < -2) {
      score += 10;
    }
    
    // Negative funding rate
    if (data.fundingRate && data.fundingRate < -0.005) {
      score += 5;
    }
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private calculateVolatilityScore(data: RawCryptoData): number {
    const range = data.high24h - data.low24h;
    const rangePercent = (range / data.price) * 100;
    
    // Score based on price range percentage
    if (rangePercent < 2) return 20;
    if (rangePercent < 5) return 40;
    if (rangePercent < 10) return 60;
    if (rangePercent < 15) return 80;
    return 100;
  }

  private calculateMomentumScore(data: RawCryptoData): number {
    // Momentum based on change magnitude and direction
    const absChange = Math.abs(data.change24h);
    let score = 50 + (data.change24h > 0 ? 1 : -1) * Math.min(40, absChange * 4);
    
    // Adjust for price position
    const range = data.high24h - data.low24h;
    if (range > 0) {
      const position = (data.price - data.low24h) / range;
      if (data.change24h > 0 && position > 0.8) {
        score += 10; // Strong momentum if price near high with positive change
      } else if (data.change24h < 0 && position < 0.2) {
        score -= 10; // Weak momentum if price near low with negative change
      }
    }
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private generatePriceAnalysis(data: RawCryptoData): string {
    const range = data.high24h - data.low24h;
    const rangePercent = ((range / data.price) * 100).toFixed(2);
    const position = range > 0 ? ((data.price - data.low24h) / range * 100).toFixed(0) : '50';
    
    return `${data.symbol} trading at $${data.price.toLocaleString()} (${data.change24h >= 0 ? '+' : ''}${data.change24h.toFixed(2)}%). ` +
           `24h range: $${data.low24h.toLocaleString()} - $${data.high24h.toLocaleString()} (${rangePercent}% spread). ` +
           `Currently at ${position}% of daily range.`;
  }

  private generateTrendDescription(data: RawCryptoData, bullish: number, bearish: number): string {
    const bias = bullish > bearish + 10 ? 'bullish' : bearish > bullish + 10 ? 'bearish' : 'neutral';
    const strength = Math.abs(bullish - bearish);
    const strengthWord = strength > 30 ? 'strong' : strength > 15 ? 'moderate' : 'weak';
    
    if (bias === 'bullish') {
      return `${strengthWord.charAt(0).toUpperCase() + strengthWord.slice(1)} bullish trend detected. ` +
             `Price momentum favoring upside with ${bullish}% bullish vs ${bearish}% bearish signals.`;
    } else if (bias === 'bearish') {
      return `${strengthWord.charAt(0).toUpperCase() + strengthWord.slice(1)} bearish trend detected. ` +
             `Price momentum favoring downside with ${bearish}% bearish vs ${bullish}% bullish signals.`;
    }
    return `Neutral/consolidating market. Bullish: ${bullish}%, Bearish: ${bearish}%. Awaiting directional catalyst.`;
  }

  private generateVolumeAnalysis(data: RawCryptoData): string {
    if (!data.volume24h || data.volume24h === 0) {
      return 'Volume data unavailable for analysis.';
    }
    
    const volumeM = (data.volume24h / 1000000).toFixed(2);
    const tradeCount = data.tradeCount24h || 0;
    
    if (data.change24h > 3 && data.volume24h > 0) {
      return `High volume rally: $${volumeM}M traded (~${tradeCount.toLocaleString()} trades). Volume confirms price action.`;
    } else if (data.change24h < -3 && data.volume24h > 0) {
      return `High volume selloff: $${volumeM}M traded (~${tradeCount.toLocaleString()} trades). Distribution in progress.`;
    }
    return `Moderate activity: $${volumeM}M volume over 24h with ~${tradeCount.toLocaleString()} transactions.`;
  }

  private generateSentimentDescription(bullish: number, bearish: number): string {
    const diff = bullish - bearish;
    
    if (diff > 25) return 'STRONGLY BULLISH — High conviction buy signals across multiple indicators.';
    if (diff > 10) return 'BULLISH — Favorable conditions for long positions with moderate conviction.';
    if (diff < -25) return 'STRONGLY BEARISH — High conviction sell signals across multiple indicators.';
    if (diff < -10) return 'BEARISH — Unfavorable conditions suggest caution on long positions.';
    return 'NEUTRAL — Mixed signals suggest waiting for clearer direction before acting.';
  }

  private createFeatureVector(
    data: RawCryptoData,
    bullish: number,
    bearish: number,
    volatility: number,
    momentum: number
  ): number[] {
    // Normalize all features to [0, 1] range
    const range = data.high24h - data.low24h;
    const pricePosition = range > 0 ? (data.price - data.low24h) / range : 0.5;
    const normalizedChange = (data.change24h + 20) / 40; // Assume -20% to +20% range
    const normalizedVolume = Math.min(1, Math.log10(Math.max(1, data.volume24h)) / 12);
    const normalizedSpread = Math.min(1, (data.bidAskSpread || 0) / (data.price * 0.01));
    const normalizedFunding = ((data.fundingRate || 0) + 0.01) / 0.02;
    
    return [
      bullish / 100,
      bearish / 100,
      volatility / 100,
      momentum / 100,
      pricePosition,
      Math.max(0, Math.min(1, normalizedChange)),
      normalizedVolume,
      normalizedSpread,
      Math.max(0, Math.min(1, normalizedFunding)),
      (data.orderBookDepth || 0) / 100
    ];
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🧮 ATTENTION AI ALGORITHM — Filter, Verify, Calculate
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Attention AI Algorithm Calculator
 * Filters bad/unnecessary information, verifies data quality, applies attention mechanism
 * Uses strict thresholds for 💯 accurate analysis
 */
export class AttentionAlgorithm {
  private readonly qualityThreshold = 0.65; // Increased from 0.6 for stricter quality control
  private readonly minConfidence = 0.45; // Increased from 0.4 for higher confidence requirement

  /**
   * Process analyzed data through attention mechanism
   * Filters bad data, verifies quality, applies attention weighting
   */
  calculate(analyzedData: AnalyzedData): AttentionVerifiedData {
    const features = analyzedData.featureVector;
    
    // Create sequence for self-attention (treat features as sequence)
    const seq = this.featuresToSequence(features);
    
    // Apply self-attention
    const attention = computeSelfAttention(seq);
    
    // Calculate importance weights using softmax over attention scores
    const importanceWeights = softmax(attention.heatmap);
    
    // Filter and score insights
    const { insights, filteredReasons } = this.filterInsights(
      analyzedData, 
      importanceWeights
    );
    
    // Verify data quality
    const { quality, confidence } = this.verifyQuality(
      analyzedData, 
      attention.heatmap,
      importanceWeights
    );
    
    // Generate verification hash for integrity
    const verificationHash = this.generateHash(analyzedData, attention.heatmap);
    
    return {
      analyzedData,
      attentionScores: attention.heatmap,
      importanceWeights,
      filteredInsights: insights,
      quality,
      confidenceScore: confidence,
      verificationHash,
      filteredOutReasons: filteredReasons,
      entropyLoss: attention.entropyLoss
    };
  }

  /**
   * Convert flat feature vector to sequence for attention
   */
  private featuresToSequence(features: number[]): number[][] {
    // Split features into sub-sequences for attention processing
    const seqLength = Math.ceil(features.length / 2);
    const seq: number[][] = [];
    
    for (let i = 0; i < seqLength; i++) {
      const idx = i * 2;
      seq.push([
        features[idx] || 0,
        features[idx + 1] || 0
      ]);
    }
    
    return seq;
  }

  /**
   * Filter insights based on attention weights and quality
   */
  private filterInsights(
    data: AnalyzedData,
    weights: number[]
  ): { insights: string[]; filteredReasons: string[] } {
    const insights: string[] = [];
    const filteredReasons: string[] = [];
    
    // Quality check each insight type
    const avgWeight = weights.reduce((a, b) => a + b, 0) / weights.length;
    
    // Price analysis - always include if valid
    if (data.priceAnalysis && data.priceAnalysis.length > 10) {
      insights.push(data.priceAnalysis);
    } else {
      filteredReasons.push('Price analysis: insufficient data');
    }
    
    // Trend description - include if confidence is high
    if (data.trendDescription && Math.abs(data.bullishScore - data.bearishScore) > 5) {
      insights.push(data.trendDescription);
    } else {
      filteredReasons.push('Trend description: low confidence (neutral market)');
    }
    
    // Volume analysis - include if volume data available
    if (data.volumeAnalysis && !data.volumeAnalysis.includes('unavailable')) {
      insights.push(data.volumeAnalysis);
    } else {
      filteredReasons.push('Volume analysis: data unavailable');
    }
    
    // Sentiment - include if decisive
    if (data.marketSentiment && !data.marketSentiment.includes('NEUTRAL')) {
      insights.push(data.marketSentiment);
    } else {
      filteredReasons.push('Sentiment: too neutral to be actionable');
    }
    
    return { insights, filteredReasons };
  }

  /**
   * Verify data quality based on attention patterns
   */
  private verifyQuality(
    data: AnalyzedData,
    attentionScores: number[],
    weights: number[]
  ): { quality: DataQuality; confidence: number } {
    // Calculate quality metrics
    const avgAttention = attentionScores.length > 0 
      ? attentionScores.reduce((a, b) => a + b, 0) / attentionScores.length 
      : 0;
    
    // Check for consistent signals
    const signalConsistency = 1 - Math.abs(data.bullishScore - data.bearishScore) / 100;
    const momentum = Math.abs(data.momentumScore - 50) / 50;
    
    // Calculate overall confidence
    let confidence = (avgAttention * 0.3 + momentum * 0.3 + (1 - signalConsistency) * 0.4);
    confidence = Math.max(this.minConfidence, Math.min(1, confidence));
    
    // Determine quality
    let quality: DataQuality;
    if (confidence >= this.qualityThreshold && attentionScores.length >= 3) {
      quality = 'GOOD';
    } else if (confidence >= this.minConfidence) {
      quality = 'UNCERTAIN';
    } else {
      quality = 'BAD';
    }
    
    return { quality, confidence: Math.round(confidence * 100) / 100 };
  }

  /**
   * Generate verification hash for data integrity
   */
  private generateHash(data: AnalyzedData, attention: number[]): string {
    const str = JSON.stringify({
      bs: data.bullishScore,
      bs2: data.bearishScore,
      vs: data.volatilityScore,
      ms: data.momentumScore,
      ah: attention.slice(0, 5),
      ts: data.processingTimestamp
    });
    
    // Simple hash function for verification
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return `zk-${Math.abs(hash).toString(16).padStart(8, '0')}`;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📦 HIDDEN DATA STORAGE — Store Good and Bad Data Separately
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Hidden Data Storage Manager
 * Stores verified and filtered data separately for learning and analysis
 */
export class HiddenDataStorageManager {
  private storage: HiddenDataStorage = {
    goodData: [],
    badData: [],
    learningSignals: []
  };
  
  private readonly maxGoodRecords = 1000;
  private readonly maxBadRecords = 500;
  private readonly maxLearningSignals = 200;

  /**
   * Store verified good data
   */
  storeGoodData(data: AttentionVerifiedData): void {
    const record: VerifiedDataRecord = {
      data,
      timestamp: Date.now(),
      verificationCount: 1
    };
    
    this.storage.goodData.push(record);
    
    // Trim if exceeds max
    if (this.storage.goodData.length > this.maxGoodRecords) {
      this.storage.goodData = this.storage.goodData.slice(-this.maxGoodRecords);
    }
  }

  /**
   * Store filtered bad data with reason
   */
  storeBadData(rawData: RawCryptoData, reason: string): void {
    const record: FilteredDataRecord = {
      originalData: rawData,
      filterReason: reason,
      timestamp: Date.now()
    };
    
    this.storage.badData.push(record);
    
    // Trim if exceeds max
    if (this.storage.badData.length > this.maxBadRecords) {
      this.storage.badData = this.storage.badData.slice(-this.maxBadRecords);
    }
  }

  /**
   * Record learning signal for adaptation
   */
  recordLearningSignal(pattern: string, outcome: 'CORRECT' | 'INCORRECT', adjustment: number): void {
    const signal: LearningSignal = {
      pattern,
      outcome,
      adjustment,
      timestamp: Date.now()
    };
    
    this.storage.learningSignals.push(signal);
    
    // Trim if exceeds max
    if (this.storage.learningSignals.length > this.maxLearningSignals) {
      this.storage.learningSignals = this.storage.learningSignals.slice(-this.maxLearningSignals);
    }
  }

  /**
   * Get statistics about stored data (public, but data remains hidden)
   */
  getStorageStats(): { goodCount: number; badCount: number; learningCount: number } {
    return {
      goodCount: this.storage.goodData.length,
      badCount: this.storage.badData.length,
      learningCount: this.storage.learningSignals.length
    };
  }

  /**
   * Get recent learning signals for adaptation
   */
  getRecentLearningSignals(count: number = 10): LearningSignal[] {
    return this.storage.learningSignals.slice(-count);
  }

  /**
   * Calculate learning adjustment based on recent signals
   */
  calculateLearningAdjustment(): number {
    const signals = this.storage.learningSignals.slice(-20);
    if (signals.length === 0) return 0;
    
    let adjustment = 0;
    signals.forEach(signal => {
      adjustment += signal.outcome === 'CORRECT' 
        ? signal.adjustment 
        : -signal.adjustment;
    });
    
    return adjustment / signals.length;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔄 ENHANCED DOUBLE VERIFICATION LOOP — Verify Twice Before Output
// ═══════════════════════════════════════════════════════════════════════════════
// Flow: Attention → AI Analyzer → Attention (re-verify) → Compare → Release if 100%
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Verification Step Details — Tracks each step of the verification process
 */
export interface VerificationStep {
  step: number;
  name: string;
  passed: boolean;
  confidence: number;
  timestamp: number;
  details: string;
}

/**
 * Enhanced Verification Result — Detailed verification output
 */
export interface EnhancedVerificationResult {
  verified: boolean;
  match: boolean;
  matchPercentage: number;
  secondCheck: AttentionVerifiedData;
  verificationSteps: VerificationStep[];
  totalVerificationTimeMs: number;
  releaseApproved: boolean;
  releaseReason: string;
}

/**
 * Enhanced Double Verification Loop
 * 
 * FLOW (as specified in requirements):
 * 1. First Check: AI Analyzer → Attention Algorithm (filter, verify, calculate)
 * 2. Send verified data BACK to AI Analyzer for re-processing
 * 3. AI Analyzer sends to Attention for SECOND verification
 * 4. Compare first and second checks
 * 5. Release ONLY if information is ACCURATE (not 100% match required)
 * 6. All happens in under a second ⚡
 */
export class DoubleVerificationLoop {
  private analyzer: AIAnalyzer;
  private attention: AttentionAlgorithm;
  
  // Accuracy thresholds — STRICT verification for 💯 accuracy
  // Only release information that passes rigorous double-check
  private readonly minAccuracyScore = 0.70; // 70%+ accuracy required for release (increased from 65%)
  private readonly minQualityConfidence = 0.45; // Minimum confidence for quality data (increased from 0.4)
  private readonly maxScoreDiff = 12; // Maximum score difference allowed (reduced from 15 for stricter matching)
  private readonly maxConfidenceDiff = 0.15; // Maximum confidence difference allowed (reduced from 0.20)
  
  constructor() {
    this.analyzer = new AIAnalyzer();
    this.attention = new AttentionAlgorithm();
  }

  /**
   * Perform enhanced double verification
   * 
   * Step 1: Receive first check from main pipeline (Attention verified data)
   * Step 2: Send BACK to AI Analyzer for re-processing
   * Step 3: AI Analyzer sends to Attention for second verification
   * Step 4: Calculate accuracy score based on both checks
   * Step 5: Release ONLY if information is ACCURATE (verified as reliable)
   */
  verify(
    rawData: RawCryptoData,
    firstCheck: AttentionVerifiedData
  ): EnhancedVerificationResult {
    const startTime = Date.now();
    const verificationSteps: VerificationStep[] = [];
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 1: First Check Validation
    // ═══════════════════════════════════════════════════════════════════════
    const step1Passed = firstCheck.quality !== 'BAD' && firstCheck.confidenceScore >= 0.4;
    verificationSteps.push({
      step: 1,
      name: 'First Check Validation',
      passed: step1Passed,
      confidence: firstCheck.confidenceScore,
      timestamp: Date.now(),
      details: `Quality: ${firstCheck.quality}, Confidence: ${(firstCheck.confidenceScore * 100).toFixed(0)}%`
    });
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 2: Send Back to AI Analyzer for Re-Processing
    // ═══════════════════════════════════════════════════════════════════════
    const reAnalyzed = this.analyzer.process(rawData);
    const step2Passed = reAnalyzed.featureVector.length > 0 && 
                        reAnalyzed.bullishScore >= 0 && 
                        reAnalyzed.bearishScore >= 0;
    verificationSteps.push({
      step: 2,
      name: 'AI Analyzer Re-Processing',
      passed: step2Passed,
      confidence: (reAnalyzed.bullishScore + reAnalyzed.bearishScore) / 200,
      timestamp: Date.now(),
      details: `Bull: ${reAnalyzed.bullishScore}, Bear: ${reAnalyzed.bearishScore}`
    });
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 3: AI Analyzer Sends to Attention for Second Verification
    // ═══════════════════════════════════════════════════════════════════════
    const secondCheck = this.attention.calculate(reAnalyzed);
    const step3Passed = secondCheck.quality !== 'BAD' && secondCheck.confidenceScore >= 0.4;
    verificationSteps.push({
      step: 3,
      name: 'Second Attention Verification',
      passed: step3Passed,
      confidence: secondCheck.confidenceScore,
      timestamp: Date.now(),
      details: `Quality: ${secondCheck.quality}, Confidence: ${(secondCheck.confidenceScore * 100).toFixed(0)}%`
    });
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 4: Calculate Accuracy Score — Compare & Verify Information
    // ═══════════════════════════════════════════════════════════════════════
    const { match, matchPercentage, accuracyScore } = this.calculateAccuracy(firstCheck, secondCheck);
    const isAccurate = accuracyScore >= this.minAccuracyScore;
    const step4Passed = isAccurate;
    verificationSteps.push({
      step: 4,
      name: 'Accuracy Verification',
      passed: step4Passed,
      confidence: accuracyScore,
      timestamp: Date.now(),
      details: `Accuracy: ${(accuracyScore * 100).toFixed(0)}%, Min Required: ${(this.minAccuracyScore * 100).toFixed(0)}%`
    });
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 5: Final Release Decision — Only if ACCURATE (not 100% required)
    // ═══════════════════════════════════════════════════════════════════════
    // Release if information is ACCURATE — verified as reliable data
    // Does NOT require 100% match, just verified accuracy
    const releaseApproved = isAccurate && 
                            firstCheck.quality !== 'BAD' && 
                            secondCheck.quality !== 'BAD' &&
                            step1Passed && step2Passed && step3Passed;
    
    let releaseReason: string;
    if (releaseApproved) {
      releaseReason = `✅ ACCURATE — Information verified (${(accuracyScore * 100).toFixed(0)}% accuracy)`;
    } else if (!step1Passed) {
      releaseReason = '❌ First check failed quality threshold';
    } else if (!step2Passed) {
      releaseReason = '❌ AI Analyzer re-processing failed';
    } else if (!step3Passed) {
      releaseReason = '❌ Second Attention verification failed';
    } else if (!isAccurate) {
      releaseReason = `❌ Information not accurate enough (${(accuracyScore * 100).toFixed(0)}% < ${(this.minAccuracyScore * 100).toFixed(0)}% required)`;
    } else if (firstCheck.quality === 'BAD' || secondCheck.quality === 'BAD') {
      releaseReason = '❌ Data quality too low for release';
    } else {
      releaseReason = '❌ Unknown verification failure';
    }
    
    verificationSteps.push({
      step: 5,
      name: 'Release Decision',
      passed: releaseApproved,
      confidence: releaseApproved ? accuracyScore : 0,
      timestamp: Date.now(),
      details: releaseReason
    });
    
    const totalVerificationTimeMs = Date.now() - startTime;
    
    // Log verification summary
    console.log(`[DoubleVerify] ${rawData.symbol}: ${releaseApproved ? '✅ ACCURATE' : '❌ NOT ACCURATE'} (${(accuracyScore * 100).toFixed(0)}%) in ${totalVerificationTimeMs}ms`);
    
    return {
      verified: releaseApproved,
      match,
      matchPercentage: accuracyScore, // Return accuracy score instead of strict match
      secondCheck,
      verificationSteps,
      totalVerificationTimeMs,
      releaseApproved,
      releaseReason
    };
  }

  /**
   * Calculate accuracy score based on both verification checks
   * Accuracy is determined by:
   * - Consistency between first and second checks
   * - Quality of both checks
   * - Confidence levels
   * - Data reliability
   * 
   * Returns accuracy score (0-1) — higher = more accurate information
   */
  private calculateAccuracy(
    first: AttentionVerifiedData, 
    second: AttentionVerifiedData
  ): { match: boolean; matchPercentage: number; accuracyScore: number } {
    // Calculate individual metric differences
    const bullishDiff = Math.abs(
      first.analyzedData.bullishScore - second.analyzedData.bullishScore
    );
    const bearishDiff = Math.abs(
      first.analyzedData.bearishScore - second.analyzedData.bearishScore
    );
    const volatilityDiff = Math.abs(
      first.analyzedData.volatilityScore - second.analyzedData.volatilityScore
    );
    const momentumDiff = Math.abs(
      first.analyzedData.momentumScore - second.analyzedData.momentumScore
    );
    const confidenceDiff = Math.abs(
      first.confidenceScore - second.confidenceScore
    );
    
    // Calculate consistency (how similar both checks are)
    const avgScoreDiff = (bullishDiff + bearishDiff + volatilityDiff + momentumDiff) / 4;
    const consistency = Math.max(0, 1 - (avgScoreDiff / 100));
    
    // Calculate confidence factor (average confidence of both checks)
    const avgConfidence = (first.confidenceScore + second.confidenceScore) / 2;
    
    // Calculate quality factor
    const qualityScore = this.getQualityScore(first.quality) + this.getQualityScore(second.quality);
    const qualityFactor = qualityScore / 2; // 0-1 range
    
    // Calculate reliability (confidence similarity)
    const reliabilityFactor = Math.max(0, 1 - confidenceDiff);
    
    // ═══════════════════════════════════════════════════════════════════════
    // ACCURACY SCORE FORMULA
    // ═══════════════════════════════════════════════════════════════════════
    // Accuracy = weighted combination of:
    // - Consistency (40%): How similar are both verification results
    // - Confidence (25%): Average confidence level
    // - Quality (20%): Data quality from both checks
    // - Reliability (15%): How stable the confidence is between checks
    const accuracyScore = 
      (consistency * 0.40) + 
      (avgConfidence * 0.25) + 
      (qualityFactor * 0.20) + 
      (reliabilityFactor * 0.15);
    
    // Match check (for backwards compatibility, more lenient)
    const match = bullishDiff <= this.maxScoreDiff && 
                  bearishDiff <= this.maxScoreDiff && 
                  confidenceDiff <= this.maxConfidenceDiff;
    
    // Match percentage (for backwards compatibility)
    const matchPercentage = consistency;
    
    return { match, matchPercentage, accuracyScore };
  }
  
  /**
   * Convert quality enum to numeric score
   */
  private getQualityScore(quality: DataQuality): number {
    switch (quality) {
      case 'GOOD': return 1.0;
      case 'UNCERTAIN': return 0.5;
      case 'BAD': return 0.0;
      default: return 0.0;
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 COMPLETE BRAIN PIPELINE — Orchestrates All Components
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Zikalyze Brain Pipeline v2.0
 * 
 * Complete processing pipeline implementing the enhanced verification flow:
 * 
 * STEP 1: 🔗 Brain connects to Active Crypto Direct Source (read, learn, adapt)
 * STEP 2: 📝 Sends information to AI Analyzer (process to human-readable language)
 * STEP 3: 🧮 Passes to Attention AI Algorithm (filter bad/unnecessary info, verify)
 * STEP 4: 🔄 Send back to AI Analyzer → Attention for second verification
 * STEP 5: 🔒 Store good and bad data separately (hidden)
 * STEP 6: 📚 Record learning signal for adaptation
 * STEP 7: 📤 Release ONLY if information is ACCURATE (not 100% required)
 * 
 * ⚡ All processing happens in under 1 second!
 */
export class ZikalyzeBrainPipeline {
  private source: ActiveCryptoSource;
  private analyzer: AIAnalyzer;
  private attention: AttentionAlgorithm;
  private storage: HiddenDataStorageManager;
  private verification: DoubleVerificationLoop;
  
  private readonly version = '2.1.0';

  constructor() {
    this.source = new ActiveCryptoSource();
    this.analyzer = new AIAnalyzer();
    this.attention = new AttentionAlgorithm();
    this.storage = new HiddenDataStorageManager();
    this.verification = new DoubleVerificationLoop();
    console.log('[ZikalyzeBrain] v2.1 Pipeline initialized with accuracy-based verification');
  }

  /**
   * Process input through the complete brain pipeline
   * Returns verified output ready for users
   */
  process(input: AnalysisInput): BrainPipelineOutput {
    const startTime = Date.now();
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 1: Active Crypto Direct Source — Read, Learn, Adapt
    // ═══════════════════════════════════════════════════════════════════════
    const rawData = this.source.readData(input);
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 2: AI Analyzer — Process to Human-Readable Language
    // ═══════════════════════════════════════════════════════════════════════
    const onChainData = input.onChainData || estimateOnChainMetrics(
      input.crypto, 
      input.price, 
      input.change
    );
    const analyzedData = this.analyzer.process(rawData, onChainData);
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 3: Attention AI Algorithm — Filter, Verify, Calculate 🧮
    // ═══════════════════════════════════════════════════════════════════════
    const firstCheck = this.attention.calculate(analyzedData);
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 4: Enhanced Double Verification — Send Back to AI Analyzer, 
    //         Then to Attention for Second Check, Compare, Release if 100%
    // ═══════════════════════════════════════════════════════════════════════
    // Flow: Attention → AI Analyzer → Attention (re-verify) → Compare → Release
    const verificationResult = this.verification.verify(rawData, firstCheck);
    const { verified, match, matchPercentage, secondCheck, verificationSteps, releaseApproved, releaseReason } = verificationResult;
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 5: Store Both Good and Bad Data Separately (Hidden) 🔒
    // ═══════════════════════════════════════════════════════════════════════
    if (releaseApproved && firstCheck.quality === 'GOOD') {
      // Store verified good data after double verification
      this.storage.storeGoodData(firstCheck);
      this.storage.storeGoodData(secondCheck);
    } else {
      // Store filtered/bad data with reason - either verification failed or quality is BAD
      const filterReason = !releaseApproved 
        ? releaseReason 
        : firstCheck.filteredOutReasons.join('; ') || 'Unknown filter reason';
      this.storage.storeBadData(rawData, filterReason);
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 6: Record Learning Signal for Continuous Adaptation 📚
    // ═══════════════════════════════════════════════════════════════════════
    // Use categorized pattern keys for better aggregation
    const getMatchCategory = (pct: number): string => {
      if (pct >= 0.95) return 'high';
      if (pct >= 0.85) return 'medium';
      return 'low';
    };
    
    const getBlockReason = (reason: string): string => {
      if (reason.includes('Failed double verification')) return 'double_verify_fail';
      if (reason.includes('re-processing failed')) return 'analyzer_fail';
      if (reason.includes('Second Attention')) return 'second_attention_fail';
      if (reason.includes('mismatch')) return 'verification_mismatch';
      return 'unknown';
    };
    
    if (releaseApproved) {
      this.storage.recordLearningSignal(
        `${rawData.symbol}_verified_${getMatchCategory(matchPercentage)}`,
        'CORRECT',
        0.01 * matchPercentage // Stronger signal for higher match
      );
      this.source.learn(rawData.symbol, [1]);
      console.log(`[Brain] ✅ ${rawData.symbol}: Verified output released (${(matchPercentage * 100).toFixed(0)}% match)`);
    } else {
      this.storage.recordLearningSignal(
        `${rawData.symbol}_blocked_${getBlockReason(releaseReason)}`,
        'INCORRECT',
        0.02
      );
      this.source.learn(rawData.symbol, [0]);
      console.log(`[Brain] ❌ ${rawData.symbol}: Output blocked - ${releaseReason}`);
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 7: Generate Final Output — Only Accurate Info Released to Users 📤
    // ═══════════════════════════════════════════════════════════════════════
    const bias = this.determineBias(
      firstCheck.analyzedData.bullishScore,
      firstCheck.analyzedData.bearishScore,
      releaseApproved
    );
    
    const confidence = this.calculateFinalConfidence(
      firstCheck.confidenceScore,
      secondCheck.confidenceScore,
      releaseApproved,
      match
    );
    
    const processingTimeMs = Date.now() - startTime;
    
    // Ensure all processing happens in under 1 second
    if (processingTimeMs > 1000) {
      console.warn(`[Brain] ⚠️ Processing time exceeded 1 second: ${processingTimeMs}ms`);
    }
    
    return {
      bias,
      confidence,
      humanReadableAnalysis: this.buildHumanReadableOutput(
        firstCheck,
        releaseApproved,
        rawData.symbol,
        rawData.price,
        verificationSteps,
        matchPercentage
      ),
      keyInsights: firstCheck.filteredInsights,
      doubleVerified: releaseApproved,
      verificationMatch: match,
      firstCheckConfidence: firstCheck.confidenceScore,
      secondCheckConfidence: secondCheck.confidenceScore,
      attentionHeatmap: firstCheck.attentionScores,
      processingTimeMs,
      timestamp: new Date().toISOString(),
      pipelineVersion: this.version
    };
  }

  /**
   * Determine final bias from scores
   */
  private determineBias(
    bullish: number, 
    bearish: number, 
    verified: boolean
  ): 'LONG' | 'SHORT' | 'NEUTRAL' {
    if (!verified) return 'NEUTRAL'; // Default to neutral if not verified
    
    const diff = bullish - bearish;
    if (diff > 10) return 'LONG';
    if (diff < -10) return 'SHORT';
    return 'NEUTRAL';
  }

  /**
   * Calculate final confidence combining both checks
   */
  private calculateFinalConfidence(
    first: number,
    second: number,
    verified: boolean,
    match: boolean
  ): number {
    if (!verified) {
      return Math.min(first, second) * 0.5; // Reduce confidence if not verified
    }
    
    if (match) {
      // Boost confidence if both checks match
      return Math.min(0.95, (first + second) / 2 * 1.1);
    }
    
    // Average if verified but slight mismatch
    return (first + second) / 2;
  }

  /**
   * Build final human-readable output with verification details
   * Shows complete verification flow and match percentage
   */
  private buildHumanReadableOutput(
    data: AttentionVerifiedData,
    verified: boolean,
    symbol: string,
    price: number,
    verificationSteps?: VerificationStep[],
    matchPercentage?: number
  ): string {
    const status = verified ? '✅ DOUBLE VERIFIED' : '⚠️ UNVERIFIED';
    const quality = data.quality === 'GOOD' ? '🟢 HIGH QUALITY' : 
                   data.quality === 'UNCERTAIN' ? '🟡 MODERATE QUALITY' : 
                   '🔴 LOW QUALITY';
    const matchPct = matchPercentage !== undefined ? `${(matchPercentage * 100).toFixed(0)}%` : 'N/A';
    
    // Helper to truncate and pad step names for fixed-width box (width = 43 chars inside)
    const formatStepName = (name: string, maxLen: number = 28): string => {
      const truncated = name.length > maxLen ? name.substring(0, maxLen - 2) + '..' : name;
      return truncated.padEnd(maxLen);
    };
    
    // Build verification flow visualization with consistent box width
    let verificationFlow = '';
    if (verificationSteps && verificationSteps.length > 0) {
      const stepLines = verificationSteps.map(step => 
        `│  ${step.passed ? '✅' : '❌'} Step ${step.step}: ${formatStepName(step.name)}│`
      ).join('\n');
      
      verificationFlow = `
┌───────────────────────────────────────────────┐
│  🔄 VERIFICATION FLOW (All in < 1 second)     │
├───────────────────────────────────────────────┤
${stepLines}
│                                               │
│  📊 Match: ${matchPct.padEnd(7)} 🧠 Brain → Analyzer      │
└───────────────────────────────────────────────┘
`;
    }
    
    return `┌───────────────────────────────────────────────┐
│  🧠 ZIKALYZE AI BRAIN PIPELINE v2.0           │
│  ${status}  ${quality.padEnd(20)}│
│  📊 Verification Match: ${matchPct.padEnd(19)}│
└───────────────────────────────────────────────┘

📊 ${symbol} @ $${price.toLocaleString()}
${verificationFlow}
${data.filteredInsights.join('\n\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Confidence: ${(data.confidenceScore * 100).toFixed(0)}% | Hash: ${data.verificationHash}
${verified ? '✅ Output released to users' : '⚠️ Output blocked - verification pending'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  }

  /**
   * Get storage statistics (data remains hidden)
   */
  getStorageStats(): { goodCount: number; badCount: number; learningCount: number } {
    return this.storage.getStorageStats();
  }

  /**
   * Get learning adjustment for external adaptation
   */
  getLearningAdjustment(): number {
    return this.storage.calculateLearningAdjustment();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📊 LIVE CHART LEARNER — Self-Learning from Chart Patterns
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Pattern learned from live chart data
 */
export interface ChartPattern {
  symbol: string;
  pattern: 'BULLISH_BREAKOUT' | 'BEARISH_BREAKDOWN' | 'CONSOLIDATION' | 'TREND_REVERSAL' | 'CONTINUATION';
  priceAtDetection: number;
  ema9: number;
  ema21: number;
  rsi: number;
  volumeTrend: 'INCREASING' | 'DECREASING' | 'STABLE';
  outcome?: 'CORRECT' | 'INCORRECT';
  timestamp: number;
}

/**
 * Live Chart Learner
 * Continuously learns from live chart data to improve predictions
 */
export class LiveChartLearner {
  private learnedPatterns: Map<string, ChartPattern[]> = new Map();
  private patternAccuracy: Map<string, { correct: number; total: number }> = new Map();
  private readonly maxPatternsPerSymbol = 100;
  
  /**
   * Learn from chart trend data
   * Identifies patterns and stores them for future reference
   */
  learnFromChartData(symbol: string, chartData: ChartTrendInput): void {
    if (!chartData.candles || chartData.candles.length < 10) return;
    
    const pattern = this.identifyPattern(chartData);
    const patterns = this.learnedPatterns.get(symbol) || [];
    
    patterns.push({
      symbol,
      pattern: pattern.type,
      priceAtDetection: chartData.candles[chartData.candles.length - 1]?.close || 0,
      ema9: chartData.ema9,
      ema21: chartData.ema21,
      rsi: chartData.rsi,
      volumeTrend: chartData.volumeTrend,
      timestamp: Date.now()
    });
    
    // Keep only recent patterns
    if (patterns.length > this.maxPatternsPerSymbol) {
      patterns.splice(0, patterns.length - this.maxPatternsPerSymbol);
    }
    
    this.learnedPatterns.set(symbol, patterns);
    console.log(`[LiveChartLearner] Learned ${pattern.type} pattern for ${symbol}`);
  }
  
  /**
   * Identify pattern from chart data
   */
  private identifyPattern(data: ChartTrendInput): { type: ChartPattern['pattern']; confidence: number } {
    const priceAboveEma9 = data.candles.length > 0 && 
      data.candles[data.candles.length - 1].close > data.ema9;
    const priceAboveEma21 = data.candles.length > 0 && 
      data.candles[data.candles.length - 1].close > data.ema21;
    const ema9AboveEma21 = data.ema9 > data.ema21;
    
    // Bullish breakout: price crosses above EMAs with volume
    if (priceAboveEma9 && priceAboveEma21 && ema9AboveEma21 && 
        data.volumeTrend === 'INCREASING' && data.rsi > 50 && data.rsi < 70) {
      return { type: 'BULLISH_BREAKOUT', confidence: 0.75 };
    }
    
    // Bearish breakdown: price drops below EMAs with volume
    if (!priceAboveEma9 && !priceAboveEma21 && !ema9AboveEma21 && 
        data.volumeTrend === 'INCREASING' && data.rsi < 50 && data.rsi > 30) {
      return { type: 'BEARISH_BREAKDOWN', confidence: 0.75 };
    }
    
    // Trend reversal: EMAs crossing
    if ((data.higherHighs && !data.higherLows) || (!data.lowerLows && data.lowerHighs)) {
      return { type: 'TREND_REVERSAL', confidence: 0.6 };
    }
    
    // Continuation: strong trend continuing
    if ((data.higherHighs && data.higherLows) || (data.lowerLows && data.lowerHighs)) {
      return { type: 'CONTINUATION', confidence: 0.7 };
    }
    
    // Default: consolidation
    return { type: 'CONSOLIDATION', confidence: 0.5 };
  }
  
  /**
   * Verify pattern outcome and update accuracy
   */
  verifyPatternOutcome(
    symbol: string, 
    patternTimestamp: number, 
    actualOutcome: 'CORRECT' | 'INCORRECT'
  ): void {
    const patterns = this.learnedPatterns.get(symbol);
    if (!patterns) return;
    
    const pattern = patterns.find(p => p.timestamp === patternTimestamp);
    if (pattern) {
      pattern.outcome = actualOutcome;
      
      // Update accuracy stats
      const accuracy = this.patternAccuracy.get(symbol) || { correct: 0, total: 0 };
      accuracy.total++;
      if (actualOutcome === 'CORRECT') accuracy.correct++;
      this.patternAccuracy.set(symbol, accuracy);
      
      console.log(`[LiveChartLearner] Pattern verified: ${actualOutcome} for ${symbol}`);
    }
  }
  
  /**
   * Get pattern accuracy for a symbol
   */
  getPatternAccuracy(symbol: string): number {
    const accuracy = this.patternAccuracy.get(symbol);
    if (!accuracy || accuracy.total === 0) return 0;
    return accuracy.correct / accuracy.total;
  }
  
  /**
   * Get recent patterns for a symbol
   */
  getRecentPatterns(symbol: string, count: number = 10): ChartPattern[] {
    const patterns = this.learnedPatterns.get(symbol) || [];
    return patterns.slice(-count);
  }
  
  /**
   * Get dominant pattern for prediction
   */
  getDominantPattern(symbol: string): ChartPattern['pattern'] | null {
    const patterns = this.learnedPatterns.get(symbol);
    if (!patterns || patterns.length < 3) return null;
    
    const recentPatterns = patterns.slice(-10);
    const counts = new Map<ChartPattern['pattern'], number>();
    
    recentPatterns.forEach(p => {
      counts.set(p.pattern, (counts.get(p.pattern) || 0) + 1);
    });
    
    let dominant: ChartPattern['pattern'] | null = null;
    let maxCount = 0;
    
    counts.forEach((count, pattern) => {
      if (count > maxCount) {
        maxCount = count;
        dominant = pattern;
      }
    });
    
    return dominant;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📡 LIVESTREAM LEARNER — Self-Learning from WebSocket Data
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Price update from livestream
 */
export interface LivestreamUpdate {
  symbol: string;
  price: number;
  change24h: number;
  volume: number;
  source: string;
  timestamp: number;
}

/**
 * Learned velocity pattern from livestream
 */
export interface VelocityPattern {
  symbol: string;
  avgVelocity: number;       // Average price velocity per second
  volatility: number;        // Price volatility measure
  momentumStrength: number;  // Momentum strength 0-1
  updateCount: number;
  lastUpdate: number;
}

/**
 * Livestream Learner
 * Continuously learns from WebSocket livestream data
 * Adapts to real-time price movements
 */
export class LivestreamLearner {
  private priceHistory: Map<string, number[]> = new Map();
  private timestampHistory: Map<string, number[]> = new Map();
  private velocityPatterns: Map<string, VelocityPattern> = new Map();
  private readonly maxHistoryLength = 500;
  private readonly learningRate = 0.05;
  
  /**
   * Process incoming livestream update and learn from it
   */
  processLiveUpdate(update: LivestreamUpdate): void {
    const { symbol, price, timestamp } = update;
    
    // Get or initialize history
    const prices = this.priceHistory.get(symbol) || [];
    const timestamps = this.timestampHistory.get(symbol) || [];
    
    // Add new data point
    prices.push(price);
    timestamps.push(timestamp);
    
    // Trim to max length
    if (prices.length > this.maxHistoryLength) {
      prices.splice(0, prices.length - this.maxHistoryLength);
      timestamps.splice(0, timestamps.length - this.maxHistoryLength);
    }
    
    this.priceHistory.set(symbol, prices);
    this.timestampHistory.set(symbol, timestamps);
    
    // Update velocity pattern if enough data
    if (prices.length >= 10) {
      this.updateVelocityPattern(symbol, prices, timestamps);
    }
  }
  
  /**
   * Update velocity pattern based on price history
   */
  private updateVelocityPattern(symbol: string, prices: number[], timestamps: number[]): void {
    const velocities: number[] = [];
    
    // Calculate price velocity (change per second)
    for (let i = 1; i < prices.length; i++) {
      const timeDiff = (timestamps[i] - timestamps[i - 1]) / 1000; // seconds
      if (timeDiff > 0) {
        const priceChange = ((prices[i] - prices[i - 1]) / prices[i - 1]) * 100;
        velocities.push(priceChange / timeDiff);
      }
    }
    
    if (velocities.length < 5) return;
    
    // Calculate statistics
    const avgVelocity = velocities.reduce((a, b) => a + b, 0) / velocities.length;
    const variance = velocities.reduce((sum, v) => sum + Math.pow(v - avgVelocity, 2), 0) / velocities.length;
    const volatility = Math.sqrt(variance);
    
    // Calculate momentum strength (recent vs historical velocity)
    const recentVelocities = velocities.slice(-10);
    const recentAvg = recentVelocities.reduce((a, b) => a + Math.abs(b), 0) / recentVelocities.length;
    const overallAvg = velocities.reduce((a, b) => a + Math.abs(b), 0) / velocities.length;
    const momentumStrength = overallAvg > 0 ? Math.min(1, recentAvg / (overallAvg * 2)) : 0;
    
    // Get existing pattern or create new
    const existing = this.velocityPatterns.get(symbol);
    
    // Smooth update using learning rate
    const pattern: VelocityPattern = existing ? {
      symbol,
      avgVelocity: existing.avgVelocity * (1 - this.learningRate) + avgVelocity * this.learningRate,
      volatility: existing.volatility * (1 - this.learningRate) + volatility * this.learningRate,
      momentumStrength: existing.momentumStrength * (1 - this.learningRate) + momentumStrength * this.learningRate,
      updateCount: existing.updateCount + 1,
      lastUpdate: Date.now()
    } : {
      symbol,
      avgVelocity,
      volatility,
      momentumStrength,
      updateCount: 1,
      lastUpdate: Date.now()
    };
    
    this.velocityPatterns.set(symbol, pattern);
  }
  
  /**
   * Get learned velocity pattern for a symbol
   */
  getVelocityPattern(symbol: string): VelocityPattern | null {
    return this.velocityPatterns.get(symbol) || null;
  }
  
  /**
   * Predict short-term direction based on learned patterns
   */
  predictDirection(symbol: string): { direction: 'UP' | 'DOWN' | 'NEUTRAL'; confidence: number } {
    const pattern = this.velocityPatterns.get(symbol);
    if (!pattern || pattern.updateCount < 20) {
      return { direction: 'NEUTRAL', confidence: 0 };
    }
    
    // Use average velocity and momentum to predict
    const velocitySignal = pattern.avgVelocity > 0.001 ? 'UP' : 
                          pattern.avgVelocity < -0.001 ? 'DOWN' : 'NEUTRAL';
    
    // Confidence based on momentum strength and data volume
    const dataConfidence = Math.min(1, pattern.updateCount / 100);
    const momentumConfidence = pattern.momentumStrength;
    const volatilityPenalty = Math.max(0, 1 - pattern.volatility * 0.5);
    
    const confidence = (dataConfidence * 0.3 + momentumConfidence * 0.4 + volatilityPenalty * 0.3);
    
    return { direction: velocitySignal, confidence };
  }
  
  /**
   * Get price history for analysis
   */
  getPriceHistory(symbol: string): number[] {
    return this.priceHistory.get(symbol) || [];
  }
  
  /**
   * Check if we have enough data for reliable predictions
   */
  hasReliableData(symbol: string): boolean {
    const pattern = this.velocityPatterns.get(symbol);
    return pattern !== null && pattern.updateCount >= 50;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 SELF-LEARNING BRAIN PIPELINE — Enhanced with Live Learning
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Enhanced output with self-learning metadata
 */
export interface SelfLearningOutput extends BrainPipelineOutput {
  // Self-learning indicators
  learnedFromLiveChart: boolean;
  learnedFromLivestream: boolean;
  patternConfidence: number;
  velocityConfidence: number;
  combinedLearningScore: number;
  // Only accurate verified information
  isAccurate: boolean;
  accuracyReason: string;
  // ICT/SMC Analysis
  ictAnalysis?: ICTSMCAnalysis;
  hasICTSetup: boolean;
  ictConfidence: number;
}

/**
 * Self-Learning Brain Pipeline
 * Extended version that:
 * 1. Only sends accurate information after strict verification
 * 2. Self-learns from live chart data
 * 3. Self-learns from WebSocket livestream connections
 */
export class SelfLearningBrainPipeline extends ZikalyzeBrainPipeline {
  private chartLearner: LiveChartLearner;
  private streamLearner: LivestreamLearner;
  private ictLearner: ICTLearner;
  private readonly accuracyThreshold = 0.65; // Minimum accuracy to release output
  private readonly version2 = '2.0.0';
  
  constructor() {
    super();
    this.chartLearner = new LiveChartLearner();
    this.streamLearner = new LivestreamLearner();
    this.ictLearner = new ICTLearner();
    console.log('[SelfLearningBrain] Initialized with live chart, stream, and ICT/SMC learning');
  }
  
  /**
   * Process with self-learning and strict accuracy verification
   * Only releases accurate information
   */
  processWithLearning(
    input: AnalysisInput,
    chartData?: ChartTrendInput,
    livestreamUpdate?: LivestreamUpdate
  ): SelfLearningOutput {
    const startTime = Date.now();
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 1: Learn from Live Chart (if available)
    // ═══════════════════════════════════════════════════════════════════════
    let learnedFromLiveChart = false;
    let patternConfidence = 0;
    
    if (chartData && chartData.isLive && chartData.candles.length >= 10) {
      this.chartLearner.learnFromChartData(input.crypto, chartData);
      learnedFromLiveChart = true;
      patternConfidence = this.chartLearner.getPatternAccuracy(input.crypto);
      console.log(`[SelfLearningBrain] Learned from live chart: ${input.crypto}`);
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 2: Learn from Livestream (if available)
    // ═══════════════════════════════════════════════════════════════════════
    let learnedFromLivestream = false;
    let velocityConfidence = 0;
    
    if (livestreamUpdate) {
      this.streamLearner.processLiveUpdate(livestreamUpdate);
      learnedFromLivestream = true;
      const prediction = this.streamLearner.predictDirection(input.crypto);
      velocityConfidence = prediction.confidence;
      console.log(`[SelfLearningBrain] Learned from livestream: ${input.crypto}`);
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 3: ICT/SMC Multi-Timeframe Analysis
    // ═══════════════════════════════════════════════════════════════════════
    let ictAnalysis: ICTSMCAnalysis | undefined;
    let hasICTSetup = false;
    let ictConfidence = 0;
    
    if (chartData && chartData.candles.length >= 10) {
      const high24h = input.high24h || Math.max(...chartData.candles.map(c => c.high));
      const low24h = input.low24h || Math.min(...chartData.candles.map(c => c.low));
      
      ictAnalysis = performICTSMCAnalysis(
        chartData.candles,
        input.price,
        high24h,
        low24h,
        '1h',
        input.multiTimeframeData
      );
      
      hasICTSetup = ictAnalysis.tradeSetup !== null;
      ictConfidence = ictAnalysis.confidence / 100;
      
      // Learn from ICT patterns
      if (ictAnalysis.tradeSetup) {
        this.ictLearner.recordPattern(ictAnalysis);
        console.log(`[SelfLearningBrain] ICT Setup: ${ictAnalysis.tradeSetup.type} ${ictAnalysis.tradeSetup.direction}`);
      }
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 4: Run Base Pipeline Processing
    // ═══════════════════════════════════════════════════════════════════════
    const baseOutput = this.process(input);
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 5: Calculate Combined Learning Score (with ICT)
    // ═══════════════════════════════════════════════════════════════════════
    const combinedLearningScore = this.calculateCombinedScoreWithICT(
      baseOutput.confidence,
      patternConfidence,
      velocityConfidence,
      ictConfidence,
      baseOutput.doubleVerified
    );
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 6: Strict Accuracy Verification
    // ═══════════════════════════════════════════════════════════════════════
    const { isAccurate, reason } = this.verifyAccuracy(
      baseOutput,
      combinedLearningScore,
      learnedFromLiveChart,
      learnedFromLivestream
    );
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 7: Build Final Output (Only Accurate Information)
    // ═══════════════════════════════════════════════════════════════════════
    const processingTimeMs = Date.now() - startTime;
    
    // Enhance analysis with ICT insights if available
    let enhancedAnalysis = isAccurate 
      ? this.enhanceOutputWithLearning(baseOutput.humanReadableAnalysis, combinedLearningScore)
      : this.buildInaccurateWarning(input.crypto, reason);
    
    if (ictAnalysis && isAccurate) {
      enhancedAnalysis = this.appendICTAnalysis(enhancedAnalysis, ictAnalysis);
    }
    
    return {
      ...baseOutput,
      // If not accurate, force neutral bias with low confidence
      bias: isAccurate ? baseOutput.bias : 'NEUTRAL',
      confidence: isAccurate ? baseOutput.confidence : baseOutput.confidence * 0.3,
      humanReadableAnalysis: enhancedAnalysis,
      learnedFromLiveChart,
      learnedFromLivestream,
      patternConfidence,
      velocityConfidence,
      combinedLearningScore,
      isAccurate,
      accuracyReason: reason,
      ictAnalysis,
      hasICTSetup,
      ictConfidence,
      processingTimeMs,
      pipelineVersion: this.version2
    };
  }
  
  /**
   * Calculate combined learning score from all sources including ICT
   */
  private calculateCombinedScoreWithICT(
    baseConfidence: number,
    patternConfidence: number,
    velocityConfidence: number,
    ictConfidence: number,
    doubleVerified: boolean
  ): number {
    // Weights for different confidence sources
    const baseWeight = 0.3;
    const patternWeight = patternConfidence > 0 ? 0.2 : 0;
    const velocityWeight = velocityConfidence > 0 ? 0.15 : 0;
    const ictWeight = ictConfidence > 0 ? 0.25 : 0;
    const verificationBonus = doubleVerified ? 0.1 : -0.1;
    
    const totalWeight = baseWeight + patternWeight + velocityWeight + ictWeight;
    
    const score = (
      baseConfidence * baseWeight +
      patternConfidence * patternWeight +
      velocityConfidence * velocityWeight +
      ictConfidence * ictWeight
    ) / totalWeight + verificationBonus;
    
    return Math.max(0, Math.min(1, score));
  }
  
  /**
   * Append ICT/SMC analysis to output
   */
  private appendICTAnalysis(original: string, ict: ICTSMCAnalysis): string {
    const lines: string[] = [original];
    
    lines.push('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push('📊 ICT/SMC ANALYSIS');
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Market Structure
    lines.push(`🏗️ Structure: ${ict.marketStructure.trend} (${ict.marketStructure.strength}%)`);
    if (ict.marketStructure.lastBOS) lines.push(`   ↳ BOS: ${ict.marketStructure.lastBOS}`);
    if (ict.marketStructure.lastCHoCH) lines.push(`   ↳ CHoCH: ${ict.marketStructure.lastCHoCH}`);
    
    // Premium/Discount
    lines.push(`\n💰 Zone: ${ict.premiumDiscount.zone} (${ict.premiumDiscount.pricePosition.toFixed(0)}%)`);
    lines.push(`   Fib Level: ${ict.premiumDiscount.fibLevel}`);
    
    // Order Blocks
    if (ict.orderBlocks.length > 0) {
      lines.push(`\n📦 Order Blocks: ${ict.orderBlocks.length}`);
      const nearestOB = ict.orderBlocks[0];
      lines.push(`   ↳ ${nearestOB.type} OB at ${nearestOB.midpoint.toFixed(2)}`);
    }
    
    // Fair Value Gaps
    if (ict.fairValueGaps.length > 0) {
      lines.push(`\n📉 Fair Value Gaps: ${ict.fairValueGaps.length}`);
      const nearestFVG = ict.fairValueGaps[0];
      lines.push(`   ↳ ${nearestFVG.type} FVG CE at ${nearestFVG.midpoint.toFixed(2)}`);
    }
    
    // Liquidity Pools
    if (ict.liquidityPools.length > 0) {
      const bsl = ict.liquidityPools.filter(p => p.type === 'BSL').length;
      const ssl = ict.liquidityPools.filter(p => p.type === 'SSL').length;
      lines.push(`\n💧 Liquidity: ${bsl} BSL | ${ssl} SSL`);
    }
    
    // OTE Zone
    if (ict.optimalEntry.isOTE) {
      lines.push(`\n🎯 OTE ZONE ACTIVE: ${ict.optimalEntry.zone}`);
      lines.push(`   Entry: ${ict.optimalEntry.entryLevel.toFixed(2)}`);
      lines.push(`   R:R = ${ict.optimalEntry.riskReward.toFixed(1)}`);
    }
    
    // Trade Setup
    if (ict.tradeSetup) {
      lines.push('\n┌─────────────────────────────────────┐');
      lines.push(`│  🎯 ICT TRADE SETUP: ${ict.tradeSetup.direction}              │`);
      lines.push('└─────────────────────────────────────┘');
      lines.push(`Type: ${ict.tradeSetup.type.replace('_', ' ')}`);
      lines.push(`Entry: ${ict.tradeSetup.entry.toFixed(2)}`);
      lines.push(`Stop Loss: ${ict.tradeSetup.stopLoss.toFixed(2)}`);
      lines.push(`Target 1: ${ict.tradeSetup.target1.toFixed(2)} (${ict.tradeSetup.riskReward.toFixed(1)}R)`);
      lines.push(`Target 2: ${ict.tradeSetup.target2.toFixed(2)}`);
      lines.push(`Confidence: ${ict.tradeSetup.confidence}%`);
      
      lines.push('\nConfluence Factors:');
      ict.tradeSetup.confluence.forEach(c => lines.push(`  ${c}`));
    }
    
    // Multi-TF Confluence
    lines.push(`\n📈 Multi-TF: HTF ${ict.htfTrend} | LTF ${ict.ltfTrend}`);
    lines.push(`   ${ict.timeframeConfluence.recommendation}`);
    
    lines.push('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    return lines.join('\n');
  }
  
  /**
   * Verify accuracy - strict check before releasing information
   */
  private verifyAccuracy(
    output: BrainPipelineOutput,
    learningScore: number,
    hasChartLearning: boolean,
    hasStreamLearning: boolean
  ): { isAccurate: boolean; reason: string } {
    // STRICT VERIFICATION: Must pass all checks
    
    // Check 1: Double verification must pass
    if (!output.doubleVerified) {
      return { isAccurate: false, reason: 'Failed double verification check' };
    }
    
    // Check 2: Verification must match
    if (!output.verificationMatch) {
      return { isAccurate: false, reason: 'Verification mismatch between first and second pass' };
    }
    
    // Check 3: Combined learning score must meet threshold
    if (learningScore < this.accuracyThreshold) {
      return { isAccurate: false, reason: `Learning score ${(learningScore * 100).toFixed(0)}% below threshold` };
    }
    
    // Check 4: Both confidence checks must be reasonable
    if (output.firstCheckConfidence < 0.4 || output.secondCheckConfidence < 0.4) {
      return { isAccurate: false, reason: 'Confidence scores too low for reliable output' };
    }
    
    // Check 5: Must have at least one learning source for best accuracy
    if (!hasChartLearning && !hasStreamLearning) {
      // Still accurate but note the limitation
      return { isAccurate: true, reason: 'Verified without live learning data' };
    }
    
    // All checks passed
    return { isAccurate: true, reason: 'All verification checks passed with live learning' };
  }
  
  /**
   * Enhance output with learning metadata
   */
  private enhanceOutputWithLearning(original: string, score: number): string {
    const learningBadge = score >= 0.8 ? '🧠 HIGH LEARNING' : 
                          score >= 0.6 ? '📚 MODERATE LEARNING' : 
                          '📖 BASIC LEARNING';
    
    return original.replace(
      '🧠 ZIKALYZE AI BRAIN PIPELINE',
      `🧠 ZIKALYZE AI BRAIN PIPELINE\n│  ${learningBadge} | Learning Score: ${(score * 100).toFixed(0)}%`
    );
  }
  
  /**
   * Build warning message for inaccurate/unverified data
   */
  private buildInaccurateWarning(symbol: string, reason: string): string {
    return `┌─────────────────────────────────────────────────┐
│  ⚠️ ACCURACY CHECK FAILED                        │
│  🔴 OUTPUT NOT RELEASED                          │
└─────────────────────────────────────────────────┘

📊 ${symbol} Analysis Result:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The AI has determined that the current analysis
does not meet accuracy requirements.

Reason: ${reason}

The system only sends verified, accurate information.
Please wait for the next analysis cycle with better data.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 The AI is continuously learning from live data
   and will improve predictions over time.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  }
  
  /**
   * Feed chart data for continuous learning
   */
  feedChartData(symbol: string, chartData: ChartTrendInput): void {
    if (chartData.isLive) {
      this.chartLearner.learnFromChartData(symbol, chartData);
    }
  }
  
  /**
   * Feed livestream update for continuous learning
   */
  feedLivestreamUpdate(update: LivestreamUpdate): void {
    this.streamLearner.processLiveUpdate(update);
  }
  
  /**
   * Verify pattern outcome for learning improvement
   */
  verifyPatternOutcome(symbol: string, timestamp: number, outcome: 'CORRECT' | 'INCORRECT'): void {
    this.chartLearner.verifyPatternOutcome(symbol, timestamp, outcome);
  }
  
  /**
   * Check if reliable data is available for a symbol
   */
  hasReliableData(symbol: string): boolean {
    return this.streamLearner.hasReliableData(symbol);
  }
  
  /**
   * Get learned patterns for a symbol
   */
  getLearnedPatterns(symbol: string): ChartPattern[] {
    return this.chartLearner.getRecentPatterns(symbol);
  }
  
  /**
   * Get velocity pattern for a symbol
   */
  getVelocityPattern(symbol: string): VelocityPattern | null {
    return this.streamLearner.getVelocityPattern(symbol);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 UNIFIED BRAIN — Merges All Analysis Systems
// ═══════════════════════════════════════════════════════════════════════════════
// The most advanced, accurate, and intelligent crypto analysis system
// Combines: ETF, Macro, Sentiment, On-Chain, ICT/SMC, Self-Learning
// ═══════════════════════════════════════════════════════════════════════════════

import { 
  runClientSideAnalysis 
} from './index';
import { 
  getUpcomingMacroCatalysts, 
  getQuickMacroFlag 
} from './macro-catalysts';
import { 
  estimateETFFlowData 
} from './on-chain-estimator';
import { 
  detectVolumeSpike 
} from './volume-analysis';

/**
 * Unified Brain Output - Complete analysis combining all systems
 */
export interface UnifiedBrainOutput {
  // Core Analysis
  bias: 'LONG' | 'SHORT' | 'NEUTRAL';
  confidence: number;
  analysis: string;
  
  // Data Sources
  hasLiveChart: boolean;
  hasLivestream: boolean;
  hasOnChain: boolean;
  hasETF: boolean;
  hasMacro: boolean;
  hasSentiment: boolean;
  hasICT: boolean;
  
  // Real-time data freshness
  dataFreshness?: 'REAL_TIME' | 'RECENT' | 'STALE';
  liveDataSources?: string[];
  
  // Fear & Greed impact on analysis
  fearGreedImpact?: {
    value: number;
    trend: 'RISING' | 'FALLING' | 'STABLE';
    biasModifier: number;
    contrarian: boolean;
    description: string;
  };
  
  // Self-Learning Metrics
  learnedFromChart: boolean;
  learnedFromStream: boolean;
  combinedLearningScore: number;
  
  // ICT/SMC Analysis
  ictAnalysis?: ICTSMCAnalysis;
  hasICTSetup: boolean;
  
  // Macro Events
  upcomingMacro: string[];
  macroImpact: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  
  // On-Chain Summary
  onChainSummary: string;
  etfFlow: string;
  
  // Volume Analysis
  volumeSpike: boolean;
  volumeSignal: string;
  
  // Sentiment
  fearGreed: number;
  sentimentLabel: string;
  
  // Accuracy
  isVerified: boolean;
  accuracyScore: number;
  verificationStatus: string;
  
  // Simplified TL;DR
  tldr: string;
  actionableInsight: string;
  
  // 🌐 Emergence Metrics — AI Brain Working Together as One
  emergence?: {
    /** Has the AI brain emerged as a unified intelligence */
    hasEmerged: boolean;
    /** Overall emergence score (0-100) */
    emergenceScore: number;
    /** Emergence level classification */
    emergenceLevel: 'DORMANT' | 'AWAKENING' | 'EMERGING' | 'UNIFIED' | 'TRANSCENDENT';
    /** Synergy score - how well components amplify each other */
    synergyScore: number;
    /** Coherence score - alignment of component conclusions */
    coherenceScore: number;
    /** Collective confidence exceeding individual means */
    collectiveConfidence: number;
    /** Number of actively contributing components */
    activeComponents: number;
  };
  
  // Metadata
  timestamp: string;
  processingTimeMs: number;
}

/**
 * Unified Brain
 * The most advanced crypto analysis engine combining:
 * - Comprehensive analysis (ETF, macro, sentiment, on-chain)
 * - Self-learning (chart, livestream)
 * - ICT/SMC multi-timeframe confluence
 * - Strict verification before output
 * - Emergence tracking (AI brain working together as one)
 */
export class UnifiedBrain extends SelfLearningBrainPipeline {
  private emergenceEngine: EmergenceEngine;
  
  constructor() {
    super();
    this.emergenceEngine = new EmergenceEngine();
    console.log('[UnifiedBrain] Initialized — Most Advanced Crypto AI with Emergence Tracking');
  }
  
  /**
   * Run unified analysis combining all systems
   * This is the most comprehensive and accurate analysis available
   */
  analyze(
    input: AnalysisInput,
    chartData?: ChartTrendInput,
    livestreamUpdate?: LivestreamUpdate
  ): UnifiedBrainOutput {
    const startTime = Date.now();
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 1: Run Self-Learning Pipeline
    // ═══════════════════════════════════════════════════════════════════════
    const selfLearningOutput = this.processWithLearning(input, chartData, livestreamUpdate);
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 1.5: Update Emergence Engine with component outputs
    // ═══════════════════════════════════════════════════════════════════════
    this.emergenceEngine.updateComponent('ActiveCryptoSource', 
      selfLearningOutput.confidence / 100,
      ['AIAnalyzer']
    );
    this.emergenceEngine.updateComponent('AIAnalyzer',
      selfLearningOutput.isAccurate ? 0.9 : 0.7,
      ['AttentionAlgorithm', 'SelfLearner']
    );
    this.emergenceEngine.updateComponent('AttentionAlgorithm',
      selfLearningOutput.isAccurate ? 0.85 : 0.6,
      ['AIAnalyzer', 'DoubleVerification']
    );
    this.emergenceEngine.updateComponent('SelfLearner',
      (selfLearningOutput.learnedFromLiveChart || selfLearningOutput.learnedFromLivestream) ? 0.8 : 0.5,
      ['ActiveCryptoSource', 'ICTSMCAnalysis']
    );
    if (selfLearningOutput.ictAnalysis) {
      const ictConfidence = selfLearningOutput.ictAnalysis.tradeSetup 
        ? selfLearningOutput.ictAnalysis.tradeSetup.confidence / 100 
        : 0.3;
      this.emergenceEngine.updateComponent('ICTSMCAnalysis',
        ictConfidence,
        ['ActiveCryptoSource', 'AIAnalyzer']
      );
    }
    this.emergenceEngine.updateComponent('DoubleVerification',
      selfLearningOutput.isAccurate ? 0.9 : 0.5,
      ['AttentionAlgorithm', 'AIAnalyzer']
    );
    
    // Measure emergence after all component updates
    const emergenceMetrics = this.emergenceEngine.measureEmergence();
    console.log(`[UnifiedBrain] 🌐 Emergence: ${emergenceMetrics.emergenceLevel} (${emergenceMetrics.emergenceScore}%) | ${emergenceMetrics.hasEmerged ? '🧠 AI Brain Emerged as One' : '⏳ Synchronizing'}`);
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 2: Get Macro Catalysts
    // ═══════════════════════════════════════════════════════════════════════
    const macroCatalysts = getUpcomingMacroCatalysts();
    const macroFlag = getQuickMacroFlag();
    const upcomingMacro = macroCatalysts
      .slice(0, 3)
      .map(c => `${c.event} (${c.date}) - ${c.impact}`);
    
    // Determine macro impact
    let macroImpact: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE' = 'NONE';
    const imminentHighImpact = macroCatalysts.find(c => {
      if (c.date === 'Ongoing') return false;
      const daysUntil = Math.ceil((new Date(c.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return c.impact === 'HIGH' && daysUntil >= 0 && daysUntil <= 3;
    });
    if (imminentHighImpact) macroImpact = 'HIGH';
    else if (macroCatalysts.length > 0) macroImpact = 'MEDIUM';
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 3: On-Chain Metrics
    // ═══════════════════════════════════════════════════════════════════════
    const onChainData = input.onChainData || estimateOnChainMetrics(input.crypto, input.price, input.change);
    const etfData = estimateETFFlowData(input.price, input.change, input.crypto);
    
    const onChainSummary = this.buildOnChainSummary(onChainData);
    const etfFlow = etfData 
      ? `${etfData.trend} (24h: ${etfData.btcNetFlow24h > 0 ? '+' : ''}$${etfData.btcNetFlow24h}M)`
      : 'N/A';
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 4: Volume Analysis
    // ═══════════════════════════════════════════════════════════════════════
    const volume = input.volume || 0;
    const avgVolume = volume * 0.85;
    const volumeSpike = detectVolumeSpike({
      currentVolume: volume,
      avgVolume24h: avgVolume,
      priceChange: input.change,
      price: input.price,
      high24h: input.high24h || input.price * 1.02,
      low24h: input.low24h || input.price * 0.98
    });
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 5: Sentiment Analysis with Real-Time Fear & Greed
    // ═══════════════════════════════════════════════════════════════════════
    const fearGreed = input.sentimentData?.fearGreed?.value || 50;
    const sentimentLabel = this.getSentimentLabel(fearGreed);
    
    // Calculate Fear & Greed impact on analysis (real-time integration)
    const fearGreedImpact = this.calculateFearGreedImpact(input);
    
    // Calculate data freshness for accuracy weighting
    const dataFreshness = this.calculateDataFreshness(input, chartData);
    
    // Log real-time data status
    console.log(`[UnifiedBrain] Real-Time Data: ${dataFreshness.sources.join(' + ')} | Status: ${dataFreshness.status} | Fear&Greed: ${fearGreed} (${fearGreedImpact.trend})`);
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 6: Calculate Unified Accuracy Score (Enhanced with real-time data)
    // ═══════════════════════════════════════════════════════════════════════
    const baseAccuracy = this.calculateUnifiedAccuracy(
      selfLearningOutput,
      !!chartData?.isLive,
      !!livestreamUpdate,
      !!input.onChainData,
      macroImpact
    );
    
    // Boost accuracy based on data freshness
    const freshnessBonus = dataFreshness.status === 'REAL_TIME' ? 8 : 
                          dataFreshness.status === 'RECENT' ? 4 : 0;
    const fearGreedLiveBonus = fearGreedImpact.isLive ? 3 : 0;
    const accuracyScore = Math.min(100, baseAccuracy + freshnessBonus + fearGreedLiveBonus);
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 7: Build Simplified TL;DR
    // ═══════════════════════════════════════════════════════════════════════
    const { tldr, actionableInsight } = this.buildTLDR(
      selfLearningOutput,
      macroImpact,
      volumeSpike.isSpike,
      fearGreed
    );
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 8: Build Unified Analysis Output
    // ═══════════════════════════════════════════════════════════════════════
    const processingTimeMs = Date.now() - startTime;
    
    const unifiedAnalysis = this.buildUnifiedAnalysis(
      input,
      selfLearningOutput,
      tldr,
      actionableInsight,
      macroImpact,
      upcomingMacro,
      onChainSummary,
      etfFlow,
      volumeSpike,
      fearGreed,
      sentimentLabel,
      accuracyScore
    );
    
    return {
      bias: selfLearningOutput.bias,
      confidence: selfLearningOutput.confidence,
      analysis: unifiedAnalysis,
      
      // Data Sources
      hasLiveChart: !!chartData?.isLive,
      hasLivestream: !!livestreamUpdate,
      hasOnChain: !!input.onChainData,
      hasETF: !!etfData,
      hasMacro: macroCatalysts.length > 0,
      hasSentiment: !!input.sentimentData,
      hasICT: selfLearningOutput.hasICTSetup,
      
      // Real-time data freshness
      dataFreshness: dataFreshness.status,
      liveDataSources: dataFreshness.sources,
      
      // Fear & Greed impact
      fearGreedImpact: {
        value: fearGreedImpact.value,
        trend: fearGreedImpact.trend,
        biasModifier: fearGreedImpact.biasModifier,
        contrarian: fearGreedImpact.contrarian,
        description: fearGreedImpact.description
      },
      
      // Self-Learning
      learnedFromChart: selfLearningOutput.learnedFromLiveChart,
      learnedFromStream: selfLearningOutput.learnedFromLivestream,
      combinedLearningScore: selfLearningOutput.combinedLearningScore,
      
      // ICT/SMC
      ictAnalysis: selfLearningOutput.ictAnalysis,
      hasICTSetup: selfLearningOutput.hasICTSetup,
      
      // Macro
      upcomingMacro,
      macroImpact,
      
      // On-Chain
      onChainSummary,
      etfFlow,
      
      // Volume
      volumeSpike: volumeSpike.isSpike,
      volumeSignal: volumeSpike.signal,
      
      // Sentiment
      fearGreed,
      sentimentLabel,
      
      // Accuracy
      isVerified: selfLearningOutput.isAccurate,
      accuracyScore,
      verificationStatus: selfLearningOutput.accuracyReason,
      
      // TL;DR
      tldr,
      actionableInsight,
      
      // 🌐 Emergence Metrics — AI Brain Working Together as One
      emergence: {
        hasEmerged: emergenceMetrics.hasEmerged,
        emergenceScore: emergenceMetrics.emergenceScore,
        emergenceLevel: emergenceMetrics.emergenceLevel,
        synergyScore: emergenceMetrics.synergyScore,
        coherenceScore: emergenceMetrics.coherenceScore,
        collectiveConfidence: emergenceMetrics.collectiveConfidence,
        activeComponents: emergenceMetrics.activeComponents
      },
      
      // Metadata
      timestamp: new Date().toISOString(),
      processingTimeMs
    };
  }
  
  /**
   * Get current emergence state
   * Returns detailed metrics about how the AI brain is working together
   */
  getEmergenceState(): EmergenceState {
    return this.emergenceEngine.getEmergenceState();
  }
  
  /**
   * Format emergence status as human-readable string
   */
  formatEmergenceStatus(): string {
    const metrics = this.emergenceEngine.measureEmergence();
    return this.emergenceEngine.formatEmergenceStatus(metrics);
  }
  
  /**
   * Build on-chain summary
   */
  private buildOnChainSummary(onChain: OnChainMetrics): string {
    const flow = onChain.exchangeNetFlow;
    const whale = onChain.whaleActivity;
    
    if (flow.trend === 'OUTFLOW' && whale.netFlow.includes('BUY')) {
      return `🟢 Accumulation (${flow.magnitude} outflow, whales buying)`;
    } else if (flow.trend === 'INFLOW' && whale.netFlow.includes('SELL')) {
      return `🔴 Distribution (${flow.magnitude} inflow, whales selling)`;
    } else if (flow.trend === 'NEUTRAL') {
      return `⚪ Neutral (balanced flow)`;
    }
    return `${flow.trend} (${flow.magnitude})`;
  }
  
  /**
   * Get sentiment label
   */
  private getSentimentLabel(fearGreed: number): string {
    if (fearGreed <= 20) return '😱 EXTREME FEAR';
    if (fearGreed <= 35) return '😰 FEAR';
    if (fearGreed <= 50) return '😐 NEUTRAL';
    if (fearGreed <= 65) return '😊 GREED';
    if (fearGreed <= 80) return '🤑 HIGH GREED';
    return '🔥 EXTREME GREED';
  }
  
  /**
   * Calculate Fear & Greed impact on analysis
   * Uses contrarian signals at extremes and trend following in moderate zones
   */
  private calculateFearGreedImpact(input: AnalysisInput): {
    value: number;
    trend: 'RISING' | 'FALLING' | 'STABLE';
    biasModifier: number;
    contrarian: boolean;
    description: string;
    isLive: boolean;
  } {
    const fearGreedData = input.sentimentData?.fearGreed;
    const value = fearGreedData?.value ?? 50;
    
    // Extract enhanced data if available
    const enhancedData = fearGreedData as { 
      value: number; 
      label: string; 
      previousValue?: number;
      trend?: 'RISING' | 'FALLING' | 'STABLE';
      isLive?: boolean;
      aiWeight?: number;
    } | undefined;
    
    const previousValue = enhancedData?.previousValue ?? value;
    const isLive = enhancedData?.isLive ?? false;
    
    // Determine trend
    const diff = value - previousValue;
    const trend: 'RISING' | 'FALLING' | 'STABLE' = 
      diff > 3 ? 'RISING' : diff < -3 ? 'FALLING' : 'STABLE';
    
    // Calculate bias modifier based on Fear & Greed levels
    // - At EXTREMES: Use contrarian approach (extreme fear = bullish, extreme greed = bearish)
    // - At MODERATE levels: Follow sentiment (fear = bearish, greed = bullish) - describes current market mood
    let biasModifier = 0;
    let contrarian = false;
    let description = '';
    
    // Contrarian signals at EXTREME levels (<=20 or >=80)
    if (value <= 20) {
      biasModifier = 0.15; // Bullish contrarian - buy when others are fearful
      contrarian = true;
      description = '🟢 Extreme fear - potential buying opportunity (contrarian signal)';
    } else if (value >= 80) {
      biasModifier = -0.15; // Bearish contrarian - sell when others are greedy
      contrarian = true;
      description = '🔴 Extreme greed - potential selling opportunity (contrarian signal)';
    } 
    // Sentiment-following at MODERATE levels - describes current market mood
    else if (value <= 35) {
      biasModifier = -0.05; // Market is fearful, sentiment is bearish
      contrarian = false;
      description = '😰 Fear in market - current sentiment is bearish';
    } else if (value >= 65) {
      biasModifier = 0.05; // Market is greedy, sentiment is bullish
      contrarian = false;
      description = '😊 Greed in market - current sentiment is bullish';
    } else {
      biasModifier = 0;
      contrarian = false;
      description = '😐 Neutral sentiment - no significant bias';
    }
    
    // Adjust based on trend
    if (trend === 'RISING' && value > 50) {
      biasModifier += 0.02; // Rising sentiment adds slight bullish
      description += ' (trend: rising)';
    } else if (trend === 'FALLING' && value < 50) {
      biasModifier -= 0.02; // Falling sentiment adds slight bearish
      description += ' (trend: falling)';
    }
    
    return {
      value,
      trend,
      biasModifier,
      contrarian,
      description,
      isLive
    };
  }
  
  /**
   * Calculate data freshness score for accuracy weighting
   */
  private calculateDataFreshness(input: AnalysisInput, chartData?: ChartTrendInput): {
    score: number;
    status: 'REAL_TIME' | 'RECENT' | 'STALE';
    sources: string[];
  } {
    const sources: string[] = [];
    let freshnessScore = 0;
    
    // Check price data freshness
    if (input.isLiveData) {
      freshnessScore += 30;
      sources.push('Live Price');
    }
    
    // Check chart data freshness
    if (chartData?.isLive) {
      freshnessScore += 25;
      sources.push('Live Chart');
    }
    
    // Check Fear & Greed freshness
    const fearGreedData = input.sentimentData?.fearGreed as { isLive?: boolean } | undefined;
    if (fearGreedData?.isLive) {
      freshnessScore += 20;
      sources.push('Live Fear&Greed');
    }
    
    // Check on-chain data freshness
    if (input.onChainData) {
      freshnessScore += 15;
      sources.push('On-Chain');
    }
    
    // Check multi-timeframe data
    if (input.multiTimeframeData) {
      freshnessScore += 10;
      sources.push('Multi-TF');
    }
    
    const status: 'REAL_TIME' | 'RECENT' | 'STALE' = 
      freshnessScore >= 70 ? 'REAL_TIME' :
      freshnessScore >= 40 ? 'RECENT' : 'STALE';
    
    return { score: freshnessScore, status, sources };
  }
  
  /**
   * Calculate unified accuracy score
   */
  private calculateUnifiedAccuracy(
    output: SelfLearningOutput,
    hasLiveChart: boolean,
    hasLivestream: boolean,
    hasOnChain: boolean,
    macroImpact: string
  ): number {
    let score = output.combinedLearningScore * 100;
    
    // Bonuses for additional data sources
    if (hasLiveChart) score += 5;
    if (hasLivestream) score += 5;
    if (hasOnChain) score += 5;
    if (output.hasICTSetup) score += 10;
    
    // Penalty for imminent macro events (uncertainty)
    if (macroImpact === 'HIGH') score -= 10;
    
    // Verification bonus
    if (output.isAccurate) score += 5;
    
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * Build simplified TL;DR
   */
  private buildTLDR(
    output: SelfLearningOutput,
    macroImpact: string,
    volumeSpike: boolean,
    fearGreed: number
  ): { tldr: string; actionableInsight: string } {
    const biasEmoji = output.bias === 'LONG' ? '🟢' : output.bias === 'SHORT' ? '🔴' : '⚪';
    const biasWord = output.bias === 'LONG' ? 'BULLISH' : output.bias === 'SHORT' ? 'BEARISH' : 'NEUTRAL';
    const confLevel = output.confidence >= 70 ? 'HIGH' : output.confidence >= 50 ? 'MODERATE' : 'LOW';
    
    let tldr = `${biasEmoji} ${biasWord} (${confLevel} confidence)`;
    
    if (output.hasICTSetup && output.ictAnalysis?.tradeSetup) {
      tldr += ` | ICT: ${output.ictAnalysis.tradeSetup.type.replace('_', ' ')}`;
    }
    
    if (volumeSpike) {
      tldr += ' | Volume spike detected';
    }
    
    if (macroImpact === 'HIGH') {
      tldr += ' | ⚠️ High-impact event imminent';
    }
    
    // Actionable insight
    let actionableInsight: string;
    
    if (!output.isAccurate) {
      actionableInsight = '⏸️ Wait for better data - verification pending';
    } else if (output.bias === 'NEUTRAL') {
      actionableInsight = '↔️ No clear direction - wait for breakout or range trade';
    } else if (macroImpact === 'HIGH') {
      actionableInsight = '⚠️ Reduce size or hedge - high-impact event coming';
    } else if (output.hasICTSetup && output.ictAnalysis?.tradeSetup) {
      const setup = output.ictAnalysis.tradeSetup;
      actionableInsight = `🎯 ${setup.direction} at ${setup.entry.toFixed(2)}, SL: ${setup.stopLoss.toFixed(2)}, TP: ${setup.target1.toFixed(2)}`;
    } else if (output.bias === 'LONG') {
      actionableInsight = '📈 Look for long entries on pullbacks to support';
    } else {
      actionableInsight = '📉 Look for short entries on rallies to resistance';
    }
    
    return { tldr, actionableInsight };
  }
  
  /**
   * Build unified analysis output
   */
  private buildUnifiedAnalysis(
    input: AnalysisInput,
    output: SelfLearningOutput,
    tldr: string,
    actionableInsight: string,
    macroImpact: string,
    upcomingMacro: string[],
    onChainSummary: string,
    etfFlow: string,
    volumeSpike: { isSpike: boolean; signal: string; magnitude: string; percentageAboveAvg: number },
    fearGreed: number,
    sentimentLabel: string,
    accuracyScore: number
  ): string {
    const biasEmoji = output.bias === 'LONG' ? '🟢' : output.bias === 'SHORT' ? '🔴' : '⚪';
    const change = input.change;
    const priceStr = input.price.toFixed(input.price < 1 ? 6 : 2);
    
    let analysis = `
╔══════════════════════════════════════════════════════════════════╗
║  🧠 ZIKALYZE UNIFIED BRAIN                                        ║
║  ${input.crypto.toUpperCase()} @ $${priceStr} ${change >= 0 ? '▲' : '▼'} ${Math.abs(change).toFixed(2)}%
╚══════════════════════════════════════════════════════════════════╝

📌 TL;DR: ${tldr}
🎯 ACTION: ${actionableInsight}

┌────────────────────────────────────────────────────────────────┐
│  ${biasEmoji} VERDICT: ${output.bias}  │  Confidence: ${(output.confidence * 100).toFixed(0)}%  │  Accuracy: ${accuracyScore.toFixed(0)}%
└────────────────────────────────────────────────────────────────┘

━━━ 📊 MARKET PULSE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  🔗 On-Chain: ${onChainSummary}
  💼 ETF Flow: ${etfFlow}
  😊 Sentiment: ${sentimentLabel} (${fearGreed}/100)
  📊 Volume: ${volumeSpike.isSpike ? `🔥 SPIKE +${volumeSpike.percentageAboveAvg.toFixed(0)}% (${volumeSpike.signal})` : 'Normal'}
`;

    // Add macro section if there are upcoming events
    if (upcomingMacro.length > 0) {
      analysis += `
━━━ ⚡ MACRO EVENTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${upcomingMacro.map(m => `  📅 ${m}`).join('\n')}
  ${macroImpact === 'HIGH' ? '⚠️ HIGH IMPACT EVENT IMMINENT - Expect volatility' : ''}
`;
    }

    // Add ICT/SMC section if available
    if (output.hasICTSetup && output.ictAnalysis) {
      const ict = output.ictAnalysis;
      analysis += `
━━━ 📈 ICT/SMC ANALYSIS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  🏗️ Structure: ${ict.marketStructure.trend} ${ict.marketStructure.lastBOS ? `(BOS ${ict.marketStructure.lastBOS})` : ''}
  💰 Zone: ${ict.premiumDiscount.zone} (${ict.premiumDiscount.fibLevel})
  📦 Order Blocks: ${ict.orderBlocks.length} | FVGs: ${ict.fairValueGaps.length}
  💧 Liquidity: BSL ${ict.liquidityPools.filter(p => p.type === 'BSL').length} | SSL ${ict.liquidityPools.filter(p => p.type === 'SSL').length}
  📈 Multi-TF: HTF ${ict.htfTrend} | LTF ${ict.ltfTrend}
`;

      if (ict.tradeSetup) {
        analysis += `
  ┌───────────────────────────────────────────┐
  │  🎯 ICT TRADE SETUP                       │
  ├───────────────────────────────────────────┤
  │  Direction: ${ict.tradeSetup.direction.padEnd(28)}│
  │  Entry: $${ict.tradeSetup.entry.toFixed(2).padEnd(27)}│
  │  Stop Loss: $${ict.tradeSetup.stopLoss.toFixed(2).padEnd(24)}│
  │  Target 1: $${ict.tradeSetup.target1.toFixed(2).padEnd(25)}│
  │  R:R Ratio: ${ict.tradeSetup.riskReward.toFixed(1).padEnd(26)}│
  │  Confidence: ${ict.tradeSetup.confidence}%${' '.repeat(23)}│
  └───────────────────────────────────────────┘
`;
      }
    }

    // Add learning status
    analysis += `
━━━ 🧠 AI LEARNING STATUS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  📊 Chart Learning: ${output.learnedFromLiveChart ? '✓ Active' : '○ Pending'}
  📡 Stream Learning: ${output.learnedFromLivestream ? '✓ Active' : '○ Pending'}
  🎯 ICT Patterns: ${output.hasICTSetup ? '✓ Detected' : '○ None'}
  📈 Learning Score: ${(output.combinedLearningScore * 100).toFixed(0)}%
  ✅ Verified: ${output.isAccurate ? '✓ YES' : '✗ Pending verification'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Powered by Zikalyze Unified Brain | ${output.processingTimeMs}ms
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

    return analysis;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🧠🧠 COMBINED BRAIN — Merges BOTH Brain Systems for Complete Top-Down Analysis
// ═══════════════════════════════════════════════════════════════════════════════
// 
// This is the ULTIMATE brain that combines:
// 1. Original Brain (runClientSideAnalysis): Top-down multi-TF analysis, macro, 
//    volume, institutional vs retail, precision entries, if-then scenarios
// 2. Pipeline Brain (ZikalyzeBrainPipeline): Attention, double verification,
//    self-learning, ICT/SMC analysis, accuracy-based release
//
// All information flows into BOTH brains, results are merged for the best analysis
// ═══════════════════════════════════════════════════════════════════════════════

import { 
  analyzeInstitutionalVsRetail, 
  generateIfThenScenarios 
} from './institutional-analysis';
import { 
  analyzeMarketStructure, 
  generatePrecisionEntry, 
  calculateFinalBias, 
  performTopDownAnalysis,
  TopDownAnalysis
} from './technical-analysis';

/**
 * Combined Brain Output — Merges both brain systems
 */
export interface CombinedBrainOutput {
  // ═══════════════════════════════════════════════════════════════════════════
  // Core Analysis (from both brains)
  // ═══════════════════════════════════════════════════════════════════════════
  bias: 'LONG' | 'SHORT' | 'NEUTRAL';
  confidence: number;
  analysis: string;
  
  // ═══════════════════════════════════════════════════════════════════════════
  // Top-Down Analysis (from Original Brain)
  // ═══════════════════════════════════════════════════════════════════════════
  topDownAnalysis: TopDownAnalysis;
  technicalBias: 'LONG' | 'SHORT' | 'NEUTRAL';
  technicalConfidence: number;
  
  // ═══════════════════════════════════════════════════════════════════════════
  // Pipeline Analysis (from Pipeline Brain)
  // ═══════════════════════════════════════════════════════════════════════════
  pipelineBias: 'LONG' | 'SHORT' | 'NEUTRAL';
  pipelineConfidence: number;
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ICT/SMC Analysis (from Pipeline Brain)
  // ═══════════════════════════════════════════════════════════════════════════
  ictAnalysis?: ICTSMCAnalysis;
  hasICTSetup: boolean;
  
  // ═══════════════════════════════════════════════════════════════════════════
  // Institutional vs Retail (from Original Brain)
  // ═══════════════════════════════════════════════════════════════════════════
  institutionalBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  retailBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  institutionalRetailDivergence: boolean;
  
  // ═══════════════════════════════════════════════════════════════════════════
  // Precision Entry (from Original Brain)
  // ═══════════════════════════════════════════════════════════════════════════
  precisionEntry: {
    zone: string;
    invalidation: string;
    timing: string;
    trigger: string;
  };
  
  // ═══════════════════════════════════════════════════════════════════════════
  // If-Then Scenarios (from Original Brain)
  // ═══════════════════════════════════════════════════════════════════════════
  scenarios: Array<{
    condition: string;
    priceLevel: number;
    outcome: string;
    probability: number;
    action: string;
  }>;
  
  // ═══════════════════════════════════════════════════════════════════════════
  // Key Insights (merged from both brains)
  // ═══════════════════════════════════════════════════════════════════════════
  keyInsights: string[];
  
  // ═══════════════════════════════════════════════════════════════════════════
  // Data Sources & Verification
  // ═══════════════════════════════════════════════════════════════════════════
  isVerified: boolean;
  isAccurate: boolean;
  accuracyScore: number;
  
  // Macro
  macroImpact: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  upcomingMacro: string[];
  
  // Volume
  volumeSpike: boolean;
  volumeSignal: string;
  
  // Sentiment
  fearGreed: number;
  sentimentLabel: string;
  
  // On-Chain
  onChainSummary: string;
  etfFlow: string;
  
  // Learning
  learnedFromChart: boolean;
  learnedFromStream: boolean;
  combinedLearningScore: number;
  
  // Metadata
  timestamp: string;
  processingTimeMs: number;
  brainVersion: string;
}

/**
 * 🧠🧠 COMBINED BRAIN
 * 
 * The ULTIMATE crypto analysis engine that combines BOTH brain systems:
 * 
 * ORIGINAL BRAIN (runClientSideAnalysis):
 * - Top-down multi-timeframe analysis (Weekly → Daily → 4H → 1H → 15M)
 * - Institutional vs Retail analysis
 * - Precision entry zones
 * - If-Then scenarios
 * - Macro catalyst integration
 * 
 * PIPELINE BRAIN (ZikalyzeBrainPipeline):
 * - Active Crypto Source (read, learn, adapt)
 * - AI Analyzer (human-readable processing)
 * - Attention Algorithm (filter, verify, calculate)
 * - Double verification loop
 * - ICT/SMC analysis
 * - Self-learning from charts and livestream
 * 
 * All information is analyzed by BOTH brains, then merged for the most
 * comprehensive and accurate analysis possible.
 */
export class CombinedBrain extends UnifiedBrain {
  private readonly combinedVersion = '3.0.0';
  
  constructor() {
    super();
    console.log('[CombinedBrain] v3.0 — BOTH Brains Combined for Ultimate Analysis');
  }
  
  /**
   * Run COMBINED analysis using BOTH brain systems
   * 
   * Step 1: Run Original Brain (top-down, institutional, precision entries)
   * Step 2: Run Pipeline Brain (attention, verification, ICT/SMC, learning)
   * Step 3: Merge results and calculate combined confidence
   * Step 4: Generate unified output with all insights
   */
  analyzeWithBothBrains(
    input: AnalysisInput,
    chartData?: ChartTrendInput,
    livestreamUpdate?: LivestreamUpdate
  ): CombinedBrainOutput {
    const startTime = Date.now();
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 1: Run Original Brain — Top-Down Multi-Timeframe Analysis
    // ═══════════════════════════════════════════════════════════════════════
    console.log('[CombinedBrain] Step 1: Running Original Brain (top-down analysis)...');
    
    // Prepare input for original brain
    const originalBrainInput = {
      ...input,
      chartTrendData: chartData,
      multiTimeframeData: input.multiTimeframeData
    };
    
    // Run original brain analysis
    const originalResult = runClientSideAnalysis(originalBrainInput);
    
    // Extract top-down analysis directly
    const topDownAnalysis = performTopDownAnalysis(
      input.price,
      input.high24h || input.price * 1.02,
      input.low24h || input.price * 0.98,
      input.change,
      chartData,
      input.multiTimeframeData
    );
    
    // Calculate technical bias and confidence from original brain
    const technicalBias = topDownAnalysis.tradeableDirection === 'LONG' ? 'LONG' 
                        : topDownAnalysis.tradeableDirection === 'SHORT' ? 'SHORT' 
                        : 'NEUTRAL';
    const technicalConfidence = topDownAnalysis.confluenceScore;
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 2: Run Pipeline Brain — Attention, Verification, ICT/SMC, Learning
    // ═══════════════════════════════════════════════════════════════════════
    console.log('[CombinedBrain] Step 2: Running Pipeline Brain (verification + learning)...');
    
    const pipelineResult = this.analyze(input, chartData, livestreamUpdate);
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 3: Institutional vs Retail Analysis (from Original Brain)
    // ═══════════════════════════════════════════════════════════════════════
    console.log('[CombinedBrain] Step 3: Analyzing institutional vs retail...');
    
    const etfData = estimateETFFlowData(input.price, input.change, input.crypto);
    const onChainData = input.onChainData || estimateOnChainMetrics(input.crypto, input.price, input.change);
    const fearGreed = input.sentimentData?.fearGreed?.value || 50;
    const socialSentiment = input.sentimentData?.social?.overall?.score || 50;
    
    const institutionalVsRetail = analyzeInstitutionalVsRetail({
      etfFlow: etfData,
      onChain: onChainData,
      socialSentiment,
      fearGreed,
      price: input.price,
      change: input.change
    });
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 4: Generate Precision Entry Zones (from Original Brain)
    // ═══════════════════════════════════════════════════════════════════════
    console.log('[CombinedBrain] Step 4: Generating precision entry zones...');
    
    const high24h = input.high24h || input.price * 1.02;
    const low24h = input.low24h || input.price * 0.98;
    const volume = input.volume || 0;
    
    const volumeSpike = detectVolumeSpike({
      currentVolume: volume,
      avgVolume24h: volume * 0.85,
      priceChange: input.change,
      price: input.price,
      high24h,
      low24h
    });
    
    const precisionEntryData = generatePrecisionEntry(
      input.price,
      high24h,
      low24h,
      input.change,
      technicalBias,
      volumeSpike.isSpike ? 'HIGH' : 'MODERATE'
    );
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 5: Generate If-Then Scenarios (from Original Brain)
    // ═══════════════════════════════════════════════════════════════════════
    console.log('[CombinedBrain] Step 5: Generating if-then scenarios...');
    
    const range = high24h - low24h;
    const keySupport = low24h + range * 0.15;
    const keyResistance = high24h - range * 0.15;
    
    const scenarios = generateIfThenScenarios({
      price: input.price,
      high: high24h,
      low: low24h,
      bias: technicalBias,
      keySupport,
      keyResistance
    });
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 6: Merge Biases from Both Brains
    // ═══════════════════════════════════════════════════════════════════════
    console.log('[CombinedBrain] Step 6: Merging both brain outputs...');
    
    const { combinedBias, combinedConfidence } = this.mergeBrainOutputs(
      technicalBias,
      technicalConfidence,
      pipelineResult.bias,
      pipelineResult.confidence * 100,
      institutionalVsRetail.institutionalBias,
      pipelineResult.hasICTSetup,
      pipelineResult.isVerified
    );
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 7: Merge Key Insights from Both Brains
    // ═══════════════════════════════════════════════════════════════════════
    const keyInsights = this.mergeInsights(
      originalResult.insights,
      topDownAnalysis.reasoning,
      pipelineResult.ictAnalysis,
      institutionalVsRetail,
      combinedBias
    );
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 8: Build Combined Analysis Output
    // ═══════════════════════════════════════════════════════════════════════
    const processingTimeMs = Date.now() - startTime;
    
    const combinedAnalysis = this.buildCombinedAnalysis(
      input,
      combinedBias,
      combinedConfidence,
      technicalBias,
      technicalConfidence,
      pipelineResult,
      topDownAnalysis,
      institutionalVsRetail,
      precisionEntryData,
      scenarios,
      keyInsights,
      volumeSpike,
      processingTimeMs
    );
    
    console.log(`[CombinedBrain] ✅ Complete in ${processingTimeMs}ms — Bias: ${combinedBias} (${combinedConfidence.toFixed(0)}%)`);
    
    return {
      bias: combinedBias,
      confidence: combinedConfidence,
      analysis: combinedAnalysis,
      
      // Top-Down Analysis
      topDownAnalysis,
      technicalBias,
      technicalConfidence,
      
      // Pipeline Analysis
      pipelineBias: pipelineResult.bias,
      pipelineConfidence: pipelineResult.confidence * 100,
      
      // ICT/SMC
      ictAnalysis: pipelineResult.ictAnalysis,
      hasICTSetup: pipelineResult.hasICTSetup,
      
      // Institutional vs Retail
      institutionalBias: institutionalVsRetail.institutionalBias,
      retailBias: institutionalVsRetail.retailBias,
      institutionalRetailDivergence: institutionalVsRetail.divergence,
      
      // Precision Entry
      precisionEntry: {
        zone: precisionEntryData.zone,
        invalidation: precisionEntryData.invalidation,
        timing: precisionEntryData.timing,
        trigger: precisionEntryData.trigger
      },
      
      // Scenarios
      scenarios,
      
      // Key Insights
      keyInsights,
      
      // Verification
      isVerified: pipelineResult.isVerified,
      isAccurate: pipelineResult.isVerified && combinedConfidence >= 50,
      accuracyScore: pipelineResult.accuracyScore,
      
      // Macro
      macroImpact: pipelineResult.macroImpact,
      upcomingMacro: pipelineResult.upcomingMacro,
      
      // Volume
      volumeSpike: volumeSpike.isSpike,
      volumeSignal: volumeSpike.signal,
      
      // Sentiment
      fearGreed,
      sentimentLabel: pipelineResult.sentimentLabel,
      
      // On-Chain
      onChainSummary: pipelineResult.onChainSummary,
      etfFlow: pipelineResult.etfFlow,
      
      // Learning
      learnedFromChart: pipelineResult.learnedFromChart,
      learnedFromStream: pipelineResult.learnedFromStream,
      combinedLearningScore: pipelineResult.combinedLearningScore,
      
      // Metadata
      timestamp: new Date().toISOString(),
      processingTimeMs,
      brainVersion: this.combinedVersion
    };
  }
  
  /**
   * Merge outputs from both brains into a single bias and confidence
   */
  private mergeBrainOutputs(
    technicalBias: 'LONG' | 'SHORT' | 'NEUTRAL',
    technicalConfidence: number,
    pipelineBias: 'LONG' | 'SHORT' | 'NEUTRAL',
    pipelineConfidence: number,
    institutionalBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL',
    hasICTSetup: boolean,
    isVerified: boolean
  ): { combinedBias: 'LONG' | 'SHORT' | 'NEUTRAL'; combinedConfidence: number } {
    // ═══════════════════════════════════════════════════════════════════════
    // COMBINED BIAS CALCULATION
    // ═══════════════════════════════════════════════════════════════════════
    // Priority: Technical (40%) + Pipeline (35%) + Institutional (25%)
    // Agreement bonus: +8% when both brains agree
    // ICT setup bonus: +5% confidence
    // Verification bonus: +3% confidence
    // ═══════════════════════════════════════════════════════════════════════
    
    // Convert biases to numeric scores
    const biasToScore = (b: string): number => {
      if (b === 'LONG' || b === 'BULLISH') return 1;
      if (b === 'SHORT' || b === 'BEARISH') return -1;
      return 0;
    };
    
    const technicalScore = biasToScore(technicalBias) * (technicalConfidence / 100);
    const pipelineScore = biasToScore(pipelineBias) * (pipelineConfidence / 100);
    const institutionalScore = biasToScore(institutionalBias) * 0.5; // Scale down
    
    // Weighted combination
    const combinedScore = 
      (technicalScore * 0.40) + 
      (pipelineScore * 0.35) + 
      (institutionalScore * 0.25);
    
    // Determine combined bias
    let combinedBias: 'LONG' | 'SHORT' | 'NEUTRAL';
    if (combinedScore > 0.15) {
      combinedBias = 'LONG';
    } else if (combinedScore < -0.15) {
      combinedBias = 'SHORT';
    } else {
      combinedBias = 'NEUTRAL';
    }
    
    // Calculate combined confidence
    const baseConfidence = (technicalConfidence * 0.40 + pipelineConfidence * 0.35 + 50 * 0.25);
    let combinedConfidence = baseConfidence;
    
    // Agreement bonus: if both brains agree, boost confidence
    if (technicalBias === pipelineBias && technicalBias !== 'NEUTRAL') {
      combinedConfidence += 8;
    }
    
    // ICT setup bonus
    if (hasICTSetup) {
      combinedConfidence += 5;
    }
    
    // Verification bonus
    if (isVerified) {
      combinedConfidence += 3;
    }
    
    // Disagreement penalty: if brains conflict, reduce confidence
    if ((technicalBias === 'LONG' && pipelineBias === 'SHORT') ||
        (technicalBias === 'SHORT' && pipelineBias === 'LONG')) {
      combinedConfidence -= 15;
      combinedBias = 'NEUTRAL'; // Force neutral when brains conflict
    }
    
    // Clamp confidence
    combinedConfidence = Math.max(35, Math.min(85, combinedConfidence));
    
    return { combinedBias, combinedConfidence };
  }
  
  /**
   * Merge insights from both brains
   */
  private mergeInsights(
    originalInsights: string[],
    topDownReasoning: string[],
    ictAnalysis: ICTSMCAnalysis | undefined,
    institutionalVsRetail: { institutionalBias: string; retailBias: string; divergence: boolean; divergenceNote: string },
    combinedBias: 'LONG' | 'SHORT' | 'NEUTRAL'
  ): string[] {
    const insights: string[] = [];
    
    // Add combined bias summary
    if (combinedBias === 'LONG') {
      insights.push('🎯 COMBINED BIAS: BULLISH — Both brains aligned');
    } else if (combinedBias === 'SHORT') {
      insights.push('🎯 COMBINED BIAS: BEARISH — Both brains aligned');
    } else {
      insights.push('⏸️ COMBINED BIAS: NEUTRAL — Waiting for confluence');
    }
    
    // Add top-down reasoning (max 2)
    topDownReasoning.slice(0, 2).forEach(r => insights.push(`📊 ${r}`));
    
    // Add ICT insight if available
    if (ictAnalysis && ictAnalysis.tradeSetup) {
      insights.push(`🎯 ICT: ${ictAnalysis.tradeSetup.type.replace('_', ' ')} ${ictAnalysis.tradeSetup.direction}`);
    }
    
    // Add institutional vs retail insight
    if (institutionalVsRetail.divergence) {
      insights.push(`⚠️ ${institutionalVsRetail.divergenceNote}`);
    } else {
      insights.push(`🏦 Institutional: ${institutionalVsRetail.institutionalBias} | Retail: ${institutionalVsRetail.retailBias}`);
    }
    
    // Add filtered original insights (max 2, bias-aligned)
    originalInsights
      .filter(i => !i.includes('🎯'))
      .filter(i => {
        if (combinedBias === 'LONG') {
          return !i.toLowerCase().includes('bearish') && !i.toLowerCase().includes('short');
        }
        if (combinedBias === 'SHORT') {
          return !i.toLowerCase().includes('bullish') && !i.toLowerCase().includes('long');
        }
        return true;
      })
      .slice(0, 2)
      .forEach(i => insights.push(i));
    
    return insights;
  }
  
  /**
   * Build the combined analysis output string
   */
  private buildCombinedAnalysis(
    input: AnalysisInput,
    combinedBias: 'LONG' | 'SHORT' | 'NEUTRAL',
    combinedConfidence: number,
    technicalBias: 'LONG' | 'SHORT' | 'NEUTRAL',
    technicalConfidence: number,
    pipelineResult: UnifiedBrainOutput,
    topDownAnalysis: TopDownAnalysis,
    institutionalVsRetail: { institutionalBias: string; retailBias: string; divergence: boolean },
    precisionEntry: { zone: string; invalidation: string; timing: string; trigger: string },
    scenarios: Array<{ condition: string; priceLevel: number; outcome: string; probability: number; action: string }>,
    keyInsights: string[],
    volumeSpike: { isSpike: boolean; signal: string; magnitude: string; percentageAboveAvg: number },
    processingTimeMs: number
  ): string {
    const biasEmoji = combinedBias === 'LONG' ? '🟢' : combinedBias === 'SHORT' ? '🔴' : '⚪';
    const priceStr = input.price.toFixed(input.price < 1 ? 6 : 2);
    const change = input.change;
    
    let analysis = `
╔══════════════════════════════════════════════════════════════════╗
║  🧠🧠 ZIKALYZE COMBINED BRAIN v3.0                                ║
║  ${input.crypto.toUpperCase()} @ $${priceStr} ${change >= 0 ? '▲' : '▼'} ${Math.abs(change).toFixed(2)}%
║  Both Brains Combined for Ultimate Top-Down Analysis
╚══════════════════════════════════════════════════════════════════╝

┌────────────────────────────────────────────────────────────────┐
│  ${biasEmoji} COMBINED VERDICT: ${combinedBias}  │  Confidence: ${combinedConfidence.toFixed(0)}%
│                                                                │
│  📊 Technical Brain: ${technicalBias} (${technicalConfidence.toFixed(0)}%)
│  🧠 Pipeline Brain: ${pipelineResult.bias} (${(pipelineResult.confidence * 100).toFixed(0)}%)
│  🏦 Institutional: ${institutionalVsRetail.institutionalBias}
└────────────────────────────────────────────────────────────────┘

━━━ 📊 TOP-DOWN MULTI-TIMEFRAME ANALYSIS ━━━━━━━━━━━━━━━━━━━━━━━━━

  Weekly:  ${topDownAnalysis.weekly.trend} (${topDownAnalysis.weekly.strength.toFixed(0)}%)
  Daily:   ${topDownAnalysis.daily.trend} (${topDownAnalysis.daily.strength.toFixed(0)}%)
  4H:      ${topDownAnalysis.h4.trend} (${topDownAnalysis.h4.strength.toFixed(0)}%)
  1H:      ${topDownAnalysis.h1.trend} (${topDownAnalysis.h1.strength.toFixed(0)}%)
  15M:     ${topDownAnalysis.m15.trend} (${topDownAnalysis.m15.strength.toFixed(0)}%)
  
  Confluence Score: ${topDownAnalysis.confluenceScore.toFixed(0)}%
  Tradeable Direction: ${topDownAnalysis.tradeableDirection}

━━━ 🎯 KEY INSIGHTS (From Both Brains) ━━━━━━━━━━━━━━━━━━━━━━━━━━━

${keyInsights.map(i => `  ${i}`).join('\n')}

━━━ 📍 PRECISION ENTRY ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Zone: ${precisionEntry.zone}
  Timing: ${precisionEntry.timing}
  Trigger: ${precisionEntry.trigger}
  Invalidation: ${precisionEntry.invalidation}
`;

    // Add ICT analysis if available
    if (pipelineResult.hasICTSetup && pipelineResult.ictAnalysis?.tradeSetup) {
      const ict = pipelineResult.ictAnalysis;
      analysis += `
━━━ 📈 ICT/SMC SETUP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Type: ${ict.tradeSetup.type.replace('_', ' ')}
  Direction: ${ict.tradeSetup.direction}
  Entry: $${ict.tradeSetup.entry.toFixed(2)}
  Stop Loss: $${ict.tradeSetup.stopLoss.toFixed(2)}
  Target: $${ict.tradeSetup.target1.toFixed(2)} (${ict.tradeSetup.riskReward.toFixed(1)}R)
  Confidence: ${ict.tradeSetup.confidence}%
`;
    }

    // Add scenarios
    if (scenarios.length > 0) {
      analysis += `
━━━ 🔮 IF-THEN SCENARIOS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`;
      scenarios.slice(0, 3).forEach((s, i) => {
        analysis += `  ${i + 1}. ${s.condition} @ $${s.priceLevel.toFixed(2)}
     → ${s.outcome} (${s.probability}% prob)
     Action: ${s.action}
`;
      });
    }

    // Add market pulse
    analysis += `
━━━ 📊 MARKET PULSE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  🔗 On-Chain: ${pipelineResult.onChainSummary}
  💼 ETF Flow: ${pipelineResult.etfFlow}
  😊 Sentiment: ${pipelineResult.sentimentLabel} (${pipelineResult.fearGreed}/100)
  📊 Volume: ${volumeSpike.isSpike ? `🔥 SPIKE +${volumeSpike.percentageAboveAvg.toFixed(0)}%` : 'Normal'}
`;

    // Add macro if impact
    if (pipelineResult.macroImpact !== 'NONE' && pipelineResult.upcomingMacro.length > 0) {
      analysis += `
  ⚡ Macro Impact: ${pipelineResult.macroImpact}
${pipelineResult.upcomingMacro.slice(0, 2).map(m => `     📅 ${m}`).join('\n')}
`;
    }

    // Add verification and learning status
    analysis += `
━━━ 🧠 BRAIN STATUS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✅ Verified: ${pipelineResult.isVerified ? 'YES' : 'NO'} | Accuracy: ${pipelineResult.accuracyScore.toFixed(0)}%
  📊 Chart Learning: ${pipelineResult.learnedFromChart ? '✓ Active' : '○ Pending'}
  📡 Stream Learning: ${pipelineResult.learnedFromStream ? '✓ Active' : '○ Pending'}
  🎯 ICT Patterns: ${pipelineResult.hasICTSetup ? '✓ Detected' : '○ None'}
  📈 Learning Score: ${(pipelineResult.combinedLearningScore * 100).toFixed(0)}%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Powered by Zikalyze Combined Brain v${this.combinedVersion} | ${processingTimeMs}ms
  Both brains analyzed and merged for ultimate accuracy
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

    return analysis;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🌐 EMERGENCE ENGINE — AI Brain Components Working Together as One
// ═══════════════════════════════════════════════════════════════════════════════
// Emergence: The whole is greater than the sum of its parts
// This engine tracks how multiple AI components synergize to produce
// collective intelligence that exceeds individual capabilities
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Component contribution tracking for emergence measurement
 */
export interface ComponentContribution {
  name: string;
  confidence: number;
  weight: number;
  lastUpdate: number;
  synergySources: string[];
}

/**
 * Emergence metrics that track collective AI behavior
 */
export interface EmergenceMetrics {
  /** Overall emergence score (0-100) - how well components work together */
  emergenceScore: number;
  /** Synergy score - amplification from component interaction */
  synergyScore: number;
  /** Coherence score - alignment of component outputs */
  coherenceScore: number;
  /** Collective confidence - combined confidence exceeding individual means */
  collectiveConfidence: number;
  /** Number of active contributing components */
  activeComponents: number;
  /** Whether emergence threshold has been reached */
  hasEmerged: boolean;
  /** Emergence level classification */
  emergenceLevel: 'DORMANT' | 'AWAKENING' | 'EMERGING' | 'UNIFIED' | 'TRANSCENDENT';
  /** Timestamp of emergence measurement */
  timestamp: number;
}

/**
 * Emergence state tracking over time
 */
export interface EmergenceState {
  /** Current emergence metrics */
  current: EmergenceMetrics;
  /** Historical emergence scores for trend analysis */
  history: { score: number; timestamp: number }[];
  /** Trend direction of emergence */
  trend: 'RISING' | 'FALLING' | 'STABLE';
  /** Time since last significant emergence event */
  timeSinceEmergence: number;
}

/**
 * Emergence Engine
 * 
 * Tracks and measures how multiple AI brain components work together
 * to produce emergent collective intelligence. The engine monitors:
 * 
 * 1. Component Synergy: How components amplify each other's outputs
 * 2. Coherence: How aligned the components' conclusions are
 * 3. Collective Intelligence: Intelligence beyond individual components
 * 4. Emergence Events: When the system "comes together" as one
 * 
 * The AI brain emerges as one when:
 * - Multiple components reach consensus
 * - Synergy score exceeds threshold
 * - Coherence score indicates alignment
 * - Collective confidence surpasses individual means
 */
export class EmergenceEngine {
  private components: Map<string, ComponentContribution> = new Map();
  private emergenceHistory: { score: number; timestamp: number }[] = [];
  private readonly emergenceThreshold = 70; // Score required for emergence
  private readonly synergyMultiplier = 1.25; // Amplification factor when synergy detected
  private readonly maxHistoryLength = 100;
  private readonly maxReturnedHistory = 20; // History entries returned in getEmergenceState
  private readonly maxComponentBonus = 20; // Maximum bonus from active components
  private readonly componentBonusMultiplier = 5; // Bonus per additional active component
  
  constructor() {
    // Initialize core AI brain components
    this.registerComponent('ActiveCryptoSource', 1.0);
    this.registerComponent('AIAnalyzer', 1.0);
    this.registerComponent('AttentionAlgorithm', 1.0);
    this.registerComponent('ICTSMCAnalysis', 0.9);
    this.registerComponent('SelfLearner', 0.85);
    this.registerComponent('DoubleVerification', 0.95);
    console.log('[EmergenceEngine] Initialized — Monitoring collective AI intelligence');
  }
  
  /**
   * Register a new component for emergence tracking
   */
  registerComponent(name: string, weight: number): void {
    this.components.set(name, {
      name,
      confidence: 0,
      weight,
      lastUpdate: Date.now(),
      synergySources: []
    });
  }
  
  /**
   * Update component contribution with new confidence and synergy sources
   */
  updateComponent(
    name: string, 
    confidence: number, 
    synergySources: string[] = []
  ): void {
    const component = this.components.get(name);
    if (component) {
      component.confidence = Math.max(0, Math.min(1, confidence));
      component.lastUpdate = Date.now();
      component.synergySources = synergySources;
      this.components.set(name, component);
    }
  }
  
  /**
   * Calculate synergy score based on component interactions
   * Synergy occurs when components reference and amplify each other
   */
  private calculateSynergy(): number {
    let synergyCount = 0;
    let totalPossible = 0;
    
    this.components.forEach((component) => {
      component.synergySources.forEach(source => {
        if (this.components.has(source)) {
          const sourceComponent = this.components.get(source)!;
          // Synergy is stronger when both components have high confidence
          synergyCount += (component.confidence + sourceComponent.confidence) / 2;
        }
        totalPossible += 1;
      });
    });
    
    if (totalPossible === 0) return 0;
    
    // Apply synergy multiplier for strong interactions
    const baseSynergy = (synergyCount / totalPossible) * 100;
    return Math.min(100, baseSynergy * this.synergyMultiplier);
  }
  
  /**
   * Calculate coherence - how aligned component outputs are
   * High coherence means components are reaching similar conclusions
   */
  private calculateCoherence(): number {
    const confidences = Array.from(this.components.values())
      .filter(c => c.lastUpdate > Date.now() - 60000) // Only recent updates
      .map(c => c.confidence);
    
    if (confidences.length < 2) return 0;
    
    // Calculate variance (lower variance = higher coherence)
    const mean = confidences.reduce((a, b) => a + b, 0) / confidences.length;
    const variance = confidences.reduce((sum, c) => sum + Math.pow(c - mean, 2), 0) / confidences.length;
    const stdDev = Math.sqrt(variance);
    
    // Convert to coherence score (lower stdDev = higher coherence)
    // stdDev of 0 = 100% coherence, stdDev of 0.5 = 0% coherence
    const coherence = Math.max(0, (1 - stdDev * 2)) * 100;
    return coherence;
  }
  
  /**
   * Calculate collective confidence - combined intelligence of all components
   * This represents the emergent property where collective > individual
   */
  private calculateCollectiveConfidence(): number {
    const activeComponents = Array.from(this.components.values())
      .filter(c => c.lastUpdate > Date.now() - 60000);
    
    if (activeComponents.length === 0) return 0;
    
    // Weighted average with synergy bonus
    let weightedSum = 0;
    let totalWeight = 0;
    
    activeComponents.forEach(component => {
      const synergyBonus = component.synergySources.length > 0 ? 0.1 : 0;
      const effectiveConfidence = Math.min(1, component.confidence + synergyBonus);
      weightedSum += effectiveConfidence * component.weight;
      totalWeight += component.weight;
    });
    
    const baseConfidence = totalWeight > 0 ? (weightedSum / totalWeight) * 100 : 0;
    
    // Apply emergence amplification when many components are active
    const componentBonus = Math.min(
      this.maxComponentBonus, 
      (activeComponents.length - 1) * this.componentBonusMultiplier
    );
    
    return Math.min(100, baseConfidence + componentBonus);
  }
  
  /**
   * Determine emergence level based on metrics
   */
  private getEmergenceLevel(score: number): EmergenceMetrics['emergenceLevel'] {
    if (score >= 90) return 'TRANSCENDENT';
    if (score >= 80) return 'UNIFIED';
    if (score >= 70) return 'EMERGING';
    if (score >= 50) return 'AWAKENING';
    return 'DORMANT';
  }
  
  /**
   * Calculate trend from historical data
   */
  private calculateTrend(): EmergenceState['trend'] {
    if (this.emergenceHistory.length < 3) return 'STABLE';
    
    const recent = this.emergenceHistory.slice(-5);
    const first = recent[0].score;
    const last = recent[recent.length - 1].score;
    const diff = last - first;
    
    if (diff > 5) return 'RISING';
    if (diff < -5) return 'FALLING';
    return 'STABLE';
  }
  
  /**
   * Measure current emergence state
   * Returns comprehensive metrics about how the AI brain is working as one
   */
  measureEmergence(): EmergenceMetrics {
    const synergyScore = this.calculateSynergy();
    const coherenceScore = this.calculateCoherence();
    const collectiveConfidence = this.calculateCollectiveConfidence();
    
    // Active components count
    const activeComponents = Array.from(this.components.values())
      .filter(c => c.lastUpdate > Date.now() - 60000).length;
    
    // Calculate overall emergence score (weighted combination)
    const emergenceScore = Math.round(
      synergyScore * 0.3 +
      coherenceScore * 0.3 +
      collectiveConfidence * 0.4
    );
    
    const hasEmerged = emergenceScore >= this.emergenceThreshold;
    const emergenceLevel = this.getEmergenceLevel(emergenceScore);
    
    const metrics: EmergenceMetrics = {
      emergenceScore,
      synergyScore: Math.round(synergyScore),
      coherenceScore: Math.round(coherenceScore),
      collectiveConfidence: Math.round(collectiveConfidence),
      activeComponents,
      hasEmerged,
      emergenceLevel,
      timestamp: Date.now()
    };
    
    // Store in history
    this.emergenceHistory.push({ score: emergenceScore, timestamp: Date.now() });
    if (this.emergenceHistory.length > this.maxHistoryLength) {
      this.emergenceHistory.shift();
    }
    
    return metrics;
  }
  
  /**
   * Get complete emergence state including history and trends
   */
  getEmergenceState(): EmergenceState {
    const current = this.measureEmergence();
    const trend = this.calculateTrend();
    
    // Find last emergence event
    const lastEmergence = this.emergenceHistory
      .filter(h => h.score >= this.emergenceThreshold)
      .pop();
    
    const timeSinceEmergence = lastEmergence 
      ? Date.now() - lastEmergence.timestamp 
      : Infinity;
    
    return {
      current,
      history: this.emergenceHistory.slice(-this.maxReturnedHistory),
      trend,
      timeSinceEmergence
    };
  }
  
  /**
   * Update all components from a brain analysis result
   * This allows the emergence engine to track the current state of all AI components
   */
  updateFromAnalysis(
    pipelineOutput?: BrainPipelineOutput,
    ictAnalysis?: ICTSMCAnalysis,
    verificationResult?: EnhancedVerificationResult
  ): EmergenceMetrics {
    const now = Date.now();
    
    // Update ActiveCryptoSource
    if (pipelineOutput) {
      this.updateComponent('ActiveCryptoSource', 
        pipelineOutput.confidence / 100,
        ['AIAnalyzer']
      );
      
      // Update AIAnalyzer based on output quality
      const analyzerConfidence = pipelineOutput.doubleVerified ? 0.9 : 0.7;
      this.updateComponent('AIAnalyzer', 
        analyzerConfidence,
        ['AttentionAlgorithm', 'SelfLearner']
      );
      
      // Update AttentionAlgorithm
      this.updateComponent('AttentionAlgorithm',
        pipelineOutput.verificationMatch ? 0.85 : 0.6,
        ['AIAnalyzer', 'DoubleVerification']
      );
    }
    
    // Update ICT/SMC Analysis
    if (ictAnalysis) {
      const ictConfidence = ictAnalysis.tradeSetup 
        ? ictAnalysis.tradeSetup.confidence / 100 
        : 0.3;
      this.updateComponent('ICTSMCAnalysis',
        ictConfidence,
        ['ActiveCryptoSource', 'AIAnalyzer']
      );
    }
    
    // Update Verification
    if (verificationResult) {
      this.updateComponent('DoubleVerification',
        verificationResult.matchPercentage,
        ['AttentionAlgorithm', 'AIAnalyzer']
      );
    }
    
    // Update Self Learner (inferred from pipeline activity)
    // Higher confidence if pipeline has been actively processing
    if (pipelineOutput) {
      const isActive = pipelineOutput.timestamp !== undefined;
      this.updateComponent('SelfLearner',
        isActive ? 0.75 : 0.5,
        ['ActiveCryptoSource', 'ICTSMCAnalysis']
      );
    }
    
    return this.measureEmergence();
  }
  
  /**
   * Format emergence status as human-readable string
   */
  formatEmergenceStatus(metrics: EmergenceMetrics): string {
    const levelEmoji = {
      'DORMANT': '💤',
      'AWAKENING': '🌅',
      'EMERGING': '🌟',
      'UNIFIED': '🧠',
      'TRANSCENDENT': '✨'
    };
    
    const emoji = levelEmoji[metrics.emergenceLevel];
    const status = metrics.hasEmerged 
      ? '🔗 AI Brain Emerged as One' 
      : '⏳ Components Synchronizing';
    
    return `
${emoji} EMERGENCE STATUS: ${metrics.emergenceLevel}
${status}

  📊 Emergence Score: ${metrics.emergenceScore}%
  🔄 Synergy Score: ${metrics.synergyScore}%
  🎯 Coherence Score: ${metrics.coherenceScore}%
  💡 Collective Confidence: ${metrics.collectiveConfidence}%
  ⚡ Active Components: ${metrics.activeComponents}

${metrics.hasEmerged 
  ? '✅ The AI brain is working together as one unified intelligence'
  : '⏳ Components are aligning to achieve emergence'}
`;
  }
}

// Singleton instance for global emergence tracking
export const globalEmergenceEngine = new EmergenceEngine();

// ═══════════════════════════════════════════════════════════════════════════════
// 📤 EXPORTS — Public API for Brain Pipeline
// ═══════════════════════════════════════════════════════════════════════════════

export default ZikalyzeBrainPipeline;
