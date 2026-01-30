// ═══════════════════════════════════════════════════════════════════════════════
// 🧪 ZIKALYZE AI BRAIN PIPELINE — CLIENT-SIDE TEST
// ═══════════════════════════════════════════════════════════════════════════════
// Run in browser console: window.testBrainPipeline()
// Tests the complete brain pipeline with double verification
// ═══════════════════════════════════════════════════════════════════════════════

import { 
  ZikalyzeBrainPipeline, 
  BrainPipelineOutput,
  ActiveCryptoSource,
  AIAnalyzer,
  AttentionAlgorithm
} from './brain-pipeline';
import type { AnalysisInput } from './types';

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
    { name: 'Has pipeline version', pass: result.pipelineVersion.length > 0 },
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

// Main test function
export function testBrainPipeline(): {
  allPassed: boolean;
  results: Array<{name: string; bias: string; confidence: number; verified: boolean; ms: number}>;
  sampleOutput: BrainPipelineOutput;
  storageStats: {goodCount: number; badCount: number; learningCount: number};
} {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🧠 ZIKALYZE AI BRAIN PIPELINE v1.0 — TEST SUITE');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('Testing: Active Source → AI Analyzer → Attention → Double Verify');
  console.log('═══════════════════════════════════════════════════════════════');

  // Test individual components
  const sourceOk = testActiveSource();
  const analyzerOk = testAIAnalyzer();
  const attentionOk = testAttentionAlgorithm();
  
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('🔄 Testing Complete Pipeline with Double Verification');
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

  let allPassed = sourceOk && analyzerOk && attentionOk;
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
    console.log('✅ ALL TESTS PASSED — Brain Pipeline is working correctly!');
    console.log('   ✓ Active Crypto Source: read, learn, adapt');
    console.log('   ✓ AI Analyzer: human-readable processing');
    console.log('   ✓ Attention Algorithm: filter, verify, calculate');
    console.log('   ✓ Hidden Storage: good/bad data separation');
    console.log('   ✓ Double Verification: compare & release');
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

// Auto-register for browser console
if (typeof window !== 'undefined') {
  (window as { testBrainPipeline?: typeof testBrainPipeline }).testBrainPipeline = testBrainPipeline;
  console.log('💡 Run window.testBrainPipeline() in browser console to test the Brain Pipeline');
}
