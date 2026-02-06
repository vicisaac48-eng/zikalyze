import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n/config";
import { initializeAnalytics } from "./lib/analytics";
import { Capacitor } from "@capacitor/core";

// Initialize Vercel Web Analytics
initializeAnalytics();

// Disable zoom on Android native app only (to feel like a native app)
// Web version keeps zoom enabled for accessibility
if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    viewport.setAttribute('content', 
      'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
    );
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
