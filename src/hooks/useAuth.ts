import { useUser, useClerk, useAuth as useClerkAuth } from "@clerk/clerk-react";

// User type compatible with both Clerk and components expecting Supabase-like user
// Note: Both 'email' and 'primaryEmailAddress' are provided for backward compatibility
// with code that may expect either Supabase-style (email) or Clerk-style (primaryEmailAddress) format
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

// Hook implementation
export const useAuth = () => {
  // When Clerk is not configured, return a static fallback
  // This avoids calling Clerk hooks which would throw without ClerkProvider
  if (!isClerkConfigured) {
    return {
      user: null,
      session: null,
      loading: false,
      isSignedIn: false,
      signUp: async (_email: string, _password: string) => {
        console.warn("[useAuth] Clerk is not configured. Set VITE_CLERK_PUBLISHABLE_KEY.");
        return { error: new Error("Clerk is not configured") };
      },
      signIn: async (_email: string, _password: string) => {
        console.warn("[useAuth] Clerk is not configured. Set VITE_CLERK_PUBLISHABLE_KEY.");
        return { error: new Error("Clerk is not configured") };
      },
      signOut: async () => ({ error: null }),
      resetPassword: async (_email: string): Promise<{ error: Error | null; rateLimited?: boolean; retryAfter?: number }> => 
        ({ error: new Error("Clerk is not configured") }),
      updatePassword: async (_newPassword: string) => 
        ({ error: new Error("Clerk is not configured") }),
      updateEmail: async (_newEmail: string) => 
        ({ error: new Error("Clerk is not configured") }),
    };
  }

  // Clerk hooks - only called when Clerk is configured
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { signOut: clerkSignOut } = useClerk();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { isLoaded: authLoaded } = useClerkAuth();

  // Map Clerk user to a compatible format
  const user: ClerkUserLike | null = clerkUser
    ? {
        id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress,
        created_at: clerkUser.createdAt ? clerkUser.createdAt.toISOString() : undefined,
        primaryEmailAddress: clerkUser.primaryEmailAddress
          ? { emailAddress: clerkUser.primaryEmailAddress.emailAddress }
          : undefined,
      }
    : null;

  const loading = !isLoaded || !authLoaded;

  // Clerk handles sign up through its components, these are stubs for compatibility
  const signUp = async (_email: string, _password: string) => {
    console.warn("[useAuth] signUp() is deprecated. Use Clerk's <SignUp /> component instead.");
    return { error: new Error("Use Clerk SignUp component instead") };
  };

  const signIn = async (_email: string, _password: string) => {
    console.warn("[useAuth] signIn() is deprecated. Use Clerk's <SignIn /> component instead.");
    return { error: new Error("Use Clerk SignIn component instead") };
  };

  const signOut = async () => {
    try {
      await clerkSignOut();
      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error("An unexpected error occurred during sign out");
      return { error };
    }
  };

  const resetPassword = async (_email: string): Promise<{ error: Error | null; rateLimited?: boolean; retryAfter?: number }> => {
    console.warn("[useAuth] resetPassword() is deprecated. Use Clerk's built-in password reset flow instead.");
    return { error: new Error("Use Clerk's built-in password reset flow") };
  };

  const updatePassword = async (_newPassword: string) => {
    console.warn("[useAuth] updatePassword() is deprecated. Use Clerk's <UserProfile /> component instead.");
    return { error: new Error("Use Clerk's built-in password update flow") };
  };

  const updateEmail = async (_newEmail: string) => {
    console.warn("[useAuth] updateEmail() is deprecated. Use Clerk's <UserProfile /> component instead.");
    return { error: new Error("Use Clerk's built-in email update flow") };
  };

  return {
    user,
    session: isSignedIn ? { user } : null,
    loading,
    isSignedIn,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateEmail,
  };
};
