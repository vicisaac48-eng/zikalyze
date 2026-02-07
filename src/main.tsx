import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n/config";
import { initializeAnalytics } from "./lib/analytics";
import { Capacitor } from "@capacitor/core";
import { WALLET_DATA_KEY } from "./lib/auth-constants";

// Initialize Vercel Web Analytics
initializeAnalytics();

// Android native app optimizations
// - Disable zoom to feel like a native app (web version keeps zoom for accessibility)
// - Add android-native class to html for Android-specific CSS rules (vertical-only scrolling)
// - Auto-redirect to dashboard if user is already logged in (skip landing page)
if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
  // Add android-native class to html element for CSS targeting
  document.documentElement.classList.add('android-native');
  
  // Disable zoom on Android native app
  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    viewport.setAttribute('content', 
      'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
    );
  }
  
  // Android: Auto-redirect to dashboard if user is logged in
  // This prevents showing the landing page when the user returns to the app
  // Only redirect if we're on the root path (landing page)
  try {
    const savedWalletData = localStorage.getItem(WALLET_DATA_KEY);
    const currentHash = window.location.hash;
    const isOnLandingPage = !currentHash || currentHash === '' || currentHash === '#' || currentHash === '#/';
    
    if (savedWalletData && isOnLandingPage) {
      // User is logged in and on landing page - redirect to dashboard
      // This runs before React renders, so there's no flash of landing page
      window.location.hash = '#/dashboard';
    }
  } catch (error) {
    // Ignore localStorage errors - let normal auth flow handle it
    console.warn('[Android] Failed to check saved wallet:', error);
  }
}

// Register service worker for offline caching
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swPath = import.meta.env.BASE_URL + 'sw.js';
    navigator.serviceWorker.register(swPath)
      .then((registration) => {
        console.log('SW registered:', registration.scope);
      })
      .catch((error) => {
        console.log('SW registration failed:', error);
      });
  });
}

const container = document.getElementById("root")!;
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
