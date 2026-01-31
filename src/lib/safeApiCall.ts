// ═══════════════════════════════════════════════════════════════════════════════
// 🛡️ API Call Wrapper — Comprehensive Hanging Prevention for All API Calls
// ═══════════════════════════════════════════════════════════════════════════════
// Wraps all API calls with timeout, retry, and abort controller support
// ═══════════════════════════════════════════════════════════════════════════════

import { withTimeout, TimeoutError } from './timeoutPromise';

export interface ApiCallOptions {
  timeout?: number; // Timeout in milliseconds (default: 30000 = 30s)
  retries?: number; // Number of retries (default: 2)
  retryDelay?: number; // Base delay between retries in ms (default: 1000)
  signal?: AbortSignal; // External abort signal for cancellation
  onTimeout?: () => void; // Callback when timeout occurs
  onRetry?: (attempt: number) => void; // Callback on retry attempts
  throwOnTimeout?: boolean; // Whether to throw on timeout (default: false, returns null)
}

export interface ApiCallResult<T> {
  data: T | null;
  error: Error | null;
  isTimeout: boolean;
  isAborted: boolean;
  attempts: number;
}

/**
 * Wrap an API call with comprehensive hanging prevention
 * 
 * Features:
 * - Automatic timeout protection
 * - Retry with exponential backoff
 * - Abort controller support for cancellation
 * - Detailed error handling
 * - Graceful degradation on failure
 * 
 * Usage:
 * ```tsx
 * const result = await safeApiCall(
 *   () => fetch('https://api.example.com/data'),
 *   { timeout: 15000, retries: 3 }
 * );
 * 
 * if (result.data) {
 *   // Use data
 * } else if (result.isTimeout) {
 *   // Handle timeout
 * }
 * ```
 */
export async function safeApiCall<T>(
  apiCall: (signal: AbortSignal) => Promise<T>,
  options: ApiCallOptions = {}
): Promise<ApiCallResult<T>> {
  const {
    timeout = 30000,
    retries = 2,
    retryDelay = 1000,
    signal: externalSignal,
    onTimeout,
    onRetry,
    throwOnTimeout = false,
  } = options;

  let lastError: Error | null = null;
  let attempts = 0;
  let isTimeout = false;
  let isAborted = false;

  for (let attempt = 0; attempt <= retries; attempt++) {
    attempts = attempt + 1;

    // Create internal abort controller
    const internalController = new AbortController();
    
    // Link with external signal if provided
    const cleanup = externalSignal?.addEventListener('abort', () => {
      internalController.abort();
    });

    try {
      // Call API with timeout
      const data = await withTimeout(
        apiCall(internalController.signal),
        timeout,
        `API call timed out after ${timeout}ms`
      );

      cleanup?.();
      return {
        data,
        error: null,
        isTimeout: false,
        isAborted: false,
        attempts,
      };
    } catch (error) {
      cleanup?.();
      lastError = error as Error;

      // Check if aborted
      if ((error as Error).name === 'AbortError' || externalSignal?.aborted) {
        isAborted = true;
        console.log(`[SafeApiCall] Request aborted (attempt ${attempt + 1}/${retries + 1})`);
        
        // Don't retry on abort
        break;
      }

      // Check if timeout
      if (error instanceof TimeoutError) {
        isTimeout = true;
        onTimeout?.();
        console.warn(
          `[SafeApiCall] Timeout on attempt ${attempt + 1}/${retries + 1}`
        );
      } else {
        console.warn(
          `[SafeApiCall] Error on attempt ${attempt + 1}/${retries + 1}:`,
          (error as Error).message
        );
      }

      // Don't retry on last attempt
      if (attempt === retries) {
        break;
      }

      // Calculate exponential backoff
      const delay = Math.min(retryDelay * Math.pow(2, attempt), 10000);
      
      onRetry?.(attempt + 1);
      console.log(`[SafeApiCall] Retrying in ${delay}ms...`);
      
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // Return result with error
  if (throwOnTimeout && isTimeout) {
    throw new TimeoutError(`API call timed out after ${attempts} attempts`);
  }

  return {
    data: null,
    error: lastError,
    isTimeout,
    isAborted,
    attempts,
  };
}

/**
 * Wrapper for fetch calls with hanging prevention
 */
export async function safeFetchCall<T = any>(
  url: string,
  fetchOptions: RequestInit = {},
  options: ApiCallOptions = {}
): Promise<ApiCallResult<T>> {
  return safeApiCall(
    async (signal) => {
      const response = await fetch(url, {
        ...fetchOptions,
        signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json() as T;
    },
    options
  );
}

/**
 * Wrapper for multiple API calls in parallel with timeout
 */
export async function safeParallelApiCalls<T>(
  apiCalls: Array<(signal: AbortSignal) => Promise<T>>,
  options: ApiCallOptions = {}
): Promise<ApiCallResult<T>[]> {
  return Promise.all(
    apiCalls.map((apiCall) => safeApiCall(apiCall, options))
  );
}

/**
 * Wrapper for sequential API calls with timeout
 */
export async function safeSequentialApiCalls<T>(
  apiCalls: Array<(signal: AbortSignal) => Promise<T>>,
  options: ApiCallOptions = {}
): Promise<ApiCallResult<T>[]> {
  const results: ApiCallResult<T>[] = [];

  for (const apiCall of apiCalls) {
    const result = await safeApiCall(apiCall, options);
    results.push(result);

    // Stop on first failure if abort signal is provided
    if (options.signal?.aborted) {
      break;
    }
  }

  return results;
}

/**
 * Create a cached API call wrapper with timeout
 */
export function createCachedApiCall<T>(
  apiCall: (signal: AbortSignal) => Promise<T>,
  cacheKey: string,
  cacheTimeMs: number = 60000 // 1 minute default cache
) {
  const cache = new Map<string, { data: T; timestamp: number }>();

  return async (
    options: ApiCallOptions = {}
  ): Promise<ApiCallResult<T>> => {
    // Check cache
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cacheTimeMs) {
      return {
        data: cached.data,
        error: null,
        isTimeout: false,
        isAborted: false,
        attempts: 0,
      };
    }

    // Make API call
    const result = await safeApiCall(apiCall, options);

    // Cache successful result
    if (result.data !== null) {
      cache.set(cacheKey, {
        data: result.data,
        timestamp: Date.now(),
      });
    }

    return result;
  };
}

export default safeApiCall;
