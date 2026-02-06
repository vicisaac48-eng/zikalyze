import { useCallback, useEffect, useState, useRef } from 'react';
import { LocalNotifications, ScheduleOptions, LocalNotificationSchema } from '@capacitor/local-notifications';
import { 
  isNativePlatform, 
  generateNotificationId, 
  IMMEDIATE_NOTIFICATION_DELAY_MS 
} from '@/lib/notification-utils';

interface NotificationPayload {
  id?: number;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: string;
  smallIcon?: string;
  largeIcon?: string;
  /** Expanded text shown when notification is expanded */
  largeBody?: string;
  /** Make notification persistent (won't auto-dismiss) */
  ongoing?: boolean;
}

// Android notification icon
const ANDROID_NOTIFICATION_ICON = 'ic_stat_icon_config_sample';

// Android notification channel (required for Android 8.0+)
const ANDROID_CHANNEL_ID = 'price-alerts';

/**
 * Hook for showing local notifications on native Android/iOS platforms.
 * Uses Capacitor's LocalNotifications plugin which works without Firebase.
 * Falls back to browser's Notification API on web.
 */
export function useLocalNotifications() {
  const [hasPermission, setHasPermission] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const channelCreated = useRef(false);

  // Initialize, create notification channel, and check permissions
  useEffect(() => {
    const init = async () => {
      if (isNativePlatform()) {
        try {
          // Create notification channel for Android 8.0+ (must be done before scheduling notifications)
          // This ensures notifications display with proper prominence
          if (!channelCreated.current) {
            try {
              await LocalNotifications.createChannel({
                id: ANDROID_CHANNEL_ID,
                name: 'Price Alerts',
                description: 'Cryptocurrency price alerts and market notifications',
                importance: 5, // IMPORTANCE_HIGH - makes sound and shows as heads-up notification
                visibility: 1, // VISIBILITY_PUBLIC - show on lock screen
                sound: 'default',
                vibration: true,
                lights: true,
                lightColor: '#5EEAD4' // Zikalyze cyan color
              });
              channelCreated.current = true;
              console.log('[LocalNotifications] Notification channel created');
            } catch (channelErr) {
              console.error('[LocalNotifications] Channel creation error:', channelErr);
            }
          }
          
          // Check current permission status
          const { display } = await LocalNotifications.checkPermissions();
          setHasPermission(display === 'granted');
          
          // Set up notification action listeners for when user taps notification
          await LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
            console.log('[LocalNotifications] Action performed:', notification);
            // Navigate to relevant page based on notification data
            const data = notification.notification.extra;
            if (data?.url) {
              window.location.hash = data.url as string;
            }
          });
          
          // Listen for notification received events (app in foreground)
          await LocalNotifications.addListener('localNotificationReceived', (notification) => {
            console.log('[LocalNotifications] Notification received:', notification.title);
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
          smallIcon: payload.smallIcon || ANDROID_NOTIFICATION_ICON,
          largeIcon: payload.largeIcon,
          extra: payload.data,
          // Use the notification channel for Android 8.0+ (required for notifications to display)
          channelId: ANDROID_CHANNEL_ID,
          // Expanded notification text for more details
          largeBody: payload.largeBody || payload.body,
          // Show immediately with small delay required by Capacitor
          schedule: { at: new Date(Date.now() + IMMEDIATE_NOTIFICATION_DELAY_MS) },
          // Auto-cancel when tapped (unless ongoing)
          autoCancel: !payload.ongoing,
          // Make notification ongoing (persistent) if requested
          ongoing: payload.ongoing || false,
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
  }, [hasPermission, requestPermission]);

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
