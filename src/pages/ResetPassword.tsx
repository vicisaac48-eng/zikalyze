import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { TrendingUp, Lock, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { verifyResetToken, session } = useAuth();
  
  const passwordSchema = z.string().min(6, t("validation.passwordMinLength"));
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});

  // Extract token and email from URL query params
  const { token, email } = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    return {
      token: searchParams.get('token'),
      email: searchParams.get('email')
    };
  }, [location.search]);

  // Check if we have valid reset params or a recovery session
  useEffect(() => {
    const hasResetParams = token && email;
    const hasRecoverySession = session?.user;

    if (!hasResetParams && !hasRecoverySession) {
      // Give it a moment to load
      const timeout = setTimeout(() => {
        if (!token && !email && !session) {
          toast({
            title: t("auth.invalidLink"),
            description: t("auth.requestNewLink"),
            variant: "destructive",
          });
          navigate("/auth");
        }
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [token, email, session, navigate, toast, t]);

  const validateForm = (): boolean => {
    const newErrors: { password?: string; confirmPassword?: string } = {};
    
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = t("validation.passwordsNoMatch");
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);

    // Use new token-based flow if we have token and email
    if (token && email) {
      const { error } = await verifyResetToken(token, email, password);
      setIsLoading(false);

      if (error) {
        toast({
          title: t("settings.passwordUpdateFailed"),
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setIsSuccess(true);
      toast({
        title: t("auth.passwordUpdated"),
        description: t("auth.passwordResetSuccess"),
      });
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate("/auth");
      }, 2000);
      return;
    }

    // Fallback to old Supabase session-based flow
    const { updatePassword } = await import("@/hooks/useAuth").then(m => {
      // This won't work without a session, but keep as fallback
      return { updatePassword: async () => ({ error: new Error("No valid reset session") }) };
    });

    setIsLoading(false);
    toast({
      title: t("auth.invalidLink"),
      description: t("auth.requestNewLink"),
      variant: "destructive",
    });
    navigate("/auth");
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "2s" }} />
        </div>

        <div className="relative z-10 w-full max-w-md">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary glow-cyan">
              <TrendingUp className="h-7 w-7 text-primary-foreground" />
            </div>
            <span className="text-3xl font-bold text-foreground">Zikalyze</span>
          </div>

          <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-xl p-8 shadow-2xl text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">{t("auth.passwordUpdated")}</h2>
            <p className="text-muted-foreground mb-6">
              {t("auth.passwordResetSuccess")}
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecting to login...
            </p>
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
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary glow-cyan">
            <TrendingUp className="h-7 w-7 text-primary-foreground" />
          </div>
          <span className="text-3xl font-bold text-foreground">Zikalyze</span>
        </div>

        {/* Reset Card */}
        <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-center mb-2">{t("auth.resetPassword")}</h2>
          <p className="text-muted-foreground text-center mb-6">
            {t("auth.enterNewPasswordBelow")}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.newPassword")}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder={t("auth.enterNewPassword")}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  className="pl-10"
                />
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("auth.confirmPassword")}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder={t("auth.confirmNewPassword")}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  }}
                  className="pl-10"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 glow-cyan"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {t("auth.updatePassword")} <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
