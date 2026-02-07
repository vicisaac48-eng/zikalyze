// ═══════════════════════════════════════════════════════════════════════════════
// 📈 SHARED TECHNICAL INDICATORS — DRY Implementation
// ═══════════════════════════════════════════════════════════════════════════════
// Centralized technical indicator calculations to avoid code duplication
// Used by: chart-api.ts, neural-engine.ts, zikalyze-ultra.ts
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate Exponential Moving Average (EMA)
 * @param prices Array of price values
 * @param period EMA period (e.g., 9, 21, 50, 200)
 * @returns EMA value, or last price if insufficient data
 */
export function calculateEMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] || 0;
  
  const multiplier = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
  
  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }
  
  return ema;
}

/**
 * Calculate Relative Strength Index (RSI)
 * Standard 14-period RSI using Wilder's smoothing method
 * @param prices Array of closing prices
 * @param period RSI period (default: 14)
 * @returns RSI value (0-100), or 50 if insufficient data
 */
export function calculateRSI(prices: number[], period: number = 14): number {
  // Need at least period + 1 prices to calculate RSI
  if (prices.length < period + 1) return 50;
  
  // Calculate initial average gain and loss
  let gains = 0;
  let losses = 0;
  
  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) {
      gains += change;
    } else {
      losses += Math.abs(change);
    }
  }
  
  let avgGain = gains / period;
  let avgLoss = losses / period;
  
  // Smooth the averages for remaining periods (Wilder's smoothing)
  for (let i = period + 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;
    
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }
  
  // Edge case: if no losses, RSI = 100
  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));
  
  return rsi;
}

/**
 * Calculate Simple Moving Average (SMA)
 * @param prices Array of price values
 * @param period SMA period
 * @returns SMA value, or 0 if insufficient data
 */
export function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return 0;
  
  const slice = prices.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

/**
 * Calculate Average True Range (ATR)
 * Measures market volatility
 * @param candles Array of candles with high, low, close
 * @param period ATR period (default: 14)
 * @returns ATR value
 */
export function calculateATR(
  candles: Array<{ high: number; low: number; close: number }>,
  period: number = 14
): number {
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
  
  // Calculate ATR using EMA of true ranges
  return calculateEMA(trueRanges, period);
}

/**
 * Calculate Bollinger Bands
 * @param prices Array of closing prices
 * @param period Period for SMA (default: 20)
 * @param stdDev Number of standard deviations (default: 2)
 * @returns Object with upper, middle, and lower bands
 */
export function calculateBollingerBands(
  prices: number[],
  period: number = 20,
  stdDev: number = 2
): { upper: number; middle: number; lower: number } {
  if (prices.length < period) {
    return { upper: 0, middle: 0, lower: 0 };
  }
  
  const middle = calculateSMA(prices, period);
  
  // Calculate standard deviation
  const slice = prices.slice(-period);
  const mean = middle;
  const variance = slice.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / period;
  const sd = Math.sqrt(variance);
  
  const upper = middle + (sd * stdDev);
  const lower = middle - (sd * stdDev);
  
  return { upper, middle, lower };
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 * @param prices Array of closing prices
 * @param fastPeriod Fast EMA period (default: 12)
 * @param slowPeriod Slow EMA period (default: 26)
 * @param signalPeriod Signal line period (default: 9)
 * @returns Object with macd, signal, and histogram values
 */
export function calculateMACD(
  prices: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): { macd: number; signal: number; histogram: number } {
  if (prices.length < slowPeriod) {
    return { macd: 0, signal: 0, histogram: 0 };
  }
  
  const fastEMA = calculateEMA(prices, fastPeriod);
  const slowEMA = calculateEMA(prices, slowPeriod);
  const macd = fastEMA - slowEMA;
  
  // For signal line, we'd need historical MACD values
  // Simplified: use the current MACD as both macd and signal
  // In production, maintain MACD history for proper signal calculation
  const signal = macd; // Placeholder - would need MACD history for proper calculation
  const histogram = macd - signal;
  
  return { macd, signal, histogram };
}
