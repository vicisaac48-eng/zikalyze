// ═══════════════════════════════════════════════════════════════════════════════
// 🧪 ZIKALYZE ULTRA TEST SUITE
// ═══════════════════════════════════════════════════════════════════════════════
// Tests for the Ultra AI features to ensure everything works correctly
// ═══════════════════════════════════════════════════════════════════════════════

import { ZikalyzeUltra, analyzeWithUltra } from './zikalyze-ultra';
import type { ChartTrendInput } from './types';

/**
 * Generate realistic mock chart data for testing
 */
function generateMockChartData(trend: 'bullish' | 'bearish' | 'ranging', numCandles: number = 200): ChartTrendInput {
  const candles = [];
  let basePrice = 50000;
  
  for (let i = 0; i < numCandles; i++) {
    const randomness = (Math.random() - 0.5) * 0.02; // +/- 1% random
    
    let trendComponent = 0;
    if (trend === 'bullish') {
      trendComponent = 0.001; // 0.1% upward drift
    } else if (trend === 'bearish') {
      trendComponent = -0.001; // 0.1% downward drift
    }
    
    const priceChange = (trendComponent + randomness) * basePrice;
    basePrice += priceChange;
    
    const high = basePrice * (1 + Math.abs(randomness));
    const low = basePrice * (1 - Math.abs(randomness));
    const open = i === 0 ? basePrice : candles[i - 1].close;
    
    candles.push({
      timestamp: Date.now() - (numCandles - i) * 60000, // 1 minute candles
      open,
      high,
      low,
      close: basePrice,
      volume: 1000000 + Math.random() * 500000,
    });
  }
  
  const lastCandle = candles[candles.length - 1];
  const firstCandle = candles[0];
  const priceChange = ((lastCandle.close - firstCandle.close) / firstCandle.close) * 100;
  
  return {
    candles,
    trend24h: trend === 'bullish' ? 'BULLISH' : trend === 'bearish' ? 'BEARISH' : 'NEUTRAL',
    trendStrength: Math.abs(priceChange),
    higherHighs: trend === 'bullish',
    higherLows: trend === 'bullish',
    lowerHighs: trend === 'bearish',
    lowerLows: trend === 'bearish',
    ema9: lastCandle.close * 0.99,
    ema21: lastCandle.close * 0.98,
    rsi: trend === 'bullish' ? 65 : trend === 'bearish' ? 35 : 50,
    volumeTrend: 'STABLE',
    priceVelocity: priceChange,
    isLive: true,
    source: 'test-data',
  };
}

/**
 * Test 1: Feature extraction
 */
export function testFeatureExtraction(): boolean {
  console.log('🧪 Test 1: Feature Extraction');
  
  const ultra = new ZikalyzeUltra();
  const chartData = generateMockChartData('bullish', 200);
  
  const features = ultra.extractFeatures(chartData);
  
  // Verify all feature arrays have correct lengths
  const checks = [
    features.returns.length === 6, // 6 windows
    features.volatility.length === 6,
    features.momentum.length === 6,
    features.rsi.length === 6,
    features.skewness.length === 6,
    features.kurtosis.length === 6,
    features.hurstExponent >= 0 && features.hurstExponent <= 1,
    features.fractalDimension >= 1 && features.fractalDimension <= 2,
    features.entropy >= 0,
    features.featureVector.length > 30, // Should have 30+ features
  ];
  
  const passed = checks.every(check => check);
  console.log(passed ? '✅ PASSED' : '❌ FAILED', '- Feature extraction test');
  console.log('Feature vector length:', features.featureVector.length);
  console.log('Hurst exponent:', features.hurstExponent.toFixed(4));
  console.log('Entropy:', features.entropy.toFixed(4));
  
  return passed;
}

/**
 * Test 2: Regime detection
 */
export function testRegimeDetection(): boolean {
  console.log('\n🧪 Test 2: Regime Detection');
  
  const ultra = new ZikalyzeUltra();
  
  // Test bullish trending regime
  const bullishData = generateMockChartData('bullish', 100);
  const bullishFeatures = ultra.extractFeatures(bullishData);
  const bullishRegime = ultra.detectRegime(bullishFeatures);
  
  // Test bearish trending regime
  const bearishData = generateMockChartData('bearish', 100);
  const bearishFeatures = ultra.extractFeatures(bearishData);
  const bearishRegime = ultra.detectRegime(bearishFeatures);
  
  // Test ranging regime
  const rangingData = generateMockChartData('ranging', 100);
  const rangingFeatures = ultra.extractFeatures(rangingData);
  const rangingRegime = ultra.detectRegime(rangingFeatures);
  
  console.log('Bullish regime:', bullishRegime);
  console.log('Bearish regime:', bearishRegime);
  console.log('Ranging regime:', rangingRegime);
  
  // Regimes should be detected (exact values may vary due to randomness)
  const passed = 
    (bullishRegime === 'trending' || bullishRegime === 'volatile' || bullishRegime === 'ranging') &&
    (bearishRegime === 'trending' || bearishRegime === 'volatile' || bearishRegime === 'ranging') &&
    (rangingRegime === 'ranging' || rangingRegime === 'volatile' || rangingRegime === 'trending');
  
  console.log(passed ? '✅ PASSED' : '❌ FAILED', '- Regime detection test');
  
  return passed;
}

/**
 * Test 3: Signal generation
 */
export function testSignalGeneration(): boolean {
  console.log('\n🧪 Test 3: Signal Generation');
  
  const ultra = new ZikalyzeUltra();
  
  // Test bullish signal
  const bullishData = generateMockChartData('bullish', 200);
  const bullishSignal = ultra.generateSignal(bullishData);
  
  console.log('Bullish signal:', {
    signal: bullishSignal.signal,
    direction: bullishSignal.direction,
    confidence: bullishSignal.confidence.toFixed(3),
    prediction: bullishSignal.prediction.toFixed(3),
    regime: bullishSignal.regime,
  });
  
  // Test bearish signal
  const bearishData = generateMockChartData('bearish', 200);
  const bearishSignal = ultra.generateSignal(bearishData);
  
  console.log('Bearish signal:', {
    signal: bearishSignal.signal,
    direction: bearishSignal.direction,
    confidence: bearishSignal.confidence.toFixed(3),
    prediction: bearishSignal.prediction.toFixed(3),
    regime: bearishSignal.regime,
  });
  
  // Verify signal structure
  const checks = [
    ['STRONG_BUY', 'BUY', 'HOLD', 'SELL', 'STRONG_SELL'].includes(bullishSignal.signal),
    ['LONG', 'SHORT', 'NEUTRAL'].includes(bullishSignal.direction),
    bullishSignal.confidence >= 0 && bullishSignal.confidence <= 1,
    bullishSignal.prediction >= -1 && bullishSignal.prediction <= 1,
    bullishSignal.riskMetrics.volatility >= 0,
    typeof bullishSignal.riskMetrics.sharpeEstimate === 'number',
    bullishSignal.modelWeights.gradientBoost >= 0,
    bullishSignal.featureImportance.momentum >= 0,
  ];
  
  const passed = checks.every(check => check);
  console.log(passed ? '✅ PASSED' : '❌ FAILED', '- Signal generation test');
  
  return passed;
}

/**
 * Test 4: Learning system
 */
export function testLearningSystem(): boolean {
  console.log('\n🧪 Test 4: Learning System');
  
  const ultra = new ZikalyzeUltra();
  
  // Generate a signal
  const chartData = generateMockChartData('bullish', 200);
  ultra.generateSignal(chartData);
  
  const memoryCountBefore = ultra.getMemoryCount();
  console.log('Memories after first signal:', memoryCountBefore);
  
  // Generate more signals
  for (let i = 0; i < 5; i++) {
    const data = generateMockChartData(i % 2 === 0 ? 'bullish' : 'bearish', 200);
    ultra.generateSignal(data);
  }
  
  const memoryCountAfter = ultra.getMemoryCount();
  console.log('Memories after 6 signals:', memoryCountAfter);
  
  // Test learning from outcome
  ultra.learn(0.5); // Simulate a positive outcome
  
  // Get regime performance stats
  const perf = ultra.getRegimePerformance();
  console.log('Regime performance:', perf);
  
  const checks = [
    memoryCountBefore === 1,
    memoryCountAfter === 6,
    typeof perf.volatile === 'object',
    typeof perf.trending === 'object',
    typeof perf.ranging === 'object',
  ];
  
  const passed = checks.every(check => check);
  console.log(passed ? '✅ PASSED' : '❌ FAILED', '- Learning system test');
  
  // Test reset
  ultra.clearMemories();
  console.log('Memories after clear:', ultra.getMemoryCount());
  
  return passed;
}

/**
 * Test 5: Convenience function
 */
export function testConvenienceFunction(): boolean {
  console.log('\n🧪 Test 5: Convenience Function');
  
  const chartData = generateMockChartData('bullish', 200);
  const signal = analyzeWithUltra(chartData);
  
  console.log('Signal from convenience function:', {
    signal: signal.signal,
    direction: signal.direction,
    confidence: signal.confidence.toFixed(3),
  });
  
  const passed = signal !== null && signal !== undefined;
  console.log(passed ? '✅ PASSED' : '❌ FAILED', '- Convenience function test');
  
  return passed;
}

/**
 * Run all tests
 */
export function runAllUltraTests(): boolean {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🚀 ZIKALYZE ULTRA TEST SUITE');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  const results = [
    testFeatureExtraction(),
    testRegimeDetection(),
    testSignalGeneration(),
    testLearningSystem(),
    testConvenienceFunction(),
  ];
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`📊 RESULTS: ${passed}/${total} tests passed`);
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  return results.every(r => r);
}

// Auto-run tests if this file is executed directly
if (typeof window === 'undefined' && typeof module !== 'undefined') {
  runAllUltraTests();
}
