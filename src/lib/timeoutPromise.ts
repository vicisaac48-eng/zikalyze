// ═══════════════════════════════════════════════════════════════════════════════
// ⏱️ Promise Timeout Utilities — Prevent Promises from Hanging
// ═══════════════════════════════════════════════════════════════════════════════
// Provides utilities to add timeouts to promises and prevent hanging operations
// ═══════════════════════════════════════════════════════════════════════════════

export class TimeoutError extends Error {
  constructor(message: string = 'Operation timed out') {
    super(message);
    this.name = 'TimeoutError';
  }
}

/**
 * Wrap a promise with a timeout
 * Rejects with TimeoutError if the promise doesn't resolve within the specified time
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage?: string
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new TimeoutError(errorMessage || `Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise
      .then((result) => {
        clearTimeout(timeoutId);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}

/**
 * Wrap a promise with a timeout and return null on timeout instead of throwing
 */
export async function withTimeoutNull<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T | null> {
  try {
    return await withTimeout(promise, timeoutMs);
  } catch (error) {
    if (error instanceof TimeoutError) {
      console.warn(`Promise timed out after ${timeoutMs}ms`);
      return null;
    }
    throw error;
  }
}

/**
 * Wrap a promise with a timeout and return a fallback value on timeout
 */
export async function withTimeoutFallback<T>(
  promise: Promise<T>,
  timeoutMs: number,
  fallbackValue: T
): Promise<T> {
  try {
    return await withTimeout(promise, timeoutMs);
  } catch (error) {
    if (error instanceof TimeoutError) {
      console.warn(`Promise timed out after ${timeoutMs}ms, using fallback`);
      return fallbackValue;
    }
    throw error;
  }
}

/**
 * Wrap multiple promises with individual timeouts
 */
export function withTimeoutAll<T>(
  promises: Promise<T>[],
  timeoutMs: number
): Promise<(T | null)[]> {
  return Promise.all(
    promises.map((promise) => withTimeoutNull(promise, timeoutMs))
  );
}

/**
 * Race multiple promises with a timeout
 */
export function raceWithTimeout<T>(
  promises: Promise<T>[],
  timeoutMs: number
): Promise<T> {
  return withTimeout(
    Promise.race(promises),
    timeoutMs,
    `Race timed out after ${timeoutMs}ms`
  );
}

/**
 * Retry a promise with exponential backoff and timeout
 */
export async function retryWithTimeout<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    timeoutMs?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    timeoutMs = 30000,
    baseDelayMs = 1000,
    maxDelayMs = 10000,
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await withTimeout(fn(), timeoutMs);
    } catch (error) {
      lastError = error as Error;

      // Don't retry on timeout or if it's the last attempt
      if (error instanceof TimeoutError || attempt === maxRetries) {
        throw error;
      }

      // Calculate exponential backoff delay
      const delay = Math.min(
        baseDelayMs * Math.pow(2, attempt) + Math.random() * 500,
        maxDelayMs
      );

      console.warn(
        `Attempt ${attempt + 1}/${maxRetries + 1} failed, retrying in ${Math.round(delay)}ms...`
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Retry failed');
}

/**
 * Create an abortable promise with timeout
 */
export function withAbortAndTimeout<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number,
  errorMessage?: string
): { promise: Promise<T>; abort: () => void } {
  const controller = new AbortController();

  const promise = new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      controller.abort();
      reject(new TimeoutError(errorMessage || `Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    fn(controller.signal)
      .then((result) => {
        clearTimeout(timeoutId);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });

  return {
    promise,
    abort: () => controller.abort(),
  };
}

export default withTimeout;
