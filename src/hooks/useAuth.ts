import { useState, useEffect, useCallback } from "react";

// User type compatible with components expecting Supabase-like user
export interface ClerkUserLike {
  id: string;
  email?: string;
  created_at?: string;
  primaryEmailAddress?: {
    emailAddress: string;
  };
}

// Check if Clerk is configured at module load time
const isClerkConfigured = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Timeout for Clerk to load (8 seconds) - falls back to demo mode if exceeded
const CLERK_LOAD_TIMEOUT = 8000;

// Demo mode auth state - used when Clerk is not configured or fails
const createDemoAuthState = () => ({
  user: null,
  session: null,
  loading: false,
  isSignedIn: false,
  isDemoMode: true,
  signUp: async (_email: string, _password: string) => {
    console.info("[Auth] Demo mode - sign up not available");
    return { error: null }; // Don't throw error, just silently succeed in demo mode
  },
  signIn: async (_email: string, _password: string) => {
    console.info("[Auth] Demo mode - sign in not available");
    return { error: null }; // Don't throw error, just silently succeed in demo mode
  },
  signOut: async () => ({ error: null }),
  resetPassword: async (_email: string): Promise<{ error: Error | null; rateLimited?: boolean; retryAfter?: number }> => 
    ({ error: null }), // Silent success in demo mode
  updatePassword: async (_newPassword: string) => ({ error: null }),
  updateEmail: async (_newEmail: string) => ({ error: null }),
});

/**
 * useAuth hook with Clerk integration
 * 
 * Provides authentication state with automatic demo mode fallback:
 * 1. If VITE_CLERK_PUBLISHABLE_KEY is not set -> Demo mode immediately
 * 2. If Clerk fails to load within 8 seconds -> Demo mode fallback
 * 3. Otherwise -> Full Clerk authentication
 * 
 * Demo mode allows users to explore the app without signing in.
 */
export const useAuth = () => {
  // State for demo mode and loading
  const [state, setState] = useState<{
    user: ClerkUserLike | null;
    isSignedIn: boolean;
    loading: boolean;
    isDemoMode: boolean;
    clerkLoaded: boolean;
  }>({
    user: null,
    isSignedIn: false,
    loading: isClerkConfigured, // Only loading if Clerk is configured
    isDemoMode: !isClerkConfigured, // Start in demo mode if not configured
    clerkLoaded: false,
  });

  // Clerk integration - dynamically imported to avoid issues when not configured
  const [clerkModules, setClerkModules] = useState<{
    useUser?: () => { user: unknown; isLoaded: boolean; isSignedIn?: boolean };
    useClerk?: () => { signOut: () => Promise<void> };
  }>({});

  // Load Clerk modules dynamically when configured
  useEffect(() => {
    if (!isClerkConfigured) return;

    let mounted = true;
    
    // Set up timeout for Clerk loading
    const timeout = setTimeout(() => {
      if (mounted && state.loading) {
        console.warn("[Auth] Clerk load timeout - switching to demo mode");
        setState(prev => ({
          ...prev,
          loading: false,
          isDemoMode: true,
        }));
      }
    }, CLERK_LOAD_TIMEOUT);

    // Dynamically import Clerk hooks
    import("@clerk/clerk-react").then(({ useUser, useClerk }) => {
      if (mounted) {
        setClerkModules({ useUser, useClerk });
      }
    }).catch((err) => {
      console.error("[Auth] Failed to load Clerk:", err);
      if (mounted) {
        setState(prev => ({
          ...prev,
          loading: false,
          isDemoMode: true,
        }));
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, [state.loading]);

  // When Clerk modules are loaded, we need to use them
  // This is done via a child component pattern to maintain hook rules
  useEffect(() => {
    if (!isClerkConfigured || !clerkModules.useUser) return;

    // Since we can't call hooks conditionally, we'll use polling approach
    // to check Clerk's state
    const checkClerkState = () => {
      try {
        // Access Clerk state through window if available
        const clerkInstance = (window as unknown as { Clerk?: { user?: unknown; loaded?: boolean } }).Clerk;
        if (clerkInstance?.loaded) {
          const user = clerkInstance.user as { 
            id?: string; 
            primaryEmailAddress?: { emailAddress?: string };
            createdAt?: Date;
          } | null;
          
          setState({
            user: user ? {
              id: user.id || "demo-user",
              email: user.primaryEmailAddress?.emailAddress,
              created_at: user.createdAt?.toISOString(),
              primaryEmailAddress: user.primaryEmailAddress
                ? { emailAddress: user.primaryEmailAddress.emailAddress || "" }
                : undefined,
            } : null,
            isSignedIn: !!user,
            loading: false,
            isDemoMode: false,
            clerkLoaded: true,
          });
          return true;
        }
      } catch {
        // Clerk not ready yet
      }
      return false;
    };

    // Poll for Clerk state
    if (checkClerkState()) return;
    
    const interval = setInterval(() => {
      if (checkClerkState()) {
        clearInterval(interval);
      }
    }, 200);

    // Cleanup and timeout
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (state.loading) {
        console.warn("[Auth] Clerk polling timeout - switching to demo mode");
        setState(prev => ({
          ...prev,
          loading: false,
          isDemoMode: true,
        }));
      }
    }, CLERK_LOAD_TIMEOUT);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [clerkModules.useUser, state.loading]);

  // Sign out function
  const signOut = useCallback(async () => {
    if (state.isDemoMode) {
      return { error: null };
    }
    try {
      const clerkInstance = (window as unknown as { Clerk?: { signOut?: () => Promise<void> } }).Clerk;
      if (clerkInstance?.signOut) {
        await clerkInstance.signOut();
      }
      setState(prev => ({
        ...prev,
        user: null,
        isSignedIn: false,
      }));
      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Sign out failed");
      return { error };
    }
  }, [state.isDemoMode]);

  // Return demo mode auth state if in demo mode
  if (state.isDemoMode) {
    return createDemoAuthState();
  }

  // Return Clerk-powered auth state
  return {
    user: state.user,
    session: state.isSignedIn ? { user: state.user } : null,
    loading: state.loading,
    isSignedIn: state.isSignedIn,
    isDemoMode: false,
    signUp: async (_email: string, _password: string) => {
      console.info("[Auth] Use Clerk's <SignUp /> component for sign up");
      return { error: null };
    },
    signIn: async (_email: string, _password: string) => {
      console.info("[Auth] Use Clerk's <SignIn /> component for sign in");
      return { error: null };
    },
    signOut,
    resetPassword: async (_email: string): Promise<{ error: Error | null; rateLimited?: boolean; retryAfter?: number }> => {
      console.info("[Auth] Use Clerk's built-in password reset flow");
      return { error: null };
    },
    updatePassword: async (_newPassword: string) => {
      console.info("[Auth] Use Clerk's <UserProfile /> component");
      return { error: null };
    },
    updateEmail: async (_newEmail: string) => {
      console.info("[Auth] Use Clerk's <UserProfile /> component");
      return { error: null };
    },
  };
};
