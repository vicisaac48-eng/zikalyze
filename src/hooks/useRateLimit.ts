import { supabase } from "@/integrations/supabase/client";

interface RateLimitResult {
  allowed: boolean;
  attempts: number;
  max_attempts: number;
  retry_after: number;
  block_reason?: string;  // 'ip_spam_block' when IP is blocked for 15 hours
  message?: string;       // User-friendly message for IP spam block
}

export const useRateLimit = () => {
  const checkRateLimit = async (email: string): Promise<RateLimitResult> => {
    try {
      // Use edge function for server-side rate limiting with IP detection
      const { data, error } = await supabase.functions.invoke('check-rate-limit', {
        body: { email: email.toLowerCase(), action: 'check' }
      });

      if (error) {
        console.error('Rate limit check failed:', error);
        // Allow the attempt if rate limit check fails (fail open for UX)
        return { allowed: true, attempts: 0, max_attempts: 5, retry_after: 0 };
      }

      return data as RateLimitResult;
    } catch (err) {
      console.error('Rate limit check error:', err);
      return { allowed: true, attempts: 0, max_attempts: 5, retry_after: 0 };
    }
  };

  const recordLoginAttempt = async (email: string, success: boolean): Promise<void> => {
    try {
      // Use edge function to record attempt with IP
      await supabase.functions.invoke('check-rate-limit', {
        body: { email: email.toLowerCase(), action: 'record', success }
      });
    } catch (err) {
      console.error('Failed to record login attempt:', err);
    }
  };

  const formatRetryAfter = (seconds: number): string => {
    if (seconds >= 3600) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours} hour${hours > 1 ? 's' : ''}${minutes > 0 ? ` ${minutes} minute${minutes > 1 ? 's' : ''}` : ''}`;
    }
    if (seconds >= 60) {
      const minutes = Math.ceil(seconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
    return `${seconds} seconds`;
  };

  return {
    checkRateLimit,
    recordLoginAttempt,
    formatRetryAfter
  };
};
