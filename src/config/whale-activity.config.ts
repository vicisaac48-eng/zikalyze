/**
 * Whale Activity Configuration
 * 
 * ⚠️ CRITICAL CONFIGURATION - Changes affect all 100+ cryptocurrencies
 * 
 * This file controls the whale activity tracking system.
 * Protected by: tests/whale-activity-protection.test.ts
 */

export const WHALE_ACTIVITY_CONFIG = {
  /**
   * Master switch for whale activity tracking
   * 
   * ⚠️ WARNING: Setting to false will:
   * - Disable live whale tracking for ALL cryptocurrencies
   * - Always use derived estimates (less accurate)
   * - Remove competitive advantage
   * - Affect user experience
   * 
   * @default true
   */
  ENABLED: true,
  
  /**
   * Timeout for whale-tracker service calls (milliseconds)
   * 
   * Recommended: 10000-15000ms
   * Too low: May timeout before getting data
   * Too high: Slows down analysis
   * 
   * @default 12000
   */
  SERVICE_TIMEOUT_MS: 12000,
  
  /**
   * Minimum transaction count to consider data "live"
   * 
   * If whale-tracker returns fewer transactions, falls back to derived.
   * 
   * @default 1
   */
  MIN_TRANSACTION_COUNT: 1,
  
  /**
   * Maximum data age to consider "live" (milliseconds)
   * 
   * Whale data older than this will be considered stale.
   * 
   * @default 7200000 (2 hours)
   */
  MAX_DATA_AGE_MS: 2 * 60 * 60 * 1000,
  
  /**
   * Whether to log whale activity details to console
   * 
   * Useful for debugging and monitoring.
   * 
   * @default true
   */
  ENABLE_LOGGING: true,
  
  /**
   * Fallback to derived estimates if APIs fail
   * 
   * ⚠️ Setting to false means no whale data if APIs are down.
   * Recommended: Keep true for reliability.
   * 
   * @default true
   */
  FALLBACK_TO_DERIVED: true,
  
  /**
   * Supported blockchain mapping
   * 
   * Maps cryptocurrency symbols to their blockchain.
   * Used to route to appropriate APIs.
   * 
   * ⚠️ DO NOT modify unless adding new blockchains
   */
  BLOCKCHAIN_SUPPORT: {
    BTC: 'bitcoin',
    ETH: 'ethereum',
    SOL: 'solana',
    BNB: 'bsc',
    MATIC: 'polygon',
    AVAX: 'avalanche',
    // ... see whale-tracker/index.ts for full list
  } as const,
  
  /**
   * API tier preferences
   * 
   * Order matters: tries in sequence until data found
   * 
   * 1. whale-alert: Professional (requires API key)
   * 2. blockchain-api: Free blockchain explorers
   * 3. derived: Fallback estimates
   */
  API_TIER_PRIORITY: ['whale-alert', 'blockchain-api', 'derived'] as const,
};

/**
 * Validate configuration
 * 
 * ⚠️ This function ensures configuration is valid.
 * Called automatically on import.
 */
function validateConfig() {
  if (typeof WHALE_ACTIVITY_CONFIG.ENABLED !== 'boolean') {
    throw new Error('WHALE_ACTIVITY_CONFIG.ENABLED must be a boolean');
  }
  
  if (WHALE_ACTIVITY_CONFIG.SERVICE_TIMEOUT_MS < 5000) {
    console.warn('⚠️ Whale tracker timeout is very low (<5s). May cause failures.');
  }
  
  if (WHALE_ACTIVITY_CONFIG.SERVICE_TIMEOUT_MS > 30000) {
    console.warn('⚠️ Whale tracker timeout is very high (>30s). May slow down analysis.');
  }
  
  if (!WHALE_ACTIVITY_CONFIG.FALLBACK_TO_DERIVED) {
    console.warn('⚠️ Whale tracker fallback is disabled. Users will see no whale data if APIs fail.');
  }
}

// Auto-validate on import
validateConfig();

/**
 * Helper: Check if whale tracking is enabled
 */
export function isWhaleTrackingEnabled(): boolean {
  return WHALE_ACTIVITY_CONFIG.ENABLED;
}

/**
 * Helper: Get service timeout
 */
export function getWhaleServiceTimeout(): number {
  return WHALE_ACTIVITY_CONFIG.SERVICE_TIMEOUT_MS;
}

/**
 * Helper: Check if should fallback to derived
 */
export function shouldFallbackToDerived(): boolean {
  return WHALE_ACTIVITY_CONFIG.FALLBACK_TO_DERIVED;
}

/**
 * Helper: Check if whale data is fresh enough
 */
export function isWhaleDataFresh(dataAgeMs: number): boolean {
  return dataAgeMs < WHALE_ACTIVITY_CONFIG.MAX_DATA_AGE_MS;
}

export default WHALE_ACTIVITY_CONFIG;
