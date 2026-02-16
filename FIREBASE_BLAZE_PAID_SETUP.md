# Firebase Blaze Plan (Paid) Configuration Guide

## 🎯 Overview

This guide configures Zikalyze to use Firebase's **Blaze (Pay as you go)** plan, enabling professional-grade features for production-scale push notifications across all 100+ cryptocurrencies.

---

## 💰 Firebase Pricing Plans

### Spark Plan (Free) - Limitations
- ❌ 100 simultaneous connections
- ❌ 1GB storage
- ❌ 10GB bandwidth/month
- ❌ Limited Cloud Functions
- ❌ No SLA guarantee
- ❌ Basic analytics only

### **Blaze Plan (Paid) - Recommended** ✅
- ✅ Unlimited connections
- ✅ Unlimited storage (pay for usage)
- ✅ Unlimited bandwidth (pay for usage)
- ✅ Advanced Cloud Functions
- ✅ 99.95% SLA
- ✅ Advanced analytics & A/B testing
- ✅ Crashlytics
- ✅ Performance monitoring
- ✅ Remote config
- ✅ Google Analytics 4 integration
- ✅ Custom event tracking
- ✅ Advanced notification features

**Pricing**: Pay only for what you use
- Cloud Messaging: **FREE** (unlimited)
- Cloud Functions: $0.40 per million invocations
- Cloud Storage: $0.026 per GB
- Firestore: $0.18 per GB stored
- Bandwidth: $0.12 per GB

---

## 🚀 Step 1: Upgrade to Blaze Plan

### 1.1 Via Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your Zikalyze project
3. Click **Settings** (gear icon) → **Usage and billing**
4. Click **Modify plan**
5. Select **Blaze (Pay as you go)**
6. Enter billing information
7. Set budget alerts (recommended):
   - Alert at $50/month
   - Alert at $100/month
   - Hard cap at $200/month (optional)
8. Confirm upgrade

### 1.2 Budget Protection

**Recommended Settings**:
```
Daily Budget: $10
Monthly Budget: $200
Alert Thresholds: 50%, 75%, 90%, 100%
Alert Contacts: admin@zikalyze.app
```

---

## 🔧 Step 2: Enable Advanced Features

### 2.1 Google Analytics 4 Integration

1. Firebase Console → **Analytics**
2. Click **Enable Google Analytics**
3. Select or create GA4 property
4. Configure data streams:
   - Web stream for PWA
   - Android app stream
   - iOS app stream (future)

### 2.2 Cloud Functions (Advanced)

1. Firebase Console → **Functions**
2. Enable **Cloud Functions for Firebase**
3. Configure runtime:
   - Runtime: Node.js 20
   - Memory: 512 MB (notifications)
   - Timeout: 60 seconds
   - Region: us-central1, europe-west1 (multi-region)

### 2.3 Crashlytics (Optional but Recommended)

1. Firebase Console → **Crashlytics**
2. Enable Crashlytics
3. Add to Android app
4. Configure NDK crash reporting

### 2.4 Performance Monitoring

1. Firebase Console → **Performance**
2. Enable Performance Monitoring
3. Configure automatic traces
4. Set up custom traces for notification delivery

### 2.5 Remote Config

1. Firebase Console → **Remote Config**
2. Enable Remote Config
3. Add parameters:
   - `notification_batch_size`: 500
   - `notification_retry_count`: 3
   - `notification_timeout_ms`: 10000
   - `enable_rich_notifications`: true

### 2.6 A/B Testing

1. Firebase Console → **A/B Testing**
2. Enable A/B Testing
3. Create notification experiments:
   - Test notification titles
   - Test notification timing
   - Test notification content

---

## ⚙️ Step 3: Configure Environment for Blaze

### 3.1 Update `.env.local`

```env
# ========================================
# FIREBASE BLAZE (PAID) CONFIGURATION
# ========================================

# Firebase Project (Blaze Plan)
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=zikalyze-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=zikalyze-app
VITE_FIREBASE_STORAGE_BUCKET=zikalyze-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# FCM Server Key (v1 API - Blaze)
FCM_SERVER_KEY_V1=your_v1_server_key_here

# Service Account (for advanced features)
FIREBASE_SERVICE_ACCOUNT_EMAIL=firebase-adminsdk@zikalyze-app.iam.gserviceaccount.com
FIREBASE_SERVICE_ACCOUNT_KEY=your_private_key_here

# Google Cloud Project ID (for advanced APIs)
GOOGLE_CLOUD_PROJECT_ID=zikalyze-app

# Advanced Features Flags
ENABLE_FIREBASE_ANALYTICS=true
ENABLE_CRASHLYTICS=true
ENABLE_PERFORMANCE_MONITORING=true
ENABLE_REMOTE_CONFIG=true
ENABLE_AB_TESTING=true

# Notification Configuration (Blaze)
NOTIFICATION_BATCH_SIZE=500
NOTIFICATION_RATE_LIMIT=10000
NOTIFICATION_RETRY_ATTEMPTS=3
NOTIFICATION_TIMEOUT_MS=10000

# Multi-Region Support
FIREBASE_REGIONS=us-central1,europe-west1,asia-east1

# Budget Alerts
FIREBASE_DAILY_BUDGET=10
FIREBASE_MONTHLY_BUDGET=200
```

### 3.2 Create Service Account Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Navigate to **IAM & Admin** → **Service Accounts**
4. Find Firebase Admin SDK service account
5. Click **Keys** → **Add Key** → **Create new key**
6. Select **JSON** format
7. Download and save securely
8. **NEVER commit to git**

---

## 📦 Step 4: Install Advanced Dependencies

```bash
# Firebase Admin SDK (server-side, Blaze features)
npm install firebase-admin

# Firebase Analytics
npm install @firebase/analytics

# Firebase Performance
npm install @firebase/performance

# Firebase Remote Config
npm install @firebase/remote-config

# Firebase A/B Testing
npm install @firebase/ab-testing

# Firebase Crashlytics (Android)
# Already included in google-services plugin
```

---

## 🎯 Step 5: Advanced Features Implementation

### 5.1 Firebase Admin SDK Configuration

Create `src/config/firebase-admin.config.ts`:

```typescript
/**
 * Firebase Admin SDK Configuration (Blaze Plan)
 * Server-side operations with elevated privileges
 * 
 * @protected - Uses service account credentials
 */

import * as admin from 'firebase-admin';

// Service account credentials from environment
const serviceAccount = {
  type: "service_account",
  project_id: import.meta.env.GOOGLE_CLOUD_PROJECT_ID,
  private_key: import.meta.env.FIREBASE_SERVICE_ACCOUNT_KEY?.replace(/\\n/g, '\n'),
  client_email: import.meta.env.FIREBASE_SERVICE_ACCOUNT_EMAIL,
};

// Initialize Firebase Admin (server-side)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as any),
    projectId: import.meta.env.GOOGLE_CLOUD_PROJECT_ID,
  });
}

export const adminMessaging = admin.messaging();
export const adminFirestore = admin.firestore();
export const adminAuth = admin.auth();

export default admin;
```

### 5.2 Advanced FCM v1 API Integration

Create `src/services/fcm-advanced.service.ts`:

```typescript
/**
 * ⚠️ CRITICAL: ADVANCED FCM SERVICE (BLAZE PLAN) - DO NOT DELETE ⚠️
 * 
 * Professional Firebase Cloud Messaging using FCM v1 API
 * Supports advanced features available in Blaze plan
 * 
 * Features:
 * - FCM v1 API (recommended)
 * - Batch notifications (500+ per request)
 * - Rich notifications with images
 * - Action buttons
 * - Priority messaging
 * - Analytics integration
 * - A/B testing support
 * 
 * @protected
 */

import { adminMessaging } from '@/config/firebase-admin.config';
import { MulticastMessage, BatchResponse } from 'firebase-admin/messaging';

export class FCMAdvancedService {
  private static instance: FCMAdvancedService;

  private constructor() {}

  static getInstance(): FCMAdvancedService {
    if (!FCMAdvancedService.instance) {
      FCMAdvancedService.instance = new FCMAdvancedService();
    }
    return FCMAdvancedService.instance;
  }

  /**
   * Send notification to multiple devices (batch)
   * Blaze plan allows 500 tokens per batch
   */
  async sendBatchNotification(
    tokens: string[],
    notification: {
      title: string;
      body: string;
      imageUrl?: string;
    },
    data?: Record<string, string>
  ): Promise<BatchResponse> {
    const message: MulticastMessage = {
      tokens,
      notification: {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.imageUrl,
      },
      data: data || {},
      android: {
        priority: 'high',
        notification: {
          channelId: 'price_alerts',
          priority: 'high',
          sound: 'default',
          color: '#5EEAD4',
        },
      },
      webpush: {
        notification: {
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          requireInteraction: true,
        },
      },
    };

    return await adminMessaging.sendMulticast(message);
  }

  /**
   * Send notification to topic (all subscribers)
   * Perfect for cryptocurrency-specific alerts
   */
  async sendToTopic(
    topic: string,
    notification: {
      title: string;
      body: string;
      imageUrl?: string;
    },
    data?: Record<string, string>
  ): Promise<string> {
    const message = {
      topic,
      notification: {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.imageUrl,
      },
      data: data || {},
      android: {
        priority: 'high' as const,
        notification: {
          channelId: 'price_alerts',
          priority: 'high' as const,
          sound: 'default',
          color: '#5EEAD4',
        },
      },
    };

    return await adminMessaging.send(message);
  }

  /**
   * Send notification with action buttons (Blaze feature)
   */
  async sendWithActions(
    tokens: string[],
    notification: {
      title: string;
      body: string;
      imageUrl?: string;
    },
    actions: Array<{ action: string; title: string }>
  ): Promise<BatchResponse> {
    const message: MulticastMessage = {
      tokens,
      notification: {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.imageUrl,
      },
      webpush: {
        fcmOptions: {
          link: '/dashboard',
        },
        notification: {
          icon: '/pwa-192x192.png',
          actions: actions.map(a => ({
            action: a.action,
            title: a.title,
          })),
        },
      },
    };

    return await adminMessaging.sendMulticast(message);
  }

  /**
   * Schedule notification for later (Blaze feature with Cloud Scheduler)
   */
  async scheduleNotification(
    tokens: string[],
    notification: {
      title: string;
      body: string;
    },
    scheduleTime: Date
  ): Promise<void> {
    // Store in Firestore for Cloud Function to process
    await adminFirestore.collection('scheduled_notifications').add({
      tokens,
      notification,
      scheduleTime: scheduleTime.toISOString(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
  }
}

export const fcmAdvancedService = FCMAdvancedService.getInstance();
```

### 5.3 Analytics Integration

Create `src/services/notification-analytics.service.ts`:

```typescript
/**
 * Notification Analytics Service (Blaze Plan)
 * Track notification performance with Google Analytics 4
 */

import { getAnalytics, logEvent } from '@firebase/analytics';
import { initializeApp } from 'firebase/app';
import { getFirebaseConfig } from '@/config/firebase.config';

const app = initializeApp(getFirebaseConfig());
const analytics = getAnalytics(app);

export class NotificationAnalyticsService {
  /**
   * Track notification sent
   */
  static trackNotificationSent(
    type: string,
    symbol: string,
    recipientCount: number
  ): void {
    logEvent(analytics, 'notification_sent', {
      notification_type: type,
      crypto_symbol: symbol,
      recipient_count: recipientCount,
      timestamp: Date.now(),
    });
  }

  /**
   * Track notification delivered
   */
  static trackNotificationDelivered(
    type: string,
    symbol: string
  ): void {
    logEvent(analytics, 'notification_delivered', {
      notification_type: type,
      crypto_symbol: symbol,
      timestamp: Date.now(),
    });
  }

  /**
   * Track notification opened
   */
  static trackNotificationOpened(
    type: string,
    symbol: string,
    action?: string
  ): void {
    logEvent(analytics, 'notification_opened', {
      notification_type: type,
      crypto_symbol: symbol,
      action: action || 'view',
      timestamp: Date.now(),
    });
  }

  /**
   * Track notification dismissed
   */
  static trackNotificationDismissed(
    type: string,
    symbol: string
  ): void {
    logEvent(analytics, 'notification_dismissed', {
      notification_type: type,
      crypto_symbol: symbol,
      timestamp: Date.now(),
    });
  }
}
```

---

## 📊 Step 6: Monitor Usage & Costs

### 6.1 Firebase Console Monitoring

**Daily Checks**:
1. Go to **Usage and billing**
2. View current spend
3. Check quota usage
4. Review notifications sent

**Weekly Reviews**:
1. Analyze notification performance
2. Check delivery rates
3. Review user engagement
4. Optimize send patterns

### 6.2 Cost Optimization

**Best Practices**:
- ✅ Use topic messaging when possible (efficient)
- ✅ Batch notifications (up to 500 tokens)
- ✅ Implement intelligent retry logic
- ✅ Remove expired tokens regularly
- ✅ Use appropriate priority levels
- ✅ Schedule non-urgent notifications
- ✅ Implement user preference management

**Estimated Costs for Zikalyze**:
```
Assumptions:
- 10,000 active users
- 100 cryptocurrencies
- 5 notifications per user per day

Cloud Messaging: FREE (unlimited)
Cloud Functions: ~$5/month
Cloud Storage: ~$1/month
Firestore: ~$3/month
Analytics: FREE

Total: ~$10/month (well under budget)
```

---

## 🎯 Step 7: Production Configuration

### 7.1 Multi-Region Deployment

**Benefits**:
- Lower latency globally
- Higher availability
- Better disaster recovery

**Configuration**:
```typescript
// Deploy Cloud Functions to multiple regions
const regions = [
  'us-central1',      // US Central
  'europe-west1',     // Europe
  'asia-east1',       // Asia Pacific
];
```

### 7.2 SLA & Reliability

**Blaze Plan SLA**: 99.95% uptime

**Monitoring**:
- Cloud Functions uptime
- FCM delivery success rate
- Average notification latency
- Error rates by type

---

## ✅ Verification Checklist

- [ ] Upgraded to Blaze plan
- [ ] Budget alerts configured
- [ ] Service account created
- [ ] Environment variables set
- [ ] Advanced dependencies installed
- [ ] Analytics enabled
- [ ] Performance monitoring enabled
- [ ] Remote config enabled
- [ ] Multi-region deployment (optional)
- [ ] Cost monitoring active
- [ ] SLA tracking enabled

---

## 📚 Additional Resources

- [Firebase Pricing](https://firebase.google.com/pricing)
- [FCM v1 API Migration](https://firebase.google.com/docs/cloud-messaging/migrate-v1)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Google Analytics 4](https://firebase.google.com/docs/analytics)
- [Firebase SLA](https://firebase.google.com/support/sla)

---

**Status**: Ready for Blaze (Paid) Implementation  
**Last Updated**: 2026-02-16  
**Plan**: Pay as you go  
**Features**: All advanced features enabled
