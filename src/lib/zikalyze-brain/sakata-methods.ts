// ═══════════════════════════════════════════════════════════════════════════════
// 🏯 ZIKALYZE ADVANCED PATTERN RECOGNITION — Proprietary AI System
// ═══════════════════════════════════════════════════════════════════════════════
// 🎯 Purpose: Professional-grade pattern recognition for enhanced trading accuracy
// 🔬 Integration: Works alongside Western candlestick patterns for confluence
// 📈 Patterns: Multi-formation detection (reversals, continuations, momentum)
// ⚡ Technology: Advanced AI algorithms combining traditional wisdom with modern ML
// ═══════════════════════════════════════════════════════════════════════════════

export interface SakataPattern {
  method: 'SAN_ZAN' | 'SAN_SEN' | 'SAN_POH' | 'SAN_KU' | 'SAN_PEI';
  pattern: string;
  type: 'REVERSAL' | 'CONTINUATION' | 'MOMENTUM';
  bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  strength: number; // 0-100
  confidence: number; // 0-100 based on pattern quality
  description: string;
  entryTrigger: string;
  stopLoss?: number;
  target?: number;
  candlesRequired: number;
}

export interface SakataAnalysis {
  primaryPattern: SakataPattern | null;
  secondaryPatterns: SakataPattern[];
  confluenceScore: number; // 0-100: multiple patterns aligning
  overallBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  overallStrength: number; // Combined strength of all patterns
  recommendation: string;
}

interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
}

/**
 * 🏔️ Three Mountains Pattern - Top Reversal Detection
 * Advanced AI pattern recognition for triple top formations
 */
function detectSanZan(candles: Candle[], currentPrice: number): SakataPattern | null {
  if (candles.length < 10) return null;
  
  // Find peaks (local maxima)
  const peaks: Array<{ index: number; price: number }> = [];
  for (let i = 2; i < candles.length - 2; i++) {
    const current = candles[i].high;
    if (current > candles[i-1].high && 
        current > candles[i-2].high &&
        current > candles[i+1].high && 
        current > candles[i+2].high) {
      peaks.push({ index: i, price: current });
    }
  }
  
  if (peaks.length < 3) return null;
  
  // Take the last 3 peaks
  const lastThreePeaks = peaks.slice(-3);
  const peak1 = lastThreePeaks[0].price;
  const peak2 = lastThreePeaks[1].price;
  const peak3 = lastThreePeaks[2].price;
  
  const avgPeak = (peak1 + peak2 + peak3) / 3;
  const tolerance = avgPeak * 0.03; // 3% tolerance
  
  // Check if peaks are at similar levels
  const isPeaksSimilar = 
    Math.abs(peak1 - avgPeak) < tolerance &&
    Math.abs(peak2 - avgPeak) < tolerance &&
    Math.abs(peak3 - avgPeak) < tolerance;
  
  if (!isPeaksSimilar) return null;
  
  // Find valleys between peaks
  const valley1 = Math.min(...candles.slice(lastThreePeaks[0].index, lastThreePeaks[1].index).map(c => c.low));
  const valley2 = Math.min(...candles.slice(lastThreePeaks[1].index, lastThreePeaks[2].index).map(c => c.low));
  const neckline = Math.max(valley1, valley2);
  
  // Check if current price is breaking below neckline
  const isBreakingDown = currentPrice < neckline;
  const distanceFromNeckline = Math.abs(currentPrice - neckline) / neckline;
  
  // Pattern strength based on:
  // 1. Uniformity of peaks
  // 2. Distance from neckline
  // 3. Volume confirmation (would need volume data)
  const peakUniformity = 100 - ((Math.max(peak1, peak2, peak3) - Math.min(peak1, peak2, peak3)) / avgPeak * 100);
  const strength = Math.min(95, peakUniformity * 0.7 + (isBreakingDown ? 25 : 0));
  
  // Head and Shoulders variant (middle peak highest)
  const isHeadAndShoulders = peak2 > peak1 * 1.02 && peak2 > peak3 * 1.02;
  const patternName = isHeadAndShoulders ? 'Head & Shoulders Formation' : 'Triple Peak Reversal';
  
  return {
    method: 'SAN_ZAN',
    pattern: patternName,
    type: 'REVERSAL',
    bias: 'BEARISH',
    strength: Math.round(strength),
    confidence: isBreakingDown ? 85 : 65,
    description: `${patternName} - Three failed breakout attempts, resistance exhaustion detected`,
    entryTrigger: isBreakingDown 
      ? `Breakdown confirmed at $${neckline.toFixed(4)}, add on retests`
      : `Enter on break below support: $${neckline.toFixed(4)}`,
    stopLoss: avgPeak * 1.02,
    target: neckline - (avgPeak - neckline), // Measured move
    candlesRequired: 10
  };
}

/**
 * 🌊 Three Valleys Pattern - Bottom Reversal Detection
 * Advanced AI pattern recognition for triple bottom formations
 */
function detectSanSen(candles: Candle[], currentPrice: number): SakataPattern | null {
  if (candles.length < 10) return null;
  
  // Find troughs (local minima)
  const troughs: Array<{ index: number; price: number }> = [];
  for (let i = 2; i < candles.length - 2; i++) {
    const current = candles[i].low;
    if (current < candles[i-1].low && 
        current < candles[i-2].low &&
        current < candles[i+1].low && 
        current < candles[i+2].low) {
      troughs.push({ index: i, price: current });
    }
  }
  
  if (troughs.length < 3) return null;
  
  // Take the last 3 troughs
  const lastThreeTroughs = troughs.slice(-3);
  const trough1 = lastThreeTroughs[0].price;
  const trough2 = lastThreeTroughs[1].price;
  const trough3 = lastThreeTroughs[2].price;
  
  const avgTrough = (trough1 + trough2 + trough3) / 3;
  const tolerance = avgTrough * 0.03; // 3% tolerance
  
  // Check if troughs are at similar levels
  const isTroughsSimilar = 
    Math.abs(trough1 - avgTrough) < tolerance &&
    Math.abs(trough2 - avgTrough) < tolerance &&
    Math.abs(trough3 - avgTrough) < tolerance;
  
  if (!isTroughsSimilar) return null;
  
  // Find peaks between troughs
  const peak1 = Math.max(...candles.slice(lastThreeTroughs[0].index, lastThreeTroughs[1].index).map(c => c.high));
  const peak2 = Math.max(...candles.slice(lastThreeTroughs[1].index, lastThreeTroughs[2].index).map(c => c.high));
  const neckline = Math.min(peak1, peak2);
  
  // Check if current price is breaking above neckline
  const isBreakingUp = currentPrice > neckline;
  
  // Pattern strength
  const troughUniformity = 100 - ((Math.max(trough1, trough2, trough3) - Math.min(trough1, trough2, trough3)) / avgTrough * 100);
  const strength = Math.min(95, troughUniformity * 0.7 + (isBreakingUp ? 25 : 0));
  
  // Inverted Head and Shoulders variant (middle trough lowest)
  const isInvertedHS = trough2 < trough1 * 0.98 && trough2 < trough3 * 0.98;
  const patternName = isInvertedHS ? 'Inverted Head & Shoulders' : 'Triple Bottom Reversal';
  
  return {
    method: 'SAN_SEN',
    pattern: patternName,
    type: 'REVERSAL',
    bias: 'BULLISH',
    strength: Math.round(strength),
    confidence: isBreakingUp ? 85 : 65,
    description: `${patternName} - Three failed breakdown attempts, support holding strong`,
    entryTrigger: isBreakingUp 
      ? `Breakout confirmed at $${neckline.toFixed(4)}, add on retests`
      : `Enter on break above resistance: $${neckline.toFixed(4)}`,
    stopLoss: avgTrough * 0.98,
    target: neckline + (neckline - avgTrough), // Measured move
    candlesRequired: 10
  };
}

/**
 * 🎯 Consolidation Continuation Pattern Detection
 * Advanced AI pattern recognition for trend continuation after consolidation
 */
function detectSanPoh(candles: Candle[]): SakataPattern | null {
  if (candles.length < 6) return null;
  
  // Check last 6 candles for Rising/Falling continuation pattern
  const day1 = candles[candles.length - 6];
  const consolidation = candles.slice(candles.length - 5, candles.length - 1);
  const breakout = candles[candles.length - 1];
  
  const day1Body = Math.abs(day1.close - day1.open);
  const day1Range = day1.high - day1.low;
  const day1IsBullish = day1.close > day1.open;
  const day1IsBearish = day1.close < day1.open;
  
  // Day 1 must be significant
  if (day1Body < day1Range * 0.6) return null;
  
  // Check consolidation candles
  const consolidationBodies = consolidation.map(c => Math.abs(c.close - c.open));
  const avgConsolidationBody = consolidationBodies.reduce((a, b) => a + b, 0) / consolidationBodies.length;
  
  // Consolidation candles should be small
  if (avgConsolidationBody > day1Body * 0.4) return null;
  
  // Consolidation should stay within Day 1 range
  const consolidationHigh = Math.max(...consolidation.map(c => c.high));
  const consolidationLow = Math.min(...consolidation.map(c => c.low));
  const staysWithinRange = consolidationHigh <= day1.high && consolidationLow >= day1.low;
  
  if (!staysWithinRange) return null;
  
  // Breakout candle should be in trend direction and strong
  const breakoutBody = Math.abs(breakout.close - breakout.open);
  const breakoutIsBullish = breakout.close > breakout.open;
  const breakoutIsBearish = breakout.close < breakout.open;
  
  // Bullish Continuation
  if (day1IsBullish && breakoutIsBullish && breakout.close > day1.high) {
    const strength = Math.min(90, 70 + (breakoutBody / day1Body * 20));
    return {
      method: 'SAN_POH',
      pattern: 'Bullish Continuation Flag',
      type: 'CONTINUATION',
      bias: 'BULLISH',
      strength: Math.round(strength),
      confidence: 80,
      description: 'Bullish continuation - consolidation within uptrend, momentum resuming higher',
      entryTrigger: `Enter on break above consolidation high: $${consolidationHigh.toFixed(4)}`,
      stopLoss: consolidationLow * 0.995,
      target: breakout.close + day1Body, // Project Day 1 move
      candlesRequired: 6
    };
  }
  
  // Bearish Continuation
  if (day1IsBearish && breakoutIsBearish && breakout.close < day1.low) {
    const strength = Math.min(90, 70 + (breakoutBody / day1Body * 20));
    return {
      method: 'SAN_POH',
      pattern: 'Bearish Continuation Flag',
      type: 'CONTINUATION',
      bias: 'BEARISH',
      strength: Math.round(strength),
      confidence: 80,
      description: 'Bearish continuation - consolidation within downtrend, momentum resuming lower',
      entryTrigger: `Enter on break below consolidation low: $${consolidationLow.toFixed(4)}`,
      stopLoss: consolidationHigh * 1.005,
      target: breakout.close - day1Body, // Project Day 1 move
      candlesRequired: 6
    };
  }
  
  return null;
}

/**
 * ⚔️ Strong Momentum Pattern Detection
 * Advanced AI pattern recognition for sustained directional pressure
 */
function detectSanKu(candles: Candle[]): SakataPattern | null {
  if (candles.length < 3) return null;
  
  const candle1 = candles[candles.length - 3];
  const candle2 = candles[candles.length - 2];
  const candle3 = candles[candles.length - 1];
  
  const body1 = Math.abs(candle1.close - candle1.open);
  const body2 = Math.abs(candle2.close - candle2.open);
  const body3 = Math.abs(candle3.close - candle3.open);
  
  const range1 = candle1.high - candle1.low;
  const range2 = candle2.high - candle2.low;
  const range3 = candle3.high - candle3.low;
  
  // All must be bullish
  const allBullish = candle1.close > candle1.open && 
                     candle2.close > candle2.open && 
                     candle3.close > candle3.open;
  
  // All must be bearish
  const allBearish = candle1.close < candle1.open && 
                     candle2.close < candle2.open && 
                     candle3.close < candle3.open;
  
  if (!allBullish && !allBearish) return null;
  
  // Bodies should be substantial (>60% of range)
  const substantialBodies = 
    body1 > range1 * 0.6 && 
    body2 > range2 * 0.6 && 
    body3 > range3 * 0.6;
  
  if (!substantialBodies) return null;
  
  if (allBullish) {
    // Check progressive closes
    const progressiveCloses = candle2.close > candle1.close && candle3.close > candle2.close;
    if (!progressiveCloses) return null;
    
    // Check opens within previous body
    const opensWithinBody = 
      candle2.open >= candle1.open && candle2.open <= candle1.close &&
      candle3.open >= candle2.open && candle3.open <= candle2.close;
    
    // Calculate strength based on momentum consistency
    const bodyConsistency = Math.min(body1, body2, body3) / Math.max(body1, body2, body3);
    const wickRatio = (
      (range1 - body1) / range1 +
      (range2 - body2) / range2 +
      (range3 - body3) / range3
    ) / 3;
    
    const strength = Math.min(95, 60 + bodyConsistency * 20 + (1 - wickRatio) * 15);
    
    // Detect exhaustion (decreasing bodies or increasing wicks)
    const isExhaustion = body3 < body2 * 0.8 || (range3 - body3) > body3 * 0.5;
    const confidence = isExhaustion ? 60 : 85;
    
    return {
      method: 'SAN_KU',
      pattern: isExhaustion ? 'Strong Rally (Deliberation)' : 'Strong Bullish Momentum',
      type: 'MOMENTUM',
      bias: 'BULLISH',
      strength: Math.round(strength),
      confidence,
      description: isExhaustion 
        ? 'Strong rally with weakening momentum - potential exhaustion detected'
        : 'Strong bullish momentum - sustained buying pressure detected',
      entryTrigger: isExhaustion 
        ? 'Wait for pullback confirmation before entering'
        : 'Momentum trade - enter on second or third impulse candle',
      stopLoss: Math.min(candle1.low, candle2.low, candle3.low) * 0.995,
      candlesRequired: 3
    };
  }
  
  if (allBearish) {
    // Check progressive closes
    const progressiveCloses = candle2.close < candle1.close && candle3.close < candle2.close;
    if (!progressiveCloses) return null;
    
    // Check opens within previous body
    const opensWithinBody = 
      candle2.open <= candle1.open && candle2.open >= candle1.close &&
      candle3.open <= candle2.open && candle3.open >= candle2.close;
    
    // Calculate strength
    const bodyConsistency = Math.min(body1, body2, body3) / Math.max(body1, body2, body3);
    const wickRatio = (
      (range1 - body1) / range1 +
      (range2 - body2) / range2 +
      (range3 - body3) / range3
    ) / 3;
    
    const strength = Math.min(95, 60 + bodyConsistency * 20 + (1 - wickRatio) * 15);
    
    // Detect exhaustion
    const isExhaustion = body3 < body2 * 0.8 || (range3 - body3) > body3 * 0.5;
    const confidence = isExhaustion ? 60 : 85;
    
    return {
      method: 'SAN_KU',
      pattern: isExhaustion ? 'Strong Decline (Weakening)' : 'Strong Bearish Momentum',
      type: 'MOMENTUM',
      bias: 'BEARISH',
      strength: Math.round(strength),
      confidence,
      description: isExhaustion 
        ? 'Strong decline with weakening momentum - potential exhaustion detected'
        : 'Strong bearish momentum - sustained selling pressure detected',
      entryTrigger: isExhaustion 
        ? 'Wait for bounce confirmation before entering short'
        : 'Momentum trade - enter on second or third impulse candle',
      stopLoss: Math.max(candle1.high, candle2.high, candle3.high) * 1.005,
      candlesRequired: 3
    };
  }
  
  return null;
}

/**
 * 📊 Gap & Momentum Shift Detection - Adapted for 24/7 Crypto Markets
 * Advanced AI detection of significant price movements and liquidity voids
 */
function detectSanPei(candles: Candle[]): SakataPattern | null {
  if (candles.length < 5) return null;
  
  // Look for Fair Value Gaps or rapid price movements
  for (let i = candles.length - 3; i >= Math.max(0, candles.length - 10); i--) {
    const candle1 = candles[i];
    const candle2 = candles[i + 1];
    const candle3 = candles[i + 2];
    
    // Bullish FVG: candle3 low > candle1 high (gap up)
    const bullishFVG = candle3.low > candle1.high;
    // Bearish FVG: candle3 high < candle1 low (gap down)
    const bearishFVG = candle3.high < candle1.low;
    
    if (bullishFVG) {
      const gapSize = candle3.low - candle1.high;
      const gapPercentage = (gapSize / candle1.high) * 100;
      
      // Significant gap (> 0.5% for crypto)
      if (gapPercentage > 0.5) {
        const gapFilled = candles.slice(i + 3).some(c => c.low <= candle1.high);
        
        return {
          method: 'SAN_PEI',
          pattern: gapFilled ? 'Momentum Exhaustion Gap' : 'Strong Breakaway Move',
          type: gapFilled ? 'REVERSAL' : 'CONTINUATION',
          bias: gapFilled ? 'BEARISH' : 'BULLISH',
          strength: gapFilled ? 70 : 75,
          confidence: 70,
          description: gapFilled 
            ? `Liquidity void filled at $${candle1.high.toFixed(4)} - potential momentum exhaustion`
            : `Strong upward momentum shift ${gapPercentage.toFixed(2)}% - breakaway detected`,
          entryTrigger: gapFilled 
            ? 'Gap fill indicates weakness, consider short positions'
            : 'Liquidity void likely to hold as support, continuation expected',
          candlesRequired: 5
        };
      }
    }
    
    if (bearishFVG) {
      const gapSize = candle1.low - candle3.high;
      const gapPercentage = (gapSize / candle1.low) * 100;
      
      if (gapPercentage > 0.5) {
        const gapFilled = candles.slice(i + 3).some(c => c.high >= candle1.low);
        
        return {
          method: 'SAN_PEI',
          pattern: gapFilled ? 'Momentum Exhaustion Gap' : 'Strong Breakaway Move',
          type: gapFilled ? 'REVERSAL' : 'CONTINUATION',
          bias: gapFilled ? 'BULLISH' : 'BEARISH',
          strength: gapFilled ? 70 : 75,
          confidence: 70,
          description: gapFilled 
            ? `Liquidity void filled at $${candle1.low.toFixed(4)} - potential support found`
            : `Strong downward momentum shift ${gapPercentage.toFixed(2)}% - breakaway detected`,
          entryTrigger: gapFilled 
            ? 'Gap fill indicates support, consider long positions'
            : 'Liquidity void likely to hold as resistance, continuation expected',
          candlesRequired: 5
        };
      }
    }
  }
  
  return null;
}

/**
 * 🏯 Advanced Pattern Analysis Engine
 * Analyzes candles for professional-grade pattern recognition and returns comprehensive analysis
 */
export function analyzeSakataMethods(
  candles: Candle[],
  currentPrice: number,
  bias: 'LONG' | 'SHORT' | 'NEUTRAL'
): SakataAnalysis {
  const patterns: SakataPattern[] = [];
  
  // Detect all advanced patterns
  const sanZan = detectSanZan(candles, currentPrice);
  if (sanZan) patterns.push(sanZan);
  
  const sanSen = detectSanSen(candles, currentPrice);
  if (sanSen) patterns.push(sanSen);
  
  const sanPoh = detectSanPoh(candles);
  if (sanPoh) patterns.push(sanPoh);
  
  const sanKu = detectSanKu(candles);
  if (sanKu) patterns.push(sanKu);
  
  const sanPei = detectSanPei(candles);
  if (sanPei) patterns.push(sanPei);
  
  if (patterns.length === 0) {
    return {
      primaryPattern: null,
      secondaryPatterns: [],
      confluenceScore: 0,
      overallBias: 'NEUTRAL',
      overallStrength: 0,
      recommendation: 'No clear advanced patterns detected - await better setup'
    };
  }
  
  // Sort by strength and confidence
  patterns.sort((a, b) => (b.strength * b.confidence) - (a.strength * a.confidence));
  
  const primaryPattern = patterns[0];
  const secondaryPatterns = patterns.slice(1);
  
  // Calculate confluence (multiple patterns agreeing)
  const bullishPatterns = patterns.filter(p => p.bias === 'BULLISH').length;
  const bearishPatterns = patterns.filter(p => p.bias === 'BEARISH').length;
  const totalPatterns = patterns.length;
  
  const confluenceScore = Math.max(
    (bullishPatterns / totalPatterns) * 100,
    (bearishPatterns / totalPatterns) * 100
  );
  
  // Overall bias based on weighted voting
  const biasVotes = patterns.reduce((acc, p) => {
    const weight = p.strength * p.confidence / 100;
    if (p.bias === 'BULLISH') acc.bullish += weight;
    if (p.bias === 'BEARISH') acc.bearish += weight;
    return acc;
  }, { bullish: 0, bearish: 0 });
  
  const overallBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 
    biasVotes.bullish > biasVotes.bearish * 1.2 ? 'BULLISH' :
    biasVotes.bearish > biasVotes.bullish * 1.2 ? 'BEARISH' :
    'NEUTRAL';
  
  // Overall strength (weighted average)
  const overallStrength = patterns.reduce((sum, p) => 
    sum + p.strength * p.confidence / 100, 0
  ) / patterns.length;
  
  // Generate recommendation
  let recommendation: string;
  if (confluenceScore > 80 && overallStrength > 70) {
    recommendation = `STRONG ${overallBias} SETUP - Multiple advanced patterns aligning with high confidence`;
  } else if (confluenceScore > 60 && overallStrength > 60) {
    recommendation = `MODERATE ${overallBias} SETUP - Good pattern confluence, proceed with caution`;
  } else if (patterns.length > 1) {
    recommendation = `MIXED SIGNALS - Advanced patterns conflicting, wait for clarity`;
  } else {
    recommendation = `${primaryPattern.pattern} detected - ${primaryPattern.description}`;
  }
  
  return {
    primaryPattern,
    secondaryPatterns,
    confluenceScore: Math.round(confluenceScore),
    overallBias,
    overallStrength: Math.round(overallStrength),
    recommendation
  };
}
