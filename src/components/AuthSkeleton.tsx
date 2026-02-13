import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";

/**
 * Skeleton loading state for authentication page
 * Provides professional loading feedback on native mobile apps
 */
const AuthSkeleton = () => {
  return (
    <main className="h-full min-h-[100dvh] overflow-y-auto bg-background flex items-start sm:items-center justify-center p-3 pb-6 sm:p-4 safe-area-inset-top">
      {/* Background effects - reduced on mobile for performance */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-10 left-5 w-48 h-48 bg-primary/10 rounded-full blur-3xl animate-pulse-slow sm:top-20 sm:left-10 sm:w-72 sm:h-72" />
        <div className="absolute bottom-10 right-5 w-56 h-56 bg-accent/10 rounded-full blur-3xl animate-pulse-slow sm:bottom-20 sm:right-10 sm:w-96 sm:h-96 [animation-delay:2s]" />
      </div>

      <div className="relative z-10 w-full max-w-md mt-4 sm:mt-0">
        {/* Logo - responsive sizing */}
        <div className="flex items-center justify-center gap-2 mb-6 sm:gap-3 sm:mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary sm:h-14 sm:w-14">
            <TrendingUp className="h-6 w-6 text-primary-foreground sm:h-7 sm:w-7" />
          </div>
          <span className="text-2xl font-bold text-foreground sm:text-3xl">Zikalyze</span>
        </div>

        {/* Auth Card Skeleton - responsive padding */}
        <div className="rounded-xl border border-border bg-card/80 backdrop-blur-xl p-4 shadow-2xl sm:rounded-2xl sm:p-6">
          {/* Tabs skeleton */}
          <div className="grid grid-cols-2 gap-2 mb-4 sm:mb-6 p-1 bg-muted rounded-lg">
            <Skeleton className="h-9 w-full rounded-md" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>

          {/* Form skeleton */}
          <div className="space-y-4">
            {/* Input field 1 */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>

            {/* Input field 2 */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>

            {/* Input field 3 (conditional) */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>

            {/* Submit button */}
            <Skeleton className="h-10 w-full rounded-md" />
          </div>

          {/* Divider */}
          <div className="relative my-4 sm:my-6">
            <Skeleton className="h-px w-full" />
          </div>

          {/* Demo mode section */}
          <div className="text-center py-4 space-y-3">
            <Skeleton className="h-8 w-8 mx-auto rounded-full" />
            <Skeleton className="h-5 w-32 mx-auto" />
            <Skeleton className="h-4 w-48 mx-auto" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>

          {/* Footer text */}
          <Skeleton className="h-3 w-full mx-auto mt-4 sm:mt-6" />
        </div>
      </div>
    </main>
  );
};

export default AuthSkeleton;
