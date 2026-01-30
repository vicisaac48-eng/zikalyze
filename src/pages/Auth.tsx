import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { TrendingUp, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

// Check if Clerk is configured
const isClerkConfigured = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Fallback component when Clerk is not configured
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

// Auth component with Clerk - only loaded when Clerk is configured
const AuthWithClerk = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // Dynamic import of Clerk hooks to avoid import errors when not configured
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { SignIn, SignUp, useUser } = require("@clerk/clerk-react");
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { user, isLoaded } = useUser();

  // Redirect if already logged in
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (isLoaded && user) {
      navigate("/dashboard");
    }
  }, [user, isLoaded, navigate]);

  // Redirect immediately if already logged in
  if (user) {
    return null;
  }

  return (
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
            appearance={{
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
            }}
          />
        </div>
      </TabsContent>

      <TabsContent value="signup">
        <div className="flex justify-center">
          <SignUp 
            routing="hash"
            forceRedirectUrl="/dashboard"
            appearance={{
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
            }}
          />
        </div>
      </TabsContent>
    </Tabs>
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
