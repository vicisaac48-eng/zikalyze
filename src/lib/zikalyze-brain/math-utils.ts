// ═══════════════════════════════════════════════════════════════════════════════
// 📊 MATH UTILITIES — Shared Statistical Functions
// ═══════════════════════════════════════════════════════════════════════════════
// Centralized mathematical utilities to avoid code duplication across modules
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate mean (average) of an array of numbers
 * @param values Array of numbers
 * @returns Mean value, or 0 if array is empty
 */
export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Calculate standard deviation of an array of numbers
 * @param values Array of numbers
 * @returns Standard deviation, or 0 if insufficient data
 */
export function std(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  const variance = values.reduce((sum, v) => sum + Math.pow(v - m, 2), 0) / (values.length - 1);
  return Math.sqrt(variance);
}

/**
 * Calculate Pearson correlation coefficient between two arrays
 * @param x First array of numbers
 * @param y Second array of numbers
 * @returns Correlation coefficient (-1 to 1), or 0 if insufficient data
 */
export function correlation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length < 2) return 0;
  
  const meanX = mean(x);
  const meanY = mean(y);
  const stdX = std(x);
  const stdY = std(y);
  
  if (stdX === 0 || stdY === 0) return 0;
  
  let sum = 0;
  for (let i = 0; i < x.length; i++) {
    sum += ((x[i] - meanX) / stdX) * ((y[i] - meanY) / stdY);
  }
  
  return sum / (x.length - 1);
}

/**
 * Calculate skewness (measure of asymmetry) of a distribution
 * @param values Array of numbers
 * @returns Skewness value
 */
export function skewness(values: number[]): number {
  if (values.length < 3) return 0;
  
  const m = mean(values);
  const s = std(values);
  
  if (s === 0) return 0;
  
  let sum = 0;
  for (const v of values) {
    sum += Math.pow((v - m) / s, 3);
  }
  
  return sum / values.length;
}

/**
 * Calculate kurtosis (measure of "tailedness") of a distribution
 * @param values Array of numbers
 * @returns Kurtosis value (excess kurtosis)
 */
export function kurtosis(values: number[]): number {
  if (values.length < 4) return 0;
  
  const m = mean(values);
  const s = std(values);
  
  if (s === 0) return 0;
  
  let sum = 0;
  for (const v of values) {
    sum += Math.pow((v - m) / s, 4);
  }
  
  return (sum / values.length) - 3; // Excess kurtosis (subtract 3 for normal distribution)
}

/**
 * Validate array has minimum length for calculations
 * @param arr Array to validate
 * @param minLength Minimum required length
 * @param name Optional name for error message
 * @returns true if valid, false otherwise
 */
export function validateArrayLength(arr: unknown[], minLength: number, name: string = 'array'): boolean {
  if (!arr || arr.length < minLength) {
    console.warn(`[Math Utils] ${name} length ${arr?.length || 0} is below minimum ${minLength}`);
    return false;
  }
  return true;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎯 DATA ACCURACY VALIDATION — 24h Price Range
// ═══════════════════════════════════════════════════════════════════════════════

export interface ValidatedPriceRange {
  high24h: number;
  low24h: number;
  wasAdjusted: boolean;
  adjustments: string[];
}

/**
 * Validate and correct 24h price range to ensure current price is within bounds.
 * The current price MUST be within the 24h range - if not, the data is stale.
 * 
 * Validation order (all conditions checked sequentially):
 * 1. If price > high24h: adjust high24h to price
 * 2. If price < low24h: adjust low24h to price
 * 3. If high24h <= low24h (after adjustments): create ±2% range around price
 * 
 * @param price Current price
 * @param high24h 24h high price
 * @param low24h 24h low price
 * @param context Optional context string for logging (e.g., function name)
 * @returns Validated price range with adjustments logged
 */
export function validatePriceRange(
  price: number,
  high24h: number,
  low24h: number,
  context: string = 'validatePriceRange'
): ValidatedPriceRange {
  const adjustments: string[] = [];
  let adjustedHigh = high24h;
  let adjustedLow = low24h;
  
  // Validation 1: Current price cannot be above 24h high
  if (price > adjustedHigh) {
    adjustments.push(`price ($${price.toFixed(2)}) > high24h ($${high24h.toFixed(2)}) — adjusted high to price`);
    adjustedHigh = price;
  }
  
  // Validation 2: Current price cannot be below 24h low
  if (price < adjustedLow) {
    adjustments.push(`price ($${price.toFixed(2)}) < low24h ($${low24h.toFixed(2)}) — adjusted low to price`);
    adjustedLow = price;
  }
  
  // Validation 3: 24h high must be greater than 24h low
  if (adjustedHigh <= adjustedLow) {
    adjustments.push(`high24h ($${adjustedHigh.toFixed(2)}) <= low24h ($${adjustedLow.toFixed(2)}) — created ±2% range around price`);
    adjustedHigh = price * 1.02;
    adjustedLow = price * 0.98;
  }
  
  // Log adjustments if any were made
  const wasAdjusted = adjustments.length > 0;
  if (wasAdjusted) {
    console.warn(`[${context}] Data correction: ${adjustments.join('; ')}`);
    console.log(`[${context}] Corrected 24h range: $${adjustedLow.toFixed(2)} → $${adjustedHigh.toFixed(2)} (price: $${price.toFixed(2)})`);
  }
  
  return {
    high24h: adjustedHigh,
    low24h: adjustedLow,
    wasAdjusted,
    adjustments
  };
}
