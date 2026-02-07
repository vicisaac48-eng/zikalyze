import { useWeb3Auth, type Web3User, type SessionData } from "./useWeb3Auth";

/**
 * User type compatible with existing components
 * Maps Web3 auth to the expected user interface
 */
export interface AuthUser {
  id: string;
  email?: string;
  username?: string;
  privateKey?: string;
  created_at?: string;
  primaryEmailAddress?: {
    emailAddress: string;
  };
}

/**
 * useAuth hook - Web3-style authentication with private key
 * 
 * Features:
 * - Sign up with username/password generates a unique private key
 * - Login with private key for Web3-style auth
 * - Login with username/password as alternative
 * - Encrypted local credential storage
 * - Session management
 * 
 * No external authentication providers required.
 */
export const useAuth = () => {
  const web3Auth = useWeb3Auth();

  // Map Web3 user to the expected user format
  const mapUser = (user: Web3User | null): AuthUser | null => {
    if (!user) return null;
    return {
      id: user.id,
      username: user.username,
      privateKey: user.privateKey,
      created_at: user.createdAt,
      // For compatibility with components expecting email
      email: `${user.username}@zikalyze.local`,
      primaryEmailAddress: {
        emailAddress: `${user.username}@zikalyze.local`,
      },
    };
  };

  return {
    user: mapUser(web3Auth.user),
    session: web3Auth.session ? { user: mapUser(web3Auth.user) } : null,
    loading: web3Auth.loading,
    isSignedIn: web3Auth.isSignedIn,
    isDemoMode: web3Auth.isDemoMode,
    
    // Sign up with username and password
    signUp: web3Auth.signUp,
    
    // Sign in with private key (primary Web3 method)
    signInWithPrivateKey: web3Auth.signInWithPrivateKey,
    
    // Sign in with username/password (alternative method)
    signInWithPassword: web3Auth.signInWithPassword,
    
    // Legacy signIn method - redirects to password-based sign in
    signIn: web3Auth.signInWithPassword,
    
    // Sign out
    signOut: web3Auth.signOut,
    
    // Recover private key using username and password
    recoverPrivateKey: web3Auth.recoverPrivateKey,
    
    // Legacy methods for compatibility (no-op)
    resetPassword: async (_email: string): Promise<{ error: Error | null; rateLimited?: boolean; retryAfter?: number }> => {
      console.info("[Auth] Password reset not available - use recoverPrivateKey instead");
      return { error: new Error("Use recoverPrivateKey with username and password") };
    },
    updatePassword: async (_newPassword: string) => {
      console.info("[Auth] Password update not supported in Web3 mode");
      return { error: new Error("Password update not supported") };
    },
    updateEmail: async (_newEmail: string) => {
      console.info("[Auth] Email update not supported in Web3 mode");
      return { error: new Error("Email update not supported") };
    },
  };
};

// Export types
export type { Web3User, SessionData };
