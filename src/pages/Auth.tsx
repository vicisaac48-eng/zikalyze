import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { TrendingUp, Key, User, Lock, Eye, EyeOff, Sparkles, Copy, Check, AlertCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useBotProtection } from "@/hooks/useBotProtection";
import { useIsNativeApp } from "@/hooks/useIsNativeApp";
import { AuthLoadingOverlay } from "@/components/AuthLoadingOverlay";
import { toast } from "sonner";

// Helper function to format retry time consistently
const formatRetryTime = (seconds: number): string => {
  if (seconds >= 3600) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
  }
  if (seconds >= 60) {
    const minutes = Math.ceil(seconds / 60);
    return `${minutes}m`;
  }
  return `${seconds}s`;
};

// Demo mode component - for users who want to explore without connecting
const DemoModeAuth = () => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center py-2 sm:py-4">
      <Sparkles className="h-6 w-6 text-primary mx-auto mb-2 sm:h-8 sm:w-8 sm:mb-3" />
      <h2 className="text-sm font-semibold mb-1 sm:text-base sm:mb-2">Just Exploring?</h2>
      <p className="text-xs text-muted-foreground mb-2 sm:text-sm sm:mb-3">
        Try the dashboard without creating an account.
      </p>
      <Button 
        variant="outline"
        onClick={() => navigate("/dashboard")}
        className="w-full"
      >
        Explore Dashboard
      </Button>
    </div>
  );
};

// Sign Up Form
const SignUpForm = () => {
  const navigate = useNavigate();
  const { signUp, isProcessing } = useAuth();
  const isNativeApp = useIsNativeApp();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [honeypot, setHoneypot] = useState(""); // Honeypot field for bot detection
  
  // Bot protection
  const {
    isBlocked,
    retryAfterSeconds,
    isBot,
    checkFormSubmission,
    honeypotProps
  } = useBotProtection({ limiter: 'auth', formProtection: true, checkBot: true });

  // Shared validation function for bot protection and rate limiting
  const validateSubmission = useCallback(() => {
    if (isBot) {
      toast.error("Automated access detected. Please try again later.");
      return false;
    }
    
    const formCheck = checkFormSubmission({ website: honeypot });
    if (!formCheck.valid) {
      toast.error(formCheck.reason || "Invalid submission. Please try again.");
      return false;
    }
    
    if (isBlocked) {
      toast.error(`Too many attempts. Please try again in ${formatRetryTime(retryAfterSeconds)}.`);
      return false;
    }
    
    return true;
  }, [isBot, isBlocked, retryAfterSeconds, checkFormSubmission, honeypot]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSubmission()) return;
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const { error, privateKey, address } = await signUp(username, password);
    
    if (error) {
      toast.error(error.message);
    } else if (privateKey) {
      setGeneratedKey(privateKey);
      toast.success(`Wallet created! Address: ${address?.slice(0, 10)}...`);
    }
  };

  const copyPrivateKey = async () => {
    if (generatedKey) {
      await navigator.clipboard.writeText(generatedKey);
      setCopied(true);
      toast.success("Private key copied! Keep it safe!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const continueToApp = () => {
    navigate("/dashboard");
  };

  if (generatedKey) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-3">
            <Check className="h-6 w-6 text-success" />
          </div>
          <h2 className="text-lg font-semibold mb-2">Wallet Created!</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Save your private key securely. You'll need it to sign in.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30">
          <div className="flex items-start gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-destructive">
              Important: Save this key now!
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            This is your only way to access your account. If you lose it, use your username and password to recover.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Your Private Key</Label>
          <div className="relative">
            <Input
              value={generatedKey}
              readOnly
              className="pr-10 font-mono text-xs"
            />
            <button
              onClick={copyPrivateKey}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-muted/50 text-sm">
          <p className="font-medium mb-1">Recovery tip:</p>
          <p className="text-muted-foreground text-xs">
            You can recover your wallet using the same username and password. Use strong, unique credentials for better security.
          </p>
        </div>

        <Button onClick={continueToApp} className="w-full">
          Continue to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Auth loading overlay - native app only */}
      <AuthLoadingOverlay isVisible={isProcessing && isNativeApp} />
      
      <form onSubmit={handleSignUp} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="signup-username">Username</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="signup-username"
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="pl-10"
            minLength={4}
            required
          />
        </div>
        <p className="text-xs text-muted-foreground">Used for wallet recovery. Min 4 characters.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="signup-password"
            type={showPassword ? "text" : "password"}
            placeholder="Create password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 pr-10"
            minLength={8}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-confirm">Confirm Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="signup-confirm"
            type={showPassword ? "text" : "password"}
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="pl-10"
            minLength={8}
            required
          />
        </div>
      </div>

      {/* Honeypot field - hidden from users but visible to bots */}
      <div {...honeypotProps}>
        <Label htmlFor="signup-website">Website</Label>
        <Input
          id="signup-website"
          type="text"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          autoComplete="off"
          tabIndex={-1}
        />
      </div>

      {/* Rate limit warning */}
      {isBlocked && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm">
          <Shield className="h-4 w-4 text-destructive flex-shrink-0" />
          <p className="text-destructive">
            Too many attempts. Please wait {formatRetryTime(retryAfterSeconds)} before trying again.
          </p>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isProcessing || isBlocked}>
        {isBlocked ? "Access Temporarily Blocked" : isProcessing ? "Creating Wallet..." : "Create Wallet"}
      </Button>
    </form>
    </>
  );
};

// Sign In Form
const SignInForm = () => {
  const navigate = useNavigate();
  const { signInWithKey, recoverWallet, isProcessing, isSignedIn } = useAuth();
  const isNativeApp = useIsNativeApp();
  const [mode, setMode] = useState<"key" | "recover">("key");
  const [privateKey, setPrivateKey] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [honeypot, setHoneypot] = useState(""); // Honeypot field for bot detection

  // Bot protection
  const {
    isBlocked,
    retryAfterSeconds,
    isBot,
    checkFormSubmission,
    honeypotProps
  } = useBotProtection({ limiter: 'auth', formProtection: true, checkBot: true });

  // Shared validation function for bot protection and rate limiting
  const validateSubmission = useCallback(() => {
    if (isBot) {
      toast.error("Automated access detected. Please try again later.");
      return false;
    }
    
    const formCheck = checkFormSubmission({ website: honeypot });
    if (!formCheck.valid) {
      toast.error(formCheck.reason || "Invalid submission. Please try again.");
      return false;
    }
    
    if (isBlocked) {
      toast.error(`Too many attempts. Please try again in ${formatRetryTime(retryAfterSeconds)}.`);
      return false;
    }
    
    return true;
  }, [isBot, isBlocked, retryAfterSeconds, checkFormSubmission, honeypot]);

  useEffect(() => {
    if (isSignedIn) {
      navigate("/dashboard");
    }
  }, [isSignedIn, navigate]);

  const handleSignInWithKey = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSubmission()) return;
    
    const { error } = await signInWithKey(privateKey);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Signed in successfully!");
      navigate("/dashboard");
    }
  };

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSubmission()) return;
    
    const { error } = await recoverWallet(username, password);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Wallet recovered successfully!");
      navigate("/dashboard");
    }
  };

  return (
    <>
      {/* Auth loading overlay - native app only */}
      <AuthLoadingOverlay isVisible={isProcessing && isNativeApp} />
      
      <div className="space-y-3">
      <div className="flex gap-2 p-1 bg-muted rounded-lg">
        <button
          type="button"
          onClick={() => setMode("key")}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            mode === "key" ? "bg-background text-foreground shadow" : "text-muted-foreground"
          }`}
        >
          Private Key
        </button>
        <button
          type="button"
          onClick={() => setMode("recover")}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            mode === "recover" ? "bg-background text-foreground shadow" : "text-muted-foreground"
          }`}
        >
          Recover Wallet
        </button>
      </div>

      {mode === "key" ? (
        <form onSubmit={handleSignInWithKey} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="private-key">Private Key</Label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="private-key"
                type={showKey ? "text" : "password"}
                placeholder="0x..."
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                className="pl-10 pr-10 font-mono text-xs"
                required
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter the private key you received when signing up.
            </p>
          </div>

          {/* Honeypot field - hidden from users but visible to bots */}
          <div {...honeypotProps}>
            <Label htmlFor="signin-website">Website</Label>
            <Input
              id="signin-website"
              type="text"
              name="website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              autoComplete="off"
              tabIndex={-1}
            />
          </div>

          {/* Rate limit warning */}
          {isBlocked && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm">
              <Shield className="h-4 w-4 text-destructive flex-shrink-0" />
              <p className="text-destructive">
                Too many attempts. Please wait {formatRetryTime(retryAfterSeconds)} before trying again.
              </p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isProcessing || isBlocked}>
            {isBlocked ? "Access Temporarily Blocked" : isProcessing ? "Signing In..." : "Sign In"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleRecover} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="recover-username">Username</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="recover-username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recover-password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="recover-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Use the same username and password you used during sign up to recover your wallet.
          </p>

          {/* Honeypot field - hidden from users but visible to bots */}
          <div {...honeypotProps}>
            <Label htmlFor="recover-website">Website</Label>
            <Input
              id="recover-website"
              type="text"
              name="website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              autoComplete="off"
              tabIndex={-1}
            />
          </div>

          {/* Rate limit warning */}
          {isBlocked && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm">
              <Shield className="h-4 w-4 text-destructive flex-shrink-0" />
              <p className="text-destructive">
                Too many attempts. Please wait {formatRetryTime(retryAfterSeconds)} before trying again.
              </p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isProcessing || isBlocked}>
            {isBlocked ? "Access Temporarily Blocked" : isProcessing ? "Recovering..." : "Recover Wallet"}
          </Button>
        </form>
      )}
    </div>
    </>
  );
};

const Auth = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const isNativeApp = useIsNativeApp();

  useEffect(() => {
    if (isSignedIn) {
      navigate("/dashboard");
    }
  }, [isSignedIn, navigate]);

  return (
    <main className="h-[100dvh] overflow-hidden bg-background flex items-center justify-center p-3 sm:p-4 safe-area-inset-top">
      {/* Background effects - reduced on mobile for performance */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-10 left-5 w-48 h-48 bg-primary/10 rounded-full blur-3xl animate-pulse-slow sm:top-20 sm:left-10 sm:w-72 sm:h-72" />
        <div className="absolute bottom-10 right-5 w-56 h-56 bg-accent/10 rounded-full blur-3xl animate-pulse-slow sm:bottom-20 sm:right-10 sm:w-96 sm:h-96" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative z-10 w-full max-w-md h-full flex flex-col justify-center py-4 sm:py-0 sm:h-auto safe-area-inset-bottom">
        {/* Logo - compact on mobile */}
        <div className="flex items-center justify-center gap-2 mb-3 sm:gap-3 sm:mb-6 flex-shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary sm:h-14 sm:w-14">
            <TrendingUp className="h-5 w-5 text-primary-foreground sm:h-7 sm:w-7" />
          </div>
          <span className="text-xl font-bold text-foreground sm:text-3xl">Zikalyze</span>
        </div>

        {/* Auth Card - compact mobile padding, scrollable content */}
        <div className="rounded-xl border border-border bg-card/80 backdrop-blur-xl p-3 shadow-2xl sm:rounded-2xl sm:p-6 flex-1 sm:flex-initial flex flex-col overflow-hidden">
          <Tabs defaultValue="signup" className="w-full flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-2 mb-3 sm:mb-6 flex-shrink-0">
              <TabsTrigger value="signup" className="text-sm sm:text-base">{t("auth.signUp", "Sign Up")}</TabsTrigger>
              <TabsTrigger value="signin" className="text-sm sm:text-base">{t("auth.signIn", "Sign In")}</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
              <TabsContent value="signup" className="mt-0">
                <SignUpForm />
              </TabsContent>

              <TabsContent value="signin" className="mt-0">
                <SignInForm />
              </TabsContent>
            </div>
          </Tabs>

          <div className="relative my-3 sm:my-6 flex-shrink-0">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <div className="flex-shrink-0">
            <DemoModeAuth />
          </div>

          <p className="mt-3 text-center text-xs text-muted-foreground sm:mt-6 flex-shrink-0">
            {t("auth.termsAgreement")}
          </p>
        </div>
      </div>
    </main>
  );
};

export default Auth;
