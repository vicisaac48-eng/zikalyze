import { usePasswordStrength } from "@/hooks/usePasswordStrength";
import { Check, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordStrengthMeterProps {
  password: string;
  showFeedback?: boolean;
}

const levelLabels = {
  "very-weak": "Very Weak",
  "weak": "Weak",
  "fair": "Fair",
  "strong": "Strong",
  "very-strong": "Very Strong"
};

export const PasswordStrengthMeter = ({ password, showFeedback = true }: PasswordStrengthMeterProps) => {
  const strength = usePasswordStrength(password);

  if (!password) return null;

  return (
    <div className="space-y-2 mt-2">
      {/* Strength bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden flex gap-0.5">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={cn(
                "flex-1 h-full rounded-full transition-colors duration-300",
                index < Math.ceil(strength.score) ? strength.color : "bg-muted"
              )}
            />
          ))}
        </div>
        <span className={cn(
          "text-xs font-medium min-w-[70px] text-right",
          strength.level === "very-weak" && "text-destructive",
          strength.level === "weak" && "text-warning",
          strength.level === "fair" && "text-warning",
          strength.level === "strong" && "text-primary",
          strength.level === "very-strong" && "text-primary"
        )}>
          {levelLabels[strength.level]}
        </span>
      </div>

      {/* Feedback list */}
      {showFeedback && strength.feedback.length > 0 && (
        <ul className="space-y-1">
          {strength.feedback.map((item, index) => (
            <li key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
              <AlertTriangle className="h-3 w-3 text-warning shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      )}

      {/* Requirements checklist */}
      {showFeedback && (
        <div className="grid grid-cols-2 gap-1 pt-1">
          <RequirementItem met={password.length >= 12} text="12+ characters" />
          <RequirementItem met={/[A-Z]/.test(password)} text="Uppercase" />
          <RequirementItem met={/[a-z]/.test(password)} text="Lowercase" />
          <RequirementItem met={/\d/.test(password)} text="Number" />
          <RequirementItem met={/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password)} text="Special char" />
          <RequirementItem met={strength.isValid} text="Not common" />
        </div>
      )}
    </div>
  );
};

const RequirementItem = ({ met, text }: { met: boolean; text: string }) => (
  <div className="flex items-center gap-1.5 text-xs">
    {met ? (
      <Check className="h-3 w-3 text-primary shrink-0" />
    ) : (
      <X className="h-3 w-3 text-muted-foreground shrink-0" />
    )}
    <span className={cn(met ? "text-foreground" : "text-muted-foreground")}>{text}</span>
  </div>
);
