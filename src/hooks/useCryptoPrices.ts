import { useState, useEffect, useCallback, useRef } from "react";
import { fetchWithRetry, safeFetch } from "@/lib/fetchWithRetry";

export interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  high_24h: number;
  low_24h: number;
  total_volume: number;
  market_cap: number;
  market_cap_rank: number;
  circulating_supply: number;
  lastUpdate?: number;
  source?: string;
}

interface CoinGeckoCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  high_24h: number;
  low_24h: number;
  total_volume: number;
  market_cap: number;
  market_cap_rank: number;
  circulating_supply: number;
}

// Stablecoins to exclude
const STABLECOINS = [
  // USD stablecoins (all variations)
  "usdt", "usdc", "busd", "dai", "tusd", "usdp", "usdd", "gusd", 
  "frax", "lusd", "susd", "eurs", "usdj", "fdusd", "pyusd", "eurc",
  "ustc", "usde", "susde", "cusd", "usdx", "husd", "nusd", "musd",
  "dola", "usdk", "tribe", "fei", "mim", "spell", "ust", "usdn",
  "usd1", "rusd", "zusd", "dusd", "ousd", "vusd", "ausd", "eusd",
  // Wrapped/pegged assets
  "wbtc", "weth", "steth", "reth", "cbeth", "wsteth", "frxeth", "sfrxeth",
  "hbtc", "renbtc", "tbtc", "sbtc", "pbtc", "obtc",
  // Restaking assets
  "ezeth", "rseth", "weeth", "eeth", "pufeth", "kelp", "renzo", "eigenlayer",
  "ether-fi", "puffer-finance", "kelp-dao", "restaked-eth", "restaked-ether",
  "eigenpie", "bedrock", "mantle-staked-ether", "meth", "sweth", "ankr-staked-eth",
  // Stakewise
  "stakewise", "oseth", "swise", "stakewise-staked-eth",
  // Gold/commodity backed
  "xaut", "paxg", "gold", "dgld", "pmgt",
  // Other stable/wrapped
  "wrapped-bitcoin", "staked-ether", "rocket-pool-eth", "coinbase-wrapped-staked-eth",
  "lido-staked-ether", "frax-ether", "binance-peg-ethereum",
  // PayPal, First Digital, etc
  "paypal-usd", "first-digital-usd", "gemini-dollar", "pax-gold", "tether-gold",
  "true-usd", "ethena-usde", "ethena", "sdai", "savingsdai"
];

// Check if symbol starts with USD variations
const isUsdPrefixed = (symbol: string): boolean => {
  const lower = symbol.toLowerCase();
  return lower.startsWith("usd") || lower.startsWith("rusd") || 
         lower.startsWith("zusd") || lower.startsWith("eusd") ||
         lower.startsWith("ausd") || lower.startsWith("cusd");
};

// Priority tokens to always include if available
const PRIORITY_TOKENS = [
  "gomining", "bitcoin", "ethereum", "solana", "ripple", "binancecoin",
  "cardano", "dogecoin", "avalanche-2", "chainlink", "polkadot", "sui",
  "near", "aptos", "arbitrum", "optimism", "injective-protocol", "celestia",
  "render-token", "fetch-ai", "worldcoin", "jupiter", "jito-governance-token",
  "kaspa", "fantom", "hedera-hashgraph", "vechain", "algorand", "toncoin",
  "internet-computer", "filecoin", "cosmos", "the-graph", "aave", "maker"
];

const COINGECKO_API = "https://api.coingecko.com/api/v3";

// CoinGecko ID to CoinCap ID mapping (they differ for many coins)
const COINGECKO_TO_COINCAP: Record<string, string> = {
  "bitcoin": "bitcoin",
  "ethereum": "ethereum",
  "tether": "tether",
  "ripple": "xrp",
  "solana": "solana",
  "binancecoin": "binance-coin",
  "dogecoin": "dogecoin",
  "usd-coin": "usd-coin",
  "cardano": "cardano",
  "tron": "tron",
  "avalanche-2": "avalanche",
  "chainlink": "chainlink",
  "the-open-network": "the-open-network",
  "shiba-inu": "shiba-inu",
  "sui": "sui",
  "stellar": "stellar",
  "polkadot": "polkadot",
  "hedera-hashgraph": "hedera-hashgraph",
  "bitcoin-cash": "bitcoin-cash",
  "unus-sed-leo": "unus-sed-leo",
  "litecoin": "litecoin",
  "cosmos": "cosmos",
  "uniswap": "uniswap",
  "near": "near-protocol",
  "ethereum-classic": "ethereum-classic",
  "aptos": "aptos",
  "render-token": "render-token",
  "vechain": "vechain",
  "internet-computer": "internet-computer",
  "matic-network": "polygon",
  "polygon": "polygon",
  "crypto-com-chain": "crypto-com-coin",
  "filecoin": "filecoin",
  "arbitrum": "arbitrum",
  "maker": "maker",
  "algorand": "algorand",
  "kaspa": "kaspa",
  "optimism": "optimism",
  "aave": "aave",
  "immutable-x": "immutable-x",
  "injective-protocol": "injective-protocol",
  "fantom": "fantom",
  "blockstack": "stacks",
  "stacks": "stacks",
  "monero": "monero",
  "theta-token": "theta",
  "the-graph": "the-graph",
  "dogwifcoin": "dogwifcoin",
  "bonk": "bonk",
  "pepe": "pepe",
  "floki": "floki-inu",
  "fetch-ai": "fetch-ai",
  "thorchain": "thorchain",
  "the-sandbox": "the-sandbox",
  "decentraland": "decentraland",
  "axie-infinity": "axie-infinity",
  "gala": "gala",
  "apecoin": "apecoin",
  "curve-dao-token": "curve-dao-token",
  "synthetix-network-token": "synthetix-network-token",
  "compound-governance-token": "compound",
  "lido-dao": "lido-dao",
  "ethereum-name-service": "ethereum-name-service",
  "eos": "eos",
  "tezos": "tezos",
  "neo": "neo",
  "kava": "kava",
  "zcash": "zcash",
  "dash": "dash",
  "elrond-erd-2": "elrond-erd-2",
  "flow": "flow",
  "mina-protocol": "mina",
  "oasis-network": "oasis-network",
  "harmony": "harmony",
  "zilliqa": "zilliqa",
  "enjincoin": "enjin-coin",
  "chiliz": "chiliz",
  "basic-attention-token": "basic-attention-token",
  "pancakeswap-token": "pancakeswap-token",
  "sushi": "sushiswap",
  "yearn-finance": "yearn-finance",
  "wrapped-bitcoin": "wrapped-bitcoin",
  "okb": "okb",
  "celestia": "celestia",
  "sei-network": "sei-network",
  "bittensor": "bittensor",
  "pyth-network": "pyth-network",
  "ordi": "ordi",
  "blur": "blur",
  "pendle": "pendle",
  "worldcoin-wld": "worldcoin-wld",
  "jupiter-exchange-solana": "jupiter-exchange-solana",
  "ondo-finance": "ondo-finance",
  "xdc-network": "xdc-network",
  "jasmy": "jasmy",
  "iota": "iota",
  "quant-network": "quant",
  "core": "core",
  "stepn": "green-metaverse-token",
  "starknet": "starknet-token",
  "notcoin": "notcoin",
  "zksync": "zksync",
  "eigenlayer": "eigenlayer",
  "popcat": "popcat-sol",
  "arweave": "arweave",
  "storj": "storj",
  "livepeer": "livepeer",
  "osmosis": "osmosis",
  "celo": "celo",
  "klaytn": "klaytn",
  "gmx": "gmx",
  "balancer": "balancer",
  "ocean-protocol": "ocean-protocol",
  "singularitynet": "singularitynet",
  "akash-network": "akash-network",
  "mantle": "mantle",
  "beam-2": "beam",
  "ronin": "ronin",
  "flare-networks": "flare-networks",
  "conflux-token": "conflux-network",
  "theta-fuel": "theta-fuel",
  "bittorrent": "bittorrent",
  "wink": "wink",
  "just": "just",
  "gomining-token": "gomining",
  "gomining": "gomining",
};

// No caching - always fetch fresh data from WebSocket
// CoinGecko is only used for initial metadata (images, names)

// Fallback prices with realistic values - will be replaced with live data
// These provide a better UX than showing "---" while WebSocket connects
const FALLBACK_CRYPTOS: CryptoPrice[] = [
  { id: "bitcoin", symbol: "btc", name: "Bitcoin", image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png", current_price: 83000, price_change_percentage_24h: 0.5, high_24h: 84000, low_24h: 82000, total_volume: 25000000000, market_cap: 1650000000000, market_cap_rank: 1, circulating_supply: 19600000, lastUpdate: Date.now(), source: "Fallback" },
  { id: "ethereum", symbol: "eth", name: "Ethereum", image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png", current_price: 2700, price_change_percentage_24h: -1.2, high_24h: 2750, low_24h: 2650, total_volume: 12000000000, market_cap: 325000000000, market_cap_rank: 2, circulating_supply: 120000000, lastUpdate: Date.now(), source: "Fallback" },
  { id: "binancecoin", symbol: "bnb", name: "BNB", image: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png", current_price: 580, price_change_percentage_24h: 0.3, high_24h: 590, low_24h: 575, total_volume: 1500000000, market_cap: 84000000000, market_cap_rank: 3, circulating_supply: 145000000, lastUpdate: Date.now(), source: "Fallback" },
  { id: "solana", symbol: "sol", name: "Solana", image: "https://assets.coingecko.com/coins/images/4128/large/solana.png", current_price: 117, price_change_percentage_24h: -0.8, high_24h: 120, low_24h: 115, total_volume: 3000000000, market_cap: 55000000000, market_cap_rank: 4, circulating_supply: 470000000, lastUpdate: Date.now(), source: "Fallback" },
  { id: "ripple", symbol: "xrp", name: "XRP", image: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png", current_price: 1.75, price_change_percentage_24h: -0.5, high_24h: 1.80, low_24h: 1.70, total_volume: 2500000000, market_cap: 100000000000, market_cap_rank: 5, circulating_supply: 57000000000, lastUpdate: Date.now(), source: "Fallback" },
  { id: "dogecoin", symbol: "doge", name: "Dogecoin", image: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png", current_price: 0.18, price_change_percentage_24h: 1.2, high_24h: 0.19, low_24h: 0.17, total_volume: 800000000, market_cap: 26000000000, market_cap_rank: 6, circulating_supply: 144000000000, lastUpdate: Date.now(), source: "Fallback" },
  { id: "kaspa", symbol: "kas", name: "Kaspa", image: "https://assets.coingecko.com/coins/images/25751/large/kaspa-icon-exchanges.png", current_price: 0.085, price_change_percentage_24h: 2.5, high_24h: 0.088, low_24h: 0.082, total_volume: 100000000, market_cap: 2200000000, market_cap_rank: 30, circulating_supply: 26000000000, lastUpdate: Date.now(), source: "Fallback" },
  { id: "cardano", symbol: "ada", name: "Cardano", image: "https://assets.coingecko.com/coins/images/975/large/cardano.png", current_price: 0.65, price_change_percentage_24h: -0.3, high_24h: 0.67, low_24h: 0.63, total_volume: 400000000, market_cap: 23000000000, market_cap_rank: 8, circulating_supply: 35000000000, lastUpdate: Date.now(), source: "Fallback" },
  { id: "avalanche-2", symbol: "avax", name: "Avalanche", image: "https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png", current_price: 25, price_change_percentage_24h: 0.8, high_24h: 26, low_24h: 24, total_volume: 300000000, market_cap: 10000000000, market_cap_rank: 12, circulating_supply: 400000000, lastUpdate: Date.now(), source: "Fallback" },
  { id: "chainlink", symbol: "link", name: "Chainlink", image: "https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png", current_price: 15, price_change_percentage_24h: -0.6, high_24h: 15.5, low_24h: 14.5, total_volume: 400000000, market_cap: 9000000000, market_cap_rank: 14, circulating_supply: 600000000, lastUpdate: Date.now(), source: "Fallback" },
  { id: "polkadot", symbol: "dot", name: "Polkadot", image: "https://assets.coingecko.com/coins/images/12171/large/polkadot.png", current_price: 5.5, price_change_percentage_24h: 0.2, high_24h: 5.7, low_24h: 5.3, total_volume: 200000000, market_cap: 8000000000, market_cap_rank: 16, circulating_supply: 1450000000, lastUpdate: Date.now(), source: "Fallback" },
  { id: "sui", symbol: "sui", name: "Sui", image: "https://assets.coingecko.com/coins/images/26375/large/sui_asset.jpeg", current_price: 3.2, price_change_percentage_24h: 1.5, high_24h: 3.3, low_24h: 3.1, total_volume: 500000000, market_cap: 10000000000, market_cap_rank: 11, circulating_supply: 3100000000, lastUpdate: Date.now(), source: "Fallback" },
];

// Multi-exchange WebSocket endpoints - prioritize fastest and most reliable
const EXCHANGES = {
  // Binance combined stream - most reliable, handles 200+ symbols
  binance: {
    url: "wss://stream.binance.com:9443/ws",
    combinedUrl: "wss://stream.binance.com:9443/stream?streams=",
    name: "Binance",
  },
  // OKX - excellent coverage, supports KAS and other altcoins
  okx: {
    url: "wss://ws.okx.com:8443/ws/v5/public",
    name: "OKX",
  },
  // Bybit - fast updates, good altcoin coverage
  bybit: {
    url: "wss://stream.bybit.com/v5/public/spot",
    name: "Bybit",
  },
  // Kraken - reliable for major pairs
  kraken: {
    url: "wss://ws.kraken.com",
    name: "Kraken",
  },
  // Coinbase - US market data
  coinbase: {
    url: "wss://ws-feed.exchange.coinbase.com",
    name: "Coinbase",
  },
};

// Symbols supported by OKX (includes KAS!)
const OKX_SYMBOLS: Record<string, string> = {
  BTC: 'BTC-USDT', ETH: 'ETH-USDT', SOL: 'SOL-USDT', XRP: 'XRP-USDT', DOGE: 'DOGE-USDT',
  ADA: 'ADA-USDT', AVAX: 'AVAX-USDT', DOT: 'DOT-USDT', LINK: 'LINK-USDT', LTC: 'LTC-USDT',
  ATOM: 'ATOM-USDT', NEAR: 'NEAR-USDT', APT: 'APT-USDT', FIL: 'FIL-USDT', ARB: 'ARB-USDT',
  OP: 'OP-USDT', INJ: 'INJ-USDT', SUI: 'SUI-USDT', TIA: 'TIA-USDT', PEPE: 'PEPE-USDT',
  SHIB: 'SHIB-USDT', TRX: 'TRX-USDT', XLM: 'XLM-USDT', HBAR: 'HBAR-USDT', VET: 'VET-USDT',
  FTM: 'FTM-USDT', ETC: 'ETC-USDT', AAVE: 'AAVE-USDT', MKR: 'MKR-USDT', GRT: 'GRT-USDT',
  KAS: 'KAS-USDT', TON: 'TON-USDT', TAO: 'TAO-USDT', WLD: 'WLD-USDT', ORDI: 'ORDI-USDT',
  SEI: 'SEI-USDT', STX: 'STX-USDT', MINA: 'MINA-USDT', ALGO: 'ALGO-USDT', ICP: 'ICP-USDT',
};

// Symbols supported by Bybit
const BYBIT_SYMBOLS: Record<string, string> = {
  BTC: 'BTCUSDT', ETH: 'ETHUSDT', SOL: 'SOLUSDT', XRP: 'XRPUSDT', DOGE: 'DOGEUSDT',
  ADA: 'ADAUSDT', AVAX: 'AVAXUSDT', DOT: 'DOTUSDT', LINK: 'LINKUSDT', LTC: 'LTCUSDT',
  ATOM: 'ATOMUSDT', NEAR: 'NEARUSDT', APT: 'APTUSDT', FIL: 'FILUSDT', ARB: 'ARBUSDT',
  OP: 'OPUSDT', INJ: 'INJUSDT', SUI: 'SUIUSDT', TIA: 'TIAUSDT', PEPE: 'PEPEUSDT',
  SHIB: 'SHIBUSDT', TRX: 'TRXUSDT', KAS: 'KASUSDT', TON: 'TONUSDT', WLD: 'WLDUSDT',
  SEI: 'SEIUSDT', ALGO: 'ALGOUSDT', ICP: 'ICPUSDT', HBAR: 'HBARUSDT', VET: 'VETUSDT',
};

// Priority symbols for faster update throttling
const FAST_UPDATE_CRYPTOS = ["kas", "kaspa", "hbar", "icp", "fil", "algo", "xlm", "xmr", "vet"];

export const useCryptoPrices = () => {
  // Initialize with fallback prices for immediate display
  const [prices, setPrices] = useState<CryptoPrice[]>(FALLBACK_CRYPTOS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectedExchanges, setConnectedExchanges] = useState<string[]>([]);
  const [isLive, setIsLive] = useState(false);
  
  // WebSocket refs - multi-exchange for maximum coverage
  const binanceWsRef = useRef<WebSocket | null>(null);
  const okxWsRef = useRef<WebSocket | null>(null);
  const bybitWsRef = useRef<WebSocket | null>(null);
  const krakenWsRef = useRef<WebSocket | null>(null);
  const coinbaseWsRef = useRef<WebSocket | null>(null);
  
  const reconnectTimeoutsRef = useRef<Record<string, number>>({});
  // Initialize cryptoListRef with fallback crypto symbols
  const cryptoListRef = useRef<{ symbol: string; name: string; id: string }[]>(
    FALLBACK_CRYPTOS.map(c => ({ symbol: c.symbol.toUpperCase(), name: c.name, id: c.id }))
  );
  // Initialize pricesRef with fallback prices
  const pricesRef = useRef<Map<string, CryptoPrice>>(
    new Map(FALLBACK_CRYPTOS.map(c => [c.symbol, c]))
  );
  const lastUpdateTimeRef = useRef<Map<string, number>>(new Map());
  const exchangesConnectedRef = useRef(false);
  const pricesInitializedRef = useRef(false); // Track if prices have been initialized
  
  // Throttle interval - reduced to 1 second for faster UI updates
  const UPDATE_THROTTLE_MS = 1000;
  // Even faster updates for special altcoins
  const FAST_UPDATE_THROTTLE_MS = 500;

  // Update price with source tracking and throttling for readable updates
  const updatePrice = useCallback((symbol: string, updates: Partial<CryptoPrice>, source: string) => {
    const normalizedSymbol = symbol.toLowerCase();
    const now = Date.now();
    
    // CRITICAL: Never overwrite valid prices with zeros
    if (updates.current_price !== undefined && updates.current_price <= 0) {
      delete updates.current_price;
    }
    if (updates.high_24h !== undefined && updates.high_24h <= 0) {
      delete updates.high_24h;
    }
    if (updates.low_24h !== undefined && updates.low_24h <= 0) {
      delete updates.low_24h;
    }
    if (updates.total_volume !== undefined && updates.total_volume <= 0) {
      delete updates.total_volume;
    }
    if (updates.market_cap !== undefined && updates.market_cap <= 0) {
      delete updates.market_cap;
    }
    
    // If no valid updates remain, skip entirely
    if (Object.keys(updates).length === 0) {
      return;
    }
    
    // Use faster throttle for priority altcoins
    const isFastUpdateCrypto = FAST_UPDATE_CRYPTOS.includes(normalizedSymbol);
    const throttleMs = isFastUpdateCrypto ? FAST_UPDATE_THROTTLE_MS : UPDATE_THROTTLE_MS;
    
    // Throttle updates - only update if enough time has passed
    const lastUpdate = lastUpdateTimeRef.current.get(normalizedSymbol) || 0;
    if (now - lastUpdate < throttleMs) {
      return; // Skip this update, too soon
    }
    
    lastUpdateTimeRef.current.set(normalizedSymbol, now);
    
    setPrices(prev => prev.map(coin => {
      if (coin.symbol === normalizedSymbol) {
        // Smart volume handling: WebSocket gives single-exchange volume which is always lower
        // than CoinGecko's aggregated multi-exchange volume
        const finalUpdates = { ...updates };
        
        if (updates.total_volume !== undefined && coin.total_volume > 0) {
          const volumeRatio = updates.total_volume / coin.total_volume;
          
          // Case 1: WebSocket volume is unreasonably low (< 5% of current) - ignore it
          if (volumeRatio < 0.05) {
            delete finalUpdates.total_volume;
          }
          // Case 2: WebSocket volume is significantly higher (> 120%) - could be a spike, use it
          else if (volumeRatio > 1.2) {
            finalUpdates.total_volume = updates.total_volume;
          }
          // Case 3: WebSocket volume is between 5% and 50% of current - blend conservatively
          // This handles single-exchange vs multi-exchange discrepancy
          else if (volumeRatio < 0.5) {
            // Keep mostly the CoinGecko value, slight movement for realism
            finalUpdates.total_volume = coin.total_volume * 0.95 + updates.total_volume * 0.05;
          }
          // Case 4: WebSocket volume is between 50% and 120% - normal range, blend moderately
          else {
            finalUpdates.total_volume = coin.total_volume * 0.8 + updates.total_volume * 0.2;
          }
        }
        
        const updated = {
          ...coin,
          ...finalUpdates,
          lastUpdate: now,
          source,
        };
        pricesRef.current.set(normalizedSymbol, updated);
        return updated;
      }
      return coin;
    }));
  }, []);

  const TOP100_CACHE_KEY = "zikalyze_top100_cache_v1";
  const TOP100_CACHE_TTL_MS = 60 * 60 * 1000; // 1h
  
  // Live prices cache - persists current prices for instant load
  const LIVE_PRICES_CACHE_KEY = "zikalyze_live_prices_v1";
  const LIVE_PRICES_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h - prices are still useful even if stale
  const lastPriceSaveRef = useRef<number>(0);
  const PRICE_SAVE_THROTTLE_MS = 5000; // Save at most every 5 seconds

  const loadCachedTop100 = (): CoinGeckoCoin[] | null => {
    try {
      const raw = localStorage.getItem(TOP100_CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { ts: number; data: CoinGeckoCoin[] };
      if (!parsed?.ts || !Array.isArray(parsed.data)) return null;
      if (Date.now() - parsed.ts > TOP100_CACHE_TTL_MS) return null;
      return parsed.data;
    } catch {
      return null;
    }
  };

  const saveCachedTop100 = (data: CoinGeckoCoin[]) => {
    try {
      localStorage.setItem(TOP100_CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
    } catch {
      // ignore storage errors
    }
  };
  
  // Load persisted live prices
  const loadCachedLivePrices = (): CryptoPrice[] | null => {
    try {
      const raw = localStorage.getItem(LIVE_PRICES_CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { ts: number; data: CryptoPrice[] };
      if (!parsed?.ts || !Array.isArray(parsed.data)) return null;
      if (Date.now() - parsed.ts > LIVE_PRICES_CACHE_TTL_MS) return null;
      // Filter out any with zero prices
      return parsed.data.filter(p => p.current_price > 0);
    } catch {
      return null;
    }
  };
  
  // Save current live prices to localStorage (throttled)
  const saveLivePrices = useCallback((pricesToSave: CryptoPrice[]) => {
    const now = Date.now();
    if (now - lastPriceSaveRef.current < PRICE_SAVE_THROTTLE_MS) return;
    lastPriceSaveRef.current = now;
    
    try {
      // Only save prices with valid data
      const validPrices = pricesToSave.filter(p => p.current_price > 0);
      if (validPrices.length > 0) {
        localStorage.setItem(LIVE_PRICES_CACHE_KEY, JSON.stringify({ 
          ts: now, 
          data: validPrices 
        }));
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const fetchPrices = useCallback(async () => {
    // Prevent re-fetching if already initialized
    if (pricesInitializedRef.current) return;
    pricesInitializedRef.current = true;
    
    // PRIORITY 1: Load persisted live prices first (most recent data)
    // Since we only run once (pricesInitializedRef guards this), prices will be empty here
    const livePricesCache = loadCachedLivePrices();
    if (livePricesCache && livePricesCache.length > 0) {
      // Use live prices cache - these are the most recent prices from last session
      cryptoListRef.current = livePricesCache.map((coin) => ({
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        id: coin.id,
      }));
      
      livePricesCache.forEach((p) => pricesRef.current.set(p.symbol, p));
      setPrices(livePricesCache.map(p => ({ ...p, source: "Restored" })));
      console.log(`[Top100] ✓ Restored ${livePricesCache.length} prices from last session`);
    } else {
      // PRIORITY 2: Fall back to CoinGecko metadata cache
      const cached = loadCachedTop100();
      if (cached && cached.length > 0) {
        const cleanData = cached.filter(
          (coin) =>
            !STABLECOINS.includes(coin.symbol.toLowerCase()) &&
            !STABLECOINS.includes(coin.id.toLowerCase()) &&
            !isUsdPrefixed(coin.symbol)
        );
        const sortedData = cleanData.sort((a, b) => (b.market_cap || 0) - (a.market_cap || 0));
        const filteredData = sortedData.slice(0, 100);
        
        cryptoListRef.current = filteredData.map((coin) => ({
          symbol: coin.symbol.toUpperCase(),
          name: coin.name,
          id: coin.id,
        }));
        
        const initialPrices: CryptoPrice[] = filteredData.map((coin, index) => ({
          id: coin.id,
          symbol: coin.symbol.toLowerCase(),
          name: coin.name,
          image: coin.image,
          current_price: coin.current_price ?? 0,
          price_change_percentage_24h: coin.price_change_percentage_24h ?? 0,
          high_24h: coin.high_24h ?? 0,
          low_24h: coin.low_24h ?? 0,
          total_volume: coin.total_volume ?? 0,
          market_cap: coin.market_cap ?? 0,
          market_cap_rank: coin.market_cap_rank ?? index + 1,
          circulating_supply: coin.circulating_supply ?? 0,
          lastUpdate: Date.now(),
          source: "Cache",
        }));
        
        initialPrices.forEach((p) => pricesRef.current.set(p.symbol, p));
        setPrices(initialPrices);
        console.log('[Top100] Loaded initial prices from metadata cache');
      } else {
        // PRIORITY 3: Use fallback skeleton (loading state)
        const fallbackWithTimestamp = FALLBACK_CRYPTOS.map((c) => ({ ...c, lastUpdate: Date.now() }));
        setPrices(fallbackWithTimestamp);
        fallbackWithTimestamp.forEach((p) => pricesRef.current.set(p.symbol, p));
        cryptoListRef.current = fallbackWithTimestamp.map((coin) => ({
          symbol: coin.symbol.toUpperCase(),
          name: coin.name,
          id: coin.id,
        }));
      }
    }

    const buildTop100 = (coins: CoinGeckoCoin[], source: string) => {
      const cleanData = coins.filter(
        (coin) =>
          !STABLECOINS.includes(coin.symbol.toLowerCase()) &&
          !STABLECOINS.includes(coin.id.toLowerCase()) &&
          !isUsdPrefixed(coin.symbol)
      );

      const sortedData = cleanData.sort((a, b) => (b.market_cap || 0) - (a.market_cap || 0));
      const filteredData = sortedData.slice(0, 100);

      cryptoListRef.current = filteredData.map((coin) => ({
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        id: coin.id,
      }));

      const cryptoPrices: CryptoPrice[] = filteredData.map((coin, index) => ({
        id: coin.id,
        symbol: coin.symbol.toLowerCase(),
        name: coin.name,
        image: coin.image,
        current_price: coin.current_price ?? 0,
        price_change_percentage_24h: coin.price_change_percentage_24h ?? 0,
        high_24h: coin.high_24h ?? 0,
        low_24h: coin.low_24h ?? 0,
        total_volume: coin.total_volume ?? 0,
        market_cap: coin.market_cap ?? 0,
        market_cap_rank: coin.market_cap_rank ?? index + 1,
        circulating_supply: coin.circulating_supply ?? 0,
        lastUpdate: Date.now(),
        source,
      }));
      
      // Merge fallback prices for coins not in the CoinGecko response
      // This ensures DOGE, KAS, ADA, etc. always have prices
      const symbolsInResponse = new Set(cryptoPrices.map(p => p.symbol.toLowerCase()));
      FALLBACK_CRYPTOS.forEach(fallback => {
        if (!symbolsInResponse.has(fallback.symbol.toLowerCase())) {
          // Add fallback coin with its preset price
          cryptoPrices.push({
            ...fallback,
            lastUpdate: Date.now(),
            source: 'Fallback',
          });
          // Also add to cryptoListRef so WebSocket can update it
          cryptoListRef.current.push({
            symbol: fallback.symbol.toUpperCase(),
            name: fallback.name,
            id: fallback.id,
          });
        }
      });

      cryptoPrices.forEach((p) => pricesRef.current.set(p.symbol, p));
      setPrices(cryptoPrices);
      setError(null);
      console.log(`[Top100] ✓ Loaded ${cryptoPrices.length} coins from ${source}`);
    };

    try {
      setLoading(true);

      // Fetch enough rows so that after filtering stablecoins/restakes we still have 100
      const page1Url = `${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false`;
      const page2Url = `${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=2&sparkline=false`;

      const res1 = await safeFetch(page1Url, { timeoutMs: 12000, maxRetries: 2 });

      if (!res1) {
        const cached = loadCachedTop100();
        if (cached) {
          buildTop100(cached, "Cache");
        } else {
          console.log("[CoinGecko] Fetch failed and no cache available");
        }
        return;
      }

      if (res1.status === 429) {
        const cached = loadCachedTop100();
        if (cached) {
          console.log("[CoinGecko] Rate limited, using cache");
          buildTop100(cached, "Cache");
        } else {
          console.log("[CoinGecko] Rate limited and no cache available");
        }
        return;
      }

      if (!res1.ok) {
        throw new Error(`CoinGecko HTTP ${res1.status}`);
      }

      const data1: CoinGeckoCoin[] = await res1.json();

      // If filtering would reduce below 100, grab page 2 too.
      const tentativeClean = data1.filter(
        (coin) =>
          !STABLECOINS.includes(coin.symbol.toLowerCase()) &&
          !STABLECOINS.includes(coin.id.toLowerCase()) &&
          !isUsdPrefixed(coin.symbol)
      );

      let merged = data1;
      if (tentativeClean.length < 120) {
        const res2 = await safeFetch(page2Url, { timeoutMs: 12000, maxRetries: 2 });
        if (res2?.ok) {
          const data2: CoinGeckoCoin[] = await res2.json();
          merged = [...data1, ...data2];
        }
      }

      saveCachedTop100(merged);
      buildTop100(merged, "CoinGecko");
    } catch (err) {
      const cached = loadCachedTop100();
      if (cached) {
        buildTop100(cached, "Cache");
      } else {
        console.log("[CoinGecko] Fetch failed, using fallback data");
      }
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run once on mount, use ref to track initialization

  // Connect to OKX WebSocket - Excellent altcoin coverage including KAS
  const connectOKX = useCallback(() => {
    if (cryptoListRef.current.length === 0) return;
    
    if (okxWsRef.current) {
      try { okxWsRef.current.close(); } catch { /* Ignore close errors */ }
    }

    try {
      const ws = new WebSocket(EXCHANGES.okx.url);
      
      const connectTimeout = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          console.log(`[OKX] Connection timeout, retrying...`);
          ws.close();
        }
      }, 10000);
      
      ws.onopen = () => {
        clearTimeout(connectTimeout);
        console.log(`[OKX] ✓ Connected for altcoin coverage`);
        setConnectedExchanges(prev => 
          prev.includes("OKX") ? prev : [...prev, "OKX"]
        );
        setIsLive(true);
        
        // Subscribe to tickers for symbols with OKX support
        const subscribeArgs = cryptoListRef.current
          .filter(c => OKX_SYMBOLS[c.symbol.toUpperCase()])
          .slice(0, 50)
          .map(c => ({ channel: "tickers", instId: OKX_SYMBOLS[c.symbol.toUpperCase()] }));
        
        if (subscribeArgs.length > 0) {
          ws.send(JSON.stringify({ op: "subscribe", args: subscribeArgs }));
        }
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.arg?.channel === 'tickers' && data.data?.[0]) {
            const ticker = data.data[0];
            const symbol = ticker.instId?.replace('-USDT', '').toUpperCase();
            if (symbol && ticker.last) {
              const price = parseFloat(ticker.last);
              const open = parseFloat(ticker.sodUtc8 || ticker.last);
              const change24h = open > 0 ? ((price - open) / open) * 100 : 0;
              
              updatePrice(symbol, {
                current_price: price,
                price_change_percentage_24h: change24h,
                high_24h: parseFloat(ticker.high24h || '0'),
                low_24h: parseFloat(ticker.low24h || '0'),
                total_volume: parseFloat(ticker.vol24h || '0') * price,
              }, "OKX");
            }
          }
        } catch (e) {
          // Silent parse errors
        }
      };
      
      ws.onerror = () => {
        clearTimeout(connectTimeout);
        console.log(`[OKX] WebSocket error, will retry...`);
      };
      
      ws.onclose = () => {
        clearTimeout(connectTimeout);
        setConnectedExchanges(prev => prev.filter(e => e !== "OKX"));
        
        const delay = Math.min(3000 + Math.random() * 2000, 8000);
        if (reconnectTimeoutsRef.current.okx) {
          clearTimeout(reconnectTimeoutsRef.current.okx);
        }
        reconnectTimeoutsRef.current.okx = window.setTimeout(() => {
          connectOKX();
        }, delay);
      };
      
      okxWsRef.current = ws;
    } catch (err) {
      console.log(`[OKX] Connection failed, retrying...`);
      setTimeout(() => connectOKX(), 3000);
    }
  }, [updatePrice]);

  // Connect to Binance WebSocket - Most reliable free source for real-time prices
  const connectBinance = useCallback(() => {
    if (cryptoListRef.current.length === 0) return;

    // Close existing connection
    if (binanceWsRef.current) {
      try { binanceWsRef.current.close(); } catch { /* Ignore close errors */ }
    }

    const cryptoList = cryptoListRef.current;
    
    // Build combined stream for all symbols (Binance supports up to 1024 streams)
    // Use both ticker and miniTicker for comprehensive data
    const streams = cryptoList
      .slice(0, 100)
      .map(c => `${c.symbol.toLowerCase()}usdt@ticker`)
      .join("/");
    
    try {
      const wsUrl = `${EXCHANGES.binance.combinedUrl}${streams}`;
      console.log(`[Binance] Connecting to ${cryptoList.length} streams...`);
      const ws = new WebSocket(wsUrl);
      
      const connectTimeout = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          console.log(`[Binance] Connection timeout after 8s, trying Bybit fallback...`);
          ws.close();
          // Try Bybit as fallback
          connectBybit();
        }
      }, 8000);
      
      ws.onopen = () => {
        clearTimeout(connectTimeout);
        console.log(`[Binance] ✓ Connected - Real-time prices active`);
        setConnectedExchanges(prev => 
          prev.includes("Binance") ? prev : [...prev, "Binance"]
        );
        setIsLive(true);
      };
      
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.data) {
            const ticker = message.data;
            // Extract symbol: BTCUSDT -> BTC
            const rawSymbol = ticker.s || '';
            const symbol = rawSymbol.replace(/USDT$/, '');
            
            if (symbol && ticker.c) {
              const price = parseFloat(ticker.c);
              const change24h = parseFloat(ticker.P || '0');
              const high24h = parseFloat(ticker.h || '0');
              const low24h = parseFloat(ticker.l || '0');
              const volume = parseFloat(ticker.q || '0'); // Quote volume in USDT
              
              if (price > 0) {
                updatePrice(symbol, {
                  current_price: price,
                  price_change_percentage_24h: change24h,
                  high_24h: high24h,
                  low_24h: low24h,
                  total_volume: volume,
                }, "Binance");
              }
            }
          }
        } catch (e) {
          // Silent parse errors
        }
      };
      
      ws.onerror = (e) => {
        clearTimeout(connectTimeout);
        console.log(`[Binance] WebSocket error, will reconnect...`);
      };
      
      ws.onclose = (e) => {
        clearTimeout(connectTimeout);
        setConnectedExchanges(prev => prev.filter(ex => ex !== "Binance"));
        
        // Reconnect with exponential backoff
        const delay = 2000 + Math.random() * 2000;
        if (reconnectTimeoutsRef.current.binance) {
          clearTimeout(reconnectTimeoutsRef.current.binance);
        }
        console.log(`[Binance] Disconnected (code: ${e.code}), reconnecting in ${Math.round(delay)}ms...`);
        reconnectTimeoutsRef.current.binance = window.setTimeout(() => {
          connectBinance();
        }, delay);
      };
      
      binanceWsRef.current = ws;
    } catch (err) {
      console.log(`[Binance] Connection failed, trying Bybit fallback...`);
      connectBybit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updatePrice]);

  // Connect to Bybit WebSocket - Fast updates, KAS support
  const connectBybit = useCallback(() => {
    if (cryptoListRef.current.length === 0) return;

    if (bybitWsRef.current) {
      try { bybitWsRef.current.close(); } catch { /* Ignore close errors */ }
    }

    try {
      const ws = new WebSocket(EXCHANGES.bybit.url);
      
      ws.onopen = () => {
        console.log(`[Bybit] ✓ Connected for fast updates`);
        setConnectedExchanges(prev => 
          prev.includes("Bybit") ? prev : [...prev, "Bybit"]
        );
        setIsLive(true);
        
        // Subscribe to tickers
        const symbols = cryptoListRef.current
          .filter(c => BYBIT_SYMBOLS[c.symbol.toUpperCase()])
          .slice(0, 30)
          .map(c => `tickers.${BYBIT_SYMBOLS[c.symbol.toUpperCase()]}`);
        
        if (symbols.length > 0) {
          ws.send(JSON.stringify({ op: "subscribe", args: symbols }));
        }
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.topic?.startsWith('tickers.') && data.data) {
            const ticker = data.data;
            const symbol = ticker.symbol?.replace(/USDT$/, '').toUpperCase();
            if (symbol && ticker.lastPrice) {
              updatePrice(symbol, {
                current_price: parseFloat(ticker.lastPrice),
                price_change_percentage_24h: parseFloat(ticker.price24hPcnt || '0') * 100,
                high_24h: parseFloat(ticker.highPrice24h || '0'),
                low_24h: parseFloat(ticker.lowPrice24h || '0'),
                total_volume: parseFloat(ticker.turnover24h || '0'),
              }, "Bybit");
            }
          }
        } catch { /* Ignore parse errors */ }
      };
      
      ws.onclose = () => {
        setConnectedExchanges(prev => prev.filter(e => e !== "Bybit"));
        const delay = 3000 + Math.random() * 2000;
        reconnectTimeoutsRef.current.bybit = window.setTimeout(() => connectBybit(), delay);
      };
      
      bybitWsRef.current = ws;
    } catch (err) {
      setTimeout(() => connectBybit(), 3000);
    }
  }, [updatePrice]);

  // Kraken symbol mapping - only symbols Kraken actually supports
  const KRAKEN_PAIRS: Record<string, string> = {
    BTC: "XBT/USD", ETH: "ETH/USD", SOL: "SOL/USD", XRP: "XRP/USD", DOGE: "DOGE/USD",
    ADA: "ADA/USD", AVAX: "AVAX/USD", DOT: "DOT/USD", LINK: "LINK/USD", LTC: "LTC/USD",
    ATOM: "ATOM/USD", NEAR: "NEAR/USD", FIL: "FIL/USD", SHIB: "SHIB/USD",
    TRX: "TRX/USD", XMR: "XMR/USD", ALGO: "ALGO/USD", XLM: "XLM/USD", ETC: "ETC/USD",
    MATIC: "MATIC/USD", UNI: "UNI/USD", AAVE: "AAVE/USD", MKR: "MKR/USD", GRT: "GRT/USD",
    SAND: "SAND/USD", MANA: "MANA/USD", AXS: "AXS/USD", APE: "APE/USD", CHZ: "CHZ/USD",
    ENJ: "ENJ/USD", BAT: "BAT/USD", COMP: "COMP/USD", SNX: "SNX/USD", CRV: "CRV/USD",
    KSM: "KSM/USD", FLOW: "FLOW/USD", MINA: "MINA/USD", KAVA: "KAVA/USD", ZEC: "ZEC/USD",
  };

  // Connect to Kraken WebSocket - reliable free API with many pairs
  const connectKraken = useCallback(() => {
    if (cryptoListRef.current.length === 0) return;
    
    if (krakenWsRef.current) {
      try { krakenWsRef.current.close(); } catch { /* Ignore close errors */ }
    }

    try {
      const ws = new WebSocket(EXCHANGES.kraken.url);
      
      const connectTimeout = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          console.log(`[Kraken] Connection timeout`);
          ws.close();
        }
      }, 15000);
      
      ws.onopen = () => {
        clearTimeout(connectTimeout);
        console.log(`[Kraken] ✓ Connected - subscribing to ticker feeds`);
        setConnectedExchanges(prev => 
          prev.includes("Kraken") ? prev : [...prev, "Kraken"]
        );
        setIsLive(true);
        
        // Subscribe only to pairs Kraken actually supports
        const pairs: string[] = [];
        cryptoListRef.current.forEach(c => {
          const krakenPair = KRAKEN_PAIRS[c.symbol.toUpperCase()];
          if (krakenPair) {
            pairs.push(krakenPair);
          }
        });
        
        // Kraken allows max 50 pairs per subscription
        const uniquePairs = [...new Set(pairs)].slice(0, 40);
        
        if (uniquePairs.length > 0) {
          console.log(`[Kraken] Subscribing to ${uniquePairs.length} pairs`);
          ws.send(JSON.stringify({
            event: "subscribe",
            pair: uniquePairs,
            subscription: { name: "ticker" },
          }));
        }
      };
      
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          // Handle subscription confirmations
          if (message.event === "subscriptionStatus") {
            if (message.status === "subscribed") {
              console.log(`[Kraken] ✓ Subscribed to ${message.pair}`);
            }
            return;
          }
          
          // Handle heartbeat
          if (message.event === "heartbeat") return;
          
          // Handle ticker data - format: [channelID, tickerData, channelName, pair]
          if (Array.isArray(message) && message.length >= 4) {
            const ticker = message[1];
            const channelName = message[2];
            const pair = message[3] as string;
            
            if (channelName === "ticker" && ticker && pair) {
              // Convert pair to symbol: "XBT/USD" -> "BTC", "ETH/USD" -> "ETH"
              let symbol = pair.replace("/USD", "").replace("/USDT", "");
              if (symbol === "XBT") symbol = "BTC";
              
              const price = parseFloat(ticker.c?.[0] || "0");
              const open = parseFloat(ticker.o?.[1] || ticker.o?.[0] || price.toString());
              const change24h = open > 0 ? ((price - open) / open) * 100 : 0;
              const baseVolume = parseFloat(ticker.v?.[1] || "0");
              
              if (price > 0) {
                updatePrice(symbol, {
                  current_price: price,
                  price_change_percentage_24h: change24h,
                  high_24h: parseFloat(ticker.h?.[1] || "0"),
                  low_24h: parseFloat(ticker.l?.[1] || "0"),
                  total_volume: baseVolume * price,
                }, "Kraken");
              }
            }
          }
        } catch (e) {
          // Silent parse errors
        }
      };
      
      ws.onerror = (e) => {
        clearTimeout(connectTimeout);
        console.log(`[Kraken] WebSocket error`);
      };
      
      ws.onclose = (e) => {
        clearTimeout(connectTimeout);
        setConnectedExchanges(prev => prev.filter(ex => ex !== "Kraken"));
        
        const delay = 3000 + Math.random() * 2000;
        if (reconnectTimeoutsRef.current.kraken) {
          clearTimeout(reconnectTimeoutsRef.current.kraken);
        }
        console.log(`[Kraken] Disconnected, reconnecting in ${Math.round(delay)}ms...`);
        reconnectTimeoutsRef.current.kraken = window.setTimeout(() => {
          connectKraken();
        }, delay);
      };
      
      krakenWsRef.current = ws;
    } catch (err) {
      console.log(`[Kraken] Connection failed, retrying...`);
      setTimeout(() => connectKraken(), 4000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updatePrice]);

  // Initial fetch
  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  // Connect to multi-exchange WebSockets when crypto list is populated
  useEffect(() => {
    const checkAndConnect = () => {
      if (cryptoListRef.current.length > 0 && !exchangesConnectedRef.current) {
        exchangesConnectedRef.current = true;
        
        // Priority: Binance first (most reliable), then OKX + Bybit for altcoins, Kraken for backup
        console.log('[WebSocket] ⚡ Connecting to multiple exchanges for real-time prices...');
        connectBinance();
        // OKX for altcoin coverage (includes KAS)
        setTimeout(() => connectOKX(), 200);
        // Bybit for additional fast updates
        setTimeout(() => connectBybit(), 400);
        // Kraken for additional coverage
        setTimeout(() => connectKraken(), 600);
      }
    };
    
    // Try to connect immediately
    checkAndConnect();
    // Retry check after a short delay in case crypto list wasn't ready
    const timeoutId = setTimeout(checkAndConnect, 500);
    
    return () => {
      clearTimeout(timeoutId);
      
      // Clear reconnect timeouts using current refs
      // Note: Intentionally using .current to clear all current timeouts,
      // including any that may have been added after effect setup
      // eslint-disable-next-line react-hooks/exhaustive-deps
      Object.values(reconnectTimeoutsRef.current).forEach(timeout => {
        clearTimeout(timeout);
      });
      
      // Close all WebSocket connections and clear refs
      // Note: Using .current directly is intentional - we want to close
      // the current active connections at cleanup time, not stale refs
      if (binanceWsRef.current) {
        binanceWsRef.current.close();
        binanceWsRef.current = null;
      }
      if (okxWsRef.current) {
        okxWsRef.current.close();
        okxWsRef.current = null;
      }
      if (bybitWsRef.current) {
        bybitWsRef.current.close();
        bybitWsRef.current = null;
      }
      if (krakenWsRef.current) {
        krakenWsRef.current.close();
        krakenWsRef.current = null;
      }
      if (coinbaseWsRef.current) {
        coinbaseWsRef.current.close();
        coinbaseWsRef.current = null;
      }
    };
  }, [connectBinance, connectOKX, connectBybit, connectKraken]);

  // Track live status
  useEffect(() => {
    setIsLive(connectedExchanges.length > 0);
  }, [connectedExchanges]);

  // Persist live prices to localStorage for session restoration
  useEffect(() => {
    if (prices.length > 0 && isLive) {
      saveLivePrices(prices);
    }
  }, [prices, isLive, saveLivePrices]);

  // CoinCap fallback for coins that still have 0 prices after WebSocket connects
  // This ensures all coins show prices even if WebSocket fails for some symbols
  useEffect(() => {
    const fetchCoinCapFallback = async () => {
      // Wait 5 seconds for WebSocket to populate prices
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Find coins still missing prices
      const missingPrices = prices.filter(p => p.current_price === 0 || !p.current_price);
      if (missingPrices.length === 0) return;
      
      console.log(`[CoinCap] Fetching fallback prices for ${missingPrices.length} coins...`);
      
      try {
        // CoinCap free API - no key required
        const coinCapUrl = 'https://api.coincap.io/v2/assets?limit=200';
        const response = await safeFetch(coinCapUrl, { timeoutMs: 10000, maxRetries: 2 });
        
        if (!response?.ok) {
          console.log('[CoinCap] Fallback fetch failed');
          return;
        }
        
        const data = await response.json();
        if (!data?.data) return;
        
        interface CoinCapAsset {
          id: string;
          symbol: string;
          name: string;
          priceUsd: string;
          changePercent24Hr: string;
          volumeUsd24Hr: string;
          marketCapUsd: string;
          supply: string;
        }
        
        const coinCapData = data.data as CoinCapAsset[];
        
        // Update missing prices
        setPrices(prev => prev.map(coin => {
          if (coin.current_price > 0) return coin; // Already has price
          
          // Try to find matching coin in CoinCap data
          const match = coinCapData.find((cc: CoinCapAsset) => 
            cc.symbol.toLowerCase() === coin.symbol.toLowerCase() ||
            cc.id.toLowerCase() === coin.id.toLowerCase() ||
            COINGECKO_TO_COINCAP[coin.id]?.toLowerCase() === cc.id.toLowerCase()
          );
          
          if (match && match.priceUsd) {
            const price = parseFloat(match.priceUsd);
            if (price > 0) {
              console.log(`[CoinCap] ✓ Filled ${coin.symbol.toUpperCase()} = $${price.toFixed(4)}`);
              return {
                ...coin,
                current_price: price,
                price_change_percentage_24h: parseFloat(match.changePercent24Hr || '0'),
                total_volume: parseFloat(match.volumeUsd24Hr || '0'),
                market_cap: parseFloat(match.marketCapUsd || '0'),
                circulating_supply: parseFloat(match.supply || '0'),
                lastUpdate: Date.now(),
                source: 'CoinCap',
              };
            }
          }
          return coin;
        }));
        
      } catch (err) {
        console.log('[CoinCap] Fallback fetch error:', err);
      }
    };
    
    if (prices.length > 0 && isLive) {
      fetchCoinCapFallback();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLive]); // Only run once when we go live

// All price updates now come from WebSockets - no polling needed

  const getPriceBySymbol = useCallback((symbol: string): CryptoPrice | undefined => {
    return prices.find((p) => p.symbol.toUpperCase() === symbol.toUpperCase());
  }, [prices]);

  const getPriceById = useCallback((id: string): CryptoPrice | undefined => {
    return prices.find((p) => p.id === id);
  }, [prices]);

  return { 
    prices, 
    loading, 
    error, 
    connectedExchanges,
    isLive,
    getPriceBySymbol, 
    getPriceById, 
    refetch: fetchPrices 
  };
};

// Dynamic symbol to ID mapping based on current prices
export const symbolToId: Record<string, string> = {};
