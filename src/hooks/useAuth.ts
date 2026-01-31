import { useState, useEffect, useCallback } from "react";
import { Wallet, keccak256, toUtf8Bytes, formatEther, JsonRpcProvider } from "ethers";

// User type for Web3 wallet authentication
export interface Web3User {
  id: string; // wallet address
  address: string;
  shortAddress: string;
  username: string;
  balance?: string;
  created_at?: string;
}

// Auth state type
interface AuthState {
  user: Web3User | null;
  isSignedIn: boolean;
  loading: boolean;
  isProcessing: boolean;
}

// Storage keys
const WALLET_DATA_KEY = "zikalyze_wallet_data";

// Shorten wallet address for display
const shortenAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Derive private key from username and password (deterministic)
const derivePrivateKey = (username: string, password: string): string => {
  // Create a deterministic seed from username + password
  const seed = `${username.toLowerCase()}:${password}:zikalyze-v1`;
  // Use keccak256 to generate a 32-byte private key
  const privateKey = keccak256(toUtf8Bytes(seed));
  return privateKey;
};

// Create wallet from private key
const createWalletFromKey = (privateKey: string): Wallet => {
  return new Wallet(privateKey);
};

/**
 * useAuth hook with Web3 wallet authentication
 * 
 * Provides authentication via deterministic wallet generation:
 * - Sign up: Creates wallet from username + password
 * - Sign in: Uses private key directly or recovers with username + password
 */
export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isSignedIn: false,
    loading: true,
    isProcessing: false,
  });

  // Get wallet balance (optional, may fail without RPC)
  const getBalance = useCallback(async (address: string): Promise<string | undefined> => {
    try {
      // Use a public Ethereum RPC
      const provider = new JsonRpcProvider("https://eth.llamarpc.com");
      const balance = await provider.getBalance(address);
      return formatEther(balance);
    } catch (error) {
      console.warn("[Auth] Failed to get balance:", error);
      return undefined;
    }
  }, []);

  // Load saved wallet on mount
  useEffect(() => {
    const loadSavedWallet = async () => {
      try {
        const savedData = localStorage.getItem(WALLET_DATA_KEY);
        if (savedData) {
          const { address, username, privateKey } = JSON.parse(savedData);
          // Verify the wallet can be recreated
          const wallet = createWalletFromKey(privateKey);
          if (wallet.address === address) {
            const balance = await getBalance(address);
            setState({
              user: {
                id: address,
                address,
                shortAddress: shortenAddress(address),
                username,
                balance,
              },
              isSignedIn: true,
              loading: false,
              isProcessing: false,
            });
            return;
          }
        }
      } catch (error) {
        console.warn("[Auth] Failed to load saved wallet:", error);
        localStorage.removeItem(WALLET_DATA_KEY);
      }
      setState(prev => ({ ...prev, loading: false }));
    };

    loadSavedWallet();
  }, [getBalance]);

  // Sign up with username and password
  const signUp = useCallback(async (username: string, password: string): Promise<{ 
    error: Error | null; 
    privateKey?: string;
    address?: string;
  }> => {
    if (!username || username.length < 3) {
      return { error: new Error("Username must be at least 3 characters") };
    }
    if (!password || password.length < 8) {
      return { error: new Error("Password must be at least 8 characters") };
    }

    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      // Derive private key from username and password
      const privateKey = derivePrivateKey(username, password);
      const wallet = createWalletFromKey(privateKey);
      const address = wallet.address;
      const balance = await getBalance(address);

      // Save wallet data
      localStorage.setItem(WALLET_DATA_KEY, JSON.stringify({
        address,
        username,
        privateKey,
      }));

      setState({
        user: {
          id: address,
          address,
          shortAddress: shortenAddress(address),
          username,
          balance,
          created_at: new Date().toISOString(),
        },
        isSignedIn: true,
        loading: false,
        isProcessing: false,
      });

      return { error: null, privateKey, address };
    } catch (error) {
      setState(prev => ({ ...prev, isProcessing: false }));
      const err = error instanceof Error ? error : new Error("Failed to create wallet");
      return { error: err };
    }
  }, [getBalance]);

  // Sign in with private key
  const signInWithKey = useCallback(async (privateKey: string, username?: string): Promise<{ error: Error | null }> => {
    if (!privateKey || privateKey.length !== 66) {
      return { error: new Error("Invalid private key format") };
    }

    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      const wallet = createWalletFromKey(privateKey);
      const address = wallet.address;
      const balance = await getBalance(address);

      // Save wallet data
      localStorage.setItem(WALLET_DATA_KEY, JSON.stringify({
        address,
        username: username || "User",
        privateKey,
      }));

      setState({
        user: {
          id: address,
          address,
          shortAddress: shortenAddress(address),
          username: username || "User",
          balance,
        },
        isSignedIn: true,
        loading: false,
        isProcessing: false,
      });

      return { error: null };
    } catch (error) {
      setState(prev => ({ ...prev, isProcessing: false }));
      const err = error instanceof Error ? error : new Error("Invalid private key");
      return { error: err };
    }
  }, [getBalance]);

  // Recover wallet with username and password
  const recoverWallet = useCallback(async (username: string, password: string): Promise<{ 
    error: Error | null;
    privateKey?: string;
    address?: string;
  }> => {
    // Recovery is the same as sign up - deterministic key generation
    return signUp(username, password);
  }, [signUp]);

  // Sign out function
  const signOut = useCallback(async (): Promise<{ error: Error | null }> => {
    localStorage.removeItem(WALLET_DATA_KEY);
    setState({
      user: null,
      isSignedIn: false,
      loading: false,
      isProcessing: false,
    });
    return { error: null };
  }, []);

  // Get current private key (for display/export)
  const getPrivateKey = useCallback((): string | null => {
    try {
      const savedData = localStorage.getItem(WALLET_DATA_KEY);
      if (savedData) {
        const { privateKey } = JSON.parse(savedData);
        return privateKey;
      }
    } catch {
      // Ignore
    }
    return null;
  }, []);

  return {
    user: state.user,
    session: state.isSignedIn ? { user: state.user } : null,
    loading: state.loading,
    isSignedIn: state.isSignedIn,
    isProcessing: state.isProcessing,
    isDemoMode: !state.isSignedIn,
    signUp,
    signInWithKey,
    recoverWallet,
    signOut,
    getPrivateKey,
    // Legacy compatibility methods
    signIn: async () => ({ error: null }),
    resetPassword: async (): Promise<{ error: Error | null; rateLimited?: boolean; retryAfter?: number }> => ({ error: null }),
    updatePassword: async () => ({ error: null }),
    updateEmail: async () => ({ error: null }),
  };
};
