// ═══════════════════════════════════════════════════════════════════════════════
// 🛡️ useBotProtection — React Hook for Bot Protection
// ═══════════════════════════════════════════════════════════════════════════════
// Provides easy-to-use bot protection for React components
// ═══════════════════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  validateRequest,
  generateClientFingerprint,
  detectBotPatterns,
  isSubmissionTooFast,
  isHoneypotTriggered,
  apiRateLimiter,
  analysisRateLimiter,
  authRateLimiter,
  RateLimiter
} from '@/lib/bot-protection';

interface UseBotProtectionOptions {
  limiter?: 'api' | 'analysis' | 'auth' | RateLimiter;
  checkBot?: boolean;
  formProtection?: boolean;
}

interface UseBotProtectionReturn {
  // State
  isBlocked: boolean;
  remainingRequests: number;
  retryAfterSeconds: number;
  clientFingerprint: string;
  isBot: boolean;
  botScore: number;
  
  // Form protection
  formLoadTime: number;
  
  // Actions
  checkRequest: () => { valid: boolean; reason?: string };
  checkFormSubmission: (formData: Record<string, unknown>) => { valid: boolean; reason?: string };
  resetLimit: () => void;
  
  // Honeypot props for hidden fields
  honeypotProps: {
    style: React.CSSProperties;
    tabIndex: number;
    autoComplete: string;
  };
}

/**
 * React hook for bot protection
 */
export function useBotProtection(
  options: UseBotProtectionOptions = {}
): UseBotProtectionReturn {
  const { 
    limiter = 'api', 
    checkBot = true, 
    formProtection = false 
  } = options;
  
  // Get the actual limiter instance
  const getLimiter = useCallback((): RateLimiter => {
    if (typeof limiter === 'object') return limiter;
    switch (limiter) {
      case 'analysis': return analysisRateLimiter;
      case 'auth': return authRateLimiter;
      default: return apiRateLimiter;
    }
  }, [limiter]);
  
  // State
  const [clientFingerprint] = useState(() => generateClientFingerprint());
  const [botCheck] = useState(() => detectBotPatterns());
  const [remainingRequests, setRemainingRequests] = useState(100);
  const [retryAfterSeconds, setRetryAfterSeconds] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  
  // Form load time for timing check
  const formLoadTimeRef = useRef(Date.now());
  
  // Update remaining requests periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const limiterInstance = getLimiter();
      const remaining = limiterInstance.getRemainingRequests(clientFingerprint);
      const blockTime = limiterInstance.getBlockTimeRemaining(clientFingerprint);
      
      setRemainingRequests(remaining);
      setRetryAfterSeconds(Math.ceil(blockTime / 1000));
      setIsBlocked(blockTime > 0);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [clientFingerprint, getLimiter]);
  
  // Reset form load time when formProtection changes
  useEffect(() => {
    if (formProtection) {
      formLoadTimeRef.current = Date.now();
    }
  }, [formProtection]);
  
  /**
   * Check if a request should be allowed
   */
  const checkRequest = useCallback(() => {
    const result = validateRequest({
      key: clientFingerprint,
      limiter: getLimiter(),
      checkBot
    });
    
    if (!result.valid) {
      setIsBlocked(true);
      if (result.retryAfter) {
        setRetryAfterSeconds(result.retryAfter);
      }
    }
    
    return result;
  }, [clientFingerprint, getLimiter, checkBot]);
  
  /**
   * Check form submission for bot indicators
   */
  const checkFormSubmission = useCallback((formData: Record<string, unknown>) => {
    // Check honeypot
    if (isHoneypotTriggered(formData)) {
      return { valid: false, reason: 'Invalid form submission' };
    }
    
    // Check timing
    if (isSubmissionTooFast(formLoadTimeRef.current)) {
      return { valid: false, reason: 'Please take your time filling out the form' };
    }
    
    // Check rate limit
    return checkRequest();
  }, [checkRequest]);
  
  /**
   * Reset rate limit for current client
   */
  const resetLimit = useCallback(() => {
    getLimiter().reset(clientFingerprint);
    setIsBlocked(false);
    setRetryAfterSeconds(0);
    setRemainingRequests(100);
  }, [clientFingerprint, getLimiter]);
  
  // Honeypot field props (hidden from users but visible to bots)
  const honeypotProps = {
    style: {
      position: 'absolute' as const,
      left: '-9999px',
      top: '-9999px',
      opacity: 0,
      height: 0,
      width: 0,
      overflow: 'hidden' as const,
      pointerEvents: 'none' as const
    },
    tabIndex: -1,
    autoComplete: 'off'
  };
  
  return {
    isBlocked,
    remainingRequests,
    retryAfterSeconds,
    clientFingerprint,
    isBot: botCheck.isBot,
    botScore: botCheck.score,
    formLoadTime: formLoadTimeRef.current,
    checkRequest,
    checkFormSubmission,
    resetLimit,
    honeypotProps
  };
}

export default useBotProtection;
