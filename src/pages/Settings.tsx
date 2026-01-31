import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { UserProfile, useUser } from "@clerk/clerk-react";
import Sidebar from "@/components/dashboard/Sidebar";
import { Search, User, Bell, Shield, Palette, Globe, Moon, Sun, Save, Volume2, VolumeX, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { useSettings } from "@/hooks/useSettings";
import { alertSound } from "@/lib/alertSound";
import NotificationSettings from "@/components/settings/NotificationSettings";
import EmailDigestSettings from "@/components/settings/EmailDigestSettings";
import { languageCodes } from "@/i18n/config";

// Check if Clerk is configured
const isClerkConfigured = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const Settings = () => {
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const { setTheme, resolvedTheme } = useTheme();
  const { settings, saveSettings } = useSettings();
  
  // Only call useUser hook when Clerk is configured (app is wrapped with ClerkProvider)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { user } = isClerkConfigured ? useUser() : { user: null };
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = mounted ? resolvedTheme === "dark" : true;

  const handleThemeToggle = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
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
  }, [settings.language, settings.currency]);

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
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="ml-16 lg:ml-64">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-border px-6 py-4">
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search settings"
                className="w-64 bg-secondary border-border pl-10"
              />
            </div>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
        </header>

        <div className="p-6">
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
                        <div>
                          <div className="font-medium text-foreground">
                            {user?.primaryEmailAddress?.emailAddress || "No email (Demo Mode)"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Clerk User Profile - handles email, password, 2FA, etc. */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Manage Account</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Update your email, password, and security settings below.
                    </p>
                    {isClerkConfigured && UserProfile ? (
                      <div className="flex justify-center">
                        <UserProfile 
                          routing="hash"
                          appearance={{
                            elements: {
                              rootBox: "w-full",
                              card: "bg-transparent shadow-none border-0 p-0",
                              navbar: "hidden",
                              pageScrollBox: "p-0",
                              formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
                              formFieldInput: "bg-secondary border-border text-foreground",
                              formFieldLabel: "text-foreground",
                              headerTitle: "text-foreground",
                              headerSubtitle: "text-muted-foreground",
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-muted/50 border border-border">
                        <div className="flex items-center gap-3 mb-2">
                          <AlertCircle className="h-5 w-5 text-warning" />
                          <span className="font-medium text-foreground">Authentication Not Configured</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Set VITE_CLERK_PUBLISHABLE_KEY in your environment to enable account management features.
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
                  
                  {/* Basic Toggles */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                      <div className="flex items-center gap-3">
                        {settings.soundEnabled ? (
                          <Volume2 className="h-5 w-5 text-primary" />
                        ) : (
                          <VolumeX className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div>
                          <div className="font-medium text-foreground">Alert Sounds</div>
                          <div className="text-sm text-muted-foreground">Play sound when alerts trigger</div>
                        </div>
                      </div>
                      <Switch 
                        checked={settings.soundEnabled}
                        onCheckedChange={handleSoundToggle}
                      />
                    </div>

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

                  {/* Email Digest Settings */}
                  <div className="border-t border-border pt-6">
                    <EmailDigestSettings />
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
                        <button className="w-10 h-10 rounded-full bg-primary border-2 border-primary-foreground" />
                        <button className="w-10 h-10 rounded-full bg-chart-cyan border-2 border-transparent hover:border-foreground/50" />
                        <button className="w-10 h-10 rounded-full bg-success border-2 border-transparent hover:border-foreground/50" />
                        <button className="w-10 h-10 rounded-full bg-warning border-2 border-transparent hover:border-foreground/50" />
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
                        Manage your password, two-factor authentication, and active sessions through your profile.
                      </div>
                      <Button variant="outline" onClick={() => setActiveTab("profile")}>
                        Go to Profile Settings
                      </Button>
                    </div>

                    <div className="p-4 rounded-xl bg-muted/50 border border-border">
                      <div className="font-medium text-foreground mb-2">Delete Account</div>
                      <div className="text-sm text-muted-foreground mb-3">
                        To delete your account, go to your profile settings above and use the account management options provided by Clerk.
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
