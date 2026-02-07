// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 ZIKALYZE AI BRAIN v10.0 — CLIENT-SIDE TYPES
// ═══════════════════════════════════════════════════════════════════════════════
// Fully decentralized — runs 100% in the browser with zero server dependency
// ═══════════════════════════════════════════════════════════════════════════════

export interface OnChainMetrics {
  exchangeNetFlow: { value: number; trend: 'OUTFLOW' | 'INFLOW' | 'NEUTRAL'; magnitude: string };
  whaleActivity: { buying: number; selling: number; netFlow: string };
  longTermHolders: { accumulating: boolean; change7d: number; sentiment: string };
  shortTermHolders: { behavior: string; profitLoss: number };
  activeAddresses: { current: number; change24h: number; trend: 'INCREASING' | 'DECREASING' | 'STABLE' };
  transactionVolume: { value: number; change24h: number };
  mempoolData?: { unconfirmedTxs: number; mempoolSize: number; avgFeeRate: number };
  source: string;
}

export interface ETFFlowData {
  btcNetFlow24h: number;
  btcNetFlow7d: number;
  ethNetFlow24h: number;
  ethNetFlow7d: number;
  trend: 'ACCUMULATING' | 'DISTRIBUTING' | 'NEUTRAL';
  topBuyers: string[];
  topSellers: string[];
  institutionalSentiment: string;
  source: string;
}

export interface MacroCatalyst {
  event: string;
  date: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  expectedEffect: 'BULLISH' | 'BEARISH' | 'VOLATILE' | 'UNCERTAIN';
  description: string;
  rescheduled?: boolean; // Flag for events that have been rescheduled (holidays, delays, etc.)
  dateUnconfirmed?: boolean; // Flag for events without verified dates
}

export interface VolumeSpikeAlert {
  isSpike: boolean;
  magnitude: 'EXTREME' | 'HIGH' | 'MODERATE' | 'NORMAL';
  percentageAboveAvg: number;
  signal: 'BULLISH_BREAKOUT' | 'BEARISH_BREAKDOWN' | 'ACCUMULATION' | 'DISTRIBUTION' | 'NEUTRAL';
  description: string;
}

export interface MarketStructure {
  trend: 'BULLISH' | 'BEARISH' | 'RANGING';
  strength: number;
  higherHighs: boolean;
  higherLows: boolean;
  lowerHighs: boolean;
  lowerLows: boolean;
  lastBOS: 'BULLISH' | 'BEARISH' | null;
  lastCHoCH: 'BULLISH' | 'BEARISH' | null;
}

export interface InstitutionalVsRetail {
  institutionalBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  institutionalConfidence: number;
  retailBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  retailConfidence: number;
  divergence: boolean;
  divergenceNote: string;
}

export interface IfThenScenario {
  condition: string;
  priceLevel: number;
  outcome: string;
  probability: number;
  action: string;
}

export interface PrecisionEntry {
  timing: 'NOW' | 'WAIT_PULLBACK' | 'WAIT_BREAKOUT' | 'AVOID';
  zone: string;
  trigger: string;
  confirmation: string;
  invalidation: string;
  volumeCondition: string;
  structureStatus: string;
  movementPhase: string;
}

// Real-time chart data for trend analysis
export interface ChartTrendInput {
  candles: Array<{
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
  trend24h: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  trendStrength: number;
  higherHighs: boolean;
  higherLows: boolean;
  lowerHighs: boolean;
  lowerLows: boolean;
  ema9: number;
  ema21: number;
  rsi: number;
  volumeTrend: 'INCREASING' | 'DECREASING' | 'STABLE';
  priceVelocity: number;
  isLive: boolean;
  source: string;
}

// Multi-timeframe analysis data
export interface TimeframeAnalysisInput {
  timeframe: '15m' | '1h' | '4h' | '1d';
  trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  trendStrength: number;
  ema9: number;
  ema21: number;
  rsi: number;
  support: number;
  resistance: number;
  volumeTrend: 'INCREASING' | 'DECREASING' | 'STABLE';
  higherHighs: boolean;
  higherLows: boolean;
  lowerHighs: boolean;
  lowerLows: boolean;
  isLive: boolean;
}

export interface MultiTimeframeInput {
  '15m': TimeframeAnalysisInput | null;
  '1h': TimeframeAnalysisInput | null;
  '4h': TimeframeAnalysisInput | null;
  '1d': TimeframeAnalysisInput | null;
  confluence: {
    overallBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    strength: number;
    alignedTimeframes: number;
    conflictingTimeframes: number;
    recommendation: string;
  };
}

// Real-time Fear & Greed data for AI analysis
export interface RealTimeFearGreedInput {
  value: number;
  label: string;
  previousValue?: number;
  previousLabel?: string;
  trend?: 'RISING' | 'FALLING' | 'STABLE';
  extremeLevel?: 'EXTREME_FEAR' | 'FEAR' | 'NEUTRAL' | 'GREED' | 'EXTREME_GREED';
  aiWeight?: number; // 0-1 weight for AI decision making
  isLive?: boolean;
  timestamp?: number;
}

export interface AnalysisInput {
  crypto: string;
  price: number;
  change: number;
  high24h?: number;
  low24h?: number;
  volume?: number;
  marketCap?: number;
  language?: string;
  isLiveData?: boolean; // True if using real-time WebSocket data
  dataSource?: string;  // e.g., "price+on-chain+sentiment"
  onChainData?: OnChainMetrics;
  sentimentData?: {
    fearGreed?: RealTimeFearGreedInput | { value: number; label: string };
    social?: { overall?: { score: number } };
  };
  chartTrendData?: ChartTrendInput; // Real-time 24h chart data for accurate trend analysis
  multiTimeframeData?: MultiTimeframeInput; // Multi-timeframe analysis (15m, 1h, 4h, 1d)
  // Real-time data freshness indicators
  priceDataAge?: number; // Age in milliseconds
  chartDataAge?: number; // Age in milliseconds
  fearGreedDataAge?: number; // Age in milliseconds
  // Layer Gamma — Human Hybrid Narrative Filter input
  narrativeContext?: LayerGammaInput;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎯 TRI-MODULAR ANALYSIS TYPES — Senior Quant Strategist Output
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Layer Alpha — Rule-Based Algorithm Analysis (ICT/SMC)
 */
export interface LayerAlphaResult {
  signal: '🔴 SHORT' | '🟢 LONG' | '⚪ NEUTRAL';
  orderBlocks: Array<{ type: 'BULLISH' | 'BEARISH'; level: number; strength: number }>;
  liquidityVoids: Array<{ type: 'BSL' | 'SSL'; level: number }>;
  fibLevels: Array<{ level: string; price: number; significance: 'HIGH' | 'MEDIUM' | 'LOW' }>;
  timeframe4H: { trend: string; structure: string };
  timeframe15M: { trend: string; structure: string };
  priceActionBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  confidence: number;
}

/**
 * Layer Beta — Neural Network Pattern Recognition
 */
export interface LayerBetaResult {
  signal: '🔴 SHORT' | '🟢 LONG' | '⚪ NEUTRAL';
  rsiAnalysis: { value: number; condition: 'OVERBOUGHT' | 'OVERSOLD' | 'NEUTRAL' };
  macdAnalysis: { histogram: number; signal: string; momentum: 'BULLISH' | 'BEARISH' | 'NEUTRAL' };
  hiddenCorrelations: string[];
  fearGreedComparison: { current: number; historicalExtremeFear: number; similarity: number };
  marketPhase: 'DISTRIBUTION' | 'ACCUMULATION' | 'CAPITULATION' | 'EUPHORIA' | 'NEUTRAL';
  reversalProbability: number;
  confidence: number;
}

/**
 * Layer Gamma — Human Hybrid Narrative Filter
 */
export interface LayerGammaInput {
  userContext?: string;           // User-provided news/context
  macroEvents?: string[];         // Upcoming macro events
  sentiment?: string;             // Overall market sentiment from news
  psychologicalLevels?: number[]; // Price levels with psychological significance
}

export interface LayerGammaResult {
  action: 'OVERRIDE' | 'VALIDATE' | 'NEUTRAL';
  narrativeAnalysis: string;
  psychologicalLevels: Array<{ price: number; type: 'SUPPORT' | 'RESISTANCE'; reason: string }>;
  macroImpact: 'BULLISH' | 'BEARISH' | 'VOLATILE' | 'NEUTRAL';
  positionSizeAdjustment: 'REDUCE' | 'INCREASE' | 'MAINTAIN' | 'EXIT';
  confidence: number;
}

/**
 * Tri-Modular Analysis — Complete Output
 */
export interface TriModularAnalysis {
  // The three layers
  layerAlpha: LayerAlphaResult;
  layerBeta: LayerBetaResult;
  layerGamma: LayerGammaResult;
  
  // Final Output Requirements
  weightedConfidenceScore: {
    direction: 'LONG' | 'SHORT' | 'NEUTRAL';
    percentage: number;
    breakdown: {
      alphaContribution: number;
      betaContribution: number;
      gammaContribution: number;
    };
  };
  
  conflictReport: {
    hasConflict: boolean;
    description: string;
    reversalSignalFromNN: boolean;
    algorithmMissing: string | null;
  };
  
  humanInTheLoopVerdict: {
    positionSizeRecommendation: 'FULL' | '75%' | '50%' | '25%' | 'AVOID';
    reasoning: string;
    upcomingMacroRisk: string | null;
    waitTime: string | null;  // e.g., "Wait 2 hours for Jobless Claims"
  };
  
  killSwitchLevel: {
    price: number;
    reason: string;
    allLayersAgree: boolean;
  };
}

export interface AnalysisResult {
  bias: 'LONG' | 'SHORT' | 'NEUTRAL';
  confidence: number;
  successProbability: number; // Calculated success probability based on confluence, timing, bias, and volume analysis
  analysis: string;
  insights: string[];
  macroCatalysts: MacroCatalyst[];
  volumeSpike: VolumeSpikeAlert;
  precisionEntry: PrecisionEntry;
  institutionalVsRetail: InstitutionalVsRetail;
  scenarios: IfThenScenario[];
  timestamp: string;
  source: 'client-side-wasm';
  // Data verification status
  verificationStatus?: 'VERIFIED' | 'PARTIALLY_VERIFIED' | 'ESTIMATED';
  liveDataSources?: number; // Count of live data sources (0-4)
  // Attention mechanism outputs
  attentionHeatmap?: number[];   // Per-timeframe importance weights [0..1]
  attentionVector?: number[];    // Aggregated context vector after attention + ReLU
  attentionEntropyLoss?: number; // Cross-entropy loss for training signal: L = -Σ y_i log(ŷ_i)
  // Real-time data integration status
  realTimeStatus?: {
    priceIsLive: boolean;
    chartIsLive: boolean;
    fearGreedIsLive: boolean;
    onChainIsLive: boolean;
    dataFreshness: 'REAL_TIME' | 'RECENT' | 'STALE';
  };
  // Fear & Greed impact on analysis
  fearGreedImpact?: {
    value: number;
    trend: 'RISING' | 'FALLING' | 'STABLE';
    biasModifier: number; // -1 to 1 adjustment to bias
    contrarian: boolean;
    description: string;
  };
  // Hybrid Confirmation — Algorithm + Neural Network combined output
  hybridConfirmation?: {
    algorithmBias: 'LONG' | 'SHORT' | 'NEUTRAL';
    algorithmConfidence: number;
    neuralDirection: 'LONG' | 'SHORT' | 'NEUTRAL';
    neuralConfidence: number;
    agreement: boolean;
    confluenceLevel: 'STRONG' | 'MODERATE' | 'WEAK' | 'CONFLICTING';
    combinedConfidence: number;
    usedBothSystems: boolean; // Confirms both algorithm and neural network were used
  };
  // Trade Quality Assessment — Follow trend, wait for confirmation, avoid bad trades
  tradeQuality?: {
    followsTrend: boolean;           // True if trade direction aligns with HTF trend
    hasConfirmation: boolean;        // True if multiple confirmations present
    confirmationCount: number;       // Number of confirmations (0-5)
    confirmations: string[];         // List of confirmations met
    isBadTrade: boolean;             // True if trade should be avoided
    badTradeReasons: string[];       // Reasons why this is a bad trade
    qualityScore: number;            // 0-100 overall trade quality
    recommendation: 'EXECUTE' | 'WAIT_CONFIRMATION' | 'AVOID_BAD_TRADE';
  };
  // Regime-Weighted Consensus — ADX-based Algorithm vs Neural Network weighting
  regimeConsensus?: {
    regime: 'TRENDING' | 'RANGING' | 'TRANSITIONAL';  // Market regime based on ADX
    adxValue: number;                                  // ADX value (0-100)
    masterControl: 'ALGORITHM' | 'NEURAL_NETWORK';    // Which system has primary control
    algorithmWeight: number;                          // 0-1 weight for Algorithm
    neuralWeight: number;                             // 0-1 weight for Neural Network
    weightedScore: number;                            // Final weighted consensus score
    skipTrade: boolean;                               // True if trade should be skipped
    skipReason?: string;                              // Reason for skipping
    supportZone: number;                              // Key support level
    resistanceZone: number;                           // Key resistance level
    stopLoss: number;                                 // Recommended stop loss level
    candlestickPattern: string;                       // Detected candlestick pattern
    candlestickConfirmation: string;                  // Entry trigger description
    candlestickStrength: number;                      // Pattern strength 0-100
  };
  // Tri-Modular Analysis — Senior Quant Strategist Output
  triModularAnalysis?: TriModularAnalysis;
}
