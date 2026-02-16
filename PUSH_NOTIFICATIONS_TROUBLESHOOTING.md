# 🔧 Push Notifications Troubleshooting Guide

## Quick Diagnosis & Solutions for Perfect Notification Delivery

---

## 🚨 Emergency Checklist

**If notifications aren't working AT ALL:**

1. ✅ Check protection tests: `npm test tests/fcm-protection.test.ts`
2. ✅ Verify environment: `node scripts/verify-fcm-env.js`
3. ✅ Check permission: Open app → Should see permission request
4. ✅ Verify Firebase: Firebase Console → Cloud Messaging enabled
5. ✅ Check internet: Must have active connection
6. ✅ Review logs: Browser DevTools Console (F12)

**Expected Result**: Notifications should work after fixing any failures above.

---

## 📊 Diagnostic Flowchart

```
Notifications not working?
    ↓
Is permission granted?
    NO → Request permission in Settings
    ↓ YES
    
Is FCM token obtained?
    NO → Check Firebase config & internet
    ↓ YES
    
Is token in database?
    NO → Token save failed, check Supabase
    ↓ YES
    
Is service worker active? (web only)
    NO → Reload page, check SW registration
    ↓ YES
    
Are topics subscribed?
    NO → Subscribe to cryptocurrencies
    ↓ YES
    
Is notification sent from server?
    NO → Check server logs, FCM server key
    ↓ YES
    
Is notification received on device?
    NO → Check device settings, battery opt
    ↓ YES
    
✅ Notifications working!
```

---

## 🔍 Issue Categories

### Category 1: Permission Issues

#### Issue 1.1: Permission Request Never Appears

**Symptoms**:
- App loads but no permission prompt
- Permission status shows "default"

**Causes**:
- Permission already denied
- Browser blocked notifications globally
- Native app: Android system disabled

**Solutions**:

**Web/PWA**:
```javascript
// Check permission status
console.log(Notification.permission);
// Should be: "default", "granted", or "denied"

// If "denied", user must manually enable:
// Chrome: Settings → Privacy → Site Settings → Notifications → Allow
// Firefox: Settings → Privacy → Permissions → Notifications → Settings
```

**Android Native**:
```bash
# Check if app has permission
adb shell dumpsys notification

# Re-enable if disabled:
# Settings → Apps → Zikalyze → Notifications → Enable
```

**Prevention**:
- Add clear explanation before requesting permission
- Explain value of notifications
- Time request appropriately (not on first app open)

#### Issue 1.2: Permission Granted But No Token

**Symptoms**:
- Permission shows "granted"
- No FCM token obtained
- Console shows token errors

**Causes**:
- Firebase not initialized
- Invalid Firebase config
- Network firewall blocking Firebase
- Service worker registration failed

**Solutions**:

**Step 1: Verify Firebase Config**:
```javascript
// src/config/firebase.config.ts
export const getFirebaseConfig = () => ({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
});

// Verify all values exist
const config = getFirebaseConfig();
console.log('Config valid:', Object.values(config).every(v => v));
```

**Step 2: Check Firebase Initialization**:
```javascript
// Browser console
const initialized = await fcmService.initialize();
console.log('FCM initialized:', initialized);

if (!initialized) {
  // Check error logs
  // Likely invalid config or network issue
}
```

**Step 3: Network Check**:
```bash
# Test Firebase connectivity
curl https://fcm.googleapis.com
# Should return: 405 Method Not Allowed (that's OK, means server is reachable)

# If timeout or connection refused:
# - Check firewall
# - Check corporate proxy
# - Check DNS
```

---

### Category 2: Token Storage Issues

#### Issue 2.1: Token Not Saved to Database

**Symptoms**:
- Token obtained successfully
- Token not in `fcm_tokens` table
- Notifications never received

**Causes**:
- Database connection failed
- Row-level security (RLS) blocking insert
- User not authenticated
- Table doesn't exist

**Solutions**:

**Step 1: Check Database**:
```sql
-- Verify table exists
SELECT * FROM information_schema.tables 
WHERE table_name = 'fcm_tokens';

-- Check RLS policies
SELECT * FROM pg_policies 
WHERE tablename = 'fcm_tokens';

-- Try manual insert
INSERT INTO fcm_tokens (user_id, token, platform)
VALUES ('test-user-id', 'test-token', 'web');
```

**Step 2: Verify User Authentication**:
```javascript
// User must be logged in
const { user } = await supabase.auth.getUser();
console.log('User:', user);

if (!user) {
  // User not authenticated
  // Redirect to login
}
```

**Step 3: Check RLS Policies**:
```sql
-- Enable insert for authenticated users
CREATE POLICY "Users can insert own tokens"
ON fcm_tokens FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Enable read
CREATE POLICY "Users can read own tokens"
ON fcm_tokens FOR SELECT
USING (auth.uid() = user_id);
```

#### Issue 2.2: Multiple Tokens for Same User

**Symptoms**:
- Database has multiple tokens for one user
- Notifications sent multiple times
- Duplicate notifications

**Causes**:
- Token updated but old tokens not deleted
- User logged in on multiple devices
- No unique constraint

**Solutions**:

**Step 1: Add Unique Constraint**:
```sql
-- Ensure one token per user per platform
ALTER TABLE fcm_tokens
ADD CONSTRAINT fcm_tokens_user_platform_unique
UNIQUE (user_id, platform);
```

**Step 2: Clean Up Old Tokens**:
```sql
-- Delete old tokens, keep most recent
DELETE FROM fcm_tokens
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id, platform) id
  FROM fcm_tokens
  ORDER BY user_id, platform, updated_at DESC
);
```

**Step 3: Auto-Delete on Update**:
```sql
-- Create trigger to delete old tokens
CREATE OR REPLACE FUNCTION delete_old_fcm_tokens()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM fcm_tokens
  WHERE user_id = NEW.user_id
    AND platform = NEW.platform
    AND id != NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER delete_old_tokens_trigger
AFTER INSERT ON fcm_tokens
FOR EACH ROW
EXECUTE FUNCTION delete_old_fcm_tokens();
```

---

### Category 3: Service Worker Issues (Web Only)

#### Issue 3.1: Service Worker Not Registered

**Symptoms**:
- Web push doesn't work
- Console: "Service worker registration failed"
- No SW in DevTools → Application → Service Workers

**Causes**:
- HTTPS not enabled (required for SW)
- SW file not found
- JavaScript error in SW
- Browser doesn't support SW

**Solutions**:

**Step 1: Verify HTTPS**:
```javascript
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
  console.error('Service Worker requires HTTPS');
}
```

**Step 2: Check SW File**:
```bash
# File should exist
ls public/firebase-messaging-sw.js

# Verify it's served correctly
curl https://yourapp.com/firebase-messaging-sw.js
# Should return JavaScript content
```

**Step 3: Register SW Manually**:
```javascript
// main.tsx or app initialization
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then(registration => {
      console.log('SW registered:', registration);
    })
    .catch(error => {
      console.error('SW registration failed:', error);
    });
}
```

#### Issue 3.2: Service Worker Update Stuck

**Symptoms**:
- Old SW version keeps running
- New code doesn't work
- DevTools shows "waiting to activate"

**Solutions**:

**Step 1: Force Update**:
```javascript
// DevTools → Application → Service Workers → Skip waiting

// Or programmatically:
navigator.serviceWorker.getRegistration().then(reg => {
  reg.update();
});
```

**Step 2: Clear SW Cache**:
```javascript
// DevTools → Application → Clear storage → Clear site data

// Or programmatically:
caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
});
```

**Step 3: Hard Reload**:
```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

---

### Category 4: Message Delivery Issues

#### Issue 4.1: Notifications Not Reaching Device

**Symptoms**:
- Token valid and in database
- Server logs show message sent
- Device never receives notification

**Causes**:
- Network connectivity lost
- Firebase Cloud Messaging down
- Device in low-power mode
- App in background (Android battery optimization)

**Solutions**:

**Step 1: Check Firebase Status**:
```bash
# Visit Firebase Status Page
https://status.firebase.google.com/

# Check for outages or degraded service
```

**Step 2: Test Network**:
```javascript
// Check connectivity
const online = navigator.onLine;
console.log('Online:', online);

// Test Firebase specifically
fetch('https://fcm.googleapis.com')
  .then(() => console.log('Firebase reachable'))
  .catch(e => console.error('Firebase unreachable:', e));
```

**Step 3: Android Battery Optimization**:
```
Settings → Apps → Zikalyze → Battery
→ Select "Unrestricted"
```

**Step 4: Verify Message Format**:
```javascript
// Correct format
const message = {
  notification: {
    title: 'BTC Alert',
    body: 'Bitcoin reached $50,000',
  },
  data: {
    symbol: 'BTC',
    type: 'price_alert',
  },
  token: fcmToken,
};

// Send via Firebase Admin SDK
await admin.messaging().send(message);
```

#### Issue 4.2: Notifications Delivered But Not Displayed

**Symptoms**:
- Console shows message received
- No visual notification
- onMessage handler called

**Causes**:
- Browser notification blocked
- App in foreground (SW doesn't handle)
- Notification constructor error
- Permissions revoked

**Solutions**:

**Step 1: Check Notification Display**:
```javascript
// In message handler
messaging.onMessage((payload) => {
  console.log('Message received:', payload);
  
  // Show notification manually
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192x192.png',
  };
  
  new Notification(notificationTitle, notificationOptions);
});
```

**Step 2: Verify Browser Settings**:
```
Chrome: Settings → Privacy → Site Settings → Notifications
→ Check site is in "Allow" list, not "Block"
```

**Step 3: Test Native Notification**:
```javascript
// Simple test
if (Notification.permission === 'granted') {
  new Notification('Test', { body: 'This should appear' });
}
```

---

### Category 5: Topic Subscription Issues

#### Issue 5.1: Not Receiving Cryptocurrency-Specific Notifications

**Symptoms**:
- General notifications work
- Specific crypto notifications don't arrive
- Topic subscriptions appear successful

**Causes**:
- Topics not actually subscribed
- Topic naming mismatch
- Server sending to wrong topic
- FCM topic propagation delay

**Solutions**:

**Step 1: Verify Topic Names**:
```javascript
// Consistent topic naming
const topic = `crypto-${symbol.toUpperCase()}`; // e.g., "crypto-BTC"

// Subscribe
await fcmService.subscribeToTopic(topic);

// Check subscriptions
const topics = await cryptoNotificationManager.getSubscribedTopics();
console.log('Subscribed topics:', topics);
```

**Step 2: Check Server-Side Topic Usage**:
```javascript
// Server must use SAME topic name
const topic = `crypto-BTC`;
const message = {
  notification: { title: 'BTC Alert', body: 'Price changed' },
  topic: topic, // Must match client subscription
};
```

**Step 3: Wait for Propagation**:
```javascript
// Topic subscriptions can take up to 5 minutes to propagate
// After subscribing, wait before testing
setTimeout(() => {
  console.log('Topic should be active now');
}, 5 * 60 * 1000);
```

**Step 4: Resubscribe**:
```javascript
// Unsubscribe and resubscribe
await fcmService.unsubscribeFromTopic('crypto-BTC');
await new Promise(resolve => setTimeout(resolve, 2000));
await fcmService.subscribeToTopic('crypto-BTC');
```

---

### Category 6: Platform-Specific Issues

#### Issue 6.1: Works on Web, Not on Android

**Symptoms**:
- Notifications work in browser
- Same user, no notifications on Android app

**Causes**:
- google-services.json missing or invalid
- Firebase Cloud Messaging not enabled
- Android permissions not granted
- Package name mismatch

**Solutions**:

**Step 1: Verify google-services.json**:
```bash
# File location
android/app/google-services.json

# Verify content
cat android/app/google-services.json | grep project_id
# Should show your Firebase project ID

# Check package name matches
cat android/app/google-services.json | grep package_name
# Should match android/app/build.gradle applicationId
```

**Step 2: Enable FCM in Firebase**:
```
Firebase Console → Project Settings → Cloud Messaging
→ Ensure "Cloud Messaging API (Legacy)" is enabled
```

**Step 3: Check Android Permissions**:
```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.INTERNET" />
```

**Step 4: Test FCM Token**:
```java
// In Android app
FirebaseMessaging.getInstance().getToken()
  .addOnCompleteListener(task -> {
    if (task.isSuccessful()) {
      Log.d("FCM", "Token: " + task.getResult());
    } else {
      Log.e("FCM", "Failed", task.getException());
    }
  });
```

#### Issue 6.2: Android Background Notifications Not Working

**Symptoms**:
- Notifications work when app is open
- No notifications when app is closed/background

**Solutions**:

**Step 1: Check Battery Optimization**:
```
Settings → Battery → Battery optimization
→ Find Zikalyze → Select "Don't optimize"
```

**Step 2: Add Firebase Messaging Service**:
```java
// Add to AndroidManifest.xml
<service
  android:name=".MyFirebaseMessagingService"
  android:exported="false">
  <intent-filter>
    <action android:name="com.google.firebase.MESSAGING_EVENT" />
  </intent-filter>
</service>
```

**Step 3: Handle Background Messages**:
```java
public class MyFirebaseMessagingService extends FirebaseMessagingService {
  @Override
  public void onMessageReceived(RemoteMessage remoteMessage) {
    // Handle notification data
    Log.d("FCM", "Message: " + remoteMessage.getData());
    
    // Show notification
    showNotification(remoteMessage.getNotification());
  }
}
```

---

## 🎯 Prevention Best Practices

### 1. Proper Initialization

```typescript
// Initialize FCM on app start
useEffect(() => {
  const initFCM = async () => {
    try {
      await fcmService.initialize();
      const token = await fcmService.requestPermission();
      if (token) {
        await fcmService.saveTokenToDatabase(token);
      }
    } catch (error) {
      console.error('FCM initialization failed:', error);
      // Show user-friendly error
      toast.error('Push notifications unavailable');
    }
  };
  
  if (user) {
    initFCM();
  }
}, [user]);
```

### 2. Graceful Degradation

```typescript
// Fallback to local notifications if FCM fails
const sendNotification = async (notif: Notification) => {
  try {
    // Try FCM first
    await fcmService.send(notif);
  } catch (error) {
    console.warn('FCM failed, using local notification:', error);
    // Fallback to local
    await LocalNotifications.schedule({
      notifications: [{
        title: notif.title,
        body: notif.body,
        id: generateId(),
      }],
    });
  }
};
```

### 3. User Feedback

```typescript
// Clear status messages
const requestNotificationPermission = async () => {
  toast.loading('Requesting notification permission...');
  
  try {
    const result = await fcmService.requestPermission();
    
    if (result) {
      toast.success('✅ Notifications enabled!');
    } else {
      toast.error('❌ Permission denied. Enable in settings.');
    }
  } catch (error) {
    toast.error('Failed to enable notifications');
  }
};
```

### 4. Error Logging

```typescript
// Comprehensive error logging
try {
  await fcmService.send(notification);
} catch (error) {
  // Log to monitoring service
  logger.error('FCM send failed', {
    error: error.message,
    stack: error.stack,
    userId: user.id,
    notificationType: notification.type,
    timestamp: new Date().toISOString(),
  });
  
  // Report to error tracking (Sentry, etc.)
  Sentry.captureException(error, {
    tags: { component: 'fcm', operation: 'send' },
  });
}
```

---

## 📚 Additional Resources

- **Main Documentation**: `PUSH_NOTIFICATIONS_VERIFICATION_GUIDE.md`
- **Setup Guide**: `FIREBASE_FREE_SPARK_SETUP.md`
- **Protection Guide**: `FCM_PROTECTION_GUIDE.md`
- **Implementation Details**: `FCM_IMPLEMENTATION_COMPLETE.md`

---

**Last Updated**: 2026-02-16  
**Version**: 1.0  
**Status**: Production Ready
