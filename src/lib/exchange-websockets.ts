// ═══════════════════════════════════════════════════════════════════════════
// Multi-Exchange WebSocket Manager - Real-time price streaming 24/7
// Supports: Binance, OKX, Bybit, Kraken, Coinbase
// ═══════════════════════════════════════════════════════════════════════════

export interface ExchangeConfig {
  name: string;
  url: string;
  combinedUrl?: string;
  maxSymbols: number;
  priority: number;
}

export const EXCHANGE_CONFIGS: Record<string, ExchangeConfig> = {
  binance: {
    name: 'Binance',
    url: 'wss://stream.binance.com:9443/ws',
    combinedUrl: 'wss://stream.binance.com:9443/stream?streams=',
    maxSymbols: 200,
    priority: 1,
  },
  okx: {
    name: 'OKX',
    url: 'wss://ws.okx.com:8443/ws/v5/public',
    maxSymbols: 100,
    priority: 2,
  },
  bybit: {
    name: 'Bybit',
    url: 'wss://stream.bybit.com/v5/public/spot',
    maxSymbols: 100,
    priority: 3,
  },
  kraken: {
    name: 'Kraken',
    url: 'wss://ws.kraken.com',
    maxSymbols: 50,
    priority: 4,
  },
  coinbase: {
    name: 'Coinbase',
    url: 'wss://ws-feed.exchange.coinbase.com',
    maxSymbols: 50,
    priority: 5,
  },
};

// Symbol mappings for each exchange
export const BINANCE_SYMBOLS: Record<string, string> = {
  BTC: 'btcusdt', ETH: 'ethusdt', SOL: 'solusdt', XRP: 'xrpusdt', DOGE: 'dogeusdt',
  BNB: 'bnbusdt', ADA: 'adausdt', AVAX: 'avaxusdt', DOT: 'dotusdt', MATIC: 'maticusdt',
  LINK: 'linkusdt', UNI: 'uniusdt', ATOM: 'atomusdt', LTC: 'ltcusdt', BCH: 'bchusdt',
  NEAR: 'nearusdt', APT: 'aptusdt', FIL: 'filusdt', ARB: 'arbusdt', OP: 'opusdt',
  INJ: 'injusdt', SUI: 'suiusdt', TIA: 'tiausdt', SEI: 'seiusdt', PEPE: 'pepeusdt',
  SHIB: 'shibusdt', TON: 'tonusdt', TAO: 'taousdt', RENDER: 'renderusdt',
  TRX: 'trxusdt', XLM: 'xlmusdt', HBAR: 'hbarusdt', VET: 'vetusdt', ALGO: 'algousdt',
  ICP: 'icpusdt', FTM: 'ftmusdt', ETC: 'etcusdt', AAVE: 'aaveusdt', MKR: 'mkrusdt',
  GRT: 'grtusdt', IMX: 'imxusdt', RUNE: 'runeusdt', STX: 'stxusdt', MINA: 'minausdt',
  FLOW: 'flowusdt', XTZ: 'xtzusdt', EOS: 'eosusdt', NEO: 'neousdt', THETA: 'thetausdt',
  EGLD: 'egldusdt', ROSE: 'roseusdt', ZEC: 'zecusdt', KAVA: 'kavausdt', CFX: 'cfxusdt',
  QNT: 'qntusdt', WLD: 'wldusdt', JUP: 'jupusdt', BONK: 'bonkusdt', WIF: 'wifusdt',
  FLOKI: 'flokiusdt', NOT: 'notusdt', ORDI: 'ordiusdt', BLUR: 'blurusdt',
  PENDLE: 'pendleusdt', STRK: 'strkusdt', XMR: 'xmrusdt', RNDR: 'rndrusdt',
  FET: 'fetusdt', IOTA: 'iotausdt', PYTH: 'pythusdt', JTO: 'jtousdt', DYDX: 'dydxusdt',
  CRV: 'crvusdt', SNX: 'snxusdt', COMP: 'compusdt', LDO: 'ldousdt', ENS: 'ensusdt',
  SAND: 'sandusdt', MANA: 'manausdt', AXS: 'axsusdt', GALA: 'galausdt', APE: 'apeusdt',
  GMT: 'gmtusdt', CHZ: 'chzusdt', ENJ: 'enjusdt', BAT: 'batusdt', CAKE: 'cakeusdt',
  SUSHI: 'sushiusdt', YFI: 'yfiusdt', ONE: 'oneusdt', ZIL: 'zilusdt', MASK: 'maskusdt',
  OCEAN: 'oceanusdt', AGIX: 'agixusdt', AR: 'arusdt', STORJ: 'storjusdt', LPT: 'lptusdt',
};

export const OKX_SYMBOLS: Record<string, string> = {
  BTC: 'BTC-USDT', ETH: 'ETH-USDT', SOL: 'SOL-USDT', XRP: 'XRP-USDT', DOGE: 'DOGE-USDT',
  ADA: 'ADA-USDT', AVAX: 'AVAX-USDT', DOT: 'DOT-USDT', LINK: 'LINK-USDT', LTC: 'LTC-USDT',
  ATOM: 'ATOM-USDT', NEAR: 'NEAR-USDT', APT: 'APT-USDT', FIL: 'FIL-USDT', ARB: 'ARB-USDT',
  OP: 'OP-USDT', INJ: 'INJ-USDT', SUI: 'SUI-USDT', TIA: 'TIA-USDT', PEPE: 'PEPE-USDT',
  SHIB: 'SHIB-USDT', TRX: 'TRX-USDT', XLM: 'XLM-USDT', HBAR: 'HBAR-USDT', VET: 'VET-USDT',
  FTM: 'FTM-USDT', ETC: 'ETC-USDT', AAVE: 'AAVE-USDT', MKR: 'MKR-USDT', GRT: 'GRT-USDT',
  KAS: 'KAS-USDT', TON: 'TON-USDT', TAO: 'TAO-USDT', WLD: 'WLD-USDT', ORDI: 'ORDI-USDT',
  SEI: 'SEI-USDT', STX: 'STX-USDT', MINA: 'MINA-USDT', ALGO: 'ALGO-USDT', ICP: 'ICP-USDT',
};

export const BYBIT_SYMBOLS: Record<string, string> = {
  BTC: 'BTCUSDT', ETH: 'ETHUSDT', SOL: 'SOLUSDT', XRP: 'XRPUSDT', DOGE: 'DOGEUSDT',
  ADA: 'ADAUSDT', AVAX: 'AVAXUSDT', DOT: 'DOTUSDT', LINK: 'LINKUSDT', LTC: 'LTCUSDT',
  ATOM: 'ATOMUSDT', NEAR: 'NEARUSDT', APT: 'APTUSDT', FIL: 'FILUSDT', ARB: 'ARBUSDT',
  OP: 'OPUSDT', INJ: 'INJUSDT', SUI: 'SUIUSDT', TIA: 'TIAUSDT', PEPE: 'PEPEUSDT',
  SHIB: 'SHIBUSDT', TRX: 'TRXUSDT', KAS: 'KASUSDT', TON: 'TONUSDT', WLD: 'WLDUSDT',
  SEI: 'SEIUSDT', ALGO: 'ALGOUSDT', ICP: 'ICPUSDT', HBAR: 'HBARUSDT', VET: 'VETUSDT',
};

export const KRAKEN_SYMBOLS: Record<string, string> = {
  BTC: 'XBT/USD', ETH: 'ETH/USD', SOL: 'SOL/USD', XRP: 'XRP/USD', DOGE: 'DOGE/USD',
  ADA: 'ADA/USD', AVAX: 'AVAX/USD', DOT: 'DOT/USD', LINK: 'LINK/USD', LTC: 'LTC/USD',
  ATOM: 'ATOM/USD', NEAR: 'NEAR/USD', FIL: 'FIL/USD', SHIB: 'SHIB/USD',
  TRX: 'TRX/USD', XMR: 'XMR/USD', ALGO: 'ALGO/USD', XLM: 'XLM/USD', ETC: 'ETC/USD',
  MATIC: 'MATIC/USD', UNI: 'UNI/USD', AAVE: 'AAVE/USD', MKR: 'MKR/USD', GRT: 'GRT/USD',
  SAND: 'SAND/USD', MANA: 'MANA/USD', AXS: 'AXS/USD', APE: 'APE/USD', CHZ: 'CHZ/USD',
  ENJ: 'ENJ/USD', BAT: 'BAT/USD', COMP: 'COMP/USD', SNX: 'SNX/USD', CRV: 'CRV/USD',
  KSM: 'KSM/USD', FLOW: 'FLOW/USD', MINA: 'MINA/USD', KAVA: 'KAVA/USD', ZEC: 'ZEC/USD',
};

export const COINBASE_SYMBOLS: Record<string, string> = {
  BTC: 'BTC-USD', ETH: 'ETH-USD', SOL: 'SOL-USD', XRP: 'XRP-USD', DOGE: 'DOGE-USD',
  ADA: 'ADA-USD', AVAX: 'AVAX-USD', DOT: 'DOT-USD', LINK: 'LINK-USD', LTC: 'LTC-USD',
  ATOM: 'ATOM-USD', NEAR: 'NEAR-USD', APT: 'APT-USD', FIL: 'FIL-USD', SHIB: 'SHIB-USD',
  ALGO: 'ALGO-USD', XLM: 'XLM-USD', AAVE: 'AAVE-USD', MKR: 'MKR-USD', GRT: 'GRT-USD',
  SAND: 'SAND-USD', MANA: 'MANA-USD', AXS: 'AXS-USD', GALA: 'GALA-USD', APE: 'APE-USD',
};

// Get exchange symbol mapping
export const getExchangeSymbol = (symbol: string, exchange: string): string | null => {
  const upperSym = symbol.toUpperCase();
  switch (exchange) {
    case 'binance': return BINANCE_SYMBOLS[upperSym] || null;
    case 'okx': return OKX_SYMBOLS[upperSym] || null;
    case 'bybit': return BYBIT_SYMBOLS[upperSym] || null;
    case 'kraken': return KRAKEN_SYMBOLS[upperSym] || null;
    case 'coinbase': return COINBASE_SYMBOLS[upperSym] || null;
    default: return null;
  }
};

// Parse ticker data from different exchanges
export interface TickerUpdate {
  symbol: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume: number;
  source: string;
}

// Generic WebSocket message data type for ticker parsing
type WebSocketTickerData = Record<string, unknown>;

export const parseBinanceTicker = (data: WebSocketTickerData): TickerUpdate | null => {
  try {
    const ticker = data.data || data;
    if (!ticker?.s || !ticker?.c) return null;
    
    const symbol = ticker.s.replace(/USDT$/, '').toUpperCase();
    return {
      symbol,
      price: parseFloat(ticker.c),
      change24h: parseFloat(ticker.P || '0'),
      high24h: parseFloat(ticker.h || '0'),
      low24h: parseFloat(ticker.l || '0'),
      volume: parseFloat(ticker.q || '0'),
      source: 'Binance',
    };
  } catch {
    return null;
  }
};

export const parseOKXTicker = (data: WebSocketTickerData): TickerUpdate | null => {
  try {
    const dataWithArg = data as { arg?: { channel?: string }; data?: Array<Record<string, unknown>> };
    if (dataWithArg.arg?.channel !== 'tickers' || !dataWithArg.data?.[0]) return null;
    const ticker = dataWithArg.data[0];
    const symbol = (ticker.instId as string)?.replace('-USDT', '').toUpperCase();
    if (!symbol) return null;
    
    return {
      symbol,
      price: parseFloat(ticker.last as string),
      change24h: parseFloat(ticker.sodUtc8 as string) ? ((parseFloat(ticker.last as string) - parseFloat(ticker.sodUtc8 as string)) / parseFloat(ticker.sodUtc8 as string)) * 100 : 0,
      high24h: parseFloat((ticker.high24h as string) || '0'),
      low24h: parseFloat((ticker.low24h as string) || '0'),
      volume: parseFloat((ticker.vol24h as string) || '0') * parseFloat((ticker.last as string) || '1'),
      source: 'OKX',
    };
  } catch {
    return null;
  }
};

export const parseBybitTicker = (data: WebSocketTickerData): TickerUpdate | null => {
  try {
    const typedData = data as { topic?: string; data?: Record<string, unknown> };
    if (typedData.topic !== 'tickers' || !typedData.data) return null;
    const ticker = typedData.data;
    const symbol = (ticker.symbol as string)?.replace(/USDT$/, '').toUpperCase();
    if (!symbol) return null;
    
    return {
      symbol,
      price: parseFloat(ticker.lastPrice as string),
      change24h: parseFloat((ticker.price24hPcnt as string) || '0') * 100,
      high24h: parseFloat((ticker.highPrice24h as string) || '0'),
      low24h: parseFloat((ticker.lowPrice24h as string) || '0'),
      volume: parseFloat((ticker.turnover24h as string) || '0'),
      source: 'Bybit',
    };
  } catch {
    return null;
  }
};

export const parseKrakenTicker = (data: unknown): TickerUpdate | null => {
  try {
    if (!Array.isArray(data) || data.length < 4) return null;
    const ticker = data[1] as Record<string, unknown[]> | undefined;
    const pair = data[3] as string;
    if (!ticker || !pair) return null;
    
    const symbol = pair.replace('/USD', '').replace('XBT', 'BTC').toUpperCase();
    const price = parseFloat((ticker.c?.[0] as string) || '0');
    const open = parseFloat((ticker.o?.[1] as string) || price.toString());
    
    return {
      symbol,
      price,
      change24h: open > 0 ? ((price - open) / open) * 100 : 0,
      high24h: parseFloat((ticker.h?.[1] as string) || '0'),
      low24h: parseFloat((ticker.l?.[1] as string) || '0'),
      volume: parseFloat((ticker.v?.[1] as string) || '0') * price,
      source: 'Kraken',
    };
  } catch {
    return null;
  }
};

export const parseCoinbaseTicker = (data: WebSocketTickerData): TickerUpdate | null => {
  try {
    if (data.type !== 'ticker' || !data.price) return null;
    const symbol = (data.product_id as string)?.replace('-USD', '').toUpperCase();
    if (!symbol) return null;
    
    const price = parseFloat(data.price as string);
    const open = parseFloat((data.open_24h as string) || price.toString());
    
    return {
      symbol,
      price,
      change24h: open > 0 ? ((price - open) / open) * 100 : 0,
      high24h: parseFloat((data.high_24h as string) || '0'),
      low24h: parseFloat((data.low_24h as string) || '0'),
      volume: parseFloat((data.volume_24h as string) || '0') * price,
      source: 'Coinbase',
    };
  } catch {
    return null;
  }
};

// Parse ticker from any exchange
export const parseTickerUpdate = (exchange: string, data: unknown): TickerUpdate | null => {
  const tickerData = data as WebSocketTickerData;
  switch (exchange) {
    case 'binance': return parseBinanceTicker(tickerData);
    case 'okx': return parseOKXTicker(tickerData);
    case 'bybit': return parseBybitTicker(tickerData);
    case 'kraken': return parseKrakenTicker(data);
    case 'coinbase': return parseCoinbaseTicker(tickerData);
    default: return null;
  }
};
