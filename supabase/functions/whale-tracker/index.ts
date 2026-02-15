import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🐋 PROFESSIONAL WHALE TRACKER — Multi-Source On-Chain Intelligence
// ═══════════════════════════════════════════════════════════════════════════════
// Aggregates large transactions from multiple blockchain data sources
// Provides real buy/sell pressure from actual on-chain whale activity
// ═══════════════════════════════════════════════════════════════════════════════

interface WhaleTransaction {
  hash: string;
  timestamp: number;
  value: number; // USD value
  valueNative: number; // Native token amount
  from: string;
  to: string;
  type: 'BUY' | 'SELL' | 'TRANSFER';
  blockchain: string;
  symbol: string;
}

interface WhaleActivityResult {
  symbol: string;
  buying: number; // Percentage 0-100
  selling: number; // Percentage 0-100
  netFlow: string;
  totalBuyVolume: number; // USD
  totalSellVolume: number; // USD
  transactionCount: number;
  largestTransaction: number; // USD
  timeWindow: string;
  source: 'whale-alert' | 'blockchain-api' | 'multi-source' | 'derived';
  transactions: WhaleTransaction[];
  isLive: boolean;
  dataAge: number; // milliseconds
}

// Known exchange addresses to identify buy/sell transactions
const EXCHANGE_ADDRESSES: Record<string, string[]> = {
  BTC: [
    '1NDyJtNTjmwk5xPNhjgAMu4HDHigtobu1s', // Binance
    'bc1qm34lsc65zpw79lxes69zkqmk6ee3ewf0j77s3h', // Binance
    '3D2oetdNuZUqQHPJmcMDDHYoqkyNVsFk9r', // Bitfinex
    '3Kzh9qAqVWQhEsfQz7zEQL1EuSx5tyNLNS', // Bitfinex
  ],
  ETH: [
    '0x28c6c06298d514db089934071355e5743bf21d60', // Binance 14
    '0x21a31ee1afc51d94c2efccaa2092ad1028285549', // Binance 15
    '0x5041ed759Dd4aFc3a72b8192C143F72f4724081A', // Kraken
    '0x77134cbC06cB00b66F4c7e623D5fdBF6777635EC', // Kraken
  ]
};

// Whale-Alert.io API (requires API key in production)
async function fetchWhaleAlertTransactions(symbol: string, apiKey?: string): Promise<WhaleTransaction[]> {
  if (!apiKey || apiKey === 'demo') {
    console.log('⚠️ Whale-Alert requires API key - using blockchain APIs instead');
    return [];
  }

  try {
    const minValue = 1000000; // $1M minimum
    const startTime = Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000); // 24h ago
    
    const url = `https://api.whale-alert.io/v1/transactions?min_value=${minValue}&start=${startTime}&symbol=${symbol.toLowerCase()}&api_key=${apiKey}`;
    
    const response = await fetch(url, {
      signal: AbortSignal.timeout(10000)
    });
    
    if (!response.ok) {
      console.error(`Whale-Alert API error: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    
    if (!data.transactions || !Array.isArray(data.transactions)) {
      return [];
    }
    
    return data.transactions.map((tx: any) => ({
      hash: tx.hash,
      timestamp: tx.timestamp * 1000,
      value: tx.amount_usd,
      valueNative: tx.amount,
      from: tx.from?.address || 'unknown',
      to: tx.to?.address || 'unknown',
      type: classifyTransactionType(tx.from?.owner_type, tx.to?.owner_type),
      blockchain: tx.blockchain,
      symbol: tx.symbol.toUpperCase()
    }));
  } catch (error) {
    console.error('Whale-Alert fetch error:', error);
    return [];
  }
}

// Blockchain.info API for BTC large transactions
async function fetchBTCLargeTransactions(): Promise<WhaleTransaction[]> {
  try {
    const response = await fetch('https://blockchain.info/unconfirmed-transactions?format=json', {
      signal: AbortSignal.timeout(10000)
    });
    
    if (!response.ok) return [];
    
    const data = await response.json();
    const transactions: WhaleTransaction[] = [];
    const now = Date.now();
    
    // Also fetch recent blocks for confirmed transactions
    const blocksResponse = await fetch('https://blockchain.info/blocks?format=json', {
      signal: AbortSignal.timeout(10000)
    });
    
    if (blocksResponse.ok) {
      const blocks = await blocksResponse.json();
      
      for (const block of blocks.slice(0, 6)) { // Last 6 blocks (~1 hour)
        const blockResponse = await fetch(`https://blockchain.info/rawblock/${block.hash}?format=json`, {
          signal: AbortSignal.timeout(10000)
        });
        
        if (!blockResponse.ok) continue;
        
        const blockData = await blockResponse.json();
        
        for (const tx of blockData.tx || []) {
          // Calculate total output in BTC
          const totalOut = tx.out.reduce((sum: number, output: any) => sum + (output.value || 0), 0) / 100000000;
          
          // Assume BTC price ~$95,000 (should be passed in, but rough estimate for now)
          const estimatedUSD = totalOut * 95000;
          
          // Only track transactions > $1M
          if (estimatedUSD < 1000000) continue;
          
          const fromAddresses = tx.inputs?.map((inp: any) => inp.prev_out?.addr).filter(Boolean) || [];
          const toAddresses = tx.out?.map((out: any) => out.addr).filter(Boolean) || [];
          
          transactions.push({
            hash: tx.hash,
            timestamp: blockData.time * 1000,
            value: estimatedUSD,
            valueNative: totalOut,
            from: fromAddresses[0] || 'unknown',
            to: toAddresses[0] || 'unknown',
            type: classifyBTCTransaction(fromAddresses, toAddresses),
            blockchain: 'bitcoin',
            symbol: 'BTC'
          });
          
          // Limit to 50 transactions to prevent overload
          if (transactions.length >= 50) break;
        }
        
        if (transactions.length >= 50) break;
      }
    }
    
    console.log(`✅ Fetched ${transactions.length} BTC whale transactions`);
    return transactions;
  } catch (error) {
    console.error('BTC blockchain fetch error:', error);
    return [];
  }
}

// Classify transaction type based on address ownership
function classifyTransactionType(fromType: string, toType: string): 'BUY' | 'SELL' | 'TRANSFER' {
  if (fromType === 'exchange' && toType !== 'exchange') {
    return 'BUY'; // Withdrawal from exchange = buying
  }
  if (fromType !== 'exchange' && toType === 'exchange') {
    return 'SELL'; // Deposit to exchange = selling
  }
  return 'TRANSFER'; // Whale to whale or other
}

// Classify BTC transaction based on known exchange addresses
function classifyBTCTransaction(fromAddresses: string[], toAddresses: string[]): 'BUY' | 'SELL' | 'TRANSFER' {
  const exchangeAddrs = EXCHANGE_ADDRESSES.BTC || [];
  
  const fromExchange = fromAddresses.some(addr => exchangeAddrs.includes(addr));
  const toExchange = toAddresses.some(addr => exchangeAddrs.includes(addr));
  
  if (fromExchange && !toExchange) return 'BUY';
  if (!fromExchange && toExchange) return 'SELL';
  return 'TRANSFER';
}

// Aggregate whale activity from transactions
function aggregateWhaleActivity(transactions: WhaleTransaction[], symbol: string): WhaleActivityResult {
  const filtered = transactions.filter(tx => tx.symbol === symbol);
  
  if (filtered.length === 0) {
    return {
      symbol,
      buying: 0,
      selling: 0,
      netFlow: 'NO DATA',
      totalBuyVolume: 0,
      totalSellVolume: 0,
      transactionCount: 0,
      largestTransaction: 0,
      timeWindow: '24h',
      source: 'derived',
      transactions: [],
      isLive: false,
      dataAge: 0
    };
  }
  
  let totalBuyVolume = 0;
  let totalSellVolume = 0;
  let largestTransaction = 0;
  
  const now = Date.now();
  const oldestTx = Math.min(...filtered.map(tx => tx.timestamp));
  const dataAge = now - oldestTx;
  
  for (const tx of filtered) {
    if (tx.type === 'BUY') {
      totalBuyVolume += tx.value;
    } else if (tx.type === 'SELL') {
      totalSellVolume += tx.value;
    }
    
    if (tx.value > largestTransaction) {
      largestTransaction = tx.value;
    }
  }
  
  const totalVolume = totalBuyVolume + totalSellVolume;
  const buyingPct = totalVolume > 0 ? (totalBuyVolume / totalVolume) * 100 : 0;
  const sellingPct = totalVolume > 0 ? (totalSellVolume / totalVolume) * 100 : 0;
  
  let netFlow: string;
  if (buyingPct > sellingPct + 20) {
    netFlow = 'NET BUYING';
  } else if (sellingPct > buyingPct + 20) {
    netFlow = 'NET SELLING';
  } else if (Math.abs(buyingPct - sellingPct) < 10) {
    netFlow = 'BALANCED';
  } else {
    netFlow = 'MIXED';
  }
  
  return {
    symbol,
    buying: Math.round(buyingPct),
    selling: Math.round(sellingPct),
    netFlow,
    totalBuyVolume: Math.round(totalBuyVolume),
    totalSellVolume: Math.round(totalSellVolume),
    transactionCount: filtered.length,
    largestTransaction: Math.round(largestTransaction),
    timeWindow: '24h',
    source: 'blockchain-api',
    transactions: filtered.slice(0, 10), // Return top 10 for reference
    isLive: true,
    dataAge
  };
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { symbol, whaleAlertApiKey } = await req.json();
    
    if (!symbol) {
      return new Response(
        JSON.stringify({ error: 'Symbol is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`🐋 Fetching whale activity for ${symbol}...`);
    
    const symbolUpper = symbol.toUpperCase();
    let transactions: WhaleTransaction[] = [];
    let source: WhaleActivityResult['source'] = 'derived';
    
    // Try Whale-Alert first if API key provided
    if (whaleAlertApiKey && whaleAlertApiKey !== 'demo') {
      transactions = await fetchWhaleAlertTransactions(symbolUpper, whaleAlertApiKey);
      if (transactions.length > 0) {
        source = 'whale-alert';
        console.log(`✅ Got ${transactions.length} transactions from Whale-Alert`);
      }
    }
    
    // Fallback to blockchain APIs
    if (transactions.length === 0) {
      if (symbolUpper === 'BTC') {
        transactions = await fetchBTCLargeTransactions();
        if (transactions.length > 0) {
          source = 'blockchain-api';
        }
      }
      // TODO: Add ETH, SOL, and other blockchain APIs
    }
    
    // Aggregate the data
    const result = aggregateWhaleActivity(transactions, symbolUpper);
    result.source = source;
    
    console.log(`✅ Whale activity: ${result.netFlow} (${result.buying}% buy / ${result.selling}% sell) from ${result.transactionCount} txs`);
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Whale tracker error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch whale activity',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
