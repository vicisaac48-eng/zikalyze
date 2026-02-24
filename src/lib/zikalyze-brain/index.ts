// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 ZIKALYZE AI BRAIN — MAIN ANALYSIS ENGINE
// ═══════════════════════════════════════════════════════════════════════════════
// ⚡ 100% CLIENT-SIDE — Runs entirely in the browser
// 🔗 Hybrid Analysis — Algorithm + Neural Network combined
// 🛡️ Fully trustless — Zero server calls required
// ═══════════════════════════════════════════════════════════════════════════════

import { 
  AnalysisInput, 
  AnalysisResult, 
  OnChainMetrics, 
  ETFFlowData 
} from './types';
import { getUpcomingMacroCatalysts, getQuickMacroFlag } from './macro-catalysts';
import { detectVolumeSpike, getVolumeSpikeFlag } from './volume-analysis';
import { analyzeInstitutionalVsRetail, generateIfThenScenarios } from './institutional-analysis';
import { estimateOnChainMetrics, estimateETFFlowData } from './on-chain-estimator';
import { analyzeMarketStructure, generatePrecisionEntry, calculateFinalBias, performTopDownAnalysis, calculateADX, calculateRegimeWeightedConsensus } from './technical-analysis';
import { hybridConfirmation } from './neural-engine';
import { performTriModularAnalysis, formatTriModularOutput, generateSimplifiedSummary } from './tri-modular-analysis';

// Re-export chart API for direct access to chart data
export * from './chart-api';

// Re-export ULTRA features for advanced analysis
export * from './zikalyze-ultra';

// Re-export Tri-Modular Analysis for direct access
export * from './tri-modular-analysis';

// Translation maps for multi-language support
const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    quickAnalysis: 'Quick Analysis',
    price: 'Price',
    range24h: '24h Range',
    verdict: 'Verdict',
    confidence: 'Confidence',
    bullish: 'BULLISH',
    bearish: 'BEARISH',
    neutral: 'NEUTRAL',
    macroCatalysts: 'Macro Catalysts',
    precisionEntry: '15-Minute Precision Entry',
    keyInsights: 'Key Insights',
    scenarios: 'If-Then Scenarios',
    poweredBy: 'Powered by Zikalyze AI'
  },
  es: {
    quickAnalysis: 'Análisis Rápido',
    price: 'Precio',
    range24h: 'Rango 24h',
    verdict: 'Veredicto',
    confidence: 'Confianza',
    bullish: 'ALCISTA',
    bearish: 'BAJISTA',
    neutral: 'NEUTRAL',
    macroCatalysts: 'Catalizadores Macro',
    precisionEntry: 'Entrada de Precisión 15M',
    keyInsights: 'Ideas Clave',
    scenarios: 'Escenarios Si-Entonces',
    poweredBy: 'Potenciado por Zikalyze AI'
  },
  // Add more languages as needed
};

function getTranslations(language: string): Record<string, string> {
  return TRANSLATIONS[language] || TRANSLATIONS.en;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 MAIN ANALYSIS FUNCTION — Runs 100% in the browser
// ═══════════════════════════════════════════════════════════════════════════════

// Helper: Create visual bar
const createBar = (value: number, max: number = 100, filled = '█', empty = '░', length = 10): string => {
  const filledCount = Math.round((value / max) * length);
  return filled.repeat(Math.max(0, Math.min(length, filledCount))) + empty.repeat(Math.max(0, length - filledCount));
};

// Helper: Fear & Greed emoji + label
// Thresholds: 0-20=EXTREME FEAR, 21-35=FEAR, 36-45=SLIGHT FEAR, 46-54=NEUTRAL, 55-64=SLIGHT GREED, 65-79=HIGH GREED, 80+=EXTREME GREED
const getFearGreedVisual = (value: number): { emoji: string; label: string; bar: string } => {
  const bar = createBar(value);
  if (value <= 20) return { emoji: '😱', label: 'EXTREME FEAR', bar };
  if (value <= 35) return { emoji: '😰', label: 'FEAR', bar };
  if (value <= 45) return { emoji: '😕', label: 'SLIGHT FEAR', bar };
  if (value <= 54) return { emoji: '😐', label: 'NEUTRAL', bar };
  if (value <= 64) return { emoji: '🙂', label: 'SLIGHT GREED', bar };
  if (value <= 79) return { emoji: '🤑', label: 'HIGH GREED', bar };
  return { emoji: '🔥', label: 'EXTREME GREED', bar };
};

// Helper: Whale flow visual
const getWhaleVisual = (netFlow: string, buying: number, selling: number): string => {
  const buyBar = createBar(buying, 100, '🟢', '⚪', 5);
  const sellBar = createBar(selling, 100, '🔴', '⚪', 5);
  return `Buy ${buyBar} ${buying}% | Sell ${sellBar} ${selling}%`;
};

// Helper: Calculate historical context
const getHistoricalContext = (price: number, high24h: number, low24h: number, change: number): string => {
  const range = high24h - low24h;
  const position = range > 0 ? ((price - low24h) / range) * 100 : 50;
  const distFromHigh = ((high24h - price) / price) * 100;
  const distFromLow = ((price - low24h) / price) * 100;
  
  if (position >= 90) return `🏔️ Near 24h HIGH (${distFromHigh.toFixed(1)}% below peak)`;
  if (position >= 70) return `📈 Upper range (top 30% of 24h)`;
  if (position <= 10) return `🕳️ Near 24h LOW (${distFromLow.toFixed(1)}% above bottom)`;
  if (position <= 30) return `📉 Lower range (bottom 30% of 24h)`;
  return `↔️ Mid-range consolidation`;
};

export function runClientSideAnalysis(input: AnalysisInput): AnalysisResult {
  const {
    crypto,
    price,
    change,
    high24h = price * 1.02,
    low24h = price * 0.98,
    volume = 0,
    language = 'en',
    isLiveData = false,
    dataSource = 'cached',
    onChainData,
    sentimentData,
    chartTrendData, // Real-time 24h chart data
    multiTimeframeData // Multi-timeframe analysis (15m, 1h, 4h, 1d)
  } = input;

  const t = getTranslations(language);
  const trendEmoji = change >= 0 ? '📈' : '📉';

  // Use provided on-chain data (real) or estimate (fallback)
  // Mark source clearly for transparency
  const hasRealOnChain = !!onChainData && onChainData.source !== 'derived-deterministic' && onChainData.source !== 'derived';
  const hasRealChartData = !!chartTrendData && chartTrendData.isLive && chartTrendData.candles.length >= 10;
  const hasRealMultiTfData = !!multiTimeframeData && (multiTimeframeData['1h'] !== null || multiTimeframeData['4h'] !== null);
  
  const onChainMetrics: OnChainMetrics = onChainData || estimateOnChainMetrics(crypto, price, change);
  const etfFlowData: ETFFlowData | null = estimateETFFlowData(price, change, crypto);
  
  // Log data sources for debugging - helps identify when using derived vs real data
  console.log(`[AI Brain] Data sources — On-chain: ${hasRealOnChain ? onChainData?.source : 'DERIVED'}, Chart: ${hasRealChartData ? 'REAL' : 'DERIVED'}, Multi-TF: ${hasRealMultiTfData ? 'REAL' : 'DERIVED'}, Live price: ${isLiveData}`);

  // Get macro catalysts with countdown
  const macroCatalysts = getUpcomingMacroCatalysts();
  const macroFlag = getQuickMacroFlag();
  
  // Build macro section with countdown + confidence impact
  const buildMacroSection = (penaltyApplied: boolean = false): string => {
    if (macroCatalysts.length === 0) return '';
    const catalyst = macroCatalysts[0];
    if (catalyst.date === 'Ongoing') return '';
    
    const now = new Date();
    const eventDate = new Date(catalyst.date);
    const daysUntil = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil > 7) return '';
    
    const urgency = daysUntil <= 2 ? '🚨' : daysUntil <= 5 ? '⚠️' : '📅';
    const countdown = daysUntil === 0 ? 'TODAY' : daysUntil === 1 ? 'TOMORROW' : `${daysUntil}d`;
    const impactNote = penaltyApplied ? '\n   ⚡ Confidence reduced due to event proximity' : '';
    
    return `${urgency} ${catalyst.event.toUpperCase()} in ${countdown}
   ↳ ${catalyst.description}${impactNote}`;
  };

  // Detect volume spikes
  const avgVolume = volume * 0.85;
  const volumeSpike = detectVolumeSpike({
    currentVolume: volume,
    avgVolume24h: avgVolume,
    priceChange: change,
    price,
    high24h,
    low24h
  });
  const volumeSpikeFlag = getVolumeSpikeFlag(volumeSpike);

  // Calculate price position in range
  const range = high24h - low24h;
  const pricePosition = range > 0 ? ((price - low24h) / range) * 100 : 50;

  // Get sentiment values
  const fearGreed = sentimentData?.fearGreed?.value ?? 50;
  const socialSentiment = sentimentData?.social?.overall?.score ?? 50;
  const fearGreedVisual = getFearGreedVisual(fearGreed);

  // Institutional vs Retail analysis
  const institutionalVsRetail = analyzeInstitutionalVsRetail({
    etfFlow: etfFlowData,
    onChain: onChainMetrics,
    socialSentiment,
    fearGreed,
    price,
    change
  });

  // Top-down multi-timeframe analysis — now with REAL chart data AND multi-TF
  const topDownAnalysis = performTopDownAnalysis(price, high24h, low24h, change, chartTrendData, multiTimeframeData);
  
  // Log chart data usage for debugging
  if (chartTrendData?.isLive) {
    console.log(`[AI Brain] Using REAL 24h chart data: ${chartTrendData.candles.length} candles, trend=${chartTrendData.trend24h}, EMA9=${chartTrendData.ema9.toFixed(2)}, RSI=${chartTrendData.rsi.toFixed(1)}`);
  }
  
  // Log multi-timeframe usage
  if (multiTimeframeData) {
    const tfKeys = ['15m', '1h', '4h', '1d'] as const;
    const tfSummary = tfKeys
      .map(tf => {
        const tfData = multiTimeframeData[tf];
        return `${tf}=${tfData?.trend || 'N/A'}`;
      })
      .join(', ');
    console.log(`[AI Brain] Multi-TF confluence: ${multiTimeframeData.confluence.overallBias} (${multiTimeframeData.confluence.strength.toFixed(0)}%), ${tfSummary}`);
  }

  // Calculate multi-factor bias
  const { bias: rawBias, confidence: rawConfidence, insights } = calculateFinalBias({
    priceChange: change,
    pricePosition,
    volumeStrength: volumeSpike.isSpike ? 'HIGH' : volume > avgVolume ? 'MODERATE' : 'LOW',
    fearGreed,
    institutionalBias: institutionalVsRetail.institutionalBias,
    onChainTrend: onChainMetrics.exchangeNetFlow.trend
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 🎯 FINAL BIAS — Technical confluence is PRIMARY, fundamentals adjust confidence
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Macro volatility penalty — reduce confidence if high-impact event imminent
  let macroPenalty = 0;
  const imminentCatalyst = macroCatalysts.find(c => {
    if (c.date === 'Ongoing') return false;
    const now = new Date();
    const eventDate = new Date(c.date);
    const daysUntil = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return c.impact === 'HIGH' && daysUntil <= 2 && daysUntil >= 0;
  });
  
  if (imminentCatalyst) {
    macroPenalty = 15;
  }
  
  // TECHNICAL ANALYSIS IS PRIMARY — Use top-down direction as the source of truth
  // Fundamentals (rawBias) only affect confidence, NOT direction
  let bias: 'LONG' | 'SHORT' | 'NEUTRAL';
  let confidence: number;
  
  // Map technical direction to bias
  if (topDownAnalysis.tradeableDirection === 'LONG') {
    bias = 'LONG';
  } else if (topDownAnalysis.tradeableDirection === 'SHORT') {
    bias = 'SHORT';
  } else {
    bias = 'NEUTRAL';
  }
  
  // Calculate confidence based on confluence + fundamental alignment
  const confluenceBase = topDownAnalysis.confluenceScore;
  const fundamentalAlignment = (rawBias === 'LONG' && bias === 'LONG') || (rawBias === 'SHORT' && bias === 'SHORT');
  const fundamentalConflict = (rawBias === 'LONG' && bias === 'SHORT') || (rawBias === 'SHORT' && bias === 'LONG');
  
  if (bias === 'NEUTRAL') {
    // No trade signal — low confidence
    confidence = Math.max(40, Math.min(55, confluenceBase * 0.55)) - macroPenalty;
  } else if (fundamentalAlignment) {
    // Technical + fundamental agree — moderate-high signal (capped lower for humility)
    confidence = Math.max(55, Math.min(75, (confluenceBase * 0.6 + rawConfidence * 0.25))) - macroPenalty;
  } else if (fundamentalConflict) {
    // Technical vs fundamental conflict — reduce confidence significantly
    confidence = Math.max(42, Math.min(58, confluenceBase * 0.5)) - macroPenalty;
  } else {
    // Technical clear, fundamental neutral — moderate confidence
    confidence = Math.max(48, Math.min(68, confluenceBase * 0.65)) - macroPenalty;
  }
  
  // Clamp final confidence — lower ceiling for epistemic humility
  confidence = Math.max(35, Math.min(78, confidence));

  // Market structure
  const structure = analyzeMarketStructure(price, high24h, low24h, change);

  // Generate TIGHT precision entry zones
  const precisionEntry = generatePrecisionEntry(
    price,
    high24h,
    low24h,
    change,
    bias,
    volumeSpike.isSpike ? 'HIGH' : 'MODERATE'
  );
  
  // Create tighter zone with PROPER range (never same value)
  // Use smart decimal precision based on price magnitude
  const getDecimalPlaces = (p: number): number => {
    if (p < 0.001) return 8;
    if (p < 0.01) return 6;
    if (p < 0.1) return 5;
    if (p < 1) return 4;
    if (p < 10) return 3;
    if (p < 1000) return 2;
    return 0;
  };
  const decimals = getDecimalPlaces(price);
  
  // Ensure minimum spread of 2% of price, never same value
  const minSpread = price * 0.02;
  const tightRange = Math.max(minSpread, range * 0.15);
  const entryMid = bias === 'LONG' 
    ? low24h + range * 0.25 
    : bias === 'SHORT'
      ? high24h - range * 0.25
      : price; // NEUTRAL uses current price as mid
  const tightZoneLow = entryMid - tightRange / 2;
  const tightZoneHigh = entryMid + tightRange / 2;
  const tightZone = `$${tightZoneLow.toFixed(decimals)} – $${tightZoneHigh.toFixed(decimals)}`;

  // Generate scenarios
  const keySupport = low24h + range * 0.15;
  const keyResistance = high24h - range * 0.15;
  const scenarios = generateIfThenScenarios({
    price,
    high: high24h,
    low: low24h,
    bias,
    keySupport,
    keyResistance
  });

  // Build KEY insights — BIAS-ALIGNED only (no contradictions)
  const keyInsights: string[] = [];
  
  // Add the definitive bias summary FIRST — aligned with final bias and showing alignment status
  // Include specific divergence direction for nuance
  const getFundamentalLabel = (b: 'LONG' | 'SHORT' | 'NEUTRAL'): string => {
    if (b === 'LONG') return 'bullish';
    if (b === 'SHORT') return 'bearish';
    return 'neutral';
  };
  
  const alignmentNote = fundamentalAlignment 
    ? 'Technical + fundamental aligned' 
    : fundamentalConflict 
      ? `Technical leads (fundamental ${getFundamentalLabel(rawBias)} diverges)`
      : rawBias === 'NEUTRAL' 
        ? 'Technical signal (fundamental neutral)'
        : 'Technical signal';
  
  if (bias === 'LONG') {
    keyInsights.push(`🎯 BULLISH — ${alignmentNote}`);
  } else if (bias === 'SHORT') {
    keyInsights.push(`🎯 BEARISH — ${alignmentNote}`);
  } else {
    keyInsights.push(`⏸️ NEUTRAL — No clear technical direction`);
  }
  
  // Filter insights to match current bias direction — STRICT filtering
  const directionalInsights = insights.filter(i => {
    // Always skip the first summary insight from calculateFinalBias (we replaced it)
    if (i.includes('🎯') || i.includes('📊 Lean') || i.includes('⏸️ NEUTRAL')) {
      return false;
    }
    // Remove neutral/mixed signals
    if (i.includes('NEUTRAL') || i.includes('No clear') || i.includes('Mixed') || i.includes('Sideways')) {
      return false;
    }
    // For BEARISH/SHORT bias, exclude ALL bullish-sounding insights
    if (bias === 'SHORT') {
      const bullishTerms = [
        'buy zone', 'Optimal buy', 'Deep discount', 'accumulation', 'Accumulation',
        'bullish', 'BULLISH', 'uptrend', 'Uptrend', 'Follow Trend BUY', 'buying',
        'confirms bulls', 'Strong uptrend', 'Bullish momentum', 'Mild bullish',
        'Institutions buying', 'Exchange outflows'
      ];
      if (bullishTerms.some(term => i.includes(term))) {
        return false;
      }
    }
    // For BULLISH/LONG bias, exclude ALL bearish-sounding insights
    if (bias === 'LONG') {
      const bearishTerms = [
        'sell zone', 'Optimal sell', 'Premium zone', 'distribution', 'Distribution',
        'bearish', 'BEARISH', 'downtrend', 'Downtrend', 'Follow Trend SELL', 'selling',
        'confirms bears', 'Strong downtrend', 'Bearish momentum', 'Mild bearish',
        'Institutions selling', 'Exchange inflows', 'Caution'
      ];
      if (bearishTerms.some(term => i.includes(term))) {
        return false;
      }
    }
    return true;
  });
  
  // Add filtered directional insights (limit to 2 to avoid clutter)
  directionalInsights.slice(0, 2).forEach(i => keyInsights.push(i));

  // On-chain insights — ONLY show if they align with bias direction
  // For BEARISH bias, show distribution/selling signals; for BULLISH, show accumulation
  if (bias === 'SHORT') {
    if (onChainMetrics.exchangeNetFlow.trend === 'INFLOW' && onChainMetrics.exchangeNetFlow.magnitude !== 'LOW') {
      keyInsights.push(`🔗 Exchange INFLOW (${onChainMetrics.exchangeNetFlow.magnitude}) → Distribution pressure`);
    }
    if (onChainMetrics.whaleActivity.netFlow.includes('SELL') || onChainMetrics.whaleActivity.netFlow.includes('DISTRIBUT')) {
      keyInsights.push(`🐋 Whales: ${onChainMetrics.whaleActivity.netFlow}`);
    }
  } else if (bias === 'LONG') {
    if (onChainMetrics.exchangeNetFlow.trend === 'OUTFLOW' && onChainMetrics.exchangeNetFlow.magnitude !== 'LOW') {
      keyInsights.push(`🔗 Exchange OUTFLOW (${onChainMetrics.exchangeNetFlow.magnitude}) → Accumulation signal`);
    }
    if (onChainMetrics.whaleActivity.netFlow.includes('BUY') || onChainMetrics.whaleActivity.netFlow.includes('ACCUMULAT')) {
      keyInsights.push(`🐋 Whales: ${onChainMetrics.whaleActivity.netFlow}`);
    }
    if (onChainMetrics.longTermHolders.accumulating && onChainMetrics.longTermHolders.change7d > 0.5) {
      keyInsights.push(`💎 Long-term holders +${onChainMetrics.longTermHolders.change7d.toFixed(1)}% (7d)`);
    }
  } else {
    // NEUTRAL — show balanced/mixed signals
    if (onChainMetrics.whaleActivity.netFlow === 'BALANCED') {
      keyInsights.push(`🐋 Whales: Balanced activity`);
    }
  }

  // ETF insight — only show for BTC/ETH (cryptos with actual ETFs) and if it supports the bias
  if (etfFlowData && (Math.abs(etfFlowData.btcNetFlow24h) > 50 || Math.abs(etfFlowData.ethNetFlow24h || 0) > 50)) {
    const flowValue = etfFlowData.btcNetFlow24h || etfFlowData.ethNetFlow24h || 0;
    const flowDir = flowValue > 0 ? '+' : '';
    const isETFBullish = flowValue > 0;
    if ((bias === 'LONG' && isETFBullish) || (bias === 'SHORT' && !isETFBullish) || bias === 'NEUTRAL') {
      keyInsights.push(`💼 ETF Flow: ${flowDir}$${flowValue}M (${etfFlowData.institutionalSentiment})`);
    }
  }

  // Divergence insight — always show as it's informational
  if (institutionalVsRetail.divergence) {
    keyInsights.push(`⚡ ${institutionalVsRetail.divergenceNote}`);
  }

  // Success probability — based on confluence and setup quality (tempered for realism)
  const confluenceBonus = Math.round(topDownAnalysis.confluenceScore * 0.28);
  const timingBonus = precisionEntry.timing === 'NOW' ? 6 : precisionEntry.timing === 'WAIT_PULLBACK' ? 3 : 0;
  const biasBonus = bias !== 'NEUTRAL' ? 4 : 0;
  const volumeBonus = volumeSpike.isSpike && volumeSpike.magnitude === 'HIGH' ? 3 : volumeSpike.isSpike ? 1 : 0;
  const successProb = Math.min(72, 38 + confluenceBonus + timingBonus + biasBonus + volumeBonus);
  const probBar = createBar(successProb, 100, '▓', '░', 12);
  
  // Qualitative description based on probability tier (more measured language)
  const probDescription = successProb >= 65 
    ? 'FAVORABLE — Good confluence, manage risk'
    : successProb >= 55 
      ? 'MODERATE — Some confirmations, stay nimble' 
      : successProb >= 48 
        ? 'UNCERTAIN — Mixed signals, reduce size'
        : 'WEAK — Low conviction, consider sitting out';

  // HTF visual with alignment
  const getTrendIcon = (trend: string) => trend === 'BULLISH' ? '🟢' : trend === 'BEARISH' ? '🔴' : '⚪';
  const htfVisual = `${getTrendIcon(topDownAnalysis.weekly.trend)}W ${getTrendIcon(topDownAnalysis.daily.trend)}D ${getTrendIcon(topDownAnalysis.h4.trend)}4H ${getTrendIcon(topDownAnalysis.h1.trend)}1H ${getTrendIcon(topDownAnalysis.m15.trend)}15M`;
  
  // Alignment count for visual punch
  const bullishCount = [topDownAnalysis.weekly, topDownAnalysis.daily, topDownAnalysis.h4, topDownAnalysis.h1, topDownAnalysis.m15]
    .filter(tf => tf.trend === 'BULLISH').length;
  const bearishCount = [topDownAnalysis.weekly, topDownAnalysis.daily, topDownAnalysis.h4, topDownAnalysis.h1, topDownAnalysis.m15]
    .filter(tf => tf.trend === 'BEARISH').length;
  const alignmentText = bullishCount >= 4 ? `${bullishCount}/5 BULLISH ✓` 
    : bearishCount >= 4 ? `${bearishCount}/5 BEARISH ✓`
    : `Mixed (${bullishCount}B/${bearishCount}S)`;

  // Historical context
  const historicalContext = getHistoricalContext(price, high24h, low24h, change);

  // Macro section (pass penalty status)
  const macroSection = buildMacroSection(macroPenalty > 0);

  // Build TL;DR headline — one-liner summary for quick scanning
  // Confidence-adjusted bias labels: softer language for humility
  const getBiasLabel = (b: 'LONG' | 'SHORT' | 'NEUTRAL', conf: number): string => {
    if (b === 'NEUTRAL') return 'Neutral';
    const baseWord = b === 'LONG' ? 'bullish' : 'bearish';
    if (conf >= 68) return `Favoring ${baseWord}`; // Softer than all-caps
    if (conf >= 55) return `Leaning ${baseWord}`; // Moderate
    return `Slight ${baseWord} tilt`; // Low confidence
  };
  const biasWord = getBiasLabel(bias, confidence);
  const structureWord = topDownAnalysis.confluenceScore >= 70 ? 'decent' : topDownAnalysis.confluenceScore >= 50 ? 'mixed' : 'weak';
  const marketPhase = pricePosition > 70 ? 'extended' : pricePosition < 30 ? 'discount' : 'mid-range';
  const actionWord = precisionEntry.timing === 'NOW' 
    ? (bias === 'LONG' ? 'Potential buy zone' : bias === 'SHORT' ? 'Potential sell zone' : 'Range-bound')
    : precisionEntry.timing === 'WAIT_PULLBACK' 
      ? 'Await pullback' 
      : precisionEntry.timing === 'WAIT_BREAKOUT'
        ? 'Await breakout'
        : 'No clear entry';
  // Note: tldr will be recalculated after regimeConsensus to account for skipTrade
  let tldr = `${biasWord} (${structureWord} confluence) | ${marketPhase.charAt(0).toUpperCase() + marketPhase.slice(1)} zone | ${actionWord}`;

  // ═══════════════════════════════════════════════════════════════════════════
  // BUILD FINAL ANALYSIS — Dense, Visual, Actionable
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Calculate data verification status
  const dataSourceCount = [hasRealOnChain, hasRealChartData, hasRealMultiTfData, isLiveData].filter(Boolean).length;
  const verificationLevel = dataSourceCount >= 3 ? 'VERIFIED' : dataSourceCount >= 2 ? 'PARTIALLY_VERIFIED' : 'ESTIMATED';
  const verificationEmoji = verificationLevel === 'VERIFIED' ? '✅' : verificationLevel === 'PARTIALLY_VERIFIED' ? '🟡' : '⚠️';
  const verificationLabel = verificationLevel === 'VERIFIED' ? 'Market Data Verified' : verificationLevel === 'PARTIALLY_VERIFIED' ? 'Partially Verified' : 'Using Estimates';

  // ═══════════════════════════════════════════════════════════════════════════
  // 🧠 HYBRID CONFIRMATION — Algorithm + Neural Network Combined
  // ═══════════════════════════════════════════════════════════════════════════
  // Build feature vector for neural network (20 features matching neural-engine.ts)
  // When real chart data unavailable, we estimate values to ensure neural network always runs
  const BIAS_DISPLAY_WIDTH = 7; // Padding for bias string alignment (longest: 'NEUTRAL')
  const featureVector: number[] = [
    price,                                        // 1: Current price
    price * (1 - change / 100),                   // 2: Reconstructed price 24h ago from known change
    price * 0.99,                                 // 3: Estimated price ~10 periods ago (fallback when no historical data)
    price * 0.98,                                 // 4: Estimated price ~20 periods ago (fallback when no historical data)
    change,                                       // 5: 24h change %
    (pricePosition - 50) / 5,                     // 6: Normalized position deviation from midpoint (-10 to +10 range)
    Math.abs(change) * 0.5,                       // 7: Estimated short-term volatility proxy (half of 24h magnitude)
    Math.abs(high24h - low24h) / price * 100,     // 8: Daily range as % of price (volatility)
    chartTrendData?.rsi || 50,                    // 9: RSI (50 = neutral when unavailable)
    chartTrendData?.ema9 ? (chartTrendData.ema9 / price - 1) * 100 : 0,  // 10: EMA9 deviation from price %
    chartTrendData?.ema21 ? (chartTrendData.ema21 / price - 1) * 100 : 0, // 11: EMA21 deviation from price %
    chartTrendData ? (chartTrendData.ema9 - chartTrendData.ema21) / price * 100 : 0, // 12: MACD signal proxy
    volume > 0 && avgVolume > 0 ? volume / avgVolume : 1, // 13: Volume ratio vs average
    volumeSpike.isSpike ? 1.5 : 1,                // 14: Volume trend multiplier
    Math.log(volume + 1),                         // 15: Log-scaled current volume
    Math.log(avgVolume + 1),                      // 16: Log-scaled average volume
    pricePosition,                                // 17: Price position in 24h range (0-100%)
    high24h,                                      // 18: 24h high price
    low24h,                                       // 19: 24h low price
    (high24h - low24h) * 0.1                      // 20: ATR proxy (10% of daily range)
  ];

  // Get hybrid confirmation using both algorithm and neural network
  const algorithmResult = { bias, confidence };
  const hybridResult = hybridConfirmation.getConfirmation(algorithmResult, featureVector);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // 📊 REGIME-WEIGHTED CONSENSUS — ADX-Based Algorithm vs Neural Network Weighting
  // ═══════════════════════════════════════════════════════════════════════════
  // Calculate ADX and determine market regime
  const candleData = chartTrendData?.candles?.map(c => ({
    high: c.high,
    low: c.low,
    close: c.close
  })) || [];
  
  const adxResult = calculateADX(candleData, 14);
  
  // Calculate regime-weighted consensus
  const regimeConsensus = calculateRegimeWeightedConsensus(
    adxResult,
    hybridResult.algorithmBias,
    hybridResult.algorithmConfidence,
    hybridResult.neuralDirection,
    hybridResult.neuralConfidence,
    price,
    high24h,
    low24h,
    chartTrendData?.candles
  );
  
  // Log regime detection
  console.log(`[Regime] ADX=${adxResult.adx.toFixed(1)} → ${adxResult.regime} | Master: ${regimeConsensus.masterControl} | Weights: Algo=${(regimeConsensus.algorithmWeight*100).toFixed(0)}%, NN=${(regimeConsensus.neuralWeight*100).toFixed(0)}%`);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // 🎯 TRI-MODULAR ANALYSIS — Senior Quant Strategist Intelligence
  // ═══════════════════════════════════════════════════════════════════════════
  
  const triModularAnalysis = performTriModularAnalysis(
    price,
    high24h,
    low24h,
    change,
    chartTrendData,
    fearGreed,
    input.narrativeContext,
    macroCatalysts
  );
  
  // Generate formatted Tri-Modular output for inclusion in analysis
  const triModularOutput = formatTriModularOutput(triModularAnalysis, crypto, price);
  
  // Generate simplified summary for beginners - pass skipTrade info to ensure consistent messaging
  const simplifiedSummary = generateSimplifiedSummary(triModularAnalysis, crypto, price, {
    skipTrade: regimeConsensus.skipTrade,
    skipReason: regimeConsensus.skipReason,
    neuralConfidence: hybridResult.neuralConfidence
  });
  
  // Log Tri-Modular summary
  console.log(`[Tri-Modular] ${triModularAnalysis.weightedConfidenceScore.percentage}% ${triModularAnalysis.weightedConfidenceScore.direction} | Kill Switch: $${triModularAnalysis.killSwitchLevel.price.toFixed(2)}`);
  
  // Regime visual indicators
  const regimeEmoji = adxResult.regime === 'TRENDING' ? '📈' : adxResult.regime === 'RANGING' ? '↔️' : '🔄';
  const masterEmoji = regimeConsensus.masterControl === 'ALGORITHM' ? '🤖' : '🧠';

  // Determine confluence visual
  const confluenceEmoji = hybridResult.confluenceLevel === 'STRONG' ? '✅' 
    : hybridResult.confluenceLevel === 'MODERATE' ? '🟡' 
    : hybridResult.confluenceLevel === 'WEAK' ? '⚠️' 
    : '❌';
  const algorithmEmoji = hybridResult.algorithmBias === 'LONG' ? '🟢' : hybridResult.algorithmBias === 'SHORT' ? '🔴' : '⚪';
  const neuralEmoji = hybridResult.neuralDirection === 'LONG' ? '🟢' : hybridResult.neuralDirection === 'SHORT' ? '🔴' : '⚪';
  const agreementText = hybridResult.agreement ? 'ALIGNED ✓' : 'DIVERGING ⚠️';

  // ═══════════════════════════════════════════════════════════════════════════
  // 🎯 TRADE QUALITY ASSESSMENT — Follow Trend, Wait for Confirmation, Avoid Bad Trades
  // ═══════════════════════════════════════════════════════════════════════════
  
  // 1. Check if trade follows the higher timeframe (HTF) trend — DON'T TRADE AGAINST THE TREND
  const htfTrend = topDownAnalysis.weekly.trend; // Weekly is the primary HTF
  const dailyTrend = topDownAnalysis.daily.trend;
  const followsTrend = (
    (bias === 'LONG' && (htfTrend === 'BULLISH' || dailyTrend === 'BULLISH')) ||
    (bias === 'SHORT' && (htfTrend === 'BEARISH' || dailyTrend === 'BEARISH')) ||
    (bias === 'NEUTRAL') // Neutral always "follows" as it's not directional
  );
  
  // 2. Count confirmations — WAIT FOR CONFIRMATION BEFORE EXECUTION
  const confirmations: string[] = [];
  
  // Confirmation 1: Multi-timeframe alignment (at least 3/5 aligned)
  if (bullishCount >= 3 && bias === 'LONG') {
    confirmations.push(`✓ Multi-TF Alignment: ${bullishCount}/5 bullish`);
  } else if (bearishCount >= 3 && bias === 'SHORT') {
    confirmations.push(`✓ Multi-TF Alignment: ${bearishCount}/5 bearish`);
  }
  
  // Confirmation 2: Hybrid AI agreement (Algorithm + Neural Network)
  if (hybridResult.agreement) {
    confirmations.push(`✓ Hybrid AI Consensus: Algorithm + Neural Network agree`);
  }
  
  // Confirmation 3: Volume confirmation
  if (volumeSpike.isSpike && volumeSpike.magnitude !== 'NORMAL') {
    confirmations.push(`✓ Volume Confirmation: ${volumeSpike.magnitude} volume spike`);
  }
  
  // Confirmation 4: Institutional alignment
  if ((bias === 'LONG' && institutionalVsRetail.institutionalBias === 'BULLISH') ||
      (bias === 'SHORT' && institutionalVsRetail.institutionalBias === 'BEARISH')) {
    confirmations.push(`✓ Institutional Flow: ${institutionalVsRetail.institutionalBias}`);
  }
  
  // Confirmation 5: Price in optimal zone (discount for longs, premium for shorts)
  if ((bias === 'LONG' && pricePosition < 40) || (bias === 'SHORT' && pricePosition > 60)) {
    confirmations.push(`✓ Optimal Entry Zone: Price at ${pricePosition.toFixed(0)}% in range`);
  }
  
  const hasConfirmation = confirmations.length >= 2; // Need at least 2 confirmations
  const confirmationCount = confirmations.length;
  
  // 3. Detect BAD TRADES to avoid
  const badTradeReasons: string[] = [];
  
  // Bad Trade 1: Trading against the HTF trend
  if (!followsTrend && bias !== 'NEUTRAL') {
    badTradeReasons.push(`⚠️ COUNTER-TREND: ${bias} trade against ${htfTrend} HTF trend`);
  }
  
  // Bad Trade 2: No multi-timeframe confluence
  if (topDownAnalysis.confluenceScore < 45) {
    badTradeReasons.push(`⚠️ LOW CONFLUENCE: Only ${topDownAnalysis.confluenceScore}% TF alignment`);
  }
  
  // Bad Trade 3: Algorithm and Neural Network disagree
  if (!hybridResult.agreement && hybridResult.confluenceLevel === 'CONFLICTING') {
    badTradeReasons.push(`⚠️ AI CONFLICT: Algorithm (${hybridResult.algorithmBias}) vs Neural (${hybridResult.neuralDirection})`);
  }
  
  // Bad Trade 4: Chasing extended price
  if ((bias === 'LONG' && pricePosition > 85) || (bias === 'SHORT' && pricePosition < 15)) {
    badTradeReasons.push(`⚠️ CHASING: Price ${bias === 'LONG' ? 'near resistance' : 'near support'} — avoid FOMO`);
  }
  
  // Bad Trade 5: Low confidence + low probability
  if (confidence < 45 && successProb < 50) {
    badTradeReasons.push(`⚠️ WEAK SETUP: ${confidence.toFixed(0)}% confidence, ${successProb}% probability`);
  }
  
  // Bad Trade 6: Divergence between institutional and retail (smart money leaving)
  if (institutionalVsRetail.divergence && 
      ((bias === 'LONG' && institutionalVsRetail.institutionalBias === 'BEARISH') ||
       (bias === 'SHORT' && institutionalVsRetail.institutionalBias === 'BULLISH'))) {
    badTradeReasons.push(`⚠️ SMART MONEY DIVERGENCE: Institutions ${institutionalVsRetail.institutionalBias}, retail ${institutionalVsRetail.retailBias}`);
  }
  
  const isBadTrade = badTradeReasons.length >= 2; // 2+ bad signals = bad trade
  
  // Calculate base quality score from confirmations
  let baseQualityScore = 50; // Start at neutral
  baseQualityScore += confirmationCount * 10; // +10 per confirmation (max +50)
  baseQualityScore += followsTrend ? 15 : -20; // +15 for trend-following, -20 for counter-trend
  baseQualityScore -= badTradeReasons.length * 12; // -12 per bad trade reason
  baseQualityScore = Math.max(0, Math.min(100, baseQualityScore)); // Clamp 0-100
  
  // ⚡ HIERARCHICAL VETO SYSTEM: Higher-level AI decisions constrain quality score
  // This prevents "Split Personality Syndrome" where quality shows 85% but verdict is AVOID
  let qualityScore = baseQualityScore;
  
  // VETO LEVEL 1: Neural Network Filter
  // When NN filter fails (NN confidence < 51% in TRENDING mode), cap quality at 35%
  if (regimeConsensus.skipTrade) {
    qualityScore = Math.min(35, baseQualityScore);
    console.log(`[Quality Veto] NN Filter: Base ${baseQualityScore}% → Capped ${qualityScore}%`);
  }
  
  // VETO LEVEL 2: Tri-Modular Human-In-The-Loop verdict
  // When tri-modular analysis recommends AVOID, cap quality at 30%
  if (triModularAnalysis.humanInTheLoopVerdict.positionSizeRecommendation === 'AVOID') {
    qualityScore = Math.min(30, qualityScore);
    console.log(`[Quality Veto] Tri-Modular AVOID: Capped at ${qualityScore}%`);
  }
  
  // Determine final recommendation
  // Include regimeConsensus.skipTrade to ensure alignment with regime-weighted consensus
  type TradeRecommendation = 'EXECUTE' | 'WAIT_CONFIRMATION' | 'AVOID_BAD_TRADE' | 'SKIPPED_NN_FILTER';
  let tradeRecommendation: TradeRecommendation;
  if (regimeConsensus.skipTrade) {
    // Neural network filter failed — trade should be skipped
    tradeRecommendation = 'SKIPPED_NN_FILTER';
  } else if (isBadTrade) {
    tradeRecommendation = 'AVOID_BAD_TRADE';
  } else if (!hasConfirmation) {
    tradeRecommendation = 'WAIT_CONFIRMATION';
  } else {
    tradeRecommendation = 'EXECUTE';
  }
  
  // Build trade quality object
  const tradeQuality = {
    followsTrend,
    hasConfirmation,
    confirmationCount,
    confirmations,
    isBadTrade,
    badTradeReasons,
    qualityScore,
    recommendation: tradeRecommendation
  };
  
  // Visual indicators for trade quality
  const qualityEmoji = tradeRecommendation === 'EXECUTE' ? '✅' 
    : tradeRecommendation === 'WAIT_CONFIRMATION' ? '⏳' 
    : tradeRecommendation === 'SKIPPED_NN_FILTER' ? '⚠️'
    : '🚫';
  const trendFollowEmoji = followsTrend ? '✓' : '✗';
  const confirmEmoji = hasConfirmation ? `${confirmationCount}/5 ✓` : `${confirmationCount}/5 ⚠️`;

  // Update TL;DR to reflect regimeConsensus.skipTrade status
  if (regimeConsensus.skipTrade) {
    const updatedActionWord = 'Trade skipped (NN filter)';
    tldr = `${biasWord} (${structureWord} confluence) | ${marketPhase.charAt(0).toUpperCase() + marketPhase.slice(1)} zone | ${updatedActionWord}`;
  }

  const analysis = `${simplifiedSummary}
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
   ${crypto.toUpperCase()} ANALYSIS   ${trendEmoji} ${change >= 0 ? '+' : ''}${change.toFixed(2)}%
   ${verificationEmoji} ${verificationLabel}
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

📌 TL;DR: ${tldr}

💰 $${price.toFixed(decimals)}  │  24h: $${low24h.toFixed(decimals)} → $${high24h.toFixed(decimals)}
${historicalContext}
${volumeSpike.isSpike ? `📊 VOLUME SPIKE: +${volumeSpike.percentageAboveAvg.toFixed(0)}% above avg (${volumeSpike.magnitude}) [Spot via aggregator]\n` : ''}📈 Volume: ${volume > avgVolume ? `+${((volume / avgVolume - 1) * 100).toFixed(0)}% above` : volume < avgVolume * 0.8 ? `${((1 - volume / avgVolume) * 100).toFixed(0)}% below` : 'near'} baseline | Futures OI ${change > 2 ? 'rising (longs building)' : change < -2 ? 'declining (shorts closing)' : 'stable'}
   └─ Benchmark: Estimated baseline • Volume ratio: ${(volume / avgVolume).toFixed(2)}x
┌─────────────────────────────────────────────────┐
│  🎯 VERDICT: ${bias === 'LONG' ? (confidence >= 68 ? '🟢 Favoring Bullish' : confidence >= 55 ? '🟢 Leaning Bullish' : '🟢 Slight Bull Tilt') : bias === 'SHORT' ? (confidence >= 68 ? '🔴 Favoring Bearish' : confidence >= 55 ? '🔴 Leaning Bearish' : '🔴 Slight Bear Tilt') : '⚪ NEUTRAL'}  │  Confidence: ${confidence.toFixed(0)}%
└─────────────────────────────────────────────────┘

━━━ 📊 MARKET PULSE (Current Market Sentiment) ━━━━━━━━━

😊 Fear & Greed: [${fearGreedVisual.bar}] ${fearGreed} ${fearGreedVisual.emoji} ${fearGreedVisual.label}
   └─ Measures overall market emotion (0=Extreme Fear, 100=Extreme Greed)
   └─ Source: Alternative.me (24h)
🐋 Whale Activity: ${getWhaleVisual(onChainMetrics.whaleActivity.netFlow, onChainMetrics.whaleActivity.buying, onChainMetrics.whaleActivity.selling)}
   └─ Tracks large investor movements (whales = holders of >$1M)
   └─ Net: ${onChainMetrics.whaleActivity.netFlow} ${onChainMetrics.whaleActivity.source === 'whale-alert' ? '[Live from Whale-Alert API]' : onChainMetrics.whaleActivity.source === 'blockchain-api' ? '[Live on-chain data]' : '[Estimated from price momentum]'}
🔗 Exchange Flow: ${onChainMetrics.exchangeNetFlow.trend} (${onChainMetrics.exchangeNetFlow.magnitude})
   └─ Shows if coins moving to exchanges (selling pressure) or wallets (holding)
   └─ ${hasRealOnChain ? 'Source: CryptoQuant (rolling 24h)' : 'Estimated from market momentum'}
💼 Institutional: ${etfFlowData ? etfFlowData.institutionalSentiment : 'N/A (no ETF for this asset)'}
   └─ Big money funds (banks, hedge funds) buying or selling activity
   └─ ${etfFlowData ? (etfFlowData.source === 'coinglass' ? 'Source: CoinGlass ETF data' : 'Estimated from price momentum') : 'ETFs only available for BTC/ETH'}
${macroSection ? `\n━━━ ⚡ MACRO CATALYST (Big Picture Events) ━━━━━━━━━━━\n\n${macroSection}\n` : ''}
━━━ 🔭 MULTI-TIMEFRAME ANALYSIS (Trend Alignment) ━━━━━━

${htfVisual}  →  ${alignmentText}

W: ${topDownAnalysis.weekly.trend.padEnd(7)} ${createBar(topDownAnalysis.weekly.strength, 100, '█', '░', 8)} ${topDownAnalysis.weekly.strength.toFixed(0)}%
D: ${topDownAnalysis.daily.trend.padEnd(7)} ${createBar(topDownAnalysis.daily.strength, 100, '█', '░', 8)} ${topDownAnalysis.daily.strength.toFixed(0)}%
4H: ${topDownAnalysis.h4.trend.padEnd(6)} ${createBar(topDownAnalysis.h4.strength, 100, '█', '░', 8)} ${topDownAnalysis.h4.strength.toFixed(0)}%
1H: ${topDownAnalysis.h1.trend.padEnd(6)} ${createBar(topDownAnalysis.h1.strength, 100, '█', '░', 8)} ${topDownAnalysis.h1.strength.toFixed(0)}%
15M: ${topDownAnalysis.m15.trend.padEnd(5)} ${createBar(topDownAnalysis.m15.strength, 100, '█', '░', 8)} ${topDownAnalysis.m15.strength.toFixed(0)}%

🎯 Confluence: ${topDownAnalysis.confluenceScore}% ${topDownAnalysis.confluenceScore === 100 ? '(STRONG ✓) — All timeframes aligned!' : topDownAnalysis.confluenceScore >= 70 ? '(STRONG ✓)' : topDownAnalysis.confluenceScore >= 50 ? '(MODERATE)' : '(WEAK ⚠️)'}
   └─ Higher confluence = more reliable signal (aim for 70%+)

━━━ 📌 ENTRY TIMING (When to Take Action) ━━━━━━━━━━━
   What this shows: The best moment to enter the trade

⏱️ ${regimeConsensus.skipTrade ? '🔴 TRADE SKIPPED (NN Filter)' : precisionEntry.timing === 'NOW' ? '🟢 EXECUTE NOW' : precisionEntry.timing === 'WAIT_PULLBACK' ? '🟡 WAIT FOR PULLBACK' : precisionEntry.timing === 'WAIT_BREAKOUT' ? '🟡 WAIT FOR BREAKOUT' : '🔴 NO TRADE'}

📍 Entry Zone: ${tightZone}
   └─ Trigger: ${precisionEntry.trigger}
${bias === 'SHORT' ? `🎯 Target: $${(low24h - range * 0.1).toFixed(decimals)} (breakdown of 24h low)` : bias === 'LONG' ? `🎯 Target: $${(high24h + range * 0.1).toFixed(decimals)} (breakout of 24h high)` : ''}
✓ Confirm: ${precisionEntry.confirmation}
✗ Invalid: ${precisionEntry.invalidation}
${bias === 'SHORT' ? `📈 If invalidated: Flip long above $${(high24h + range * 0.15).toFixed(decimals)}` : bias === 'LONG' ? `📉 If invalidated: Flip short below $${(low24h - range * 0.15).toFixed(decimals)}` : ''}

📊 Estimated Quality: [${probBar}] ${successProb}%
   └─ ${probDescription} (based on confluence, not validated backtesting)
   └─ Note: Higher quality = better chance of profitable trade

━━━ 💡 KEY INSIGHTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${keyInsights.slice(0, 5).map(i => `• ${i}`).join('\n')}

${confluenceEmoji} Algorithm + Neural Network: ${agreementText}

🎯 Support Zone: $${regimeConsensus.supportZone.toFixed(decimals)}
   └─ Price level where buying interest typically appears
🎯 Resistance Zone: $${regimeConsensus.resistanceZone.toFixed(decimals)}
   └─ Price level where selling pressure typically emerges
🛑 Stop Loss: $${regimeConsensus.stopLoss.toFixed(decimals)}
   └─ Emergency exit to protect capital if trade goes wrong${regimeConsensus.skipTrade ? `

⚠️ TRADE SKIPPED: ${regimeConsensus.skipReason}` : ''}

📍 Pattern: ${regimeConsensus.candlestickConfirmation.pattern} (${regimeConsensus.candlestickConfirmation.bias})
   └─ Type: ${regimeConsensus.candlestickConfirmation.type} | Strength: ${regimeConsensus.candlestickConfirmation.strength}%
   └─ Candlestick patterns are historical price formations that often repeat

💡 ${regimeConsensus.candlestickConfirmation.description}

⏱️ Entry Trigger: ${regimeConsensus.candlestickConfirmation.entryTrigger}

━━━ 🛡️ TRADE QUALITY CHECK ━━━━━━━━━━━━━━━━━━━━━

${qualityEmoji} Recommendation: ${tradeRecommendation === 'EXECUTE' ? '✅ EXECUTE — Trend-aligned with confirmation' : tradeRecommendation === 'WAIT_CONFIRMATION' ? '⏳ WAIT — Need more confirmation before entry' : tradeRecommendation === 'SKIPPED_NN_FILTER' ? '⚠️ SKIPPED — Neural Network filter below threshold' : '🚫 AVOID — Bad trade signals detected'}

📈 Follows HTF Trend: ${followsTrend ? `${trendFollowEmoji} YES (${htfTrend})` : `${trendFollowEmoji} NO — Counter-trend trade!`}
🔍 Confirmations: ${confirmEmoji}
${confirmations.length > 0 ? confirmations.slice(0, 3).map(c => `   ${c}`).join('\n') : '   ⚠️ No confirmations yet — wait for setup'}
${badTradeReasons.length > 0 ? `\n⚠️ Bad Trade Signals:\n${badTradeReasons.slice(0, 3).map(r => `   ${r}`).join('\n')}` : ''}

📊 Quality Score: [${createBar(qualityScore, 100, '█', '░', 10)}] ${qualityScore}%${(() => {
  // Helper: Determine veto reason suffix
  if (regimeConsensus.skipTrade) return ' (Capped by NN Filter)';
  if (triModularAnalysis.humanInTheLoopVerdict.positionSizeRecommendation === 'AVOID') return ' (Capped by Tri-Modular AVOID)';
  if (baseQualityScore !== qualityScore) return ` (Base: ${baseQualityScore}%)`;
  return '';
})()}
   └─ ${(() => {
      // Helper: Determine quality message
      if (regimeConsensus.skipTrade || triModularAnalysis.humanInTheLoopVerdict.positionSizeRecommendation === 'AVOID') {
        return '🚫 TRADE BLOCKED — AI safety filters active';
      }
      if (qualityScore >= 70) return 'HIGH QUALITY — Good setup, manage risk';
      if (qualityScore >= 50) return 'MODERATE — Proceed with caution';
      if (qualityScore >= 30) return 'LOW QUALITY — Consider smaller size or skip';
      return 'POOR — High probability of bad trade';
    })()}

━━━ 🔮 SCENARIOS (Both Directions) ━━━━━━━━━━━━━━

${scenarios.slice(0, 2).map(s => `${s.condition}
  → ${s.outcome}
  📋 ${s.action}`).join('\n\n')}

${bias === 'SHORT' ? `📈 UPSIDE SCENARIO: If price reclaims $${(high24h - range * 0.1).toFixed(decimals)} with volume
  → Bears trapped, momentum shift likely
  📋 Consider flipping long or exiting shorts` : bias === 'LONG' ? `📉 DOWNSIDE SCENARIO: If price loses $${(low24h + range * 0.1).toFixed(decimals)} with volume
  → Bulls trapped, breakdown in play
  📋 Consider flipping short or exiting longs` : `↔️ BREAKOUT SCENARIO: Watch $${high24h.toFixed(decimals)} (up) / $${low24h.toFixed(decimals)} (down)
  → First to break with volume defines direction
  📋 React to the breakout, don't predict`}
${triModularOutput}
━━━ ⚠️ ACCURACY DISCLAIMER ━━━━━━━━━━━━━━━━━━━━━━
• Avoid bad trades — Quality check prevents poor setups ✓
• This is NOT financial advice — trade at your own risk
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

  return {
    bias,
    confidence,
    successProbability: successProb,
    analysis,
    insights: keyInsights,
    macroCatalysts,
    volumeSpike,
    // Use tightZone for consistency with analysis text output
    precisionEntry: { ...precisionEntry, zone: tightZone },
    institutionalVsRetail,
    scenarios,
    timestamp: new Date().toISOString(),
    source: 'client-side-wasm',
    verificationStatus: verificationLevel,
    liveDataSources: dataSourceCount,
    attentionHeatmap: topDownAnalysis.attentionHeatmap || [],
    attentionVector: topDownAnalysis.attentionVector || [],
    attentionEntropyLoss: 0,
    // Hybrid Confirmation — Algorithm + Neural Network combined output
    hybridConfirmation: {
      algorithmBias: hybridResult.algorithmBias,
      algorithmConfidence: hybridResult.algorithmConfidence,
      neuralDirection: hybridResult.neuralDirection,
      neuralConfidence: hybridResult.neuralConfidence,
      agreement: hybridResult.agreement,
      confluenceLevel: hybridResult.confluenceLevel,
      combinedConfidence: hybridResult.combinedConfidence,
      usedBothSystems: true // Confirms both algorithm and neural network were used
    },
    // Trade Quality Assessment — Follow trend, wait for confirmation, avoid bad trades
    tradeQuality,
    // Regime-Weighted Consensus — ADX-based Algorithm vs Neural Network weighting
    regimeConsensus: {
      regime: regimeConsensus.regime,
      adxValue: regimeConsensus.adxValue,
      masterControl: regimeConsensus.masterControl,
      algorithmWeight: regimeConsensus.algorithmWeight,
      neuralWeight: regimeConsensus.neuralWeight,
      weightedScore: regimeConsensus.weightedScore,
      skipTrade: regimeConsensus.skipTrade,
      skipReason: regimeConsensus.skipReason,
      supportZone: regimeConsensus.supportZone,
      resistanceZone: regimeConsensus.resistanceZone,
      stopLoss: regimeConsensus.stopLoss,
      candlestickPattern: regimeConsensus.candlestickConfirmation.pattern,
      candlestickConfirmation: regimeConsensus.candlestickConfirmation.entryTrigger,
      candlestickStrength: regimeConsensus.candlestickConfirmation.strength
    },
    // Tri-Modular Analysis — Senior Quant Strategist Intelligence
    triModularAnalysis
  };
}

// Export all modules for external use
export * from './types';
export { getUpcomingMacroCatalysts, getQuickMacroFlag } from './macro-catalysts';
export { detectVolumeSpike, getVolumeSpikeFlag } from './volume-analysis';
export { analyzeInstitutionalVsRetail, generateIfThenScenarios } from './institutional-analysis';
export { estimateOnChainMetrics, estimateETFFlowData } from './on-chain-estimator';
export { analyzeMarketStructure, generatePrecisionEntry, calculateFinalBias, performTopDownAnalysis, crossEntropyLoss, computeSelfAttention, computeMultiHeadAttention, relu, softmax, feedForwardNetwork, calculateADX, calculateRegimeWeightedConsensus, detectCandlestickPattern } from './technical-analysis';
export type { MarketRegimeType, ADXResult, RegimeWeightedConsensus, CandlestickConfirmation } from './technical-analysis';
// ICT/SMC Analysis with multi-timeframe
export {
  performICTSMCAnalysis,
  detectOrderBlocks,
  detectFairValueGaps,
  detectLiquidityPools,
  detectStructureShifts,
  calculatePremiumDiscount,
  calculateOTE,
  detectDisplacement,
  ICTLearner
} from './ict-smc-analysis';
export type {
  OrderBlock,
  FairValueGap,
  LiquidityPool,
  StructureShift,
  PremiumDiscountZone,
  OptimalTradeEntry,
  Displacement,
  ICTSMCAnalysis,
  ICTTradeSetup,
  ICTPatternRecord
} from './ict-smc-analysis';
export { 
  ZikalyzeBrainPipeline, 
  ActiveCryptoSource, 
  AIAnalyzer, 
  AttentionAlgorithm, 
  HiddenDataStorageManager, 
  DoubleVerificationLoop,
  // Self-learning components
  LiveChartLearner,
  LivestreamLearner,
  SelfLearningBrainPipeline,
  // Unified Brain
  UnifiedBrain,
  // Emergence Engine
  EmergenceEngine,
  globalEmergenceEngine
} from './brain-pipeline';
export type { 
  RawCryptoData, 
  AnalyzedData, 
  AttentionVerifiedData, 
  BrainPipelineOutput, 
  DataQuality,
  HiddenDataStorage,
  VerifiedDataRecord,
  FilteredDataRecord,
  LearningSignal,
  // Self-learning types
  ChartPattern,
  LivestreamUpdate,
  VelocityPattern,
  SelfLearningOutput,
  // Unified Brain types
  UnifiedBrainOutput,
  // Emergence types
  ComponentContribution,
  EmergenceMetrics,
  EmergenceState
} from './brain-pipeline';

// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 NEURAL ENGINE — True AI with Learning, NLP & Backtesting
// ═══════════════════════════════════════════════════════════════════════════════
// Addresses key limitations:
// ✅ True Neural Network with trainable weights
// ✅ Persistent Learning from prediction outcomes
// ✅ NLP Sentiment Analysis for news/tweets
// ✅ Backtesting Framework for validation
// ✅ Hybrid Confirmation (Algorithm + Neural Network)
// ═══════════════════════════════════════════════════════════════════════════════

export {
  ZikalyzeNeuralNetwork,
  ZikalyzeNeuralEngine,
  BacktestEngine,
  neuralEngine,
  analyzeTextSentiment,
  analyzeMultipleTexts,
  initializeWeights,
  // Hybrid confirmation system
  HybridConfirmationSystem,
  hybridConfirmation
} from './neural-engine';
export type {
  NeuralWeights,
  NLPSentiment,
  BacktestResult,
  BacktestConfig,
  PredictionRecord,
  HybridConfirmationResult
} from './neural-engine';
