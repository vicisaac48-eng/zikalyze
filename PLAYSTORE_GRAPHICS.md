# 🎨 Google Play Store Graphics Guide

This guide provides all the graphic assets and requirements needed for publishing Zikalyze to the Google Play Store.

## 📋 Required Graphics Overview

Google Play Store requires specific graphic assets for your app listing. Here's what you need:

| Asset Type | Size | Format | Status | Required |
|------------|------|--------|--------|----------|
| **Feature Graphic** | 1024 × 500 | PNG/JPEG | ⚠️ Need to create | ✅ Yes |
| **App Icon** | 512 × 512 | PNG | ✅ Available | ✅ Yes |
| **Phone Screenshots** | 320-3840px | PNG/JPEG | ⚠️ Need to create | ✅ Yes (min 2) |
| **Tablet Screenshots** | Varies | PNG/JPEG | ⚠️ Optional | ❌ No |
| **Promo Graphic** | 180 × 120 | PNG/JPEG | ⚠️ Optional | ❌ No |

---

## ✅ Available Assets (Ready to Use)

### 1. App Icon (512 × 512) ✅ READY

**Perfect for Play Store app icon requirement!**

📥 **[Download App Icon (512×512 PNG)](https://raw.githubusercontent.com/vicisaac48-eng/zikalyze/main/public/pwa-512x512.png)**

- ✅ Exact size required by Play Store
- ✅ 32-bit PNG with transparency
- ✅ Professional Zikalyze branding
- ✅ Ready to upload directly

**Alternative:**
- 📥 [Download Main Logo (512×512 PNG)](https://raw.githubusercontent.com/vicisaac48-eng/zikalyze/main/src/assets/zikalyze-logo.png)

### 2. Social Media Image (1200 × 630)

This can be adapted for promotional use:

📥 **[Download OG Image (1200×630 PNG)](https://raw.githubusercontent.com/vicisaac48-eng/zikalyze/main/public/og-image.png)**

- Can be cropped/resized for feature graphic
- Shows Zikalyze branding
- Good reference for creating other graphics

---

## ⚠️ Graphics You Need to Create

### 1. Feature Graphic (1024 × 500) - REQUIRED

The feature graphic is the banner image displayed at the top of your Play Store listing.

**Requirements:**
- Size: **1024 × 500 pixels**
- Format: PNG or JPEG
- Max file size: 1MB
- No text overlay (Google may reject text-heavy graphics)

**Design Recommendations:**

**Option A: Simple Branded Banner**
```
┌──────────────────────────────────────────────┐
│                                              │
│    [Zikalyze Logo]    Zikalyze AI           │
│                                              │
│    AI-Powered Cryptocurrency Analysis       │
│                                              │
└──────────────────────────────────────────────┘
```

**Option B: App Screenshot Showcase**
```
┌──────────────────────────────────────────────┐
│  [Logo]  │  [Dashboard] │ [Analysis] │ [AI] │
│                                              │
└──────────────────────────────────────────────┘
```

**Design Tips:**
- Use Zikalyze brand colors: `#70ffc1` (cyan/green) and `#0f172a` (dark)
- Keep important content away from edges (safe zone: 50px margin)
- Test on both light and dark backgrounds
- Focus on visuals over text

**Tools to Create Feature Graphic:**
1. **Figma** (Free) - https://www.figma.com
2. **Canva** (Free) - https://www.canva.com (use custom size: 1024×500)
3. **GIMP** (Free) - https://www.gimp.org
4. **Photoshop** (Paid)

**Quick Template:**
```
Width: 1024px
Height: 500px
Background: Linear gradient from #0f172a to #1e293b
Logo: Centered or left-aligned
Text: "Zikalyze AI - Crypto Analysis"
Accent color: #70ffc1
```

### 2. Phone Screenshots (Min 2, Max 8) - REQUIRED

Capture screenshots of your app to showcase its features.

**Requirements:**
- **Minimum:** 2 screenshots
- **Maximum:** 8 screenshots
- **Aspect ratio:** 16:9 or 9:16 (portrait recommended for mobile)
- **Dimensions:** Between 320px and 3840px on shortest side
- **Format:** PNG or JPEG
- **Recommended:** 1080 × 1920 (9:16 portrait) or 1920 × 1080 (16:9 landscape)

**Recommended Screenshots to Include:**

1. **Dashboard View** (Main screen with price overview)
2. **AI Analyzer** (AI analysis with signals/recommendations)
3. **Top 100 Crypto List** (Cryptocurrency rankings)
4. **Analysis Results** (Detailed analysis output with targets)
5. **Live Price Ticker** (Real-time price updates)
6. **Portfolio/Watchlist** (If available)

**How to Capture Screenshots:**

**Method 1: Android Emulator (Recommended)**
```bash
# Install and run Android app
npm run build
npx cap sync android
# Open in Android Studio and launch emulator
# Take screenshots using emulator controls (📷 icon)
```

**Method 2: Physical Android Device**
```bash
# Install APK on your Android phone
# Open the app and navigate to different screens
# Press Volume Down + Power to capture screenshots
# Screenshots saved to: Pictures/Screenshots/
```

**Method 3: Browser DevTools (PWA Version)**
```bash
# Open https://zikalyze.com in Chrome
# Press F12 → Toggle device toolbar (Ctrl+Shift+M)
# Set to "Pixel 5" or similar Android device
# Capture viewport: Ctrl+Shift+P → "Capture screenshot"
```

**Screenshot Guidelines:**
- Show real data (not placeholder content)
- Use light mode or dark mode consistently
- Remove any personal/sensitive information
- Highlight key features in each screenshot
- Consider adding text overlays (external tool) to explain features

---

## 🎨 Brand Guidelines

**Zikalyze Brand Colors:**
- **Primary:** `#70ffc1` (Cyan/Green)
- **Background Dark:** `#0f172a` (Dark Slate)
- **Background Medium:** `#1e293b` (Slate)
- **Text:** White/Light on dark backgrounds

**Logo Usage:**
- Available in 512×512, 192×192 sizes
- PNG format with transparency
- See [ANDROID_LOGO.md](./ANDROID_LOGO.md) for all logo variants

**Typography:**
- Clean, modern sans-serif fonts
- Good readability on mobile screens
- High contrast for accessibility

---

## 📱 Play Store Listing Setup Checklist

Once you have your graphics ready, here's what to upload:

### Required Assets
- [ ] **App Icon** (512×512) - ✅ Use `pwa-512x512.png`
- [ ] **Feature Graphic** (1024×500) - ⚠️ Create using guide above
- [ ] **Screenshots** (2-8 images) - ⚠️ Capture from running app

### Store Listing Information
- [ ] **App Name:** Zikalyze AI
- [ ] **Short Description** (80 chars max):
  ```
  AI-powered cryptocurrency analysis with real-time signals and whale tracking
  ```
  _(79 characters - edit carefully to stay under 80 char limit)_
- [ ] **Full Description** (4000 chars max):
  ```
  Zikalyze AI is your professional-grade cryptocurrency analysis companion.
  
  🧠 AI-Powered Analysis
  • Multi-timeframe confluence detection across 5 timeframes
  • Hybrid neural network + algorithmic trading signals
  • Real-time whale tracking and exchange flow monitoring
  
  📊 Key Features
  • Entry zones with precise targets and invalidation levels
  • NLP sentiment analysis from news and social media
  • Real-time WebSocket connections to major exchanges
  • Push notifications for price alerts
  • 100+ cryptocurrencies supported
  
  🔒 Privacy First
  • 100% client-side analysis - your data stays on your device
  • No account required for basic features
  • Transparent AI methodology
  
  ⚡ Live Trading Features
  • Real-time price updates via WebSocket
  • Flash animations for significant price changes
  • Top 100 cryptocurrency tracking
  • Multi-exchange data aggregation
  
  📱 Native Android Features
  • Native push notifications via FCM
  • Hardware-accelerated scrolling
  • Optimized battery usage
  • Works offline after initial load
  
  Perfect for both crypto traders and enthusiasts who want professional-grade
  analysis without expensive subscriptions or complex setups.
  ```

- [ ] **Category:** Finance
- [ ] **Tags:** Cryptocurrency, Trading, Finance, Analytics, Bitcoin, Ethereum
- [ ] **Content Rating:** Everyone (complete questionnaire)
- [ ] **Privacy Policy URL:** https://zikalyze.com/privacy.html
- [ ] **Terms of Service URL:** https://zikalyze.com/terms.html

---

## 🛠️ Tools & Resources

### Design Tools (Free)
- **Figma:** https://www.figma.com
- **Canva:** https://www.canva.com
- **GIMP:** https://www.gimp.org
- **Inkscape:** https://inkscape.org (for SVG editing)

### Screenshot Tools
- **Android Studio Emulator:** Built-in screenshot tool
- **Chrome DevTools:** Device simulation and screenshots
- **Screely:** https://screely.com (add device frames)
- **Mockuphone:** https://mockuphone.com (device mockups)

### Image Optimization
- **TinyPNG:** https://tinypng.com (compress PNG files)
- **ImageOptim:** https://imageoptim.com (Mac)
- **Squoosh:** https://squoosh.app (web-based)

### Play Store Resources
- **Google Play Console:** https://play.google.com/console
- **Asset Guidelines:** https://support.google.com/googleplay/android-developer/answer/9866151
- **Design Guidelines:** https://developer.android.com/distribute/google-play/resources/icon-design-specifications

---

## 📸 Screenshot Specifications

### Phone Screenshots (Portrait - Recommended)

**Recommended Size:** 1080 × 1920 (9:16 aspect ratio)

**Acceptable Ranges:**
- Minimum: 320px on shortest side
- Maximum: 3840px on longest side
- Aspect ratio: 9:16 (portrait) or 16:9 (landscape)

**Common Sizes:**
- **1080 × 1920** - Full HD (recommended)
- **1440 × 2560** - QHD
- **2160 × 3840** - 4K

### Tablet Screenshots (Optional)

**7-inch Tablet:**
- Size: 1200 × 1920 (or similar 16:10 ratio)
- Min 2, max 8 screenshots

**10-inch Tablet:**
- Size: 1600 × 2560 (or similar 16:10 ratio)
- Min 2, max 8 screenshots

---

## 🎯 Quick Start Guide

### Step 1: Get Ready-to-Use Assets

Download these immediately:

**Using Command Line:**
```bash
# App Icon (512×512) - REQUIRED ✅
wget https://raw.githubusercontent.com/vicisaac48-eng/zikalyze/main/public/pwa-512x512.png
# or using curl:
curl -O https://raw.githubusercontent.com/vicisaac48-eng/zikalyze/main/public/pwa-512x512.png

# Reference image for creating feature graphic
wget https://raw.githubusercontent.com/vicisaac48-eng/zikalyze/main/public/og-image.png
# or using curl:
curl -O https://raw.githubusercontent.com/vicisaac48-eng/zikalyze/main/public/og-image.png
```

**Using Browser:**
- Click the links in the "Available Assets" section above
- Right-click the image → "Save Image As..."

### Step 2: Create Feature Graphic

1. Open Canva or Figma
2. Create new design: 1024 × 500 pixels
3. Use Zikalyze colors: `#70ffc1` and `#0f172a`
4. Add logo (download from ANDROID_LOGO.md)
5. Add text: "Zikalyze AI" or "AI-Powered Crypto Analysis"
6. Export as PNG (under 1MB)

### Step 3: Capture Screenshots

1. Install Zikalyze APK on Android device/emulator
2. Navigate through main features:
   - Dashboard
   - AI Analyzer
   - Top 100 List
   - Analysis results
3. Take 2-8 screenshots (Volume Down + Power on device)
4. Transfer to computer
5. Optional: Add device frames using Mockuphone

### Step 4: Upload to Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Navigate to **Store presence** → **Main store listing**
3. Upload:
   - App icon (512×512)
   - Feature graphic (1024×500)
   - Screenshots (2-8 images)
4. Fill in descriptions and save

---

## ❓ FAQ

**Q: Can I use the OG image (1200×630) as the feature graphic?**
A: Not directly - it needs to be exactly 1024×500. However, you can crop/resize it using any image editor.

**Q: Do I need tablet screenshots?**
A: No, they're optional. Phone screenshots are sufficient for initial launch.

**Q: What if my screenshots have different aspect ratios?**
A: Google Play accepts 16:9 or 9:16. Stick to one ratio for consistency (9:16 portrait recommended).

**Q: Can I add text overlays to screenshots?**
A: Yes! Many developers add text to explain features. Use external tools like Canva or Photoshop after capturing.

**Q: How many screenshots should I upload?**
A: Minimum 2, recommended 4-6 to showcase main features. Quality over quantity.

**Q: Where can I find the app icon?**
A: See [ANDROID_LOGO.md](./ANDROID_LOGO.md) - use `pwa-512x512.png` (already perfect size!)

---

## 🔗 Related Documentation

- **[ANDROID_LOGO.md](./ANDROID_LOGO.md)** - All logo and icon downloads
- **[PLAYSTORE_DEPLOYMENT.md](./docs/PLAYSTORE_DEPLOYMENT.md)** - Complete deployment guide
- **[README.md](./README.md)** - Main project documentation

---

## 💡 Pro Tips

1. **Feature Graphic:** Keep it simple - Google may reject overly promotional graphics
2. **Screenshots:** Show real app usage, not marketing materials
3. **Consistency:** Use the same theme (light/dark) across all screenshots
4. **File Size:** Compress images to load faster (under 1MB for feature graphic)
5. **Testing:** Preview in Play Console before publishing
6. **Updates:** You can update graphics anytime without a new app release

---

**Need help?** Open an issue on the [GitHub repository](https://github.com/vicisaac48-eng/zikalyze/issues) or check the [Play Store Deployment Guide](./docs/PLAYSTORE_DEPLOYMENT.md).
