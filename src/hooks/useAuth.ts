import { useUser, useClerk, useAuth as useClerkAuth } from "@clerk/clerk-react";

// User type compatible with both Clerk and components expecting Supabase-like user
export interface ClerkUserLike {
  id: string;
  email?: string;
  created_at?: string;
  primaryEmailAddress?: {
    emailAddress: string;
  };
}

export const useAuth = () => {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { signOut: clerkSignOut } = useClerk();
  const { isLoaded: authLoaded } = useClerkAuth();

  // Map Clerk user to a compatible format
  const user: ClerkUserLike | null = clerkUser
    ? {
        id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress,
        created_at: clerkUser.createdAt?.toISOString(),
        primaryEmailAddress: clerkUser.primaryEmailAddress
          ? { emailAddress: clerkUser.primaryEmailAddress.emailAddress }
          : undefined,
      }
    : null;

  const loading = !isLoaded || !authLoaded;

  // Clerk handles sign up through its components, these are stubs for compatibility
  const signUp = async (_email: string, _password: string) => {
    // Clerk handles sign up via <SignUp /> component
    // This is a stub for API compatibility
    return { error: new Error("Use Clerk SignUp component instead") };
  };

  const signIn = async (_email: string, _password: string) => {
    // Clerk handles sign in via <SignIn /> component
    // This is a stub for API compatibility
    return { error: new Error("Use Clerk SignIn component instead") };
  };

  const signOut = async () => {
    try {
      await clerkSignOut();
      return { error: null };
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error("An unexpected error occurred during sign out");
      return { error };
    }
  };

  // Clerk handles password reset through its components
  const resetPassword = async (
    _email: string
  ): Promise<{
    error: Error | null;
    rateLimited?: boolean;
    retryAfter?: number;
  }> => {
    // Clerk handles password reset via its built-in UI
    return { error: new Error("Use Clerk's built-in password reset flow") };
  };

  // Clerk handles password updates through user profile
  const updatePassword = async (_newPassword: string) => {
    // Password updates are handled via Clerk's user profile
    return { error: new Error("Use Clerk's built-in password update flow") };
  };

  // Clerk handles email updates through user profile
  const updateEmail = async (_newEmail: string) => {
    // Email updates are handled via Clerk's user profile
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
