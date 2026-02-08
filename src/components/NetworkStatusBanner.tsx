// ═══════════════════════════════════════════════════════════════════════════════
// 🌐 Network Status Banner — Visual indicator for connectivity issues
// ═══════════════════════════════════════════════════════════════════════════════
// Shows non-intrusive banners for offline, slow connection, and recovery states
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect, useState } from 'react';
import { Wifi, WifiOff, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNetworkStatus, formatOfflineDuration } from '@/hooks/useNetworkStatus';

export interface NetworkStatusBannerProps {
  /** Class name for the banner container */
  className?: string;
  /** Whether to show slow connection warnings (default: true) */
  showSlowConnectionWarning?: boolean;
  /** Whether to show recovery notification (default: true) */
  showRecoveryNotification?: boolean;
  /** Position of the banner */
  position?: 'top' | 'bottom';
  /** Callback when user dismisses the banner */
  onDismiss?: () => void;
}

/**
 * A network status banner that automatically shows/hides based on connectivity
 * 
 * Features:
 * - Shows when offline with offline duration
 * - Shows slow connection warning
 * - Shows recovery notification when back online
 * - Non-blocking and dismissible
 * 
 * Usage:
 * ```tsx
 * // In your app layout
 * <NetworkStatusBanner position="bottom" />
 * ```
 */
export function NetworkStatusBanner({
  className,
  showSlowConnectionWarning = true,
  showRecoveryNotification = true,
  position = 'bottom',
  onDismiss,
}: NetworkStatusBannerProps) {
  const { 
    isOnline, 
    isOffline, 
    connectionQuality, 
    wasOffline, 
    offlineDuration,
    isReconnecting,
    reconnectAttempts,
  } = useNetworkStatus();
  
  const [dismissed, setDismissed] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  
  // Reset dismissed state when connection changes
  useEffect(() => {
    if (isOffline) {
      setDismissed(false);
    }
  }, [isOffline]);
  
  // Show recovery notification
  useEffect(() => {
    if (wasOffline && showRecoveryNotification) {
      setShowRecovery(true);
      const timeout = setTimeout(() => {
        setShowRecovery(false);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [wasOffline, showRecoveryNotification]);
  
  // Determine what to show
  const showOffline = isOffline && !dismissed;
  const showSlow = showSlowConnectionWarning && isOnline && connectionQuality === 'slow' && !dismissed;
  const showRecoveryBanner = showRecovery && !isOffline;
  
  // Don't render if nothing to show
  if (!showOffline && !showSlow && !showRecoveryBanner) {
    return null;
  }
  
  const handleDismiss = () => {
    setDismissed(true);
    setShowRecovery(false);
    onDismiss?.();
  };
  
  // Offline banner
  if (showOffline) {
    return (
      <div
        className={cn(
          'fixed left-0 right-0 z-50 p-3 bg-destructive/95 text-destructive-foreground shadow-lg backdrop-blur-sm',
          position === 'top' ? 'top-0' : 'bottom-0',
          className
        )}
        role="alert"
        aria-live="assertive"
      >
        <div className="flex items-center justify-between max-w-screen-lg mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {isReconnecting ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <WifiOff className="h-5 w-5" />
              )}
            </div>
            <div>
              <p className="font-medium text-sm">
                {isReconnecting ? 'Reconnecting...' : "You're offline"}
              </p>
              <p className="text-xs opacity-90">
                {offlineDuration ? (
                  <>Offline for {formatOfflineDuration(offlineDuration)}</>
                ) : (
                  'Check your internet connection'
                )}
                {reconnectAttempts > 0 && ` • ${reconnectAttempts} reconnect attempts`}
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-white/10 rounded-md transition-colors"
            aria-label="Dismiss notification"
          >
            <span className="sr-only">Dismiss</span>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  }
  
  // Slow connection banner
  if (showSlow) {
    return (
      <div
        className={cn(
          'fixed left-0 right-0 z-50 p-3 bg-warning/95 text-warning-foreground shadow-lg backdrop-blur-sm',
          position === 'top' ? 'top-0' : 'bottom-0',
          className
        )}
        role="alert"
        aria-live="polite"
      >
        <div className="flex items-center justify-between max-w-screen-lg mx-auto">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5" />
            <div>
              <p className="font-medium text-sm">Slow connection detected</p>
              <p className="text-xs opacity-90">
                Some features may take longer to load
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-black/10 rounded-md transition-colors"
            aria-label="Dismiss notification"
          >
            <span className="sr-only">Dismiss</span>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  }
  
  // Recovery banner
  if (showRecoveryBanner) {
    return (
      <div
        className={cn(
          'fixed left-0 right-0 z-50 p-3 bg-primary/95 text-primary-foreground shadow-lg backdrop-blur-sm transition-all duration-300',
          position === 'top' ? 'top-0' : 'bottom-0',
          className
        )}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center justify-center max-w-screen-lg mx-auto gap-3">
          <CheckCircle className="h-5 w-5" />
          <p className="font-medium text-sm">You're back online</p>
          <Wifi className="h-4 w-4" />
        </div>
      </div>
    );
  }
  
  return null;
}

/**
 * Compact inline network status indicator
 * 
 * Usage:
 * ```tsx
 * <NetworkStatusIndicator /> // Shows a small dot/icon based on status
 * ```
 */
export function NetworkStatusIndicator({ className }: { className?: string }) {
  const { isOnline, connectionQuality } = useNetworkStatus();
  
  if (!isOnline) {
    return (
      <div 
        className={cn('flex items-center gap-1 text-destructive', className)}
        title="Offline"
      >
        <WifiOff className="h-4 w-4" />
      </div>
    );
  }
  
  if (connectionQuality === 'slow') {
    return (
      <div 
        className={cn('flex items-center gap-1 text-warning', className)}
        title="Slow connection"
      >
        <AlertTriangle className="h-4 w-4" />
      </div>
    );
  }
  
  // Online with good connection - show subtle indicator
  return (
    <div 
      className={cn('flex items-center gap-1 text-primary', className)}
      title="Connected"
    >
      <Wifi className="h-4 w-4" />
    </div>
  );
}

export default NetworkStatusBanner;
