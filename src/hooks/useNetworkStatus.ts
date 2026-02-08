// ═══════════════════════════════════════════════════════════════════════════════
// 🌐 Network Status Hook — Comprehensive connectivity detection and monitoring
// ═══════════════════════════════════════════════════════════════════════════════
// Provides real-time network status, connection quality, and reconnection utilities
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from 'react';

// Network Information API types (not in standard TypeScript)
interface NetworkInformation extends EventTarget {
  effectiveType?: '2g' | '3g' | '4g' | 'slow-2g';
  downlink?: number; // Mbps
  rtt?: number; // Round-trip time in ms
  saveData?: boolean;
  type?: 'bluetooth' | 'cellular' | 'ethernet' | 'none' | 'wifi' | 'wimax' | 'other' | 'unknown';
  onchange?: EventListener;
}

declare global {
  interface Navigator {
    connection?: NetworkInformation;
    mozConnection?: NetworkInformation;
    webkitConnection?: NetworkInformation;
  }
}

export type ConnectionQuality = 'excellent' | 'good' | 'slow' | 'offline' | 'unknown';

export interface NetworkStatus {
  // Basic status
  isOnline: boolean;
  isOffline: boolean;
  
  // Connection quality
  connectionQuality: ConnectionQuality;
  effectiveType: string | null;
  downlink: number | null; // Mbps
  rtt: number | null; // Round-trip time in ms
  saveData: boolean;
  connectionType: string | null;
  
  // Timing information
  lastOnlineTime: number | null;
  lastOfflineTime: number | null;
  offlineDuration: number | null; // ms since went offline
  
  // State changes
  wasOffline: boolean; // Was offline but now back online (for recovery UI)
  isReconnecting: boolean;
  reconnectAttempts: number;
}

export interface UseNetworkStatusOptions {
  /** Time in ms to wait before showing "was offline" recovery state (default: 3000) */
  recoveryDisplayDuration?: number;
  /** Enable automatic reconnection detection (default: true) */
  enableReconnectionTracking?: boolean;
}

const DEFAULT_OPTIONS: Required<UseNetworkStatusOptions> = {
  recoveryDisplayDuration: 3000,
  enableReconnectionTracking: true,
};

/**
 * Get the Network Information API connection object (with vendor prefixes)
 */
function getNetworkConnection(): NetworkInformation | null {
  if (typeof navigator === 'undefined') return null;
  return navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
}

/**
 * Determine connection quality based on Network Information API data
 */
function determineConnectionQuality(
  isOnline: boolean,
  connection: NetworkInformation | null
): ConnectionQuality {
  if (!isOnline) return 'offline';
  
  if (!connection) return 'unknown';
  
  const effectiveType = connection.effectiveType;
  const rtt = connection.rtt;
  const downlink = connection.downlink;
  
  // Check effective type first
  if (effectiveType === 'slow-2g' || effectiveType === '2g') {
    return 'slow';
  }
  
  if (effectiveType === '3g') {
    // 3G can be borderline, check RTT
    if (rtt && rtt > 400) return 'slow';
    return 'good';
  }
  
  if (effectiveType === '4g') {
    // 4G is typically good, but verify with RTT
    if (rtt && rtt > 300) return 'good';
    if (downlink && downlink > 5) return 'excellent';
    return 'good';
  }
  
  // Fallback to RTT/downlink based assessment
  if (rtt) {
    if (rtt > 500) return 'slow';
    if (rtt > 200) return 'good';
    return 'excellent';
  }
  
  if (downlink) {
    if (downlink < 1) return 'slow';
    if (downlink < 5) return 'good';
    return 'excellent';
  }
  
  return 'unknown';
}

/**
 * Hook to monitor network connectivity status
 * 
 * Features:
 * - Online/offline detection
 * - Connection quality assessment (via Network Information API)
 * - Timing of connection changes
 * - Recovery state tracking for UI feedback
 * 
 * Usage:
 * ```tsx
 * const { isOnline, connectionQuality, wasOffline } = useNetworkStatus();
 * 
 * if (!isOnline) {
 *   return <OfflineBanner />;
 * }
 * 
 * if (wasOffline) {
 *   return <ReconnectedBanner />;
 * }
 * 
 * if (connectionQuality === 'slow') {
 *   return <SlowConnectionWarning />;
 * }
 * ```
 */
export function useNetworkStatus(options: UseNetworkStatusOptions = {}): NetworkStatus {
  const config = { ...DEFAULT_OPTIONS, ...options };
  
  // Core state
  const [isOnline, setIsOnline] = useState<boolean>(() => 
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  
  // Connection quality state
  const [effectiveType, setEffectiveType] = useState<string | null>(null);
  const [downlink, setDownlink] = useState<number | null>(null);
  const [rtt, setRtt] = useState<number | null>(null);
  const [saveData, setSaveData] = useState<boolean>(false);
  const [connectionType, setConnectionType] = useState<string | null>(null);
  
  // Timing state
  const [lastOnlineTime, setLastOnlineTime] = useState<number | null>(null);
  const [lastOfflineTime, setLastOfflineTime] = useState<number | null>(null);
  
  // Recovery state
  const [wasOffline, setWasOffline] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  // Refs for cleanup
  const recoveryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Update connection info from Network Information API
  const updateConnectionInfo = useCallback(() => {
    const connection = getNetworkConnection();
    if (connection) {
      setEffectiveType(connection.effectiveType || null);
      setDownlink(connection.downlink ?? null);
      setRtt(connection.rtt ?? null);
      setSaveData(connection.saveData ?? false);
      setConnectionType(connection.type || null);
    }
  }, []);
  
  // Handle online event
  const handleOnline = useCallback(() => {
    const now = Date.now();
    setIsOnline(true);
    setLastOnlineTime(now);
    setIsReconnecting(false);
    setReconnectAttempts(0);
    
    // Set recovery state to show "back online" UI
    setWasOffline(true);
    
    // Clear recovery state after configured duration
    if (recoveryTimeoutRef.current) {
      clearTimeout(recoveryTimeoutRef.current);
    }
    recoveryTimeoutRef.current = setTimeout(() => {
      setWasOffline(false);
    }, config.recoveryDisplayDuration);
    
    updateConnectionInfo();
    console.log('[NetworkStatus] Connection restored');
  }, [config.recoveryDisplayDuration, updateConnectionInfo]);
  
  // Handle offline event
  const handleOffline = useCallback(() => {
    const now = Date.now();
    setIsOnline(false);
    setLastOfflineTime(now);
    
    if (config.enableReconnectionTracking) {
      setIsReconnecting(true);
    }
    
    console.log('[NetworkStatus] Connection lost');
  }, [config.enableReconnectionTracking]);
  
  // Handle Network Information API changes
  const handleConnectionChange = useCallback(() => {
    updateConnectionInfo();
    console.log('[NetworkStatus] Connection quality changed');
  }, [updateConnectionInfo]);
  
  // Set up event listeners
  useEffect(() => {
    // Initial connection info
    updateConnectionInfo();
    
    // Online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Network Information API change events
    const connection = getNetworkConnection();
    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }
      
      if (recoveryTimeoutRef.current) {
        clearTimeout(recoveryTimeoutRef.current);
      }
      
      if (reconnectCheckIntervalRef.current) {
        clearInterval(reconnectCheckIntervalRef.current);
      }
    };
  }, [handleOnline, handleOffline, handleConnectionChange, updateConnectionInfo]);
  
  // Track reconnection attempts while offline
  useEffect(() => {
    if (!isOnline && config.enableReconnectionTracking) {
      // Check periodically if we're back online
      reconnectCheckIntervalRef.current = setInterval(() => {
        if (!navigator.onLine) {
          setReconnectAttempts(prev => prev + 1);
        }
      }, 5000);
      
      return () => {
        if (reconnectCheckIntervalRef.current) {
          clearInterval(reconnectCheckIntervalRef.current);
        }
      };
    }
  }, [isOnline, config.enableReconnectionTracking]);
  
  // Calculate derived values
  const connectionQuality = determineConnectionQuality(isOnline, getNetworkConnection());
  const offlineDuration = !isOnline && lastOfflineTime ? Date.now() - lastOfflineTime : null;
  
  return {
    // Basic status
    isOnline,
    isOffline: !isOnline,
    
    // Connection quality
    connectionQuality,
    effectiveType,
    downlink,
    rtt,
    saveData,
    connectionType,
    
    // Timing information
    lastOnlineTime,
    lastOfflineTime,
    offlineDuration,
    
    // State changes
    wasOffline,
    isReconnecting,
    reconnectAttempts,
  };
}

/**
 * Utility to format offline duration for display
 */
export function formatOfflineDuration(durationMs: number | null): string {
  if (durationMs === null) return '';
  
  const seconds = Math.floor(durationMs / 1000);
  if (seconds < 60) return `${seconds}s`;
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
  
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

/**
 * Utility to get user-friendly connection quality label
 */
export function getConnectionQualityLabel(quality: ConnectionQuality): string {
  switch (quality) {
    case 'excellent': return 'Excellent';
    case 'good': return 'Good';
    case 'slow': return 'Slow';
    case 'offline': return 'Offline';
    case 'unknown': return 'Unknown';
    default: return 'Unknown';
  }
}

export default useNetworkStatus;
