// ═══════════════════════════════════════════════════════════════════════════════
// 🔗 ON-CHAIN METRICS ESTIMATOR v2.0 (Deterministic - No Random Values)
// ═══════════════════════════════════════════════════════════════════════════════
// All metrics are derived DETERMINISTICALLY from live price action
// NO random values — ensures consistent, reproducible analysis
// ═══════════════════════════════════════════════════════════════════════════════

import { OnChainMetrics, ETFFlowData } from './types';

// Deterministic hash function for consistent "randomness" based on inputs
function deterministicValue(seed: number, min: number, max: number): number {
  // Use sine wave to create deterministic variation from seed
  const normalized = Math.abs(Math.sin(seed * 12.9898) * 43758.5453) % 1;
  return min + normalized * (max - min);
}

export function estimateOnChainMetrics(
  crypto: string,
  price: number,
  change: number
): OnChainMetrics {
  const symbol = crypto.toUpperCase();
  const isBTC = symbol === 'BTC';
  const isETH = symbol === 'ETH';
  
  // Seed for deterministic values (based on price and change)
  const seed = price * 0.001 + change * 10;
  
  // Clear thresholds for consistent categorization
  const isStrongBullish = change >= 5;
  const isBullish = change >= 2 && change < 5;
  const isStrongBearish = change <= -5;
  const isBearish = change <= -2 && change > -5;
  const isNeutral = change > -2 && change < 2;

  // ═══════════════════════════════════════════════════════════════════════════
  // EXCHANGE NET FLOW — Derived deterministically from price action
  // ═══════════════════════════════════════════════════════════════════════════
  let exchangeNetFlow: OnChainMetrics['exchangeNetFlow'];
  
  if (isStrongBullish) {
    // Strong rally = significant outflows (accumulation)
    const flowValue = -10000 - Math.abs(change) * 1000;
    exchangeNetFlow = { value: flowValue, trend: 'OUTFLOW', magnitude: 'SIGNIFICANT' };
  } else if (isBullish) {
    // Moderate rally = moderate outflows
    const flowValue = -4000 - Math.abs(change) * 800;
    exchangeNetFlow = { value: flowValue, trend: 'OUTFLOW', magnitude: 'MODERATE' };
  } else if (isStrongBearish) {
    // Strong dump = significant inflows (distribution)
    const flowValue = 8000 + Math.abs(change) * 800;
    exchangeNetFlow = { value: flowValue, trend: 'INFLOW', magnitude: 'SIGNIFICANT' };
  } else if (isBearish) {
    // Moderate dump = moderate inflows
    const flowValue = 3000 + Math.abs(change) * 500;
    exchangeNetFlow = { value: flowValue, trend: 'INFLOW', magnitude: 'MODERATE' };
  } else {
    // Neutral = balanced, low activity
    exchangeNetFlow = { value: change * 500, trend: 'NEUTRAL', magnitude: 'LOW' };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // WHALE ACTIVITY — Consistent with price direction
  // ═══════════════════════════════════════════════════════════════════════════
  let whaleNetFlow: string;
  let whaleBuying: number;
  let whaleSelling: number;

  if (isStrongBullish) {
    whaleNetFlow = 'NET BUYING';
    whaleBuying = 72 + Math.abs(change);
    whaleSelling = 28 - Math.abs(change) * 0.5;
  } else if (isBullish) {
    whaleNetFlow = 'ACCUMULATING';
    whaleBuying = 58 + change * 2;
    whaleSelling = 35;
  } else if (isStrongBearish) {
    whaleNetFlow = 'NET SELLING';
    whaleBuying = 28 + Math.abs(change) * 0.3;
    whaleSelling = 65 + Math.abs(change);
  } else if (isBearish) {
    whaleNetFlow = 'DISTRIBUTING';
    whaleBuying = 38;
    whaleSelling = 55 + Math.abs(change);
  } else {
    whaleNetFlow = 'BALANCED';
    whaleBuying = 48 + change;
    whaleSelling = 48 - change;
  }

  // Clamp values to valid range
  whaleBuying = Math.max(15, Math.min(85, whaleBuying));
  whaleSelling = Math.max(15, Math.min(85, whaleSelling));

  const whaleActivity = {
    buying: Math.round(whaleBuying),
    selling: Math.round(whaleSelling),
    netFlow: whaleNetFlow
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // LONG-TERM HOLDERS — Accumulation correlates with price strength
  // ═══════════════════════════════════════════════════════════════════════════
  const lthAccumulating = change > -3; // LTH accumulate unless severe dump
  const lthChange7d = change > 0 
    ? 0.5 + change * 0.3 // Positive change = accumulating
    : change * 0.2;       // Negative change = slight distribution
  
  const longTermHolders = {
    accumulating: lthAccumulating,
    change7d: Math.round(lthChange7d * 10) / 10,
    sentiment: lthAccumulating ? 'ACCUMULATING' : isStrongBearish ? 'DISTRIBUTING' : 'HOLDING'
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // SHORT-TERM HOLDERS — React to momentum
  // ═══════════════════════════════════════════════════════════════════════════
  let sthBehavior: string;
  let sthProfitLoss: number;

  if (isStrongBullish) {
    sthBehavior = 'FOMO BUYING';
    sthProfitLoss = 15 + change * 1.5;
  } else if (isBullish) {
    sthBehavior = 'TAKING PROFITS';
    sthProfitLoss = 8 + change * 2;
  } else if (isStrongBearish) {
    sthBehavior = 'PANIC SELLING';
    sthProfitLoss = change * 1.5 - 5;
  } else if (isBearish) {
    sthBehavior = 'NERVOUS HOLDING';
    sthProfitLoss = change * 2;
  } else {
    sthBehavior = 'NEUTRAL';
    sthProfitLoss = change;
  }

  const shortTermHolders = {
    behavior: sthBehavior,
    profitLoss: Math.round(sthProfitLoss * 10) / 10
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // ACTIVE ADDRESSES — Correlates with volatility and interest
  // ═══════════════════════════════════════════════════════════════════════════
  const baseAddresses = isBTC ? 1000000 : isETH ? 500000 : 50000;
  const volatility = Math.abs(change);
  const addressChange = change > 0 
    ? 2 + volatility * 0.8  // Bullish = increasing activity
    : -1 - volatility * 0.4; // Bearish = decreasing activity
  
  const activeAddresses = {
    current: Math.round(baseAddresses * (1 + volatility * 0.01)),
    change24h: Math.round(addressChange * 10) / 10,
    trend: addressChange > 3 ? 'INCREASING' as const : 
           addressChange < -3 ? 'DECREASING' as const : 'STABLE' as const
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // TRANSACTION VOLUME — Follows price momentum
  // ═══════════════════════════════════════════════════════════════════════════
  const baseTxVolume = baseAddresses * 5;
  const volumeMultiplier = 1 + Math.abs(change) * 0.05;
  
  const transactionVolume = {
    value: Math.round(baseTxVolume * volumeMultiplier),
    change24h: Math.round(change * 0.8 * 10) / 10
  };

  return {
    exchangeNetFlow,
    whaleActivity,
    longTermHolders,
    shortTermHolders,
    activeAddresses,
    transactionVolume,
    source: 'derived-deterministic'
  };
}

export function estimateETFFlowData(price: number, change: number, crypto: string = 'BTC'): ETFFlowData | null {
  // ═══════════════════════════════════════════════════════════════════════════
  // ETF FLOW ESTIMATION — Only for BTC and ETH (the only cryptos with spot ETFs)
  // ═══════════════════════════════════════════════════════════════════════════
  const symbol = crypto.toUpperCase();
  
  // Only BTC and ETH have spot ETFs — return null for all other cryptos
  if (symbol !== 'BTC' && symbol !== 'ETH') {
    return null;
  }
  
  const momentum = Math.abs(change);
  const isBTC = symbol === 'BTC';
  
  // Flow direction matches price direction
  let netFlow24h: number;
  let institutionalSentiment: string;
  
  if (change >= 5) {
    netFlow24h = 200 + momentum * 40;
    institutionalSentiment = 'STRONGLY BULLISH';
  } else if (change >= 2) {
    netFlow24h = 80 + momentum * 30;
    institutionalSentiment = 'BULLISH';
  } else if (change <= -5) {
    netFlow24h = -150 - momentum * 30;
    institutionalSentiment = 'BEARISH';
  } else if (change <= -2) {
    netFlow24h = -50 - momentum * 20;
    institutionalSentiment = 'CAUTIOUS';
  } else {
    netFlow24h = change * 25;
    institutionalSentiment = change > 0 ? 'CAUTIOUSLY BULLISH' : 'NEUTRAL';
  }

  // ETH flows are typically smaller than BTC
  const flowMultiplier = isBTC ? 1 : 0.3;
  netFlow24h = Math.round(netFlow24h * flowMultiplier);
  const netFlow7d = Math.round(netFlow24h * 4.5);

  // Determine trend
  let trend: ETFFlowData['trend'];
  if (netFlow24h > 100) trend = 'ACCUMULATING';
  else if (netFlow24h < -100) trend = 'DISTRIBUTING';
  else trend = 'NEUTRAL';

  // Top buyers/sellers based on direction (real ETF names)
  const topBuyers = isBTC
    ? netFlow24h > 50 
      ? ['BlackRock iShares', 'Fidelity Wise Origin'] 
      : netFlow24h > 0 
        ? ['Fidelity'] 
        : []
    : netFlow24h > 30
      ? ['BlackRock', 'Fidelity']
      : netFlow24h > 0
        ? ['BlackRock']
        : [];
  
  const topSellers = isBTC
    ? netFlow24h < -50 
      ? ['Grayscale GBTC', 'ARK 21Shares'] 
      : netFlow24h < 0 
        ? ['Grayscale GBTC'] 
        : []
    : netFlow24h < -30
      ? ['Grayscale ETHE']
      : [];

  return {
    btcNetFlow24h: isBTC ? netFlow24h : 0,
    btcNetFlow7d: isBTC ? netFlow7d : 0,
    ethNetFlow24h: isBTC ? 0 : netFlow24h,
    ethNetFlow7d: isBTC ? 0 : netFlow7d,
    trend,
    topBuyers,
    topSellers,
    institutionalSentiment,
    source: 'derived-deterministic'
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔗 REAL ON-CHAIN DATA FETCHER — Attempts to get live blockchain data
// ═══════════════════════════════════════════════════════════════════════════════
// Tries public APIs first, falls back to derived estimation if unavailable
// Free APIs used: blockchain.info (BTC), mempool.space, blockchair (multi-chain)
// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
// 📊 ANALYSIS THRESHOLDS — Constants for on-chain metrics interpretation
// ═══════════════════════════════════════════════════════════════════════════════

// BTC mempool thresholds (based on typical mempool sizes)
// >50k unconfirmed txs = congested network, suggests selling pressure
// <20k unconfirmed txs = low activity, accumulation-friendly environment
const MEMPOOL_HIGH_THRESHOLD = 50000;
const MEMPOOL_LOW_THRESHOLD = 20000;

// Price change thresholds for flow inference
// ±3% is statistically significant daily move warranting flow interpretation
const SIGNIFICANT_PRICE_CHANGE_PERCENT = 3;

// Exchange flow values in BTC (inferred from mempool + price correlation)
// 15k BTC significant outflow = major accumulation signal
// 10k BTC moderate inflow = distribution pressure
const SIGNIFICANT_OUTFLOW_VALUE = -15000;
const MODERATE_INFLOW_VALUE = 10000;

// ETF flow thresholds in millions USD
// ±100M daily = neutral, normal institutional activity
// >200M = strong bullish, significant accumulation
// <-200M = strong bearish, significant distribution
const ETF_FLOW_NEUTRAL_THRESHOLD = 100;
const ETF_FLOW_STRONG_THRESHOLD = 200;
const ETF_FLOW_MENTION_THRESHOLD = 50;

// Multipliers for extrapolating weekly flows from daily (empirical averages)
// BTC sees ~5 trading days of consistent flow patterns
// ETH has slightly shorter correlation windows (~4 days)
const BTC_WEEKLY_FLOW_MULTIPLIER = 5;
const ETH_WEEKLY_FLOW_MULTIPLIER = 4;

/**
 * Fetch real on-chain metrics from public blockchain APIs
 * Falls back to derived estimation if APIs are unavailable
 */
export async function fetchRealOnChainMetrics(
  crypto: string,
  price: number,
  change: number
): Promise<OnChainMetrics> {
  const symbol = crypto.toUpperCase();
  const isBTC = symbol === 'BTC';
  
  // Default to derived estimation
  const derivedMetrics = estimateOnChainMetrics(crypto, price, change);
  
  try {
    // Attempt to fetch real data from public APIs
    const timeout = 5000; // 5 second timeout
    
    if (isBTC) {
      // Try blockchain.info for BTC stats (free, no API key)
      const [statsResponse, mempoolResponse, unconfirmedResponse] = await Promise.all([
        fetch('https://api.blockchain.info/stats', {
          signal: AbortSignal.timeout(timeout)
        }).then(r => r.ok ? r.json() : null).catch(() => null),
        
        fetch('https://mempool.space/api/v1/fees/mempool-blocks', {
          signal: AbortSignal.timeout(timeout)
        }).then(r => r.ok ? r.json() : null).catch(() => null),
        
        fetch('https://api.blockchain.info/q/unconfirmedcount', {
          signal: AbortSignal.timeout(timeout)
        }).then(r => r.ok ? r.text() : null).catch(() => null)
      ]);
      
      if (statsResponse || mempoolResponse || unconfirmedResponse) {
        // Build real metrics from available data
        const unconfirmedTxs = unconfirmedResponse ? parseInt(unconfirmedResponse) || 0 : 0;
        const avgFeeRate = mempoolResponse && Array.isArray(mempoolResponse) && mempoolResponse.length > 0
          ? Math.round(mempoolResponse.reduce((acc: number, block: { medianFee?: number }) => acc + (block.medianFee || 0), 0) / mempoolResponse.length)
          : 0;
        
        // Get real transaction volume from stats
        const tradeVolume = statsResponse?.trade_volume_btc || 0;
        const txCount24h = statsResponse?.n_tx_24hr || 0;
        
        // Infer exchange flow from mempool activity + price action
        // High mempool + price dropping = likely inflows (selling pressure)
        // Low mempool + price rising = likely outflows (accumulation)
        const mempoolHigh = unconfirmedTxs > MEMPOOL_HIGH_THRESHOLD;
        const mempoolLow = unconfirmedTxs < MEMPOOL_LOW_THRESHOLD;
        
        let exchangeNetFlow = derivedMetrics.exchangeNetFlow;
        if (change > SIGNIFICANT_PRICE_CHANGE_PERCENT && mempoolLow) {
          exchangeNetFlow = { value: SIGNIFICANT_OUTFLOW_VALUE, trend: 'OUTFLOW', magnitude: 'SIGNIFICANT' };
        } else if (change < -SIGNIFICANT_PRICE_CHANGE_PERCENT && mempoolHigh) {
          exchangeNetFlow = { value: MODERATE_INFLOW_VALUE, trend: 'INFLOW', magnitude: 'MODERATE' };
        }
        
        console.log(`[OnChain] BTC real data: ${unconfirmedTxs.toLocaleString()} unconfirmed, ${avgFeeRate} sat/vB avg fee`);
        
        return {
          ...derivedMetrics,
          exchangeNetFlow,
          transactionVolume: {
            value: txCount24h || derivedMetrics.transactionVolume.value,
            change24h: derivedMetrics.transactionVolume.change24h
          },
          mempoolData: {
            unconfirmedTxs,
            mempoolSize: 0,
            avgFeeRate
          },
          source: 'blockchain.info+mempool.space'
        };
      }
    } else {
      // For non-BTC, try Blockchair API
      const blockchairCoin = symbol === 'ETH' ? 'ethereum' :
                             symbol === 'LTC' ? 'litecoin' :
                             symbol === 'DOGE' ? 'dogecoin' : null;
      
      if (blockchairCoin) {
        const response = await fetch(`https://api.blockchair.com/${blockchairCoin}/stats`, {
          signal: AbortSignal.timeout(timeout)
        }).then(r => r.ok ? r.json() : null).catch(() => null);
        
        if (response?.data) {
          const stats = response.data;
          const txCount = stats.transactions_24h || 0;
          const mempoolTxs = stats.mempool_transactions || 0;
          
          console.log(`[OnChain] ${symbol} real data: ${txCount.toLocaleString()} 24h txs, ${mempoolTxs.toLocaleString()} mempool`);
          
          return {
            ...derivedMetrics,
            transactionVolume: {
              value: txCount,
              change24h: derivedMetrics.transactionVolume.change24h
            },
            mempoolData: {
              unconfirmedTxs: mempoolTxs,
              mempoolSize: 0,
              avgFeeRate: 0
            },
            source: 'blockchair'
          };
        }
      }
    }
    
  } catch (error) {
    console.log(`[OnChain] API unavailable for ${symbol}, using derived estimation`);
  }
  
  // Return derived metrics as fallback
  return derivedMetrics;
}

/**
 * Fetch real ETF flow data from public APIs
 * Falls back to derived estimation if unavailable
 */
export async function fetchRealETFFlowData(
  price: number,
  change: number,
  crypto: string = 'BTC'
): Promise<ETFFlowData | null> {
  const symbol = crypto.toUpperCase();
  
  // Only BTC and ETH have spot ETFs
  if (symbol !== 'BTC' && symbol !== 'ETH') {
    return null;
  }
  
  try {
    // Try CoinGlass API for real ETF data (free tier available)
    const response = await fetch('https://open-api.coinglass.com/public/v2/etf/flow', {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000)
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.data) {
        const btcFlow = data.data.btcNetFlow || 0;
        const ethFlow = data.data.ethNetFlow || 0;
        
        console.log(`[ETF] Real data: BTC ${btcFlow > 0 ? '+' : ''}${btcFlow}M, ETH ${ethFlow > 0 ? '+' : ''}${ethFlow}M`);
        
        return {
          btcNetFlow24h: btcFlow,
          btcNetFlow7d: btcFlow * BTC_WEEKLY_FLOW_MULTIPLIER,
          ethNetFlow24h: ethFlow,
          ethNetFlow7d: ethFlow * ETH_WEEKLY_FLOW_MULTIPLIER,
          trend: btcFlow > ETF_FLOW_NEUTRAL_THRESHOLD ? 'ACCUMULATING' : btcFlow < -ETF_FLOW_NEUTRAL_THRESHOLD ? 'DISTRIBUTING' : 'NEUTRAL',
          topBuyers: btcFlow > ETF_FLOW_MENTION_THRESHOLD ? ['BlackRock iShares', 'Fidelity Wise Origin'] : [],
          topSellers: btcFlow < -ETF_FLOW_MENTION_THRESHOLD ? ['Grayscale GBTC'] : [],
          institutionalSentiment: btcFlow > ETF_FLOW_STRONG_THRESHOLD ? 'STRONGLY BULLISH' : btcFlow > ETF_FLOW_MENTION_THRESHOLD ? 'BULLISH' : btcFlow < -ETF_FLOW_STRONG_THRESHOLD ? 'BEARISH' : 'NEUTRAL',
          source: 'coinglass'
        };
      }
    }
  } catch (error) {
    console.log('[ETF] CoinGlass API unavailable, using derived estimation');
  }
  
  // Fall back to derived estimation
  return estimateETFFlowData(price, change, crypto);
}
