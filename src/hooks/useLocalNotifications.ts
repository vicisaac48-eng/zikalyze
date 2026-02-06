import { useCallback, useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications, ScheduleOptions, LocalNotificationSchema } from '@capacitor/local-notifications';

// Check if running on a native platform (Android/iOS)
const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

interface NotificationPayload {
  id?: number;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: string;
  smallIcon?: string;
  largeIcon?: string;
}

/**
 * Hook for showing local notifications on native Android/iOS platforms.
 * Uses Capacitor's LocalNotifications plugin which works without Firebase.
 * Falls back to browser's Notification API on web.
 */
export function useLocalNotifications() {
  const [hasPermission, setHasPermission] = useState(false);
  const [isReady, setIsReady] = useState(false);
  
  // Generate unique notification ID using timestamp + random to avoid collisions
  const generateNotificationId = useCallback((): number => {
    return (Date.now() % 1000000) * 1000 + Math.floor(Math.random() * 1000);
  }, []);

  // Initialize and check permissions
  useEffect(() => {
    const init = async () => {
      if (isNativePlatform()) {
        try {
          // Check current permission status
          const { display } = await LocalNotifications.checkPermissions();
          setHasPermission(display === 'granted');
          
          // Set up notification action listeners
          await LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
            console.log('[LocalNotifications] Action performed:', notification);
            // Navigate to relevant page based on notification data
            const data = notification.notification.extra;
            if (data?.url) {
              window.location.hash = data.url as string;
            }
          });

          setIsReady(true);
        } catch (error) {
          console.error('[LocalNotifications] Init error:', error);
          setIsReady(true);
        }
      } else {
        // Web platform - check browser notification permission
        if ('Notification' in window) {
          setHasPermission(Notification.permission === 'granted');
        }
        setIsReady(true);
      }
    };

    init();

    return () => {
      if (isNativePlatform()) {
        LocalNotifications.removeAllListeners();
      }
    };
  }, []);

  // Request notification permissions
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (isNativePlatform()) {
      try {
        const { display } = await LocalNotifications.requestPermissions();
        const granted = display === 'granted';
        setHasPermission(granted);
        return granted;
      } catch (error) {
        console.error('[LocalNotifications] Permission request error:', error);
        return false;
      }
    } else {
      // Web platform
      if ('Notification' in window) {
        const result = await Notification.requestPermission();
        const granted = result === 'granted';
        setHasPermission(granted);
        return granted;
      }
      return false;
    }
  }, []);

  // Show a local notification immediately
  const showNotification = useCallback(async (payload: NotificationPayload): Promise<boolean> => {
    if (!hasPermission) {
      console.log('[LocalNotifications] No permission, requesting...');
      const granted = await requestPermission();
      if (!granted) {
        console.log('[LocalNotifications] Permission denied');
        return false;
      }
    }

    if (isNativePlatform()) {
      try {
        const id = payload.id || generateNotificationId();
        
        const notification: LocalNotificationSchema = {
          id,
          title: payload.title,
          body: payload.body,
          sound: payload.sound || 'default',
          smallIcon: payload.smallIcon || 'ic_stat_icon_config_sample',
          largeIcon: payload.largeIcon,
          extra: payload.data,
          // Show immediately
          schedule: { at: new Date(Date.now() + 100) }, // 100ms from now
          autoCancel: true,
        };

        const options: ScheduleOptions = {
          notifications: [notification],
        };

        await LocalNotifications.schedule(options);
        console.log(`[LocalNotifications] Notification scheduled: ${payload.title}`);
        return true;
      } catch (error) {
        console.error('[LocalNotifications] Schedule error:', error);
        return false;
      }
    } else {
      // Web platform fallback
      try {
        if ('Notification' in window && Notification.permission === 'granted') {
          const notification = new Notification(payload.title, {
            body: payload.body,
            icon: './pwa-192x192.png',
            badge: './favicon.ico',
            tag: `local-${Date.now()}`,
            data: payload.data,
          });

          notification.onclick = () => {
            window.focus();
            if (payload.data?.url) {
              window.location.hash = payload.data.url as string;
            }
            notification.close();
          };

          return true;
        }
        return false;
      } catch (error) {
        console.error('[LocalNotifications] Web notification error:', error);
        return false;
      }
    }
  }, [hasPermission, requestPermission, generateNotificationId]);

  // Show a price alert notification with specific formatting
  const showPriceAlert = useCallback(async (
    symbol: string,
    targetPrice: number,
    currentPrice: number,
    condition: 'above' | 'below'
  ): Promise<boolean> => {
    const direction = condition === 'above' ? '↑' : '↓';
    const emoji = condition === 'above' ? '📈' : '📉';
    
    return showNotification({
      title: `${emoji} ${symbol} Alert Triggered!`,
      body: `${symbol} is now ${condition} $${targetPrice.toLocaleString()} • Current: $${currentPrice.toLocaleString()} ${direction}`,
      data: {
        type: 'price_alert',
        symbol,
        targetPrice,
        currentPrice,
        condition,
        url: `/dashboard?crypto=${symbol.toLowerCase()}`,
      },
    });
  }, [showNotification]);

  // Show a price movement notification (surge or drop)
  const showPriceMovement = useCallback(async (
    symbol: string,
    currentPrice: number,
    changePercent: number,
    type: 'surge' | 'drop'
  ): Promise<boolean> => {
    const emoji = type === 'surge' ? '🚀' : '📉';
    const verb = type === 'surge' ? 'Surging' : 'Dropping';
    const sign = changePercent >= 0 ? '+' : '';
    
    return showNotification({
      title: `${emoji} ${symbol} ${verb} ${sign}${changePercent.toFixed(1)}%`,
      body: `${symbol} is now at $${currentPrice.toLocaleString()}`,
      data: {
        type: type === 'surge' ? 'price_surge' : 'price_drop',
        symbol,
        currentPrice,
        changePercent,
        url: `/dashboard?crypto=${symbol.toLowerCase()}`,
      },
    });
  }, [showNotification]);

  return {
    isReady,
    hasPermission,
    isNative: isNativePlatform(),
    requestPermission,
    showNotification,
    showPriceAlert,
    showPriceMovement,
  };
}
