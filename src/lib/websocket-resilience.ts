// ═══════════════════════════════════════════════════════════════════════════════
// 🔌 WebSocket Resilience Utility - Enhanced connection reliability
// ═══════════════════════════════════════════════════════════════════════════════
// Provides exponential backoff, heartbeat monitoring, and network quality detection
// for robust WebSocket connections in low-network environments.
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Exponential backoff calculator with jitter
 * Prevents thundering herd problem and adapts to network conditions
 */
export class ExponentialBackoff {
  private attempt = 0;
  private readonly baseDelay: number;
  private readonly maxDelay: number;
  private readonly jitterFactor: number;

  constructor(
    baseDelay = 1000,    // Start with 1 second
    maxDelay = 60000,    // Cap at 60 seconds
    jitterFactor = 0.3   // 30% random jitter
  ) {
    this.baseDelay = baseDelay;
    this.maxDelay = maxDelay;
    this.jitterFactor = jitterFactor;
  }

  /**
   * Get the next retry delay with exponential backoff and jitter
   */
  getNextDelay(): number {
    // Exponential backoff: delay = baseDelay * 2^attempt
    const exponentialDelay = this.baseDelay * Math.pow(2, this.attempt);
    
    // Cap at maxDelay
    const cappedDelay = Math.min(exponentialDelay, this.maxDelay);
    
    // Add jitter: ±jitterFactor% randomness
    const jitter = cappedDelay * this.jitterFactor * (Math.random() * 2 - 1);
    const finalDelay = Math.max(this.baseDelay, cappedDelay + jitter);
    
    this.attempt++;
    
    console.log(`[Backoff] Attempt ${this.attempt}, delay: ${Math.round(finalDelay)}ms`);
    return finalDelay;
  }

  /**
   * Reset backoff counter after successful connection
   */
  reset(): void {
    this.attempt = 0;
  }

  /**
   * Get current attempt number
   */
  getAttempt(): number {
    return this.attempt;
  }
}

/**
 * Network quality detector
 * Monitors connection performance and adapts timeouts
 */
export class NetworkQualityDetector {
  private connectionTimes: number[] = [];
  private readonly maxSamples = 10;
  private readonly thresholds = {
    excellent: 1000,    // < 1s
    good: 3000,         // < 3s
    fair: 8000,         // < 8s
    poor: 15000,        // < 15s
  };

  /**
   * Record a connection attempt time
   */
  recordConnectionTime(timeMs: number): void {
    this.connectionTimes.push(timeMs);
    if (this.connectionTimes.length > this.maxSamples) {
      this.connectionTimes.shift();
    }
  }

  /**
   * Get average connection time
   */
  getAverageConnectionTime(): number {
    if (this.connectionTimes.length === 0) return 0;
    const sum = this.connectionTimes.reduce((a, b) => a + b, 0);
    return sum / this.connectionTimes.length;
  }

  /**
   * Get network quality rating
   */
  getQuality(): 'excellent' | 'good' | 'fair' | 'poor' | 'unknown' {
    const avgTime = this.getAverageConnectionTime();
    if (avgTime === 0) return 'unknown';
    if (avgTime < this.thresholds.excellent) return 'excellent';
    if (avgTime < this.thresholds.good) return 'good';
    if (avgTime < this.thresholds.fair) return 'fair';
    return 'poor';
  }

  /**
   * Get recommended connection timeout based on network quality
   */
  getRecommendedTimeout(): number {
    const quality = this.getQuality();
    switch (quality) {
      case 'excellent': return 5000;   // Fast network
      case 'good': return 8000;        // Normal network
      case 'fair': return 15000;       // Slow network
      case 'poor': return 25000;       // Very slow network
      default: return 10000;           // Unknown, use default
    }
  }

  /**
   * Reset quality detector
   */
  reset(): void {
    this.connectionTimes = [];
  }
}

/**
 * WebSocket heartbeat monitor
 * Detects stale connections and triggers reconnection
 */
export class HeartbeatMonitor {
  private lastPongTime = Date.now();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private timeoutCheckInterval: NodeJS.Timeout | null = null;
  private readonly heartbeatIntervalMs: number;
  private readonly timeoutMs: number;
  private onTimeout: (() => void) | null = null;
  private onHeartbeat: (() => void) | null = null;

  constructor(
    heartbeatIntervalMs = 30000,  // Send ping every 30 seconds
    timeoutMs = 60000             // Timeout if no pong for 60 seconds
  ) {
    this.heartbeatIntervalMs = heartbeatIntervalMs;
    this.timeoutMs = timeoutMs;
  }

  /**
   * Start heartbeat monitoring
   */
  start(callbacks: {
    onTimeout?: () => void;
    onHeartbeat?: () => void;
  }): void {
    this.stop(); // Clean up any existing intervals
    
    this.onTimeout = callbacks.onTimeout || null;
    this.onHeartbeat = callbacks.onHeartbeat || null;
    this.lastPongTime = Date.now();

    // Send heartbeat at regular intervals
    this.heartbeatInterval = setInterval(() => {
      if (this.onHeartbeat) {
        this.onHeartbeat();
      }
    }, this.heartbeatIntervalMs);

    // Check for timeout
    this.timeoutCheckInterval = setInterval(() => {
      const timeSinceLastPong = Date.now() - this.lastPongTime;
      if (timeSinceLastPong > this.timeoutMs) {
        console.warn(`[Heartbeat] Connection timeout! No response for ${timeSinceLastPong}ms`);
        if (this.onTimeout) {
          this.onTimeout();
        }
      }
    }, 10000); // Check every 10 seconds
  }

  /**
   * Record pong received
   */
  recordPong(): void {
    this.lastPongTime = Date.now();
  }

  /**
   * Stop heartbeat monitoring
   */
  stop(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.timeoutCheckInterval) {
      clearInterval(this.timeoutCheckInterval);
      this.timeoutCheckInterval = null;
    }
  }

  /**
   * Get time since last pong
   */
  getTimeSinceLastPong(): number {
    return Date.now() - this.lastPongTime;
  }
}

/**
 * Connection state manager
 * Tracks connection state and provides intelligent retry logic
 */
export type ConnectionState = 
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'failed';

export class ConnectionStateManager {
  private state: ConnectionState = 'disconnected';
  private listeners: Array<(state: ConnectionState) => void> = [];
  private readonly backoff: ExponentialBackoff;
  private readonly maxAttempts: number;

  constructor(maxAttempts = 10) {
    this.maxAttempts = maxAttempts;
    this.backoff = new ExponentialBackoff();
  }

  /**
   * Get current state
   */
  getState(): ConnectionState {
    return this.state;
  }

  /**
   * Set new state and notify listeners
   */
  setState(newState: ConnectionState): void {
    if (this.state !== newState) {
      this.state = newState;
      this.notifyListeners();
    }
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: ConnectionState) => void): () => void {
    this.listeners.push(listener);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  /**
   * Check if should retry connection
   */
  shouldRetry(): boolean {
    return this.backoff.getAttempt() < this.maxAttempts;
  }

  /**
   * Get next retry delay
   */
  getNextRetryDelay(): number {
    return this.backoff.getNextDelay();
  }

  /**
   * Reset retry counter (call after successful connection)
   */
  resetRetries(): void {
    this.backoff.reset();
  }

  /**
   * Get current attempt number
   */
  getAttemptNumber(): number {
    return this.backoff.getAttempt();
  }
}

/**
 * Data cache for graceful degradation
 * Stores last known good data to show during reconnection
 */
export class DataCache<T> {
  private cache: Map<string, { data: T; timestamp: number }> = new Map();
  private readonly maxAge: number;

  constructor(maxAgeMs = 300000) { // Default: 5 minutes
    this.maxAge = maxAgeMs;
  }

  /**
   * Set cached data
   */
  set(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Get cached data if not stale
   */
  get(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    if (age > this.maxAge) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Check if cache has fresh data
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Get cache age in milliseconds
   */
  getAge(key: string): number | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    return Date.now() - cached.timestamp;
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear stale entries
   */
  clearStale(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.maxAge) {
        this.cache.delete(key);
      }
    }
  }
}
