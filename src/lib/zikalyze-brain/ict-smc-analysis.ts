// ═══════════════════════════════════════════════════════════════════════════════
// 📊 ICT/SMC ANALYSIS MODULE v1.0 — Inner Circle Trader & Smart Money Concepts
// ═══════════════════════════════════════════════════════════════════════════════
// 🎯 Order Blocks, Fair Value Gaps, Liquidity, Market Structure
// 📈 Multi-timeframe confluence with learning capabilities
// ⚡ Premium/Discount zones, Optimal Trade Entry (OTE)
// ═══════════════════════════════════════════════════════════════════════════════

import { ChartTrendInput, MultiTimeframeInput, MarketStructure } from './types';

// ═══════════════════════════════════════════════════════════════════════════════
// 📊 ICT/SMC TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Order Block - Last bullish/bearish candle before a significant move
 */
export interface OrderBlock {
  type: 'BULLISH' | 'BEARISH';
  high: number;
  low: number;
  midpoint: number;
  strength: number;        // 0-100 based on the move it created
  timeframe: string;
  timestamp: number;
  isMitigated: boolean;    // Has price returned and tapped it?
  isBreaker: boolean;      // Order block that failed and became breaker
}

/**
 * Fair Value Gap (FVG) - Imbalance in price where no trading occurred
 */
export interface FairValueGap {
  type: 'BULLISH' | 'BEARISH';
  high: number;            // Top of gap
  low: number;             // Bottom of gap
  midpoint: number;        // CE (Consequent Encroachment)
  size: number;            // Size of gap in price
  percentSize: number;     // Size as percentage of price
  timeframe: string;
  timestamp: number;
  isFilled: boolean;       // Has price filled the gap?
  fillPercentage: number;  // How much of the gap is filled
}

/**
 * Liquidity Pool - Areas where stop losses are likely clustered
 */
export interface LiquidityPool {
  type: 'BSL' | 'SSL';     // Buy Side Liquidity / Sell Side Liquidity
  level: number;
  strength: number;        // Based on number of touches
  timeframe: string;
  isSwept: boolean;        // Has liquidity been taken?
  timestamp: number;
}

/**
 * Market Structure Shift
 */
export interface StructureShift {
  type: 'BOS' | 'CHoCH';   // Break of Structure / Change of Character
  direction: 'BULLISH' | 'BEARISH';
  level: number;           // Level that was broken
  timestamp: number;
  timeframe: string;
  isConfirmed: boolean;
}

/**
 * Premium/Discount Zone Analysis
 */
export interface PremiumDiscountZone {
  zone: 'PREMIUM' | 'DISCOUNT' | 'EQUILIBRIUM';
  pricePosition: number;   // 0-100 (0 = max discount, 100 = max premium)
  fibLevel: string;        // Which fib level price is at
  optimalEntry: boolean;   // Is this a good entry zone?
  bias: 'LONG' | 'SHORT' | 'NEUTRAL';
}

/**
 * Optimal Trade Entry (OTE)
 */
export interface OptimalTradeEntry {
  isOTE: boolean;
  zone: 'OTE_LONG' | 'OTE_SHORT' | 'NONE';
  entryLevel: number;
  stopLoss: number;
  target1: number;
  target2: number;
  riskReward: number;
  confidence: number;
}

/**
 * Displacement - Strong impulsive move with imbalance
 */
export interface Displacement {
  direction: 'BULLISH' | 'BEARISH';
  startPrice: number;
  endPrice: number;
  magnitude: number;       // Percentage move
  volumeMultiplier: number; // How much volume compared to average
  hasImbalance: boolean;   // Contains FVG?
  timestamp: number;
}

/**
 * Complete ICT/SMC Analysis Result
 */
export interface ICTSMCAnalysis {
  // Core ICT Concepts
  orderBlocks: OrderBlock[];
  fairValueGaps: FairValueGap[];
  liquidityPools: LiquidityPool[];
  structureShifts: StructureShift[];
  
  // Current Market Context
  premiumDiscount: PremiumDiscountZone;
  optimalEntry: OptimalTradeEntry;
  displacement: Displacement | null;
  
  // Market Structure (enhanced)
  marketStructure: MarketStructure;
  dailyBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  htfTrend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  ltfTrend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  
  // Multi-Timeframe Confluence
  timeframeConfluence: {
    aligned: boolean;
    score: number;
    htfBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    ltfConfirmation: boolean;
    recommendation: string;
  };
  
  // Trade Signals
  tradeSetup: ICTTradeSetup | null;
  
  // Learning Data
  patternSignature: string;
  confidence: number;
}

/**
 * ICT Trade Setup
 */
export interface ICTTradeSetup {
  type: 'OB_ENTRY' | 'FVG_ENTRY' | 'LIQUIDITY_SWEEP' | 'BOS_CONTINUATION';
  direction: 'LONG' | 'SHORT';
  entry: number;
  stopLoss: number;
  target1: number;
  target2: number;
  target3: number;
  riskReward: number;
  reasoning: string[];
  confluence: string[];
  confidence: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔧 ICT/SMC DETECTION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * Detect Order Blocks from candle data
 * Order Block = last opposing candle before a significant move
 */
export function detectOrderBlocks(
  candles: CandleData[],
  timeframe: string,
  minMovePercent: number = 1.0
): OrderBlock[] {
  const orderBlocks: OrderBlock[] = [];
  
  if (candles.length < 5) return orderBlocks;
  
  for (let i = 2; i < candles.length - 2; i++) {
    const current = candles[i];
    const prev = candles[i - 1];
    const next1 = candles[i + 1];
    const next2 = candles[i + 2];
    
    const currentBullish = current.close > current.open;
    const currentBearish = current.close < current.open;
    
    // Bullish Order Block: Last bearish candle before bullish move
    if (currentBearish) {
      const upMove = ((next2.close - current.low) / current.low) * 100;
      if (upMove >= minMovePercent && next1.close > current.high && next2.close > next1.close) {
        orderBlocks.push({
          type: 'BULLISH',
          high: current.high,
          low: current.low,
          midpoint: (current.high + current.low) / 2,
          strength: Math.min(100, 50 + upMove * 5),
          timeframe,
          timestamp: current.timestamp,
          isMitigated: false,
          isBreaker: false
        });
      }
    }
    
    // Bearish Order Block: Last bullish candle before bearish move
    if (currentBullish) {
      const downMove = ((current.high - next2.close) / current.high) * 100;
      if (downMove >= minMovePercent && next1.close < current.low && next2.close < next1.close) {
        orderBlocks.push({
          type: 'BEARISH',
          high: current.high,
          low: current.low,
          midpoint: (current.high + current.low) / 2,
          strength: Math.min(100, 50 + downMove * 5),
          timeframe,
          timestamp: current.timestamp,
          isMitigated: false,
          isBreaker: false
        });
      }
    }
  }
  
  // Check if order blocks are mitigated by recent price action
  const currentPrice = candles[candles.length - 1].close;
  orderBlocks.forEach(ob => {
    if (ob.type === 'BULLISH' && currentPrice <= ob.high && currentPrice >= ob.low) {
      ob.isMitigated = true;
    }
    if (ob.type === 'BEARISH' && currentPrice >= ob.low && currentPrice <= ob.high) {
      ob.isMitigated = true;
    }
  });
  
  return orderBlocks.slice(-5); // Keep most recent 5
}

/**
 * Detect Fair Value Gaps (Imbalances)
 * FVG = Gap between candle 1's low and candle 3's high (bullish)
 *       Gap between candle 1's high and candle 3's low (bearish)
 */
export function detectFairValueGaps(
  candles: CandleData[],
  timeframe: string,
  minGapPercent: number = 0.1
): FairValueGap[] {
  const fvgs: FairValueGap[] = [];
  
  if (candles.length < 4) return fvgs;
  
  for (let i = 1; i < candles.length - 2; i++) {
    const candle1 = candles[i - 1];
    const candle2 = candles[i];
    const candle3 = candles[i + 1];
    
    // Bullish FVG: Gap between candle1 high and candle3 low
    if (candle3.low > candle1.high) {
      const gapSize = candle3.low - candle1.high;
      const gapPercent = (gapSize / candle2.close) * 100;
      
      if (gapPercent >= minGapPercent) {
        fvgs.push({
          type: 'BULLISH',
          high: candle3.low,
          low: candle1.high,
          midpoint: (candle3.low + candle1.high) / 2,
          size: gapSize,
          percentSize: gapPercent,
          timeframe,
          timestamp: candle2.timestamp,
          isFilled: false,
          fillPercentage: 0
        });
      }
    }
    
    // Bearish FVG: Gap between candle1 low and candle3 high
    if (candle1.low > candle3.high) {
      const gapSize = candle1.low - candle3.high;
      const gapPercent = (gapSize / candle2.close) * 100;
      
      if (gapPercent >= minGapPercent) {
        fvgs.push({
          type: 'BEARISH',
          high: candle1.low,
          low: candle3.high,
          midpoint: (candle1.low + candle3.high) / 2,
          size: gapSize,
          percentSize: gapPercent,
          timeframe,
          timestamp: candle2.timestamp,
          isFilled: false,
          fillPercentage: 0
        });
      }
    }
  }
  
  // Check if FVGs are filled
  const currentPrice = candles[candles.length - 1].close;
  fvgs.forEach(fvg => {
    if (fvg.type === 'BULLISH') {
      if (currentPrice <= fvg.low) {
        fvg.isFilled = true;
        fvg.fillPercentage = 100;
      } else if (currentPrice < fvg.high) {
        fvg.fillPercentage = ((fvg.high - currentPrice) / fvg.size) * 100;
      }
    } else {
      if (currentPrice >= fvg.high) {
        fvg.isFilled = true;
        fvg.fillPercentage = 100;
      } else if (currentPrice > fvg.low) {
        fvg.fillPercentage = ((currentPrice - fvg.low) / fvg.size) * 100;
      }
    }
  });
  
  return fvgs.filter(f => !f.isFilled).slice(-5); // Keep unfilled, most recent 5
}

/**
 * Detect Liquidity Pools (BSL/SSL)
 * Areas where stop losses are likely clustered
 */
export function detectLiquidityPools(
  candles: CandleData[],
  timeframe: string
): LiquidityPool[] {
  const pools: LiquidityPool[] = [];
  
  if (candles.length < 10) return pools;
  
  // Find swing highs (BSL - Buy Side Liquidity above)
  const swingHighs: { level: number; count: number; timestamp: number }[] = [];
  const swingLows: { level: number; count: number; timestamp: number }[] = [];
  
  for (let i = 2; i < candles.length - 2; i++) {
    const c = candles[i];
    const prev1 = candles[i - 1];
    const prev2 = candles[i - 2];
    const next1 = candles[i + 1];
    const next2 = candles[i + 2];
    
    // Swing High
    if (c.high > prev1.high && c.high > prev2.high && 
        c.high > next1.high && c.high > next2.high) {
      // Check if similar level exists
      const existing = swingHighs.find(s => Math.abs(s.level - c.high) / c.high < 0.005);
      if (existing) {
        existing.count++;
        existing.timestamp = c.timestamp;
      } else {
        swingHighs.push({ level: c.high, count: 1, timestamp: c.timestamp });
      }
    }
    
    // Swing Low
    if (c.low < prev1.low && c.low < prev2.low && 
        c.low < next1.low && c.low < next2.low) {
      const existing = swingLows.find(s => Math.abs(s.level - c.low) / c.low < 0.005);
      if (existing) {
        existing.count++;
        existing.timestamp = c.timestamp;
      } else {
        swingLows.push({ level: c.low, count: 1, timestamp: c.timestamp });
      }
    }
  }
  
  // Create liquidity pools from swing points
  const currentPrice = candles[candles.length - 1].close;
  
  swingHighs.forEach(sh => {
    pools.push({
      type: 'BSL',
      level: sh.level,
      strength: Math.min(100, 40 + sh.count * 20),
      timeframe,
      isSwept: currentPrice > sh.level,
      timestamp: sh.timestamp
    });
  });
  
  swingLows.forEach(sl => {
    pools.push({
      type: 'SSL',
      level: sl.level,
      strength: Math.min(100, 40 + sl.count * 20),
      timeframe,
      isSwept: currentPrice < sl.level,
      timestamp: sl.timestamp
    });
  });
  
  return pools.filter(p => !p.isSwept).slice(-8);
}

/**
 * Detect Market Structure Shifts (BOS and CHoCH)
 */
export function detectStructureShifts(
  candles: CandleData[],
  timeframe: string
): { shifts: StructureShift[]; structure: MarketStructure } {
  const shifts: StructureShift[] = [];
  
  if (candles.length < 10) {
    return { 
      shifts, 
      structure: {
        trend: 'RANGING',
        strength: 50,
        higherHighs: false,
        higherLows: false,
        lowerHighs: false,
        lowerLows: false,
        lastBOS: null,
        lastCHoCH: null
      }
    };
  }
  
  // Find swing points
  const swingHighs: { price: number; index: number }[] = [];
  const swingLows: { price: number; index: number }[] = [];
  
  for (let i = 2; i < candles.length - 2; i++) {
    const c = candles[i];
    if (c.high > candles[i - 1].high && c.high > candles[i - 2].high &&
        c.high > candles[i + 1].high && c.high > candles[i + 2].high) {
      swingHighs.push({ price: c.high, index: i });
    }
    if (c.low < candles[i - 1].low && c.low < candles[i - 2].low &&
        c.low < candles[i + 1].low && c.low < candles[i + 2].low) {
      swingLows.push({ price: c.low, index: i });
    }
  }
  
  // Analyze structure
  let higherHighs = false;
  let higherLows = false;
  let lowerHighs = false;
  let lowerLows = false;
  let lastBOS: 'BULLISH' | 'BEARISH' | null = null;
  let lastCHoCH: 'BULLISH' | 'BEARISH' | null = null;
  
  // Check higher highs/lows
  if (swingHighs.length >= 2) {
    const recent = swingHighs.slice(-3);
    higherHighs = recent.every((h, i) => i === 0 || h.price > recent[i - 1].price);
    lowerHighs = recent.every((h, i) => i === 0 || h.price < recent[i - 1].price);
  }
  
  if (swingLows.length >= 2) {
    const recent = swingLows.slice(-3);
    higherLows = recent.every((l, i) => i === 0 || l.price > recent[i - 1].price);
    lowerLows = recent.every((l, i) => i === 0 || l.price < recent[i - 1].price);
  }
  
  // Detect BOS (Break of Structure) - Continuation
  const currentPrice = candles[candles.length - 1].close;
  const lastSwingHigh = swingHighs[swingHighs.length - 1];
  const lastSwingLow = swingLows[swingLows.length - 1];
  
  if (lastSwingHigh && currentPrice > lastSwingHigh.price) {
    if (higherHighs && higherLows) {
      lastBOS = 'BULLISH';
      shifts.push({
        type: 'BOS',
        direction: 'BULLISH',
        level: lastSwingHigh.price,
        timestamp: candles[lastSwingHigh.index].timestamp,
        timeframe,
        isConfirmed: true
      });
    }
  }
  
  if (lastSwingLow && currentPrice < lastSwingLow.price) {
    if (lowerHighs && lowerLows) {
      lastBOS = 'BEARISH';
      shifts.push({
        type: 'BOS',
        direction: 'BEARISH',
        level: lastSwingLow.price,
        timestamp: candles[lastSwingLow.index].timestamp,
        timeframe,
        isConfirmed: true
      });
    }
  }
  
  // Detect CHoCH (Change of Character) - Reversal
  if (higherHighs && lowerLows) {
    // Was uptrend, now broke a low
    lastCHoCH = 'BEARISH';
    shifts.push({
      type: 'CHoCH',
      direction: 'BEARISH',
      level: lastSwingLow?.price || currentPrice,
      timestamp: Date.now(),
      timeframe,
      isConfirmed: lowerLows
    });
  }
  
  if (lowerHighs && higherLows) {
    // Was downtrend, now made higher low
    lastCHoCH = 'BULLISH';
    shifts.push({
      type: 'CHoCH',
      direction: 'BULLISH',
      level: lastSwingLow?.price || currentPrice,
      timestamp: Date.now(),
      timeframe,
      isConfirmed: higherLows
    });
  }
  
  // Determine overall trend
  let trend: 'BULLISH' | 'BEARISH' | 'RANGING' = 'RANGING';
  let strength = 50;
  
  if (higherHighs && higherLows) {
    trend = 'BULLISH';
    strength = 70 + (swingHighs.length + swingLows.length);
  } else if (lowerHighs && lowerLows) {
    trend = 'BEARISH';
    strength = 70 + (swingHighs.length + swingLows.length);
  }
  
  return {
    shifts: shifts.slice(-3),
    structure: {
      trend,
      strength: Math.min(100, strength),
      higherHighs,
      higherLows,
      lowerHighs,
      lowerLows,
      lastBOS,
      lastCHoCH
    }
  };
}

/**
 * Calculate Premium/Discount Zone
 * Uses the current swing high/low as range
 */
export function calculatePremiumDiscount(
  currentPrice: number,
  rangeHigh: number,
  rangeLow: number,
  trend: 'BULLISH' | 'BEARISH' | 'RANGING'
): PremiumDiscountZone {
  const range = rangeHigh - rangeLow;
  const pricePosition = range > 0 ? ((currentPrice - rangeLow) / range) * 100 : 50;
  
  // Fibonacci levels
  const fib0 = rangeLow;
  const fib236 = rangeLow + range * 0.236;
  const fib382 = rangeLow + range * 0.382;
  const fib5 = rangeLow + range * 0.5;
  const fib618 = rangeLow + range * 0.618;
  const fib786 = rangeLow + range * 0.786;
  const fib1 = rangeHigh;
  
  let fibLevel: string;
  if (currentPrice <= fib236) fibLevel = '0-23.6%';
  else if (currentPrice <= fib382) fibLevel = '23.6-38.2%';
  else if (currentPrice <= fib5) fibLevel = '38.2-50%';
  else if (currentPrice <= fib618) fibLevel = '50-61.8%';
  else if (currentPrice <= fib786) fibLevel = '61.8-78.6%';
  else fibLevel = '78.6-100%';
  
  let zone: 'PREMIUM' | 'DISCOUNT' | 'EQUILIBRIUM';
  let optimalEntry: boolean;
  let bias: 'LONG' | 'SHORT' | 'NEUTRAL';
  
  if (pricePosition <= 30) {
    zone = 'DISCOUNT';
    optimalEntry = trend === 'BULLISH';
    bias = trend === 'BULLISH' ? 'LONG' : 'NEUTRAL';
  } else if (pricePosition >= 70) {
    zone = 'PREMIUM';
    optimalEntry = trend === 'BEARISH';
    bias = trend === 'BEARISH' ? 'SHORT' : 'NEUTRAL';
  } else {
    zone = 'EQUILIBRIUM';
    optimalEntry = false;
    bias = 'NEUTRAL';
  }
  
  return { zone, pricePosition, fibLevel, optimalEntry, bias };
}

/**
 * Calculate Optimal Trade Entry (OTE)
 * OTE zone is between 61.8% and 78.6% retracement
 */
export function calculateOTE(
  currentPrice: number,
  swingHigh: number,
  swingLow: number,
  trend: 'BULLISH' | 'BEARISH' | 'RANGING'
): OptimalTradeEntry {
  const range = swingHigh - swingLow;
  
  // For bullish trend, OTE is 61.8-78.6% pullback from recent low
  // For bearish trend, OTE is 61.8-78.6% retracement from recent high
  
  if (trend === 'BULLISH') {
    const ote618 = swingHigh - range * 0.618;
    const ote786 = swingHigh - range * 0.786;
    const oteZone = currentPrice >= ote786 && currentPrice <= ote618;
    
    return {
      isOTE: oteZone,
      zone: oteZone ? 'OTE_LONG' : 'NONE',
      entryLevel: (ote618 + ote786) / 2,
      stopLoss: swingLow - range * 0.1,
      target1: swingHigh,
      target2: swingHigh + range * 0.618,
      riskReward: oteZone ? ((swingHigh - currentPrice) / (currentPrice - (swingLow - range * 0.1))) : 0,
      confidence: oteZone ? 75 : 0
    };
  }
  
  if (trend === 'BEARISH') {
    const ote618 = swingLow + range * 0.618;
    const ote786 = swingLow + range * 0.786;
    const oteZone = currentPrice >= ote618 && currentPrice <= ote786;
    
    return {
      isOTE: oteZone,
      zone: oteZone ? 'OTE_SHORT' : 'NONE',
      entryLevel: (ote618 + ote786) / 2,
      stopLoss: swingHigh + range * 0.1,
      target1: swingLow,
      target2: swingLow - range * 0.618,
      riskReward: oteZone ? ((currentPrice - swingLow) / ((swingHigh + range * 0.1) - currentPrice)) : 0,
      confidence: oteZone ? 75 : 0
    };
  }
  
  return {
    isOTE: false,
    zone: 'NONE',
    entryLevel: currentPrice,
    stopLoss: 0,
    target1: 0,
    target2: 0,
    riskReward: 0,
    confidence: 0
  };
}

/**
 * Detect Displacement - Strong impulsive move with volume
 */
export function detectDisplacement(
  candles: CandleData[],
  minMovePercent: number = 1.5
): Displacement | null {
  if (candles.length < 3) return null;
  
  // Look at last 3 candles for displacement
  const recent = candles.slice(-3);
  const avgVolume = candles.slice(-20).reduce((a, c) => a + c.volume, 0) / 20;
  
  for (const candle of recent) {
    const move = ((candle.close - candle.open) / candle.open) * 100;
    const volumeMultiplier = avgVolume > 0 ? candle.volume / avgVolume : 1;
    
    if (Math.abs(move) >= minMovePercent && volumeMultiplier >= 1.5) {
      const direction: 'BULLISH' | 'BEARISH' = move > 0 ? 'BULLISH' : 'BEARISH';
      
      // Check for imbalance (FVG)
      const idx = candles.indexOf(candle);
      let hasImbalance = false;
      if (idx > 0 && idx < candles.length - 1) {
        const prev = candles[idx - 1];
        const next = candles[idx + 1];
        hasImbalance = direction === 'BULLISH' 
          ? next.low > prev.high 
          : prev.low > next.high;
      }
      
      return {
        direction,
        startPrice: candle.open,
        endPrice: candle.close,
        magnitude: Math.abs(move),
        volumeMultiplier,
        hasImbalance,
        timestamp: candle.timestamp
      };
    }
  }
  
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎯 MULTI-TIMEFRAME ICT ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Perform complete ICT/SMC analysis with multi-timeframe confluence
 */
export function performICTSMCAnalysis(
  candles: CandleData[],
  currentPrice: number,
  high24h: number,
  low24h: number,
  timeframe: string = '1h',
  multiTfData?: MultiTimeframeInput
): ICTSMCAnalysis {
  // Detect all ICT concepts
  const orderBlocks = detectOrderBlocks(candles, timeframe);
  const fairValueGaps = detectFairValueGaps(candles, timeframe);
  const liquidityPools = detectLiquidityPools(candles, timeframe);
  const { shifts, structure } = detectStructureShifts(candles, timeframe);
  
  // Calculate zones
  const premiumDiscount = calculatePremiumDiscount(currentPrice, high24h, low24h, structure.trend);
  const ote = calculateOTE(currentPrice, high24h, low24h, structure.trend);
  const displacement = detectDisplacement(candles);
  
  // Multi-timeframe confluence
  let htfBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
  let ltfBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
  let confluenceScore = 50;
  let aligned = false;
  let ltfConfirmation = false;
  
  if (multiTfData) {
    // HTF = 4h and 1d
    const htf4h = multiTfData['4h'];
    const htf1d = multiTfData['1d'];
    
    if (htf4h?.trend === htf1d?.trend) {
      htfBias = htf4h?.trend || 'NEUTRAL';
    } else if (htf1d?.trend && htf1d.trend !== 'NEUTRAL') {
      htfBias = htf1d.trend;
    } else if (htf4h?.trend) {
      htfBias = htf4h.trend;
    }
    
    // LTF = 15m and 1h
    const ltf15m = multiTfData['15m'];
    const ltf1h = multiTfData['1h'];
    
    if (ltf15m?.trend === ltf1h?.trend) {
      ltfBias = ltf15m?.trend || 'NEUTRAL';
    } else if (ltf1h?.trend) {
      ltfBias = ltf1h.trend;
    }
    
    // Check alignment
    aligned = htfBias === ltfBias && htfBias !== 'NEUTRAL';
    ltfConfirmation = ltfBias === htfBias;
    
    confluenceScore = multiTfData.confluence?.strength ?? 50;
  }
  
  // Generate trade setup if conditions align
  let tradeSetup: ICTTradeSetup | null = null;
  
  // Check for valid setups
  const nearestOB = orderBlocks.find(ob => 
    !ob.isMitigated && 
    ((ob.type === 'BULLISH' && currentPrice <= ob.high * 1.005) ||
     (ob.type === 'BEARISH' && currentPrice >= ob.low * 0.995))
  );
  
  const nearestFVG = fairValueGaps.find(fvg =>
    !fvg.isFilled &&
    ((fvg.type === 'BULLISH' && currentPrice <= fvg.high && currentPrice >= fvg.low) ||
     (fvg.type === 'BEARISH' && currentPrice >= fvg.low && currentPrice <= fvg.high))
  );
  
  // Order Block Entry Setup
  if (nearestOB && aligned && premiumDiscount.optimalEntry) {
    const isLong = nearestOB.type === 'BULLISH' && htfBias === 'BULLISH';
    const isShort = nearestOB.type === 'BEARISH' && htfBias === 'BEARISH';
    
    if (isLong || isShort) {
      const direction: 'LONG' | 'SHORT' = isLong ? 'LONG' : 'SHORT';
      const entry = nearestOB.midpoint;
      const stopLoss = isLong ? nearestOB.low * 0.995 : nearestOB.high * 1.005;
      const riskAmount = Math.abs(entry - stopLoss);
      
      tradeSetup = {
        type: 'OB_ENTRY',
        direction,
        entry,
        stopLoss,
        target1: isLong ? entry + riskAmount * 2 : entry - riskAmount * 2,
        target2: isLong ? entry + riskAmount * 3 : entry - riskAmount * 3,
        target3: isLong ? entry + riskAmount * 5 : entry - riskAmount * 5,
        riskReward: 2,
        reasoning: [
          `${nearestOB.type} Order Block at ${nearestOB.midpoint.toFixed(2)}`,
          `Price in ${premiumDiscount.zone} zone`,
          `HTF bias: ${htfBias}`,
          `Structure: ${structure.trend}`
        ],
        confluence: [
          aligned ? '✓ Multi-TF aligned' : '✗ TF not aligned',
          ote.isOTE ? '✓ In OTE zone' : '✗ Not in OTE',
          displacement ? '✓ Recent displacement' : '✗ No displacement',
          ltfConfirmation ? '✓ LTF confirms' : '✗ LTF not confirmed'
        ],
        confidence: Math.min(90, 50 + (aligned ? 15 : 0) + (ote.isOTE ? 10 : 0) + 
                           (displacement ? 10 : 0) + (ltfConfirmation ? 10 : 0))
      };
    }
  }
  
  // FVG Entry Setup
  if (!tradeSetup && nearestFVG && ltfConfirmation) {
    const isLong = nearestFVG.type === 'BULLISH' && htfBias === 'BULLISH';
    const isShort = nearestFVG.type === 'BEARISH' && htfBias === 'BEARISH';
    
    if (isLong || isShort) {
      const direction: 'LONG' | 'SHORT' = isLong ? 'LONG' : 'SHORT';
      const entry = nearestFVG.midpoint;
      const stopLoss = isLong ? nearestFVG.low * 0.99 : nearestFVG.high * 1.01;
      const riskAmount = Math.abs(entry - stopLoss);
      
      tradeSetup = {
        type: 'FVG_ENTRY',
        direction,
        entry,
        stopLoss,
        target1: isLong ? entry + riskAmount * 1.5 : entry - riskAmount * 1.5,
        target2: isLong ? entry + riskAmount * 2.5 : entry - riskAmount * 2.5,
        target3: isLong ? entry + riskAmount * 4 : entry - riskAmount * 4,
        riskReward: 1.5,
        reasoning: [
          `${nearestFVG.type} Fair Value Gap at CE ${nearestFVG.midpoint.toFixed(2)}`,
          `Gap size: ${nearestFVG.percentSize.toFixed(2)}%`,
          `HTF bias: ${htfBias}`
        ],
        confluence: [
          aligned ? '✓ Multi-TF aligned' : '✗ TF not aligned',
          ltfConfirmation ? '✓ LTF confirms' : '✗ LTF not confirmed'
        ],
        confidence: Math.min(80, 45 + (aligned ? 15 : 0) + (ltfConfirmation ? 15 : 0))
      };
    }
  }
  
  // LIQUIDITY_SWEEP Setup - When liquidity has been taken and price reverses
  // Look for recently swept liquidity pools that indicate a potential reversal
  if (!tradeSetup && liquidityPools.length > 0) {
    const recentlySweptPool = liquidityPools.find(pool => {
      // Check if the pool was recently swept (price moved through it)
      if (pool.type === 'SSL' && htfBias === 'BULLISH') {
        // SSL swept + bullish bias = potential long after liquidity grab
        return pool.isSwept && currentPrice > pool.level;
      }
      if (pool.type === 'BSL' && htfBias === 'BEARISH') {
        // BSL swept + bearish bias = potential short after liquidity grab
        return pool.isSwept && currentPrice < pool.level;
      }
      return false;
    });
    
    // Also check for trap scenarios - price swept liquidity but reversed
    const trapScenario = displacement && (
      (displacement.direction === 'BULLISH' && structure.lastBOS === 'BULLISH') ||
      (displacement.direction === 'BEARISH' && structure.lastBOS === 'BEARISH')
    );
    
    if (recentlySweptPool || trapScenario) {
      const isLong = htfBias === 'BULLISH';
      const direction: 'LONG' | 'SHORT' = isLong ? 'LONG' : 'SHORT';
      const sweptLevel = recentlySweptPool?.level || (displacement?.startPrice ?? currentPrice);
      const entry = currentPrice;
      const stopLoss = isLong 
        ? Math.min(sweptLevel * 0.995, currentPrice * 0.98) 
        : Math.max(sweptLevel * 1.005, currentPrice * 1.02);
      const riskAmount = Math.abs(entry - stopLoss);
      
      tradeSetup = {
        type: 'LIQUIDITY_SWEEP',
        direction,
        entry,
        stopLoss,
        target1: isLong ? entry + riskAmount * 2 : entry - riskAmount * 2,
        target2: isLong ? entry + riskAmount * 3.5 : entry - riskAmount * 3.5,
        target3: isLong ? entry + riskAmount * 5 : entry - riskAmount * 5,
        riskReward: 2,
        reasoning: [
          recentlySweptPool 
            ? `${recentlySweptPool.type} liquidity swept at ${sweptLevel.toFixed(2)}` 
            : 'Liquidity trap detected',
          trapScenario ? `${displacement?.direction} displacement confirms reversal` : '',
          `HTF bias: ${htfBias}`,
          isLong ? 'Bears trapped below SSL' : 'Bulls trapped above BSL'
        ].filter(Boolean),
        confluence: [
          aligned ? '✓ Multi-TF aligned' : '✗ TF not aligned',
          displacement ? '✓ Displacement confirms' : '✗ No displacement',
          structure.lastBOS ? `✓ BOS ${structure.lastBOS}` : '✗ No BOS',
          ltfConfirmation ? '✓ LTF confirms' : '✗ LTF not confirmed'
        ],
        confidence: Math.min(85, 50 + (aligned ? 10 : 0) + (displacement ? 15 : 0) + 
                           (trapScenario ? 10 : 0) + (ltfConfirmation ? 10 : 0))
      };
    }
  }
  
  // BOS_CONTINUATION Setup - Trade continuation after confirmed Break of Structure
  // When structure breaks in direction of HTF trend, look for pullback entry
  if (!tradeSetup && structure.lastBOS && aligned) {
    const bosAlignedWithHTF = (structure.lastBOS === 'BULLISH' && htfBias === 'BULLISH') ||
                               (structure.lastBOS === 'BEARISH' && htfBias === 'BEARISH');
    
    // Check if price is in a good position for continuation entry
    const inDiscountForLong = premiumDiscount.zone === 'DISCOUNT' && structure.lastBOS === 'BULLISH';
    const inPremiumForShort = premiumDiscount.zone === 'PREMIUM' && structure.lastBOS === 'BEARISH';
    
    if (bosAlignedWithHTF && (inDiscountForLong || inPremiumForShort)) {
      const isLong = structure.lastBOS === 'BULLISH';
      const direction: 'LONG' | 'SHORT' = isLong ? 'LONG' : 'SHORT';
      const entry = currentPrice;
      
      // Find the swing point to use as stop loss
      const recentSwingLow = candles.slice(-10).reduce((min, c) => Math.min(min, c.low), Infinity);
      const recentSwingHigh = candles.slice(-10).reduce((max, c) => Math.max(max, c.high), -Infinity);
      
      const stopLoss = isLong 
        ? recentSwingLow * 0.995
        : recentSwingHigh * 1.005;
      const riskAmount = Math.abs(entry - stopLoss);
      
      tradeSetup = {
        type: 'BOS_CONTINUATION',
        direction,
        entry,
        stopLoss,
        target1: isLong ? entry + riskAmount * 1.5 : entry - riskAmount * 1.5,
        target2: isLong ? entry + riskAmount * 2.5 : entry - riskAmount * 2.5,
        target3: isLong ? entry + riskAmount * 4 : entry - riskAmount * 4,
        riskReward: 1.5,
        reasoning: [
          `BOS ${structure.lastBOS} confirmed - trend continuation`,
          `Price in ${premiumDiscount.zone} zone (${premiumDiscount.fibLevel})`,
          `HTF bias: ${htfBias}`,
          structure.lastCHoCH ? `CHoCH ${structure.lastCHoCH} supports direction` : ''
        ].filter(Boolean),
        confluence: [
          '✓ BOS confirmed',
          aligned ? '✓ Multi-TF aligned' : '✗ TF not aligned',
          premiumDiscount.optimalEntry ? '✓ Optimal entry zone' : '✗ Not optimal zone',
          ltfConfirmation ? '✓ LTF confirms' : '✗ LTF not confirmed',
          ote.isOTE ? '✓ In OTE zone' : '✗ Not in OTE'
        ],
        confidence: Math.min(85, 55 + (aligned ? 10 : 0) + (ote.isOTE ? 10 : 0) + 
                           (ltfConfirmation ? 10 : 0))
      };
    }
  }
  
  // Generate pattern signature for learning
  const patternSignature = generatePatternSignature(
    structure, orderBlocks, fairValueGaps, premiumDiscount, htfBias
  );
  
  // Calculate overall confidence
  const confidence = calculateOverallConfidence(
    aligned, ote.isOTE, !!displacement, ltfConfirmation, 
    orderBlocks.length, fairValueGaps.length
  );
  
  return {
    orderBlocks,
    fairValueGaps,
    liquidityPools,
    structureShifts: shifts,
    premiumDiscount,
    optimalEntry: ote,
    displacement,
    marketStructure: structure,
    dailyBias: htfBias,
    htfTrend: htfBias,
    ltfTrend: ltfBias,
    timeframeConfluence: {
      aligned,
      score: confluenceScore,
      htfBias,
      ltfConfirmation,
      recommendation: generateRecommendation(aligned, htfBias, premiumDiscount, tradeSetup)
    },
    tradeSetup,
    patternSignature,
    confidence
  };
}

/**
 * Generate pattern signature for learning
 */
function generatePatternSignature(
  structure: MarketStructure,
  orderBlocks: OrderBlock[],
  fvgs: FairValueGap[],
  pd: PremiumDiscountZone,
  htfBias: string
): string {
  const parts: string[] = [];
  
  parts.push(`S:${structure.trend}`);
  parts.push(`OB:${orderBlocks.length}`);
  parts.push(`FVG:${fvgs.length}`);
  parts.push(`PD:${pd.zone}`);
  parts.push(`HTF:${htfBias}`);
  
  if (structure.lastBOS) parts.push(`BOS:${structure.lastBOS}`);
  if (structure.lastCHoCH) parts.push(`CHoCH:${structure.lastCHoCH}`);
  
  return parts.join('|');
}

/**
 * Calculate overall confidence
 */
function calculateOverallConfidence(
  aligned: boolean,
  isOTE: boolean,
  hasDisplacement: boolean,
  ltfConfirms: boolean,
  obCount: number,
  fvgCount: number
): number {
  let confidence = 40;
  
  if (aligned) confidence += 20;
  if (isOTE) confidence += 15;
  if (hasDisplacement) confidence += 10;
  if (ltfConfirms) confidence += 10;
  if (obCount > 0) confidence += 5;
  if (fvgCount > 0) confidence += 5;
  
  return Math.min(95, confidence);
}

/**
 * Generate trading recommendation
 */
function generateRecommendation(
  aligned: boolean,
  htfBias: string,
  pd: PremiumDiscountZone,
  setup: ICTTradeSetup | null
): string {
  if (setup && aligned) {
    return `${setup.direction} entry at ${setup.type.replace('_', ' ')} with ${setup.riskReward.toFixed(1)}R target`;
  }
  
  if (!aligned) {
    return 'Wait for multi-timeframe alignment before entry';
  }
  
  if (!pd.optimalEntry) {
    return `Price in ${pd.zone} - wait for pullback to ${htfBias === 'BULLISH' ? 'discount' : 'premium'}`;
  }
  
  return `${htfBias} bias - look for ${htfBias === 'BULLISH' ? 'longs' : 'shorts'} in ${pd.zone}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📚 ICT LEARNER — Self-Learning from ICT Patterns
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * ICT Pattern Record for Learning
 */
export interface ICTPatternRecord {
  signature: string;
  setup: ICTTradeSetup;
  outcome: 'WIN' | 'LOSS' | 'PENDING';
  actualRR: number;
  timestamp: number;
}

/**
 * ICT Learner - Tracks patterns and their outcomes
 */
export class ICTLearner {
  private patterns: Map<string, ICTPatternRecord[]> = new Map();
  private winRates: Map<string, { wins: number; losses: number }> = new Map();
  
  /**
   * Record a new pattern
   */
  recordPattern(analysis: ICTSMCAnalysis): void {
    if (!analysis.tradeSetup) return;
    
    const record: ICTPatternRecord = {
      signature: analysis.patternSignature,
      setup: analysis.tradeSetup,
      outcome: 'PENDING',
      actualRR: 0,
      timestamp: Date.now()
    };
    
    const existing = this.patterns.get(analysis.patternSignature) || [];
    existing.push(record);
    this.patterns.set(analysis.patternSignature, existing);
  }
  
  /**
   * Update pattern outcome
   */
  updateOutcome(signature: string, timestamp: number, outcome: 'WIN' | 'LOSS', actualRR: number): void {
    const records = this.patterns.get(signature);
    if (!records) return;
    
    const record = records.find(r => r.timestamp === timestamp);
    if (record) {
      record.outcome = outcome;
      record.actualRR = actualRR;
      
      // Update win rate
      const stats = this.winRates.get(signature) || { wins: 0, losses: 0 };
      if (outcome === 'WIN') stats.wins++;
      else stats.losses++;
      this.winRates.set(signature, stats);
    }
  }
  
  /**
   * Get pattern win rate
   */
  getWinRate(signature: string): number {
    const stats = this.winRates.get(signature);
    if (!stats || (stats.wins + stats.losses) === 0) return 0.5; // Default 50%
    return stats.wins / (stats.wins + stats.losses);
  }
  
  /**
   * Get adjusted confidence based on historical patterns
   */
  getAdjustedConfidence(signature: string, baseConfidence: number): number {
    const winRate = this.getWinRate(signature);
    const stats = this.winRates.get(signature);
    const sampleSize = stats ? stats.wins + stats.losses : 0;
    
    // More weight to historical data as sample size grows
    const historicalWeight = Math.min(0.4, sampleSize * 0.05);
    const baseWeight = 1 - historicalWeight;
    
    return baseConfidence * baseWeight + (winRate * 100) * historicalWeight;
  }
  
  /**
   * Get best performing patterns
   */
  getBestPatterns(limit: number = 5): Array<{ signature: string; winRate: number; count: number }> {
    const results: Array<{ signature: string; winRate: number; count: number }> = [];
    
    this.winRates.forEach((stats, signature) => {
      const total = stats.wins + stats.losses;
      if (total >= 3) { // Minimum 3 trades
        results.push({
          signature,
          winRate: stats.wins / total,
          count: total
        });
      }
    });
    
    return results.sort((a, b) => b.winRate - a.winRate).slice(0, limit);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📤 EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export default performICTSMCAnalysis;
