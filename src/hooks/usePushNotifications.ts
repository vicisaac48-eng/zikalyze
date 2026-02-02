import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';

// VAPID public key for push notifications
const VAPID_PUBLIC_KEY = 'BMAOEKFP15nphuIcym7qsUcKxumxeCZfrQKE21HuAlyADnCVOkrOsy3vzg0ZScARSirk5JQSbJa3jZwYiCD6Ano';

// Storage key for push subscription status (not the actual subscription data)
const PUSH_STATUS_KEY = 'zikalyze_push_enabled';
const FCM_TOKEN_KEY = 'zikalyze_fcm_token';

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer;
}

/**
 * Check if running on a native platform (Android/iOS)
 */
const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * Push notifications hook for Web3-style authentication
 * 
 * Supports both:
 * 1. Web Push API for browsers
 * 2. Native Capacitor Push Notifications for Android/iOS
 * 
 * On native platforms, uses Firebase Cloud Messaging (FCM) for Android.
 * On web, uses the Web Push API with VAPID keys.
 */
export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const { user, isSignedIn } = useAuth();

  // Check if push is supported
  useEffect(() => {
    const checkSupport = async () => {
      if (isNativePlatform()) {
        // Native platform - always supported
        setIsSupported(true);
        
        // Check current permission status
        try {
          const permStatus = await PushNotifications.checkPermissions();
          const hasPermission = permStatus.receive === 'granted';
          setIsSubscribed(hasPermission);
          
          // Get stored FCM token
          const storedToken = localStorage.getItem(FCM_TOKEN_KEY);
          if (storedToken) {
            setFcmToken(storedToken);
          }
        } catch (error) {
          console.error('Error checking native push permissions:', error);
        }
        setIsLoading(false);
      } else {
        // Web platform
        const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
        setIsSupported(supported);
        
        if (!supported) {
          setIsLoading(false);
        }
      }
    };
    
    checkSupport();
  }, []);

  // Setup native push notification listeners
  useEffect(() => {
    if (!isNativePlatform()) return;

    // Store listener handles for cleanup
    let registrationHandle: Awaited<ReturnType<typeof PushNotifications.addListener>> | null = null;
    let registrationErrorHandle: Awaited<ReturnType<typeof PushNotifications.addListener>> | null = null;
    let pushReceivedHandle: Awaited<ReturnType<typeof PushNotifications.addListener>> | null = null;
    let pushActionHandle: Awaited<ReturnType<typeof PushNotifications.addListener>> | null = null;

    const setupListeners = async () => {
      try {
        // Registration success listener
        registrationHandle = await PushNotifications.addListener('registration', (token: Token) => {
          console.log('Push registration success, token:', token.value);
          setFcmToken(token.value);
          localStorage.setItem(FCM_TOKEN_KEY, token.value);
          localStorage.setItem(PUSH_STATUS_KEY, 'true');
          setIsSubscribed(true);
        });

        // Registration error listener
        registrationErrorHandle = await PushNotifications.addListener('registrationError', (error) => {
          console.error('Push registration error:', error);
          toast.error('Failed to register for push notifications');
        });

        // Push notification received (foreground)
        pushReceivedHandle = await PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
          console.log('Push notification received:', notification);
          // Show a toast for foreground notifications
          toast.info(notification.title || 'Zikalyze alert', {
            description: notification.body,
          });
        });

        // Push notification action performed (tapped)
        pushActionHandle = await PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
          console.log('Push notification action performed:', action);
          // Handle notification tap - navigate to relevant page
          const data = action.notification.data;
          if (data?.url) {
            window.location.hash = data.url;
          }
        });
      } catch (error) {
        console.error('Error setting up push notification listeners:', error);
      }
    };

    setupListeners();

    // Cleanup listeners on unmount
    return () => {
      registrationHandle?.remove();
      registrationErrorHandle?.remove();
      pushReceivedHandle?.remove();
      pushActionHandle?.remove();
    };
  }, []);

  // Check current subscription status from browser (web only)
  const checkSubscription = useCallback(async () => {
    if (!isSupported || isNativePlatform()) return;
    
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      const hasSubscription = !!subscription;
      
      setIsSubscribed(hasSubscription);
      
      // Sync localStorage status with browser subscription state
      if (hasSubscription) {
        localStorage.setItem(PUSH_STATUS_KEY, 'true');
      } else {
        localStorage.removeItem(PUSH_STATUS_KEY);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  // Web service worker registration
  useEffect(() => {
    if (isSupported && !isNativePlatform()) {
      // Register service worker
      const swPath = import.meta.env.BASE_URL + 'sw.js';
      navigator.serviceWorker.register(swPath)
        .then(() => checkSubscription())
        .catch((error) => {
          console.error('Service worker registration failed:', error);
          setIsLoading(false);
        });
    }
  }, [isSupported, checkSubscription]);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      toast.error("Push notifications are not supported");
      return false;
    }

    try {
      setIsLoading(true);

      // Check if user is logged in
      if (!isSignedIn || !user) {
        toast.error("Please log in to enable push notifications");
        return false;
      }

      if (isNativePlatform()) {
        // Native platform - use Capacitor Push Notifications
        const permStatus = await PushNotifications.requestPermissions();
        
        if (permStatus.receive === 'granted') {
          // Register for push notifications
          await PushNotifications.register();
          toast.success("Push notifications enabled!");
          return true;
        } else {
          toast.error("Please allow notifications in your device settings");
          return false;
        }
      } else {
        // Web platform - use Web Push API
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          toast.error("Please allow notifications in your browser settings");
          return false;
        }

        // Get push subscription
        const registration = await navigator.serviceWorker.ready;
        
        // Unsubscribe from any existing subscription first
        const existingSubscription = await registration.pushManager.getSubscription();
        if (existingSubscription) {
          await existingSubscription.unsubscribe();
        }

        // Create new subscription
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });

        if (subscription) {
          // Store only the status flag, not the sensitive subscription data
          localStorage.setItem(PUSH_STATUS_KEY, 'true');
          setIsSubscribed(true);
          
          toast.success("Notifications Enabled - You'll receive alerts when the app is open");
          
          return true;
        }
        
        return false;
      }
    } catch (error) {
      console.error('Error subscribing to push:', error);
      toast.error("Could not enable notifications. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, isSignedIn, user]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      if (isNativePlatform()) {
        // Native platform - unregister from push notifications
        await PushNotifications.removeAllDeliveredNotifications();
        localStorage.removeItem(FCM_TOKEN_KEY);
        localStorage.removeItem(PUSH_STATUS_KEY);
        setIsSubscribed(false);
        setFcmToken(null);
        
        toast.info("Push notifications disabled");
        return true;
      } else {
        // Web platform
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        if (subscription) {
          await subscription.unsubscribe();
        }
        
        // Clear status flag
        localStorage.removeItem(PUSH_STATUS_KEY);
        setIsSubscribed(false);
        
        toast.info("Notifications disabled - You won't receive notification alerts");
        
        return true;
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
      toast.error("Could not disable notifications");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isSupported,
    isSubscribed,
    isLoading,
    fcmToken,
    isNative: isNativePlatform(),
    subscribe,
    unsubscribe
  };
}
