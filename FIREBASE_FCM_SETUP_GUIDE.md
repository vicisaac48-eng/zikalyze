# Firebase Cloud Messaging (FCM) Setup Guide for Zikalyze

## 🎯 Overview

This guide provides step-by-step instructions for setting up professional Firebase Cloud Messaging (FCM) push notifications in Zikalyze. FCM enables reliable, scalable push notifications for all app activities.

---

## 📋 Prerequisites

- Firebase account (free or paid)
- Android Studio (for testing)
- Node.js 18+ installed
- Zikalyze project access

---

## 🚀 Step 1: Create Firebase Project

### 1.1 Firebase Console Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project details:
   - **Project name**: `Zikalyze`
   - **Project ID**: `zikalyze-app` (or auto-generated)
4. Enable Google Analytics (recommended for tracking)
5. Click "Create project"

### 1.2 Add Android App

1. In Firebase Console, click "Add app" → Android icon
2. Enter Android package name: `app.zikalyze.mobile`
   - **Important**: Must match `android/app/build.gradle` package
3. (Optional) Enter App nickname: `Zikalyze Android`
4. (Optional) Debug signing certificate SHA-1
5. Click "Register app"
6. **Download `google-services.json`** file
7. Move file to: `android/app/google-services.json`

---

## 🔧 Step 2: Configure Firebase Cloud Messaging

### 2.1 Enable Cloud Messaging API

1. In Firebase Console → Project Settings
2. Go to "Cloud Messaging" tab
3. Note down:
   - **Server Key** (for backend)
   - **Sender ID** (for client)
4. Enable Cloud Messaging API in Google Cloud Console:
   - Click "Manage API in Google Cloud Console"
   - Enable "Firebase Cloud Messaging API"

### 2.2 Generate Web Push Certificates (for PWA)

1. In Firebase Console → Project Settings → Cloud Messaging
2. Scroll to "Web Push certificates"
3. Click "Generate key pair"
4. Save the generated **Key pair** (VAPID keys)

---

## 📦 Step 3: Install Dependencies

### 3.1 Install Firebase Packages

```bash
npm install firebase
npm install @capacitor-firebase/messaging
```

### 3.2 Install Capacitor Firebase Core

```bash
npm install @capacitor-firebase/app
```

### 3.3 Sync Capacitor

```bash
npx cap sync android
```

---

## ⚙️ Step 4: Configure Android

### 4.1 Place google-services.json

Ensure `google-services.json` is in:
```
android/app/google-services.json
```

### 4.2 Update build.gradle (Project Level)

File: `android/build.gradle`

```gradle
buildscript {
    dependencies {
        // Add Google Services plugin
        classpath 'com.google.gms:google-services:4.4.0'
    }
}
```

### 4.3 Update build.gradle (App Level)

File: `android/app/build.gradle`

```gradle
plugins {
    // ... existing plugins
    id 'com.google.gms.google-services' // Add this line
}

dependencies {
    // Firebase BOM (Bill of Materials) - ensures compatible versions
    implementation platform('com.google.firebase:firebase-bom:32.7.0')
    
    // Firebase Cloud Messaging
    implementation 'com.google.firebase:firebase-messaging'
    
    // Firebase Analytics (optional but recommended)
    implementation 'com.google.firebase:firebase-analytics'
}
```

### 4.4 Update AndroidManifest.xml

File: `android/app/src/main/AndroidManifest.xml`

```xml
<application>
    <!-- Firebase Messaging Service -->
    <service
        android:name="com.google.firebase.messaging.FirebaseMessagingService"
        android:exported="false">
        <intent-filter>
            <action android:name="com.google.firebase.MESSAGING_EVENT" />
        </intent-filter>
    </service>

    <!-- Default notification icon -->
    <meta-data
        android:name="com.google.firebase.messaging.default_notification_icon"
        android:resource="@mipmap/ic_launcher" />
    
    <!-- Default notification color -->
    <meta-data
        android:name="com.google.firebase.messaging.default_notification_color"
        android:resource="@color/colorPrimary" />
    
    <!-- Notification channel ID (Android 8.0+) -->
    <meta-data
        android:name="com.google.firebase.messaging.default_notification_channel_id"
        android:value="price_alerts" />
</application>
```

---

## 🔐 Step 5: Environment Configuration

### 5.1 Create .env.local

Create or update `.env.local` file in project root:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# FCM Server Key (for backend/edge functions)
FCM_SERVER_KEY=your_fcm_server_key_here

# Web Push (VAPID)
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
```

### 5.2 Update Supabase Edge Function Secrets

Add FCM_SERVER_KEY to Supabase secrets:

```bash
# Via Supabase CLI
supabase secrets set FCM_SERVER_KEY=your_fcm_server_key_here

# Or via Supabase Dashboard
# Project Settings → Edge Functions → Secrets
```

---

## 💻 Step 6: Code Implementation

### 6.1 Firebase Configuration File

Create `src/config/firebase.config.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
const messaging = getMessaging(app);

export { app, messaging, getToken, onMessage };
```

### 6.2 FCM Service Module

Create `src/services/fcm.service.ts`:

```typescript
import { Capacitor } from '@capacitor/core';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { messaging, getToken, onMessage } from '@/config/firebase.config';
import { supabase } from '@/integrations/supabase/client';

const VAPID_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

export class FCMService {
  private static instance: FCMService;
  private fcmToken: string | null = null;

  private constructor() {}

  static getInstance(): FCMService {
    if (!FCMService.instance) {
      FCMService.instance = new FCMService();
    }
    return FCMService.instance;
  }

  async requestPermission(): Promise<boolean> {
    try {
      if (Capacitor.isNativePlatform()) {
        // Native platform - use Capacitor Firebase
        const result = await FirebaseMessaging.requestPermissions();
        return result.receive === 'granted';
      } else {
        // Web platform - use Firebase SDK
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  async getToken(): Promise<string | null> {
    try {
      if (Capacitor.isNativePlatform()) {
        // Native platform
        const { token } = await FirebaseMessaging.getToken();
        this.fcmToken = token;
        return token;
      } else {
        // Web platform
        const token = await getToken(messaging, { vapidKey: VAPID_KEY });
        this.fcmToken = token;
        return token;
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  async saveTokenToDatabase(userId: string, token: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('fcm_tokens')
        .upsert({
          user_id: userId,
          token: token,
          platform: Capacitor.getPlatform(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,platform'
        });

      if (error) {
        console.error('Error saving FCM token:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error saving FCM token to database:', error);
      return false;
    }
  }

  setupMessageListener(): void {
    if (Capacitor.isNativePlatform()) {
      // Native platform - use Capacitor Firebase
      FirebaseMessaging.addListener('notificationReceived', (notification) => {
        console.log('FCM notification received:', notification);
      });

      FirebaseMessaging.addListener('notificationActionPerformed', (action) => {
        console.log('FCM notification action:', action);
        // Handle notification tap
      });
    } else {
      // Web platform - use Firebase SDK
      onMessage(messaging, (payload) => {
        console.log('FCM message received:', payload);
        // Show notification
        if (payload.notification) {
          new Notification(payload.notification.title || 'Zikalyze', {
            body: payload.notification.body,
            icon: '/pwa-192x192.png'
          });
        }
      });
    }
  }

  async deleteToken(): Promise<boolean> {
    try {
      if (Capacitor.isNativePlatform()) {
        await FirebaseMessaging.deleteToken();
      } else {
        // Web: deleteToken is not directly available in modular SDK
        // User needs to unsubscribe via browser settings
      }
      this.fcmToken = null;
      return true;
    } catch (error) {
      console.error('Error deleting FCM token:', error);
      return false;
    }
  }
}

export const fcmService = FCMService.getInstance();
```

---

## 🗄️ Step 7: Database Setup

### 7.1 Create FCM Tokens Table

Run this SQL in Supabase SQL Editor:

```sql
-- Create FCM tokens table
CREATE TABLE IF NOT EXISTS fcm_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('web', 'android', 'ios')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_user_id ON fcm_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_platform ON fcm_tokens(platform);

-- Enable RLS
ALTER TABLE fcm_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can insert their own FCM tokens"
  ON fcm_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own FCM tokens"
  ON fcm_tokens FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own FCM tokens"
  ON fcm_tokens FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all FCM tokens"
  ON fcm_tokens FOR ALL
  USING (auth.role() = 'service_role');
```

---

## 🔔 Step 8: Notification Categories

### 8.1 Define Notification Channels (Android 8.0+)

Categories for notifications:

1. **Critical Alerts** (`critical_alerts`)
   - Price alerts hitting targets
   - Security alerts
   - System critical issues
   - **Priority**: HIGH
   - **Sound**: Custom alert
   - **Vibration**: Pattern [0, 400, 200, 400]

2. **Trade Notifications** (`trade_notifications`)
   - Trade executions
   - Order fills
   - Position updates
   - **Priority**: HIGH
   - **Sound**: Default
   - **Vibration**: Pattern [0, 250, 250, 250]

3. **Market Updates** (`market_updates`)
   - Price movements
   - Whale activity
   - Sentiment shifts
   - Volume spikes
   - **Priority**: DEFAULT
   - **Sound**: Default
   - **Vibration**: Short

4. **News & Events** (`news_events`)
   - Market news
   - Economic events
   - Announcements
   - **Priority**: LOW
   - **Sound**: None
   - **Vibration**: None

5. **Portfolio Updates** (`portfolio_updates`)
   - Value changes
   - Performance summaries
   - Rebalancing alerts
   - **Priority**: DEFAULT
   - **Sound**: Default
   - **Vibration**: Short

---

## 📱 Step 9: Testing

### 9.1 Test on Android Device

1. Build and install app:
```bash
npm run android:build
npx cap open android
```

2. Run app on device
3. Grant notification permissions
4. Check Logcat for FCM token

### 9.2 Send Test Notification

#### Via Firebase Console:
1. Firebase Console → Cloud Messaging
2. Click "Send your first message"
3. Enter notification title and text
4. Select your app
5. Send

#### Via cURL:
```bash
curl -X POST https://fcm.googleapis.com/fcm/send \
  -H "Authorization: key=YOUR_FCM_SERVER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "YOUR_FCM_TOKEN",
    "notification": {
      "title": "Test Notification",
      "body": "Testing FCM integration"
    },
    "data": {
      "type": "test",
      "timestamp": "2024-01-01T00:00:00Z"
    }
  }'
```

---

## 🎨 Step 10: Advanced Features

### 10.1 Notification Topics

Subscribe users to topics for targeted notifications:

```typescript
// Subscribe to topic
await FirebaseMessaging.subscribeToTopic({ topic: 'bitcoin-alerts' });

// Unsubscribe from topic
await FirebaseMessaging.unsubscribeFromTopic({ topic: 'bitcoin-alerts' });
```

### 10.2 Rich Notifications

Send notifications with images:

```json
{
  "notification": {
    "title": "Bitcoin Surge!",
    "body": "BTC up 10% in the last hour",
    "image": "https://example.com/bitcoin-chart.png"
  }
}
```

### 10.3 Action Buttons

Add action buttons to notifications:

```json
{
  "notification": {
    "title": "Price Alert",
    "body": "BTC reached $50,000"
  },
  "fcm_options": {
    "actions": [
      {
        "action": "view",
        "title": "View Chart"
      },
      {
        "action": "dismiss",
        "title": "Dismiss"
      }
    ]
  }
}
```

---

## 🐛 Troubleshooting

### Issue: FCM Token Not Generated

**Solution**:
1. Check `google-services.json` is in correct location
2. Verify Firebase project is correctly linked
3. Ensure Cloud Messaging API is enabled
4. Check app package name matches Firebase

### Issue: Notifications Not Received

**Solution**:
1. Check device notification permissions
2. Verify FCM token is saved correctly
3. Check notification channel is created
4. Test with Firebase Console test message
5. Check Logcat for errors

### Issue: Background Notifications Not Working

**Solution**:
1. Ensure proper background service configuration
2. Check battery optimization settings
3. Verify AndroidManifest.xml permissions
4. Test with app in background

---

## 📊 Monitoring & Analytics

### Track Notification Performance

```typescript
// Track notification delivery
analytics.logEvent('notification_received', {
  type: 'price_alert',
  symbol: 'BTC',
  timestamp: Date.now()
});

// Track notification interaction
analytics.logEvent('notification_opened', {
  type: 'price_alert',
  symbol: 'BTC',
  action: 'view_chart'
});
```

---

## 🔒 Security Best Practices

1. **Never expose server key** in client code
2. **Use environment variables** for all Firebase config
3. **Implement rate limiting** on notification sending
4. **Validate all notification data** on backend
5. **Use HTTPS** for all API calls
6. **Implement user opt-out** mechanisms
7. **Comply with GDPR** for EU users

---

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs/cloud-messaging)
- [Capacitor Firebase Plugin](https://github.com/capawesome-team/capacitor-firebase)
- [FCM HTTP v1 API](https://firebase.google.com/docs/cloud-messaging/migrate-v1)
- [Android Notification Channels](https://developer.android.com/training/notify-user/channels)

---

## ✅ Checklist

- [ ] Firebase project created
- [ ] Android app added to Firebase
- [ ] google-services.json downloaded and placed
- [ ] Cloud Messaging API enabled
- [ ] Dependencies installed
- [ ] build.gradle files updated
- [ ] AndroidManifest.xml configured
- [ ] Environment variables set
- [ ] Firebase config file created
- [ ] FCM service implemented
- [ ] Database table created
- [ ] Notification channels defined
- [ ] Tested on Android device
- [ ] Monitoring implemented

---

**Status**: Ready for implementation  
**Last Updated**: 2026-02-16  
**Version**: 1.0.0
