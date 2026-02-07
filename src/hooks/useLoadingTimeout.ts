// ═══════════════════════════════════════════════════════════════════════════════
// ⏱️ useLoadingTimeout — Prevent Components from Hanging in Loading State
// ═══════════════════════════════════════════════════════════════════════════════
// Automatically times out loading states to prevent indefinite hangs
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect, useRef, useState } from 'react';

interface LoadingTimeoutOptions {
  timeout?: number; // Timeout in milliseconds (default: 30000 = 30s)
  onTimeout?: () => void; // Callback when timeout occurs
  resetOnChange?: boolean; // Reset timer when isLoading changes (default: true)
}

interface LoadingTimeoutResult {
  isTimedOut: boolean;
  reset: () => void;
  timeRemaining: number | null;
}

/**
 * Hook to automatically timeout loading states
 * 
 * Usage:
 * ```tsx
 * const { isLoading } = useSomeDataFetch();
 * const { isTimedOut } = useLoadingTimeout(isLoading, {
 *   timeout: 30000,
 *   onTimeout: () => console.log('Loading timed out')
 * });
 * 
 * if (isTimedOut) {
 *   return <ErrorMessage message="Request timed out" />;
 * }
 * ```
 */
export function useLoadingTimeout(
  isLoading: boolean,
  options: LoadingTimeoutOptions = {}
): LoadingTimeoutResult {
  const {
    timeout = 30000,
    onTimeout,
    resetOnChange = true,
  } = options;

  const [isTimedOut, setIsTimedOut] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const reset = () => {
    setIsTimedOut(false);
    setTimeRemaining(null);
    startTimeRef.current = null;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    if (!isLoading) {
      reset();
      return;
    }

    // Reset on change if requested
    if (resetOnChange) {
      reset();
    }

    // Start timer
    startTimeRef.current = Date.now();
    setTimeRemaining(timeout);

    // Set timeout
    timeoutRef.current = setTimeout(() => {
      setIsTimedOut(true);
      setTimeRemaining(0);
      onTimeout?.();
      console.warn(`Loading timeout reached after ${timeout}ms`);
    }, timeout);

    // Update time remaining every second
    intervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const elapsed = Date.now() - startTimeRef.current;
        const remaining = Math.max(0, timeout - elapsed);
        setTimeRemaining(remaining);
      }
    }, 1000);

    return () => {
      reset();
    };
  }, [isLoading, timeout, onTimeout, resetOnChange]);

  return {
    isTimedOut,
    reset,
    timeRemaining,
  };
}

/**
 * Hook for multiple loading states with timeout
 */
export function useMultiLoadingTimeout(
  loadingStates: Record<string, boolean>,
  options: LoadingTimeoutOptions = {}
): Record<string, LoadingTimeoutResult> {
  const results: Record<string, LoadingTimeoutResult> = {};

  Object.entries(loadingStates).forEach(([key, isLoading]) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    results[key] = useLoadingTimeout(isLoading, options);
  });

  return results;
}

/**
 * Hook for loading state with automatic retry
 */
export function useLoadingWithRetry(
  isLoading: boolean,
  retryFn: () => void,
  options: LoadingTimeoutOptions & { maxRetries?: number } = {}
): LoadingTimeoutResult & { retry: () => void; retriesRemaining: number } {
  const { maxRetries = 3, ...timeoutOptions } = options;
  const [retriesRemaining, setRetriesRemaining] = useState(maxRetries);
  const loadingTimeout = useLoadingTimeout(isLoading, {
    ...timeoutOptions,
    onTimeout: () => {
      if (retriesRemaining > 0) {
        console.log(`Loading timed out, retrying... (${retriesRemaining} retries left)`);
        setRetriesRemaining((prev) => prev - 1);
        retryFn();
      } else {
        console.error('Loading timed out, max retries reached');
        timeoutOptions.onTimeout?.();
      }
    },
  });

  const retry = () => {
    setRetriesRemaining(maxRetries);
    loadingTimeout.reset();
    retryFn();
  };

  return {
    ...loadingTimeout,
    retry,
    retriesRemaining,
  };
}

export default useLoadingTimeout;
