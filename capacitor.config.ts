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
    webContentsDebuggingEnabled: false,
    // Allow content to scroll past the edge with elastic effect (improves scroll feel)
    overScrollMode: 'always'
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
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    LocalNotifications: {
      // Small icon shown in status bar (required for Android)
      smallIcon: 'ic_stat_icon_config_sample',
      // Large icon shown in notification drawer
      iconColor: '#5EEAD4',
      // Sound to play
      sound: 'default'
    }
  }
};

export default config;
