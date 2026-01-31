// ═══════════════════════════════════════════════════════════════════════════════
// 🧪 Hanging Prevention Tests — Verify Timeout Mechanisms
// ═══════════════════════════════════════════════════════════════════════════════
// Tests to ensure all timeout mechanisms work correctly
// ═══════════════════════════════════════════════════════════════════════════════

import { describe, it, expect, vi } from 'vitest';
import { withTimeout, withTimeoutNull, TimeoutError } from '../lib/timeoutPromise';
import { safeApiCall } from '../lib/safeApiCall';

describe('Timeout Prevention Mechanisms', () => {
  describe('withTimeout', () => {
    it('should resolve if promise completes before timeout', async () => {
      const promise = new Promise((resolve) => setTimeout(() => resolve('success'), 100));
      const result = await withTimeout(promise, 1000);
      expect(result).toBe('success');
    });

    it('should reject with TimeoutError if promise times out', async () => {
      const promise = new Promise((resolve) => setTimeout(() => resolve('success'), 2000));
      await expect(withTimeout(promise, 100)).rejects.toThrow(TimeoutError);
    });

    it('should use custom error message', async () => {
      const promise = new Promise((resolve) => setTimeout(() => resolve('success'), 2000));
      await expect(withTimeout(promise, 100, 'Custom timeout message'))
        .rejects.toThrow('Custom timeout message');
    });
  });

  describe('withTimeoutNull', () => {
    it('should return value if promise completes before timeout', async () => {
      const promise = new Promise((resolve) => setTimeout(() => resolve('success'), 100));
      const result = await withTimeoutNull(promise, 1000);
      expect(result).toBe('success');
    });

    it('should return null if promise times out', async () => {
      const promise = new Promise((resolve) => setTimeout(() => resolve('success'), 2000));
      const result = await withTimeoutNull(promise, 100);
      expect(result).toBeNull();
    });

    it('should still throw non-timeout errors', async () => {
      const promise = Promise.reject(new Error('Network error'));
      await expect(withTimeoutNull(promise, 1000)).rejects.toThrow('Network error');
    });
  });

  describe('safeApiCall', () => {
    it('should return data on successful API call', async () => {
      const apiCall = vi.fn().mockResolvedValue('data');
      const result = await safeApiCall(apiCall, { timeout: 1000 });
      
      expect(result.data).toBe('data');
      expect(result.error).toBeNull();
      expect(result.isTimeout).toBe(false);
      expect(result.isAborted).toBe(false);
    });

    it('should return null on timeout', async () => {
      const apiCall = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve('data'), 2000))
      );
      const result = await safeApiCall(apiCall, { timeout: 100, retries: 0 });
      
      expect(result.data).toBeNull();
      expect(result.error).toBeInstanceOf(TimeoutError);
      expect(result.isTimeout).toBe(true);
    });

    it('should retry on failure', async () => {
      const apiCall = vi.fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValueOnce('success');
      
      const result = await safeApiCall(apiCall, { 
        timeout: 1000, 
        retries: 3,
        retryDelay: 10 
      });
      
      expect(result.data).toBe('success');
      expect(apiCall).toHaveBeenCalledTimes(3);
    });

    it('should respect abort signal', async () => {
      const controller = new AbortController();
      const apiCall = vi.fn().mockImplementation(
        (signal: AbortSignal) => new Promise((resolve, reject) => {
          signal.addEventListener('abort', () => reject(new Error('AbortError')));
          setTimeout(() => resolve('data'), 1000);
        })
      );
      
      // Abort after 100ms
      setTimeout(() => controller.abort(), 100);
      
      const result = await safeApiCall(apiCall, { 
        timeout: 2000,
        signal: controller.signal,
        retries: 0
      });
      
      expect(result.data).toBeNull();
      expect(result.isAborted).toBe(true);
    });

    it('should call onTimeout callback', async () => {
      const onTimeout = vi.fn();
      const apiCall = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve('data'), 2000))
      );
      
      await safeApiCall(apiCall, { 
        timeout: 100,
        retries: 0,
        onTimeout 
      });
      
      expect(onTimeout).toHaveBeenCalled();
    });

    it('should call onRetry callback', async () => {
      const onRetry = vi.fn();
      const apiCall = vi.fn()
        .mockRejectedValueOnce(new Error('Fail'))
        .mockResolvedValueOnce('success');
      
      await safeApiCall(apiCall, { 
        timeout: 1000,
        retries: 2,
        retryDelay: 10,
        onRetry 
      });
      
      expect(onRetry).toHaveBeenCalledWith(1);
    });
  });

  describe('Real-world scenarios', () => {
    it('should handle slow API with timeout', async () => {
      const slowApi = () => new Promise((resolve) => 
        setTimeout(() => resolve({ data: 'result' }), 5000)
      );
      
      const result = await safeApiCall(
        () => slowApi() as Promise<{ data: string }>,
        { timeout: 1000, retries: 0 }
      );
      
      expect(result.data).toBeNull();
      expect(result.isTimeout).toBe(true);
    });

    it('should handle flaky API with retries', async () => {
      let attempts = 0;
      const flakyApi = () => new Promise((resolve, reject) => {
        attempts++;
        if (attempts < 3) {
          setTimeout(() => reject(new Error('Server error')), 100);
        } else {
          setTimeout(() => resolve({ data: 'success' }), 100);
        }
      });
      
      const result = await safeApiCall(
        () => flakyApi() as Promise<{ data: string }>,
        { timeout: 2000, retries: 3, retryDelay: 100 }
      );
      
      expect(result.data).toEqual({ data: 'success' });
      expect(attempts).toBe(3);
    });

    it('should handle parallel API calls with mixed results', async () => {
      const fastApi = () => new Promise((resolve) => 
        setTimeout(() => resolve('fast'), 100)
      );
      const slowApi = () => new Promise((resolve) => 
        setTimeout(() => resolve('slow'), 5000)
      );
      
      const results = await Promise.all([
        safeApiCall(() => fastApi() as Promise<string>, { timeout: 1000 }),
        safeApiCall(() => slowApi() as Promise<string>, { timeout: 1000 })
      ]);
      
      expect(results[0].data).toBe('fast');
      expect(results[1].isTimeout).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle promise that rejects immediately', async () => {
      const apiCall = vi.fn().mockRejectedValue(new Error('Immediate error'));
      const result = await safeApiCall(apiCall, { timeout: 1000, retries: 0 });
      
      expect(result.data).toBeNull();
      expect(result.error).toBeInstanceOf(Error);
      expect(result.isTimeout).toBe(false);
    });

    it('should handle promise that resolves immediately', async () => {
      const apiCall = vi.fn().mockResolvedValue('immediate');
      const result = await safeApiCall(apiCall, { timeout: 1000 });
      
      expect(result.data).toBe('immediate');
      expect(result.error).toBeNull();
    });

    it('should handle very short timeout', async () => {
      const apiCall = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve('data'), 10))
      );
      const result = await safeApiCall(apiCall, { timeout: 1, retries: 0 });
      
      expect(result.isTimeout).toBe(true);
    });

    it('should handle zero timeout', async () => {
      const apiCall = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve('data'), 10))
      );
      const result = await safeApiCall(apiCall, { timeout: 0, retries: 0 });
      
      expect(result.isTimeout).toBe(true);
    });
  });
});

describe('Integration tests', () => {
  it('should prevent hanging on fetch calls', async () => {
    // Mock a hanging fetch
    global.fetch = vi.fn().mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );
    
    const result = await safeApiCall(
      (signal) => fetch('https://api.example.com/data', { signal }),
      { timeout: 1000, retries: 0 }
    );
    
    expect(result.isTimeout).toBe(true);
  });

  it('should cleanup resources on timeout', async () => {
    const cleanup = vi.fn();
    const apiCall = vi.fn().mockImplementation(
      (signal: AbortSignal) => {
        signal.addEventListener('abort', cleanup);
        return new Promise((resolve) => setTimeout(() => resolve('data'), 5000));
      }
    );
    
    await safeApiCall(apiCall, { timeout: 100, retries: 0 });
    
    // Give time for cleanup
    await new Promise((resolve) => setTimeout(resolve, 50));
    
    expect(cleanup).toHaveBeenCalled();
  });
});
