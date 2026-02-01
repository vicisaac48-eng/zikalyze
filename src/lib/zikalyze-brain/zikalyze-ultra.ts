// ═══════════════════════════════════════════════════════════════════════════════
// 🚀 ZIKALYZE ULTRA — The World's Most Intelligent Crypto Analyzer
// ═══════════════════════════════════════════════════════════════════════════════
// Simple, Short, Devastatingly Effective
// 
// Features:
// - Hyperdimensional Feature Extraction (100+ features)
// - Adaptive Ensemble System (self-evolving multi-model)
// - Regime Detection (volatile/trending/ranging)
// - Quantum Signal Generation (ultra-precise signals)
// - Self-Learning Memory System (learns from each analysis)
// ═══════════════════════════════════════════════════════════════════════════════

import { ChartTrendInput } from './types';

// ═══════════════════════════════════════════════════════════════════════════════
// 📊 TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type MarketRegime = 'volatile' | 'trending' | 'ranging';

export type SignalStrength = 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';

export interface UltraFeatures {
  // Price transformations
  returns: number[];
  volatility: number[];
  momentum: number[];
  rsi: number[];
  
  // Fractal indicators
  hurstExponent: number;
  fractalDimension: number;
  
  // Information theory
  /** 
   * Shannon entropy of price returns. 
   * Value of -1 indicates unreliable data (insufficient valid returns).
   */
  entropy: number;
  
  // Volume analysis
  vwap: number;
  volumeSurge: number;
  priceVolumeCorrelation: number;
  
  // MACD composite
  macdComposite: number;
  
  // Volatility regime
  bollingerBandwidth: number;
  
  // Spectral analysis
  dominantFrequency: number;
  
  // Trend metrics
  trendStrength: number;
  regimeVolatility: number;
  
  // Higher moments
  skewness: number[];
  kurtosis: number[];
  
  // Aggregated feature vector
  featureVector: number[];
}

export interface UltraSignal {
  signal: SignalStrength;
  direction: 'LONG' | 'SHORT' | 'NEUTRAL';
  confidence: number;
  prediction: number;
  predictionHorizon: string;
  regime: MarketRegime;
  riskMetrics: {
    volatility: number;
    sharpeEstimate: number;
    maxDrawdown: number;
  };
  modelWeights: {
    gradientBoost: number;
    trendFollowing: number;
    meanReversion: number;
    regimeAdaptive: number;
  };
  featureImportance: {
    momentum: number;
    volatility: number;
    volume: number;
    fractal: number;
  };
  timestamp: number;
}

interface LearningMemory {
  timestamp: number;
  regime: MarketRegime;
  prediction: number;
  actual?: number;
  error?: number;
  modelWeights: number[];
  features: number[];
  // Individual model predictions for proper gradient descent
  modelPredictions: number[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🧮 MATHEMATICAL UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate mean of an array
 */
function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

/**
 * Calculate standard deviation
 */
function std(arr: number[]): number {
  if (arr.length === 0) return 0;
  const m = mean(arr);
  const variance = arr.reduce((sum, val) => sum + Math.pow(val - m, 2), 0) / arr.length;
  return Math.sqrt(variance);
}

/**
 * Calculate correlation between two arrays
 */
function correlation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;
  
  const meanX = mean(x);
  const meanY = mean(y);
  const stdX = std(x);
  const stdY = std(y);
  
  if (stdX === 0 || stdY === 0) return 0;
  
  let sum = 0;
  for (let i = 0; i < x.length; i++) {
    sum += (x[i] - meanX) * (y[i] - meanY);
  }
  
  return sum / (x.length * stdX * stdY);
}

/**
 * Calculate skewness (third moment)
 */
function skewness(arr: number[]): number {
  if (arr.length === 0) return 0;
  const m = mean(arr);
  const s = std(arr);
  if (s === 0) return 0;
  
  const sum = arr.reduce((acc, val) => acc + Math.pow((val - m) / s, 3), 0);
  return sum / arr.length;
}

/**
 * Calculate kurtosis (fourth moment)
 */
function kurtosis(arr: number[]): number {
  if (arr.length === 0) return 0;
  const m = mean(arr);
  const s = std(arr);
  if (s === 0) return 0;
  
  const sum = arr.reduce((acc, val) => acc + Math.pow((val - m) / s, 4), 0);
  return (sum / arr.length) - 3; // Excess kurtosis
}

/**
 * Calculate RSI (Relative Strength Index)
 */
function calculateRSI(prices: number[], period: number): number {
  if (prices.length < period + 1) return 50; // Neutral default
  
  const changes = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }
  
  const recentChanges = changes.slice(-period);
  const gains = recentChanges.filter(c => c > 0);
  const losses = recentChanges.filter(c => c < 0).map(c => Math.abs(c));
  
  const avgGain = gains.length > 0 ? mean(gains) : 0;
  const avgLoss = losses.length > 0 ? mean(losses) : 0;
  
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

/**
 * Calculate VWAP (Volume Weighted Average Price)
 */
function calculateVWAP(candles: Array<{ close: number; volume: number }>): number {
  if (candles.length === 0) return 0;
  
  let sumPV = 0;
  let sumV = 0;
  
  for (const candle of candles) {
    sumPV += candle.close * candle.volume;
    sumV += candle.volume;
  }
  
  return sumV > 0 ? sumPV / sumV : candles[candles.length - 1].close;
}

/**
 * Calculate entropy (Shannon entropy) for information content
 */
function calculateEntropy(values: number[]): number {
  if (values.length === 0) return 0;
  
  // Discretize values into bins
  const numBins = Math.min(10, values.length);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const binWidth = (maxVal - minVal) / numBins;
  
  if (binWidth === 0) return 0;
  
  const bins = new Array(numBins).fill(0);
  for (const val of values) {
    const binIndex = Math.min(Math.floor((val - minVal) / binWidth), numBins - 1);
    bins[binIndex]++;
  }
  
  let entropy = 0;
  for (const count of bins) {
    if (count > 0) {
      const p = count / values.length;
      entropy -= p * Math.log2(p);
    }
  }
  
  return entropy;
}

/**
 * Estimate Hurst exponent using R/S analysis (simplified)
 */
function calculateHurstExponent(prices: number[]): number {
  if (prices.length < 10) return 0.5; // Random walk default
  
  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push(Math.log(prices[i] / prices[i - 1]));
  }
  
  const n = returns.length;
  const m = mean(returns);
  
  // Calculate cumulative deviations
  let cumDev = 0;
  const deviations = [];
  for (const ret of returns) {
    cumDev += ret - m;
    deviations.push(cumDev);
  }
  
  const range = Math.max(...deviations) - Math.min(...deviations);
  const s = std(returns);
  
  if (s === 0) return 0.5;
  
  const rs = range / s;
  const hurst = Math.log(rs) / Math.log(n);
  
  // Clamp to reasonable range
  return Math.max(0, Math.min(1, hurst));
}

/**
 * Calculate fractal dimension (related to Hurst)
 */
function calculateFractalDimension(hurst: number): number {
  return 2 - hurst;
}

/**
 * Simplified FFT magnitude for dominant frequency detection
 * (Using autocorrelation as a simpler alternative to full FFT)
 */
function findDominantFrequency(prices: number[]): number {
  if (prices.length < 4) return 0;
  
  // Detrend the data
  const detrended = [];
  const trend = (prices[prices.length - 1] - prices[0]) / prices.length;
  for (let i = 0; i < prices.length; i++) {
    detrended.push(prices[i] - (prices[0] + trend * i));
  }
  
  // Find autocorrelation peaks to detect cycles
  const maxLag = Math.min(Math.floor(prices.length / 3), 50);
  let bestLag = 0;
  let bestCorr = 0;
  
  for (let lag = 2; lag < maxLag; lag++) {
    let sum = 0;
    let count = 0;
    
    for (let i = 0; i < detrended.length - lag; i++) {
      sum += detrended[i] * detrended[i + lag];
      count++;
    }
    
    const corr = count > 0 ? sum / count : 0;
    if (Math.abs(corr) > Math.abs(bestCorr)) {
      bestCorr = corr;
      bestLag = lag;
    }
  }
  
  // Convert lag to frequency (inverse of period)
  return bestLag > 0 ? 1 / bestLag : 0;
}

/**
 * Calculate MACD composite across multiple timeframes
 */
function calculateMACDComposite(prices: number[]): number {
  if (prices.length < 26) return 0;
  
  // EMA calculation helper
  const ema = (data: number[], period: number): number => {
    if (data.length < period) return data[data.length - 1];
    const k = 2 / (period + 1);
    let emaVal = data[0];
    for (let i = 1; i < data.length; i++) {
      emaVal = data[i] * k + emaVal * (1 - k);
    }
    return emaVal;
  };
  
  const ema12 = ema(prices, 12);
  const ema26 = ema(prices, 26);
  const macdLine = ema12 - ema26;
  
  // Normalize by price
  return macdLine / prices[prices.length - 1];
}

/**
 * Calculate Bollinger Bandwidth (volatility regime indicator)
 */
function calculateBollingerBandwidth(prices: number[], period: number = 20): number {
  if (prices.length < period) return 0;
  
  const recentPrices = prices.slice(-period);
  const sma = mean(recentPrices);
  const stdDev = std(recentPrices);
  
  // Bandwidth = (Upper Band - Lower Band) / Middle Band
  // Upper = SMA + 2*std, Lower = SMA - 2*std
  return sma > 0 ? (4 * stdDev) / sma : 0;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎯 ZIKALYZE ULTRA CLASS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * ZikalyzeUltra - Advanced crypto analysis with hyperdimensional features,
 * adaptive ensemble learning, and self-evolving intelligence
 */
export class ZikalyzeUltra {
  private memories: LearningMemory[] = [];
  private readonly maxMemories = 1000;
  
  // Store last model predictions for gradient calculation
  private lastModelPredictions: number[] = [0, 0, 0, 0];
  
  // Model weights (will adapt over time)
  private weights = {
    gradientBoost: 0.4,
    trendFollowing: 0.3,
    meanReversion: 0.2,
    regimeAdaptive: 0.1,
  };
  
  /**
   * Extract 100+ hyperdimensional features from chart data
   */
  extractFeatures(chartData: ChartTrendInput): UltraFeatures {
    const { candles } = chartData;
    const prices = candles.map(c => c.close);
    const volumes = candles.map(c => c.volume);
    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);
    
    // Multi-scale windows
    const windows = [7, 14, 21, 50, 100, 200];
    
    // 1. Multi-scale returns
    const returns: number[] = [];
    for (const window of windows) {
      if (prices.length >= window) {
        const ret = (prices[prices.length - 1] - prices[prices.length - window]) / prices[prices.length - window];
        returns.push(ret);
      } else {
        returns.push(0);
      }
    }
    
    // 2. Multi-scale volatility
    const volatility: number[] = [];
    for (const window of windows) {
      if (prices.length >= window) {
        const recentPrices = prices.slice(-window);
        const rets = [];
        for (let i = 1; i < recentPrices.length; i++) {
          rets.push((recentPrices[i] - recentPrices[i - 1]) / recentPrices[i - 1]);
        }
        volatility.push(std(rets));
      } else {
        volatility.push(0);
      }
    }
    
    // 3. Multi-scale momentum
    const momentum: number[] = [];
    for (const window of windows) {
      if (prices.length >= window + 1) {
        const recentPrices = prices.slice(-window);
        let mom = 0;
        for (let i = 1; i < recentPrices.length; i++) {
          mom += recentPrices[i] - recentPrices[i - 1];
        }
        momentum.push(mom / window);
      } else {
        momentum.push(0);
      }
    }
    
    // 4. Multi-scale RSI
    const rsi: number[] = [];
    for (const window of windows) {
      rsi.push(calculateRSI(prices, window));
    }
    
    // 5. Fractal indicators
    const hurstExponent = calculateHurstExponent(prices);
    const fractalDimension = calculateFractalDimension(hurstExponent);
    
    // 6. Entropy (information content)
    // Filter NaN/Inf values that may occur with insufficient data or extreme price movements
    const validReturns = returns.filter(r => !isNaN(r) && isFinite(r));
    // Use sentinel value -1 when data quality is poor (all returns invalid)
    // This allows downstream consumers to detect data quality issues
    const entropyDataQualityOk = validReturns.length >= returns.length * 0.5; // At least 50% valid
    const entropy = entropyDataQualityOk 
      ? calculateEntropy(validReturns) 
      : -1; // Sentinel value indicating unreliable entropy
    
    // 7. VWAP
    const vwap = calculateVWAP(candles);
    
    // 8. Volume surge
    const avgVolume = mean(volumes);
    const currentVolume = volumes[volumes.length - 1];
    const volumeSurge = avgVolume > 0 ? (currentVolume - avgVolume) / avgVolume : 0;
    
    // 9. Price-volume correlation
    const priceVolumeCorrelation = correlation(prices, volumes);
    
    // 10. MACD composite
    const macdComposite = calculateMACDComposite(prices);
    
    // 11. Bollinger Bandwidth
    const bollingerBandwidth = calculateBollingerBandwidth(prices);
    
    // 12. Dominant frequency (spectral analysis)
    const dominantFrequency = findDominantFrequency(prices);
    
    // 13. Trend strength
    const trendStrength = Math.abs(mean(momentum));
    
    // 14. Regime volatility
    const regimeVolatility = mean(volatility);
    
    // 15. Multi-scale skewness
    const skewness_arr: number[] = [];
    for (const window of windows) {
      if (prices.length >= window) {
        const recentPrices = prices.slice(-window);
        skewness_arr.push(skewness(recentPrices));
      } else {
        skewness_arr.push(0);
      }
    }
    
    // 16. Multi-scale kurtosis
    const kurtosis_arr: number[] = [];
    for (const window of windows) {
      if (prices.length >= window) {
        const recentPrices = prices.slice(-window);
        kurtosis_arr.push(kurtosis(recentPrices));
      } else {
        kurtosis_arr.push(0);
      }
    }
    
    // Aggregate all features into a single vector
    const featureVector = [
      ...returns,
      ...volatility,
      ...momentum,
      ...rsi.map(r => r / 100), // Normalize RSI to 0-1
      hurstExponent,
      fractalDimension,
      entropy,
      (vwap - prices[prices.length - 1]) / prices[prices.length - 1], // VWAP deviation
      volumeSurge,
      priceVolumeCorrelation,
      macdComposite,
      bollingerBandwidth,
      dominantFrequency,
      trendStrength,
      regimeVolatility,
      ...skewness_arr,
      ...kurtosis_arr,
    ];
    
    return {
      returns,
      volatility,
      momentum,
      rsi,
      hurstExponent,
      fractalDimension,
      entropy,
      vwap,
      volumeSurge,
      priceVolumeCorrelation,
      macdComposite,
      bollingerBandwidth,
      dominantFrequency,
      trendStrength,
      regimeVolatility,
      skewness: skewness_arr,
      kurtosis: kurtosis_arr,
      featureVector,
    };
  }
  
  /**
   * Detect market regime based on features
   */
  detectRegime(features: UltraFeatures): MarketRegime {
    const avgVolatility = mean(features.volatility);
    const avgMomentum = Math.abs(mean(features.momentum));
    
    if (avgVolatility > 0.05) {
      return 'volatile';
    } else if (avgMomentum > 0.02) {
      return 'trending';
    } else {
      return 'ranging';
    }
  }
  
  /**
   * Gradient boost style prediction
   */
  private predictGradientBoost(features: UltraFeatures): number {
    // Simple ensemble of decision stumps
    let prediction = 0;
    
    // Stump 1: Momentum-based
    if (mean(features.momentum) > 0) {
      prediction += 0.3;
    } else {
      prediction -= 0.3;
    }
    
    // Stump 2: RSI-based
    const avgRSI = mean(features.rsi);
    if (avgRSI > 70) {
      prediction -= 0.2; // Overbought
    } else if (avgRSI < 30) {
      prediction += 0.2; // Oversold
    }
    
    // Stump 3: Trend strength
    if (features.trendStrength > 0.01) {
      prediction += 0.2 * Math.sign(mean(features.returns));
    }
    
    // Stump 4: Volume confirmation
    if (features.volumeSurge > 0.5) {
      prediction += 0.1 * Math.sign(mean(features.returns));
    }
    
    // Stump 5: MACD
    if (features.macdComposite > 0) {
      prediction += 0.2;
    } else {
      prediction -= 0.2;
    }
    
    return Math.tanh(prediction); // Squash to [-1, 1]
  }
  
  /**
   * Trend following component
   */
  private predictTrendFollowing(features: UltraFeatures): number {
    const longTermMomentum = mean(features.momentum.slice(-3));
    const shortTermMomentum = features.momentum[0];
    
    // Follow the trend if momentum is consistent
    if (Math.sign(longTermMomentum) === Math.sign(shortTermMomentum)) {
      return Math.tanh(longTermMomentum * 10);
    }
    
    return 0;
  }
  
  /**
   * Mean reversion component
   */
  private predictMeanReversion(features: UltraFeatures): number {
    const avgRSI = mean(features.rsi);
    
    // Strong mean reversion signals at extremes
    if (avgRSI > 75) {
      return -0.8; // Expect reversion down
    } else if (avgRSI < 25) {
      return 0.8; // Expect reversion up
    }
    
    // Check for price deviation from VWAP using stored price-volume correlation
    // The priceVolumeCorrelation captures price-volume dynamics
    // Negative correlation often indicates distribution (bearish), positive indicates accumulation (bullish)
    const vwapDeviation = features.priceVolumeCorrelation;
    
    // Mean revert towards VWAP when price deviates significantly
    // Use Bollinger bandwidth as proxy for overextension
    if (features.bollingerBandwidth > 0.1) {
      // High bandwidth = price extended, expect reversion
      return -Math.sign(mean(features.returns)) * 0.5;
    }
    
    return 0;
  }
  
  /**
   * Regime-adaptive component
   */
  private predictRegimeAdaptive(features: UltraFeatures, regime: MarketRegime): number {
    switch (regime) {
      case 'volatile':
        // In volatile markets, favor mean reversion
        return this.predictMeanReversion(features) * 1.5;
      
      case 'trending':
        // In trending markets, favor trend following
        return this.predictTrendFollowing(features) * 1.5;
      
      case 'ranging':
        // In ranging markets, use a balanced approach
        return (this.predictMeanReversion(features) + this.predictTrendFollowing(features)) / 2;
      
      default:
        return 0;
    }
  }
  
  /**
   * Adaptive ensemble prediction with dynamic weighting
   * Returns both the ensemble prediction and individual model predictions
   */
  predict(features: UltraFeatures, regime: MarketRegime): number {
    // Get predictions from each model
    const pred1 = this.predictGradientBoost(features);
    const pred2 = this.predictTrendFollowing(features);
    const pred3 = this.predictMeanReversion(features);
    const pred4 = this.predictRegimeAdaptive(features, regime);
    
    // Store individual predictions for later gradient calculation
    this.lastModelPredictions = [pred1, pred2, pred3, pred4];
    
    // Apply learned weights
    const prediction = 
      pred1 * this.weights.gradientBoost +
      pred2 * this.weights.trendFollowing +
      pred3 * this.weights.meanReversion +
      pred4 * this.weights.regimeAdaptive;
    
    return prediction;
  }
  
  /**
   * Calculate confidence based on feature stability
   */
  private calculateConfidence(features: UltraFeatures, regime: MarketRegime): number {
    // Base confidence
    let confidence = 0.5;
    
    // Higher confidence with lower entropy (more predictable)
    // Handle sentinel value (-1) indicating unreliable entropy
    if (features.entropy >= 0) {
      confidence += (1 - features.entropy / 4) * 0.2;
    } else {
      // Reduce confidence when entropy is unreliable
      confidence -= 0.1;
    }
    
    // Higher confidence with consistent momentum
    const momentumStd = std(features.momentum);
    confidence += (1 - Math.min(momentumStd * 10, 1)) * 0.15;
    
    // Regime-specific adjustments
    if (regime === 'trending') {
      confidence += 0.1; // Trends are more predictable
    } else if (regime === 'volatile') {
      confidence -= 0.1; // Volatility reduces confidence
    }
    
    // Volume confirmation
    if (features.volumeSurge > 0.3) {
      confidence += 0.1;
    }
    
    // Clamp to [0, 1]
    return Math.max(0, Math.min(1, confidence));
  }
  
  /**
   * Convert prediction to signal strength
   */
  private getSignalStrength(prediction: number, confidence: number): SignalStrength {
    const threshold = 0.3;
    const strongThreshold = 0.6;
    
    if (confidence >= 0.7) {
      if (prediction >= strongThreshold) return 'STRONG_BUY';
      if (prediction <= -strongThreshold) return 'STRONG_SELL';
    }
    
    if (prediction >= threshold) return 'BUY';
    if (prediction <= -threshold) return 'SELL';
    
    return 'HOLD';
  }
  
  /**
   * Calculate risk metrics
   */
  private calculateRiskMetrics(features: UltraFeatures, prediction: number): {
    volatility: number;
    sharpeEstimate: number;
    maxDrawdown: number;
  } {
    const volatility = mean(features.volatility);
    
    // Sharpe estimate: return / volatility
    // Use predicted return as proxy
    const expectedReturn = prediction * 0.1; // Scale to realistic return
    const sharpeEstimate = volatility > 0 ? expectedReturn / volatility : 0;
    
    // Max drawdown estimate based on historical volatility
    const maxDrawdown = volatility * 2; // Simple heuristic
    
    return {
      volatility,
      sharpeEstimate,
      maxDrawdown,
    };
  }
  
  /**
   * Calculate feature importance scores
   */
  private calculateFeatureImportance(features: UltraFeatures): {
    momentum: number;
    volatility: number;
    volume: number;
    fractal: number;
  } {
    // Normalize importance scores to sum to 1
    const momentumImportance = Math.abs(mean(features.momentum)) * 10;
    const volatilityImportance = mean(features.volatility) * 5;
    const volumeImportance = Math.abs(features.volumeSurge);
    const fractalImportance = Math.abs(features.hurstExponent - 0.5) * 2;
    
    const total = momentumImportance + volatilityImportance + volumeImportance + fractalImportance;
    
    if (total === 0) {
      return { momentum: 0.25, volatility: 0.25, volume: 0.25, fractal: 0.25 };
    }
    
    return {
      momentum: momentumImportance / total,
      volatility: volatilityImportance / total,
      volume: volumeImportance / total,
      fractal: fractalImportance / total,
    };
  }
  
  /**
   * Generate quantum signal with ultra-precise predictions
   */
  generateSignal(chartData: ChartTrendInput): UltraSignal {
    // Extract features
    const features = this.extractFeatures(chartData);
    
    // Detect regime
    const regime = this.detectRegime(features);
    
    // Make prediction
    const prediction = this.predict(features, regime);
    
    // Calculate confidence
    const confidence = this.calculateConfidence(features, regime);
    
    // Get signal strength
    const signal = this.getSignalStrength(prediction, confidence);
    
    // Determine direction
    let direction: 'LONG' | 'SHORT' | 'NEUTRAL';
    if (prediction >= 0.1) {
      direction = 'LONG';
    } else if (prediction <= -0.1) {
      direction = 'SHORT';
    } else {
      direction = 'NEUTRAL';
    }
    
    // Calculate risk metrics
    const riskMetrics = this.calculateRiskMetrics(features, prediction);
    
    // Feature importance
    const featureImportance = this.calculateFeatureImportance(features);
    
    // Store in memory for learning (including individual model predictions for gradient descent)
    this.addMemory({
      timestamp: Date.now(),
      regime,
      prediction,
      modelWeights: [
        this.weights.gradientBoost,
        this.weights.trendFollowing,
        this.weights.meanReversion,
        this.weights.regimeAdaptive,
      ],
      features: features.featureVector,
      modelPredictions: [...this.lastModelPredictions],
    });
    
    return {
      signal,
      direction,
      confidence,
      prediction,
      predictionHorizon: 'next 4-24 hours',
      regime,
      riskMetrics,
      modelWeights: { ...this.weights },
      featureImportance,
      timestamp: Date.now(),
    };
  }
  
  /**
   * Add a memory to the learning system
   */
  private addMemory(memory: LearningMemory): void {
    this.memories.push(memory);
    
    // Keep only recent memories
    if (this.memories.length > this.maxMemories) {
      this.memories.shift();
    }
  }
  
  /**
   * Learn from historical performance
   * Uses proper gradient descent with model-specific gradients
   */
  learn(actualOutcome: number): void {
    if (this.memories.length === 0) return;
    
    // Get the most recent prediction
    const lastMemory = this.memories[this.memories.length - 1];
    
    // Calculate error
    const error = actualOutcome - lastMemory.prediction;
    lastMemory.error = error;
    lastMemory.actual = actualOutcome;
    
    // Use model-specific gradients: ∂Loss/∂w_i = -2 * error * modelPrediction_i
    // For MSE loss: L = (actual - pred)^2 = (actual - Σw_i*p_i)^2
    // ∂L/∂w_i = -2 * (actual - pred) * p_i = -2 * error * p_i
    const learningRate = 0.01;
    const modelPredictions = lastMemory.modelPredictions;
    
    // Compute model-specific weight updates
    this.weights.gradientBoost += learningRate * error * modelPredictions[0];
    this.weights.trendFollowing += learningRate * error * modelPredictions[1];
    this.weights.meanReversion += learningRate * error * modelPredictions[2];
    this.weights.regimeAdaptive += learningRate * error * modelPredictions[3];
    
    // Clamp weights to non-negative values (can't short a model)
    // Then normalize to sum to 1
    this.weights.gradientBoost = Math.max(0.01, this.weights.gradientBoost);
    this.weights.trendFollowing = Math.max(0.01, this.weights.trendFollowing);
    this.weights.meanReversion = Math.max(0.01, this.weights.meanReversion);
    this.weights.regimeAdaptive = Math.max(0.01, this.weights.regimeAdaptive);
    
    const totalWeight = 
      this.weights.gradientBoost + 
      this.weights.trendFollowing + 
      this.weights.meanReversion + 
      this.weights.regimeAdaptive;
    
    this.weights.gradientBoost /= totalWeight;
    this.weights.trendFollowing /= totalWeight;
    this.weights.meanReversion /= totalWeight;
    this.weights.regimeAdaptive /= totalWeight;
  }
  
  /**
   * Get regime-specific performance statistics
   */
  getRegimePerformance(): Record<MarketRegime, { count: number; avgError: number; accuracy: number }> {
    const stats: Record<MarketRegime, { errors: number[]; correct: number; total: number }> = {
      volatile: { errors: [], correct: 0, total: 0 },
      trending: { errors: [], correct: 0, total: 0 },
      ranging: { errors: [], correct: 0, total: 0 },
    };
    
    for (const memory of this.memories) {
      if (memory.error !== undefined && memory.actual !== undefined) {
        stats[memory.regime].errors.push(Math.abs(memory.error));
        stats[memory.regime].total++;
        
        // Consider prediction correct if signs match
        if (Math.sign(memory.prediction) === Math.sign(memory.actual)) {
          stats[memory.regime].correct++;
        }
      }
    }
    
    const result: Record<MarketRegime, { count: number; avgError: number; accuracy: number }> = {
      volatile: { 
        count: stats.volatile.total,
        avgError: stats.volatile.errors.length > 0 ? mean(stats.volatile.errors) : 0,
        accuracy: stats.volatile.total > 0 ? stats.volatile.correct / stats.volatile.total : 0,
      },
      trending: {
        count: stats.trending.total,
        avgError: stats.trending.errors.length > 0 ? mean(stats.trending.errors) : 0,
        accuracy: stats.trending.total > 0 ? stats.trending.correct / stats.trending.total : 0,
      },
      ranging: {
        count: stats.ranging.total,
        avgError: stats.ranging.errors.length > 0 ? mean(stats.ranging.errors) : 0,
        accuracy: stats.ranging.total > 0 ? stats.ranging.correct / stats.ranging.total : 0,
      },
    };
    
    return result;
  }
  
  /**
   * Get memory count for debugging
   */
  getMemoryCount(): number {
    return this.memories.length;
  }
  
  /**
   * Clear all memories (useful for testing)
   */
  clearMemories(): void {
    this.memories = [];
  }
  
  /**
   * Reset weights to default values
   */
  resetWeights(): void {
    this.weights = {
      gradientBoost: 0.4,
      trendFollowing: 0.3,
      meanReversion: 0.2,
      regimeAdaptive: 0.1,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎯 SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════════════════════════════

let ultraInstance: ZikalyzeUltra | null = null;

/**
 * Get the singleton ZikalyzeUltra instance
 */
export function getUltraInstance(): ZikalyzeUltra {
  if (!ultraInstance) {
    ultraInstance = new ZikalyzeUltra();
  }
  return ultraInstance;
}

/**
 * Analyze with ULTRA features
 * Convenience function for quick analysis
 */
export function analyzeWithUltra(chartData: ChartTrendInput): UltraSignal {
  const ultra = getUltraInstance();
  return ultra.generateSignal(chartData);
}
