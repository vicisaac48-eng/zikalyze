import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import Sidebar from "@/components/dashboard/Sidebar";
import BottomNav from "@/components/dashboard/BottomNav";
import { PullToRefresh } from "@/components/PullToRefresh";
import { Search, User, Bell, BellRing, Trash2, Clock, CheckCircle, AlertCircle, BellOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { usePriceAlerts } from "@/hooks/usePriceAlerts";
import { usePriceData } from "@/contexts/PriceDataContext";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useCurrency } from "@/hooks/useCurrency";

import { useIsNativeApp } from "@/hooks/useIsNativeApp";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

import { toast } from "sonner";

interface TriggeredAlert {
  id: string;
  symbol: string;
  name: string;
  target_price: number;
  condition: "above" | "below";
  triggered_at: string;
  current_price_at_creation: number;
}

const Alerts = () => {
  const { alerts, loading, removeAlert, refetch, checkAlerts } = usePriceAlerts();
  const { prices, getPriceBySymbol, refetch: refetchPrices } = usePriceData();
  const { isSupported, isSubscribed, isLoading: pushLoading, subscribe, unsubscribe } = usePushNotifications();
  const { formatPrice } = useCurrency();
  const isNativeApp = useIsNativeApp();
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const [triggeredAlerts, setTriggeredAlerts] = useState<TriggeredAlert[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [alertToDelete, setAlertToDelete] = useState<{ id: string; symbol: string } | null>(null);
  const [clearHistoryDialogOpen, setClearHistoryDialogOpen] = useState(false);
  const { t } = useTranslation();
  
  // Track last alert check time to throttle checks
  const lastAlertCheckRef = useRef<number>(0);
  
  // Check alerts whenever prices update (same pattern as Top100CryptoList)
  // This ensures push notifications work even when user is on the Alerts page
  useEffect(() => {
    if (prices.length > 0 && alerts.length > 0) {
      // Throttle alert checks to every 2 seconds to prevent spam
      const now = Date.now();
      if (now - lastAlertCheckRef.current > 2000) {
        lastAlertCheckRef.current = now;
        checkAlerts(prices);
      }
    }
  }, [prices, alerts, checkAlerts]);

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    await Promise.all([refetch(), refetchPrices()]);
  }, [refetch, refetchPrices]);

  // Fetch triggered alerts history
  useEffect(() => {
    const fetchTriggeredAlerts = async () => {
      try {
        const { data, error } = await supabase
          .from("price_alerts")
          .select("*")
          .eq("is_triggered", true)
          .order("triggered_at", { ascending: false })
          .limit(50);

        if (error) {
          console.error("Error fetching triggered alerts:", error);
          return;
        }

        const typedData = (data || []).map((item) => ({
          ...item,
          condition: item.condition as "above" | "below",
        }));
        setTriggeredAlerts(typedData);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchTriggeredAlerts();
  }, []);

  const handleOpenDeleteDialog = (alertId: string, symbol: string) => {
    setAlertToDelete({ id: alertId, symbol });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (alertToDelete) {
      await removeAlert(alertToDelete.id);
      setAlertToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const handleRemoveAlert = (alertId: string, symbol: string) => {
    handleOpenDeleteDialog(alertId, symbol);
  };

  const handleOpenClearHistoryDialog = () => {
    setClearHistoryDialogOpen(true);
  };

  const handleConfirmClearHistory = async () => {
    try {
      const { error } = await supabase
        .from("price_alerts")
        .delete()
        .eq("is_triggered", true);

      if (error) {
        console.error("Error clearing history:", error);
        setClearHistoryDialogOpen(false);
        return;
      }

      setTriggeredAlerts([]);
      toast.info("Alert history cleared");
    } catch (err) {
      console.error("Error:", err);
    }
    setClearHistoryDialogOpen(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleTogglePush = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen max-h-screen overflow-y-auto bg-background">
        <Sidebar />
        <BottomNav />

      <main className="md:ml-16 lg:ml-64 pb-16 md:pb-0">
        {/* Header - Fixed positioning on Android for stable scrolling, sticky on web */}
        <header className={`fixed-header flex items-center justify-between border-b border-border bg-background px-3 py-2 sm:px-6 sm:py-4${isNativeApp ? ' android-fixed' : ''}`}>
          <div className="flex items-center gap-2">
            <BellRing className="h-5 w-5 text-primary" />
            <h1 className="text-base font-bold text-foreground sm:text-xl md:text-2xl">{t("alerts.title")}</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t("alerts.searchAlerts")}
                className="w-64 bg-secondary border-border pl-10"
              />
            </div>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 sm:h-10 sm:w-10">
              <User className="h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" />
            </Button>
          </div>
        </header>

        <div className={cn(
          "main-content space-y-3 sm:space-y-4 md:space-y-6",
          isNativeApp ? "p-2 pb-4" : "p-3 sm:p-4 md:p-6"
        )}>
          {/* Stats Cards */}
          <div className={cn(
            "grid gap-3",
            isNativeApp ? "grid-cols-3" : "gap-4 md:grid-cols-3"
          )}>
            <div className={cn(
              "border border-border bg-card",
              isNativeApp ? "rounded-lg p-3" : "rounded-2xl p-6"
            )}>
              <div className={cn(
                "flex items-center mb-2",
                isNativeApp ? "gap-1.5 flex-col text-center" : "gap-3 mb-3"
              )}>
                <div className={cn(
                  "rounded-lg bg-primary/20",
                  isNativeApp ? "p-1.5" : "p-2"
                )}>
                  <Bell className={cn(
                    "text-primary",
                    isNativeApp ? "h-4 w-4" : "h-5 w-5"
                  )} />
                </div>
                <span className={cn(
                  "text-muted-foreground",
                  isNativeApp ? "text-[10px] leading-tight" : "text-sm"
                )}>{t("alerts.activeAlerts")}</span>
              </div>
              <div className={cn(
                "font-bold text-foreground text-center",
                isNativeApp ? "text-xl" : "text-3xl"
              )}>{alerts.length}</div>
            </div>

            <div className={cn(
              "border border-border bg-card",
              isNativeApp ? "rounded-lg p-3" : "rounded-2xl p-6"
            )}>
              <div className={cn(
                "flex items-center mb-2",
                isNativeApp ? "gap-1.5 flex-col text-center" : "gap-3 mb-3"
              )}>
                <div className={cn(
                  "rounded-lg bg-success/20",
                  isNativeApp ? "p-1.5" : "p-2"
                )}>
                  <CheckCircle className={cn(
                    "text-success",
                    isNativeApp ? "h-4 w-4" : "h-5 w-5"
                  )} />
                </div>
                <span className={cn(
                  "text-muted-foreground",
                  isNativeApp ? "text-[10px] leading-tight" : "text-sm"
                )}>{t("alerts.triggeredToday")}</span>
              </div>
              <div className={cn(
                "font-bold text-foreground text-center",
                isNativeApp ? "text-xl" : "text-3xl"
              )}>
                {triggeredAlerts.filter(a => {
                  const today = new Date();
                  const triggerDate = new Date(a.triggered_at);
                  return triggerDate.toDateString() === today.toDateString();
                }).length}
              </div>
            </div>

            <div className={cn(
              "border border-border bg-card",
              isNativeApp ? "rounded-lg p-3" : "rounded-2xl p-6"
            )}>
              <div className={cn(
                "flex items-center mb-2",
                isNativeApp ? "gap-1.5 flex-col text-center" : "gap-3 mb-3"
              )}>
                <div className={cn(
                  "rounded-lg bg-chart-cyan/20",
                  isNativeApp ? "p-1.5" : "p-2"
                )}>
                  <Clock className={cn(
                    "text-chart-cyan",
                    isNativeApp ? "h-4 w-4" : "h-5 w-5"
                  )} />
                </div>
                <span className={cn(
                  "text-muted-foreground",
                  isNativeApp ? "text-[10px] leading-tight" : "text-sm"
                )}>{t("alerts.totalTriggered")}</span>
              </div>
              <div className={cn(
                "font-bold text-foreground text-center",
                isNativeApp ? "text-xl" : "text-3xl"
              )}>{triggeredAlerts.length}</div>
            </div>
          </div>

          {/* Tabs and Push Notifications */}
          <div className={cn(
            "flex items-center",
            isNativeApp ? "justify-center gap-1.5" : "justify-between"
          )}>
            <div className={cn(
              "flex",
              isNativeApp ? "gap-1.5 w-full" : "gap-2"
            )}>
              <button
                onClick={() => setActiveTab("active")}
                className={cn(
                  "font-medium transition-all flex items-center justify-center gap-1.5",
                  isNativeApp 
                    ? "flex-1 rounded-md px-3 py-1.5 text-xs" 
                    : "rounded-lg px-4 py-2 text-sm gap-2",
                  activeTab === "active"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                <Bell className={cn(isNativeApp ? "h-3.5 w-3.5" : "h-4 w-4")} />
                {isNativeApp ? "Active" : t("alerts.activeAlerts")}
                {alerts.length > 0 && (
                  <span className={cn(
                    "bg-primary-foreground/20 text-primary-foreground px-1.5 py-0.5 rounded",
                    isNativeApp ? "text-[10px]" : "text-xs"
                  )}>
                    {alerts.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={cn(
                  "font-medium transition-all flex items-center justify-center gap-1.5",
                  isNativeApp 
                    ? "flex-1 rounded-md px-3 py-1.5 text-xs" 
                    : "rounded-lg px-4 py-2 text-sm gap-2",
                  activeTab === "history"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                <Clock className={cn(isNativeApp ? "h-3.5 w-3.5" : "h-4 w-4")} />
                {isNativeApp ? "History" : t("alerts.alertHistory")}
              </button>
            </div>
            {isSupported && !isNativeApp && (
              <Button 
                variant={isSubscribed ? "default" : "outline"} 
                size="sm" 
                onClick={handleTogglePush}
                disabled={pushLoading}
                className="gap-2"
              >
                {isSubscribed ? (
                  <>
                    <BellRing className="h-4 w-4" />
                    {t("alerts.pushOn")}
                  </>
                ) : (
                  <>
                    <BellOff className="h-4 w-4" />
                    {t("alerts.enablePush")}
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Content */}
          <div className={cn(
            "border border-border bg-card",
            isNativeApp ? "rounded-lg" : "rounded-2xl"
          )}>
            {activeTab === "active" ? (
              <>
                <div className={cn(
                  "border-b border-border flex items-center justify-between",
                  isNativeApp ? "p-3" : "p-6"
                )}>
                  <h3 className={cn(
                    "font-semibold text-foreground",
                    isNativeApp ? "text-sm" : "text-lg"
                  )}>{t("alerts.activeAlerts")}</h3>
                  <span className={cn(
                    "text-muted-foreground",
                    isNativeApp ? "text-xs" : "text-sm"
                  )}>
                    {isNativeApp ? alerts.length : t("alerts.monitoring", { count: alerts.length })}
                  </span>
                </div>

                {loading ? (
                  <div className={cn(
                    "flex items-center justify-center",
                    isNativeApp ? "p-8" : "p-12"
                  )}>
                    <div className={cn(
                      "animate-spin rounded-full border-2 border-primary border-t-transparent",
                      isNativeApp ? "h-5 w-5" : "h-6 w-6"
                    )} />
                  </div>
                ) : alerts.length === 0 ? (
                  <div className={cn(
                    "text-center",
                    isNativeApp ? "p-8" : "p-12"
                  )}>
                    <AlertCircle className={cn(
                      "text-muted-foreground mx-auto mb-3",
                      isNativeApp ? "h-8 w-8" : "h-12 w-12 mb-4"
                    )} />
                    <h4 className={cn(
                      "font-medium text-foreground mb-1.5",
                      isNativeApp ? "text-sm" : "text-lg mb-2"
                    )}>{t("alerts.noActiveAlerts")}</h4>
                    <p className={cn(
                      "text-muted-foreground",
                      isNativeApp ? "text-xs" : "text-sm"
                    )}>
                      {t("alerts.noActiveAlertsDesc")}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {alerts.map((alert) => {
                      const crypto = getPriceBySymbol(alert.symbol);
                      const currentPrice = crypto?.current_price || 0;
                      const progressPercent = alert.condition === "above"
                        ? Math.min(100, (currentPrice / alert.target_price) * 100)
                        : Math.min(100, (alert.target_price / currentPrice) * 100);
                      const distancePercent = alert.condition === "above"
                        ? ((alert.target_price - currentPrice) / currentPrice) * 100
                        : ((currentPrice - alert.target_price) / currentPrice) * 100;

                      return (
                        <div key={alert.id} className={cn(
                          "flex items-center justify-between hover:bg-secondary/30 transition-colors",
                          isNativeApp ? "p-2.5" : "p-4"
                        )}>
                          <div className={cn(
                            "flex items-center",
                            isNativeApp ? "gap-2" : "gap-4"
                          )}>
                            {crypto?.image && (
                              <img src={crypto.image} alt={alert.name} className={cn(
                                "rounded-full",
                                isNativeApp ? "w-8 h-8" : "w-10 h-10"
                              )} />
                            )}
                            <div>
                              <div className={cn(
                                "flex items-center",
                                isNativeApp ? "gap-1.5" : "gap-2"
                              )}>
                                <span className={cn(
                                  "font-semibold text-foreground",
                                  isNativeApp ? "text-sm" : ""
                                )}>{alert.symbol}</span>
                                {!isNativeApp && (
                                  <span className="text-sm text-muted-foreground">{alert.name}</span>
                                )}
                              </div>
                              <div className={cn(
                                "text-muted-foreground flex items-center gap-1.5 mt-0.5",
                                isNativeApp ? "text-xs" : "text-sm gap-2 mt-1"
                              )}>
                                <span className={cn(
                                  "px-1.5 py-0.5 rounded font-medium",
                                  isNativeApp ? "text-[10px]" : "px-2 text-xs",
                                  alert.condition === "above" ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
                                )}>
                                  {alert.condition === "above" ? `↑ ${t("alerts.above")}` : `↓ ${t("alerts.below")}`}
                                </span>
                                <span className={cn(isNativeApp ? "text-xs" : "")}>{formatPrice(alert.target_price)}</span>
                              </div>
                            </div>
                          </div>

                          <div className={cn(
                            "flex items-center",
                            isNativeApp ? "gap-2" : "gap-6"
                          )}>
                            {!isNativeApp && (
                              <div className="text-right">
                                <div className="text-sm text-muted-foreground">{t("alerts.currentPrice")}</div>
                                <div className="font-semibold text-foreground">{formatPrice(currentPrice)}</div>
                              </div>
                            )}
                            <div className={cn(
                              "text-right",
                              isNativeApp ? "" : "w-20"
                            )}>
                              {!isNativeApp && <div className="text-sm text-muted-foreground">{t("alerts.distance")}</div>}
                              <div className={cn(
                                "font-semibold",
                                "font-semibold",
                                isNativeApp ? "text-xs" : "",
                                distancePercent > 0 ? "text-warning" : "text-success"
                              )}>
                                {distancePercent > 0 ? `${distancePercent.toFixed(1)}%` : t("alerts.ready")}
                              </div>
                            </div>
                            {!isNativeApp && (
                              <div className="w-32 hidden md:block">
                                <div className="text-xs text-muted-foreground mb-1">{t("alerts.progress")}</div>
                                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-primary transition-all duration-500 rounded-full"
                                    style={{ width: `${progressPercent}%` }}
                                  />
                                </div>
                              </div>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className={cn(
                                "text-muted-foreground hover:text-destructive",
                                isNativeApp ? "h-7 w-7" : ""
                              )}
                              onClick={() => handleRemoveAlert(alert.id, alert.symbol)}
                            >
                              <Trash2 className={cn(isNativeApp ? "h-3.5 w-3.5" : "h-4 w-4")} />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className={cn(
                  "border-b border-border flex items-center justify-between",
                  isNativeApp ? "p-3" : "p-6"
                )}>
                  <h3 className={cn(
                    "font-semibold text-foreground",
                    isNativeApp ? "text-sm" : "text-lg"
                  )}>{t("alerts.triggeredHistory")}</h3>
                  {triggeredAlerts.length > 0 && !isNativeApp && (
                    <Button variant="outline" size="sm" onClick={handleOpenClearHistoryDialog}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t("alerts.clearHistory")}
                    </Button>
                  )}
                </div>

                {historyLoading ? (
                  <div className={cn(
                    "flex items-center justify-center",
                    isNativeApp ? "p-8" : "p-12"
                  )}>
                    <div className={cn(
                      "animate-spin rounded-full border-2 border-primary border-t-transparent",
                      isNativeApp ? "h-5 w-5" : "h-6 w-6"
                    )} />
                  </div>
                ) : triggeredAlerts.length === 0 ? (
                  <div className={cn(
                    "text-center",
                    isNativeApp ? "p-8" : "p-12"
                  )}>
                    <Clock className={cn(
                      "text-muted-foreground mx-auto mb-3",
                      isNativeApp ? "h-8 w-8" : "h-12 w-12 mb-4"
                    )} />
                    <h4 className={cn(
                      "font-medium text-foreground mb-1.5",
                      isNativeApp ? "text-sm" : "text-lg mb-2"
                    )}>{t("alerts.noAlertHistory")}</h4>
                    <p className={cn(
                      "text-muted-foreground",
                      isNativeApp ? "text-xs" : "text-sm"
                    )}>
                      {t("alerts.noAlertHistoryDesc")}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {triggeredAlerts.map((alert) => (
                      <div key={alert.id} className={cn(
                        "flex items-center justify-between hover:bg-secondary/30 transition-colors",
                        isNativeApp ? "p-2.5" : "p-4"
                      )}>
                        <div className={cn(
                          "flex items-center",
                          isNativeApp ? "gap-2" : "gap-4"
                        )}>
                          <div className={cn(
                            "rounded-full bg-success/20",
                            isNativeApp ? "p-1.5" : "p-2"
                          )}>
                            <CheckCircle className={cn(
                              "text-success",
                              isNativeApp ? "h-4 w-4" : "h-5 w-5"
                            )} />
                          </div>
                          <div>
                            <div className={cn(
                              "flex items-center",
                              isNativeApp ? "gap-1.5" : "gap-2"
                            )}>
                              <span className={cn(
                                "font-semibold text-foreground",
                                isNativeApp ? "text-sm" : ""
                              )}>{alert.symbol}</span>
                              {!isNativeApp && (
                                <span className="text-sm text-muted-foreground">{alert.name}</span>
                              )}
                            </div>
                            <div className={cn(
                              "text-muted-foreground flex items-center gap-1.5 mt-0.5",
                              isNativeApp ? "text-xs" : "text-sm gap-2 mt-1"
                            )}>
                              <span className={cn(
                                "px-1.5 py-0.5 rounded font-medium",
                                isNativeApp ? "text-[10px]" : "px-2 text-xs",
                                alert.condition === "above" ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
                              )}>
                                {alert.condition === "above" ? `↑ ${t("alerts.above")}` : `↓ ${t("alerts.below")}`}
                              </span>
                              <span className={cn(isNativeApp ? "text-xs" : "")}>{formatPrice(alert.target_price)}</span>
                            </div>
                          </div>
                        </div>

                        <div className={cn(
                          "flex items-center",
                          isNativeApp ? "gap-2" : "gap-6"
                        )}>
                          {!isNativeApp && (
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground">{t("alerts.setAt")}</div>
                              <div className="text-sm text-foreground">{formatPrice(alert.current_price_at_creation)}</div>
                            </div>
                          )}
                          <div className="text-right">
                            {!isNativeApp && <div className="text-sm text-muted-foreground">{t("alerts.triggered")}</div>}
                            <div className={cn(
                              "text-foreground",
                              isNativeApp ? "text-xs" : "text-sm"
                            )}>{isNativeApp ? new Date(alert.triggered_at).toLocaleDateString() : formatDate(alert.triggered_at)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Delete Single Alert Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("alerts.deleteAlert") || "Delete Alert"}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("alerts.deleteAlertConfirm", { symbol: alertToDelete?.symbol }) || 
                `Are you sure you want to permanently delete the ${alertToDelete?.symbol} price alert? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel") || "Cancel"}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("common.delete") || "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear History Confirmation Dialog */}
      <AlertDialog open={clearHistoryDialogOpen} onOpenChange={setClearHistoryDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("alerts.clearHistoryTitle") || "Clear Alert History"}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("alerts.clearHistoryConfirm") || 
                "Are you sure you want to clear all triggered alerts from history? This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel") || "Cancel"}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmClearHistory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("alerts.clearHistory") || "Clear History"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </PullToRefresh>
  );
};

export default Alerts;
