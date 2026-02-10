# Advertising ID Usage Analysis

**Date:** 2026-02-10  
**App:** Zikalyze (com.zikalyze.app)  
**Version:** 1.2.0

## Summary

**Does this app use advertising ID?**

**NO** - This app does NOT use advertising ID.

## Detailed Analysis

### 1. Android Manifest Review

**File:** `android/app/src/main/AndroidManifest.xml`

**Findings:**
- ✅ No `com.google.android.gms.permission.AD_ID` permission declared
- ✅ No advertising-related permissions found
- The manifest only includes essential permissions:
  - `android.permission.INTERNET` (required for network access)
  - `android.permission.POST_NOTIFICATIONS` (for push notifications)
  - `android.permission.VIBRATE` (for haptic feedback)
  - `android.permission.RECEIVE_BOOT_COMPLETED` (for notifications)

### 2. Android Dependencies Review

**File:** `android/app/build.gradle`

**Findings:**
- ✅ No Google Play Services Ads SDK (`com.google.android.gms:play-services-ads`)
- ✅ No Firebase Analytics SDK with ads
- ✅ No AdMob SDK
- ✅ No Facebook Audience Network SDK
- ✅ No other advertising network SDKs

**Dependencies used:**
- Standard AndroidX libraries (AppCompat, CoordinatorLayout, Material Design)
- Capacitor framework for hybrid app functionality
- Google Play Services (only for push notifications, if google-services.json exists)

### 3. Capacitor Plugins Review

**Plugins installed:**
- `@capacitor/android` - Core framework
- `@capacitor/haptics` - Haptic feedback
- `@capacitor/local-notifications` - Local notifications
- `@capacitor/push-notifications` - Push notifications

**Findings:**
- ✅ All plugins are functionality-focused, none are advertising-related
- ✅ No advertising or analytics plugins installed

### 4. NPM Dependencies Review

**File:** `package.json`

**Analytics-related dependency:**
- `@vercel/analytics` - Vercel Web Analytics

**Findings:**
- ✅ Vercel Analytics is a **web-only** analytics solution
- ✅ It does NOT access or use advertising ID
- ✅ It does NOT track users across apps or websites for advertising
- ✅ It only collects anonymous web traffic data (page views, user interactions)
- ✅ It runs in the browser/WebView context, not native Android code

**No other advertising/tracking SDKs found:**
- ✅ No Google Analytics SDK
- ✅ No Firebase Analytics SDK
- ✅ No Facebook SDK
- ✅ No mobile ad networks (AdMob, MoPub, Unity Ads, etc.)

### 5. Source Code Review

**Analytics implementation:** `src/lib/analytics.ts`

```typescript
import { inject } from '@vercel/analytics';

export const initializeAnalytics = (): void => {
  try {
    inject();
    console.log('Vercel Web Analytics initialized successfully');
  } catch (error) {
    console.warn('Failed to initialize Vercel Web Analytics:', error);
  }
};
```

**Findings:**
- ✅ Only web-based analytics (Vercel)
- ✅ No native advertising ID access
- ✅ No device fingerprinting or ad tracking code

### 6. Google Services Configuration

**Findings:**
- ✅ No `google-services.json` file found in the repository
- The build.gradle includes a try-catch block to apply Google Services plugin only if the file exists
- Without `google-services.json`, no Google Play Services integration is active
- Even if added later for push notifications, the app would need explicit advertising SDK dependencies to use advertising ID

## Conclusion

**This app does NOT use advertising ID.**

The app:
1. Does not declare the `AD_ID` permission in AndroidManifest.xml
2. Does not include any advertising SDKs or libraries
3. Does not include any analytics SDKs that access advertising ID
4. Only uses Vercel Web Analytics, which is web-based and does not access device advertising IDs
5. Does not include code that accesses or uses advertising identifiers

### For Google Play Store Data Safety Form

When filling out the Google Play Store Data Safety section regarding advertising ID:

**Question:** "Does your app collect or share advertising ID?"

**Answer:** NO

**Explanation:** The app does not collect, use, or share the Android advertising ID. The app only uses Vercel Web Analytics for anonymous web traffic analysis, which does not access device-level identifiers like advertising ID.

## References

- [Android Advertising ID Documentation](https://support.google.com/googleplay/android-developer/answer/6048248)
- [Google Play Data Safety](https://support.google.com/googleplay/android-developer/answer/10787469)
- [Vercel Analytics Documentation](https://vercel.com/docs/analytics)

## Verification Date

This analysis was performed on: **2026-02-10**

If the app is updated to include new SDKs or dependencies, this analysis should be re-evaluated.
