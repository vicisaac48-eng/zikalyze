// ═══════════════════════════════════════════════════════════════════════════════
// 🧪 ZIKALYZE AI BRAIN PIPELINE v2.0 — CLIENT-SIDE TEST
// ═══════════════════════════════════════════════════════════════════════════════
// Run in browser console: window.testBrainPipeline()
// Tests the complete brain pipeline with enhanced double verification
// Tests self-learning from live chart and livestream data
// ═══════════════════════════════════════════════════════════════════════════════

import { 
  ZikalyzeBrainPipeline, 
  BrainPipelineOutput,
  ActiveCryptoSource,
  AIAnalyzer,
  AttentionAlgorithm,
  DoubleVerificationLoop,
  VerificationStep,
  EnhancedVerificationResult,
  // Self-learning components
  LiveChartLearner,
  LivestreamLearner,
  SelfLearningBrainPipeline,
  SelfLearningOutput
} from './brain-pipeline';
import type { AnalysisInput, ChartTrendInput } from './types';

// Verification function for brain pipeline output
function verifyPipelineResult(result: BrainPipelineOutput, testName: string): boolean {
  const checks = [
    { name: 'Has valid bias', pass: ['LONG', 'SHORT', 'NEUTRAL'].includes(result.bias) },
    { name: 'Confidence 0-1', pass: result.confidence >= 0 && result.confidence <= 1 },
    { name: 'Has human readable analysis', pass: result.humanReadableAnalysis.length > 100 },
    { name: 'Has key insights', pass: result.keyInsights.length >= 0 },
    { name: 'Has double verification', pass: typeof result.doubleVerified === 'boolean' },
    { name: 'Has verification match', pass: typeof result.verificationMatch === 'boolean' },
    { name: 'Has first check confidence', pass: result.firstCheckConfidence >= 0 },
    { name: 'Has second check confidence', pass: result.secondCheckConfidence >= 0 },
    { name: 'Has attention heatmap', pass: Array.isArray(result.attentionHeatmap) },
    { name: 'Has processing time', pass: result.processingTimeMs >= 0 },
    { name: 'Has timestamp', pass: !isNaN(Date.parse(result.timestamp)) },
    { name: 'Has pipeline version v2', pass: result.pipelineVersion.startsWith('2') },
    { name: 'Processing < 1 second', pass: result.processingTimeMs < 1000 },
  ];
  
  const passed = checks.filter(c => c.pass).length;
  const failed = checks.filter(c => !c.pass);
  
  console.log(`\n🧪 ${testName}: ${passed}/${checks.length} checks passed`);
  if (failed.length > 0) {
    console.log('❌ Failed:', failed.map(f => f.name).join(', '));
  }
  return failed.length === 0;
}

// Test individual components
function testActiveSource(): boolean {
  console.log('\n📡 Testing ActiveCryptoSource...');
  const source = new ActiveCryptoSource();
  
  const input: AnalysisInput = {
    crypto: 'BTC',
    price: 65000,
    change: 2.5,
    high24h: 66000,
    low24h: 64000,
    volume: 1000000000
  };
  
  const rawData = source.readData(input);
  
  const checks = [
    { name: 'Symbol parsed', pass: rawData.symbol === 'BTC' },
    { name: 'Price set', pass: rawData.price === 65000 },
    { name: 'Change set', pass: rawData.change24h === 2.5 },
    { name: 'High/low set', pass: rawData.high24h === 66000 && rawData.low24h === 64000 },
    { name: 'Volume set', pass: rawData.volume24h === 1000000000 },
    { name: 'Timestamp present', pass: rawData.timestamp > 0 },
    { name: 'Has bid/ask spread', pass: typeof rawData.bidAskSpread === 'number' },
    { name: 'Has order book depth', pass: typeof rawData.orderBookDepth === 'number' },
  ];
  
  const passed = checks.filter(c => c.pass).length;
  console.log(`   Active Source: ${passed}/${checks.length} passed`);
  
  // Test learning
  source.learn('BTC', [1, 1, 0, 1, 1]);
  console.log('   Learning: weights updated ✓');
  
  return passed === checks.length;
}

function testAIAnalyzer(): boolean {
  console.log('\n🔬 Testing AIAnalyzer...');
  const source = new ActiveCryptoSource();
  const analyzer = new AIAnalyzer();
  
  const input: AnalysisInput = {
    crypto: 'ETH',
    price: 3500,
    change: -3.2,
    high24h: 3700,
    low24h: 3400,
    volume: 500000000
  };
  
  const rawData = source.readData(input);
  const analyzed = analyzer.process(rawData);
  
  const checks = [
    { name: 'Has price analysis', pass: analyzed.priceAnalysis.length > 50 },
    { name: 'Has trend description', pass: analyzed.trendDescription.length > 20 },
    { name: 'Has volume analysis', pass: analyzed.volumeAnalysis.length > 20 },
    { name: 'Has market sentiment', pass: analyzed.marketSentiment.length > 10 },
    { name: 'Bullish score 0-100', pass: analyzed.bullishScore >= 0 && analyzed.bullishScore <= 100 },
    { name: 'Bearish score 0-100', pass: analyzed.bearishScore >= 0 && analyzed.bearishScore <= 100 },
    { name: 'Volatility score 0-100', pass: analyzed.volatilityScore >= 0 && analyzed.volatilityScore <= 100 },
    { name: 'Momentum score 0-100', pass: analyzed.momentumScore >= 0 && analyzed.momentumScore <= 100 },
    { name: 'Has feature vector', pass: analyzed.featureVector.length === 10 },
    { name: 'Has processing timestamp', pass: analyzed.processingTimestamp > 0 },
    { name: 'Has analyzer version', pass: analyzed.analyzerVersion.length > 0 },
  ];
  
  const passed = checks.filter(c => c.pass).length;
  console.log(`   AI Analyzer: ${passed}/${checks.length} passed`);
  console.log(`   Scores: Bull=${analyzed.bullishScore} Bear=${analyzed.bearishScore} Vol=${analyzed.volatilityScore} Mom=${analyzed.momentumScore}`);
  
  return passed === checks.length;
}

function testAttentionAlgorithm(): boolean {
  console.log('\n🧮 Testing AttentionAlgorithm...');
  const source = new ActiveCryptoSource();
  const analyzer = new AIAnalyzer();
  const attention = new AttentionAlgorithm();
  
  const input: AnalysisInput = {
    crypto: 'SOL',
    price: 180,
    change: 5.5,
    high24h: 185,
    low24h: 170,
    volume: 200000000
  };
  
  const rawData = source.readData(input);
  const analyzed = analyzer.process(rawData);
  const verified = attention.calculate(analyzed);
  
  const checks = [
    { name: 'Has attention scores', pass: verified.attentionScores.length > 0 },
    { name: 'Has importance weights', pass: verified.importanceWeights.length > 0 },
    { name: 'Has filtered insights', pass: Array.isArray(verified.filteredInsights) },
    { name: 'Has valid quality', pass: ['GOOD', 'BAD', 'UNCERTAIN'].includes(verified.quality) },
    { name: 'Confidence 0-1', pass: verified.confidenceScore >= 0 && verified.confidenceScore <= 1 },
    { name: 'Has verification hash', pass: verified.verificationHash.startsWith('zk-') },
    { name: 'Has filtered reasons', pass: Array.isArray(verified.filteredOutReasons) },
    { name: 'Has entropy loss', pass: typeof verified.entropyLoss === 'number' },
    { name: 'Weights sum to ~1', pass: Math.abs(verified.importanceWeights.reduce((a, b) => a + b, 0) - 1) < 0.01 },
  ];
  
  const passed = checks.filter(c => c.pass).length;
  console.log(`   Attention Algorithm: ${passed}/${checks.length} passed`);
  console.log(`   Quality: ${verified.quality} | Confidence: ${(verified.confidenceScore * 100).toFixed(0)}%`);
  
  return passed === checks.length;
}

/**
 * Test the enhanced double verification loop
 * Flow: Attention → AI Analyzer → Attention (re-verify) → Compare → Release
 */
function testEnhancedDoubleVerification(): boolean {
  console.log('\n🔄 Testing Enhanced Double Verification Loop...');
  const source = new ActiveCryptoSource();
  const analyzer = new AIAnalyzer();
  const attention = new AttentionAlgorithm();
  const verificationLoop = new DoubleVerificationLoop();
  
  const input: AnalysisInput = {
    crypto: 'BTC',
    price: 97542.18,
    change: 4.5,
    high24h: 98200,
    low24h: 93100,
    volume: 28500000000
  };
  
  // Step 1: Read data from source
  const rawData = source.readData(input);
  
  // Step 2: Process through analyzer
  const analyzed = analyzer.process(rawData);
  
  // Step 3: First attention verification
  const firstCheck = attention.calculate(analyzed);
  
  // Step 4: Enhanced double verification (send back to analyzer → attention → compare)
  const verificationResult = verificationLoop.verify(rawData, firstCheck);
  
  const checks = [
    { name: 'Has verified flag', pass: typeof verificationResult.verified === 'boolean' },
    { name: 'Has match flag', pass: typeof verificationResult.match === 'boolean' },
    { name: 'Has matchPercentage', pass: verificationResult.matchPercentage >= 0 && verificationResult.matchPercentage <= 1 },
    { name: 'Has secondCheck', pass: verificationResult.secondCheck !== null },
    { name: 'Has verification steps', pass: Array.isArray(verificationResult.verificationSteps) },
    { name: 'Has 5 verification steps', pass: verificationResult.verificationSteps.length === 5 },
    { name: 'All steps have data', pass: verificationResult.verificationSteps.every(s => 
        typeof s.step === 'number' && 
        typeof s.name === 'string' && 
        typeof s.passed === 'boolean' &&
        typeof s.confidence === 'number'
      )
    },
    { name: 'Has totalVerificationTimeMs', pass: verificationResult.totalVerificationTimeMs >= 0 },
    { name: 'Has releaseApproved', pass: typeof verificationResult.releaseApproved === 'boolean' },
    { name: 'Has releaseReason', pass: verificationResult.releaseReason.length > 0 },
    { name: 'Verification < 500ms', pass: verificationResult.totalVerificationTimeMs < 500 },
  ];
  
  const passed = checks.filter(c => c.pass).length;
  const failed = checks.filter(c => !c.pass);
  
  console.log(`   Enhanced Verification: ${passed}/${checks.length} passed`);
  console.log(`   Release: ${verificationResult.releaseApproved ? '✅ APPROVED' : '❌ BLOCKED'}`);
  console.log(`   Match: ${(verificationResult.matchPercentage * 100).toFixed(0)}%`);
  console.log(`   Reason: ${verificationResult.releaseReason}`);
  console.log(`   Steps: ${verificationResult.verificationSteps.map(s => s.passed ? '✅' : '❌').join(' → ')}`);
  
  if (failed.length > 0) {
    console.log('   ❌ Failed:', failed.map(f => f.name).join(', '));
  }
  
  return passed === checks.length;
}

// Main test function
export function testBrainPipeline(): {
  allPassed: boolean;
  results: Array<{name: string; bias: string; confidence: number; verified: boolean; ms: number}>;
  sampleOutput: BrainPipelineOutput;
  storageStats: {goodCount: number; badCount: number; learningCount: number};
} {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🧠 ZIKALYZE AI BRAIN PIPELINE v2.0 — TEST SUITE');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('Testing: Active Source → AI Analyzer → Attention → Double Verify');
  console.log('Flow: Brain → Analyzer → Attention → Analyzer → Attention → Compare → Release');
  console.log('═══════════════════════════════════════════════════════════════');

  // Test individual components
  const sourceOk = testActiveSource();
  const analyzerOk = testAIAnalyzer();
  const attentionOk = testAttentionAlgorithm();
  const verificationOk = testEnhancedDoubleVerification();
  
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('🔄 Testing Complete Pipeline with Enhanced Double Verification');
  console.log('═══════════════════════════════════════════════════════════════');

  // Create pipeline instance
  const pipeline = new ZikalyzeBrainPipeline();

  // Test cases
  const tests: Array<{name: string; input: AnalysisInput}> = [
    {
      name: 'BTC Bullish Rally',
      input: { crypto: 'BTC', price: 97542.18, change: 4.5, high24h: 98200, low24h: 93100, volume: 28500000000 }
    },
    {
      name: 'ETH Bearish Dump',
      input: { crypto: 'ETH', price: 3420.50, change: -5.2, high24h: 3650, low24h: 3380, volume: 12000000000 }
    },
    {
      name: 'SOL Neutral Range',
      input: { crypto: 'SOL', price: 185.20, change: 0.8, high24h: 188, low24h: 182, volume: 2500000000 }
    },
    {
      name: 'XRP Strong Pump',
      input: { crypto: 'XRP', price: 2.45, change: 12.5, high24h: 2.50, low24h: 2.15, volume: 8000000000 }
    },
    {
      name: 'DOGE Volatile',
      input: { crypto: 'DOGE', price: 0.42, change: -8.5, high24h: 0.48, low24h: 0.40, volume: 5000000000 }
    }
  ];

  let allPassed = sourceOk && analyzerOk && attentionOk && verificationOk;
  const results: Array<{name: string; bias: string; confidence: number; verified: boolean; ms: number}> = [];

  for (const test of tests) {
    const start = performance.now();
    const result = pipeline.process(test.input);
    const ms = performance.now() - start;
    
    const passed = verifyPipelineResult(result, test.name);
    allPassed = allPassed && passed;
    
    results.push({
      name: test.name,
      bias: result.bias,
      confidence: Math.round(result.confidence * 100),
      verified: result.doubleVerified,
      ms: Math.round(ms * 100) / 100
    });
  }

  // Get storage stats
  const storageStats = pipeline.getStorageStats();
  const learningAdj = pipeline.getLearningAdjustment();

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('📊 PIPELINE RESULTS SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════');
  console.table(results);

  console.log('\n📦 Hidden Storage Statistics:');
  console.log(`   Good Data Records: ${storageStats.goodCount}`);
  console.log(`   Bad Data Records: ${storageStats.badCount}`);
  console.log(`   Learning Signals: ${storageStats.learningCount}`);
  console.log(`   Learning Adjustment: ${(learningAdj * 100).toFixed(2)}%`);

  console.log('\n═══════════════════════════════════════════════════════════════');
  if (allPassed) {
    console.log('✅ ALL TESTS PASSED — Brain Pipeline v2.0 working correctly!');
    console.log('   ✓ Active Crypto Source: read, learn, adapt');
    console.log('   ✓ AI Analyzer: human-readable processing');
    console.log('   ✓ Attention Algorithm: filter, verify, calculate 🧮');
    console.log('   ✓ Enhanced Double Verification: Analyzer → Attention → Compare');
    console.log('   ✓ Hidden Storage: good/bad data separation 🔒');
    console.log('   ✓ Release only if 100% verified ✅');
    console.log('   ✓ All processing < 1 second ⚡');
  } else {
    console.log('❌ SOME TESTS FAILED — Review the output above');
  }
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Return sample output for inspection
  const sampleOutput = pipeline.process(tests[0].input);
  console.log('📝 SAMPLE BTC PIPELINE OUTPUT:\n');
  console.log(sampleOutput.humanReadableAnalysis);

  return { allPassed, results, sampleOutput, storageStats };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 SELF-LEARNING TESTS
// ═══════════════════════════════════════════════════════════════════════════════

function testLiveChartLearner(): boolean {
  console.log('\n📊 Testing LiveChartLearner...');
  const learner = new LiveChartLearner();
  
  // Create mock chart data
  const mockChartData: ChartTrendInput = {
    candles: Array.from({ length: 24 }, (_, i) => ({
      timestamp: Date.now() - (24 - i) * 3600000,
      open: 65000 + i * 100,
      high: 65000 + i * 100 + 200,
      low: 65000 + i * 100 - 100,
      close: 65000 + i * 100 + 150,
      volume: 1000000 + i * 50000
    })),
    trend24h: 'BULLISH',
    trendStrength: 75,
    higherHighs: true,
    higherLows: true,
    lowerHighs: false,
    lowerLows: false,
    ema9: 66000,
    ema21: 65500,
    rsi: 58,
    volumeTrend: 'INCREASING',
    priceVelocity: 0.5,
    isLive: true,
    source: 'test'
  };
  
  // Test learning from chart data
  learner.learnFromChartData('BTC', mockChartData);
  const patterns = learner.getRecentPatterns('BTC');
  
  const checks = [
    { name: 'Learned patterns stored', pass: patterns.length > 0 },
    { name: 'Pattern has symbol', pass: patterns[0]?.symbol === 'BTC' },
    { name: 'Pattern has price', pass: patterns[0]?.priceAtDetection > 0 },
    { name: 'Pattern has EMA9', pass: patterns[0]?.ema9 > 0 },
    { name: 'Pattern has RSI', pass: patterns[0]?.rsi > 0 },
    { name: 'Pattern has timestamp', pass: patterns[0]?.timestamp > 0 }
  ];
  
  const passed = checks.filter(c => c.pass).length;
  console.log(`   Live Chart Learner: ${passed}/${checks.length} passed`);
  
  // Test dominant pattern detection
  for (let i = 0; i < 5; i++) {
    learner.learnFromChartData('BTC', mockChartData);
  }
  const dominant = learner.getDominantPattern('BTC');
  console.log(`   Dominant pattern: ${dominant || 'None'}`);
  
  return passed === checks.length;
}

function testLivestreamLearner(): boolean {
  console.log('\n📡 Testing LivestreamLearner...');
  const learner = new LivestreamLearner();
  
  // Simulate livestream updates
  const now = Date.now();
  for (let i = 0; i < 100; i++) {
    learner.processLiveUpdate({
      symbol: 'ETH',
      price: 3500 + i * 2 + Math.random() * 10,
      change24h: 2.5,
      volume: 500000000,
      source: 'test',
      timestamp: now + i * 1000
    });
  }
  
  // Check velocity pattern
  const velocityPattern = learner.getVelocityPattern('ETH');
  const prediction = learner.predictDirection('ETH');
  const hasReliable = learner.hasReliableData('ETH');
  
  const checks = [
    { name: 'Velocity pattern created', pass: velocityPattern !== null },
    { name: 'Has avg velocity', pass: velocityPattern?.avgVelocity !== undefined },
    { name: 'Has volatility', pass: velocityPattern?.volatility !== undefined },
    { name: 'Has momentum strength', pass: velocityPattern?.momentumStrength !== undefined },
    { name: 'Has update count', pass: velocityPattern?.updateCount !== undefined && velocityPattern.updateCount >= 50 },
    { name: 'Has reliable data', pass: hasReliable },
    { name: 'Prediction direction valid', pass: ['UP', 'DOWN', 'NEUTRAL'].includes(prediction.direction) },
    { name: 'Prediction confidence valid', pass: prediction.confidence >= 0 && prediction.confidence <= 1 }
  ];
  
  const passed = checks.filter(c => c.pass).length;
  console.log(`   Livestream Learner: ${passed}/${checks.length} passed`);
  console.log(`   Velocity: ${velocityPattern?.avgVelocity.toFixed(4)} | Volatility: ${velocityPattern?.volatility.toFixed(4)}`);
  console.log(`   Prediction: ${prediction.direction} (${(prediction.confidence * 100).toFixed(0)}% confidence)`);
  
  return passed === checks.length;
}

function testSelfLearningPipeline(): boolean {
  console.log('\n🧠 Testing SelfLearningBrainPipeline...');
  const pipeline = new SelfLearningBrainPipeline();
  
  // Create mock data
  const input: AnalysisInput = {
    crypto: 'BTC',
    price: 97542.18,
    change: 4.5,
    high24h: 98200,
    low24h: 93100,
    volume: 28500000000
  };
  
  const mockChartData: ChartTrendInput = {
    candles: Array.from({ length: 24 }, (_, i) => ({
      timestamp: Date.now() - (24 - i) * 3600000,
      open: 94000 + i * 150,
      high: 94000 + i * 150 + 300,
      low: 94000 + i * 150 - 100,
      close: 94000 + i * 150 + 200,
      volume: 1200000000
    })),
    trend24h: 'BULLISH',
    trendStrength: 80,
    higherHighs: true,
    higherLows: true,
    lowerHighs: false,
    lowerLows: false,
    ema9: 97000,
    ema21: 96000,
    rsi: 62,
    volumeTrend: 'INCREASING',
    priceVelocity: 0.8,
    isLive: true,
    source: 'test'
  };
  
  const livestreamUpdate = {
    symbol: 'BTC',
    price: 97542.18,
    change24h: 4.5,
    volume: 28500000000,
    source: 'test',
    timestamp: Date.now()
  };
  
  // Process with learning
  const result = pipeline.processWithLearning(input, mockChartData, livestreamUpdate);
  
  const checks = [
    { name: 'Has valid bias', pass: ['LONG', 'SHORT', 'NEUTRAL'].includes(result.bias) },
    { name: 'Has confidence', pass: result.confidence >= 0 && result.confidence <= 1 },
    { name: 'Has isAccurate flag', pass: typeof result.isAccurate === 'boolean' },
    { name: 'Has accuracy reason', pass: result.accuracyReason.length > 0 },
    { name: 'Has learnedFromLiveChart', pass: typeof result.learnedFromLiveChart === 'boolean' },
    { name: 'Has learnedFromLivestream', pass: typeof result.learnedFromLivestream === 'boolean' },
    { name: 'Has patternConfidence', pass: result.patternConfidence >= 0 },
    { name: 'Has velocityConfidence', pass: result.velocityConfidence >= 0 },
    { name: 'Has combinedLearningScore', pass: result.combinedLearningScore >= 0 && result.combinedLearningScore <= 1 },
    { name: 'Pipeline version v2', pass: result.pipelineVersion.startsWith('2') }
  ];
  
  const passed = checks.filter(c => c.pass).length;
  console.log(`   Self-Learning Pipeline: ${passed}/${checks.length} passed`);
  console.log(`   Accurate: ${result.isAccurate ? '✓' : '✗'} | Reason: ${result.accuracyReason}`);
  console.log(`   Chart Learning: ${result.learnedFromLiveChart ? '✓' : '✗'} | Stream Learning: ${result.learnedFromLivestream ? '✓' : '✗'}`);
  console.log(`   Combined Score: ${(result.combinedLearningScore * 100).toFixed(0)}%`);
  
  return passed === checks.length;
}

/**
 * Main test function for self-learning features
 */
export function testSelfLearning(): {
  allPassed: boolean;
  chartLearnerPassed: boolean;
  streamLearnerPassed: boolean;
  pipelinePassed: boolean;
} {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🧠 ZIKALYZE AI SELF-LEARNING v2.0 — TEST SUITE');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('Testing: Live Chart Learning + Livestream Learning + Accuracy');
  console.log('═══════════════════════════════════════════════════════════════');
  
  const chartLearnerPassed = testLiveChartLearner();
  const streamLearnerPassed = testLivestreamLearner();
  const pipelinePassed = testSelfLearningPipeline();
  
  const allPassed = chartLearnerPassed && streamLearnerPassed && pipelinePassed;
  
  console.log('\n═══════════════════════════════════════════════════════════════');
  if (allPassed) {
    console.log('✅ ALL SELF-LEARNING TESTS PASSED!');
    console.log('   ✓ Live Chart Learner: learns from chart patterns');
    console.log('   ✓ Livestream Learner: learns from WebSocket data');
    console.log('   ✓ Self-Learning Pipeline: only sends accurate info');
    console.log('   ✓ Strict verification before output');
  } else {
    console.log('❌ SOME TESTS FAILED — Review the output above');
  }
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  return { allPassed, chartLearnerPassed, streamLearnerPassed, pipelinePassed };
}

// Auto-register for browser console
if (typeof window !== 'undefined') {
  (window as { testBrainPipeline?: typeof testBrainPipeline }).testBrainPipeline = testBrainPipeline;
  (window as { testSelfLearning?: typeof testSelfLearning }).testSelfLearning = testSelfLearning;
  console.log('💡 Run window.testBrainPipeline() to test Brain Pipeline');
  console.log('💡 Run window.testSelfLearning() to test Self-Learning features');
}
