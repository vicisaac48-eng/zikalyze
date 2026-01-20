import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Cookie, Shield, BarChart3, Target } from "lucide-react";

const COOKIE_CONSENT_KEY = "zikalyze_cookie_consent";

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export function CookieConsent() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setOpen(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(allAccepted));
    setOpen(false);
  };

  const handleAcceptSelected = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(preferences));
    setOpen(false);
  };

  const handleRejectAll = () => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(onlyNecessary));
    setOpen(false);
  };

  const cookieTypes = [
    {
      id: "necessary",
      icon: Shield,
      title: "Essential Cookies",
      description: "Required for the website to function. Cannot be disabled.",
      required: true,
    },
    {
      id: "analytics",
      icon: BarChart3,
      title: "Analytics Cookies",
      description: "Help us understand how visitors interact with our website.",
      required: false,
    },
    {
      id: "marketing",
      icon: Target,
      title: "Marketing Cookies",
      description: "Used to deliver personalized advertisements.",
      required: false,
    },
    {
      id: "preferences",
      icon: Cookie,
      title: "Preference Cookies",
      description: "Remember your settings and preferences for future visits.",
      required: false,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-lg bg-background/95 backdrop-blur-xl border-border/50"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Cookie className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-xl">Cookie Settings</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. 
            Please choose your cookie preferences below.
          </DialogDescription>
        </DialogHeader>

        {showDetails ? (
          <div className="space-y-4 py-4 max-h-[300px] overflow-y-auto">
            {cookieTypes.map((cookie) => {
              const Icon = cookie.icon;
              return (
                <div
                  key={cookie.id}
                  className="flex items-start gap-4 p-3 rounded-lg bg-muted/30 border border-border/50"
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <Label htmlFor={cookie.id} className="font-medium text-foreground">
                        {cookie.title}
                      </Label>
                      <Switch
                        id={cookie.id}
                        checked={preferences[cookie.id as keyof CookiePreferences]}
                        onCheckedChange={(checked) =>
                          setPreferences((prev) => ({
                            ...prev,
                            [cookie.id]: checked,
                          }))
                        }
                        disabled={cookie.required}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {cookie.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-4">
            <p className="text-sm text-muted-foreground text-center">
              By clicking "Accept All", you consent to the use of ALL cookies. 
              Click "Customize" to manage your preferences.
            </p>
          </div>
        )}

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <div className="flex gap-2 w-full">
            <Button
              variant="default"
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={handleAcceptAll}
            >
              Accept All
            </Button>
            {showDetails ? (
              <Button
                variant="secondary"
                className="flex-1"
                onClick={handleAcceptSelected}
              >
                Save Preferences
              </Button>
            ) : (
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowDetails(true)}
              >
                Customize
              </Button>
            )}
          </div>
          <Button
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground"
            onClick={handleRejectAll}
          >
            Reject All (Essential Only)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
