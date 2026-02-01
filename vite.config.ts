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
    // Increase chunk size limit to reduce warnings
    chunkSizeWarningLimit: 600,
    // Optimize chunking for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - split large dependencies
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs', '@radix-ui/react-tooltip'],
          'vendor-charts': ['recharts'],
          'vendor-utils': ['date-fns', 'clsx', 'tailwind-merge'],
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
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
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
            src: "./favicon.png",
            sizes: "180x180",
            type: "image/png",
            purpose: "any"
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
