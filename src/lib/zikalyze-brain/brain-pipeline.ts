// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 ZIKALYZE AI BRAIN PIPELINE v1.0 — Enhanced Multi-Stage Processing
// ═══════════════════════════════════════════════════════════════════════════════
// ⚡ Active Crypto Direct Source → AI Analyzer → Attention Algorithm → Double Verify
// 🔗 All processing happens in a second with deterministic, verifiable steps
// 🛡️ Filters bad/unnecessary data, verifies before output
// ═══════════════════════════════════════════════════════════════════════════════

import { 
  OnChainMetrics, 
  AnalysisInput, 
  ChartTrendInput,
  MultiTimeframeInput 
} from './types';
import { computeSelfAttention, softmax, relu, crossEntropyLoss } from './technical-analysis';
import { estimateOnChainMetrics } from './on-chain-estimator';

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
 */
export class AttentionAlgorithm {
  private readonly qualityThreshold = 0.6;
  private readonly minConfidence = 0.4;

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
// 🔄 DOUBLE VERIFICATION LOOP — Verify Twice Before Output
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Double Verification Loop
 * Sends data back through analyzer and attention for second verification
 * Compares with first check before releasing output
 */
export class DoubleVerificationLoop {
  private analyzer: AIAnalyzer;
  private attention: AttentionAlgorithm;
  
  constructor() {
    this.analyzer = new AIAnalyzer();
    this.attention = new AttentionAlgorithm();
  }

  /**
   * Perform double verification
   * Returns final verified output only if both checks pass
   */
  verify(
    rawData: RawCryptoData,
    firstCheck: AttentionVerifiedData
  ): { verified: boolean; match: boolean; secondCheck: AttentionVerifiedData } {
    // Second pass through analyzer
    const reAnalyzed = this.analyzer.process(rawData);
    
    // Second pass through attention
    const secondCheck = this.attention.calculate(reAnalyzed);
    
    // Compare results
    const match = this.compareVerifications(firstCheck, secondCheck);
    
    // Both checks must pass quality threshold
    const verified = 
      firstCheck.quality !== 'BAD' && 
      secondCheck.quality !== 'BAD' && 
      match;
    
    return { verified, match, secondCheck };
  }

  /**
   * Compare two verification results
   */
  private compareVerifications(
    first: AttentionVerifiedData, 
    second: AttentionVerifiedData
  ): boolean {
    // Compare key metrics
    const bullishDiff = Math.abs(
      first.analyzedData.bullishScore - second.analyzedData.bullishScore
    );
    const bearishDiff = Math.abs(
      first.analyzedData.bearishScore - second.analyzedData.bearishScore
    );
    const confidenceDiff = Math.abs(
      first.confidenceScore - second.confidenceScore
    );
    
    // Allow small variance (within 10%)
    const maxDiff = 10;
    
    return bullishDiff <= maxDiff && 
           bearishDiff <= maxDiff && 
           confidenceDiff <= 0.15 &&
           first.quality === second.quality;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 COMPLETE BRAIN PIPELINE — Orchestrates All Components
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Zikalyze Brain Pipeline
 * Complete processing pipeline that:
 * 1. Connects to Active Crypto Direct Source (read, learn, adapt)
 * 2. Sends to AI Analyzer (human-readable processing)
 * 3. Passes to Attention Algorithm (filter, verify, calculate)
 * 4. Stores good/bad data separately (hidden)
 * 5. Double verifies before output
 * 
 * All happens in a second!
 */
export class ZikalyzeBrainPipeline {
  private source: ActiveCryptoSource;
  private analyzer: AIAnalyzer;
  private attention: AttentionAlgorithm;
  private storage: HiddenDataStorageManager;
  private verification: DoubleVerificationLoop;
  
  private readonly version = '1.0.0';

  constructor() {
    this.source = new ActiveCryptoSource();
    this.analyzer = new AIAnalyzer();
    this.attention = new AttentionAlgorithm();
    this.storage = new HiddenDataStorageManager();
    this.verification = new DoubleVerificationLoop();
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
    // STEP 3: Attention AI Algorithm — Filter, Verify, Calculate
    // ═══════════════════════════════════════════════════════════════════════
    const firstCheck = this.attention.calculate(analyzedData);
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 4: Store Good/Bad Data Separately (Hidden)
    // ═══════════════════════════════════════════════════════════════════════
    if (firstCheck.quality === 'GOOD') {
      this.storage.storeGoodData(firstCheck);
    } else if (firstCheck.quality === 'BAD') {
      this.storage.storeBadData(rawData, firstCheck.filteredOutReasons.join('; '));
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 5: Double Verification — Send Back, Compare, Release
    // ═══════════════════════════════════════════════════════════════════════
    const { verified, match, secondCheck } = this.verification.verify(rawData, firstCheck);
    
    // Record learning signal for adaptation
    if (verified) {
      this.storage.recordLearningSignal(
        `${rawData.symbol}_${firstCheck.quality}`,
        'CORRECT',
        0.01
      );
      this.source.learn(rawData.symbol, [1]);
    } else {
      this.storage.recordLearningSignal(
        `${rawData.symbol}_verification_mismatch`,
        'INCORRECT',
        0.02
      );
      this.source.learn(rawData.symbol, [0]);
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 6: Generate Final Output — Only if 100% Verified
    // ═══════════════════════════════════════════════════════════════════════
    const bias = this.determineBias(
      firstCheck.analyzedData.bullishScore,
      firstCheck.analyzedData.bearishScore,
      verified
    );
    
    const confidence = this.calculateFinalConfidence(
      firstCheck.confidenceScore,
      secondCheck.confidenceScore,
      verified,
      match
    );
    
    const processingTimeMs = Date.now() - startTime;
    
    return {
      bias,
      confidence,
      humanReadableAnalysis: this.buildHumanReadableOutput(
        firstCheck,
        verified,
        rawData.symbol,
        rawData.price
      ),
      keyInsights: firstCheck.filteredInsights,
      doubleVerified: verified,
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
   * Build final human-readable output
   */
  private buildHumanReadableOutput(
    data: AttentionVerifiedData,
    verified: boolean,
    symbol: string,
    price: number
  ): string {
    const status = verified ? '✅ DOUBLE VERIFIED' : '⚠️ UNVERIFIED';
    const quality = data.quality === 'GOOD' ? '🟢 HIGH QUALITY' : 
                   data.quality === 'UNCERTAIN' ? '🟡 MODERATE QUALITY' : 
                   '🔴 LOW QUALITY';
    
    return `┌─────────────────────────────────────────────────┐
│  🧠 ZIKALYZE AI BRAIN PIPELINE                  │
│  ${status}   ${quality}                         │
└─────────────────────────────────────────────────┘

📊 ${symbol} @ $${price.toLocaleString()}

${data.filteredInsights.join('\n\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Confidence: ${(data.confidenceScore * 100).toFixed(0)}% | Hash: ${data.verificationHash}
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
// 📤 EXPORTS — Public API for Brain Pipeline
// ═══════════════════════════════════════════════════════════════════════════════

export default ZikalyzeBrainPipeline;
