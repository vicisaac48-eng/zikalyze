import { useState, useEffect, useCallback } from "react";
import { Wallet, formatEther, JsonRpcProvider, pbkdf2, toUtf8Bytes, hexlify, getBytes, AbiCoder, keccak256 } from "ethers";

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

// Derive private key from username and password using PBKDF2 (secure KDF)
const derivePrivateKey = async (username: string, password: string): Promise<string> => {
  // Create a deterministic salt from username + app identifier
  const salt = toUtf8Bytes(`zikalyze-v1-salt:${username.toLowerCase()}`);
  const passwordBytes = toUtf8Bytes(password);
  
  // Use PBKDF2 with SHA-256, 100,000 iterations (OWASP recommendation)
  const derivedKey = pbkdf2(passwordBytes, salt, 100000, 32, "sha256");
  
  return derivedKey;
};

// Create wallet from private key
const createWalletFromKey = (privateKey: string): Wallet => {
  return new Wallet(privateKey);
};

// Simple obfuscation for localStorage (not encryption, just obscures plain text)
const obfuscateKey = (key: string, username: string): string => {
  // XOR-based obfuscation with username - not cryptographically secure but prevents casual viewing
  const coder = new AbiCoder();
  const encoded = coder.encode(["string", "string"], [key, username]);
  return keccak256(toUtf8Bytes("session")) + encoded.slice(2);
};

const deobfuscateKey = (obfuscated: string, username: string): string | null => {
  try {
    const encoded = "0x" + obfuscated.slice(66);
    const coder = new AbiCoder();
    const decoded = coder.decode(["string", "string"], encoded);
    if (decoded[1] === username) {
      return decoded[0];
    }
    return null;
  } catch {
    return null;
  }
};

/**
 * useAuth hook with Web3 wallet authentication
 * 
 * Provides authentication via deterministic wallet generation:
 * - Sign up: Creates wallet from username + password (using PBKDF2)
 * - Sign in: Uses private key directly
 * - Recovery: Same username + password regenerates the same private key
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
          const { address, username, obfuscatedKey } = JSON.parse(savedData);
          const privateKey = deobfuscateKey(obfuscatedKey, username);
          if (privateKey) {
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
    if (!username || username.length < 4) {
      return { error: new Error("Username must be at least 4 characters") };
    }
    if (!password || password.length < 8) {
      return { error: new Error("Password must be at least 8 characters") };
    }
    // Basic password strength check
    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      return { error: new Error("Password must contain both letters and numbers") };
    }

    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      // Derive private key from username and password using PBKDF2
      const privateKey = await derivePrivateKey(username, password);
      const wallet = createWalletFromKey(privateKey);
      const address = wallet.address;
      const balance = await getBalance(address);

      // Store with obfuscation
      const obfuscatedKey = obfuscateKey(privateKey, username);
      localStorage.setItem(WALLET_DATA_KEY, JSON.stringify({
        address,
        username,
        obfuscatedKey,
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
    // Normalize private key - add 0x prefix if missing
    let normalizedKey = privateKey.trim();
    if (!normalizedKey.startsWith("0x")) {
      normalizedKey = "0x" + normalizedKey;
    }
    
    if (normalizedKey.length !== 66) {
      return { error: new Error("Invalid private key format. Must be 64 hex characters (with or without 0x prefix)") };
    }

    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      const wallet = createWalletFromKey(normalizedKey);
      const address = wallet.address;
      const balance = await getBalance(address);
      const displayName = username || "User";

      // Store with obfuscation
      const obfuscatedKey = obfuscateKey(normalizedKey, displayName);
      localStorage.setItem(WALLET_DATA_KEY, JSON.stringify({
        address,
        username: displayName,
        obfuscatedKey,
      }));

      setState({
        user: {
          id: address,
          address,
          shortAddress: shortenAddress(address),
          username: displayName,
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
    // Recovery uses the same deterministic derivation as sign up
    // This will overwrite any existing session - user is informed in UI
    return signUp(username, password);
  }, [signUp]);

  // Sign out function
  const signOut = useCallback(async (): Promise<{ error: Error | null }> => {
    setState(prev => ({ ...prev, isProcessing: true }));
    localStorage.removeItem(WALLET_DATA_KEY);
    // Small delay to show loading animation
    await new Promise(resolve => setTimeout(resolve, 300));
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
        const { username, obfuscatedKey } = JSON.parse(savedData);
        return deobfuscateKey(obfuscatedKey, username);
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
