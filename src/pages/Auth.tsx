import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SignIn, SignUp, useUser } from "@clerk/clerk-react";
import { TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Auth = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, isLoaded } = useUser();

  // Redirect if already logged in
  useEffect(() => {
    if (isLoaded && user) {
      navigate("/dashboard");
    }
  }, [user, isLoaded, navigate]);

  // Redirect immediately if already logged in (no blocking loading state)
  if (user) {
    return null;
  }

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
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">{t("auth.signIn")}</TabsTrigger>
              <TabsTrigger value="signup">{t("auth.signUp")}</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <div className="flex justify-center">
                <SignIn 
                  routing="hash"
                  signUpUrl="/auth#signup"
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
                    }
                  }}
                />
              </div>
            </TabsContent>

            <TabsContent value="signup">
              <div className="flex justify-center">
                <SignUp 
                  routing="hash"
                  signInUrl="/auth#signin"
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
                    }
                  }}
                />
              </div>
            </TabsContent>
          </Tabs>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t("auth.termsAgreement")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
