Zikalyze AI is a professional-grade cryptocurrency analysis platform designed to transform complex market data into actionable, high-signal insights. Built as a "personal trading assistant," it utilizes agentic AI to synthesize technical indicators, on-chain whale activity, and macro catalysts into a scannable, business-grade dashboard.
Project URL:https://zikalyze.com

✨ Key Features 
Multi-Timeframe Confluence: Automatically scans trends across Weekly, Daily, 4H, 1H, and 15M charts to identify trend alignment.
Whale & Exchange Tracking: Monitors real-time whale accumulation and exchange inflows/outflows to gauge institutional sentiment.
Precision Entry Signals: Generates clear Entry Zones, Targets, and Invalidation points for every analyzed asset.
Macro Awareness: Integrates major economic catalysts (e.g., FOMC meetings, CPI data) directly into the technical verdict.
"Vibecode" Formatting: Delivers data in a highly scannable, UI-optimized text format perfect for social sharing and rapid decision-making.


🛠️ Tech Stack
This project is built with a modern, high-performance stack:
Vite: For ultra-fast frontend tooling and development.
TypeScript: Ensuring type-safe, robust code.
React: Powering the interactive and dynamic user interface.
shadcn/ui: For beautiful, accessible, and consistent UI components.
Tailwind CSS: For rapid, responsive utility-first styling.

Zikalyze ai brain 🧠 
/src/lib/zikalyze-brain

## 📊 AI Accuracy & Transparency

We believe in honest, transparent communication about our AI capabilities. For a detailed comparison of Zikalyze AI vs. major AI systems (OpenAI GPT-4, xAI Grok, Anthropic Claude, etc.), see our [Honest AI Accuracy Assessment](./docs/AI_ACCURACY_ASSESSMENT.md).

### 🧠 Hybrid AI Brain Architecture (v2.0)

Zikalyze now features a **Hybrid AI Brain** that combines multiple analysis approaches for enhanced accuracy:

| Component | Technology | Role |
|-----------|-----------|------|
| **Neural Network** | 3-layer MLP (20→64→32→3) | Pattern recognition & confirmation |
| **Algorithmic Engine** | Rule-based ICT/SMC | Technical analysis & entry zones |
| **NLP Sentiment** | 100+ crypto keywords | News & social media analysis |
| **Backtesting** | Historical validation | Accuracy metrics & performance tracking |

**How It Works:**
- Algorithm provides **primary signals** (60% weight) using proven trading methodologies
- Neural network offers **independent confirmation** (40% weight) with trainable weights
- NLP sentiment analysis enhances confidence with real-time text analysis
- Both must agree for high-confidence trade signals (confluence scoring)

### ✅ Key Capabilities
- **True Neural Network** — Multi-layer perceptron with ~6,000+ trainable parameters
- **Persistent Learning** — Learns from prediction outcomes via gradient descent
- **NLP Sentiment Analysis** — Crypto-specific lexicon for news and social text
- **Backtesting Framework** — Full historical validation with accuracy metrics
- **Real-Time Data** — WebSocket connections to 5 major exchanges (Binance, OKX, Bybit, Kraken, Coinbase)

### 🎯 Honest Assessment
- Zikalyze is a **specialized hybrid AI system**, not a general-purpose LLM
- Uses proven trading methodologies (ICT/SMC, multi-timeframe confluence)
- 100% client-side, deterministic, and privacy-preserving
- ~70-80% trend detection accuracy when 3+ timeframes align
- Honest about limitations — no guaranteed profits, no magic predictions


💻 Local Development
Prerequisites



Getting Started

Clone the repository:
git clone <https://github.com/vicisaac48-eng/zikalyze>

Navigate to the project directory:
cd ZIKALYZE

Install dependencies:
npm install

Start the development server:
npm run dev


## 🧪 Health Checks & Testing

This project includes comprehensive automated health checks to verify the web app works without hanging or crashes.

### Running Health Checks

To run the complete health check suite:

```bash
npm run test:health
```

This will:
- Build the application
- Start a preview server
- Run 11+ automated browser tests
- Verify no crashes, hangs, or critical errors
- Generate a detailed test report

### What's Tested

The health checks verify:
- ✅ App loads without hanging
- ✅ All critical pages render successfully  
- ✅ Navigation works smoothly between pages
- ✅ No JavaScript errors or crashes
- ✅ React components render properly
- ✅ Error pages (404) are handled gracefully
- ✅ Page lifecycle completes without memory leaks

### View Test Results

After running tests, view the detailed HTML report:

```bash
npm run test:health:report
```

For more details, see [tests/README.md](./tests/README.md)



How to Edit
There are several ways to refine and evolve Zikalyze AI:

Edit in GitHub: 
Navigate to the desired files and use the "Edit" (pencil icon) to make direct code changes.


GitHub Codespaces: 
Launch a cloud-based development environment directly from the repository.


## 📱 Android App

Zikalyze is available as a native Android app! Download and install the APK directly.

### 📥 Download APK

> **⬇️ QUICK DOWNLOAD: [Click here to download the Zikalyze Android APK](https://github.com/vicisaac48-eng/zikalyze/releases/latest/download/zikalyze-latest.apk)**

[![Download APK](https://img.shields.io/badge/Download-Android%20APK-brightgreen?style=for-the-badge&logo=android&logoColor=white)](https://github.com/vicisaac48-eng/zikalyze/releases/latest/download/zikalyze-latest.apk)

**Download Links:**
- 📲 [**Direct APK Download (Permanent URL)**](https://github.com/vicisaac48-eng/zikalyze/releases/latest/download/zikalyze-latest.apk) - Permanent download link that always works
- 🔗 [**View Latest Release**](https://github.com/vicisaac48-eng/zikalyze/releases/latest) - Browse release page for details
- 📦 [View All Releases](https://github.com/vicisaac48-eng/zikalyze/releases) - Browse all available versions

### 🔄 APK Updates After Merge/Pull Request

The Android APK is **automatically built** whenever code is merged to the main branch. Here's how the process works:

1. **After a PR is Merged**: When a pull request is merged into the `main` branch, a new APK build is automatically triggered via GitHub Actions.

2. **Build Time**: The build typically takes 3-5 minutes to complete. You can monitor the build progress at [GitHub Actions](https://github.com/vicisaac48-eng/zikalyze/actions/workflows/android-build.yml).

3. **Download the New APK**: Once the build completes successfully, the download links above will automatically point to the latest version. Simply click the download button to get the newest APK.

**To download APK from a specific Pull Request (before merge):**

1. Go to the [Pull Requests page](https://github.com/vicisaac48-eng/zikalyze/pulls)
2. Click on the PR you want to test
3. Scroll down to the "Checks" section and click on "Android Build"
4. Once the build completes, click "Summary" in the left sidebar
5. Download the `zikalyze-debug-apk` artifact from the "Artifacts" section at the bottom

> **Note**: Artifacts from PRs expire after 14 days. For permanent access, use the [Latest Release](https://github.com/vicisaac48-eng/zikalyze/releases/latest) download after the PR is merged.

### ✨ Android Native Features

The native Android app includes optimizations not available in the web version:

- **🔔 Native Push Notifications** - Receive real-time price alerts via Firebase Cloud Messaging (FCM)
- **📱 Sticky Headers** - Optimized scrolling behavior with fixed headers that don't jitter during scroll
- **🚫 No Cookie Popups** - Clean native experience without web-specific consent dialogs; sidebar state uses localStorage instead of cookies for reliable persistence
- **⚡ Hardware Acceleration** - GPU-accelerated scrolling and animations for smooth performance
- **📳 Haptic Feedback** - Native vibration feedback on alerts and interactions
- **🔒 Secure Storage** - Local data stored securely on device

### Installation Instructions

1. Download the ZIP file from the link above
2. Extract to get `app-debug.apk`
3. On your Android device, enable **"Install from unknown sources"** in Settings → Security
4. Transfer the APK to your device and install

### Alternative: PWA Installation

You can also install Zikalyze as a Progressive Web App (PWA) directly from your browser:
1. Visit https://zikalyze.com on your Android device
2. Tap the menu (⋮) → "Add to Home screen"
3. The app will work offline with full functionality

### 🎨 Android App Logo & Icons

Need the Zikalyze logo for your Android app or other use?

📖 **[Download Android Logo & Icons](./ANDROID_LOGO.md)**

All logo files with direct download links:
- High-resolution logo files (512x512, 192x192)
- All Android icon sizes (MDPI to XXXHDPI)
- Square and round icon variants
- PWA icons and favicons

### 🏪 Publishing to Google Play Store

Want to publish Zikalyze to the Google Play Store? See our comprehensive guides:

📖 **[Play Store Deployment Guide](./docs/PLAYSTORE_DEPLOYMENT.md)**

The guide covers:
- Generating AAB (Android App Bundle) files via GitHub Actions
- Setting up your Play Console listing
- Signing your app
- Submitting for review

🔐 **[AAB Signing Guide](./AAB_SIGNING_GUIDE.md)**

Complete guide for signing your AAB:
- Easy signing with automated script: `./scripts/sign_aab.sh`
- Google Play App Signing vs. local signing
- Keystore creation and management
- Security best practices
- Troubleshooting common signing issues

📖 **[Play Store Graphics Guide](./PLAYSTORE_GRAPHICS.md)**

Everything you need for Play Store assets:
- Feature graphic (1024×500) - ready to download
- App icon (512×512) - ready-to-use download
- Screenshots - capture methods and guidelines
- Brand guidelines and design tips

🔧 **[AAB Troubleshooting Guide](./AAB_TROUBLESHOOTING.md)**

If your AAB upload fails or app doesn't work:
- Common AAB rejection reasons and fixes
- ProGuard configuration for Capacitor apps
- Version code and signing issues
- Privacy policy requirements
- Verification script: `python3 scripts/verify_aab.py`

## 🌐 IPFS Deployment

This project supports automatic deployment to IPFS (InterPlanetary File System) via Pinata. For detailed instructions on setting up IPFS deployment, see [IPFS_DEPLOYMENT.md](./IPFS_DEPLOYMENT.md).

### Quick Setup
1. Get API keys from [Pinata Cloud](https://app.pinata.cloud/keys)
2. Add `PINATA_API_KEY` and `PINATA_SECRET_KEY` as GitHub repository secrets
3. Push to `main` branch to trigger automatic deployment
