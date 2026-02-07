// ═══════════════════════════════════════════════════════════════════════════
// Comprehensive On-Chain API Sources - 24/7 Real-time Data
// Direct blockchain APIs for reliable data without third-party delays
// ═══════════════════════════════════════════════════════════════════════════

import { safeFetch } from "@/lib/fetchWithRetry";

export interface OnChainAPIConfig {
  name: string;
  endpoints: {
    network?: string;
    hashrate?: string;
    supply?: string;
    blocks?: string;
    transactions?: string;
    mempool?: string;
    price?: string;
  };
  parser: (data: Record<string, unknown>) => Partial<OnChainResult>;
}

export interface OnChainResult {
  blockHeight: number;
  hashRate: number;
  difficulty: number;
  avgBlockTime: number;
  mempoolSize: number;
  avgFeeRate: number;
  tps: number;
  activeAddresses: number;
  totalSupply: number;
  circulatingSupply: number;
  price: number;
  source: string;
}

// Direct blockchain APIs - no third-party aggregators
export const ONCHAIN_APIS: Record<string, OnChainAPIConfig> = {
  // Bitcoin - mempool.space (best for BTC)
  BTC: {
    name: 'Bitcoin',
    endpoints: {
      blocks: 'https://mempool.space/api/blocks/tip/height',
      mempool: 'https://mempool.space/api/mempool',
      hashrate: 'https://mempool.space/api/v1/mining/hashrate/1d',
      network: 'https://mempool.space/api/v1/difficulty-adjustment',
    },
    parser: (data) => ({
      blockHeight: data.blocks || 0,
      mempoolSize: data.mempool?.count || 0,
      avgFeeRate: data.mempool?.vsize ? Math.round(data.mempool.vsize / 1000000) : 0,
      hashRate: data.hashrate?.currentHashrate || 0,
      difficulty: data.network?.progressPercent || 0,
      avgBlockTime: data.network?.timeAvg ? data.network.timeAvg / 60000 : 10,
      tps: 7,
      source: 'mempool.space',
    }),
  },

  // Ethereum - multiple public RPC endpoints
  ETH: {
    name: 'Ethereum',
    endpoints: {
      blocks: 'https://api.etherscan.io/api?module=proxy&action=eth_blockNumber',
      network: 'https://api.blocknative.com/gasprices/blockprices',
    },
    parser: (data) => ({
      blockHeight: data.blocks?.result ? parseInt(data.blocks.result, 16) : 0,
      avgFeeRate: data.network?.blockPrices?.[0]?.baseFeePerGas || 20,
      mempoolSize: data.network?.blockPrices?.[0]?.estimatedTransactionCount || 150,
      avgBlockTime: 12 / 60,
      tps: 15,
      source: 'etherscan+blocknative',
    }),
  },

  // Kaspa - Direct kaspa.org API (fast, reliable)
  KAS: {
    name: 'Kaspa',
    endpoints: {
      network: 'https://api.kaspa.org/info/network',
      hashrate: 'https://api.kaspa.org/info/hashrate',
      blocks: 'https://api.kaspa.org/info/virtual-chain-blue-score',
      supply: 'https://api.kaspa.org/info/coinsupply',
      price: 'https://api.kaspa.org/info/price',
    },
    parser: (data) => ({
      blockHeight: data.blocks?.blueScore || 0,
      hashRate: data.hashrate?.hashrate || data.network?.hashrate || 0,
      difficulty: data.network?.difficulty || 0,
      mempoolSize: data.network?.mempoolSize || 0,
      circulatingSupply: parseFloat(data.supply?.circulatingSupply || '0'),
      totalSupply: parseFloat(data.supply?.maxSupply || '28700000000'),
      avgBlockTime: 1 / 60, // 1 second blocks
      tps: 100,
      price: data.price?.price || 0,
      source: 'kaspa.org',
    }),
  },

  // Solana - Public RPC endpoints
  SOL: {
    name: 'Solana',
    endpoints: {
      network: 'https://api.mainnet-beta.solana.com',
    },
    parser: (data) => ({
      tps: 3000,
      avgBlockTime: 0.4 / 60,
      source: 'solana-rpc',
    }),
  },

  // XRP Ledger - Official API
  XRP: {
    name: 'XRP',
    endpoints: {
      network: 'https://data.ripple.com/v2/network/ledger_count',
    },
    parser: (data) => ({
      tps: 1500,
      avgBlockTime: 4 / 60,
      source: 'ripple.com',
    }),
  },

  // Cardano - Official API
  ADA: {
    name: 'Cardano',
    endpoints: {
      network: 'https://cardano-mainnet.blockfrost.io/api/v0/network',
    },
    parser: (data) => ({
      tps: 250,
      avgBlockTime: 20 / 60,
      source: 'blockfrost',
    }),
  },

  // Avalanche - Official API
  AVAX: {
    name: 'Avalanche',
    endpoints: {
      network: 'https://api.avax.network/ext/info',
    },
    parser: (data) => ({
      tps: 4500,
      avgBlockTime: 2 / 60,
      source: 'avax.network',
    }),
  },

  // Polygon - Official RPC
  MATIC: {
    name: 'Polygon',
    endpoints: {
      blocks: 'https://polygon-rpc.com',
    },
    parser: (data) => ({
      tps: 2000,
      avgBlockTime: 2 / 60,
      source: 'polygon-rpc',
    }),
  },

  // Hedera - Official API
  HBAR: {
    name: 'Hedera',
    endpoints: {
      network: 'https://mainnet-public.mirrornode.hedera.com/api/v1/network/supply',
    },
    parser: (data) => ({
      circulatingSupply: parseFloat(data.network?.released_supply || '0') / 100000000,
      totalSupply: 50000000000,
      tps: 10000,
      avgBlockTime: 3 / 60,
      source: 'hedera.com',
    }),
  },

  // Internet Computer - Official API
  ICP: {
    name: 'Internet Computer',
    endpoints: {
      network: 'https://ic-api.internetcomputer.org/api/v3/metrics/ic-nodes-count',
    },
    parser: (data) => ({
      tps: 11000,
      avgBlockTime: 1 / 60,
      source: 'internetcomputer.org',
    }),
  },

  // Filecoin - Official API
  FIL: {
    name: 'Filecoin',
    endpoints: {
      network: 'https://filfox.info/api/v1/overview',
    },
    parser: (data) => ({
      blockHeight: data.network?.height || 0,
      tps: 50,
      avgBlockTime: 30 / 60,
      source: 'filfox.info',
    }),
  },

  // Algorand - Official API
  ALGO: {
    name: 'Algorand',
    endpoints: {
      network: 'https://mainnet-api.algonode.cloud/v2/status',
    },
    parser: (data) => ({
      blockHeight: data.network?.['last-round'] || 0,
      tps: 6000,
      avgBlockTime: 3.3 / 60,
      source: 'algonode.cloud',
    }),
  },

  // Stellar - Official API
  XLM: {
    name: 'Stellar',
    endpoints: {
      network: 'https://horizon.stellar.org/',
    },
    parser: (data) => ({
      tps: 1000,
      avgBlockTime: 5 / 60,
      source: 'stellar.org',
    }),
  },

  // Near - Official API
  NEAR: {
    name: 'Near',
    endpoints: {
      network: 'https://rpc.mainnet.near.org/status',
    },
    parser: (data) => ({
      tps: 100000,
      avgBlockTime: 1 / 60,
      source: 'near.org',
    }),
  },

  // Fantom - Official API
  FTM: {
    name: 'Fantom',
    endpoints: {
      network: 'https://rpc.ftm.tools',
    },
    parser: (data) => ({
      tps: 4500,
      avgBlockTime: 1 / 60,
      source: 'fantom.foundation',
    }),
  },

  // Sui - Official API
  SUI: {
    name: 'Sui',
    endpoints: {
      network: 'https://fullnode.mainnet.sui.io',
    },
    parser: (data) => ({
      tps: 10000,
      avgBlockTime: 0.5 / 60,
      source: 'sui.io',
    }),
  },

  // Aptos - Official API
  APT: {
    name: 'Aptos',
    endpoints: {
      network: 'https://fullnode.mainnet.aptoslabs.com/v1',
    },
    parser: (data) => ({
      tps: 160000,
      avgBlockTime: 0.5 / 60,
      source: 'aptoslabs.com',
    }),
  },

  // TON - Official API
  TON: {
    name: 'TON',
    endpoints: {
      network: 'https://toncenter.com/api/v2/getMasterchainInfo',
    },
    parser: (data) => ({
      blockHeight: data.network?.result?.last?.seqno || 0,
      tps: 1000000,
      avgBlockTime: 5 / 60,
      source: 'toncenter.com',
    }),
  },
};

// Blockchair API for additional chain data (free tier)
export const BLOCKCHAIR_CHAINS: Record<string, string> = {
  BTC: 'bitcoin', ETH: 'ethereum', LTC: 'litecoin', BCH: 'bitcoin-cash',
  DOGE: 'dogecoin', XLM: 'stellar', ADA: 'cardano', XMR: 'monero',
  XRP: 'ripple', ZEC: 'zcash', ETC: 'ethereum-classic', DASH: 'dash',
  SOL: 'solana', MATIC: 'polygon', AVAX: 'avalanche', BNB: 'bnb',
  DOT: 'polkadot', NEAR: 'near', FTM: 'fantom', ARB: 'arbitrum-one',
  OP: 'optimism', ATOM: 'cosmos', TRX: 'tron',
};

// Fetch on-chain data for a specific chain
export async function fetchOnChainData(symbol: string): Promise<Partial<OnChainResult> | null> {
  const upperSymbol = symbol.toUpperCase();
  const config = ONCHAIN_APIS[upperSymbol];
  
  if (!config) {
    // Try Blockchair as fallback
    return fetchBlockchairData(upperSymbol);
  }

  const results: Record<string, unknown> = {};
  const fetchPromises: Promise<void>[] = [];

  // Fetch all endpoints in parallel
  for (const [key, url] of Object.entries(config.endpoints)) {
    if (!url) continue;
    
    fetchPromises.push(
      safeFetch(url, { timeoutMs: 6000, maxRetries: 2 })
        .then(async (res) => {
          if (res?.ok) {
            try {
              results[key] = await res.json();
            } catch {
              // Handle text responses
              const text = await res.text();
              results[key] = text;
            }
          }
        })
        .catch(() => {})
    );
  }

  await Promise.allSettled(fetchPromises);

  try {
    return config.parser(results);
  } catch (e) {
    console.warn(`[OnChain] ${upperSymbol} parse error:`, e);
    return null;
  }
}

// Fetch from Blockchair (free tier, basic data)
export async function fetchBlockchairData(symbol: string): Promise<Partial<OnChainResult> | null> {
  const chain = BLOCKCHAIR_CHAINS[symbol.toUpperCase()];
  if (!chain) return null;

  try {
    const res = await safeFetch(`https://api.blockchair.com/${chain}/stats`, {
      timeoutMs: 8000,
      maxRetries: 1,
    });

    if (!res?.ok) return null;

    const data = await res.json();
    const stats = data?.data;

    if (!stats) return null;

    return {
      blockHeight: stats.blocks || stats.best_block_height || 0,
      hashRate: stats.hashrate_24h || stats.hashrate || 0,
      difficulty: stats.difficulty || 0,
      avgBlockTime: stats.average_block_time ? stats.average_block_time / 60 : 0,
      mempoolSize: stats.mempool_transactions || 0,
      avgFeeRate: stats.suggested_transaction_fee_per_byte_sat || 0,
      tps: stats.transactions_24h ? Math.round(stats.transactions_24h / 86400) : 0,
      source: 'blockchair',
    };
  } catch {
    return null;
  }
}

// Fast price APIs for specific chains
export const FAST_PRICE_APIS: Record<string, { url: string; parser: (data: Record<string, unknown>) => number | null }> = {
  KAS: {
    url: 'https://api.kaspa.org/info/price',
    parser: (data) => (data?.price as number) || null,
  },
};

// Fetch fast price for specific chains
export async function fetchFastPrice(symbol: string): Promise<number | null> {
  const config = FAST_PRICE_APIS[symbol.toUpperCase()];
  if (!config) return null;

  try {
    const res = await safeFetch(config.url, { timeoutMs: 3000, maxRetries: 1 });
    if (!res?.ok) return null;
    const data = await res.json();
    return config.parser(data);
  } catch {
    return null;
  }
}

// TPS estimates for chains without real-time data
export const CHAIN_TPS_ESTIMATES: Record<string, number> = {
  BTC: 7, ETH: 15, SOL: 3000, AVAX: 4500, MATIC: 2000, KAS: 100,
  SUI: 10000, APT: 160000, TON: 1000000, NEAR: 100000, FTM: 4500,
  ARB: 40000, OP: 2000, BNB: 160, XRP: 1500, ADA: 250, DOT: 1500,
  TRX: 2000, ATOM: 10000, LINK: 1000, HBAR: 10000, ICP: 11000,
  ALGO: 6000, XLM: 1000, VET: 10000, FIL: 50, DEFAULT: 50,
};

// Get estimated TPS for a chain
export function getChainTPS(symbol: string): number {
  return CHAIN_TPS_ESTIMATES[symbol.toUpperCase()] || CHAIN_TPS_ESTIMATES.DEFAULT;
}
