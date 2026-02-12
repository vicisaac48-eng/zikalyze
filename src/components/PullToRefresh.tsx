import { RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { cn } from "@/lib/utils";

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void> | void;
  disabled?: boolean;
  className?: string;
}

/**
 * Native-style pull-to-refresh wrapper component.
 * Only active on Android native app and PWA, transparent on web.
 */
export function PullToRefresh({
  children,
  onRefresh,
  disabled = false,
  className,
}: PullToRefreshProps) {
  const { t } = useTranslation();
  const {
    pullDistance,
    isRefreshing,
    isPulling,
    canRefresh,
    containerRef,
    contentStyle,
    indicatorStyle,
  } = usePullToRefresh({
    onRefresh,
    disabled,
    threshold: 80,
    maxPull: 150,
    resistance: 0.5,
  });

  return (
    <>
      {/* Pull-to-refresh indicator - only visible on native app when pulling */}
      {/* Fixed elements stay outside the transform to prevent movement */}
      <div
        className="pointer-events-none fixed left-0 right-0 z-50 flex justify-center"
        style={{
          top: "calc(env(safe-area-inset-top, 0px) + var(--header-height-mobile, 2.25rem) + 8px)",
          ...indicatorStyle,
        }}
      >
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full shadow-lg",
            canRefresh || isRefreshing
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground",
            isRefreshing && "animate-spin"
          )}
        >
          <RefreshCw className="h-5 w-5" />
        </div>
      </div>

      {/* Loading indicator text when refreshing */}
      {isRefreshing && (
        <div
          className="pointer-events-none fixed left-0 right-0 z-40 flex justify-center"
          style={{
            top: "calc(env(safe-area-inset-top, 0px) + var(--header-height-mobile, 2.25rem) + 60px)",
          }}
        >
          <span className="text-xs text-primary font-medium">{t("common.refreshing", "Refreshing...")}</span>
        </div>
      )}

      {/* Release to refresh hint */}
      {canRefresh && !isRefreshing && isPulling && (
        <div
          className="pointer-events-none fixed left-0 right-0 z-40 flex justify-center"
          style={{
            top: "calc(env(safe-area-inset-top, 0px) + var(--header-height-mobile, 2.25rem) + 60px)",
          }}
        >
          <span className="text-xs text-primary font-medium">{t("common.releaseToRefresh", "Release to refresh")}</span>
        </div>
      )}

      {/* Pull down hint when starting to pull */}
      {!canRefresh && !isRefreshing && isPulling && pullDistance > 10 && (
        <div
          className="pointer-events-none fixed left-0 right-0 z-40 flex justify-center"
          style={{
            top: "calc(env(safe-area-inset-top, 0px) + var(--header-height-mobile, 2.25rem) + 60px)",
          }}
        >
          <span className="text-xs text-muted-foreground">{t("common.pullToRefresh", "Pull down to refresh")}</span>
        </div>
      )}

      {/* Content wrapper - only scrollable content gets the transform, fixed elements are children */}
      <div
        ref={containerRef as React.RefObject<HTMLDivElement>}
        className={cn("relative min-h-screen overflow-y-auto", className)}
        style={{ 
          touchAction: 'pan-y',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <div style={contentStyle}>
          {children}
        </div>
      </div>
    </>
  );
}

export default PullToRefresh;
