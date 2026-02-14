import { useState, useEffect } from 'react';

/**
 * Network effective type as reported by the Network Information API
 */
export type NetworkEffectiveType = 'slow-2g' | '2g' | '3g' | '4g' | 'unknown';

/**
 * Hook to detect network connection speed and quality
 * Uses the Network Information API to determine effective connection type
 * 
 * Industry Standard Pattern:
 * - Fast networks (4G/5G/WiFi): Shorter skeleton delays
 * - Slow networks (3G/2G): Longer skeleton delays to give data time to load
 * 
 * @returns {NetworkEffectiveType} The current network effective type
 */
export function useNetworkSpeed(): NetworkEffectiveType {
  const [effectiveType, setEffectiveType] = useState<NetworkEffectiveType>('unknown');

  useEffect(() => {
    // Check if Network Information API is supported
    if (typeof navigator === 'undefined' || !('connection' in navigator)) {
      setEffectiveType('unknown');
      return;
    }

    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (!connection) {
      setEffectiveType('unknown');
      return;
    }

    // Get initial effective type
    const updateEffectiveType = () => {
      const type = connection.effectiveType || 'unknown';
      setEffectiveType(type as NetworkEffectiveType);
    };

    updateEffectiveType();

    // Listen for changes in connection
    const handleChange = () => {
      updateEffectiveType();
    };

    connection.addEventListener('change', handleChange);

    return () => {
      connection.removeEventListener('change', handleChange);
    };
  }, []);

  return effectiveType;
}

/**
 * Get adaptive skeleton delay based on network speed
 * 
 * Industry Standard Timing:
 * - 4g (fast):        200ms - data loads quickly, minimal skeleton
 * - 3g (medium):      400ms - moderate delay for data loading
 * - 2g (slow):        600ms - longer delay for slow connections
 * - slow-2g (crawl):  800ms - maximum delay for very slow connections
 * - unknown:          400ms - safe default for unknown connections
 * 
 * @param effectiveType - The network effective type
 * @returns {number} Skeleton delay in milliseconds
 */
export function getAdaptiveSkeletonDelay(effectiveType: NetworkEffectiveType): number {
  switch (effectiveType) {
    case '4g':
      return 200; // Fast connection - minimal skeleton
    case '3g':
      return 400; // Medium connection - moderate delay
    case '2g':
      return 600; // Slow connection - longer delay
    case 'slow-2g':
      return 800; // Very slow - maximum delay
    case 'unknown':
    default:
      return 400; // Safe default for unknown connections
  }
}
