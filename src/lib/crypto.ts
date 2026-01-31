/**
 * Web3-style cryptographic utilities for authentication
 * 
 * This module provides:
 * - Private key generation from username (deterministic)
 * - Password-based encryption for credential storage
 * - Secure local storage with encryption
 * 
 * SECURITY NOTE: This is a client-side only authentication system.
 * Credentials are encrypted in localStorage for defense-in-depth against
 * casual access. For production systems with server backends, use proper
 * key management systems.
 */

// Constants for encryption and hashing
const SALT_PREFIX = "zikalyze-web3-auth-v1";
const MASTER_STORAGE_KEY = "zikalyze-master-storage-key";
const SESSION_ENCRYPTION_KEY = "zikalyze-session-key";

// Convert string to Uint8Array
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

/**
 * Generate a deterministic private key from a username
 * Uses SHA-256 to create a 256-bit key from the username
 */
export async function generatePrivateKeyFromUsername(username: string): Promise<string> {
  // Validate input
  if (!username || typeof username !== 'string') {
    throw new Error("Username is required");
  }
  
  // Normalize username (lowercase, trim)
  const normalizedUsername = username.toLowerCase().trim();
  
  if (normalizedUsername.length === 0) {
    throw new Error("Username cannot be empty");
  }
  
  // Create a deterministic seed by hashing username with a salt
  const data = textEncoder.encode(`${SALT_PREFIX}:${normalizedUsername}`);
  
  // Hash to create the private key
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  
  // Convert to hex string (64 characters for 256-bit key)
  const privateKey = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return privateKey;
}

/**
 * Derive an encryption key from a password using PBKDF2
 */
async function deriveKeyFromPassword(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt data using AES-GCM with a password-derived key
 */
export async function encryptWithPassword(data: string, password: string): Promise<string> {
  // Validate input
  if (!password || password.length === 0) {
    throw new Error("Password cannot be empty");
  }
  
  // Generate random salt and IV
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Derive encryption key from password
  const key = await deriveKeyFromPassword(password, salt);
  
  // Encrypt the data
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    textEncoder.encode(data)
  );
  
  // Combine salt + iv + encrypted data and encode as base64
  const combined = new Uint8Array(salt.length + iv.length + encryptedBuffer.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encryptedBuffer), salt.length + iv.length);
  
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt data using AES-GCM with a password-derived key
 */
export async function decryptWithPassword(encryptedData: string, password: string): Promise<string> {
  // Decode from base64
  const combined = new Uint8Array(
    atob(encryptedData).split('').map(c => c.charCodeAt(0))
  );
  
  // Extract salt, iv, and encrypted data
  const salt = combined.slice(0, 16);
  const iv = combined.slice(16, 28);
  const encrypted = combined.slice(28);
  
  // Derive decryption key from password
  const key = await deriveKeyFromPassword(password, salt);
  
  // Decrypt the data
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    encrypted
  );
  
  return textDecoder.decode(decryptedBuffer);
}

/**
 * Hash a password for storage (not reversible)
 */
export async function hashPassword(password: string): Promise<string> {
  const data = textEncoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify a password against a stored hash
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const hash = await hashPassword(password);
  return hash === storedHash;
}

/**
 * User credentials interface
 */
export interface StoredCredentials {
  username: string;
  privateKey: string;
  passwordHash: string;
  createdAt: string;
}

/**
 * Storage key for encrypted credentials
 */
const STORAGE_KEY = 'zikalyze_encrypted_credentials';
const SESSION_KEY = 'zikalyze_session';

/**
 * Store encrypted credentials in localStorage
 */
export async function storeCredentials(
  username: string,
  password: string,
  privateKey: string
): Promise<void> {
  // Get existing credentials or create new array
  let allCredentials: StoredCredentials[] = [];
  
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) {
      // Try to decrypt with a master key
      const decrypted = await decryptWithPassword(existing, MASTER_STORAGE_KEY);
      allCredentials = JSON.parse(decrypted);
    }
  } catch {
    // If decryption fails, start fresh
    allCredentials = [];
  }
  
  // Hash the password for storage
  const passwordHash = await hashPassword(password);
  
  // Check if username already exists
  const existingIndex = allCredentials.findIndex(c => c.username.toLowerCase() === username.toLowerCase());
  
  const newCredential: StoredCredentials = {
    username: username.toLowerCase().trim(),
    privateKey,
    passwordHash,
    createdAt: new Date().toISOString()
  };
  
  if (existingIndex >= 0) {
    // Update existing
    allCredentials[existingIndex] = newCredential;
  } else {
    // Add new
    allCredentials.push(newCredential);
  }
  
  // Encrypt and store
  const encrypted = await encryptWithPassword(
    JSON.stringify(allCredentials),
    MASTER_STORAGE_KEY
  );
  
  localStorage.setItem(STORAGE_KEY, encrypted);
}

/**
 * Find stored credentials by username
 */
export async function findCredentialsByUsername(username: string): Promise<StoredCredentials | null> {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) return null;
    
    const decrypted = await decryptWithPassword(existing, MASTER_STORAGE_KEY);
    const allCredentials: StoredCredentials[] = JSON.parse(decrypted);
    
    return allCredentials.find(c => c.username.toLowerCase() === username.toLowerCase().trim()) || null;
  } catch {
    return null;
  }
}

/**
 * Find stored credentials by private key
 */
export async function findCredentialsByPrivateKey(privateKey: string): Promise<StoredCredentials | null> {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) return null;
    
    const decrypted = await decryptWithPassword(existing, MASTER_STORAGE_KEY);
    const allCredentials: StoredCredentials[] = JSON.parse(decrypted);
    
    return allCredentials.find(c => c.privateKey === privateKey) || null;
  } catch {
    return null;
  }
}

/**
 * Session data interface
 */
export interface SessionData {
  userId: string;
  username: string;
  privateKey: string;
  createdAt: string;
  expiresAt: string;
}

/**
 * Create a user session (stored in sessionStorage for security)
 */
export async function createSession(username: string, privateKey: string): Promise<SessionData> {
  const sessionData: SessionData = {
    userId: privateKey.substring(0, 16), // Use first 16 chars of key as userId
    username,
    privateKey,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hour expiry
  };
  
  // Encrypt session data
  const encrypted = await encryptWithPassword(
    JSON.stringify(sessionData),
    SESSION_ENCRYPTION_KEY
  );
  
  sessionStorage.setItem(SESSION_KEY, encrypted);
  
  return sessionData;
}

/**
 * Get current session
 */
export async function getSession(): Promise<SessionData | null> {
  try {
    const encrypted = sessionStorage.getItem(SESSION_KEY);
    if (!encrypted) return null;
    
    const decrypted = await decryptWithPassword(encrypted, SESSION_ENCRYPTION_KEY);
    const session: SessionData = JSON.parse(decrypted);
    
    // Check if session has expired
    if (new Date(session.expiresAt) < new Date()) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    
    return session;
  } catch {
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

/**
 * Clear current session
 */
export function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

/**
 * Clear all account data from local storage
 * This removes all stored credentials and sessions
 */
export function clearAccountData(): void {
  // Clear session
  sessionStorage.removeItem(SESSION_KEY);
  
  // Clear stored credentials
  localStorage.removeItem(STORAGE_KEY);
  
  // Clear any other Zikalyze-related data
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('zikalyze')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
}

/**
 * Format private key for display (show in groups)
 */
export function formatPrivateKey(key: string): string {
  // Format as groups of 8 characters separated by dashes
  return key.match(/.{1,8}/g)?.join('-') || key;
}

/**
 * Parse formatted private key back to raw format
 */
export function parsePrivateKey(formattedKey: string): string {
  return formattedKey.replace(/-/g, '');
}
