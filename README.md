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

**Key Points:**
- Zikalyze is a **specialized algorithmic analysis engine**, not a general-purpose LLM
- Uses proven trading methodologies (ICT/SMC, multi-timeframe confluence)
- 100% client-side, deterministic, and privacy-preserving
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

Zikalyze is available as a native Android app! You can download and install the APK from our GitHub Actions.

### Download APK

1. Go to [GitHub Actions](https://github.com/vicisaac48-eng/zikalyze/actions/workflows/android-build.yml)
2. Click on the latest successful workflow run
3. Scroll down to the **Artifacts** section
4. Download `zikalyze-debug-apk` (or `zikalyze-release-apk` for production)
5. On your Android device, enable "Install from unknown sources" in Settings
6. Install the downloaded APK file

> **Note**: The APK artifacts expire after 14 days (debug) or 30 days (release). Download the latest version regularly.

### Direct Link (Latest Build)

Visit our [Android Build Workflow](https://github.com/vicisaac48-eng/zikalyze/actions/workflows/android-build.yml) to download the latest APK.

### Alternative: PWA Installation

You can also install Zikalyze as a Progressive Web App (PWA) directly from your browser:
1. Visit https://zikalyze.com on your Android device
2. Tap the menu (⋮) → "Add to Home screen"
3. The app will work offline with full functionality

## 🌐 IPFS Deployment

This project supports automatic deployment to IPFS (InterPlanetary File System) via Pinata. For detailed instructions on setting up IPFS deployment, see [IPFS_DEPLOYMENT.md](./IPFS_DEPLOYMENT.md).

### Quick Setup
1. Get API keys from [Pinata Cloud](https://app.pinata.cloud/keys)
2. Add `PINATA_API_KEY` and `PINATA_SECRET_KEY` as GitHub repository secrets
3. Push to `main` branch to trigger automatic deployment
