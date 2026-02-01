// ═══════════════════════════════════════════════════════════════════════════════
// 📊 CHART API MODULE v1.0 — Direct Chart Data Access for AI Brain
// ═══════════════════════════════════════════════════════════════════════════════
// Provides real-time OHLCV data fetching with technical indicator calculations
// Supports multiple exchanges: Binance, Bybit, OKX, CryptoCompare
// ═══════════════════════════════════════════════════════════════════════════════

import { supabase } from '@/integrations/supabase/client';
import { ChartTrendInput, TimeframeAnalysisInput, MultiTimeframeInput } from './types';

// ═══════════════════════════════════════════════════════════════════════════════
// 📈 TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ChartAPIResponse {
  symbol: string;
  interval: string;
  source: string;
  count: number;
  candles: CandleData[];
  timestamp: number;
}

export type ChartInterval = '1m' | '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '6h' | '12h' | '1d' | '1w';

export interface TechnicalIndicators {
  ema9: number;
  ema21: number;
  ema50: number;
  sma20: number;
  sma50: number;
  sma200: number;
  rsi: number;
  macd: { macd: number; signal: number; histogram: number };
  bollingerBands: { upper: number; middle: number; lower: number };
  atr: number;
  volumeAvg: number;
  volumeRatio: number;
}

export interface ChartAnalysisResult {
  candles: CandleData[];
  indicators: TechnicalIndicators;
  trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  trendStrength: number;
  support: number;
  resistance: number;
  volumeTrend: 'INCREASING' | 'DECREASING' | 'STABLE';
  priceVelocity: number;
  higherHighs: boolean;
  higherLows: boolean;
  lowerHighs: boolean;
  lowerLows: boolean;
  source: string;
  isLive: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔧 TECHNICAL INDICATOR CALCULATIONS
// ═══════════════════════════════════════════════════════════════════════════════

function calculateEMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] || 0;
  
  const multiplier = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
  
  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }
  
  return ema;
}

function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] || 0;
  const slice = prices.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / slice.length;
}

function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50;
  
  let gains = 0;
  let losses = 0;
  
  for (let i = prices.length - period; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }
  
  const avgGain = gains / period;
  const avgLoss = losses / period;
  
  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

function calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number } {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macdLine = ema12 - ema26;
  
  // Simplified signal line calculation
  const recentMacd: number[] = [];
  for (let i = Math.max(0, prices.length - 9); i < prices.length; i++) {
    const tempEma12 = calculateEMA(prices.slice(0, i + 1), 12);
    const tempEma26 = calculateEMA(prices.slice(0, i + 1), 26);
    recentMacd.push(tempEma12 - tempEma26);
  }
  
  const signalLine = recentMacd.length >= 9 ? calculateEMA(recentMacd, 9) : macdLine;
  
  return {
    macd: macdLine,
    signal: signalLine,
    histogram: macdLine - signalLine
  };
}

function calculateBollingerBands(prices: number[], period: number = 20, stdDev: number = 2): { upper: number; middle: number; lower: number } {
  const sma = calculateSMA(prices, period);
  
  if (prices.length < period) {
    return { upper: sma * 1.02, middle: sma, lower: sma * 0.98 };
  }
  
  const slice = prices.slice(-period);
  const squaredDiffs = slice.map(p => Math.pow(p - sma, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
  const std = Math.sqrt(variance);
  
  return {
    upper: sma + std * stdDev,
    middle: sma,
    lower: sma - std * stdDev
  };
}

function calculateATR(candles: CandleData[], period: number = 14): number {
  if (candles.length < period + 1) return 0;
  
  const trueRanges: number[] = [];
  
  for (let i = 1; i < candles.length; i++) {
    const high = candles[i].high;
    const low = candles[i].low;
    const prevClose = candles[i - 1].close;
    
    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );
    trueRanges.push(tr);
  }
  
  return calculateEMA(trueRanges.slice(-period), period);
}

function detectSwingPoints(candles: CandleData[]): { higherHighs: boolean; higherLows: boolean; lowerHighs: boolean; lowerLows: boolean } {
  if (candles.length < 5) {
    return { higherHighs: false, higherLows: false, lowerHighs: false, lowerLows: false };
  }
  
  const highs = candles.map(c => c.high);
  const lows = candles.map(c => c.low);
  
  // Find significant swing points (local min/max)
  const swingHighs: number[] = [];
  const swingLows: number[] = [];
  
  for (let i = 2; i < candles.length - 2; i++) {
    if (highs[i] > highs[i - 1] && highs[i] > highs[i - 2] && highs[i] > highs[i + 1] && highs[i] > highs[i + 2]) {
      swingHighs.push(highs[i]);
    }
    if (lows[i] < lows[i - 1] && lows[i] < lows[i - 2] && lows[i] < lows[i + 1] && lows[i] < lows[i + 2]) {
      swingLows.push(lows[i]);
    }
  }
  
  // Check last 3 swing points for trend
  const recentHighs = swingHighs.slice(-3);
  const recentLows = swingLows.slice(-3);
  
  const higherHighs = recentHighs.length >= 2 && recentHighs[recentHighs.length - 1] > recentHighs[recentHighs.length - 2];
  const higherLows = recentLows.length >= 2 && recentLows[recentLows.length - 1] > recentLows[recentLows.length - 2];
  const lowerHighs = recentHighs.length >= 2 && recentHighs[recentHighs.length - 1] < recentHighs[recentHighs.length - 2];
  const lowerLows = recentLows.length >= 2 && recentLows[recentLows.length - 1] < recentLows[recentLows.length - 2];
  
  return { higherHighs, higherLows, lowerHighs, lowerLows };
}

function calculateSupport(candles: CandleData[]): number {
  if (candles.length < 5) return candles[candles.length - 1]?.low || 0;
  
  const lows = candles.map(c => c.low);
  const recentLows = lows.slice(-Math.min(24, lows.length));
  
  // Find the most significant low (highest frequency zone)
  recentLows.sort((a, b) => a - b);
  return recentLows[Math.floor(recentLows.length * 0.1)] || recentLows[0];
}

function calculateResistance(candles: CandleData[]): number {
  if (candles.length < 5) return candles[candles.length - 1]?.high || 0;
  
  const highs = candles.map(c => c.high);
  const recentHighs = highs.slice(-Math.min(24, highs.length));
  
  recentHighs.sort((a, b) => b - a);
  return recentHighs[Math.floor(recentHighs.length * 0.1)] || recentHighs[0];
}

function analyzeVolumeTrend(candles: CandleData[]): 'INCREASING' | 'DECREASING' | 'STABLE' {
  if (candles.length < 6) return 'STABLE';
  
  const volumes = candles.map(c => c.volume);
  const recentAvg = volumes.slice(-6).reduce((a, b) => a + b, 0) / 6;
  const olderAvg = volumes.slice(-12, -6).reduce((a, b) => a + b, 0) / Math.min(6, volumes.length - 6);
  
  if (olderAvg === 0) return 'STABLE';
  
  const change = (recentAvg - olderAvg) / olderAvg;
  
  if (change > 0.2) return 'INCREASING';
  if (change < -0.2) return 'DECREASING';
  return 'STABLE';
}

function calculatePriceVelocity(candles: CandleData[]): number {
  if (candles.length < 3) return 0;
  
  const closes = candles.map(c => c.close);
  const first = closes[0];
  const last = closes[closes.length - 1];
  
  if (first === 0) return 0;
  
  // Velocity = % change per candle
  return ((last - first) / first) * 100 / candles.length;
}

function analyzeTrend(closes: number[], ema9: number, ema21: number, rsi: number): { trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL'; strength: number } {
  const currentPrice = closes[closes.length - 1];
  const priceAboveEma9 = currentPrice > ema9;
  const priceAboveEma21 = currentPrice > ema21;
  const ema9AboveEma21 = ema9 > ema21;
  
  let bullishSignals = 0;
  let bearishSignals = 0;
  
  // EMA alignment
  if (priceAboveEma9 && priceAboveEma21 && ema9AboveEma21) {
    bullishSignals += 3;
  } else if (!priceAboveEma9 && !priceAboveEma21 && !ema9AboveEma21) {
    bearishSignals += 3;
  } else if (priceAboveEma9) {
    bullishSignals += 1;
  } else {
    bearishSignals += 1;
  }
  
  // RSI
  if (rsi > 60) bullishSignals += 2;
  else if (rsi < 40) bearishSignals += 2;
  else if (rsi > 50) bullishSignals += 1;
  else if (rsi < 50) bearishSignals += 1;
  
  // Price momentum (last 5 candles)
  if (closes.length >= 5) {
    const recent = closes.slice(-5);
    const change = (recent[4] - recent[0]) / recent[0] * 100;
    if (change > 1) bullishSignals += 2;
    else if (change < -1) bearishSignals += 2;
  }
  
  const totalSignals = bullishSignals + bearishSignals;
  const strength = Math.round((Math.max(bullishSignals, bearishSignals) / Math.max(totalSignals, 1)) * 100);
  
  if (bullishSignals > bearishSignals + 1) {
    return { trend: 'BULLISH', strength: Math.min(95, strength) };
  } else if (bearishSignals > bullishSignals + 1) {
    return { trend: 'BEARISH', strength: Math.min(95, strength) };
  }
  
  return { trend: 'NEUTRAL', strength: 50 };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📡 DATA FETCHING FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Fetch candle data from the crypto-candles edge function
 * Primary source: Binance → Bybit → OKX fallback chain
 */
export async function fetchCandles(
  symbol: string,
  interval: ChartInterval = '1h',
  limit: number = 100
): Promise<ChartAPIResponse | null> {
  try {
    const { data, error } = await supabase.functions.invoke('crypto-candles', {
      body: { symbol: symbol.toUpperCase(), interval, limit }
    });
    
    if (error) {
      console.error(`[ChartAPI] Edge function error for ${symbol}:`, error);
      return null;
    }
    
    if (data?.candles && Array.isArray(data.candles) && data.candles.length > 0) {
      console.log(`[ChartAPI] ${symbol} ${interval} loaded from ${data.source}: ${data.candles.length} candles`);
      return data as ChartAPIResponse;
    }
    
    return null;
  } catch (e) {
    console.error(`[ChartAPI] Failed to fetch ${symbol}:`, e);
    return null;
  }
}

/**
 * Fallback: Fetch from CryptoCompare directly (client-side CORS allowed)
 */
export async function fetchFromCryptoCompare(
  symbol: string,
  interval: ChartInterval = '1h',
  limit: number = 100
): Promise<CandleData[] | null> {
  try {
    const endpoint = interval === '1d' ? 'histoday' : 
                     ['1h', '2h', '4h', '6h', '12h'].includes(interval) ? 'histohour' : 'histominute';
    
    const aggregate = interval === '15m' ? 15 : 
                      interval === '30m' ? 30 :
                      interval === '5m' ? 5 :
                      interval === '2h' ? 2 :
                      interval === '4h' ? 4 :
                      interval === '6h' ? 6 :
                      interval === '12h' ? 12 : 1;
    
    const url = `https://min-api.cryptocompare.com/data/v2/${endpoint}?fsym=${symbol.toUpperCase()}&tsym=USD&limit=${limit}&aggregate=${aggregate}`;
    
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const result = await response.json();
    if (result.Response !== 'Success' || !result.Data?.Data) return null;
    
    return result.Data.Data.map((point: { time: number; open: number; high: number; low: number; close: number; volumeto: number }) => ({
      timestamp: point.time * 1000,
      open: point.open,
      high: point.high,
      low: point.low,
      close: point.close,
      volume: point.volumeto
    }));
  } catch (e) {
    console.error(`[ChartAPI] CryptoCompare fallback failed for ${symbol}:`, e);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 MAIN CHART ANALYSIS FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Fetch and analyze chart data for a given symbol and interval
 * Returns complete technical analysis with all indicators
 */
export async function analyzeChart(
  symbol: string,
  interval: ChartInterval = '1h',
  limit: number = 100
): Promise<ChartAnalysisResult | null> {
  // Try primary source (edge function)
  const response = await fetchCandles(symbol, interval, limit);
  let source = response?.source || 'unknown';
  let candles = response?.candles;
  
  // Fallback to CryptoCompare
  if (!candles || candles.length < 10) {
    candles = await fetchFromCryptoCompare(symbol, interval, limit);
    if (candles) source = 'cryptocompare';
  }
  
  if (!candles || candles.length < 10) {
    console.log(`[ChartAPI] No data available for ${symbol} ${interval}`);
    return null;
  }
  
  const closes = candles.map(c => c.close);
  const volumes = candles.map(c => c.volume);
  
  // Calculate all indicators
  const ema9 = calculateEMA(closes, 9);
  const ema21 = calculateEMA(closes, 21);
  const ema50 = calculateEMA(closes, 50);
  const sma20 = calculateSMA(closes, 20);
  const sma50 = calculateSMA(closes, 50);
  const sma200 = calculateSMA(closes, Math.min(200, closes.length));
  const rsi = calculateRSI(closes, 14);
  const macd = calculateMACD(closes);
  const bollingerBands = calculateBollingerBands(closes, 20, 2);
  const atr = calculateATR(candles, 14);
  const volumeAvg = volumes.slice(-20).reduce((a, b) => a + b, 0) / Math.min(20, volumes.length);
  const volumeRatio = volumeAvg > 0 ? volumes[volumes.length - 1] / volumeAvg : 1;
  
  // Analyze trend
  const { trend, strength } = analyzeTrend(closes, ema9, ema21, rsi);
  
  // Detect market structure
  const swings = detectSwingPoints(candles);
  
  return {
    candles,
    indicators: {
      ema9, ema21, ema50,
      sma20, sma50, sma200,
      rsi, macd, bollingerBands,
      atr, volumeAvg, volumeRatio
    },
    trend,
    trendStrength: strength,
    support: calculateSupport(candles),
    resistance: calculateResistance(candles),
    volumeTrend: analyzeVolumeTrend(candles),
    priceVelocity: calculatePriceVelocity(candles),
    ...swings,
    source,
    isLive: true
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔄 MULTI-TIMEFRAME ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Perform multi-timeframe analysis for confluence detection
 * Fetches 15m, 1h, 4h, and 1d data in parallel
 */
export async function fetchMultiTimeframeAnalysis(symbol: string): Promise<MultiTimeframeInput> {
  const timeframes: Array<{ tf: '15m' | '1h' | '4h' | '1d'; interval: ChartInterval; limit: number }> = [
    { tf: '15m', interval: '15m', limit: 48 },
    { tf: '1h', interval: '1h', limit: 48 },
    { tf: '4h', interval: '4h', limit: 30 },
    { tf: '1d', interval: '1d', limit: 30 }
  ];
  
  // Fetch all timeframes in parallel
  const results = await Promise.all(
    timeframes.map(async ({ tf, interval, limit }) => {
      const analysis = await analyzeChart(symbol, interval, limit);
      if (!analysis) return { tf, data: null };
      
      const tfData: TimeframeAnalysisInput = {
        timeframe: tf,
        trend: analysis.trend,
        trendStrength: analysis.trendStrength,
        ema9: analysis.indicators.ema9,
        ema21: analysis.indicators.ema21,
        rsi: analysis.indicators.rsi,
        support: analysis.support,
        resistance: analysis.resistance,
        volumeTrend: analysis.volumeTrend,
        higherHighs: analysis.higherHighs,
        higherLows: analysis.higherLows,
        lowerHighs: analysis.lowerHighs,
        lowerLows: analysis.lowerLows,
        isLive: analysis.isLive
      };
      
      return { tf, data: tfData };
    })
  );
  
  // Build result object
  const tfMap: Record<string, TimeframeAnalysisInput | null> = {};
  results.forEach(r => { tfMap[r.tf] = r.data; });
  
  // Calculate confluence
  const validTfs = results.filter(r => r.data !== null).map(r => r.data!);
  const bullishCount = validTfs.filter(tf => tf.trend === 'BULLISH').length;
  const bearishCount = validTfs.filter(tf => tf.trend === 'BEARISH').length;
  const neutralCount = validTfs.filter(tf => tf.trend === 'NEUTRAL').length;
  
  let overallBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
  if (bullishCount >= 3) overallBias = 'BULLISH';
  else if (bearishCount >= 3) overallBias = 'BEARISH';
  
  const alignedCount = Math.max(bullishCount, bearishCount);
  const conflictingCount = overallBias === 'BULLISH' ? bearishCount : 
                           overallBias === 'BEARISH' ? bullishCount : 
                           Math.min(bullishCount, bearishCount);
  const strength = validTfs.length > 0 ? (alignedCount / validTfs.length) * 100 : 0;
  
  let recommendation = 'Wait for clearer alignment';
  if (alignedCount >= 4) {
    recommendation = overallBias === 'BULLISH' ? 'Strong LONG opportunity' : 'Strong SHORT opportunity';
  } else if (alignedCount >= 3) {
    recommendation = overallBias === 'BULLISH' ? 'Consider LONG entries' : 'Consider SHORT entries';
  }
  
  return {
    '15m': tfMap['15m'] || null,
    '1h': tfMap['1h'] || null,
    '4h': tfMap['4h'] || null,
    '1d': tfMap['1d'] || null,
    confluence: {
      overallBias,
      alignedTimeframes: alignedCount,
      conflictingTimeframes: conflictingCount,
      strength,
      recommendation
    }
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📊 CONVERT TO CHART TREND INPUT (for AI Brain compatibility)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Convert ChartAnalysisResult to ChartTrendInput format for AI Brain
 */
export function toChartTrendInput(analysis: ChartAnalysisResult): ChartTrendInput {
  return {
    candles: analysis.candles.map(c => ({
      timestamp: c.timestamp,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
      volume: c.volume
    })),
    trend24h: analysis.trend,
    trendStrength: analysis.trendStrength,
    higherHighs: analysis.higherHighs,
    higherLows: analysis.higherLows,
    lowerHighs: analysis.lowerHighs,
    lowerLows: analysis.lowerLows,
    ema9: analysis.indicators.ema9,
    ema21: analysis.indicators.ema21,
    rsi: analysis.indicators.rsi,
    volumeTrend: analysis.volumeTrend,
    priceVelocity: analysis.priceVelocity,
    isLive: analysis.isLive,
    source: analysis.source
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎯 QUICK ACCESS FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get current RSI for a symbol
 */
export async function getRSI(symbol: string, interval: ChartInterval = '1h'): Promise<number | null> {
  const analysis = await analyzeChart(symbol, interval, 50);
  return analysis?.indicators.rsi ?? null;
}

/**
 * Get current EMA values
 */
export async function getEMAs(symbol: string, interval: ChartInterval = '1h'): Promise<{ ema9: number; ema21: number; ema50: number } | null> {
  const analysis = await analyzeChart(symbol, interval, 60);
  if (!analysis) return null;
  return {
    ema9: analysis.indicators.ema9,
    ema21: analysis.indicators.ema21,
    ema50: analysis.indicators.ema50
  };
}

/**
 * Get current MACD values
 */
export async function getMACD(symbol: string, interval: ChartInterval = '1h'): Promise<{ macd: number; signal: number; histogram: number } | null> {
  const analysis = await analyzeChart(symbol, interval, 50);
  return analysis?.indicators.macd ?? null;
}

/**
 * Get support and resistance levels
 */
export async function getSupportResistance(symbol: string, interval: ChartInterval = '1h'): Promise<{ support: number; resistance: number } | null> {
  const analysis = await analyzeChart(symbol, interval, 100);
  if (!analysis) return null;
  return {
    support: analysis.support,
    resistance: analysis.resistance
  };
}

/**
 * Get trend direction and strength
 */
export async function getTrend(symbol: string, interval: ChartInterval = '1h'): Promise<{ trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL'; strength: number } | null> {
  const analysis = await analyzeChart(symbol, interval, 50);
  if (!analysis) return null;
  return {
    trend: analysis.trend,
    strength: analysis.trendStrength
  };
}

/**
 * Check if price is overbought or oversold
 */
export async function checkOverboughtOversold(symbol: string): Promise<'OVERBOUGHT' | 'OVERSOLD' | 'NEUTRAL' | null> {
  const analysis = await analyzeChart(symbol, '1h', 50);
  if (!analysis) return null;
  
  const rsi = analysis.indicators.rsi;
  const price = analysis.candles[analysis.candles.length - 1]?.close || 0;
  const bb = analysis.indicators.bollingerBands;
  
  // Check RSI + Bollinger Bands for confluence
  if (rsi > 70 && price > bb.upper) return 'OVERBOUGHT';
  if (rsi < 30 && price < bb.lower) return 'OVERSOLD';
  if (rsi > 70 || price > bb.upper) return 'OVERBOUGHT';
  if (rsi < 30 || price < bb.lower) return 'OVERSOLD';
  
  return 'NEUTRAL';
}
