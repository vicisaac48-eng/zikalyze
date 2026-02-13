import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouteRestoration } from "@/hooks/useRouteRestoration";

/**
 * Component to manage route restoration for native mobile apps.
 * Must be placed inside the Router context but outside Routes.
 */
export function RouteManager({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useAuth();
  
  // Use the route restoration hook
  useRouteRestoration(isSignedIn);
  
  return <>{children}</>;
}
