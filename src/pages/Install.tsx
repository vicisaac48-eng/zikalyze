import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Smartphone, 
  Monitor, 
  Share, 
  Plus, 
  MoreVertical, 
  Download,
  Check,
  Apple,
  Chrome
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import zikalyzeLogo from "@/assets/zikalyze-logo.png";

// App version from package.json
const APP_VERSION = "1.1.0";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [activeTab, setActiveTab] = useState("ios");

  useEffect(() => {
    // Detect device and set appropriate tab
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setActiveTab("ios");
    } else if (/android/.test(userAgent)) {
      setActiveTab("android");
    } else {
      setActiveTab("desktop");
    }

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const InstallStep = ({ 
    step, 
    icon: Icon, 
    title, 
    description 
  }: { 
    step: number; 
    icon: React.ElementType; 
    title: string; 
    description: string;
  }) => (
    <div className="flex gap-4 p-4 rounded-lg bg-muted/50">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
        {step}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="w-4 h-4 text-primary" />
          <h4 className="font-medium text-foreground">{title}</h4>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center px-4">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">{t("common.back", "Back")}</span>
          </Link>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-8">
        {/* Hero Section with Native App-Style Logo */}
        <div className="text-center mb-8">
          {/* Native App Icon Container - iOS/Android style with rounded corners */}
          <div className="relative inline-block mb-6">
            {/* App Icon - Native style with proper iOS/Android rounding */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-[24px] sm:rounded-[28px] overflow-hidden bg-gradient-to-br from-[#0a0f1a] via-[#0d1420] to-[#0a0f1a] p-[2px]">
              {/* Inner gradient border */}
              <div className="absolute inset-0 rounded-[24px] sm:rounded-[28px] bg-gradient-to-br from-primary/40 via-cyan-500/20 to-purple-500/30 opacity-80" />
              
              {/* Logo container with background */}
              <div className="relative w-full h-full rounded-[22px] sm:rounded-[26px] bg-gradient-to-br from-[#0d1420] to-[#080c14] flex items-center justify-center overflow-hidden">
                {/* Logo image */}
                <img 
                  src={zikalyzeLogo} 
                  alt="Zikalyze" 
                  className="w-16 h-16 sm:w-20 sm:h-20 object-contain relative z-10"
                />
              </div>
            </div>
            
            {/* Floating badge for native feel */}
            <div className="absolute -bottom-1 -right-1 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center border-2 border-background">
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground" />
            </div>
          </div>
          
          {/* App Name with native styling */}
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 tracking-tight">
            {t("install.title", "Install Zikalyze")}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
            {t("install.subtitle", "Get the full app experience with offline access and quick launch")}
          </p>
          
          {/* App info badges */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              {t("install.freeBadge", "Free")}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-muted-foreground text-xs font-medium">
              v{APP_VERSION}
            </span>
          </div>
        </div>

        {/* Installed State */}
        {isInstalled ? (
          <Card className="border-success/50 bg-success/5">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <Check className="w-6 h-6 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  {t("install.installed", "App Installed!")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("install.installedDesc", "Zikalyze is installed on your device. You can find it on your home screen.")}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Quick Install Button (if available) */}
            {deferredPrompt && (
              <Card className="mb-6 border-primary/50 bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="font-semibold text-foreground mb-1">
                        {t("install.quickInstall", "Quick Install Available")}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {t("install.quickInstallDesc", "Your browser supports one-click installation")}
                      </p>
                    </div>
                    <Button onClick={handleInstall} className="gap-2">
                      <Download className="w-4 h-4" />
                      {t("install.installNow", "Install Now")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Device-specific Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("install.instructions", "Installation Instructions")}
                </CardTitle>
                <CardDescription>
                  {t("install.instructionsDesc", "Follow the steps for your device")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="ios" className="gap-1.5">
                      <Apple className="w-4 h-4" />
                      <span className="hidden sm:inline">iPhone/iPad</span>
                      <span className="sm:hidden">iOS</span>
                    </TabsTrigger>
                    <TabsTrigger value="android" className="gap-1.5">
                      <Smartphone className="w-4 h-4" />
                      Android
                    </TabsTrigger>
                    <TabsTrigger value="desktop" className="gap-1.5">
                      <Monitor className="w-4 h-4" />
                      Desktop
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="ios" className="space-y-3 mt-0">
                    <InstallStep
                      step={1}
                      icon={Chrome}
                      title={t("install.ios.step1Title", "Open in Safari")}
                      description={t("install.ios.step1Desc", "Make sure you're viewing this page in Safari browser, not Chrome or another browser.")}
                    />
                    <InstallStep
                      step={2}
                      icon={Share}
                      title={t("install.ios.step2Title", "Tap the Share button")}
                      description={t("install.ios.step2Desc", "Look for the share icon (square with arrow) at the bottom of your screen.")}
                    />
                    <InstallStep
                      step={3}
                      icon={Plus}
                      title={t("install.ios.step3Title", 'Select "Add to Home Screen"')}
                      description={t("install.ios.step3Desc", "Scroll down in the share menu and tap 'Add to Home Screen'.")}
                    />
                    <InstallStep
                      step={4}
                      icon={Check}
                      title={t("install.ios.step4Title", 'Tap "Add"')}
                      description={t("install.ios.step4Desc", "Confirm by tapping Add in the top right corner. The app icon will appear on your home screen.")}
                    />
                  </TabsContent>

                  <TabsContent value="android" className="space-y-3 mt-0">
                    {/* Native APK Download Option */}
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 mb-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <Download className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground mb-1">
                            <Smartphone className="w-4 h-4 inline mr-1" />
                            {t("install.android.nativeTitle", "Download Native APK (Recommended)")}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            {t("install.android.nativeDesc", "Get the full native Android experience with better performance and push notifications.")}
                          </p>
                          <a 
                            href="https://github.com/vicisaac48-eng/zikalyze/releases/latest/download/zikalyze-latest.apk" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            {t("install.android.downloadLatestApk", "Download Latest APK")}
                          </a>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground text-center py-2">
                      {t("install.android.orPwa", "— or install as PWA —")}
                    </p>

                    <InstallStep
                      step={1}
                      icon={Chrome}
                      title={t("install.android.step1Title", "Open in Chrome")}
                      description={t("install.android.step1Desc", "Make sure you're viewing this page in Chrome browser for the best experience.")}
                    />
                    <InstallStep
                      step={2}
                      icon={MoreVertical}
                      title={t("install.android.step2Title", "Tap the menu button")}
                      description={t("install.android.step2Desc", "Look for the three dots (⋮) in the top right corner of Chrome.")}
                    />
                    <InstallStep
                      step={3}
                      icon={Plus}
                      title={t("install.android.step3Title", 'Select "Add to Home screen"')}
                      description={t("install.android.step3Desc", "Find and tap 'Add to Home screen' or 'Install app' in the menu.")}
                    />
                    <InstallStep
                      step={4}
                      icon={Check}
                      title={t("install.android.step4Title", "Confirm installation")}
                      description={t("install.android.step4Desc", "Tap 'Add' or 'Install' to confirm. The app will be added to your home screen.")}
                    />
                  </TabsContent>

                  <TabsContent value="desktop" className="space-y-3 mt-0">
                    <InstallStep
                      step={1}
                      icon={Chrome}
                      title={t("install.desktop.step1Title", "Use Chrome or Edge")}
                      description={t("install.desktop.step1Desc", "Open this page in Google Chrome, Microsoft Edge, or another Chromium-based browser.")}
                    />
                    <InstallStep
                      step={2}
                      icon={Download}
                      title={t("install.desktop.step2Title", "Look for the install icon")}
                      description={t("install.desktop.step2Desc", "Click the install icon (⊕) in the address bar, or use the menu (⋮) → 'Install Zikalyze'.")}
                    />
                    <InstallStep
                      step={3}
                      icon={Check}
                      title={t("install.desktop.step3Title", "Confirm installation")}
                      description={t("install.desktop.step3Desc", "Click 'Install' in the popup dialog. The app will open in its own window.")}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </>
        )}

        {/* Benefits Section - Native App Style Cards */}
        <div className="mt-8 grid gap-3 sm:gap-4 grid-cols-3">
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-card to-card/50 border border-border/50 p-4 sm:p-5 text-center transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-11 h-11 sm:w-12 sm:h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-1 ring-primary/10">
                <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <h4 className="font-semibold text-xs sm:text-sm text-foreground">
                {t("install.benefit1Title", "Quick Access")}
              </h4>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 leading-relaxed">
                {t("install.benefit1Desc", "Launch from home screen")}
              </p>
            </div>
          </div>
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-card to-card/50 border border-border/50 p-4 sm:p-5 text-center transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-11 h-11 sm:w-12 sm:h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 flex items-center justify-center ring-1 ring-cyan-500/10">
                <Download className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-500" />
              </div>
              <h4 className="font-semibold text-xs sm:text-sm text-foreground">
                {t("install.benefit2Title", "Works Offline")}
              </h4>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 leading-relaxed">
                {t("install.benefit2Desc", "Access cached data anytime")}
              </p>
            </div>
          </div>
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-card to-card/50 border border-border/50 p-4 sm:p-5 text-center transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-11 h-11 sm:w-12 sm:h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 flex items-center justify-center ring-1 ring-purple-500/10">
                <Monitor className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
              </div>
              <h4 className="font-semibold text-xs sm:text-sm text-foreground">
                {t("install.benefit3Title", "Full Screen")}
              </h4>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 leading-relaxed">
                {t("install.benefit3Desc", "No browser UI distractions")}
              </p>
            </div>
          </div>
        </div>

        {/* Back to App Link */}
        <div className="mt-8 text-center">
          <Link to="/">
            <Button variant="outline" className="gap-2 rounded-xl">
              <ArrowLeft className="w-4 h-4" />
              {t("install.backToApp", "Back to Zikalyze")}
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Install;
