import { lazy, Suspense } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TrendingUp } from "lucide-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { CurrencyProvider } from "@/hooks/useCurrency";
import { PriceDataProvider } from "@/contexts/PriceDataContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { PWAInstallBanner } from "./components/PWAInstallBanner";
import { ZikalyzeWatermark } from "./components/ZikalyzeWatermark";
import { RouteManager } from "./components/RouteManager";
import { useSessionTracking } from "./hooks/useSessionTracking";
import ErrorBoundary from "./components/ErrorBoundary";
import { useIsNativeApp } from "./hooks/useIsNativeApp";


// Session tracking wrapper component - non-critical feature
function SessionTracker({ children }: { children: React.ReactNode }) {
  useSessionTracking();
  return <>{children}</>;
}
// Lazy load page components for code splitting
const Landing = lazy(() => import("./pages/Landing"));
const Auth = lazy(() => import("./pages/Auth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Analyzer = lazy(() => import("./pages/Analyzer"));
const Settings = lazy(() => import("./pages/Settings"));
const Alerts = lazy(() => import("./pages/Alerts"));
const Install = lazy(() => import("./pages/Install"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Optimize React Query for better performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Keep data fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Cache data for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests
      retry: 1,
      // Refetch on window focus for fresh data
      refetchOnWindowFocus: true,
    },
  },
});

// Minimal loading fallback - adapts to platform for professional experience
// Native apps: No logo flash during navigation (instant)
// Web/desktop: Show loading indicator during lazy route loading
const PageLoader = () => {
  const isNativeApp = useIsNativeApp();
  
  // Native mobile apps: Return null to prevent logo flash during navigation
  // This creates instant navigation experience for mobile users
  if (isNativeApp) {
    return null;
  }
  
  // Web/desktop: Show traditional loading indicator
  return (
    <div 
      className="fixed inset-0 flex items-center justify-center"
      style={{ backgroundColor: '#0a0f1a' }}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary sm:h-16 sm:w-16 lg:h-20 lg:w-20">
        <TrendingUp className="h-6 w-6 text-primary-foreground sm:h-8 sm:w-8 lg:h-10 lg:w-10" />
      </div>
    </div>
  );
};

// App-level error fallback
const AppErrorFallback = () => (
  <div 
    className="fixed inset-0 flex flex-col items-center justify-center gap-4"
    style={{ backgroundColor: '#0a0f1a' }}
  >
    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary opacity-80">
      <TrendingUp className="h-8 w-8 text-primary-foreground" />
    </div>
    <h1 className="text-xl font-bold text-white">Something went wrong</h1>
    <p className="text-gray-400 text-sm text-center max-w-md px-4">
      The application encountered an unexpected error. Please refresh the page to continue.
    </p>
    <button
      onClick={() => window.location.reload()}
      className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
    >
      Refresh Page
    </button>
  </div>
);

const App = () => (
  <ErrorBoundary fallback={<AppErrorFallback />}>
    <ThemeProvider attribute="class" defaultTheme="dark">
      <QueryClientProvider client={queryClient}>
        <CurrencyProvider>
          <PriceDataProvider>
            <TooltipProvider>
              <Sonner />
              <PWAInstallBanner />
              <ZikalyzeWatermark />
              <HashRouter>
                <RouteManager>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/" element={<Landing />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/login" element={<Auth />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
                      <Route path="/dashboard" element={<ProtectedRoute><SessionTracker><ErrorBoundary componentName="Dashboard"><Dashboard /></ErrorBoundary></SessionTracker></ProtectedRoute>} />
                      <Route path="/dashboard/portfolio" element={<ProtectedRoute><SessionTracker><ErrorBoundary componentName="Portfolio"><Portfolio /></ErrorBoundary></SessionTracker></ProtectedRoute>} />
                      <Route path="/dashboard/analytics" element={<ProtectedRoute><SessionTracker><ErrorBoundary componentName="Analytics"><Analytics /></ErrorBoundary></SessionTracker></ProtectedRoute>} />
                      <Route path="/dashboard/analyzer" element={<ProtectedRoute><SessionTracker><ErrorBoundary componentName="Analyzer"><Analyzer /></ErrorBoundary></SessionTracker></ProtectedRoute>} />
                      <Route path="/dashboard/alerts" element={<ProtectedRoute><SessionTracker><ErrorBoundary componentName="Alerts"><Alerts /></ErrorBoundary></SessionTracker></ProtectedRoute>} />
                      <Route path="/dashboard/settings" element={<ProtectedRoute><SessionTracker><ErrorBoundary componentName="Settings"><Settings /></ErrorBoundary></SessionTracker></ProtectedRoute>} />
                      <Route path="/install" element={<Install />} />
                      <Route path="/privacy" element={<PrivacyPolicy />} />
                      <Route path="/terms" element={<TermsOfService />} />
                      <Route path="/contact" element={<Contact />} />
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </RouteManager>
              </HashRouter>
            </TooltipProvider>
          </PriceDataProvider>
        </CurrencyProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
