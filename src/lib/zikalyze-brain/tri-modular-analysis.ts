// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 TRI-MODULAR ANALYSIS — Senior Quant Strategist Intelligence
// ═══════════════════════════════════════════════════════════════════════════════
//
// Three-layer analysis system:
// 📊 Layer Alpha (Algorithm) — ICT/SMC, Order Blocks, Fibonacci, Price Action
// 🧠 Layer Beta (Neural Network) — MACD/RSI, Pattern Recognition, Historical Correlation
// 👤 Layer Gamma (Human Hybrid) — Narrative Filter, Macro Events, Psychological Levels
//
// Output:
// • Weighted Confidence Score
// • Conflict Report
// • Human-In-The-Loop Verdict
// • Kill Switch Level
// ═══════════════════════════════════════════════════════════════════════════════

import {
  LayerAlphaResult,
  LayerBetaResult,
  LayerGammaInput,
  LayerGammaResult,
  TriModularAnalysis,
  ChartTrendInput,
  MacroCatalyst
} from './types';

// ═══════════════════════════════════════════════════════════════════════════════
// 🔧 CONFIGURATION CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

/** Historical extreme fear level (Level 12) referenced in market analysis */
const HISTORICAL_EXTREME_FEAR_LEVEL = 12;

/** Layer weights for Tri-Modular synthesis (must sum to 1.0) */
const LAYER_ALPHA_WEIGHT = 0.40;  // Algorithm (Rule-Based)
const LAYER_BETA_WEIGHT = 0.35;   // Neural Network (Pattern Recognition)
const LAYER_GAMMA_WEIGHT = 0.25;  // Human Hybrid (Narrative Filter)

/** Amplification factor when Layer Gamma overrides technicals */
const GAMMA_OVERRIDE_AMPLIFICATION = 1.5;

/** Threshold for determining directional bias from weighted direction */
const DIRECTIONAL_THRESHOLD = 0.15;

/** Confidence score bounds */
const MAX_CONFIDENCE = 95;
const MIN_CONFIDENCE = 30;
const CONFIDENCE_NORMALIZATION_FACTOR = 0.9;

/** Keywords for sentiment analysis in narrative context */
const HAWKISH_KEYWORDS = ['hawkish', 'rate hike', 'inflation', 'tightening', 'fed', 'sell', 'bearish', 'dump', 'crash'];
const DOVISH_KEYWORDS = ['dovish', 'rate cut', 'stimulus', 'easing', 'buy', 'bullish', 'pump', 'rally'];
const VOLATILITY_KEYWORDS = ['jobs', 'cpi', 'fomc', 'announcement', 'release', 'data', 'report'];

// ═══════════════════════════════════════════════════════════════════════════════
// 📊 LAYER ALPHA — Rule-Based Algorithm Analysis (ICT/SMC)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Analyze using ICT/SMC principles — Order Blocks, Liquidity Voids, Fibonacci
 */
export function analyzeLayerAlpha(
  price: number,
  high24h: number,
  low24h: number,
  change: number,
  chartData?: ChartTrendInput
): LayerAlphaResult {
  const range = high24h - low24h;
  const pricePosition = range > 0 ? ((price - low24h) / range) * 100 : 50;
  
  // Calculate Fibonacci levels
  const fib618 = low24h + range * 0.618;
  const fib500 = low24h + range * 0.500;
  const fib382 = low24h + range * 0.382;
  const fib236 = low24h + range * 0.236;
  const fib786 = low24h + range * 0.786;
  
  // Identify Order Blocks (simplified — last significant candle before move)
  const orderBlocks: LayerAlphaResult['orderBlocks'] = [];
  
  // Bullish OB below current price (demand zone)
  if (pricePosition > 30) {
    orderBlocks.push({
      type: 'BULLISH',
      level: low24h + range * 0.25,
      strength: Math.min(100, 50 + (pricePosition - 30))
    });
  }
  
  // Bearish OB above current price (supply zone)
  if (pricePosition < 70) {
    orderBlocks.push({
      type: 'BEARISH',
      level: high24h - range * 0.25,
      strength: Math.min(100, 50 + (70 - pricePosition))
    });
  }
  
  // Identify Liquidity Voids (BSL = Buy Side Liquidity, SSL = Sell Side Liquidity)
  const liquidityVoids: LayerAlphaResult['liquidityVoids'] = [];
  
  // BSL above highs (stop losses for shorts)
  liquidityVoids.push({ type: 'BSL', level: high24h * 1.005 });
  
  // SSL below lows (stop losses for longs)
  liquidityVoids.push({ type: 'SSL', level: low24h * 0.995 });
  
  // Fibonacci levels with significance
  const fibLevels: LayerAlphaResult['fibLevels'] = [
    { level: '0.786', price: fib786, significance: price > fib786 ? 'HIGH' : 'MEDIUM' },
    { level: '0.618', price: fib618, significance: 'HIGH' },
    { level: '0.500', price: fib500, significance: 'MEDIUM' },
    { level: '0.382', price: fib382, significance: 'HIGH' },
    { level: '0.236', price: fib236, significance: 'MEDIUM' }
  ];
  
  // 4H and 15M timeframe analysis
  const trend4H = change > 2 ? 'BULLISH' : change < -2 ? 'BEARISH' : 'RANGING';
  const structure4H = chartData?.higherHighs && chartData?.higherLows 
    ? 'Higher Highs, Higher Lows' 
    : chartData?.lowerHighs && chartData?.lowerLows
      ? 'Lower Highs, Lower Lows'
      : 'Consolidation';
  
  const trend15M = pricePosition > 60 ? 'BULLISH' : pricePosition < 40 ? 'BEARISH' : 'RANGING';
  const structure15M = price > fib500 ? 'Above Equilibrium' : 'Below Equilibrium';
  
  // Determine price action bias based on ICT/SMC
  let priceActionBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  let confidence = 50;
  
  if (price < fib382 && change < -2) {
    // Price in discount zone + bearish momentum
    priceActionBias = 'BEARISH';
    confidence = 60 + Math.min(30, Math.abs(change) * 3);
  } else if (price > fib618 && change > 2) {
    // Price in premium zone + bullish momentum
    priceActionBias = 'BULLISH';
    confidence = 60 + Math.min(30, Math.abs(change) * 3);
  } else if (price < fib500 && chartData?.trend24h === 'BEARISH') {
    priceActionBias = 'BEARISH';
    confidence = 55 + Math.min(25, Math.abs(change) * 2);
  } else if (price > fib500 && chartData?.trend24h === 'BULLISH') {
    priceActionBias = 'BULLISH';
    confidence = 55 + Math.min(25, Math.abs(change) * 2);
  } else {
    priceActionBias = 'NEUTRAL';
    confidence = 40;
  }
  
  // Generate signal
  const signal = priceActionBias === 'BULLISH' ? '🟢 LONG' 
    : priceActionBias === 'BEARISH' ? '🔴 SHORT' 
    : '⚪ NEUTRAL';
  
  return {
    signal: signal as LayerAlphaResult['signal'],
    orderBlocks,
    liquidityVoids,
    fibLevels,
    timeframe4H: { trend: trend4H, structure: structure4H },
    timeframe15M: { trend: trend15M, structure: structure15M },
    priceActionBias,
    confidence: Math.min(95, confidence)
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 LAYER BETA — Neural Network Pattern Recognition
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Analyze using momentum indicators and pattern recognition
 */
export function analyzeLayerBeta(
  price: number,
  change: number,
  chartData?: ChartTrendInput,
  fearGreedValue?: number
): LayerBetaResult {
  // RSI Analysis
  const rsi = chartData?.rsi || 50;
  const rsiCondition: 'OVERBOUGHT' | 'OVERSOLD' | 'NEUTRAL' = 
    rsi > 70 ? 'OVERBOUGHT' : rsi < 30 ? 'OVERSOLD' : 'NEUTRAL';
  
  // MACD Analysis (simplified from price velocity)
  const momentum = chartData?.priceVelocity || change;
  const macdHistogram = momentum;
  const macdSignal = momentum > 1 ? 'Bullish Crossover' 
    : momentum < -1 ? 'Bearish Crossover' 
    : 'Neutral';
  const macdMomentum: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 
    momentum > 1 ? 'BULLISH' : momentum < -1 ? 'BEARISH' : 'NEUTRAL';
  
  // Hidden Correlations (pattern recognition)
  const hiddenCorrelations: string[] = [];
  
  if (rsi < 30 && change < -5) {
    hiddenCorrelations.push('Oversold with strong selling — Capitulation pattern');
  }
  if (rsi > 70 && change > 5) {
    hiddenCorrelations.push('Overbought with strong buying — Euphoria pattern');
  }
  if (chartData?.volumeTrend === 'DECREASING' && Math.abs(change) > 3) {
    hiddenCorrelations.push('Divergence: Price move on declining volume — Exhaustion signal');
  }
  if (chartData?.ema9 && chartData?.ema21 && chartData.ema9 < chartData.ema21 && change > 0) {
    hiddenCorrelations.push('EMA Death Cross with bullish price — Potential bear trap');
  }
  if (chartData?.ema9 && chartData?.ema21 && chartData.ema9 > chartData.ema21 && change < 0) {
    hiddenCorrelations.push('EMA Golden Cross with bearish price — Potential bull trap');
  }
  
  if (hiddenCorrelations.length === 0) {
    hiddenCorrelations.push('No significant hidden correlations detected');
  }
  
  // Fear & Greed comparison with historical extremes
  const currentFearGreed = fearGreedValue || 50;
  const similarity = 100 - Math.abs(currentFearGreed - HISTORICAL_EXTREME_FEAR_LEVEL);
  
  // Market Phase Detection
  let marketPhase: LayerBetaResult['marketPhase'];
  
  if (currentFearGreed <= 20 && change < -3) {
    marketPhase = 'CAPITULATION';
  } else if (currentFearGreed <= 35 && rsi < 40) {
    marketPhase = 'ACCUMULATION';
  } else if (currentFearGreed >= 75 && change > 3) {
    marketPhase = 'EUPHORIA';
  } else if (currentFearGreed >= 55 && rsi > 60 && change < 0) {
    marketPhase = 'DISTRIBUTION';
  } else {
    marketPhase = 'NEUTRAL';
  }
  
  // Reversal probability
  let reversalProbability = 30; // Base
  
  if (rsiCondition === 'OVERSOLD' && macdMomentum === 'BEARISH') {
    reversalProbability = 65; // High reversal probability (bullish)
  } else if (rsiCondition === 'OVERBOUGHT' && macdMomentum === 'BULLISH') {
    reversalProbability = 65; // High reversal probability (bearish)
  } else if (marketPhase === 'CAPITULATION') {
    reversalProbability = 75; // Very high — capitulation often precedes reversal
  } else if (marketPhase === 'EUPHORIA') {
    reversalProbability = 70; // High — euphoria often precedes correction
  }
  
  // Determine signal
  let signal: LayerBetaResult['signal'];
  let confidence = 50;
  
  if (rsiCondition === 'OVERSOLD' && marketPhase !== 'DISTRIBUTION') {
    signal = '🟢 LONG';
    confidence = 55 + reversalProbability * 0.3;
  } else if (rsiCondition === 'OVERBOUGHT' && marketPhase !== 'ACCUMULATION') {
    signal = '🔴 SHORT';
    confidence = 55 + reversalProbability * 0.3;
  } else if (macdMomentum === 'BULLISH' && marketPhase !== 'DISTRIBUTION') {
    signal = '🟢 LONG';
    confidence = 50 + Math.abs(macdHistogram) * 2;
  } else if (macdMomentum === 'BEARISH' && marketPhase !== 'ACCUMULATION') {
    signal = '🔴 SHORT';
    confidence = 50 + Math.abs(macdHistogram) * 2;
  } else {
    signal = '⚪ NEUTRAL';
    confidence = 40;
  }
  
  return {
    signal,
    rsiAnalysis: { value: rsi, condition: rsiCondition },
    macdAnalysis: { histogram: macdHistogram, signal: macdSignal, momentum: macdMomentum },
    hiddenCorrelations,
    fearGreedComparison: { current: currentFearGreed, historicalExtremeFear: HISTORICAL_EXTREME_FEAR_LEVEL, similarity },
    marketPhase,
    reversalProbability,
    confidence: Math.min(90, confidence)
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 👤 LAYER GAMMA — Human Hybrid Narrative Filter
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Process human-provided context and macro events
 */
export function analyzeLayerGamma(
  price: number,
  high24h: number,
  low24h: number,
  input?: LayerGammaInput,
  macroCatalysts?: MacroCatalyst[],
  alphaSignal?: string,
  betaSignal?: string
): LayerGammaResult {
  const userContext = input?.userContext || '';
  const macroEvents = input?.macroEvents || [];
  const providedPsychLevels = input?.psychologicalLevels || [];
  
  // Detect psychological levels (round numbers that bots miss)
  const psychologicalLevels: LayerGammaResult['psychologicalLevels'] = [];
  
  // Add round number levels
  const magnitude = Math.floor(Math.log10(price));
  const roundBase = Math.pow(10, magnitude);
  
  // Find nearby round numbers
  const roundFloor = Math.floor(price / roundBase) * roundBase;
  const roundCeil = Math.ceil(price / roundBase) * roundBase;
  
  if (price - roundFloor < price * 0.03) {
    psychologicalLevels.push({
      price: roundFloor,
      type: 'SUPPORT',
      reason: `Psychological round number ($${roundFloor.toLocaleString()})`
    });
  }
  
  if (roundCeil - price < price * 0.03) {
    psychologicalLevels.push({
      price: roundCeil,
      type: 'RESISTANCE',
      reason: `Psychological round number ($${roundCeil.toLocaleString()})`
    });
  }
  
  // Add user-provided psychological levels
  for (const level of providedPsychLevels) {
    psychologicalLevels.push({
      price: level,
      type: level > price ? 'RESISTANCE' : 'SUPPORT',
      reason: 'User-defined psychological level'
    });
  }
  
  // Analyze narrative from user context
  let narrativeAnalysis = 'No user context provided — Using default macro analysis';
  let macroImpact: LayerGammaResult['macroImpact'] = 'NEUTRAL';
  let positionSizeAdjustment: LayerGammaResult['positionSizeAdjustment'] = 'MAINTAIN';
  let action: LayerGammaResult['action'] = 'NEUTRAL';
  let confidence = 50;
  
  // Process user context for sentiment
  const contextLower = userContext.toLowerCase();
  
  let hawkishCount = 0;
  let dovishCount = 0;
  let volatilityRisk = false;
  
  for (const keyword of HAWKISH_KEYWORDS) {
    if (contextLower.includes(keyword)) hawkishCount++;
  }
  
  for (const keyword of DOVISH_KEYWORDS) {
    if (contextLower.includes(keyword)) dovishCount++;
  }
  
  for (const keyword of VOLATILITY_KEYWORDS) {
    if (contextLower.includes(keyword)) volatilityRisk = true;
  }
  
  // Determine macro impact
  if (hawkishCount > dovishCount) {
    macroImpact = 'BEARISH';
    narrativeAnalysis = `Hawkish sentiment detected in context (${hawkishCount} bearish signals). `;
  } else if (dovishCount > hawkishCount) {
    macroImpact = 'BULLISH';
    narrativeAnalysis = `Dovish sentiment detected in context (${dovishCount} bullish signals). `;
  } else if (volatilityRisk) {
    macroImpact = 'VOLATILE';
    narrativeAnalysis = 'High-impact macro event detected. Expect increased volatility. ';
  }
  
  // Check macro catalysts for upcoming events
  const upcomingHighImpact = macroCatalysts?.filter(c => c.impact === 'HIGH') || [];
  if (upcomingHighImpact.length > 0) {
    narrativeAnalysis += `${upcomingHighImpact.length} high-impact event(s) upcoming. `;
    volatilityRisk = true;
  }
  
  // Determine position size adjustment
  if (volatilityRisk) {
    positionSizeAdjustment = 'REDUCE';
    narrativeAnalysis += 'Recommend reducing position size ahead of macro event. ';
    confidence = 60;
  }
  
  // Determine if narrative should override or validate technicals
  const alphaIsBullish = alphaSignal?.includes('LONG');
  const alphaIsBearish = alphaSignal?.includes('SHORT');
  const betaIsBullish = betaSignal?.includes('LONG');
  const betaIsBearish = betaSignal?.includes('SHORT');
  
  if (macroImpact === 'BEARISH' && (alphaIsBullish || betaIsBullish)) {
    action = 'OVERRIDE';
    narrativeAnalysis += 'OVERRIDE: Macro narrative conflicts with bullish technicals. ';
    positionSizeAdjustment = 'REDUCE';
    confidence = 65;
  } else if (macroImpact === 'BULLISH' && (alphaIsBearish || betaIsBearish)) {
    action = 'OVERRIDE';
    narrativeAnalysis += 'OVERRIDE: Macro narrative conflicts with bearish technicals. ';
    positionSizeAdjustment = 'REDUCE';
    confidence = 65;
  } else if (macroImpact === 'BEARISH' && (alphaIsBearish || betaIsBearish)) {
    action = 'VALIDATE';
    narrativeAnalysis += 'VALIDATE: Macro narrative confirms bearish technicals. ';
    confidence = 75;
  } else if (macroImpact === 'BULLISH' && (alphaIsBullish || betaIsBullish)) {
    action = 'VALIDATE';
    narrativeAnalysis += 'VALIDATE: Macro narrative confirms bullish technicals. ';
    confidence = 75;
  }
  
  if (!userContext && !macroCatalysts?.length) {
    narrativeAnalysis = 'No human context provided. Layer Gamma neutral — using pure technical analysis.';
  }
  
  return {
    action,
    narrativeAnalysis,
    psychologicalLevels,
    macroImpact,
    positionSizeAdjustment,
    confidence
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎯 TRI-MODULAR SYNTHESIS — Combine All Three Layers
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Perform complete Tri-Modular Analysis
 */
export function performTriModularAnalysis(
  price: number,
  high24h: number,
  low24h: number,
  change: number,
  chartData?: ChartTrendInput,
  fearGreedValue?: number,
  narrativeInput?: LayerGammaInput,
  macroCatalysts?: MacroCatalyst[]
): TriModularAnalysis {
  // Execute Layer Alpha (Algorithm)
  const layerAlpha = analyzeLayerAlpha(price, high24h, low24h, change, chartData);
  
  // Execute Layer Beta (Neural Network)
  const layerBeta = analyzeLayerBeta(price, change, chartData, fearGreedValue);
  
  // Execute Layer Gamma (Human Hybrid)
  const layerGamma = analyzeLayerGamma(
    price, high24h, low24h,
    narrativeInput,
    macroCatalysts,
    layerAlpha.signal,
    layerBeta.signal
  );
  
  // ═══════════════════════════════════════════════════════════════════════════
  // Calculate Weighted Confidence Score
  // Layer weights: Alpha 40% + Beta 35% + Gamma 25% = 100%
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Direction scores (-1 = SHORT, 0 = NEUTRAL, 1 = LONG)
  const alphaDirection = layerAlpha.priceActionBias === 'BULLISH' ? 1 
    : layerAlpha.priceActionBias === 'BEARISH' ? -1 : 0;
  const betaDirection = layerBeta.signal.includes('LONG') ? 1 
    : layerBeta.signal.includes('SHORT') ? -1 : 0;
  const gammaDirection = layerGamma.macroImpact === 'BULLISH' ? 1 
    : layerGamma.macroImpact === 'BEARISH' ? -1 : 0;
  
  // If gamma overrides, amplify its directional effect
  let effectiveGammaDirection = gammaDirection;
  if (layerGamma.action === 'OVERRIDE') {
    effectiveGammaDirection = gammaDirection * GAMMA_OVERRIDE_AMPLIFICATION;
  }
  
  // Calculate weighted direction using configured layer weights
  const weightedDirection = 
    alphaDirection * LAYER_ALPHA_WEIGHT * (layerAlpha.confidence / 100) +
    betaDirection * LAYER_BETA_WEIGHT * (layerBeta.confidence / 100) +
    effectiveGammaDirection * LAYER_GAMMA_WEIGHT * (layerGamma.confidence / 100);
  
  // Determine final direction using directional threshold
  const finalDirection: 'LONG' | 'SHORT' | 'NEUTRAL' = 
    weightedDirection > DIRECTIONAL_THRESHOLD ? 'LONG' 
    : weightedDirection < -DIRECTIONAL_THRESHOLD ? 'SHORT' 
    : 'NEUTRAL';
  
  // Calculate confidence percentage with configured layer weights
  const alphaContribution = alphaDirection * LAYER_ALPHA_WEIGHT * layerAlpha.confidence;
  const betaContribution = betaDirection * LAYER_BETA_WEIGHT * layerBeta.confidence;
  const gammaContribution = effectiveGammaDirection * LAYER_GAMMA_WEIGHT * layerGamma.confidence;
  
  const rawConfidence = Math.abs(alphaContribution) + Math.abs(betaContribution) + Math.abs(gammaContribution);
  const normalizedConfidence = Math.min(MAX_CONFIDENCE, Math.max(MIN_CONFIDENCE, rawConfidence / CONFIDENCE_NORMALIZATION_FACTOR));
  
  // ═══════════════════════════════════════════════════════════════════════════
  // Generate Conflict Report
  // ═══════════════════════════════════════════════════════════════════════════
  
  const alphaIsBullish = layerAlpha.priceActionBias === 'BULLISH';
  const alphaIsBearish = layerAlpha.priceActionBias === 'BEARISH';
  const betaIsBullish = layerBeta.signal.includes('LONG');
  const betaIsBearish = layerBeta.signal.includes('SHORT');
  
  const hasConflict = (alphaIsBullish && betaIsBearish) || (alphaIsBearish && betaIsBullish);
  
  // Check if NN sees reversal that Algorithm is missing
  const reversalSignalFromNN = layerBeta.reversalProbability > 60;
  let algorithmMissing: string | null = null;
  
  if (reversalSignalFromNN && !hasConflict) {
    if (alphaIsBearish && layerBeta.rsiAnalysis.condition === 'OVERSOLD') {
      algorithmMissing = 'Algorithm bearish but NN detects oversold conditions — potential bullish reversal';
    } else if (alphaIsBullish && layerBeta.rsiAnalysis.condition === 'OVERBOUGHT') {
      algorithmMissing = 'Algorithm bullish but NN detects overbought conditions — potential bearish reversal';
    }
  }
  
  let conflictDescription = 'No significant conflict between layers.';
  if (hasConflict) {
    conflictDescription = `CONFLICT: Algorithm (${layerAlpha.signal}) disagrees with Neural Network (${layerBeta.signal}). `;
    if (layerGamma.action === 'OVERRIDE') {
      conflictDescription += `Narrative filter suggests ${layerGamma.macroImpact} bias.`;
    }
  } else if (algorithmMissing) {
    conflictDescription = algorithmMissing;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // Human-In-The-Loop Verdict
  // ═══════════════════════════════════════════════════════════════════════════
  
  let positionSizeRecommendation: 'FULL' | '75%' | '50%' | '25%' | 'AVOID';
  let reasoning: string;
  let upcomingMacroRisk: string | null = null;
  let waitTime: string | null = null;
  
  // Check for upcoming macro events
  const upcomingHighImpact = macroCatalysts?.filter(c => c.impact === 'HIGH') || [];
  if (upcomingHighImpact.length > 0) {
    const nextEvent = upcomingHighImpact[0];
    upcomingMacroRisk = `${nextEvent.event} — ${nextEvent.expectedEffect}`;
    
    // Parse time from event description
    if (narrativeInput?.userContext?.toLowerCase().includes('hour')) {
      const hourMatch = narrativeInput.userContext.match(/(\d+)\s*hour/i);
      if (hourMatch) {
        waitTime = `Wait ${hourMatch[1]} hours for ${nextEvent.event}`;
      }
    }
  }
  
  // Determine position size based on confluence and risk
  if (hasConflict || layerGamma.action === 'OVERRIDE') {
    positionSizeRecommendation = '25%';
    reasoning = 'Significant disagreement between layers — reduce exposure';
  } else if (upcomingMacroRisk && !waitTime) {
    positionSizeRecommendation = '50%';
    reasoning = `High-impact event upcoming (${upcomingMacroRisk}) — reduce size`;
  } else if (layerGamma.positionSizeAdjustment === 'REDUCE') {
    positionSizeRecommendation = '50%';
    reasoning = 'Narrative filter suggests caution — moderate position';
  } else if (normalizedConfidence >= 80 && !hasConflict) {
    positionSizeRecommendation = 'FULL';
    reasoning = 'Strong confluence across all layers — full position justified';
  } else if (normalizedConfidence >= 65) {
    positionSizeRecommendation = '75%';
    reasoning = 'Good confluence — standard position with room for adds';
  } else if (normalizedConfidence >= 50) {
    positionSizeRecommendation = '50%';
    reasoning = 'Moderate confluence — conservative position';
  } else {
    positionSizeRecommendation = 'AVOID';
    reasoning = 'Insufficient confluence — wait for better setup';
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // Calculate Kill Switch Level
  // ═══════════════════════════════════════════════════════════════════════════
  
  const range = high24h - low24h;
  let killSwitchPrice: number;
  let killSwitchReason: string;
  
  if (finalDirection === 'LONG') {
    // For longs, kill switch is below support
    killSwitchPrice = Math.min(
      low24h - range * 0.05,
      layerAlpha.liquidityVoids.find(l => l.type === 'SSL')?.level || low24h * 0.99
    );
    killSwitchReason = 'Break below SSL (Sell Side Liquidity) invalidates long thesis';
  } else if (finalDirection === 'SHORT') {
    // For shorts, kill switch is above resistance
    killSwitchPrice = Math.max(
      high24h + range * 0.05,
      layerAlpha.liquidityVoids.find(l => l.type === 'BSL')?.level || high24h * 1.01
    );
    killSwitchReason = 'Break above BSL (Buy Side Liquidity) invalidates short thesis';
  } else {
    // Neutral — use midpoint breakout
    const midpoint = (high24h + low24h) / 2;
    killSwitchPrice = midpoint;
    killSwitchReason = 'Waiting for breakout from range — either direction invalidates neutral';
  }
  
  // Check if all layers agree on direction for kill switch
  const allLayersAgree = 
    (alphaDirection > 0 && betaDirection > 0 && gammaDirection >= 0) ||
    (alphaDirection < 0 && betaDirection < 0 && gammaDirection <= 0);
  
  return {
    layerAlpha,
    layerBeta,
    layerGamma,
    weightedConfidenceScore: {
      direction: finalDirection,
      percentage: Math.round(normalizedConfidence),
      breakdown: {
        alphaContribution: Math.round(Math.abs(alphaContribution) * 10) / 10,
        betaContribution: Math.round(Math.abs(betaContribution) * 10) / 10,
        gammaContribution: Math.round(Math.abs(gammaContribution) * 10) / 10
      }
    },
    conflictReport: {
      hasConflict,
      description: conflictDescription,
      reversalSignalFromNN,
      algorithmMissing
    },
    humanInTheLoopVerdict: {
      positionSizeRecommendation,
      reasoning,
      upcomingMacroRisk,
      waitTime
    },
    killSwitchLevel: {
      price: killSwitchPrice,
      reason: killSwitchReason,
      allLayersAgree
    }
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📝 FORMAT TRI-MODULAR OUTPUT — Human-Readable Analysis
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate formatted Tri-Modular Analysis output
 */
export function formatTriModularOutput(
  analysis: TriModularAnalysis,
  crypto: string,
  price: number
): string {
  const { layerAlpha, layerBeta, layerGamma, weightedConfidenceScore, conflictReport, humanInTheLoopVerdict, killSwitchLevel } = analysis;
  
  // Determine decimals based on price
  const decimals = price < 1 ? 6 : price < 10 ? 4 : price < 1000 ? 2 : 0;
  
  return `
━━━ 🎯 TRI-MODULAR ANALYSIS (${crypto}) ━━━━━━━━━━━━━━

═══ 📊 LAYER ALPHA (Algorithm — ICT/SMC) ═══

Signal: ${layerAlpha.signal}
Confidence: ${layerAlpha.confidence}%
Price Action Bias: ${layerAlpha.priceActionBias}

📦 Order Blocks:
${layerAlpha.orderBlocks.map(ob => `   • ${ob.type} @ $${ob.level.toFixed(decimals)} (Strength: ${ob.strength}%)`).join('\n')}

💧 Liquidity Voids:
${layerAlpha.liquidityVoids.map(lv => `   • ${lv.type} @ $${lv.level.toFixed(decimals)}`).join('\n')}

📐 Key Fibonacci Levels:
${layerAlpha.fibLevels.slice(0, 3).map(f => `   • ${f.level}: $${f.price.toFixed(decimals)} [${f.significance}]`).join('\n')}

⏱️ Timeframe Analysis:
   • 4H: ${layerAlpha.timeframe4H.trend} — ${layerAlpha.timeframe4H.structure}
   • 15M: ${layerAlpha.timeframe15M.trend} — ${layerAlpha.timeframe15M.structure}

═══ 🧠 LAYER BETA (Neural Network — Pattern Recognition) ═══

Signal: ${layerBeta.signal}
Confidence: ${layerBeta.confidence}%
Market Phase: ${layerBeta.marketPhase}

📈 Momentum Indicators:
   • RSI: ${layerBeta.rsiAnalysis.value.toFixed(1)} (${layerBeta.rsiAnalysis.condition})
   • MACD: ${layerBeta.macdAnalysis.histogram > 0 ? '+' : ''}${layerBeta.macdAnalysis.histogram.toFixed(2)} — ${layerBeta.macdAnalysis.signal}

🔍 Hidden Correlations:
${layerBeta.hiddenCorrelations.map(c => `   • ${c}`).join('\n')}

😱 Fear & Greed Analysis:
   • Current: ${layerBeta.fearGreedComparison.current}
   • Historical Extreme Fear (Level 12): ${layerBeta.fearGreedComparison.historicalExtremeFear}
   • Similarity: ${layerBeta.fearGreedComparison.similarity.toFixed(0)}%

🔄 Reversal Probability: ${layerBeta.reversalProbability}%

═══ 👤 LAYER GAMMA (Human Hybrid — Narrative Filter) ═══

Action: ${layerGamma.action}
Macro Impact: ${layerGamma.macroImpact}
Position Adjustment: ${layerGamma.positionSizeAdjustment}

📝 Narrative Analysis:
   ${layerGamma.narrativeAnalysis}

🧠 Psychological Levels:
${layerGamma.psychologicalLevels.length > 0 
  ? layerGamma.psychologicalLevels.map(p => `   • ${p.type}: $${p.price.toFixed(decimals)} — ${p.reason}`).join('\n')
  : '   • No significant psychological levels detected'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 WEIGHTED CONFIDENCE SCORE: ${weightedConfidenceScore.percentage}% ${weightedConfidenceScore.direction}
   └─ Alpha: ${weightedConfidenceScore.breakdown.alphaContribution.toFixed(1)}%
   └─ Beta: ${weightedConfidenceScore.breakdown.betaContribution.toFixed(1)}%
   └─ Gamma: ${weightedConfidenceScore.breakdown.gammaContribution.toFixed(1)}%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚔️ CONFLICT REPORT:
   ${conflictReport.hasConflict ? '⚠️ CONFLICT DETECTED' : '✅ No Conflict'}
   ${conflictReport.description}
   ${conflictReport.reversalSignalFromNN ? '🔄 NN sees potential reversal' : ''}
   ${conflictReport.algorithmMissing ? `📌 Algorithm may be missing: ${conflictReport.algorithmMissing}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 HUMAN-IN-THE-LOOP VERDICT:
   📏 Position Size: ${humanInTheLoopVerdict.positionSizeRecommendation}
   💡 Reasoning: ${humanInTheLoopVerdict.reasoning}
   ${humanInTheLoopVerdict.upcomingMacroRisk ? `⚠️ Macro Risk: ${humanInTheLoopVerdict.upcomingMacroRisk}` : ''}
   ${humanInTheLoopVerdict.waitTime ? `⏳ ${humanInTheLoopVerdict.waitTime}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🛑 KILL SWITCH LEVEL: $${killSwitchLevel.price.toFixed(decimals)}
   └─ ${killSwitchLevel.reason}
   └─ All Layers Agree: ${killSwitchLevel.allLayersAgree ? '✅ YES' : '❌ NO'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📱 SIMPLIFIED SUMMARY — Beginner-Friendly Analysis
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate a simplified, beginner-friendly summary of the analysis
 * Uses plain English instead of trading jargon
 */
export function generateSimplifiedSummary(
  analysis: TriModularAnalysis,
  crypto: string,
  price: number,
  skipTradeInfo?: { skipTrade: boolean; skipReason?: string; neuralConfidence?: number }
): string {
  // Validate required properties with safe defaults
  const weightedConfidenceScore = analysis?.weightedConfidenceScore ?? { 
    direction: 'NEUTRAL' as const, 
    percentage: 50,
    breakdown: { alphaContribution: 0, betaContribution: 0, gammaContribution: 0 }
  };
  const conflictReport = analysis?.conflictReport ?? { 
    hasConflict: false, 
    description: 'Analysis unavailable',
    reversalSignalFromNN: false,
    algorithmMissing: null
  };
  const humanInTheLoopVerdict = analysis?.humanInTheLoopVerdict ?? { 
    positionSizeRecommendation: 'AVOID' as const, 
    reasoning: 'Insufficient data for recommendation',
    upcomingMacroRisk: null,
    waitTime: null
  };
  const killSwitchLevel = analysis?.killSwitchLevel ?? { 
    price: price, 
    reason: 'Default to current price',
    allLayersAgree: false
  };
  const layerBeta = analysis?.layerBeta ?? { 
    marketPhase: 'NEUTRAL' as const,
    signal: '⚪ NEUTRAL' as const,
    confidence: 50,
    rsiAnalysis: { value: 50, condition: 'NEUTRAL' as const },
    macdAnalysis: { histogram: 0, signal: 'Neutral', momentum: 'NEUTRAL' as const },
    hiddenCorrelations: [],
    fearGreedComparison: { current: 50, historicalExtremeFear: 12, similarity: 50 },
    reversalProbability: 30
  };
  
  // Determine decimals based on price
  const decimals = price < 1 ? 6 : price < 10 ? 4 : price < 1000 ? 2 : 0;
  
  // Check if trade should be skipped (NN Filter or other safety filters failed)
  const isTradeSkipped = skipTradeInfo?.skipTrade ?? false;
  
  // Check if Tri-Modular verdict is AVOID (overrides everything else)
  const isTriModularAvoid = humanInTheLoopVerdict.positionSizeRecommendation === 'AVOID';
  
  // Convert direction to simple action - but override if trade is skipped OR tri-modular says AVOID
  let action: string;
  let displayConfidence: string;
  let displayPercentage: number;
  
  if (isTradeSkipped || isTriModularAvoid) {
    action = '🔴 NO TRADE / WAITING';
    // When trade is skipped or avoided, show consistent messaging
    displayConfidence = isTriModularAvoid ? 'AVOID' : 'WAITING';
    displayPercentage = 0; // No confidence when skipping/avoiding
  } else {
    action = weightedConfidenceScore.direction === 'LONG' 
      ? '📈 Consider BUYING' 
      : weightedConfidenceScore.direction === 'SHORT' 
        ? '📉 Consider SELLING' 
        : '⏸️ WAIT and watch';
    // Convert confidence to simple terms
    displayConfidence = weightedConfidenceScore.percentage >= 75 
      ? 'HIGH confidence' 
      : weightedConfidenceScore.percentage >= 55 
        ? 'MEDIUM confidence' 
        : 'LOW confidence';
    displayPercentage = weightedConfidenceScore.percentage;
  }
  
  // Generate skip reason explanation for beginners if trade is skipped or avoided
  const skipExplanation = (isTradeSkipped || isTriModularAvoid)
    ? isTriModularAvoid && !isTradeSkipped
      ? `\n🛑 WHY NO TRADE:\n   Tri-Modular Analysis recommends AVOID\n   Confidence too low (${weightedConfidenceScore.percentage}%) - needs 50%+ to proceed\n   ${humanInTheLoopVerdict.reasoning}\n`
      : isTradeSkipped && skipTradeInfo?.skipReason
        ? `\n🛑 WHY NO TRADE:\n   ${skipTradeInfo.skipReason}${
            skipTradeInfo.neuralConfidence !== undefined
              ? `\n   (AI confidence: ${(skipTradeInfo.neuralConfidence * 100).toFixed(0)}% - needs 51% to proceed)`
              : ''
          }\n`
        : '\n🛑 WHY NO TRADE:\n   AI safety filters recommend avoiding this trade\n'
    : '';
  
  // Simple explanation of market mood
  const marketMood = layerBeta.marketPhase === 'EUPHORIA' 
    ? '🎉 Market is very excited (could reverse soon)'
    : layerBeta.marketPhase === 'CAPITULATION'
      ? '😰 Market is panicking (could bounce soon)'
      : layerBeta.marketPhase === 'ACCUMULATION'
        ? '🛒 Smart money may be buying quietly'
        : layerBeta.marketPhase === 'DISTRIBUTION'
          ? '💸 Smart money may be selling quietly'
          : '😐 Market is calm, no extreme emotions';
  
  // Simple position size recommendation
  const positionAdvice = humanInTheLoopVerdict.positionSizeRecommendation === 'FULL'
    ? '💪 Full position OK if you\'re comfortable'
    : humanInTheLoopVerdict.positionSizeRecommendation === '75%'
      ? '👍 Use about 3/4 of your planned amount'
      : humanInTheLoopVerdict.positionSizeRecommendation === '50%'
        ? '✋ Use only half your planned amount'
        : humanInTheLoopVerdict.positionSizeRecommendation === '25%'
          ? '⚠️ Use only 1/4 - high uncertainty'
          : '🛑 Skip this trade - conditions not favorable';
  
  // Simple kill switch explanation
  const exitPrice = killSwitchLevel.price.toFixed(decimals);
  const exitExplanation = isTradeSkipped || isTriModularAvoid
    ? 'Wait for better market conditions before entering'
    : weightedConfidenceScore.direction === 'LONG'
      ? `If price drops below $${exitPrice}, consider exiting`
      : weightedConfidenceScore.direction === 'SHORT'
        ? `If price rises above $${exitPrice}, consider exiting`
        : `Watch for breakout above or below $${exitPrice}`;

  // Agreement indicator
  const agreementStatus = conflictReport.hasConflict
    ? '⚠️ Our analysis systems disagree - be extra careful'
    : '✅ Our analysis systems agree - stronger signal';

  // Ensure reasoning has a user-friendly fallback
  const reasoningText = humanInTheLoopVerdict.reasoning && humanInTheLoopVerdict.reasoning.trim() 
    ? humanInTheLoopVerdict.reasoning 
    : 'Based on current market conditions';

  return `
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
   📱 QUICK SUMMARY FOR ${crypto} 
   (Zikalyze AI Analysis)
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

━━━ 📚 UNDERSTANDING THE ANALYSIS ━━━━━━━━━━━━━━━━

🎯 Trading Actions:
• "LONG" = Buy now, expecting price to rise
• "SHORT" = Sell now, expecting price to fall
• "NO TRADE" = Wait for better opportunity

💰 Risk Management:
• "Position Size" = How much of your money to invest
• "Kill Switch" = Emergency exit price to limit losses
• "Stop Loss" = Automatic sell if price moves against you

📊 Technical Terms:
• "Confluence" = Multiple indicators pointing same direction
  (Higher confluence = more reliable signal)
• "Timeframe" = Period of analysis (1H = 1 hour, 4H = 4 hours)
  (Weekly trends are stronger than hourly trends)
• "Support" = Price level where buying typically appears
• "Resistance" = Price level where selling typically appears

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ Remember: This is NOT financial advice. 
   Only trade what you can afford to lose.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
}
