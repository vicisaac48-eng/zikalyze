import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Cookie, Shield, BarChart3, Target, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsNativeApp } from "@/hooks/useIsNativeApp";

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
  const isNativeApp = useIsNativeApp();

  useEffect(() => {
    // Don't show cookie consent on native apps (Android/PWA standalone)
    if (isNativeApp) {
      return;
    }
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setShow(true);
    }
  }, [isNativeApp]);

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
      title: "Essential", 
      description: "Required for the website to function properly",
      required: true 
    },
    { 
      id: "analytics", 
      icon: BarChart3, 
      title: "Analytics", 
      description: "Help us understand how you use our website",
      required: false 
    },
    { 
      id: "marketing", 
      icon: Target, 
      title: "Marketing", 
      description: "Used to deliver personalized advertisements",
      required: false 
    },
    { 
      id: "preferences", 
      icon: Cookie, 
      title: "Preferences", 
      description: "Remember your settings and preferences",
      required: false 
    },
  ];

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-lg mx-4 bg-card border border-border rounded-xl shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Cookie className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Cookie Preferences</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Zikalyze uses cookies for our website to function properly; some are optional and help deliver a personalized and enhanced experience. 
            By clicking "Accept All", you consent to store cookies on your device in accordance with our{" "}
            <Link to="/privacy" className="text-primary hover:underline">Cookie Statement</Link>. 
            We may collect anonymized data from your browser independent of your cookie preferences. 
            Preferences can be updated at any time.
          </p>
        </div>

        {/* Cookie Settings Panel */}
        {showDetails && (
          <div className="px-6 pb-4 space-y-3 border-t border-border pt-4">
            {cookieTypes.map((cookie) => {
              const Icon = cookie.icon;
              return (
                <div 
                  key={cookie.id} 
                  className="flex items-start justify-between gap-4 p-3 rounded-lg bg-muted/30 border border-border/50"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <Label 
                        htmlFor={cookie.id} 
                        className="text-sm font-medium text-foreground cursor-pointer"
                      >
                        {cookie.title}
                        {cookie.required && (
                          <span className="ml-2 text-xs text-muted-foreground">(Required)</span>
                        )}
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">{cookie.description}</p>
                    </div>
                  </div>
                  <Switch
                    id={cookie.id}
                    checked={preferences[cookie.id as keyof CookiePreferences]}
                    onCheckedChange={(checked) =>
                      setPreferences((prev) => ({ ...prev, [cookie.id]: checked }))
                    }
                    disabled={cookie.required}
                    className="shrink-0"
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="p-6 pt-4 border-t border-border space-y-2">
          <Button
            className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
            onClick={handleAcceptAll}
          >
            Accept All
          </Button>
          
          {showDetails ? (
            <Button
              variant="outline"
              className="w-full h-11 border-border hover:bg-muted"
              onClick={handleAcceptSelected}
            >
              Save Preferences
            </Button>
          ) : (
            <Button
              variant="outline"
              className="w-full h-11 border-border hover:bg-muted"
              onClick={handleRejectAll}
            >
              Reject Optional
            </Button>
          )}
          
          <Button
            variant="ghost"
            className="w-full h-10 text-muted-foreground hover:text-foreground"
            onClick={() => setShowDetails(!showDetails)}
          >
            <Settings className="h-4 w-4 mr-2" />
            {showDetails ? "Hide Settings" : "Customize Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}
