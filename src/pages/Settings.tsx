import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Sidebar from "@/components/dashboard/Sidebar";
import { Search, User, Bell, Shield, Palette, Globe, Moon, Sun, Save, Volume2, VolumeX, Key, Copy, CheckCircle2, Trash2, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { useSettings } from "@/hooks/useSettings";
import { alertSound } from "@/lib/alertSound";
import NotificationSettings from "@/components/settings/NotificationSettings";
import { languageCodes } from "@/i18n/config";
import { useAuth } from "@/hooks/useAuth";
import { formatPrivateKey, clearAccountData } from "@/lib/crypto";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Settings = () => {
  const { t, i18n } = useTranslation();
  const { setTheme, resolvedTheme } = useTheme();
  const { settings, saveSettings } = useSettings();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [keyCopied, setKeyCopied] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Confirmation text required to delete account
  const DELETE_CONFIRMATION_TEXT = "DELETE";

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

  const handleEraseData = async () => {
    if (deleteConfirmText !== DELETE_CONFIRMATION_TEXT) {
      toast.error(`Please type ${DELETE_CONFIRMATION_TEXT} to confirm`);
      return;
    }

    setIsDeleting(true);
    try {
      // Clear all account data
      clearAccountData();
      
      // Sign out the user
      await signOut();
      
      toast.success(t("settings.accountDeleted"));
      
      // Redirect to landing page
      navigate("/");
    } catch (error) {
      console.error("Error erasing data:", error);
      toast.error(t("settings.deletionFailed"));
    } finally {
      setIsDeleting(false);
      setDeleteConfirmText("");
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

    toast.success(t("settings.settingsSaved"));
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
                            {user?.username || "Guest User"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Private Key Display */}
                  {user?.privateKey && (
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-4">Your Private Key</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Use this key to login. Keep it secure and never share it.
                      </p>
                      <div className="relative p-4 rounded-xl bg-secondary/50 border border-border">
                        <div className="font-mono text-sm break-all pr-12">
                          {formatPrivateKey(user.privateKey)}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-3 right-3"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(formatPrivateKey(user.privateKey || ""));
                              setKeyCopied(true);
                              toast.success("Private key copied to clipboard");
                              setTimeout(() => setKeyCopied(false), 3000);
                            } catch {
                              toast.error("Copy failed - Please select and copy the key manually.");
                            }
                          }}
                        >
                          {keyCopied ? (
                            <CheckCircle2 className="h-4 w-4 text-success" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-warning mt-2">
                        ⚠️ Never share your private key with anyone!
                      </p>
                    </div>
                  )}

                  {!user && (
                    <div className="p-4 rounded-xl bg-muted/50 border border-border">
                      <div className="flex items-center gap-3 mb-2">
                        <Key className="h-5 w-5 text-primary" />
                        <span className="font-medium text-foreground">Demo Mode</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Sign up to create your account and get your unique private key.
                      </p>
                    </div>
                  )}
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
                      <div className="flex items-center gap-3 mb-2">
                        <Key className="h-5 w-5 text-primary" />
                        <div className="font-medium text-foreground">Private Key Security</div>
                      </div>
                      <div className="text-sm text-muted-foreground mb-3">
                        Your private key is your identity. Keep it secure and never share it with anyone.
                      </div>
                      <Button variant="outline" onClick={() => setActiveTab("profile")}>
                        View Private Key
                      </Button>
                    </div>

                    <div className="p-4 rounded-xl bg-secondary/50">
                      <div className="font-medium text-foreground mb-2">Session Security</div>
                      <div className="text-sm text-muted-foreground mb-3">
                        Your session expires after 24 hours of inactivity. You'll be automatically logged out after 15 minutes of inactivity on protected pages.
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        <div className="font-medium text-foreground">{t("settings.dangerZone")}</div>
                      </div>
                      <div className="text-sm text-muted-foreground mb-4">
                        {t("settings.dangerZoneDesc")}
                      </div>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" className="gap-2">
                            <Trash2 className="h-4 w-4" />
                            {t("settings.deleteAccount")}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5 text-destructive" />
                              {t("settings.deleteAccountTitle")}
                            </AlertDialogTitle>
                            <AlertDialogDescription className="space-y-3">
                              <p>{t("settings.deleteWarning")}</p>
                              <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                                <li>{t("settings.deleteAlerts")}</li>
                                <li>{t("settings.deleteHistory")}</li>
                                <li>{t("settings.deleteCredentials")}</li>
                              </ul>
                              <div className="pt-2">
                                <label htmlFor="delete-confirm-input" className="text-sm font-medium text-foreground">
                                  {t("settings.typeDelete")}
                                </label>
                                <Input
                                  id="delete-confirm-input"
                                  placeholder={t("settings.typeDeletePlaceholder")}
                                  value={deleteConfirmText}
                                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                                  className="mt-2"
                                />
                              </div>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setDeleteConfirmText("")}>
                              {t("common.cancel")}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleEraseData}
                              disabled={deleteConfirmText !== DELETE_CONFIRMATION_TEXT || isDeleting}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {isDeleting ? "Deleting..." : t("settings.deleteForever")}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
