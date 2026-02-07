// ═══════════════════════════════════════════════════════════════════════════════
// 🛡️ BOT PROTECTION — Anti-Spam and Rate Limiting Utilities
// ═══════════════════════════════════════════════════════════════════════════════
// Protects the app from:
// - Automated spam/bot attacks
// - API abuse and rate limiting violations
// - Brute force attempts
// - Excessive requests
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Rate limiter configuration
 */
interface RateLimitConfig {
  maxRequests: number;    // Maximum requests allowed
  windowMs: number;       // Time window in milliseconds
  blockDurationMs: number; // How long to block after exceeding limit
}

/**
 * Request tracking entry
 */
interface RequestEntry {
  count: number;
  firstRequest: number;
  blocked: boolean;
  blockedUntil: number;
}

/**
 * Rate Limiter Class
 * Tracks and limits requests per key (IP, user, action, etc.)
 */
class RateLimiter {
  private requests: Map<string, RequestEntry> = new Map();
  private config: RateLimitConfig;
  
  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = {
      maxRequests: config.maxRequests ?? 100,
      windowMs: config.windowMs ?? 60000, // 1 minute default
      blockDurationMs: config.blockDurationMs ?? 300000 // 5 minutes default
    };
    
    // Clean up old entries periodically
    setInterval(() => this.cleanup(), 60000);
  }
  
  /**
   * Check if a request should be allowed
   */
  isAllowed(key: string): boolean {
    const now = Date.now();
    const entry = this.requests.get(key);
    
    if (!entry) {
      // First request from this key
      this.requests.set(key, {
        count: 1,
        firstRequest: now,
        blocked: false,
        blockedUntil: 0
      });
      return true;
    }
    
    // Check if currently blocked
    if (entry.blocked && now < entry.blockedUntil) {
      return false;
    }
    
    // Unblock if block period has passed
    if (entry.blocked && now >= entry.blockedUntil) {
      entry.blocked = false;
      entry.count = 1;
      entry.firstRequest = now;
      return true;
    }
    
    // Check if window has expired
    if (now - entry.firstRequest > this.config.windowMs) {
      entry.count = 1;
      entry.firstRequest = now;
      return true;
    }
    
    // Increment and check limit
    entry.count++;
    
    if (entry.count > this.config.maxRequests) {
      entry.blocked = true;
      entry.blockedUntil = now + this.config.blockDurationMs;
      console.warn(`[BotProtection] Rate limit exceeded for key: ${key.substring(0, 8)}...`);
      return false;
    }
    
    return true;
  }
  
  /**
   * Get remaining requests for a key
   */
  getRemainingRequests(key: string): number {
    const entry = this.requests.get(key);
    if (!entry) return this.config.maxRequests;
    if (entry.blocked) return 0;
    return Math.max(0, this.config.maxRequests - entry.count);
  }
  
  /**
   * Get time until unblocked (ms)
   */
  getBlockTimeRemaining(key: string): number {
    const entry = this.requests.get(key);
    if (!entry || !entry.blocked) return 0;
    return Math.max(0, entry.blockedUntil - Date.now());
  }
  
  /**
   * Reset rate limit for a key
   */
  reset(key: string): void {
    this.requests.delete(key);
  }
  
  /**
   * Cleanup old entries
   */
  private cleanup(): void {
    const now = Date.now();
    const maxAge = this.config.windowMs + this.config.blockDurationMs;
    
    for (const [key, entry] of this.requests.entries()) {
      if (now - entry.firstRequest > maxAge && !entry.blocked) {
        this.requests.delete(key);
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Singleton Rate Limiters for Different Purposes
// ═══════════════════════════════════════════════════════════════════════════════

// API request limiter (100 requests per minute)
export const apiRateLimiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 60000,
  blockDurationMs: 300000
});

// Analysis request limiter (30 requests per minute)
export const analysisRateLimiter = new RateLimiter({
  maxRequests: 30,
  windowMs: 60000,
  blockDurationMs: 600000
});

// Auth attempt limiter (5 attempts per 5 minutes, 15-hour block for spam)
export const authRateLimiter = new RateLimiter({
  maxRequests: 5,
  windowMs: 300000,
  blockDurationMs: 54000000 // 15 hours block for IP spam protection
});

// WebSocket connection limiter (10 connections per minute)
export const wsRateLimiter = new RateLimiter({
  maxRequests: 10,
  windowMs: 60000,
  blockDurationMs: 120000
});

// ═══════════════════════════════════════════════════════════════════════════════
// Bot Detection Utilities
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Check for bot-like behavior patterns
 */
export function detectBotPatterns(): {
  isBot: boolean;
  score: number;
  reasons: string[];
} {
  const reasons: string[] = [];
  let score = 0;
  
  // Check if running in browser
  if (typeof window === 'undefined') {
    reasons.push('No window object');
    score += 50;
  }
  
  // Check for headless browser indicators
  if (typeof navigator !== 'undefined') {
    const ua = navigator.userAgent.toLowerCase();
    
    if (ua.includes('headless')) {
      reasons.push('Headless browser detected');
      score += 40;
    }
    
    if (ua.includes('phantomjs') || ua.includes('selenium')) {
      reasons.push('Automation framework detected');
      score += 50;
    }
    
    // Check webdriver
    if ((navigator as unknown as { webdriver?: boolean }).webdriver) {
      reasons.push('WebDriver detected');
      score += 30;
    }
    
    // Check for missing plugins (common in headless)
    if (navigator.plugins && navigator.plugins.length === 0) {
      reasons.push('No browser plugins');
      score += 10;
    }
    
    // Check for unusual screen dimensions
    if (typeof screen !== 'undefined') {
      if (screen.width === 0 || screen.height === 0) {
        reasons.push('Invalid screen dimensions');
        score += 20;
      }
    }
  }
  
  // Check for automation objects
  if (typeof window !== 'undefined') {
    const automationProps = [
      '__nightmare',
      '_phantom',
      '__selenium_unwrapped',
      '_Selenium_IDE_Recorder',
      'callPhantom',
      '_WEBDRIVER_ELEM_CACHE',
      'webdriver'
    ];
    
    for (const prop of automationProps) {
      if (prop in window) {
        reasons.push(`Automation property found: ${prop}`);
        score += 25;
      }
    }
  }
  
  return {
    isBot: score >= 50,
    score,
    reasons
  };
}

/**
 * Generate a client fingerprint for tracking
 */
export function generateClientFingerprint(): string {
  if (typeof window === 'undefined') {
    return 'server';
  }
  
  const components: string[] = [];
  
  // User agent
  if (navigator.userAgent) {
    components.push(navigator.userAgent);
  }
  
  // Language
  if (navigator.language) {
    components.push(navigator.language);
  }
  
  // Timezone
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);
  
  // Screen info
  if (typeof screen !== 'undefined') {
    components.push(`${screen.width}x${screen.height}x${screen.colorDepth}`);
  }
  
  // Generate hash
  const str = components.join('|');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return Math.abs(hash).toString(36);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Request Throttling
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  let inThrottle = false;
  let lastResult: ReturnType<T> | undefined;
  
  return function(this: unknown, ...args: Parameters<T>): ReturnType<T> | undefined {
    if (!inThrottle) {
      lastResult = func.apply(this, args) as ReturnType<T>;
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
    return lastResult;
  };
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(this: unknown, ...args: Parameters<T>): void {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Honeypot Protection for Forms
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Check if honeypot field was filled (indicates bot)
 */
export function isHoneypotTriggered(formData: Record<string, unknown>): boolean {
  // Common honeypot field names
  const honeypotFields = [
    'website',
    'url',
    'address2',
    'phone2',
    'fax',
    'company_website',
    'hp_field',
    '_gotcha'
  ];
  
  for (const field of honeypotFields) {
    if (formData[field] && String(formData[field]).trim() !== '') {
      console.warn('[BotProtection] Honeypot field triggered');
      return true;
    }
  }
  
  return false;
}

/**
 * Check form submission timing (too fast = likely bot)
 */
export function isSubmissionTooFast(
  formLoadTime: number,
  minTimeMs: number = 2000
): boolean {
  const elapsed = Date.now() - formLoadTime;
  if (elapsed < minTimeMs) {
    console.warn(`[BotProtection] Form submitted too fast: ${elapsed}ms`);
    return true;
  }
  return false;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Request Validation
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Validate request before processing
 */
export function validateRequest(options: {
  key: string;
  limiter?: RateLimiter;
  checkBot?: boolean;
}): {
  valid: boolean;
  reason?: string;
  retryAfter?: number;
} {
  const { key, limiter = apiRateLimiter, checkBot = true } = options;
  
  // Check rate limit
  if (!limiter.isAllowed(key)) {
    const retryAfter = Math.ceil(limiter.getBlockTimeRemaining(key) / 1000);
    return {
      valid: false,
      reason: 'Rate limit exceeded',
      retryAfter
    };
  }
  
  // Check for bot patterns
  if (checkBot) {
    const botCheck = detectBotPatterns();
    if (botCheck.isBot) {
      return {
        valid: false,
        reason: `Bot detected: ${botCheck.reasons.join(', ')}`
      };
    }
  }
  
  return { valid: true };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Exports
// ═══════════════════════════════════════════════════════════════════════════════

export { RateLimiter };
export type { RateLimitConfig, RequestEntry };
