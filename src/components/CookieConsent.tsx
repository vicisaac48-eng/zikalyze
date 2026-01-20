import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Cookie, Shield, BarChart3, Target, X } from "lucide-react";

const COOKIE_CONSENT_KEY = "zikalyze_cookie_consent";

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export function CookieConsent() {
  const [show, setShow] = useState(false);
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
      setShow(true);
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
    setShow(false);
  };

  const handleAcceptSelected = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(preferences));
    setShow(false);
  };

  const handleRejectAll = () => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(onlyNecessary));
    setShow(false);
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

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-5 duration-300">
      <div className="max-w-4xl mx-auto bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Cookie className="h-5 w-5 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-foreground">Cookie Settings</h3>
            </div>
            
            {showDetails ? (
              <div className="space-y-3 mb-4 max-h-[200px] overflow-y-auto">
                {cookieTypes.map((cookie) => {
                  const Icon = cookie.icon;
                  return (
                    <div
                      key={cookie.id}
                      className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 border border-border/50"
                    >
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Label htmlFor={cookie.id} className="text-sm font-medium text-foreground">
                          {cookie.title}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {cookie.description}
                        </p>
                      </div>
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
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mb-4">
                We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. 
                By clicking "Accept All", you consent to the use of ALL cookies.
              </p>
            )}
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant="default"
                size="sm"
                className="bg-primary hover:bg-primary/90"
                onClick={handleAcceptAll}
              >
                Accept All
              </Button>
              {showDetails ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleAcceptSelected}
                >
                  Save Preferences
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowDetails(true)}
                >
                  Customize
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
                onClick={handleRejectAll}
              >
                Reject All
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
