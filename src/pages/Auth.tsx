import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { TrendingUp, Key, User, Lock, Loader2, Copy, CheckCircle2, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { formatPrivateKey } from "@/lib/crypto";

/**
 * Auth page with Web3-style authentication
 * 
 * Features:
 * - Sign up: Enter username and password to generate a unique private key
 * - Sign in: Use private key to login
 * - Key recovery: Recover private key using username and password
 */
const Auth = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { signUp, signInWithPrivateKey, signInWithPassword, recoverPrivateKey, isSignedIn, loading: authLoading } = useAuth();

  // Form state
  const [activeTab, setActiveTab] = useState<"signup" | "login" | "recover">("signup");
  const [isLoading, setIsLoading] = useState(false);
  
  // Sign up form
  const [signupUsername, setSignupUsername] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  
  // Generated private key (shown after signup)
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [keyCopied, setKeyCopied] = useState(false);
  
  // Login form
  const [loginPrivateKey, setLoginPrivateKey] = useState("");
  const [showLoginKey, setShowLoginKey] = useState(false);
  
  // Alternative login with password
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPasswordLogin, setShowPasswordLogin] = useState(false);
  
  // Recovery form
  const [recoverUsername, setRecoverUsername] = useState("");
  const [recoverPassword, setRecoverPassword] = useState("");
  const [recoveredKey, setRecoveredKey] = useState<string | null>(null);
  const [showRecoverPassword, setShowRecoverPassword] = useState(false);
  const [recoveredKeyCopied, setRecoveredKeyCopied] = useState(false);

  // Redirect if already signed in
  useEffect(() => {
    if (!authLoading && isSignedIn) {
      navigate("/dashboard");
    }
  }, [isSignedIn, authLoading, navigate]);

  // Handle sign up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    const result = await signUp(signupUsername, signupPassword);
    
    setIsLoading(false);
    
    if (result.error) {
      toast({
        title: "Sign up failed",
        description: result.error.message,
        variant: "destructive",
      });
      return;
    }
    
    // Show the generated private key
    if (result.privateKey) {
      setGeneratedKey(result.privateKey);
      toast({
        title: "Account created!",
        description: "Save your private key securely. You'll need it to login.",
      });
    }
  };

  // Handle login with private key
  const handleLoginWithKey = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    
    const result = await signInWithPrivateKey(loginPrivateKey);
    
    setIsLoading(false);
    
    if (result.error) {
      toast({
        title: "Login failed",
        description: result.error.message,
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Welcome back!",
      description: "You've been successfully signed in.",
    });
    
    navigate("/dashboard");
  };

  // Handle login with password
  const handleLoginWithPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    
    const result = await signInWithPassword(loginUsername, loginPassword);
    
    setIsLoading(false);
    
    if (result.error) {
      toast({
        title: "Login failed",
        description: result.error.message,
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Welcome back!",
      description: "You've been successfully signed in.",
    });
    
    navigate("/dashboard");
  };

  // Handle key recovery
  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    
    const result = await recoverPrivateKey(recoverUsername, recoverPassword);
    
    setIsLoading(false);
    
    if (result.error) {
      toast({
        title: "Recovery failed",
        description: result.error.message,
        variant: "destructive",
      });
      return;
    }
    
    if (result.privateKey) {
      setRecoveredKey(result.privateKey);
      toast({
        title: "Key recovered!",
        description: "Your private key has been retrieved.",
      });
    }
  };

  // Copy key to clipboard
  const copyKey = async (key: string, setCopied: (v: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(formatPrivateKey(key));
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Private key copied to clipboard",
      });
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast({
        title: "Copy failed",
        description: "Please select and copy the key manually, or check your browser permissions.",
        variant: "destructive",
      });
    }
  };

  // Proceed to login after saving key
  const proceedToLogin = () => {
    setLoginPrivateKey(generatedKey || "");
    setGeneratedKey(null);
    setActiveTab("login");
  };

  // Show key display after signup
  if (generatedKey) {
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

          {/* Key Display Card */}
          <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-xl p-8 shadow-2xl">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-center mb-2">Account Created!</h2>
            <p className="text-muted-foreground text-center mb-6">
              Save your private key securely. You'll need it to login.
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Your Private Key</Label>
                <div className="relative">
                  <div className="p-4 rounded-lg bg-secondary/50 border border-border font-mono text-sm break-all">
                    {formatPrivateKey(generatedKey)}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyKey(generatedKey, setKeyCopied)}
                  >
                    {keyCopied ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-warning">
                  ⚠️ Store this key securely! You can also recover it using your username and password from the "Recover" tab.
                </p>
              </div>

              <Button 
                className="w-full bg-primary hover:bg-primary/90"
                onClick={proceedToLogin}
              >
                I've Saved My Key - Continue to Login <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
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
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "signup" | "login" | "recover")} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="signup">{t("auth.signUp")}</TabsTrigger>
              <TabsTrigger value="login">{t("auth.signIn")}</TabsTrigger>
              <TabsTrigger value="recover">Recover</TabsTrigger>
            </TabsList>

            {/* Sign Up Tab */}
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-username">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-username"
                      type="text"
                      placeholder="Enter your username"
                      value={signupUsername}
                      onChange={(e) => setSignupUsername(e.target.value)}
                      className="pl-10"
                      required
                      minLength={3}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type={showSignupPassword ? "text" : "password"}
                      placeholder="Create a password (min 8 characters)"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                    >
                      {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type={showSignupPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>Generate Private Key</>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  A unique private key will be generated from your username. Save it securely!
                </p>
              </form>
            </TabsContent>

            {/* Login Tab */}
            <TabsContent value="login">
              {!showPasswordLogin ? (
                <form onSubmit={handleLoginWithKey} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-key">Private Key</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-key"
                        type={showLoginKey ? "text" : "password"}
                        placeholder="Enter your private key"
                        value={loginPrivateKey}
                        onChange={(e) => setLoginPrivateKey(e.target.value)}
                        className="pl-10 pr-10 font-mono"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowLoginKey(!showLoginKey)}
                      >
                        {showLoginKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>Sign In with Private Key</>
                    )}
                  </Button>

                  <button
                    type="button"
                    className="w-full text-sm text-muted-foreground hover:text-primary"
                    onClick={() => setShowPasswordLogin(true)}
                  >
                    Or sign in with username & password
                  </button>
                </form>
              ) : (
                <form onSubmit={handleLoginWithPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-username">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-username"
                        type="text"
                        placeholder="Enter your username"
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>Sign In</>
                    )}
                  </Button>

                  <button
                    type="button"
                    className="w-full text-sm text-muted-foreground hover:text-primary"
                    onClick={() => setShowPasswordLogin(false)}
                  >
                    Or sign in with private key
                  </button>
                </form>
              )}
            </TabsContent>

            {/* Recovery Tab */}
            <TabsContent value="recover">
              {!recoveredKey ? (
                <form onSubmit={handleRecover} className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Forgot your private key? Enter your username and password to recover it.
                  </p>

                  <div className="space-y-2">
                    <Label htmlFor="recover-username">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="recover-username"
                        type="text"
                        placeholder="Enter your username"
                        value={recoverUsername}
                        onChange={(e) => setRecoverUsername(e.target.value)}
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
                        type={showRecoverPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={recoverPassword}
                        onChange={(e) => setRecoverPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowRecoverPassword(!showRecoverPassword)}
                      >
                        {showRecoverPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>Recover Private Key</>
                    )}
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-center mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/20">
                      <CheckCircle2 className="h-6 w-6 text-success" />
                    </div>
                  </div>
                  
                  <p className="text-center text-muted-foreground mb-4">
                    Your private key has been recovered:
                  </p>

                  <div className="relative">
                    <div className="p-4 rounded-lg bg-secondary/50 border border-border font-mono text-sm break-all">
                      {formatPrivateKey(recoveredKey)}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyKey(recoveredKey, setRecoveredKeyCopied)}
                    >
                      {recoveredKeyCopied ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  <Button 
                    className="w-full"
                    onClick={() => {
                      setLoginPrivateKey(recoveredKey);
                      setRecoveredKey(null);
                      setActiveTab("login");
                    }}
                  >
                    Use This Key to Login
                  </Button>
                </div>
              )}
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
