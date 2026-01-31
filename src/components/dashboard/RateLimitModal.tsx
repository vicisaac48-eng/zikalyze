// ═══════════════════════════════════════════════════════════════════════════════
// 🔒 Rate Limit Modal Component
// ═══════════════════════════════════════════════════════════════════════════════
// Displays when guest users hit their analysis limit.
// Prompts users to sign in or create an account.
// ═══════════════════════════════════════════════════════════════════════════════

import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Lock, LogIn, UserPlus, Sparkles, TrendingUp, Brain, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface RateLimitModalProps {
  open: boolean;
  onClose: () => void;
  analysisCount: number;
  maxAnalyses: number;
}

/**
 * Modal displayed when guest users reach their analysis limit.
 * Encourages sign-up with benefits messaging.
 */
export function RateLimitModal({
  open,
  onClose,
  analysisCount,
  maxAnalyses,
}: RateLimitModalProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSignIn = () => {
    onClose();
    navigate("/auth");
  };

  const handleSignUp = () => {
    onClose();
    navigate("/auth");
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-xl font-bold">
            {t("rateLimit.title", "Analysis Limit Reached")}
          </DialogTitle>
          <DialogDescription className="text-base">
            {t(
              "rateLimit.description",
              "You've used all {{maxAnalyses}} free AI analyses. Sign up to unlock unlimited analyses!"
            ).replace("{{maxAnalyses}}", String(maxAnalyses))}
          </DialogDescription>
        </DialogHeader>

        {/* Benefits List */}
        <div className="my-4 space-y-3 rounded-lg bg-muted/50 p-4">
          <h4 className="font-semibold text-sm text-foreground mb-3">
            {t("rateLimit.benefits.title", "Create an account to unlock:")}
          </h4>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li className="flex items-center gap-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/10">
                <Brain className="h-3.5 w-3.5 text-green-500" />
              </div>
              <span>{t("rateLimit.benefits.unlimited", "Unlimited AI analyses")}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/10">
                <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
              </div>
              <span>{t("rateLimit.benefits.history", "Save analysis history")}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/10">
                <Zap className="h-3.5 w-3.5 text-purple-500" />
              </div>
              <span>{t("rateLimit.benefits.realtime", "Real-time alerts & notifications")}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/10">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              </div>
              <span>{t("rateLimit.benefits.learning", "Personalized AI learning")}</span>
            </li>
          </ul>
        </div>

        {/* Usage Counter */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground border-t pt-3">
          <span className="font-medium text-red-500">{analysisCount}/{maxAnalyses}</span>
          <span>{t("rateLimit.usageCount", "analyses used")}</span>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            onClick={handleSignUp}
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            size="lg"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            {t("rateLimit.signUp", "Create Free Account")}
          </Button>
          <Button
            onClick={handleSignIn}
            variant="outline"
            className="w-full"
          >
            <LogIn className="mr-2 h-4 w-4" />
            {t("rateLimit.signIn", "Already have an account? Sign In")}
          </Button>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
          >
            {t("rateLimit.maybeLater", "Maybe later")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
