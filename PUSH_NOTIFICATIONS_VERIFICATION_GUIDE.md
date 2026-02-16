# 🔔 Push Notifications Verification Guide

## Complete Guide to Ensure Perfect Notification Delivery

This guide ensures your Zikalyze push notifications work perfectly without any issues on all platforms.

---

## 📋 Quick Status Check

### 1. Check Implementation Status

**Core Files** (Must exist):
```bash
✅ src/services/fcm.service.ts
✅ src/services/crypto-notification-manager.ts
✅ src/config/firebase.config.ts
✅ src/hooks/usePushNotifications.ts
✅ src/hooks/useSmartNotifications.ts
✅ src/hooks/useLocalNotifications.ts
```

**Protection** (Must pass):
```bash
npm test tests/fcm-protection.test.ts
```

### 2. Environment Check

**Required Variables**:
```env
# Firebase FREE Spark Plan
FIREBASE_API_KEY=your_api_key
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VAPID_PUBLIC_KEY=your_vapid_key

# Optional (for enhanced features)
FCM_SERVER_KEY=your_server_key
```

**Verification Script**:
```bash
# Check if all variables are set
node scripts/verify-fcm-env.js
```

---

## 🧪 Testing All Notification Types

### Test 1: Price Alerts ✅

**What to Test**:
- User sets price alert for BTC at $50,000
- Price crosses threshold
- Notification delivered

**How to Test**:
1. Go to Dashboard → Alerts
2. Set price alert: "BTC above $50,000"
3. Wait for price to cross (or manually trigger via admin)
4. **Expected**: Notification appears within 30 seconds

**Success Criteria**:
- ✅ Notification received
- ✅ Correct title and message
- ✅ Click opens correct page
- ✅ Sound/vibration works

### Test 2: Volume Spike Alerts ✅

**What to Test**:
- Monitor for volume spikes
- Notification when volume exceeds threshold

**How to Test**:
1. Enable volume spike alerts in Settings
2. Set threshold (e.g., 200% above average)
3. Wait for volume spike event
4. **Expected**: Notification within 1 minute

### Test 3: Whale Activity Alerts ✅

**What to Test**:
- Large transaction detected
- Whale activity notification

**How to Test**:
1. Enable whale activity alerts
2. System detects large transaction (>$1M)
3. **Expected**: Notification immediately

### Test 4: Market Sentiment Shifts ✅

**What to Test**:
- Fear & Greed index changes significantly
- Sentiment shift notification

**How to Test**:
1. Enable sentiment alerts
2. Fear & Greed shifts from 20 to 50 (30 points)
3. **Expected**: Notification within 5 minutes

### Test 5: News Events ✅

**What to Test**:
- Important crypto news published
- News event notification

**How to Test**:
1. Enable news alerts for specific cryptos
2. Major news event occurs
3. **Expected**: Notification within 2 minutes

---

## 🌐 Platform-Specific Testing

### Web (PWA) Testing

**Prerequisites**:
- HTTPS required
- Service worker active
- Browser supports Push API

**Test Steps**:
1. Open app in Chrome/Firefox/Edge
2. Accept notification permission
3. Verify service worker registered:
   ```javascript
   navigator.serviceWorker.getRegistrations()
   ```
4. Send test notification
5. **Expected**: Notification appears in system tray

**Troubleshooting**:
- Check browser console for errors
- Verify VAPID key is correct
- Ensure service worker is active
- Check notification permission status

### Android Native Testing

**Prerequisites**:
- Android app installed
- google-services.json configured
- FCM enabled in Firebase Console

**Test Steps**:
1. Install app on Android device
2. Grant notification permission
3. App gets FCM token
4. Token saved to database
5. Send test notification
6. **Expected**: Notification appears in Android notification tray

**Troubleshooting**:
- Check `adb logcat` for errors
- Verify google-services.json is correct
- Ensure Firebase Cloud Messaging is enabled
- Check internet connectivity

### iOS Testing (Future)

**Prerequisites**:
- iOS app installed
- APNs certificate configured
- Notification permission granted

**Test Steps**:
1. Install app on iOS device
2. Grant notification permission
3. App gets APNs token
4. Token saved to database
5. Send test notification
6. **Expected**: Notification appears

---

## 🔍 Debugging Tools

### 1. Notification Console

**Access**: Settings → Notifications → Debug Console

**Features**:
- View last 50 notifications
- See delivery status
- Retry failed notifications
- Test notification sending

### 2. FCM Token Viewer

**Check Current Token**:
```javascript
// Open browser console
const token = await fcmService.getToken();
console.log('FCM Token:', token);
```

**Verify Token in Database**:
```sql
SELECT * FROM fcm_tokens 
WHERE user_id = 'your_user_id';
```

### 3. Permission Status

**Check Permissions**:
```javascript
// Browser console
console.log('Notification permission:', Notification.permission);

// Capacitor (native)
const { permStatus } = await PushNotifications.checkPermissions();
console.log('Permission:', permStatus);
```

### 4. Topic Subscriptions

**List Subscribed Topics**:
```javascript
const topics = await cryptoNotificationManager.getSubscribedTopics();
console.log('Subscribed to:', topics);
```

---

## 🛠️ Common Issues & Solutions

### Issue 1: Notifications Not Received

**Symptoms**:
- No notifications appearing
- Events trigger but no alerts

**Solutions**:

**A. Check Permission**:
```javascript
// Must be 'granted'
Notification.permission === 'granted'
```
**Fix**: Re-request permission in Settings

**B. Verify Token**:
```javascript
const token = await fcmService.getToken();
if (!token) {
  // Token not obtained
  await fcmService.initialize();
}
```

**C. Check Service Worker**:
```javascript
const registration = await navigator.serviceWorker.getRegistration();
if (!registration) {
  // Service worker not registered
  // Reload page
}
```

**D. Verify Database**:
```sql
-- Token should exist
SELECT * FROM fcm_tokens WHERE user_id = 'your_user_id';
```

### Issue 2: Notifications Delayed

**Symptoms**:
- Notifications arrive late (>5 minutes)
- Inconsistent delivery times

**Solutions**:

**A. Check Network**:
- Verify internet connection
- Check firewall settings
- Ensure Firebase servers are accessible

**B. Check Priority**:
- High priority messages: immediate
- Normal priority: may be delayed
- Adjust priority in notification settings

**C. Battery Optimization**:
- Android: Disable battery optimization for app
- Settings → Apps → Zikalyze → Battery → Unrestricted

### Issue 3: Duplicate Notifications

**Symptoms**:
- Same notification appears multiple times
- Notification spam

**Solutions**:

**A. Check Cooldowns**:
```typescript
// Cooldowns prevent spam
COOLDOWNS = {
  price_alert: 0,
  price_surge: 5 * 60 * 1000, // 5 min
  volume_spike: 10 * 60 * 1000, // 10 min
}
```

**B. Verify Topic Subscriptions**:
```javascript
// Remove duplicate subscriptions
await cryptoNotificationManager.unsubscribeFromAll();
await cryptoNotificationManager.subscribeToTop100();
```

### Issue 4: Wrong Notification Content

**Symptoms**:
- Incorrect price shown
- Wrong cryptocurrency mentioned
- Outdated information

**Solutions**:

**A. Clear Cache**:
```javascript
// Clear notification cache
localStorage.removeItem('notification_cache');
```

**B. Resync Data**:
```javascript
// Force data refresh
await cryptoNotificationManager.syncPreferences();
```

---

## 📊 Monitoring & Analytics

### Key Metrics to Track

1. **Delivery Rate**:
   - Target: >99%
   - Formula: (Delivered / Sent) × 100

2. **Click-Through Rate**:
   - Target: >15%
   - Formula: (Clicked / Delivered) × 100

3. **Permission Grant Rate**:
   - Target: >60%
   - Formula: (Granted / Requested) × 100

4. **Error Rate**:
   - Target: <1%
   - Formula: (Errors / Total) × 100

### Monitoring Dashboard

**Access**: Admin → Analytics → Notifications

**Metrics Available**:
- Total notifications sent (24h, 7d, 30d)
- Delivery success rate
- Average delivery time
- Notifications by type
- Notifications by cryptocurrency
- User engagement (clicks)
- Permission status distribution
- Error logs

### Database Queries

**Notification Stats**:
```sql
-- Total notifications sent today
SELECT COUNT(*) FROM notification_logs
WHERE created_at >= CURRENT_DATE;

-- Delivery rate
SELECT 
  COUNT(CASE WHEN delivered = true THEN 1 END) * 100.0 / COUNT(*) as delivery_rate
FROM notification_logs
WHERE created_at >= CURRENT_DATE;

-- Most active cryptocurrencies
SELECT symbol, COUNT(*) as notification_count
FROM notification_logs
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY symbol
ORDER BY notification_count DESC
LIMIT 10;
```

---

## ✅ Production Readiness Checklist

### Pre-Deployment

- [ ] All environment variables configured
- [ ] Firebase project created and configured
- [ ] google-services.json added (Android)
- [ ] Service worker tested
- [ ] All notification types tested
- [ ] Protection tests passing (30+)
- [ ] Error handling verified
- [ ] Retry mechanisms working
- [ ] Database schema deployed
- [ ] Monitoring dashboard configured

### Post-Deployment

- [ ] Send test notification to 10 users
- [ ] Verify 99%+ delivery rate
- [ ] Monitor error logs for 24 hours
- [ ] Check user feedback
- [ ] Verify all platforms working
- [ ] Test from multiple locations
- [ ] Check battery impact on mobile
- [ ] Verify notification settings persist
- [ ] Test opt-out functionality
- [ ] Monitor Firebase quota usage

### Ongoing Maintenance

- [ ] Weekly: Review delivery metrics
- [ ] Weekly: Check error logs
- [ ] Monthly: Audit notification types
- [ ] Monthly: Review user preferences
- [ ] Monthly: Optimize notification timing
- [ ] Quarterly: Update notification templates
- [ ] Quarterly: Review Firebase costs (should be $0)
- [ ] Yearly: Renew Firebase certificates

---

## 📞 Support Resources

### Documentation
- **Setup Guide**: `FIREBASE_FREE_SPARK_SETUP.md`
- **Technical Guide**: `FIREBASE_FCM_SETUP_GUIDE.md`
- **Protection Guide**: `FCM_PROTECTION_GUIDE.md`
- **Implementation Summary**: `FCM_IMPLEMENTATION_COMPLETE.md`

### Testing
- **Protection Tests**: `tests/fcm-protection.test.ts`
- **Run Tests**: `npm test tests/fcm-protection.test.ts`

### Debugging
- Browser DevTools → Console
- Browser DevTools → Application → Service Workers
- Firebase Console → Cloud Messaging
- Supabase Dashboard → Database → fcm_tokens table

### Contact
- GitHub Issues: Report bugs
- Documentation: Self-service guides
- Community: Discord/Slack (if available)

---

## 🎯 Success Indicators

**✅ Everything Working Perfectly**:
1. Protection tests: 30/30 passing
2. Notification delivery: >99%
3. Click-through rate: >15%
4. Permission grant rate: >60%
5. Error rate: <1%
6. User complaints: None
7. Firebase cost: $0.00/month
8. All platforms: Working
9. All notification types: Functional
10. Database queries: Fast (<100ms)

**If any indicator fails, review this guide and troubleshoot accordingly.**

---

**Last Updated**: 2026-02-16  
**Version**: 1.0  
**Status**: Production Ready  
**Cost**: FREE ($0/month)
