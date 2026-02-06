import { useCallback, useRef, useEffect, useMemo } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSettings, NotificationAlertSettings } from '@/hooks/useSettings';
import { 
  isNativePlatform, 
  generateNotificationId, 
  sanitizeSymbol,
  IMMEDIATE_NOTIFICATION_DELAY_MS 
} from '@/lib/notification-utils';

interface NotificationData {
  type: 'price_alert' | 'price_surge' | 'price_drop' | 'sentiment_shift' | 'whale_activity' | 'volume_spike' | 'news_event';
  symbol: string;
  title: string;
  body: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  data?: Record<string, unknown>;
}

interface PriceSnapshot {
  price: number;
  change24h: number;
  volume: number;
  timestamp: number;
}

interface SentimentSnapshot {
  fearGreed: number;
  overallSentiment: string;
  timestamp: number;
}

// Notification cooldowns (in milliseconds)
const COOLDOWNS = {
  price_alert: 0, // No cooldown for explicit alerts
  price_surge: 5 * 60 * 1000, // 5 min
  price_drop: 5 * 60 * 1000,
  sentiment_shift: 15 * 60 * 1000, // 15 min
  whale_activity: 10 * 60 * 1000, // 10 min
  volume_spike: 10 * 60 * 1000,
  news_event: 30 * 60 * 1000, // 30 min for news events
};

// Get thresholds from settings
function getThresholds(alertSettings: NotificationAlertSettings) {
  return {
    priceChange: alertSettings.priceChangeThreshold,
    volumeSpike: alertSettings.volumeSpikeThreshold,
    sentimentShift: alertSettings.sentimentShiftThreshold,
    whaleTransaction: alertSettings.whaleTransactionThreshold * 1000000, // Convert to dollars
  };
}

// Check if notification type is enabled
function isNotificationEnabled(type: NotificationData['type'], alertSettings: NotificationAlertSettings): boolean {
  const typeMap: Record<NotificationData['type'], keyof NotificationAlertSettings> = {
    'price_alert': 'priceAlerts',
    'price_surge': 'priceSurges',
    'price_drop': 'priceDrops',
    'sentiment_shift': 'sentimentShifts',
    'whale_activity': 'whaleActivity',
    'volume_spike': 'volumeSpikes',
    'news_event': 'newsEvents',
  };
  return !!alertSettings[typeMap[type]];
}

// Android notification icon - use the default Capacitor icon
const ANDROID_NOTIFICATION_ICON = 'ic_stat_icon_config_sample';

// Notification channel ID for Android 8.0+ (required)
const ANDROID_CHANNEL_ID = 'price-alerts';

export function useSmartNotifications() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const lastNotifications = useRef<Record<string, number>>({});
  const priceSnapshots = useRef<Record<string, PriceSnapshot>>({});
  const sentimentSnapshot = useRef<SentimentSnapshot | null>(null);
  const nativePermissionChecked = useRef(false);

  // Request native notification permissions and create channel on first use
  useEffect(() => {
    if (isNativePlatform() && !nativePermissionChecked.current) {
      nativePermissionChecked.current = true;
      
      // Create notification channel for Android 8.0+ (required for notifications to show)
      // Chain the promises to ensure channel exists before requesting permissions
      LocalNotifications.createChannel({
        id: ANDROID_CHANNEL_ID,
        name: 'Price Alerts',
        description: 'Notifications for cryptocurrency price alerts and market movements',
        importance: 5, // IMPORTANCE_HIGH - makes sound and shows as heads-up notification
        visibility: 1, // VISIBILITY_PUBLIC
        sound: 'default',
        vibration: true,
        lights: true,
        lightColor: '#5EEAD4'
      }).then(() => {
        console.log('[SmartNotify] Notification channel created');
        // Request permissions after channel is created
        return LocalNotifications.requestPermissions();
      }).then(result => {
        console.log('[SmartNotify] Native notification permission:', result.display);
      }).catch(err => {
        console.error('[SmartNotify] Notification setup error:', err);
      });
    }
  }, []);

  // Memoize thresholds from settings
  const thresholds = useMemo(() => 
    getThresholds(settings.notificationAlerts), 
    [settings.notificationAlerts]
  );

  // Check if we can send a notification (respects cooldowns)
  const canSendNotification = useCallback((type: string, symbol: string): boolean => {
    const key = `${type}_${symbol}`;
    const lastSent = lastNotifications.current[key] || 0;
    const cooldown = COOLDOWNS[type as keyof typeof COOLDOWNS] || 60000;
    return Date.now() - lastSent > cooldown;
  }, []);

  // Show native local notification on Android/iOS
  const showNativeLocalNotification = useCallback(async (notification: NotificationData): Promise<boolean> => {
    try {
      const id = generateNotificationId();
      
      await LocalNotifications.schedule({
        notifications: [{
          id,
          title: notification.title,
          body: notification.body,
          sound: 'default',
          smallIcon: ANDROID_NOTIFICATION_ICON,
          // Use the notification channel we created (required for Android 8.0+)
          channelId: ANDROID_CHANNEL_ID,
          extra: {
            type: notification.type,
            symbol: notification.symbol,
            url: `/dashboard?crypto=${sanitizeSymbol(notification.symbol)}`,
            ...notification.data
          },
          // Schedule immediately
          schedule: { at: new Date(Date.now() + IMMEDIATE_NOTIFICATION_DELAY_MS) },
          autoCancel: true,
        }]
      });
      
      console.log(`[SmartNotify] Native notification scheduled: ${notification.title} (${notification.symbol})`);
      return true;
    } catch (err) {
      console.error('[SmartNotify] Native notification error:', err);
      return false;
    }
  }, []);

  // Fallback: Show local notification via service worker when push fails (for web)
  const showLocalNotification = useCallback(async (notification: NotificationData): Promise<void> => {
    // On native platforms, use Capacitor LocalNotifications instead
    if (isNativePlatform()) {
      await showNativeLocalNotification(notification);
      return;
    }
    
    if (!('serviceWorker' in navigator)) return;
    
    try {
      const registration = await navigator.serviceWorker.ready;
      if (registration.active) {
        registration.active.postMessage({
          type: 'SHOW_LOCAL_NOTIFICATION',
          data: {
            title: notification.title,
            body: notification.body,
            symbol: notification.symbol,
            type: notification.type,
            url: `/dashboard?crypto=${sanitizeSymbol(notification.symbol)}`,
            // Use consistent tag without timestamp to allow replacing duplicate notifications
            tag: `${notification.type}-${notification.symbol}`,
            requireInteraction: notification.urgency === 'critical'
          }
        });
        console.log('[SmartNotify] Local notification shown via SW');
      }
    } catch (err) {
      console.error('[SmartNotify] Failed to show local notification:', err);
    }
  }, [showNativeLocalNotification]);

  // Send push notification via edge function (web) or local notification (native)
  const sendPushNotification = useCallback(async (notification: NotificationData): Promise<boolean> => {
    if (!user?.id) return false;
    
    // Check if this notification type is enabled in settings
    if (!isNotificationEnabled(notification.type, settings.notificationAlerts)) {
      console.log(`[SmartNotify] Skipping ${notification.type} for ${notification.symbol} (disabled in settings)`);
      return false;
    }

    // Check if push notifications are enabled globally
    if (!settings.notifications) {
      console.log(`[SmartNotify] Skipping ${notification.type} (push notifications disabled)`);
      return false;
    }

    const key = `${notification.type}_${notification.symbol}`;
    
    // Check cooldown
    if (!canSendNotification(notification.type, notification.symbol)) {
      console.log(`[SmartNotify] Skipping ${notification.type} for ${notification.symbol} (cooldown)`);
      return false;
    }

    let notificationShown = false;
    
    // On native platforms, use local notifications directly
    // This works without Firebase/FCM setup
    if (isNativePlatform()) {
      try {
        notificationShown = await showNativeLocalNotification(notification);
        if (notificationShown) {
          lastNotifications.current[key] = Date.now();
          console.log(`[SmartNotify] Native notification sent: ${notification.type} for ${notification.symbol}`);
        }
        return notificationShown;
      } catch (err) {
        console.error('[SmartNotify] Native notification error:', err);
        return false;
      }
    }

    // On web, try edge function first, then fall back to service worker
    let fallbackAttempted = false;
    
    try {
      // Send push notification via edge function
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          userId: user.id,
          title: notification.title,
          body: notification.body,
          symbol: notification.symbol,
          type: notification.type,
          urgency: notification.urgency,
          url: `/dashboard?crypto=${sanitizeSymbol(notification.symbol)}`
        }
      });

      if (error) {
        console.error('[SmartNotify] Push failed:', error);
        // Fallback: Show local notification via service worker
        fallbackAttempted = true;
        await showLocalNotification(notification);
        notificationShown = true;
      } else {
        console.log(`[SmartNotify] Push sent successfully: ${data?.sent || 0} delivered`);
        notificationShown = true;
      }

      // Update cooldown tracker when notification was shown (either via push or fallback)
      if (notificationShown) {
        lastNotifications.current[key] = Date.now();
        console.log(`[SmartNotify] Sent: ${notification.type} for ${notification.symbol}`);
      }
      return notificationShown;
    } catch (err) {
      console.error('[SmartNotify] Error:', err);
      // Only attempt fallback if we haven't already tried it
      if (!fallbackAttempted) {
        try {
          await showLocalNotification(notification);
          notificationShown = true;
          lastNotifications.current[key] = Date.now();
        } catch (fallbackErr) {
          console.error('[SmartNotify] Fallback notification also failed:', fallbackErr);
        }
      }
      return notificationShown;
    }
  }, [user?.id, canSendNotification, showLocalNotification, showNativeLocalNotification, settings.notificationAlerts, settings.notifications]);

  // Check for significant price movements
  const checkPriceMovement = useCallback(async (
    symbol: string,
    currentPrice: number,
    change24h: number,
    volume: number
  ): Promise<void> => {
    const snapshot = priceSnapshots.current[symbol];
    const now = Date.now();

    // Store initial snapshot
    if (!snapshot) {
      priceSnapshots.current[symbol] = {
        price: currentPrice,
        change24h,
        volume,
        timestamp: now
      };
      return;
    }

    // Calculate short-term change (from last snapshot)
    const timeDiff = (now - snapshot.timestamp) / 1000 / 60; // minutes
    if (timeDiff < 1) return; // Don't check too frequently

    const priceChangePercent = ((currentPrice - snapshot.price) / snapshot.price) * 100;
    const volumeChangePercent = ((volume - snapshot.volume) / snapshot.volume) * 100;

    // Check for price surge
    if (priceChangePercent >= thresholds.priceChange) {
      await sendPushNotification({
        type: 'price_surge',
        symbol,
        title: `🚀 ${symbol} Surging +${priceChangePercent.toFixed(1)}%`,
        body: `${symbol} jumped to $${currentPrice.toLocaleString()} • 24h: ${change24h >= 0 ? '+' : ''}${change24h.toFixed(1)}% • Volume spike detected`,
        urgency: priceChangePercent >= 10 ? 'critical' : 'high',
        data: { price: currentPrice, change: priceChangePercent }
      });
    }

    // Check for price drop
    if (priceChangePercent <= -thresholds.priceChange) {
      await sendPushNotification({
        type: 'price_drop',
        symbol,
        title: `📉 ${symbol} Dropping ${priceChangePercent.toFixed(1)}%`,
        body: `${symbol} fell to $${currentPrice.toLocaleString()} • 24h: ${change24h >= 0 ? '+' : ''}${change24h.toFixed(1)}% • Consider your positions`,
        urgency: priceChangePercent <= -10 ? 'critical' : 'high',
        data: { price: currentPrice, change: priceChangePercent }
      });
    }

    // Check for volume spike
    if (volumeChangePercent >= thresholds.volumeSpike && canSendNotification('volume_spike', symbol)) {
      await sendPushNotification({
        type: 'volume_spike',
        symbol,
        title: `📊 ${symbol} Volume Spike +${volumeChangePercent.toFixed(0)}%`,
        body: `Unusual trading activity detected • Price: $${currentPrice.toLocaleString()} • Watch for breakout`,
        urgency: 'medium',
        data: { volume, volumeChange: volumeChangePercent }
      });
    }

    // Update snapshot
    priceSnapshots.current[symbol] = {
      price: currentPrice,
      change24h,
      volume,
      timestamp: now
    };
  }, [sendPushNotification, canSendNotification, thresholds]);

  // Check for sentiment shifts
  const checkSentimentShift = useCallback(async (
    symbol: string,
    fearGreedIndex: number,
    overallSentiment: string
  ): Promise<void> => {
    const snapshot = sentimentSnapshot.current;
    const now = Date.now();

    // Store initial snapshot
    if (!snapshot) {
      sentimentSnapshot.current = {
        fearGreed: fearGreedIndex,
        overallSentiment,
        timestamp: now
      };
      return;
    }

    // Check time since last snapshot (minimum 5 minutes)
    const timeDiff = (now - snapshot.timestamp) / 1000 / 60;
    if (timeDiff < 5) return;

    const shift = fearGreedIndex - snapshot.fearGreed;
    const absShift = Math.abs(shift);

    if (absShift >= thresholds.sentimentShift) {
      const direction = shift > 0 ? 'bullish' : 'bearish';
      const emoji = shift > 0 ? '📈' : '📉';
      
      await sendPushNotification({
        type: 'sentiment_shift',
        symbol,
        title: `${emoji} Market Sentiment Shifting ${direction.charAt(0).toUpperCase() + direction.slice(1)}`,
        body: `Fear & Greed: ${fearGreedIndex} (${shift > 0 ? '+' : ''}${shift}) • ${overallSentiment} mood • Monitor positions`,
        urgency: absShift >= 25 ? 'high' : 'medium',
        data: { fearGreed: fearGreedIndex, shift, sentiment: overallSentiment }
      });
    }

    // Update snapshot
    sentimentSnapshot.current = {
      fearGreed: fearGreedIndex,
      overallSentiment,
      timestamp: now
    };
  }, [sendPushNotification, thresholds]);

  // Check for whale activity
  const checkWhaleActivity = useCallback(async (
    symbol: string,
    whaleNetFlow: number,
    largeTransactionCount: number
  ): Promise<void> => {
    const absFlow = Math.abs(whaleNetFlow);
    
    if (absFlow >= thresholds.whaleTransaction && largeTransactionCount > 0) {
      const direction = whaleNetFlow > 0 ? 'buying' : 'selling';
      const emoji = whaleNetFlow > 0 ? '🐋💰' : '🐋📤';
      
      await sendPushNotification({
        type: 'whale_activity',
        symbol,
        title: `${emoji} Whale ${direction.charAt(0).toUpperCase() + direction.slice(1)} ${symbol}`,
        body: `Large ${direction} detected • Net flow: $${(absFlow / 1000000).toFixed(1)}M • ${largeTransactionCount} large tx in 24h`,
        urgency: absFlow >= 10000000 ? 'critical' : 'high',
        data: { netFlow: whaleNetFlow, transactions: largeTransactionCount }
      });
    }
  }, [sendPushNotification, thresholds]);

  // Send price alert notification (for triggered alerts)
  const sendPriceAlertNotification = useCallback(async (
    symbol: string,
    targetPrice: number,
    currentPrice: number,
    condition: 'above' | 'below'
  ): Promise<boolean> => {
    const direction = condition === 'above' ? '↑' : '↓';
    const emoji = condition === 'above' ? '🎯📈' : '🎯📉';
    
    return sendPushNotification({
      type: 'price_alert',
      symbol,
      title: `${emoji} ${symbol} Alert Triggered!`,
      body: `${symbol} is now ${condition} $${targetPrice.toLocaleString()} • Current: $${currentPrice.toLocaleString()} ${direction}`,
      urgency: 'critical',
      data: { targetPrice, currentPrice, condition }
    });
  }, [sendPushNotification]);

  // Send news/macro event notification
  const sendNewsEventNotification = useCallback(async (
    eventName: string,
    impact: 'high' | 'medium' | 'low',
    countdown: string,
    category: string
  ): Promise<boolean> => {
    const emoji = impact === 'high' ? '🔥' : impact === 'medium' ? '📰' : '📋';
    const urgency = impact === 'high' ? 'high' : impact === 'medium' ? 'medium' : 'low';
    
    return sendPushNotification({
      type: 'news_event',
      symbol: category.toUpperCase(),
      title: `${emoji} ${eventName}`,
      body: `${countdown} • Impact: ${impact.toUpperCase()} • Category: ${category}`,
      urgency,
      data: { event: eventName, impact, countdown, category }
    });
  }, [sendPushNotification]);

  // Reset snapshots on unmount
  useEffect(() => {
    return () => {
      priceSnapshots.current = {};
      sentimentSnapshot.current = null;
      lastNotifications.current = {};
    };
  }, []);

  return {
    checkPriceMovement,
    checkSentimentShift,
    checkWhaleActivity,
    sendPriceAlertNotification,
    sendNewsEventNotification,
    sendPushNotification
  };
}
