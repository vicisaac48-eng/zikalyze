// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 ZIKALYZE NEURAL ENGINE — True AI with Learning, NLP & Backtesting
// ═══════════════════════════════════════════════════════════════════════════════
//
// This module addresses the four key limitations:
// ✅ 1. TRUE NEURAL NETWORK — Multi-layer perceptron with trainable weights
// ✅ 2. PERSISTENT LEARNING — Learns from prediction outcomes using gradient descent
// ✅ 3. NLP CAPABILITIES — Sentiment analysis for news and social media text
// ✅ 4. BACKTESTING FRAMEWORK — Validate predictions against historical data
//
// 100% client-side, runs in browser, no external dependencies
// ═══════════════════════════════════════════════════════════════════════════════

import { ChartTrendInput } from './types';

// ═══════════════════════════════════════════════════════════════════════════════
// 🔧 CONFIGURATION CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

/** Feature vector dimensions for neural network input */
const FEATURE_VECTOR_SIZE = 20;

/** Small epsilon value for numerical stability */
const EPSILON = 1e-12;

/** Threshold for considering a prediction CORRECT for LONG direction (% price increase) */
const PROFIT_THRESHOLD = 0.5;

/** Threshold for considering a prediction CORRECT for SHORT direction (% price decrease) */
const LOSS_THRESHOLD = -0.5;

/** Number of keyword matches for 100% NLP confidence */
const CONFIDENCE_KEYWORD_THRESHOLD = 5;

/** Maximum NLP influence on confidence (20%) */
const NLP_CONFIDENCE_WEIGHT = 0.2;

/** Penalty factor when NN and NLP disagree */
const DISAGREEMENT_PENALTY = 0.7;

/** Trading days per year for Sharpe ratio annualization */
const TRADING_DAYS_PER_YEAR = 252;

/** Maximum timeline records to save in localStorage */
const MAX_TIMELINE_STORAGE = 100;

// ═══════════════════════════════════════════════════════════════════════════════
// 📊 TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface NeuralWeights {
  // Layer 1: Input → Hidden1 (feature_dim → 64)
  W1: number[][];
  b1: number[];
  // Layer 2: Hidden1 → Hidden2 (64 → 32)
  W2: number[][];
  b2: number[];
  // Layer 3: Hidden2 → Output (32 → 3 for LONG/SHORT/NEUTRAL)
  W3: number[][];
  b3: number[];
  // Training metadata
  trainingEpochs: number;
  lastTrainingLoss: number;
  lastUpdated: number;
}

export interface NLPSentiment {
  score: number;           // -1 (bearish) to +1 (bullish)
  confidence: number;      // 0-1
  sources: string[];       // What text was analyzed
  bullishKeywords: string[];
  bearishKeywords: string[];
  neutralKeywords: string[];
  timestamp: number;
}

export interface BacktestResult {
  totalPredictions: number;
  correctPredictions: number;
  accuracy: number;
  profitFactor: number;
  maxDrawdown: number;
  sharpeRatio: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  byDirection: {
    long: { count: number; correct: number; accuracy: number };
    short: { count: number; correct: number; accuracy: number };
    neutral: { count: number; correct: number; accuracy: number };
  };
  byTimeframe: Record<string, { count: number; correct: number; accuracy: number }>;
  timeline: Array<{ timestamp: number; prediction: number; actual: number; correct: boolean }>;
}

export interface PredictionRecord {
  timestamp: number;
  features: number[];
  prediction: 'LONG' | 'SHORT' | 'NEUTRAL';
  confidence: number;
  priceAtPrediction: number;
  priceAfter?: number;
  outcome?: 'CORRECT' | 'INCORRECT' | 'PENDING';
  returnPercent?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🧮 NEURAL NETWORK IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Xavier/Glorot initialization for weights
 */
function xavierInit(fanIn: number, fanOut: number): number[][] {
  const stddev = Math.sqrt(2.0 / (fanIn + fanOut));
  const weights: number[][] = [];
  for (let i = 0; i < fanOut; i++) {
    const row: number[] = [];
    for (let j = 0; j < fanIn; j++) {
      // Box-Muller transform for normal distribution
      const u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      row.push(z * stddev);
    }
    weights.push(row);
  }
  return weights;
}

/**
 * Initialize neural network weights
 */
function initializeWeights(inputDim: number = FEATURE_VECTOR_SIZE): NeuralWeights {
  return {
    W1: xavierInit(inputDim, 64),
    b1: new Array(64).fill(0),
    W2: xavierInit(64, 32),
    b2: new Array(32).fill(0),
    W3: xavierInit(32, 3),
    b3: new Array(3).fill(0),
    trainingEpochs: 0,
    lastTrainingLoss: Infinity,
    lastUpdated: Date.now()
  };
}

/**
 * ReLU activation
 */
function relu(x: number): number {
  return Math.max(0, x);
}

/**
 * ReLU derivative for backprop
 */
function reluDerivative(x: number): number {
  return x > 0 ? 1 : 0;
}

/**
 * Softmax for output layer
 */
function softmax(logits: number[]): number[] {
  const max = Math.max(...logits);
  const exps = logits.map(l => Math.exp(l - max));
  const sum = exps.reduce((a, b) => a + b, 0) + EPSILON;
  return exps.map(e => e / sum);
}

/**
 * Matrix-vector multiplication
 */
function matVecMul(mat: number[][], vec: number[]): number[] {
  return mat.map(row => {
    let sum = 0;
    for (let i = 0; i < row.length && i < vec.length; i++) {
      sum += row[i] * vec[i];
    }
    return sum;
  });
}

/**
 * Add bias vector
 */
function addBias(vec: number[], bias: number[]): number[] {
  return vec.map((v, i) => v + (bias[i] || 0));
}

/**
 * Cross-entropy loss
 */
function crossEntropyLoss(target: number[], pred: number[]): number {
  let loss = 0;
  for (let i = 0; i < target.length; i++) {
    loss -= target[i] * Math.log(Math.max(EPSILON, pred[i]));
  }
  return loss;
}

/**
 * Neural Network class with training capabilities
 */
export class ZikalyzeNeuralNetwork {
  private weights: NeuralWeights;
  private learningRate: number = 0.001;
  private predictionHistory: PredictionRecord[] = [];
  private readonly maxHistory: number = 10000;
  private readonly storageKey = 'zikalyze_neural_weights';
  private readonly historyKey = 'zikalyze_prediction_history';

  constructor() {
    this.weights = this.loadWeights() || initializeWeights(20);
    this.predictionHistory = this.loadHistory();
  }

  /**
   * Forward pass through the network
   */
  forward(features: number[]): { probs: number[]; logits: number[]; hidden1: number[]; hidden2: number[] } {
    // Normalize features
    const normalized = this.normalizeFeatures(features);
    
    // Layer 1
    const z1 = addBias(matVecMul(this.weights.W1, normalized), this.weights.b1);
    const hidden1 = z1.map(relu);
    
    // Layer 2
    const z2 = addBias(matVecMul(this.weights.W2, hidden1), this.weights.b2);
    const hidden2 = z2.map(relu);
    
    // Output layer
    const logits = addBias(matVecMul(this.weights.W3, hidden2), this.weights.b3);
    const probs = softmax(logits);
    
    return { probs, logits, hidden1, hidden2 };
  }

  /**
   * Normalize input features to [0, 1] range
   */
  private normalizeFeatures(features: number[]): number[] {
    // Ensure consistent feature vector size
    const padded = [...features];
    while (padded.length < 20) padded.push(0);
    
    // Normalize each feature
    return padded.slice(0, 20).map((f, i) => {
      // Price features (0-3): divide by max expected value
      if (i < 4) return Math.tanh(f / 100000);
      // Percentage features (4-7): divide by 100
      if (i < 8) return Math.tanh(f / 100);
      // Score features (8-15): already 0-100, normalize
      if (i < 16) return f / 100;
      // Other features
      return Math.tanh(f);
    });
  }

  /**
   * Predict direction from features
   */
  predict(features: number[]): { direction: 'LONG' | 'SHORT' | 'NEUTRAL'; confidence: number; probs: number[] } {
    const { probs } = this.forward(features);
    
    const maxIdx = probs.indexOf(Math.max(...probs));
    const directions: Array<'LONG' | 'SHORT' | 'NEUTRAL'> = ['LONG', 'SHORT', 'NEUTRAL'];
    
    return {
      direction: directions[maxIdx],
      confidence: probs[maxIdx],
      probs
    };
  }

  /**
   * Train the network on a single example using backpropagation
   */
  train(features: number[], targetDirection: 'LONG' | 'SHORT' | 'NEUTRAL'): number {
    // Convert target to one-hot
    const targetIdx = targetDirection === 'LONG' ? 0 : targetDirection === 'SHORT' ? 1 : 2;
    const target = [0, 0, 0];
    target[targetIdx] = 1;

    // Forward pass
    const normalized = this.normalizeFeatures(features);
    const z1 = addBias(matVecMul(this.weights.W1, normalized), this.weights.b1);
    const hidden1 = z1.map(relu);
    const z2 = addBias(matVecMul(this.weights.W2, hidden1), this.weights.b2);
    const hidden2 = z2.map(relu);
    const logits = addBias(matVecMul(this.weights.W3, hidden2), this.weights.b3);
    const probs = softmax(logits);

    // Compute loss
    const loss = crossEntropyLoss(target, probs);

    // Backpropagation
    // Output layer gradient: dL/dlogits = probs - target (for cross-entropy + softmax)
    const dLogits = probs.map((p, i) => p - target[i]);

    // Gradient for W3, b3
    for (let i = 0; i < this.weights.W3.length; i++) {
      this.weights.b3[i] -= this.learningRate * dLogits[i];
      for (let j = 0; j < this.weights.W3[i].length; j++) {
        this.weights.W3[i][j] -= this.learningRate * dLogits[i] * hidden2[j];
      }
    }

    // Gradient through hidden2
    const dHidden2: number[] = [];
    for (let j = 0; j < hidden2.length; j++) {
      let grad = 0;
      for (let i = 0; i < this.weights.W3.length; i++) {
        grad += dLogits[i] * this.weights.W3[i][j];
      }
      dHidden2.push(grad * reluDerivative(z2[j]));
    }

    // Gradient for W2, b2
    for (let i = 0; i < this.weights.W2.length; i++) {
      this.weights.b2[i] -= this.learningRate * dHidden2[i];
      for (let j = 0; j < this.weights.W2[i].length; j++) {
        this.weights.W2[i][j] -= this.learningRate * dHidden2[i] * hidden1[j];
      }
    }

    // Gradient through hidden1
    const dHidden1: number[] = [];
    for (let j = 0; j < hidden1.length; j++) {
      let grad = 0;
      for (let i = 0; i < this.weights.W2.length; i++) {
        grad += dHidden2[i] * this.weights.W2[i][j];
      }
      dHidden1.push(grad * reluDerivative(z1[j]));
    }

    // Gradient for W1, b1
    for (let i = 0; i < this.weights.W1.length; i++) {
      this.weights.b1[i] -= this.learningRate * dHidden1[i];
      for (let j = 0; j < this.weights.W1[i].length; j++) {
        this.weights.W1[i][j] -= this.learningRate * dHidden1[i] * normalized[j];
      }
    }

    // Update metadata
    this.weights.trainingEpochs++;
    this.weights.lastTrainingLoss = loss;
    this.weights.lastUpdated = Date.now();

    // Save weights
    this.saveWeights();

    return loss;
  }

  /**
   * Record a prediction for later validation
   */
  recordPrediction(
    features: number[],
    prediction: 'LONG' | 'SHORT' | 'NEUTRAL',
    confidence: number,
    priceAtPrediction: number
  ): void {
    const record: PredictionRecord = {
      timestamp: Date.now(),
      features,
      prediction,
      confidence,
      priceAtPrediction,
      outcome: 'PENDING'
    };

    this.predictionHistory.push(record);
    
    // Trim history if too long
    if (this.predictionHistory.length > this.maxHistory) {
      this.predictionHistory = this.predictionHistory.slice(-this.maxHistory);
    }

    this.saveHistory();
  }

  /**
   * Validate a previous prediction with actual outcome
   */
  validatePrediction(timestamp: number, actualPrice: number): boolean {
    const record = this.predictionHistory.find(r => r.timestamp === timestamp);
    if (!record || record.outcome !== 'PENDING') return false;

    const returnPercent = ((actualPrice - record.priceAtPrediction) / record.priceAtPrediction) * 100;
    record.priceAfter = actualPrice;
    record.returnPercent = returnPercent;

    // Determine if prediction was correct using configured thresholds
    const actualDirection = returnPercent > PROFIT_THRESHOLD ? 'LONG' : returnPercent < LOSS_THRESHOLD ? 'SHORT' : 'NEUTRAL';
    record.outcome = record.prediction === actualDirection ? 'CORRECT' : 'INCORRECT';

    // LEARN FROM OUTCOME - This is the key improvement!
    if (record.outcome === 'INCORRECT') {
      // Train on the correct direction
      this.train(record.features, actualDirection);
    }

    this.saveHistory();
    return record.outcome === 'CORRECT';
  }

  /**
   * Get training statistics
   */
  getStats(): {
    epochs: number;
    lastLoss: number;
    totalPredictions: number;
    pendingPredictions: number;
    accuracy: number;
  } {
    const validated = this.predictionHistory.filter(r => r.outcome !== 'PENDING');
    const correct = validated.filter(r => r.outcome === 'CORRECT').length;

    return {
      epochs: this.weights.trainingEpochs,
      lastLoss: this.weights.lastTrainingLoss,
      totalPredictions: this.predictionHistory.length,
      pendingPredictions: this.predictionHistory.filter(r => r.outcome === 'PENDING').length,
      accuracy: validated.length > 0 ? (correct / validated.length) * 100 : 0
    };
  }

  /**
   * Save weights to localStorage
   */
  private saveWeights(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(this.weights));
      }
    } catch {
      // Silent fail if localStorage unavailable
    }
  }

  /**
   * Load weights from localStorage
   */
  private loadWeights(): NeuralWeights | null {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
          return JSON.parse(saved);
        }
      }
    } catch {
      // Silent fail
    }
    return null;
  }

  /**
   * Save prediction history
   */
  private saveHistory(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        // Only save last 1000 records to localStorage
        const toSave = this.predictionHistory.slice(-1000);
        localStorage.setItem(this.historyKey, JSON.stringify(toSave));
      }
    } catch {
      // Silent fail
    }
  }

  /**
   * Load prediction history
   */
  private loadHistory(): PredictionRecord[] {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(this.historyKey);
        if (saved) {
          return JSON.parse(saved);
        }
      }
    } catch {
      // Silent fail
    }
    return [];
  }

  /**
   * Reset the network to initial state
   */
  reset(): void {
    this.weights = initializeWeights(20);
    this.predictionHistory = [];
    this.saveWeights();
    this.saveHistory();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🗣️ NLP SENTIMENT ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════

// Crypto-specific sentiment lexicon
const BULLISH_KEYWORDS: Record<string, number> = {
  // Strong bullish
  'moon': 0.9, 'mooning': 0.95, 'bullish': 0.8, 'pump': 0.7, 'pumping': 0.75,
  'ath': 0.85, 'all-time high': 0.85, 'breakout': 0.7, 'rally': 0.75,
  'accumulating': 0.6, 'hodl': 0.5, 'buying': 0.6, 'bought': 0.5,
  'long': 0.6, 'longing': 0.65, 'longs': 0.55,
  'bullrun': 0.85, 'bull run': 0.85, 'bullmarket': 0.8, 'bull market': 0.8,
  'green': 0.5, 'greens': 0.5, 'profit': 0.6, 'profits': 0.6,
  'gaining': 0.55, 'gains': 0.6, 'up': 0.3, 'rising': 0.5,
  'soaring': 0.7, 'surge': 0.7, 'surging': 0.75,
  'adoption': 0.6, 'institutional': 0.5, 'etf': 0.6,
  'halving': 0.5, 'scarcity': 0.4,
  'undervalued': 0.5, 'cheap': 0.4, 'opportunity': 0.4,
  'support': 0.3, 'holding': 0.4, 'bounce': 0.5,
  
  // Moderate bullish
  'positive': 0.4, 'optimistic': 0.5, 'confident': 0.4,
  'strong': 0.3, 'recovery': 0.5, 'recovering': 0.5,
  'bullish sentiment': 0.7, 'buy signal': 0.7,
  'golden cross': 0.7, 'higher high': 0.6, 'higher low': 0.55,
};

const BEARISH_KEYWORDS: Record<string, number> = {
  // Strong bearish
  'crash': -0.9, 'crashing': -0.95, 'dump': -0.8, 'dumping': -0.85,
  'bearish': -0.8, 'bear market': -0.8, 'bear': -0.5,
  'plunge': -0.7, 'plunging': -0.75, 'collapse': -0.85,
  'selling': -0.6, 'sold': -0.5, 'short': -0.6, 'shorting': -0.65,
  'shorts': -0.55, 'rekt': -0.8, 'wrecked': -0.7,
  'liquidated': -0.8, 'liquidation': -0.75,
  'red': -0.5, 'bleeding': -0.7, 'blood': -0.6,
  'loss': -0.6, 'losses': -0.6, 'down': -0.3, 'falling': -0.5,
  'dropping': -0.6, 'dropped': -0.5, 'decline': -0.5,
  'fear': -0.6, 'panic': -0.8, 'fud': -0.7,
  'scam': -0.8, 'rug': -0.9, 'rugpull': -0.95,
  'hack': -0.8, 'hacked': -0.85, 'exploit': -0.7,
  'bankruptcy': -0.9, 'bankrupt': -0.85, 'insolvent': -0.8,
  
  // Moderate bearish
  'negative': -0.4, 'pessimistic': -0.5, 'worried': -0.4,
  'weak': -0.3, 'correction': -0.4, 'correcting': -0.4,
  'bearish sentiment': -0.7, 'sell signal': -0.7,
  'death cross': -0.7, 'lower high': -0.6, 'lower low': -0.65,
  'resistance': -0.2, 'rejected': -0.5, 'rejection': -0.5,
  'overvalued': -0.5, 'expensive': -0.3, 'bubble': -0.6,
};

const NEUTRAL_KEYWORDS: string[] = [
  'stable', 'sideways', 'consolidation', 'consolidating', 'range',
  'ranging', 'flat', 'neutral', 'mixed', 'unclear', 'uncertain',
  'wait', 'waiting', 'watch', 'watching', 'observe', 'observing',
  'accumulation', 'distribution', 'testing', 'retesting'
];

/**
 * Analyze sentiment of text using NLP
 */
export function analyzeTextSentiment(text: string): NLPSentiment {
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/);
  
  let totalScore = 0;
  let matches = 0;
  const bullishFound: string[] = [];
  const bearishFound: string[] = [];
  const neutralFound: string[] = [];

  // Check for multi-word phrases first
  for (const [phrase, score] of Object.entries(BULLISH_KEYWORDS)) {
    if (phrase.includes(' ') && lowerText.includes(phrase)) {
      totalScore += score;
      matches++;
      bullishFound.push(phrase);
    }
  }
  for (const [phrase, score] of Object.entries(BEARISH_KEYWORDS)) {
    if (phrase.includes(' ') && lowerText.includes(phrase)) {
      totalScore += score;
      matches++;
      bearishFound.push(phrase);
    }
  }

  // Check single words
  for (const word of words) {
    const cleanWord = word.replace(/[^a-z]/g, '');
    
    if (BULLISH_KEYWORDS[cleanWord]) {
      totalScore += BULLISH_KEYWORDS[cleanWord];
      matches++;
      if (!bullishFound.includes(cleanWord)) bullishFound.push(cleanWord);
    }
    if (BEARISH_KEYWORDS[cleanWord]) {
      totalScore += BEARISH_KEYWORDS[cleanWord];
      matches++;
      if (!bearishFound.includes(cleanWord)) bearishFound.push(cleanWord);
    }
    if (NEUTRAL_KEYWORDS.includes(cleanWord)) {
      if (!neutralFound.includes(cleanWord)) neutralFound.push(cleanWord);
    }
  }

  // Calculate final score and confidence
  const score = matches > 0 ? Math.max(-1, Math.min(1, totalScore / matches)) : 0;
  const confidence = Math.min(1, matches / CONFIDENCE_KEYWORD_THRESHOLD);

  return {
    score,
    confidence,
    sources: [text.substring(0, 100) + (text.length > 100 ? '...' : '')],
    bullishKeywords: bullishFound,
    bearishKeywords: bearishFound,
    neutralKeywords: neutralFound,
    timestamp: Date.now()
  };
}

/**
 * Analyze multiple text sources
 */
export function analyzeMultipleTexts(texts: string[]): NLPSentiment {
  if (texts.length === 0) {
    return {
      score: 0,
      confidence: 0,
      sources: [],
      bullishKeywords: [],
      bearishKeywords: [],
      neutralKeywords: [],
      timestamp: Date.now()
    };
  }

  const results = texts.map(analyzeTextSentiment);
  
  // Weighted average by confidence
  let totalWeight = 0;
  let weightedScore = 0;
  const allBullish: string[] = [];
  const allBearish: string[] = [];
  const allNeutral: string[] = [];
  const allSources: string[] = [];

  for (const result of results) {
    const weight = result.confidence || 0.1;
    totalWeight += weight;
    weightedScore += result.score * weight;
    allBullish.push(...result.bullishKeywords);
    allBearish.push(...result.bearishKeywords);
    allNeutral.push(...result.neutralKeywords);
    allSources.push(...result.sources);
  }

  return {
    score: totalWeight > 0 ? weightedScore / totalWeight : 0,
    confidence: Math.min(1, totalWeight / texts.length),
    sources: [...new Set(allSources)],
    bullishKeywords: [...new Set(allBullish)],
    bearishKeywords: [...new Set(allBearish)],
    neutralKeywords: [...new Set(allNeutral)],
    timestamp: Date.now()
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📊 BACKTESTING FRAMEWORK
// ═══════════════════════════════════════════════════════════════════════════════

export interface BacktestConfig {
  startIndex: number;
  endIndex: number;
  predictionHorizon: number;  // How many candles ahead to check
  profitThreshold: number;    // % change to count as correct for LONG
  lossThreshold: number;      // % change to count as correct for SHORT
}

/**
 * Backtesting engine for validating predictions
 */
export class BacktestEngine {
  private results: BacktestResult | null = null;
  private readonly storageKey = 'zikalyze_backtest_results';

  /**
   * Run backtest on historical data
   */
  runBacktest(
    candles: ChartTrendInput['candles'],
    predictFn: (features: number[]) => { direction: 'LONG' | 'SHORT' | 'NEUTRAL'; confidence: number },
    extractFeaturesFn: (candles: ChartTrendInput['candles'], currentIndex: number) => number[],
    config: Partial<BacktestConfig> = {}
  ): BacktestResult {
    const {
      startIndex = 50,  // Need some data for features
      endIndex = candles.length - 10,
      predictionHorizon = 5,
      profitThreshold = 0.5,
      lossThreshold = -0.5
    } = config;

    const timeline: BacktestResult['timeline'] = [];
    let totalWins = 0;
    let totalLosses = 0;
    let totalWinAmount = 0;
    let totalLossAmount = 0;
    let peakEquity = 1;
    let currentEquity = 1;
    let maxDrawdown = 0;
    const returns: number[] = [];

    const byDirection = {
      long: { count: 0, correct: 0, accuracy: 0 },
      short: { count: 0, correct: 0, accuracy: 0 },
      neutral: { count: 0, correct: 0, accuracy: 0 }
    };

    for (let i = startIndex; i < endIndex; i++) {
      // Extract features from candles up to current index
      const features = extractFeaturesFn(candles, i);
      const prediction = predictFn(features);
      
      // Get actual outcome
      const currentPrice = candles[i].close;
      const futureIndex = Math.min(i + predictionHorizon, candles.length - 1);
      const futurePrice = candles[futureIndex].close;
      const returnPercent = ((futurePrice - currentPrice) / currentPrice) * 100;

      // Determine if prediction was correct
      let correct = false;
      if (prediction.direction === 'LONG') {
        byDirection.long.count++;
        correct = returnPercent >= profitThreshold;
        if (correct) byDirection.long.correct++;
      } else if (prediction.direction === 'SHORT') {
        byDirection.short.count++;
        correct = returnPercent <= lossThreshold;
        if (correct) byDirection.short.correct++;
      } else {
        byDirection.neutral.count++;
        correct = Math.abs(returnPercent) < Math.max(Math.abs(profitThreshold), Math.abs(lossThreshold));
        if (correct) byDirection.neutral.correct++;
      }

      // Track equity curve
      let tradeReturn = 0;
      if (prediction.direction === 'LONG') {
        tradeReturn = returnPercent;
      } else if (prediction.direction === 'SHORT') {
        tradeReturn = -returnPercent;
      }
      
      currentEquity *= (1 + tradeReturn / 100);
      peakEquity = Math.max(peakEquity, currentEquity);
      const drawdown = (peakEquity - currentEquity) / peakEquity;
      maxDrawdown = Math.max(maxDrawdown, drawdown);

      // Track wins/losses
      if (correct && prediction.direction !== 'NEUTRAL') {
        totalWins++;
        totalWinAmount += Math.abs(tradeReturn);
      } else if (!correct && prediction.direction !== 'NEUTRAL') {
        totalLosses++;
        totalLossAmount += Math.abs(tradeReturn);
      }

      returns.push(tradeReturn);

      timeline.push({
        timestamp: candles[i].timestamp,
        prediction: prediction.direction === 'LONG' ? 1 : prediction.direction === 'SHORT' ? -1 : 0,
        actual: returnPercent > profitThreshold ? 1 : returnPercent < lossThreshold ? -1 : 0,
        correct
      });
    }

    // Calculate metrics
    const totalPredictions = timeline.length;
    const correctPredictions = timeline.filter(t => t.correct).length;
    const accuracy = totalPredictions > 0 ? (correctPredictions / totalPredictions) * 100 : 0;
    const winRate = (totalWins + totalLosses) > 0 ? (totalWins / (totalWins + totalLosses)) * 100 : 0;
    const avgWin = totalWins > 0 ? totalWinAmount / totalWins : 0;
    const avgLoss = totalLosses > 0 ? totalLossAmount / totalLosses : 0;
    const profitFactor = totalLossAmount > 0 ? totalWinAmount / totalLossAmount : totalWinAmount > 0 ? Infinity : 0;

    // Sharpe ratio (simplified, annualized)
    const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
    const stdReturn = returns.length > 1 ? 
      Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / (returns.length - 1)) : 0;
    const sharpeRatio = stdReturn > 0 ? (avgReturn / stdReturn) * Math.sqrt(TRADING_DAYS_PER_YEAR) : 0;

    // Direction accuracies
    byDirection.long.accuracy = byDirection.long.count > 0 ? (byDirection.long.correct / byDirection.long.count) * 100 : 0;
    byDirection.short.accuracy = byDirection.short.count > 0 ? (byDirection.short.correct / byDirection.short.count) * 100 : 0;
    byDirection.neutral.accuracy = byDirection.neutral.count > 0 ? (byDirection.neutral.correct / byDirection.neutral.count) * 100 : 0;

    this.results = {
      totalPredictions,
      correctPredictions,
      accuracy,
      profitFactor,
      maxDrawdown: maxDrawdown * 100,
      sharpeRatio,
      winRate,
      avgWin,
      avgLoss,
      byDirection,
      byTimeframe: {},
      timeline
    };

    this.saveResults();
    return this.results;
  }

  /**
   * Get last backtest results
   */
  getResults(): BacktestResult | null {
    if (!this.results) {
      this.results = this.loadResults();
    }
    return this.results;
  }

  /**
   * Save results to localStorage
   */
  private saveResults(): void {
    try {
      if (typeof localStorage !== 'undefined' && this.results) {
        // Don't save full timeline to localStorage (too large)
        const toSave = { ...this.results, timeline: this.results.timeline.slice(-MAX_TIMELINE_STORAGE) };
        localStorage.setItem(this.storageKey, JSON.stringify(toSave));
      }
    } catch {
      // Silent fail
    }
  }

  /**
   * Load results from localStorage
   */
  private loadResults(): BacktestResult | null {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
          return JSON.parse(saved);
        }
      }
    } catch {
      // Silent fail
    }
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎯 UNIFIED NEURAL ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Main Neural Engine that combines all capabilities
 */
export class ZikalyzeNeuralEngine {
  public readonly neuralNetwork: ZikalyzeNeuralNetwork;
  public readonly backtestEngine: BacktestEngine;

  constructor() {
    this.neuralNetwork = new ZikalyzeNeuralNetwork();
    this.backtestEngine = new BacktestEngine();
  }

  /**
   * Enhanced prediction with NLP integration
   */
  predict(
    features: number[],
    newsTexts?: string[]
  ): {
    direction: 'LONG' | 'SHORT' | 'NEUTRAL';
    confidence: number;
    probs: number[];
    nlpSentiment?: NLPSentiment;
    combinedConfidence: number;
  } {
    // Neural network prediction
    const nnPrediction = this.neuralNetwork.predict(features);

    // NLP sentiment if texts provided
    let nlpSentiment: NLPSentiment | undefined;
    let nlpAdjustment = 0;
    
    if (newsTexts && newsTexts.length > 0) {
      nlpSentiment = analyzeMultipleTexts(newsTexts);
      // NLP can adjust confidence by up to the configured weight
      nlpAdjustment = nlpSentiment.score * nlpSentiment.confidence * NLP_CONFIDENCE_WEIGHT;
    }

    // Combine confidences
    const combinedConfidence = Math.max(0, Math.min(1, 
      nnPrediction.confidence + nlpAdjustment
    ));

    // If NLP strongly disagrees with NN, reduce confidence
    const nlpDirection = nlpSentiment ? 
      (nlpSentiment.score > 0.3 ? 'LONG' : nlpSentiment.score < -0.3 ? 'SHORT' : 'NEUTRAL') : 
      nnPrediction.direction;
    
    const finalConfidence = nlpDirection !== nnPrediction.direction && nlpSentiment?.confidence && nlpSentiment.confidence > 0.5
      ? combinedConfidence * DISAGREEMENT_PENALTY
      : combinedConfidence;

    return {
      direction: nnPrediction.direction,
      confidence: nnPrediction.confidence,
      probs: nnPrediction.probs,
      nlpSentiment,
      combinedConfidence: finalConfidence
    };
  }

  /**
   * Extract features from chart data for neural network
   */
  extractFeatures(candles: ChartTrendInput['candles'], currentIndex: number): number[] {
    if (currentIndex < FEATURE_VECTOR_SIZE || !candles || candles.length <= currentIndex) {
      return new Array(FEATURE_VECTOR_SIZE).fill(0);
    }

    const recentCandles = candles.slice(Math.max(0, currentIndex - 50), currentIndex + 1);
    const prices = recentCandles.map(c => c.close);
    const volumes = recentCandles.map(c => c.volume);

    // Feature 1-4: Price data
    const currentPrice = prices[prices.length - 1];
    const price5Ago = prices[Math.max(0, prices.length - 5)];
    const price10Ago = prices[Math.max(0, prices.length - 10)];
    const price20Ago = prices[Math.max(0, prices.length - 20)];

    // Feature 5-8: Returns
    const return5 = ((currentPrice - price5Ago) / price5Ago) * 100;
    const return10 = ((currentPrice - price10Ago) / price10Ago) * 100;
    const return20 = ((currentPrice - price20Ago) / price20Ago) * 100;
    const volatility = this.calculateVolatility(prices.slice(-20));

    // Feature 9-12: Technical indicators
    const rsi = this.calculateRSI(prices, 14);
    const ema9 = this.calculateEMA(prices, 9);
    const ema21 = this.calculateEMA(prices, 21);
    const macd = ema9 - ema21;

    // Feature 13-16: Volume indicators
    const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    const currentVolume = volumes[volumes.length - 1];
    const volumeRatio = avgVolume > 0 ? currentVolume / avgVolume : 1;
    const volumeTrend = volumes.length > 5 ? 
      (volumes.slice(-5).reduce((a, b) => a + b, 0) / 5) / 
      (volumes.slice(-10, -5).reduce((a, b) => a + b, 0) / 5 || 1) : 1;

    // Feature 17-20: Price structure
    const highs = recentCandles.map(c => c.high);
    const lows = recentCandles.map(c => c.low);
    const highestHigh = Math.max(...highs);
    const lowestLow = Math.min(...lows);
    const pricePosition = (currentPrice - lowestLow) / (highestHigh - lowestLow || 1);
    const atr = this.calculateATR(recentCandles);

    return [
      currentPrice, price5Ago, price10Ago, price20Ago,  // 1-4
      return5, return10, return20, volatility,           // 5-8
      rsi, (ema9 / currentPrice - 1) * 100, (ema21 / currentPrice - 1) * 100, macd / currentPrice * 100,  // 9-12
      volumeRatio, volumeTrend, Math.log(currentVolume + 1), Math.log(avgVolume + 1),  // 13-16
      pricePosition * 100, highestHigh, lowestLow, atr  // 17-20
    ];
  }

  private calculateVolatility(prices: number[]): number {
    if (prices.length < 2) return 0;
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i-1]) / prices[i-1]);
    }
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    return Math.sqrt(variance) * 100;
  }

  private calculateRSI(prices: number[], period: number): number {
    if (prices.length < period + 1) return 50;
    const changes = [];
    for (let i = 1; i < prices.length; i++) {
      changes.push(prices[i] - prices[i-1]);
    }
    const recentChanges = changes.slice(-period);
    const gains = recentChanges.filter(c => c > 0);
    const losses = recentChanges.filter(c => c < 0).map(c => Math.abs(c));
    const avgGain = gains.length > 0 ? gains.reduce((a, b) => a + b, 0) / period : 0;
    const avgLoss = losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / period : 0;
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  private calculateEMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1] || 0;
    const k = 2 / (period + 1);
    let ema = prices[0];
    for (let i = 1; i < prices.length; i++) {
      ema = prices[i] * k + ema * (1 - k);
    }
    return ema;
  }

  private calculateATR(candles: Array<{ high: number; low: number; close: number }>, period: number = 14): number {
    if (candles.length < period) return 0;
    const trs = [];
    for (let i = 1; i < candles.length; i++) {
      const high = candles[i].high;
      const low = candles[i].low;
      const prevClose = candles[i-1].close;
      trs.push(Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose)));
    }
    const recentTRs = trs.slice(-period);
    return recentTRs.reduce((a, b) => a + b, 0) / recentTRs.length;
  }

  /**
   * Get comprehensive stats
   */
  getStats(): {
    neural: ReturnType<ZikalyzeNeuralNetwork['getStats']>;
    backtest: BacktestResult | null;
  } {
    return {
      neural: this.neuralNetwork.getStats(),
      backtest: this.backtestEngine.getResults()
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📤 EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

// Singleton instance for global use
export const neuralEngine = new ZikalyzeNeuralEngine();

// Export utility functions
export { initializeWeights, crossEntropyLoss, softmax };
