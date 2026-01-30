import React from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App.tsx";
import "./index.css";
import "./i18n/config";
import { initializeAnalytics } from "./lib/analytics";

// Clerk publishable key from environment
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  console.warn("Missing VITE_CLERK_PUBLISHABLE_KEY - Authentication will not work");
}

// Initialize Vercel Web Analytics
initializeAnalytics();

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
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY || ""}>
      <App />
    </ClerkProvider>
  </React.StrictMode>
);
