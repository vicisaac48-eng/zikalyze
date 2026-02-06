/**
 * Background Price Monitor for Android
 * 
 * This module handles background price checking and notifications when the app is closed.
 * Uses @transistorsoft/capacitor-background-fetch for periodic background tasks.
 * 
 * Android limitations:
 * - Minimum interval is 15 minutes (OS enforced)
 * - Tasks run only when device is not in Doze mode
 * - Battery optimization may affect frequency
 */

import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { generateNotificationId, IMMEDIATE_NOTIFICATION_DELAY_MS } from '@/lib/notification-utils';

// Background fetch configuration
export const BACKGROUND_FETCH_CONFIG = {
  minimumFetchInterval: 15, // 15 minutes (Android minimum)
  stopOnTerminate: false, // Continue running after app is terminated
  startOnBoot: true, // Start background fetch after device reboot
  enableHeadless: true, // Run even when app is terminated (Android)
};

// Crypto symbols to monitor in background
const BACKGROUND_MONITOR_SYMBOLS = ['BTC', 'ETH', 'SOL', 'XRP', 'DOGE'];

// CoinGecko IDs for API requests
const COINGECKO_IDS = ['bitcoin', 'ethereum', 'solana', 'ripple', 'dogecoin'];

// Price alert thresholds for background monitoring
const BACKGROUND_PRICE_CHANGE_THRESHOLD = 5; // 5% change triggers notification

// Storage keys for background price data
const STORAGE_KEY_LAST_PRICES = 'zikalyze_bg_last_prices';
const STORAGE_KEY_PRICE_ALERTS = 'zikalyze_bg_price_alerts';
const STORAGE_KEY_TRIGGERED_ALERTS = 'zikalyze_bg_triggered_alerts';

// Android notification channel ID
const ANDROID_CHANNEL_ID = 'price-alerts';
// This icon name matches the drawable resource in android/app/src/main/res/drawable/
const ANDROID_NOTIFICATION_ICON = 'ic_stat_icon_config_sample';

interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  timestamp: number;
}

interface SavedPriceAlert {
  id: string;
  symbol: string;
  target_price: number;
  condition: 'above' | 'below';
}

/**
 * Fetches current crypto prices from CoinGecko API
 */
async function fetchCurrentPrices(): Promise<Record<string, PriceData>> {
  try {
    // Use the COINGECKO_IDS constant for the API request
    const ids = COINGECKO_IDS.join(',');
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
    );
    
    if (!response.ok) {
      console.log('[BackgroundMonitor] API request failed:', response.status);
      return {};
    }
    
    const data = await response.json();
    const timestamp = Date.now();
    
    // Map CoinGecko IDs to our symbols
    const idToSymbol: Record<string, string> = {
      bitcoin: 'BTC',
      ethereum: 'ETH',
      solana: 'SOL',
      ripple: 'XRP',
      dogecoin: 'DOGE'
    };
    
    const prices: Record<string, PriceData> = {};
    
    for (const [id, symbol] of Object.entries(idToSymbol)) {
      if (data[id]) {
        prices[symbol] = {
          symbol,
          price: data[id].usd,
          change24h: data[id].usd_24h_change || 0,
          timestamp
        };
      }
    }
    
    return prices;
  } catch (error) {
    console.error('[BackgroundMonitor] Failed to fetch prices:', error);
    return {};
  }
}

/**
 * Gets stored price alerts from localStorage
 */
function getSavedPriceAlerts(): SavedPriceAlert[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_PRICE_ALERTS);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Gets last known prices from localStorage
 */
function getLastPrices(): Record<string, PriceData> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_LAST_PRICES);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

/**
 * Gets IDs of alerts that have already been triggered in background
 * This prevents duplicate notifications for the same alert
 */
function getTriggeredAlertIds(): Set<string> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_TRIGGERED_ALERTS);
    return new Set(stored ? JSON.parse(stored) : []);
  } catch {
    return new Set();
  }
}

/**
 * Marks an alert as triggered in background
 */
function markAlertAsTriggered(alertId: string): void {
  try {
    const triggered = getTriggeredAlertIds();
    triggered.add(alertId);
    localStorage.setItem(STORAGE_KEY_TRIGGERED_ALERTS, JSON.stringify([...triggered]));
  } catch (error) {
    console.error('[BackgroundMonitor] Failed to mark alert as triggered:', error);
  }
}

/**
 * Saves current prices to localStorage
 */
function saveLastPrices(prices: Record<string, PriceData>): void {
  try {
    localStorage.setItem(STORAGE_KEY_LAST_PRICES, JSON.stringify(prices));
  } catch (error) {
    console.error('[BackgroundMonitor] Failed to save prices:', error);
  }
}

/**
 * Sends a local notification for price alerts
 */
async function sendBackgroundNotification(
  title: string,
  body: string,
  symbol: string
): Promise<void> {
  try {
    await LocalNotifications.schedule({
      notifications: [{
        id: generateNotificationId(),
        title,
        body,
        largeBody: body,
        sound: 'default',
        smallIcon: ANDROID_NOTIFICATION_ICON,
        channelId: ANDROID_CHANNEL_ID,
        extra: {
          type: 'background_price_alert',
          symbol,
          url: `/dashboard?crypto=${symbol.toLowerCase()}`
        },
        // Use the shared constant for notification delay
        schedule: { at: new Date(Date.now() + IMMEDIATE_NOTIFICATION_DELAY_MS) },
        autoCancel: true,
      }]
    });
    console.log(`[BackgroundMonitor] Notification sent: ${title}`);
  } catch (error) {
    console.error('[BackgroundMonitor] Failed to send notification:', error);
  }
}

/**
 * Checks prices and triggers notifications if thresholds are met
 */
async function checkPricesAndNotify(): Promise<void> {
  console.log('[BackgroundMonitor] Starting background price check...');
  
  const currentPrices = await fetchCurrentPrices();
  if (Object.keys(currentPrices).length === 0) {
    console.log('[BackgroundMonitor] No prices fetched, skipping check');
    return;
  }
  
  const lastPrices = getLastPrices();
  const priceAlerts = getSavedPriceAlerts();
  const triggeredAlertIds = getTriggeredAlertIds();
  
  // Check for significant price movements
  for (const [symbol, current] of Object.entries(currentPrices)) {
    const last = lastPrices[symbol];
    
    // Check if price changed significantly since last check
    if (last && last.price > 0) {
      const changePercent = ((current.price - last.price) / last.price) * 100;
      
      if (Math.abs(changePercent) >= BACKGROUND_PRICE_CHANGE_THRESHOLD) {
        const emoji = changePercent > 0 ? '🚀' : '📉';
        const direction = changePercent > 0 ? 'up' : 'down';
        
        await sendBackgroundNotification(
          `${emoji} ${symbol} ${direction} ${Math.abs(changePercent).toFixed(1)}%`,
          `${symbol} is now $${current.price.toLocaleString()} (${changePercent > 0 ? '+' : ''}${changePercent.toFixed(1)}% since last check)`,
          symbol
        );
      }
    }
    
    // Check user-defined price alerts
    for (const alert of priceAlerts) {
      if (alert.symbol === symbol) {
        // Skip if this alert was already triggered in a previous background check
        // This prevents duplicate notifications for the same alert
        if (triggeredAlertIds.has(alert.id)) {
          continue;
        }
        
        const shouldTrigger = 
          (alert.condition === 'above' && current.price >= alert.target_price) ||
          (alert.condition === 'below' && current.price <= alert.target_price);
        
        if (shouldTrigger) {
          const emoji = alert.condition === 'above' ? '🎯📈' : '🎯📉';
          
          await sendBackgroundNotification(
            `${emoji} ${symbol} Alert Triggered!`,
            `${symbol} is now ${alert.condition} $${alert.target_price.toLocaleString()} • Current: $${current.price.toLocaleString()}`,
            symbol
          );
          
          // Mark this alert as triggered to prevent duplicate notifications
          markAlertAsTriggered(alert.id);
        }
      }
    }
  }
  
  // Save current prices for next comparison
  saveLastPrices(currentPrices);
  
  console.log('[BackgroundMonitor] Background price check completed');
}

/**
 * Initializes background fetch for Android
 * Must be called from main.tsx after app initialization
 */
export async function initializeBackgroundFetch(): Promise<void> {
  // Only run on native Android platform
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
    console.log('[BackgroundMonitor] Skipping - not on Android native platform');
    return;
  }
  
  try {
    // Dynamically import to avoid issues on non-Android platforms
    const BackgroundFetch = await import('@transistorsoft/capacitor-background-fetch');
    
    // Configure background fetch
    const status = await BackgroundFetch.default.configure(
      {
        minimumFetchInterval: BACKGROUND_FETCH_CONFIG.minimumFetchInterval,
        stopOnTerminate: BACKGROUND_FETCH_CONFIG.stopOnTerminate,
        startOnBoot: BACKGROUND_FETCH_CONFIG.startOnBoot,
        enableHeadless: BACKGROUND_FETCH_CONFIG.enableHeadless,
      },
      // Success callback - called when background fetch is triggered
      async (taskId: string) => {
        console.log(`[BackgroundMonitor] Background fetch triggered: ${taskId}`);
        
        try {
          await checkPricesAndNotify();
        } catch (error) {
          console.error('[BackgroundMonitor] Error in background task:', error);
        }
        
        // IMPORTANT: Signal completion of the background task
        await BackgroundFetch.default.finish(taskId);
      },
      // Timeout callback - called when background task times out
      async (taskId: string) => {
        console.log(`[BackgroundMonitor] Background fetch timeout: ${taskId}`);
        await BackgroundFetch.default.finish(taskId);
      }
    );
    
    console.log(`[BackgroundMonitor] Background fetch configured. Status: ${status}`);
    
    // Check background fetch status
    // Status codes: 0=Restricted, 1=Denied, 2=Available
    if (status === 2) {
      console.log('[BackgroundMonitor] Background fetch is available and running');
    } else if (status === 1) {
      console.log('[BackgroundMonitor] Background fetch is denied by user');
    } else {
      console.log('[BackgroundMonitor] Background fetch is restricted by OS');
    }
    
  } catch (error) {
    console.error('[BackgroundMonitor] Failed to initialize background fetch:', error);
  }
}

/**
 * Saves price alerts to localStorage for background monitoring
 * Call this when user creates/updates alerts
 * Also clears previously triggered alerts so they can trigger again if recreated
 */
export function syncPriceAlertsForBackground(alerts: SavedPriceAlert[]): void {
  try {
    // Get current alert IDs
    const currentAlertIds = new Set(alerts.map(a => a.id));
    
    // Clean up triggered alerts that no longer exist (alert was deleted/replaced)
    const triggeredIds = getTriggeredAlertIds();
    const cleanedTriggeredIds = [...triggeredIds].filter(id => currentAlertIds.has(id));
    localStorage.setItem(STORAGE_KEY_TRIGGERED_ALERTS, JSON.stringify(cleanedTriggeredIds));
    
    // Save current alerts
    localStorage.setItem(STORAGE_KEY_PRICE_ALERTS, JSON.stringify(alerts));
    console.log(`[BackgroundMonitor] Synced ${alerts.length} price alerts for background monitoring`);
  } catch (error) {
    console.error('[BackgroundMonitor] Failed to sync price alerts:', error);
  }
}

/**
 * Clears background monitoring data
 */
export function clearBackgroundData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_LAST_PRICES);
    localStorage.removeItem(STORAGE_KEY_PRICE_ALERTS);
    localStorage.removeItem(STORAGE_KEY_TRIGGERED_ALERTS);
    console.log('[BackgroundMonitor] Background data cleared');
  } catch (error) {
    console.error('[BackgroundMonitor] Failed to clear background data:', error);
  }
}
