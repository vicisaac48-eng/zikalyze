import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

// VAPID public key for push notifications
const VAPID_PUBLIC_KEY = 'BMAOEKFP15nphuIcym7qsUcKxumxeCZfrQKE21HuAlyADnCVOkrOsy3vzg0ZScARSirk5JQSbJa3jZwYiCD6Ano';

// Storage key for push subscription status (not the actual subscription data)
const PUSH_STATUS_KEY = 'zikalyze_push_enabled';

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
 * Push notifications hook for Web3-style authentication
 * 
 * NOTE: Without a server backend, push notifications can only show local notifications
 * when the app is open. True push notifications require a server to store subscriptions
 * and send messages to the push service.
 * 
 * This implementation enables browser notification permissions and provides the UI
 * for users to opt-in to notifications that can be shown locally.
 */
export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isSignedIn } = useAuth();

  // Check if push is supported
  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setIsSupported(supported);
    
    if (!supported) {
      setIsLoading(false);
    }
  }, []);

  // Check current subscription status from browser
  const checkSubscription = useCallback(async () => {
    if (!isSupported) return;
    
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

  useEffect(() => {
    if (isSupported) {
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
      toast.error("Push notifications are not supported in this browser");
      return false;
    }

    try {
      setIsLoading(true);

      // Check if user is logged in
      if (!isSignedIn || !user) {
        toast.error("Please log in to enable push notifications");
        return false;
      }

      // Request notification permission
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
    subscribe,
    unsubscribe
  };
}
