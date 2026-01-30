import { useEffect, useState, Component, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { TrendingUp, AlertCircle, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

// Check if Clerk is configured
const isClerkConfigured = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Error boundary for Clerk components
interface ErrorBoundaryState {
  hasError: boolean;
}

class ClerkErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[Auth] Clerk error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Demo mode component - used when Clerk is not configured or fails
const DemoModeAuth = () => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center py-8">
      <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">Welcome to Zikalyze</h3>
      <p className="text-muted-foreground mb-4">
        Experience the smartest trading companion with real-time analysis.
      </p>
      <Button 
        onClick={() => navigate("/dashboard")}
        className="bg-primary hover:bg-primary/90"
      >
        Explore Dashboard
      </Button>
      <p className="text-xs text-muted-foreground mt-4">
        No sign-up required for demo mode
      </p>
    </div>
  );
};

// Fallback component when Clerk has issues
const ClerkNotConfigured = () => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center py-8">
      <AlertCircle className="h-12 w-12 text-warning mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">Authentication Not Configured</h3>
      <p className="text-muted-foreground mb-4">
        Set VITE_CLERK_PUBLISHABLE_KEY in your environment to enable authentication.
      </p>
      <Button variant="outline" onClick={() => navigate("/dashboard")}>
        Continue to Dashboard (Demo Mode)
      </Button>
    </div>
  );
};

// Lazy loaded Clerk components with error handling
const AuthWithClerk = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [ClerkComponents, setClerkComponents] = useState<{
    SignIn: React.ComponentType<Record<string, unknown>>;
    SignUp: React.ComponentType<Record<string, unknown>>;
    useUser: () => { user: unknown; isLoaded: boolean };
  } | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Dynamically import Clerk components
  useEffect(() => {
    let mounted = true;
    
    const loadClerk = async () => {
      try {
        const clerk = await import("@clerk/clerk-react");
        if (mounted) {
          setClerkComponents({
            SignIn: clerk.SignIn as React.ComponentType<Record<string, unknown>>,
            SignUp: clerk.SignUp as React.ComponentType<Record<string, unknown>>,
            useUser: clerk.useUser,
          });
          setLoading(false);
        }
      } catch (err) {
        console.error("[Auth] Failed to load Clerk:", err);
        if (mounted) {
          setLoadError(true);
          setLoading(false);
        }
      }
    };

    // Timeout for loading
    const timeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn("[Auth] Clerk load timeout");
        setLoadError(true);
        setLoading(false);
      }
    }, 8000);

    loadClerk();

    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, [loading]);

  // Check if user is already logged in via Clerk global
  useEffect(() => {
    const checkUser = () => {
      try {
        const clerkInstance = (window as unknown as { Clerk?: { user?: unknown } }).Clerk;
        if (clerkInstance?.user) {
          navigate("/dashboard");
        }
      } catch {
        // Ignore
      }
    };
    
    checkUser();
    const interval = setInterval(checkUser, 1000);
    return () => clearInterval(interval);
  }, [navigate]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading authentication...</p>
      </div>
    );
  }

  if (loadError || !ClerkComponents) {
    return <DemoModeAuth />;
  }

  const { SignIn, SignUp } = ClerkComponents;

  const clerkAppearance = {
    elements: {
      rootBox: "w-full",
      card: "bg-transparent shadow-none p-0",
      headerTitle: "hidden",
      headerSubtitle: "hidden",
      socialButtonsBlockButton: "bg-secondary border-border text-foreground hover:bg-secondary/80",
      formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
      formFieldInput: "bg-secondary border-border text-foreground",
      formFieldLabel: "text-foreground",
      footerActionLink: "text-primary hover:text-primary/80",
      identityPreviewText: "text-foreground",
      identityPreviewEditButton: "text-primary",
      formFieldInputShowPasswordButton: "text-muted-foreground",
      footer: "hidden",
    }
  };

  return (
    <ClerkErrorBoundary fallback={<DemoModeAuth />}>
      <Tabs defaultValue="signin" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="signin">{t("auth.signIn")}</TabsTrigger>
          <TabsTrigger value="signup">{t("auth.signUp")}</TabsTrigger>
        </TabsList>

        <TabsContent value="signin">
          <div className="flex justify-center">
            <SignIn 
              routing="hash"
              forceRedirectUrl="/dashboard"
              appearance={clerkAppearance}
            />
          </div>
        </TabsContent>

        <TabsContent value="signup">
          <div className="flex justify-center">
            <SignUp 
              routing="hash"
              forceRedirectUrl="/dashboard"
              appearance={clerkAppearance}
            />
          </div>
        </TabsContent>
      </Tabs>
    </ClerkErrorBoundary>
  );
};

const Auth = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
            <TrendingUp className="h-7 w-7 text-primary-foreground" />
          </div>
          <span className="text-3xl font-bold text-foreground">Zikalyze</span>
        </div>

        {/* Auth Card */}
        <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-xl p-8 shadow-2xl">
          {isClerkConfigured ? <AuthWithClerk /> : <ClerkNotConfigured />}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t("auth.termsAgreement")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
