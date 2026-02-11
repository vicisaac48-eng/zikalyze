# Crypto Price WebSocket Implementation

## Overview

Zikalyze uses **standard industry WebSocket streams** from multiple cryptocurrency exchanges for real-time price data. This document explains the current implementation.

## Exchanges Used

### Primary Exchange: Binance
- **WebSocket URL:** `wss://stream.binance.com:9443/stream`
- **Protocol:** Standard Binance WebSocket API
- **Coverage:** 90+ cryptocurrencies
- **Format:** Combined stream with `/ticker` endpoint
- **Reliability:** ✅ Primary source (highest priority)

### Fallback Exchange 1: OKX
- **WebSocket URL:** `wss://ws.okx.com:8443/ws/v5/public`
- **Protocol:** OKX Public WebSocket API v5
- **Coverage:** 80+ cryptocurrencies (includes KAS)
- **Format:** Subscription-based with ticker channel
- **Reliability:** ✅ Secondary source

### Fallback Exchange 2: Bybit
- **WebSocket URL:** `wss://stream.bybit.com/v5/public/spot`
- **Protocol:** Bybit Spot WebSocket API v5
- **Coverage:** 30+ cryptocurrencies
- **Format:** Topic-based subscription
- **Reliability:** ✅ Tertiary source

### Available Exchanges:
- **Kraken:** `wss://ws.kraken.com` (configured but not actively used)
- **Coinbase:** `wss://ws-feed.exchange.coinbase.com` (configured but not actively used)

## Architecture

### Multi-Exchange Redundancy

```
┌─────────────────────────────────────────┐
│         User Interface                  │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      useTickerLiveStream Hook           │
│   (Manages all WebSocket connections)   │
└─┬─────────┬─────────┬───────────────────┘
  │         │         │
  │         │         │
┌─▼─────┐ ┌─▼─────┐ ┌─▼─────┐
│Binance│ │  OKX  │ │ Bybit │
│  WS   │ │  WS   │ │  WS   │
└───────┘ └───────┘ └───────┘
   ↓         ↓         ↓
 Real-Time Price Updates
```

### Connection Flow

1. **Initialization**
   - Connect to Binance (0ms delay)
   - Connect to OKX (300ms delay)
   - Connect to Bybit (600ms delay)

2. **Redundancy**
   - Multiple sources provide same data
   - Use most recent update from any exchange
   - Each exchange tracks its own symbols

3. **Reconnection**
   - Automatic reconnection on disconnect
   - Exponential backoff with jitter
   - Base delay: 2000ms + random 0-2000ms

## Data Format

### Ticker Update Interface

```typescript
interface TickerUpdate {
  symbol: string;      // e.g., "BTC"
  price: number;       // Current price
  change24h: number;   // 24h change percentage
  high24h: number;     // 24h high price
  low24h: number;      // 24h low price
  volume: number;      // 24h volume in USD
  source: string;      // Exchange name
}
```

### Exchange-Specific Parsing

Each exchange has its own data format. The system automatically parses:

- **Binance:** Combined stream format (`s`, `c`, `P`, `h`, `l`, `q` fields)
- **OKX:** Subscription format (`instId`, `last`, `sodUtc8`, `high24h`, etc.)
- **Bybit:** Topic format (`symbol`, `lastPrice`, `price24hPcnt`, etc.)

## Configuration

### Supported Symbols

**Ticker (10 coins):**
- BTC, ETH, SOL, XRP, DOGE, KAS, ADA, AVAX, LINK, DOT

**Full Coverage (90+ coins):**
See `src/lib/exchange-websockets.ts` for complete symbol mappings per exchange.

### Connection Settings

```typescript
CONNECTION_TIMEOUT_MS = 8000      // 8s timeout before fallback
RECONNECT_BASE_DELAY_MS = 2000   // 2s base reconnection delay
RECONNECT_JITTER_MS = 2000       // 0-2s random jitter
```

## Usage Example

```typescript
import { useTickerLiveStream } from '@/hooks/useTickerLiveStream';

function MyComponent() {
  const { tickerPrices, isConnected, sources, getPrice } = useTickerLiveStream();
  
  const btcData = getPrice('BTC');
  
  return (
    <div>
      <p>BTC Price: ${btcData?.price}</p>
      <p>24h Change: {btcData?.change24h}%</p>
      <p>Sources: {sources.join(', ')}</p>
      <p>Connected: {isConnected ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

## Why This Implementation is Standard

1. **Official APIs:** Uses official WebSocket endpoints from each exchange
2. **Industry Standard:** Follows cryptocurrency exchange WebSocket protocols
3. **Redundancy:** Multiple exchanges ensure data availability
4. **Real-time:** Direct WebSocket connections for instant updates
5. **Scalable:** Can easily add more exchanges or symbols
6. **Reliable:** Automatic reconnection and fallback mechanisms

## Performance

- **Latency:** < 100ms from exchange to UI
- **Update Frequency:** Real-time (as fast as exchange sends)
- **Bandwidth:** Minimal (only ticker data, ~1KB per update)
- **CPU Usage:** Low (efficient parsing, no polling)

## Error Handling

- ✅ Connection timeout (8s)
- ✅ Automatic reconnection
- ✅ Fallback to other exchanges
- ✅ Silent error logging (no UI disruption)
- ✅ Graceful degradation

## Files

| File | Purpose |
|------|---------|
| `src/lib/exchange-websockets.ts` | Exchange configs and parsers |
| `src/hooks/useTickerLiveStream.ts` | Live streaming hook |
| `src/hooks/useLiveMarketData.ts` | Market data hook |
| `src/hooks/useMultiSymbolLivePrice.ts` | Multi-symbol support |
| `src/hooks/useBinanceLivePrice.ts` | Binance-specific hook |

## Conclusion

**The system already uses standard cryptocurrency WebSocket implementations** from industry-leading exchanges. No changes are needed unless you want to add more exchanges, change priorities, or adjust configurations.

This is a **production-ready, industry-standard implementation** that follows best practices for real-time cryptocurrency price streaming.
