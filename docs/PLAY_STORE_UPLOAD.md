# 📱 Play Store Upload Guide (For Beginners)

This is a simple, step-by-step guide to upload Zikalyze to the Google Play Store. No coding experience required!

---

## 🎯 What You Need

Before starting, make sure you have:

| Requirement | How to Get It | Cost |
|------------|---------------|------|
| Google Play Developer Account | [Sign up here](https://play.google.com/console/signup) | $25 one-time fee |
| The AAB file (app bundle) | GitHub will build it for you automatically! | Free |
| App screenshots | Take them from your phone or use the web app | Free |

---

## 📋 Step-by-Step Guide

### Step 1: Create a Google Play Developer Account (5 minutes)

1. Go to [Google Play Console](https://play.google.com/console/signup)
2. Sign in with your Google account
3. Pay the **$25 one-time registration fee**
4. Fill in your developer information
5. Accept the Developer Distribution Agreement

> ⏳ **Note:** Account verification can take 24-48 hours

---

### Step 2: Build Your App (Automatic - Just Click!)

The easiest way is to use GitHub Actions:

1. **Go to your GitHub repository:** https://github.com/vicisaac48-eng/zikalyze
2. Click on the **"Actions"** tab at the top
3. Click on **"Android Build"** in the left sidebar
4. Click the **"Run workflow"** button (dropdown on the right)
5. Select **"release"** from the build type dropdown
6. Click **"Run workflow"** (green button)

![Run Workflow](https://docs.github.com/assets/cb-20654/images/help/actions/actions-workflow-dispatch.png)

7. Wait for the build to complete (5-10 minutes) ✅
8. Click on the completed workflow run
9. Scroll down to **"Artifacts"** section
10. Download **"zikalyze-release-aab"** - this is your app!

> 📦 The downloaded file will be named `app-release.aab` - this is what you upload to Play Store

---

### Step 3: Create Your App in Play Console (10 minutes)

1. Go to [Google Play Console](https://play.google.com/console)
2. Click **"Create app"** button
3. Fill in the details:

| Field | What to Enter |
|-------|---------------|
| **App name** | Zikalyze - AI Crypto Trading Analysis |
| **Default language** | English (United States) |
| **App or game** | App |
| **Free or paid** | Free |

4. Check both boxes (declarations) and click **"Create app"**

---

### Step 4: Set Up Your Store Listing (15 minutes)

In the left sidebar, go to **"Grow" → "Store listing" → "Main store listing"**

#### App Details
```
Short description (80 characters max):
AI-powered cryptocurrency analysis for smarter trading decisions.

Full description:
Zikalyze AI is a professional-grade cryptocurrency analysis platform designed to transform complex market data into actionable, high-signal insights.

KEY FEATURES:

📊 Multi-Timeframe Analysis
• Automatically scans trends across Weekly, Daily, 4H, 1H, and 15M charts
• Identifies trend alignment across multiple timeframes
• Provides confluence-based trading signals

🐋 Whale & Exchange Tracking
• Real-time whale accumulation monitoring
• Exchange inflows/outflows analysis
• Institutional sentiment indicators

🎯 Precision Entry Signals
• Clear Entry Zones for each asset
• Multiple take-profit targets
• Defined invalidation levels

📰 Macro Catalyst Awareness
• FOMC meeting integration
• CPI data tracking
• Major economic event calendar

💡 Smart Notifications
• Price alert system
• Technical breakout alerts
• Customizable notification preferences

ADDITIONAL FEATURES:
• Dark mode optimized interface
• Offline support for cached data
• Multi-language support
• Privacy-focused (no data collection)

DISCLAIMER:
Zikalyze is a cryptocurrency analysis tool, not financial advice. Trading cryptocurrencies carries significant risk. Past performance does not guarantee future results.
```

#### Graphics Required

| Type | Size | Description |
|------|------|-------------|
| **App icon** | 512 x 512 px | Your app logo (already in `public/pwa-512x512.png`) |
| **Feature graphic** | 1024 x 500 px | Banner image for your app |
| **Phone screenshots** | Min 2, 1080 x 1920 px | Screenshots of your app |

> 💡 **Tip:** Take screenshots from your phone while using https://zikalyze.com

---

### Step 5: Complete the Content Rating (5 minutes)

1. Go to **"Policy" → "App content"**
2. Click **"Start questionnaire"** under Content rating
3. Enter your email address
4. Select **"Utility, Productivity, Communication, or Other"** as category
5. Answer all questions (mostly "No" for a finance app)
6. Click **"Save"** then **"Calculate rating"**
7. Click **"Apply"**

---

### Step 6: Set Up Privacy Policy (2 minutes)

1. Still in **"Policy" → "App content"**
2. Click **"Privacy policy"**
3. Enter your privacy policy URL: `https://zikalyze.com/#/privacy`
4. Click **"Save"**

---

### Step 7: Target Audience and Content (3 minutes)

1. Go to **"Policy" → "App content" → "Target audience"**
2. Select age group: **18 and over** (recommended for finance apps)
3. Answer any additional questions
4. Save changes

---

### Step 8: Upload Your App (5 minutes)

1. Go to **"Release" → "Production"**
2. Click **"Create new release"**
3. Click **"Upload"** and select your `app-release.aab` file (from Step 2)
4. Wait for the upload to complete
5. Add release notes:
```
Version 1.0.0 - Initial Release

• AI-powered cryptocurrency analysis
• Multi-timeframe trend detection
• Whale and exchange tracking
• Smart price alerts
• Beautiful dark mode interface
```
6. Click **"Review release"**
7. Fix any warnings/errors if shown
8. Click **"Start rollout to Production"**

---

### Step 9: Wait for Review (1-7 days)

Google will review your app. Common review times:
- First-time apps: **3-7 days**
- Updates to existing apps: **1-3 days**

You'll receive an email when your app is approved or if changes are needed.

---

## 🎉 Congratulations!

Once approved, your app will be live on Google Play Store!

---

## ❓ Common Issues & Solutions

### "App signing key not found"
- When uploading for the first time, Google will create an app signing key for you
- Just select "Let Google manage my app signing key" when prompted

### "Upload failed - Invalid AAB"
- Make sure you downloaded the correct file (`zikalyze-release-aab`)
- The file should be around 10-30 MB
- Try building again using GitHub Actions

### "Content rating missing"
- Complete the content rating questionnaire (Step 5)

### "Privacy policy required"
- Add your privacy policy URL (Step 6)

### "Screenshots required"
- Upload at least 2 phone screenshots

---

## 📞 Need More Help?

- **Google Play Console Help:** https://support.google.com/googleplay/android-developer
- **Zikalyze Discord:** https://discord.gg/MjpCBEVBnu
- **Contact:** https://zikalyze.com/#/contact

---

## 🔄 For Future Updates

When you want to update your app:

1. Update the version in `package.json` (e.g., "1.0.1")
2. Update `versionCode` and `versionName` in `android/app/build.gradle`
3. Run the GitHub Action again to build a new AAB
4. Upload the new AAB to Play Console under a new release
