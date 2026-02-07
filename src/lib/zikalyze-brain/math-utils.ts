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
export function validateArrayLength(arr: any[], minLength: number, name: string = 'array'): boolean {
  if (!arr || arr.length < minLength) {
    console.warn(`[Math Utils] ${name} length ${arr?.length || 0} is below minimum ${minLength}`);
    return false;
  }
  return true;
}
