import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Use relative paths for IPFS compatibility
  base: './',
  server: {
    host: "::",
    port: 8080,
  },
  // Build optimizations for speed and stability
  build: {
    // Reduce chunk size warning limit to 500KB (more aggressive splitting)
    chunkSizeWarningLimit: 500,
    // Optimize chunking for better caching and faster initial load
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor chunks - split large dependencies for better caching
          if (id.includes('node_modules')) {
            // React ecosystem
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            // Radix UI components
            if (id.includes('@radix-ui')) {
              return 'vendor-ui';
            }
            // Charts library
            if (id.includes('recharts') || id.includes('victory')) {
              return 'vendor-charts';
            }
            // Supabase and auth - can be large, separate chunk
            if (id.includes('@supabase') || id.includes('supabase-js')) {
              return 'vendor-supabase';
            }
            // Date/time utilities
            if (id.includes('date-fns')) {
              return 'vendor-date';
            }
            // Lucide icons - large icon library
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            // Class utilities (small, can group together)
            if (id.includes('clsx') || id.includes('tailwind-merge') || id.includes('class-variance-authority')) {
              return 'vendor-class-utils';
            }
            // Animation libraries
            if (id.includes('framer-motion')) {
              return 'vendor-animation';
            }
            // Form libraries
            if (id.includes('react-hook-form') || id.includes('@hookform')) {
              return 'vendor-forms';
            }
            // Tanstack query (react-query)
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-query';
            }
            // Don't create vendor-other, let Vite handle remaining dependencies
            // This prevents one huge chunk
          }
          
          // Application code splitting - simplified to avoid circular dependencies
          // Zikalyze brain (AI/trading logic) - separate chunk for better caching
          if (id.includes('/lib/zikalyze-brain/')) {
            return 'app-zikalyze-brain';
          }
          
          // Don't manually split components and hooks - let Vite's automatic splitting handle it
          // This prevents circular chunk dependencies between dashboard components, common components, and crypto hooks
        }
      }
    },
    // Enable source maps for debugging in production
    sourcemap: false,
    // Minify for smaller bundle size
    minify: 'esbuild',
    // Target modern browsers for smaller bundles
    target: 'es2020'
  },
  // Optimize dependencies for faster initial load
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    // Exclude large dependencies from pre-bundling to reduce dev server startup time
    exclude: ['@capacitor/core', '@capacitor/android']
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: false, // Manual registration in main.tsx prevents render-blocking
      includeAssets: ["favicon.ico", "favicon.png", "offline.html", "og-image.png"],
      manifest: {
        name: "Zikalyze - AI Crypto Trading Analysis",
        short_name: "Zikalyze",
        description: "Zikalyze AI is a professional-grade cryptocurrency analysis platform designed to transform complex market data into actionable, high-signal insights. Built as a personal trading assistant, it utilizes agentic AI to synthesize technical indicators, on-chain whale activity, and macro catalysts into a scannable, business-grade dashboard.",
        theme_color: "#0a0f1a",
        background_color: "#0a0f1a",
        display: "standalone",
        display_override: ["standalone", "minimal-ui"],
        orientation: "any",
        scope: "./",
        start_url: "./#/",
        id: "zikalyze-pwa",
        lang: "en",
        dir: "ltr",
        categories: ["finance", "cryptocurrency", "trading", "business", "productivity"],
        prefer_related_applications: false,
        icons: [
          {
            src: "./pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "./pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "./pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable"
          },
          {
            src: "./pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ],
        screenshots: [
          {
            src: "./og-image.png",
            sizes: "1200x630",
            type: "image/png",
            form_factor: "wide",
            label: "Zikalyze Dashboard - AI Crypto Analysis"
          },
          {
            src: "./pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            form_factor: "narrow",
            label: "Zikalyze App Icon"
          }
        ],
        shortcuts: [
          {
            name: "Dashboard",
            short_name: "Dashboard",
            description: "View your crypto dashboard",
            url: "./#/dashboard",
            icons: [{ src: "./pwa-192x192.png", sizes: "192x192" }]
          },
          {
            name: "AI Analyzer",
            short_name: "Analyzer",
            description: "Analyze crypto with AI",
            url: "./#/dashboard/analyzer",
            icons: [{ src: "./pwa-192x192.png", sizes: "192x192" }]
          },
          {
            name: "Alerts",
            short_name: "Alerts",
            description: "View price alerts",
            url: "./#/dashboard/alerts",
            icons: [{ src: "./pwa-192x192.png", sizes: "192x192" }]
          }
        ],
        launch_handler: {
          client_mode: "navigate-existing"
        },
        handle_links: "preferred",
        edge_side_panel: {
          preferred_width: 400
        }
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.exchangerate-api\.com\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "exchange-rates-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 // 1 hour
              }
            }
          }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
