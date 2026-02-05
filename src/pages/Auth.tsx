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
    <div className="text-center py-3">
      <Sparkles className="h-6 w-6 text-primary mx-auto mb-2" />
      <h3 className="text-sm font-semibold mb-1.5">Just Exploring?</h3>
      <p className="text-xs text-muted-foreground mb-2.5">
        Try the dashboard without creating an account.
      </p>
      <Button 
        variant="outline"
        onClick={() => navigate("/dashboard")}
        className="w-full h-9 text-sm"
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
      <div className="space-y-3">
        <div className="text-center">
          <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-2">
            <Check className="h-5 w-5 text-success" />
          </div>
          <h3 className="text-base font-semibold mb-1.5">Wallet Created!</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Save your private key securely. You'll need it to sign in.
          </p>
        </div>

        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
          <div className="flex items-start gap-1.5 mb-1.5">
            <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-destructive">
              Important: Save this key now!
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            This is your only way to access your account. If you lose it, use your username and password to recover.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Your Private Key</Label>
          <div className="relative">
            <Input
              value={generatedKey}
              readOnly
              className="pr-9 font-mono text-xs h-9"
            />
            <button
              onClick={copyPrivateKey}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        <div className="p-2.5 rounded-md bg-muted/50 text-xs">
          <p className="font-medium mb-0.5">Recovery tip:</p>
          <p className="text-muted-foreground text-xs">
            You can recover your wallet using the same username and password. Use strong, unique credentials for better security.
          </p>
        </div>

        <Button onClick={continueToApp} className="w-full h-9 text-sm">
          Continue to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSignUp} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="signup-username" className="text-xs">Username</Label>
        <div className="relative">
          <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            id="signup-username"
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="pl-9 h-9 text-sm"
            minLength={4}
            required
          />
        </div>
        <p className="text-xs text-muted-foreground">Recovery requires min 4 chars.</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="signup-password" className="text-xs">Password</Label>
        <div className="relative">
          <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            id="signup-password"
            type={showPassword ? "text" : "password"}
            placeholder="Create password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-9 pr-9 h-9 text-sm"
            minLength={8}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="signup-confirm" className="text-xs">Confirm Password</Label>
        <div className="relative">
          <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            id="signup-confirm"
            type={showPassword ? "text" : "password"}
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="pl-9 h-9 text-sm"
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
        <div className="flex items-center gap-2 p-2 rounded-md bg-destructive/10 border border-destructive/30 text-xs">
          <Shield className="h-3.5 w-3.5 text-destructive flex-shrink-0" />
          <p className="text-destructive">
            Too many attempts. Wait {formatRetryTime(retryAfterSeconds)}.
          </p>
        </div>
      )}

      <Button type="submit" className="w-full h-9 text-sm" disabled={isProcessing || isBlocked}>
        {isBlocked ? "Blocked" : isProcessing ? "Creating..." : "Create Wallet"}
      </Button>
    </form>
  );
};

// Sign In Form
const SignInForm = () => {
  const navigate = useNavigate();
  const { signInWithKey, recoverWallet, isProcessing, isSignedIn } = useAuth();
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
    <div className="space-y-3">
      <div className="flex gap-1.5 p-0.5 bg-muted rounded-md">
        <button
          type="button"
          onClick={() => setMode("key")}
          className={`flex-1 py-1.5 px-2.5 rounded text-xs font-medium transition-colors ${
            mode === "key" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
          }`}
        >
          Private Key
        </button>
        <button
          type="button"
          onClick={() => setMode("recover")}
          className={`flex-1 py-1.5 px-2.5 rounded text-xs font-medium transition-colors ${
            mode === "recover" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
          }`}
        >
          Recover Wallet
        </button>
      </div>

      {mode === "key" ? (
        <form onSubmit={handleSignInWithKey} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="private-key" className="text-xs">Private Key</Label>
            <div className="relative">
              <Key className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                id="private-key"
                type={showKey ? "text" : "password"}
                placeholder="0x..."
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                className="pl-9 pr-9 font-mono text-xs h-9"
                required
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
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
            <div className="flex items-center gap-2 p-2 rounded-md bg-destructive/10 border border-destructive/30 text-xs">
              <Shield className="h-3.5 w-3.5 text-destructive flex-shrink-0" />
              <p className="text-destructive">
                Too many attempts. Wait {formatRetryTime(retryAfterSeconds)}.
              </p>
            </div>
          )}

          <Button type="submit" className="w-full h-9 text-sm" disabled={isProcessing || isBlocked}>
            {isBlocked ? "Blocked" : isProcessing ? "Signing In..." : "Sign In"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleRecover} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="recover-username" className="text-xs">Username</Label>
            <div className="relative">
              <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                id="recover-username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-9 h-9 text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="recover-password" className="text-xs">Password</Label>
            <div className="relative">
              <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                id="recover-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 pr-9 h-9 text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
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
            <div className="flex items-center gap-2 p-2 rounded-md bg-destructive/10 border border-destructive/30 text-xs">
              <Shield className="h-3.5 w-3.5 text-destructive flex-shrink-0" />
              <p className="text-destructive">
                Too many attempts. Wait {formatRetryTime(retryAfterSeconds)}.
              </p>
            </div>
          )}

          <Button type="submit" className="w-full h-9 text-sm" disabled={isProcessing || isBlocked}>
            {isBlocked ? "Blocked" : isProcessing ? "Recovering..." : "Recover Wallet"}
          </Button>
        </form>
      )}
    </div>
  );
};

const Auth = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (isSignedIn) {
      navigate("/dashboard");
    }
  }, [isSignedIn, navigate]);

  return (
    <div className="h-screen overflow-hidden bg-background flex items-center justify-center">
      {/* Stabilized background layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-[8%] left-[5%] w-36 h-36 bg-primary/20 rounded-full blur-2xl sm:w-48 sm:h-48" />
        <div className="absolute bottom-[8%] right-[5%] w-40 h-40 bg-accent/20 rounded-full blur-2xl sm:w-56 sm:h-56" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4 py-3 sm:px-6 sm:py-4 max-h-screen overflow-y-auto custom-scrollbar">
        {/* Branding section - compact */}
        <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary sm:h-12 sm:w-12">
            <TrendingUp className="h-5 w-5 text-primary-foreground sm:h-6 sm:w-6" />
          </div>
          <span className="text-xl font-bold text-foreground sm:text-2xl">Zikalyze</span>
        </div>

        {/* Compact auth container */}
        <div className="rounded-lg border border-border bg-card/90 backdrop-blur-lg p-3.5 shadow-xl sm:rounded-xl sm:p-5">
          <Tabs defaultValue="signup" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-3 sm:mb-4">
              <TabsTrigger value="signup" className="text-xs sm:text-sm">{t("auth.signUp", "Sign Up")}</TabsTrigger>
              <TabsTrigger value="signin" className="text-xs sm:text-sm">{t("auth.signIn", "Sign In")}</TabsTrigger>
            </TabsList>

            <TabsContent value="signup">
              <SignUpForm />
            </TabsContent>

            <TabsContent value="signin">
              <SignInForm />
            </TabsContent>
          </Tabs>

          <div className="relative my-3 sm:my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <DemoModeAuth />

          <p className="mt-3 text-center text-xs text-muted-foreground sm:mt-4">
            {t("auth.termsAgreement")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
