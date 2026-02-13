import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Sidebar from "@/components/dashboard/Sidebar";
import BottomNav from "@/components/dashboard/BottomNav";
import { PullToRefresh } from "@/components/PullToRefresh";
import { Search, User, Bell, Shield, Palette, Globe, Moon, Sun, Save, Volume2, VolumeX, Wallet, Copy, ExternalLink, Key, Eye, EyeOff, Check, Volume1, Play, Smartphone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { useSettings, SoundType } from "@/hooks/useSettings";
import { alertSound, isNativePlatform } from "@/lib/alertSound";
import NotificationSettings from "@/components/settings/NotificationSettings";
import { languageCodes } from "@/i18n/config";
import { useAuth } from "@/hooks/useAuth";
import { useIsNativeApp } from "@/hooks/useIsNativeApp";

// Theme color mappings - HSL values for each available theme
const THEME_COLOR_MAP: Record<string, { primary: string; ring: string }> = {
  cyan: { primary: "168 76% 73%", ring: "168 76% 73%" },
  green: { primary: "142 76% 60%", ring: "142 76% 60%" },
  purple: { primary: "267 84% 81%", ring: "267 84% 81%" },
  amber: { primary: "38 92% 60%", ring: "38 92% 60%" },
};

// Apply theme color to CSS custom properties
const applyThemeColor = (color: string) => {
  if (THEME_COLOR_MAP[color]) {
    const root = document.documentElement;
    root.style.setProperty("--primary", THEME_COLOR_MAP[color].primary);
    root.style.setProperty("--ring", THEME_COLOR_MAP[color].ring);
    root.style.setProperty("--sidebar-primary", THEME_COLOR_MAP[color].primary);
    root.style.setProperty("--sidebar-ring", THEME_COLOR_MAP[color].ring);
  }
};

const Settings = () => {
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const { setTheme, resolvedTheme } = useTheme();
  const { settings, saveSettings } = useSettings();
  const { user, isSignedIn, signOut, getPrivateKey } = useAuth();
  const isNativeApp = useIsNativeApp();
  
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedThemeColor, setSelectedThemeColor] = useState(settings.themeColor || "cyan");

  // Pull-to-refresh handler - Settings page doesn't have much to refresh,
  // but we provide the consistent pull-to-refresh UI for native app feel
  const handleRefresh = useCallback(async () => {
    // Small delay to show the refresh animation
    await new Promise(resolve => setTimeout(resolve, 500));
  }, []);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Apply saved theme color on mount
  useEffect(() => {
    if (mounted && settings.themeColor) {
      applyThemeColor(settings.themeColor);
    }
  }, [mounted, settings.themeColor]);

  const isDarkMode = mounted ? resolvedTheme === "dark" : true;

  const handleThemeToggle = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
  };

  const handleThemeColorChange = (color: string) => {
    setSelectedThemeColor(color);
    saveSettings({ themeColor: color });
    applyThemeColor(color);
    
    toast({
      title: "Theme color updated",
      description: `Changed to ${color}`,
    });
  };

  const handleSoundToggle = (checked: boolean) => {
    saveSettings({ soundEnabled: checked });
    if (checked) {
      // Play test sound when enabling
      alertSound.playTestSound();
    }
  };

  // General settings local state (saved on button click)
  const [selectedLanguage, setSelectedLanguage] = useState(settings.language);
  const [selectedCurrency, setSelectedCurrency] = useState(settings.currency);

  // Sync local state when settings are loaded
  useEffect(() => {
    setSelectedLanguage(settings.language);
    setSelectedCurrency(settings.currency);
    setSelectedThemeColor(settings.themeColor || "cyan");
  }, [settings.language, settings.currency, settings.themeColor]);

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "general", label: "General", icon: Globe },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "security", label: "Security", icon: Shield },
  ];

  const handleSave = () => {
    // Change language in i18n first
    const langCode = languageCodes[selectedLanguage] || "en";
    i18n.changeLanguage(langCode);

    // Persist settings (both React state + localStorage) via hook
    saveSettings({ language: selectedLanguage, currency: selectedCurrency });

    // Notify currency context + any other listeners immediately
    setTimeout(() => {
      window.dispatchEvent(new Event("settingsChanged"));
    }, 0);

    toast({
      title: t("settings.settingsSaved"),
      description: t("settings.settingsSavedDesc"),
    });
  };

  return (
    <>
      <Sidebar />
      <BottomNav />
      
      <main className="md:ml-16 lg:ml-64 pb-bottom-nav md:pb-0">
        {/* Header - Fixed positioning on Android for stable scrolling, sticky on web */}
        <header className="fixed-header flex items-center justify-between border-b border-border bg-background px-3 py-2 sm:px-6 sm:py-4">
          <h1 className="text-base font-bold text-foreground sm:text-xl md:text-2xl">Settings</h1>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search settings"
                className="w-64 bg-secondary border-border pl-10"
              />
            </div>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 sm:h-10 sm:w-10">
              <User className="h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" />
            </Button>
          </div>
        </header>

        <PullToRefresh onRefresh={handleRefresh}>
          <div className="min-h-screen bg-background">
            <div className="main-content p-3 sm:p-4 md:p-6">
          {/* Tabs Navigation - Stacked vertically */}
          <div className="space-y-2 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 rounded-xl px-4 py-3.5 transition-all text-left",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground font-medium"
                    : "bg-card/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-6">

            {/* Settings Content */}
            <div className="rounded-2xl border border-border bg-card p-6">
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Account Information</h3>
                    
                    <div className="p-4 rounded-xl bg-secondary/50 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          {isSignedIn && user ? (
                            <>
                              <div className="font-medium text-foreground">
                                {user.username || "User"}
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center gap-2">
                                {user.shortAddress}
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(user.address);
                                    toast({ title: "Address copied!", description: "Wallet address copied to clipboard" });
                                  }}
                                  className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  <Copy className="h-3 w-3" />
                                </button>
                                <a
                                  href={`https://etherscan.io/address/${user.address}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                            </>
                          ) : (
                            <div className="font-medium text-foreground">
                              Not signed in (Demo Mode)
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Private Key Section */}
                  {isSignedIn && (
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-4">Your Private Key</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Keep this key safe! You need it to sign in on other devices.
                      </p>
                      <div className="p-4 rounded-xl bg-muted/50 border border-border">
                        <div className="flex items-center gap-3 mb-3">
                          <Key className="h-5 w-5 text-primary" />
                          <span className="font-medium text-foreground">Private Key</span>
                        </div>
                        <div className="relative">
                          <Input
                            value={showPrivateKey ? (getPrivateKey() || "") : "0x" + "•".repeat(64)}
                            readOnly
                            className="pr-20 font-mono text-xs"
                          />
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                            <button
                              onClick={() => setShowPrivateKey(!showPrivateKey)}
                              className="text-muted-foreground hover:text-foreground p-1"
                            >
                              {showPrivateKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={() => {
                                const key = getPrivateKey();
                                if (key) {
                                  navigator.clipboard.writeText(key);
                                  setCopied(true);
                                  toast({ title: "Private key copied!", description: "Keep it safe!" });
                                  setTimeout(() => setCopied(false), 2000);
                                }
                              }}
                              className="text-muted-foreground hover:text-foreground p-1"
                            >
                              {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-destructive mt-2">
                          ⚠️ Never share your private key with anyone!
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Sign Out Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Account Actions</h3>
                    {isSignedIn ? (
                      <div className="space-y-3">
                        <div className="p-4 rounded-xl bg-muted/50 border border-border">
                          <div className="flex items-center gap-3 mb-2">
                            <Wallet className="h-5 w-5 text-primary" />
                            <span className="font-medium text-foreground">Wallet Address</span>
                          </div>
                          <p className="text-sm text-muted-foreground font-mono break-all">
                            {user?.address}
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          onClick={async () => {
                            await signOut();
                            toast({ title: "Signed out", description: "You have been signed out" });
                          }}
                          className="gap-2"
                        >
                          Sign Out
                        </Button>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-muted/50 border border-border">
                        <div className="flex items-center gap-3 mb-2">
                          <User className="h-5 w-5 text-muted-foreground" />
                          <span className="font-medium text-foreground">Demo Mode</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Sign up or sign in to save your settings across devices.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "general" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">General Settings</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                        <div>
                          <div className="font-medium text-foreground">Language</div>
                          <div className="text-sm text-muted-foreground">Select your preferred language</div>
                        </div>
                        <select 
                          value={selectedLanguage}
                          onChange={(e) => setSelectedLanguage(e.target.value)}
                          className="bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                        >
                          <option value="English">English</option>
                          <option value="Spanish">Spanish</option>
                          <option value="French">French</option>
                          <option value="German">German</option>
                          <option value="Chinese">Chinese</option>
                          <option value="Japanese">Japanese (日本語)</option>
                          <option value="Pidgin">Pidgin</option>
                          <option value="Arabic">العربية (Arabic)</option>
                          <option value="Hindi">हिन्दी (Hindi)</option>
                          <option value="Russian">Русский (Russian)</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                        <div>
                          <div className="font-medium text-foreground">Currency</div>
                          <div className="text-sm text-muted-foreground">Default display currency</div>
                        </div>
                        <select 
                          value={selectedCurrency}
                          onChange={(e) => setSelectedCurrency(e.target.value)}
                          className="bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                        >
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                          <option value="CNY">CNY (¥)</option>
                          <option value="JPY">JPY (¥)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Save Button for General Settings */}
                  <div className="pt-4 border-t border-border">
                    <Button onClick={handleSave} className="gap-2">
                      <Save className="h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Notification Preferences</h3>
                  
                  {/* Native App Indicator */}
                  {isNativePlatform() && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 text-success text-sm">
                      <Smartphone className="h-4 w-4" />
                      <span>Native mode active — Haptic feedback enabled</span>
                    </div>
                  )}
                  
                  {/* Sound Settings Section */}
                  <div className="space-y-4">
                    {/* Sound Toggle */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                      <div className="flex items-center gap-3">
                        {settings.soundEnabled ? (
                          <Volume2 className="h-5 w-5 text-primary" />
                        ) : (
                          <VolumeX className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div>
                          <div className="font-medium text-foreground">Alert Sounds</div>
                          <div className="text-sm text-muted-foreground">
                            Play sound when alerts trigger
                            {isNativePlatform() && " (with haptic feedback)"}
                          </div>
                        </div>
                      </div>
                      <Switch 
                        checked={settings.soundEnabled}
                        onCheckedChange={handleSoundToggle}
                      />
                    </div>

                    {/* Volume Slider - Only shown when sound is enabled */}
                    {settings.soundEnabled && (
                      <div className="p-4 rounded-xl bg-secondary/50 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Volume1 className="h-5 w-5 text-primary" />
                            <div>
                              <div className="font-medium text-foreground">Volume</div>
                              <div className="text-sm text-muted-foreground">Adjust alert volume</div>
                            </div>
                          </div>
                          <span className="text-sm font-medium text-primary">
                            {Math.round(settings.soundVolume * 100)}%
                          </span>
                        </div>
                        <Slider
                          value={[settings.soundVolume * 100]}
                          onValueChange={(value) => saveSettings({ soundVolume: value[0] / 100 })}
                          min={10}
                          max={100}
                          step={10}
                          className="w-full"
                        />
                      </div>
                    )}

                    {/* Sound Type Selection - Only shown when sound is enabled */}
                    {settings.soundEnabled && (
                      <div className="p-4 rounded-xl bg-secondary/50 space-y-4">
                        <div className="font-medium text-foreground">Alert Sound Type</div>
                        <div className="grid grid-cols-3 gap-2">
                          {(["chime", "beep", "bell"] as SoundType[]).map((type) => (
                            <button
                              key={type}
                              onClick={() => {
                                saveSettings({ soundType: type });
                                alertSound.playTestSound(type);
                              }}
                              className={cn(
                                "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                                settings.soundType === type
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border bg-background hover:border-primary/50 text-muted-foreground"
                              )}
                            >
                              <Play className="h-4 w-4" />
                              <span className="text-xs font-medium capitalize">{type}</span>
                            </button>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => alertSound.playTestSound()}
                          className="w-full gap-2"
                        >
                          <Play className="h-4 w-4" />
                          Test Sound
                        </Button>
                      </div>
                    )}

                    {/* Push Notifications Toggle */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                      <div>
                        <div className="font-medium text-foreground">Push Notifications</div>
                        <div className="text-sm text-muted-foreground">Receive push notifications even when browser is closed</div>
                      </div>
                      <Switch 
                        checked={settings.notifications}
                        onCheckedChange={(checked) => saveSettings({ notifications: checked })}
                      />
                    </div>
                  </div>

                  {/* Push Notification Settings */}
                  <div className="border-t border-border pt-6">
                    <NotificationSettings />
                  </div>
                </div>
              )}

              {activeTab === "appearance" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Appearance</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                      <div className="flex items-center gap-3">
                        {isDarkMode ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-warning" />}
                        <div>
                          <div className="font-medium text-foreground">Dark Mode</div>
                          <div className="text-sm text-muted-foreground">Toggle dark/light theme</div>
                        </div>
                      </div>
                      <Switch 
                        checked={isDarkMode}
                        onCheckedChange={handleThemeToggle}
                      />
                    </div>

                    <div className="p-4 rounded-xl bg-secondary/50">
                      <div className="font-medium text-foreground mb-3">Theme Colors</div>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => handleThemeColorChange("cyan")}
                          className={cn(
                            "w-10 h-10 rounded-full border-2 transition-all",
                            "bg-[hsl(168,76%,73%)]",
                            selectedThemeColor === "cyan" 
                              ? "border-primary-foreground ring-2 ring-[hsl(168,76%,73%)] ring-offset-2 ring-offset-background" 
                              : "border-transparent hover:border-foreground/50"
                          )}
                          aria-label="Cyan theme"
                        />
                        <button 
                          onClick={() => handleThemeColorChange("green")}
                          className={cn(
                            "w-10 h-10 rounded-full border-2 transition-all",
                            "bg-[hsl(142,76%,60%)]",
                            selectedThemeColor === "green" 
                              ? "border-primary-foreground ring-2 ring-[hsl(142,76%,60%)] ring-offset-2 ring-offset-background" 
                              : "border-transparent hover:border-foreground/50"
                          )}
                          aria-label="Green theme"
                        />
                        <button 
                          onClick={() => handleThemeColorChange("purple")}
                          className={cn(
                            "w-10 h-10 rounded-full border-2 transition-all",
                            "bg-[hsl(267,84%,81%)]",
                            selectedThemeColor === "purple" 
                              ? "border-primary-foreground ring-2 ring-[hsl(267,84%,81%)] ring-offset-2 ring-offset-background" 
                              : "border-transparent hover:border-foreground/50"
                          )}
                          aria-label="Purple theme"
                        />
                        <button 
                          onClick={() => handleThemeColorChange("amber")}
                          className={cn(
                            "w-10 h-10 rounded-full border-2 transition-all",
                            "bg-[hsl(38,92%,60%)]",
                            selectedThemeColor === "amber" 
                              ? "border-primary-foreground ring-2 ring-[hsl(38,92%,60%)] ring-offset-2 ring-offset-background" 
                              : "border-transparent hover:border-foreground/50"
                          )}
                          aria-label="Amber theme"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Security Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-secondary/50">
                      <div className="font-medium text-foreground mb-2">Account Security</div>
                      <div className="text-sm text-muted-foreground mb-3">
                        Your wallet is generated from your username and password. Keep your private key safe as a backup.
                      </div>
                      <Button variant="outline" onClick={() => setActiveTab("profile")}>
                        View Private Key
                      </Button>
                    </div>

                    <div className="p-4 rounded-xl bg-muted/50 border border-border">
                      <div className="font-medium text-foreground mb-2">Sign Out</div>
                      <div className="text-sm text-muted-foreground mb-3">
                        To sign out, go to your profile settings above. You can always sign back in with your private key or recover using your username and password.
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-muted/50 border border-border">
                      <div className="font-medium text-foreground mb-2">Best Practices</div>
                      <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                        <li>Never share your private key with anyone</li>
                        <li>Use a strong, unique password for your account</li>
                        <li>Save your private key in a secure location</li>
                        <li>Remember your username for easy recovery</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
            </div>
          </div>
        </PullToRefresh>
      </main>
    </>
  );
};

export default Settings;
