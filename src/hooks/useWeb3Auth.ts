import { useState, useEffect, useCallback } from "react";
import {
  generatePrivateKeyFromUsername,
  storeCredentials,
  findCredentialsByUsername,
  findCredentialsByPrivateKey,
  verifyPassword,
  createSession,
  getSession,
  clearSession,
  parsePrivateKey,
  type SessionData,
  type StoredCredentials
} from "@/lib/crypto";

/**
 * Web3-style user interface
 */
export interface Web3User {
  id: string;
  username: string;
  privateKey: string;
  createdAt: string;
}

/**
 * Auth state interface
 */
export interface Web3AuthState {
  user: Web3User | null;
  session: SessionData | null;
  loading: boolean;
  isSignedIn: boolean;
  isDemoMode: boolean;
}

/**
 * Sign up result
 */
export interface SignUpResult {
  error: Error | null;
  privateKey?: string;
  user?: Web3User;
}

/**
 * Sign in result
 */
export interface SignInResult {
  error: Error | null;
  user?: Web3User;
}

/**
 * useWeb3Auth hook - Web3-style authentication with private key generation
 * 
 * Features:
 * - Generate private key from username during signup
 * - Login with private key
 * - Encrypted credential storage
 * - Session management
 */
export const useWeb3Auth = () => {
  const [state, setState] = useState<Web3AuthState>({
    user: null,
    session: null,
    loading: true,
    isSignedIn: false,
    isDemoMode: false,
  });

  // Initialize - check for existing session
  useEffect(() => {
    const initAuth = async () => {
      try {
        const session = await getSession();
        if (session) {
          setState({
            user: {
              id: session.userId,
              username: session.username,
              privateKey: session.privateKey,
              createdAt: session.createdAt,
            },
            session,
            loading: false,
            isSignedIn: true,
            isDemoMode: false,
          });
        } else {
          setState(prev => ({
            ...prev,
            loading: false,
          }));
        }
      } catch (error) {
        console.error("[Web3Auth] Init error:", error);
        setState(prev => ({
          ...prev,
          loading: false,
        }));
      }
    };

    initAuth();
  }, []);

  /**
   * Sign up with username and password
   * Generates a private key from the username
   */
  const signUp = useCallback(async (
    username: string,
    password: string
  ): Promise<SignUpResult> => {
    try {
      // Validate inputs
      if (!username || username.trim().length < 3) {
        return { error: new Error("Username must be at least 3 characters") };
      }
      if (!password || password.length < 6) {
        return { error: new Error("Password must be at least 6 characters") };
      }

      // Check if username already exists
      const existing = await findCredentialsByUsername(username);
      if (existing) {
        return { error: new Error("Username already exists. Please login or choose a different username.") };
      }

      // Generate private key from username
      const privateKey = await generatePrivateKeyFromUsername(username);

      // Store encrypted credentials
      await storeCredentials(username, password, privateKey);

      // Create session
      const session = await createSession(username, privateKey);

      const user: Web3User = {
        id: session.userId,
        username: username.toLowerCase().trim(),
        privateKey,
        createdAt: session.createdAt,
      };

      setState({
        user,
        session,
        loading: false,
        isSignedIn: true,
        isDemoMode: false,
      });

      return { error: null, privateKey, user };
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Sign up failed");
      return { error };
    }
  }, []);

  /**
   * Sign in with private key
   */
  const signInWithPrivateKey = useCallback(async (
    privateKey: string
  ): Promise<SignInResult> => {
    try {
      // Parse the private key (remove formatting if present)
      const parsedKey = parsePrivateKey(privateKey.trim());

      if (!parsedKey || parsedKey.length !== 64) {
        return { error: new Error("Invalid private key format") };
      }

      // Find credentials by private key
      const credentials = await findCredentialsByPrivateKey(parsedKey);
      if (!credentials) {
        return { error: new Error("Private key not found. Please check your key or sign up first.") };
      }

      // Create session
      const session = await createSession(credentials.username, parsedKey);

      const user: Web3User = {
        id: session.userId,
        username: credentials.username,
        privateKey: parsedKey,
        createdAt: credentials.createdAt,
      };

      setState({
        user,
        session,
        loading: false,
        isSignedIn: true,
        isDemoMode: false,
      });

      return { error: null, user };
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Sign in failed");
      return { error };
    }
  }, []);

  /**
   * Sign in with username and password
   */
  const signInWithPassword = useCallback(async (
    username: string,
    password: string
  ): Promise<SignInResult> => {
    try {
      // Find credentials by username
      const credentials = await findCredentialsByUsername(username);
      if (!credentials) {
        return { error: new Error("Account not found. Please sign up first.") };
      }

      // Verify password
      const isValid = await verifyPassword(password, credentials.passwordHash);
      if (!isValid) {
        return { error: new Error("Invalid password") };
      }

      // Create session
      const session = await createSession(credentials.username, credentials.privateKey);

      const user: Web3User = {
        id: session.userId,
        username: credentials.username,
        privateKey: credentials.privateKey,
        createdAt: credentials.createdAt,
      };

      setState({
        user,
        session,
        loading: false,
        isSignedIn: true,
        isDemoMode: false,
      });

      return { error: null, user };
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Sign in failed");
      return { error };
    }
  }, []);

  /**
   * Sign out - clear session
   */
  const signOut = useCallback(async (): Promise<{ error: Error | null }> => {
    try {
      clearSession();
      setState({
        user: null,
        session: null,
        loading: false,
        isSignedIn: false,
        isDemoMode: false,
      });
      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Sign out failed");
      return { error };
    }
  }, []);

  /**
   * Recover private key using username and password
   */
  const recoverPrivateKey = useCallback(async (
    username: string,
    password: string
  ): Promise<{ error: Error | null; privateKey?: string }> => {
    try {
      // Find credentials by username
      const credentials = await findCredentialsByUsername(username);
      if (!credentials) {
        return { error: new Error("Account not found") };
      }

      // Verify password
      const isValid = await verifyPassword(password, credentials.passwordHash);
      if (!isValid) {
        return { error: new Error("Invalid password") };
      }

      return { error: null, privateKey: credentials.privateKey };
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Recovery failed");
      return { error };
    }
  }, []);

  return {
    ...state,
    signUp,
    signInWithPrivateKey,
    signInWithPassword,
    signOut,
    recoverPrivateKey,
  };
};

// Export types
export type { StoredCredentials, SessionData };
