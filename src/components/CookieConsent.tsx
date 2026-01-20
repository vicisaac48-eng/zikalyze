import { useState, useEffect } from "react";
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
    { id: "necessary", icon: Shield, title: "Essential", required: true },
    { id: "analytics", icon: BarChart3, title: "Analytics", required: false },
    { id: "marketing", icon: Target, title: "Marketing", required: false },
    { id: "preferences", icon: Cookie, title: "Preferences", required: false },
  ];

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 animate-in slide-in-from-bottom-5 duration-300">
      <div className="max-w-2xl mx-auto bg-background/95 backdrop-blur-xl border border-border/50 rounded-lg shadow-lg px-4 py-3">
        <div className="flex items-center gap-3">
          <Cookie className="h-4 w-4 text-primary shrink-0" />
          
          <div className="flex-1 min-w-0">
            {showDetails ? (
              <div className="flex items-center gap-4 flex-wrap">
                {cookieTypes.map((cookie) => (
                  <div key={cookie.id} className="flex items-center gap-1.5">
                    <Label htmlFor={cookie.id} className="text-xs text-muted-foreground cursor-pointer">
                      {cookie.title}
                    </Label>
                    <Switch
                      id={cookie.id}
                      checked={preferences[cookie.id as keyof CookiePreferences]}
                      onCheckedChange={(checked) =>
                        setPreferences((prev) => ({ ...prev, [cookie.id]: checked }))
                      }
                      disabled={cookie.required}
                      className="scale-75"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                We use cookies to enhance your experience and analyze traffic.
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              variant="default"
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={handleAcceptAll}
            >
              Accept
            </Button>
            {showDetails ? (
              <Button
                variant="secondary"
                size="sm"
                className="h-7 px-3 text-xs"
                onClick={handleAcceptSelected}
              >
                Save
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground"
                onClick={() => setShowDetails(true)}
              >
                Settings
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground"
              onClick={handleRejectAll}
            >
              Reject
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
