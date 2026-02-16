/**
 * ⚠️ CRITICAL: CRYPTO NOTIFICATION MANAGER - DO NOT DELETE ⚠️
 * 
 * Manages FCM push notifications for all 100+ cryptocurrencies
 * 
 * 🔒 PROTECTED BY: tests/fcm-protection.test.ts
 * 📚 DOCUMENTATION: FIREBASE_FCM_SETUP_GUIDE.md
 * 
 * ⛔ REMOVING THIS FILE WILL:
 * - Break notifications for all 100+ cryptocurrencies
 * - Disable automatic topic subscriptions
 * - Break user preference management
 * 
 * @module crypto-notification-manager
 * @protected
 */

import { fcmService } from './fcm.service';
import { supabase } from '@/integrations/supabase/client';

/**
 * Notification preferences for a cryptocurrency
 */
export interface CryptoNotificationPreferences {
  symbol: string;
  enabled: boolean;
  priceAlerts: boolean;
  volumeSpikes: boolean;
  whaleActivity: boolean;
  newsEvents: boolean;
}

/**
 * ⚠️ PROTECTED CLASS - Required for all cryptocurrency notifications ⚠️
 * 
 * CryptoNotificationManager
 * Manages notification subscriptions and preferences for all 100+ cryptocurrencies
 */
export class CryptoNotificationManager {
  private static instance: CryptoNotificationManager;
  private userId: string | null = null;
  private preferences: Map<string, CryptoNotificationPreferences> = new Map();

  private constructor() {}

  static getInstance(): CryptoNotificationManager {
    if (!CryptoNotificationManager.instance) {
      CryptoNotificationManager.instance = new CryptoNotificationManager();
    }
    return CryptoNotificationManager.instance;
  }

  /**
   * Initialize notification manager for user
   * @param userId User ID
   * @protected - Required for personalized notifications
   */
  async initialize(userId: string): Promise<void> {
    this.userId = userId;
    await this.loadUserPreferences();
  }

  /**
   * Load user's notification preferences from database
   * @protected - Critical for user-specific notification settings
   */
  private async loadUserPreferences(): Promise<void> {
    if (!this.userId) return;

    try {
      const { data, error } = await supabase
        .from('crypto_notification_preferences')
        .select('*')
        .eq('user_id', this.userId);

      if (error) {
        console.error('[CryptoNotificationManager] Error loading preferences:', error);
        return;
      }

      if (data) {
        data.forEach((pref: any) => {
          this.preferences.set(pref.symbol, {
            symbol: pref.symbol,
            enabled: pref.enabled,
            priceAlerts: pref.price_alerts,
            volumeSpikes: pref.volume_spikes,
            whaleActivity: pref.whale_activity,
            newsEvents: pref.news_events
          });
        });

        console.log(`[CryptoNotificationManager] Loaded preferences for ${data.length} cryptocurrencies`);
      }
    } catch (error) {
      console.error('[CryptoNotificationManager] Error loading preferences:', error);
    }
  }

  /**
   * Subscribe to notifications for specific cryptocurrencies
   * @param cryptoSymbols Array of cryptocurrency symbols
   * @protected - Core function for topic subscriptions
   */
  async subscribeToAll Cryptos(cryptoSymbols: string[]): Promise<void> {
    console.log(`[CryptoNotificationManager] Subscribing to ${cryptoSymbols.length} cryptocurrencies`);
    
    // Subscribe to FCM topics for each cryptocurrency
    const results = await fcmService.subscribeToMultipleTopics(cryptoSymbols);
    
    const successCount = results.filter(r => r).length;
    console.log(`[CryptoNotificationManager] Successfully subscribed to ${successCount}/${cryptoSymbols.length} topics`);
  }

  /**
   * Subscribe to all top 100 cryptocurrencies
   * @param top100Symbols Array of top 100 cryptocurrency symbols
   * @protected - Enables notifications for all tracked cryptocurrencies
   */
  async subscribeToTop100(top100Symbols: string[]): Promise<void> {
    console.log('[CryptoNotificationManager] Subscribing to all top 100 cryptocurrencies');
    await this.subscribeToCryptos(top100Symbols);
  }

  /**
   * Update notification preference for a cryptocurrency
   * @param symbol Cryptocurrency symbol
   * @param preferences Notification preferences
   * @protected - User preference management
   */
  async updatePreference(
    symbol: string,
    preferences: Partial<CryptoNotificationPreferences>
  ): Promise<boolean> {
    if (!this.userId) return false;

    try {
      const existing = this.preferences.get(symbol) || {
        symbol,
        enabled: true,
        priceAlerts: true,
        volumeSpikes: true,
        whaleActivity: true,
        newsEvents: true
      };

      const updated = { ...existing, ...preferences };
      this.preferences.set(symbol, updated);

      // Save to database
      const { error } = await supabase
        .from('crypto_notification_preferences')
        .upsert({
          user_id: this.userId,
          symbol: symbol,
          enabled: updated.enabled,
          price_alerts: updated.priceAlerts,
          volume_spikes: updated.volumeSpikes,
          whale_activity: updated.whaleActivity,
          news_events: updated.newsEvents,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,symbol'
        });

      if (error) {
        console.error('[CryptoNotificationManager] Error saving preference:', error);
        return false;
      }

      // Subscribe/unsubscribe from FCM topic
      const topic = `${symbol.toLowerCase()}-alerts`;
      if (updated.enabled) {
        await fcmService.subscribeToTopic(topic);
      } else {
        await fcmService.unsubscribeFromTopic(topic);
      }

      console.log(`[CryptoNotificationManager] Updated preferences for ${symbol}`);
      return true;
    } catch (error) {
      console.error('[CryptoNotificationManager] Error updating preference:', error);
      return false;
    }
  }

  /**
   * Get notification preference for a cryptocurrency
   * @param symbol Cryptocurrency symbol
   * @returns Notification preferences or default
   */
  getPreference(symbol: string): CryptoNotificationPreferences {
    return this.preferences.get(symbol) || {
      symbol,
      enabled: true,
      priceAlerts: true,
      volumeSpikes: true,
      whaleActivity: true,
      newsEvents: true
    };
  }

  /**
   * Get all user's notification preferences
   * @returns Map of all cryptocurrency preferences
   */
  getAllPreferences(): Map<string, CryptoNotificationPreferences> {
    return new Map(this.preferences);
  }

  /**
   * Enable notifications for a cryptocurrency
   * @param symbol Cryptocurrency symbol
   */
  async enableCrypto(symbol: string): Promise<boolean> {
    return this.updatePreference(symbol, { enabled: true });
  }

  /**
   * Disable notifications for a cryptocurrency
   * @param symbol Cryptocurrency symbol
   */
  async disableCrypto(symbol: string): Promise<boolean> {
    return this.updatePreference(symbol, { enabled: false });
  }

  /**
   * Enable all notification types for a cryptocurrency
   * @param symbol Cryptocurrency symbol
   */
  async enableAllNotificationTypes(symbol: string): Promise<boolean> {
    return this.updatePreference(symbol, {
      enabled: true,
      priceAlerts: true,
      volumeSpikes: true,
      whaleActivity: true,
      newsEvents: true
    });
  }

  /**
   * Get count of enabled cryptocurrencies
   * @returns Number of cryptocurrencies with notifications enabled
   */
  getEnabledCount(): number {
    return Array.from(this.preferences.values()).filter(p => p.enabled).length;
  }

  /**
   * Clear all preferences (logout)
   */
  clear(): void {
    this.userId = null;
    this.preferences.clear();
  }
}

// Export singleton instance
export const cryptoNotificationManager = CryptoNotificationManager.getInstance();
