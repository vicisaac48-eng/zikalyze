import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zikalyze.app',
  appName: 'Zikalyze',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // Allow navigation to external URLs for crypto data
    allowNavigation: [
      'api.exchangerate-api.com',
      'api.coingecko.com',
      '*.coingecko.com'
    ]
  },
  android: {
    allowMixedContent: false,
    backgroundColor: '#0a0f1a',
    useLegacyBridge: false,
    // Enable edge-to-edge display
    appendUserAgent: 'ZikalyzeApp/1.0',
    // Optimize WebView performance
    webContentsDebuggingEnabled: false
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0a0f1a',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;
