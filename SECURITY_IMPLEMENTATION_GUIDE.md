# Comprehensive Security Implementation Guide

## Overview

This document provides complete details on the professional security system implemented for Zikalyze, including username uniqueness, secure wallet generation, bot protection, and privacy encryption.

## Table of Contents

1. [Username Uniqueness System](#username-uniqueness-system)
2. [Secure Wallet Generation](#secure-wallet-generation)
3. [Professional Bot Protection](#professional-bot-protection)
4. [Privacy Encryption](#privacy-encryption)
5. [Implementation Details](#implementation-details)
6. [Testing Guide](#testing-guide)
7. [Maintenance](#maintenance)

---

## Username Uniqueness System

### Database Schema

**Table: `user_wallets`**
```sql
CREATE TABLE user_wallets (
    id UUID PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    username_lower TEXT NOT NULL UNIQUE,  -- Case-insensitive
    wallet_address TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    ip_address TEXT,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true
);
```

### Features

✅ **Case-Insensitive Uniqueness**
- "User" and "user" are treated as the same
- username_lower field stores lowercase version
- UNIQUE constraint on username_lower

✅ **Format Validation**
- Length: 4-32 characters
- Characters: Letters, numbers, underscore, hyphen only
- Regex: `^[a-zA-Z0-9_-]+$`

✅ **Wallet Address Validation**
- Valid Ethereum address format
- Regex: `^0x[a-fA-F0-9]{40}$`
- UNIQUE constraint prevents duplicates

### Server Functions

**1. check_username_available(p_username TEXT)**
```typescript
// Returns:
{
  available: boolean,
  error?: string,
  message?: string
}
```

**2. register_wallet(p_username, p_wallet_address, p_ip_address, p_user_agent)**
```typescript
// Returns:
{
  success: boolean,
  error?: string,
  code?: string,
  username?: string,
  wallet_address?: string
}
```

**3. update_last_login(p_wallet_address, p_ip_address)**
```typescript
// Returns:
{
  success: boolean,
  error?: string
}
```

### Usage

```typescript
// Check if username is available
const response = await supabase.rpc('check_username_available', {
  p_username: 'myusername'
});

if (response.data.available) {
  // Username is available
} else {
  // Username taken or invalid
  console.error(response.data.error);
}

// Register wallet after creation
const result = await supabase.rpc('register_wallet', {
  p_username: 'myusername',
  p_wallet_address: '0x1234...',
  p_ip_address: userIp,
  p_user_agent: navigator.userAgent
});
```

---

## Secure Wallet Generation

### Key Derivation (PBKDF2)

```typescript
const derivePrivateKey = async (username: string, password: string) => {
  const salt = toUtf8Bytes(`zikalyze-v1-salt:${username.toLowerCase()}`);
  const passwordBytes = toUtf8Bytes(password);
  
  // PBKDF2 with 100,000 iterations (OWASP recommendation)
  const derivedKey = pbkdf2(passwordBytes, salt, 100000, 32, "sha256");
  
  return derivedKey;
};
```

### Security Features

✅ **Deterministic Generation**
- Same username + password = Same wallet
- Enables account recovery
- No seed phrase needed

✅ **High Iteration Count**
- 100,000 PBKDF2 iterations
- OWASP recommended minimum
- Slows down brute force attacks

✅ **Unique Salt Per User**
- Derived from username
- Prevents rainbow table attacks
- Ensures unique wallets

### Wallet Creation Flow

```
1. User enters username + password
   ↓
2. Validate format (length, complexity)
   ↓
3. Derive private key (PBKDF2, 100k iterations)
   ↓
4. Create Ethereum wallet from private key
   ↓
5. Extract wallet address
   ↓
6. Encrypt private key (AES-256-GCM)
   ↓
7. Store encrypted key locally
   ↓
8. Register username + address on server
```

---

## Professional Bot Protection

### 7-Layer Detection System

#### Layer 1: Honeypot Fields
**What**: Hidden form fields invisible to users
**How**: CSS makes fields invisible, bots fill them anyway
**Detection**: If honeypot touched → Bot detected

```tsx
<input
  type="text"
  name="website"
  style={{
    position: 'absolute',
    left: '-9999px',
    opacity: 0,
    pointerEvents: 'none'
  }}
  tabIndex={-1}
  onChange={() => botProtection.markHoneypotTouched(formId)}
/>
```

#### Layer 2: Timing Analysis
**What**: Measures form interaction time
**Checks**:
- Too fast (<2 seconds) → Bot
- No interaction before submit → Bot
- Too slow (>5 minutes) → Abandoned/Bot

#### Layer 3: Mouse Movement Tracking
**What**: Counts mouse movements
**Requirement**: Minimum 5 movements
**Detection**: Bots rarely simulate mouse events

```typescript
onMouseMove={() => botProtection.trackMouseMovement(formId)}
```

#### Layer 4: Keystroke Dynamics
**What**: Tracks typing patterns
**Checks**:
- No keystrokes → Bot (form filled programmatically)
- Tracks keystroke count

```typescript
onKeyPress={() => botProtection.trackKeystroke(formId)}
```

#### Layer 5: Field Interaction Patterns
**What**: Tracks focus/blur events
**Analysis**:
- Which fields were focused
- Which fields were blurred
- Interaction sequence

#### Layer 6: Challenge-Response
**What**: Simple math challenges
**Examples**:
- "5 + 3 = ?"
- "12 - 4 = ?"
- "6 × 3 = ?"

**Features**:
- Randomized questions
- Minimal user friction
- Effective bot filter

#### Layer 7: Behavioral Analysis
**What**: Aggregates all signals
**Scoring**:
- Each suspicious behavior adds to bot score (0-100)
- Score ≥50 → Blocked
- Confidence level provided

### Bot Check Result

```typescript
interface BotCheckResult {
  isBot: boolean;           // Final determination
  confidence: number;       // 0-100
  reasons: string[];        // Why bot was detected
  allowSubmission: boolean; // Should form be accepted
}
```

### Usage Example

```typescript
import { botProtectionService } from '@/services/bot-protection.service';

// Initialize form
botProtectionService.initializeForm('signup-form');

// Generate challenge
const challenge = botProtectionService.generateChallenge();
// { question: "7 + 5 = ?", answer: "12" }

// Before form submission
const botCheck = botProtectionService.checkForBot('signup-form', userAnswer);

if (!botCheck.allowSubmission) {
  toast.error(`Bot detected: ${botCheck.reasons.join(', ')}`);
  return;
}

// Proceed with signup
```

---

## Privacy Encryption

### AES-256-GCM Encryption

**Algorithm**: AES-256-GCM (Galois/Counter Mode)
**Key Size**: 256 bits
**IV Size**: 96 bits (12 bytes)
**Tag Size**: 128 bits (16 bytes)

### Key Derivation

```typescript
// Same PBKDF2 as wallet generation
const deriveKey = async (password: string, salt: Uint8Array) => {
  const derivedKey = pbkdf2(
    toUtf8Bytes(password),
    salt,
    100000,  // 100,000 iterations
    32,      // 256 bits
    "sha256"
  );
  return derivedKey;
};
```

### Encryption Process

```
1. Generate random salt (32 bytes)
   ↓
2. Generate random IV (12 bytes)
   ↓
3. Derive encryption key from password + salt
   ↓
4. Encrypt data with AES-256-GCM
   ↓
5. Return: ciphertext + IV + salt + authentication tag
```

### Encrypted Data Structure

```typescript
interface EncryptedData {
  ciphertext: string;  // Encrypted data
  iv: string;          // Initialization vector
  salt: string;        // Key derivation salt
  tag: string;         // Authentication tag
}
```

### Privacy Features

#### 1. Encrypt User Profile

```typescript
const encrypted = await privacyEncryption.encryptUserProfile({
  username: 'user123',
  email: 'user@example.com',
  preferences: { theme: 'dark' }
}, password);

// Store encrypted
localStorage.setItem('profile', encrypted);
```

#### 2. Encrypt Private Key

```typescript
const encryptedKey = await privacyEncryption.encryptPrivateKey(
  privateKey,
  password
);

// Store encrypted key
localStorage.setItem('wallet_key', encryptedKey);
```

#### 3. Create Anonymous ID

```typescript
// One-way hash for privacy
const anonymousId = privacyEncryption.createAnonymousId('username');
// Cannot reverse to get original username
```

#### 4. Hash Data (One-Way)

```typescript
const hash = privacyEncryption.hashData('sensitive data');
// Use for comparisons without storing plaintext
```

#### 5. Secure Storage

```typescript
// Encrypt before storing
await privacyEncryption.encryptForStorage(
  'my-data-key',
  { secret: 'value' },
  password
);

// Decrypt after retrieval
const data = await privacyEncryption.decryptFromStorage(
  'my-data-key',
  password
);
```

### Zero-Knowledge Architecture

**Principles**:
- Client-side encryption only
- Server never sees plaintext passwords
- Server never sees plaintext private keys
- User's password is the only decryption key

**Data Flow**:
```
User Password
    ↓
Client-Side Encryption
    ↓
Encrypted Data
    ↓
Server Storage (encrypted)
    ↓
Client Retrieval
    ↓
Client-Side Decryption
    ↓
Plaintext Data (client only)
```

---

## Implementation Details

### File Structure

```
src/
├── services/
│   ├── bot-protection.service.ts      # Bot detection
│   └── privacy-encryption.service.ts  # Encryption
│
supabase/
├── migrations/
│   └── 20260216053000_username_uniqueness_and_wallet_security.sql
│
└── functions/
    └── wallet-auth/
        └── index.ts                    # Username/wallet API
```

### Dependencies

**Client-Side**:
- ethers.js (wallet creation, PBKDF2)
- Web Crypto API (AES-256-GCM encryption)
- React hooks (state management)

**Server-Side**:
- Supabase (database, functions)
- PostgreSQL (data storage)
- Edge Functions (API endpoints)

---

## Testing Guide

### Manual Testing

#### Test 1: Username Uniqueness
```bash
1. Register with username "testuser"
2. Try to register "testuser" again → Should fail
3. Try to register "TestUser" → Should fail (case-insensitive)
4. Check database: SELECT * FROM user_wallets WHERE username_lower = 'testuser'
   → Should show 1 record only
```

#### Test 2: Wallet Security
```bash
1. Register with username "alice" and password "Password123"
2. Note the wallet address
3. Logout and register again with same credentials
4. Wallet address should be identical
5. Check localStorage for private key
   → Should be encrypted (gibberish text)
```

#### Test 3: Bot Protection
```bash
1. Fill signup form immediately and submit (<2s)
   → Should block: "Form submitted too quickly"
   
2. Fill honeypot field and submit
   → Should block: "Honeypot field was filled"
   
3. Use auto-fill and submit without interaction
   → Should block: "No user interaction detected"
   
4. Fill form normally with 5+ mouse movements
   → Should succeed
```

#### Test 4: Privacy Encryption
```bash
1. Register a user
2. Open Browser DevTools → Application → localStorage
3. Look for wallet data
   → Should see encrypted ciphertext, IV, salt, tag
   → Should NOT see plain text private key
   
4. Check Network tab for requests
   → Password should never be sent in plaintext
```

### Automated Testing

```typescript
// Test username uniqueness
describe('Username Uniqueness', () => {
  it('should prevent duplicate usernames', async () => {
    // Register first user
    const result1 = await registerUser('testuser', 'password123');
    expect(result1.success).toBe(true);
    
    // Try to register same username
    const result2 = await registerUser('testuser', 'different_password');
    expect(result2.success).toBe(false);
    expect(result2.error).toContain('already taken');
  });
  
  it('should be case-insensitive', async () => {
    const result = await registerUser('TestUser', 'password');
    expect(result.success).toBe(false);
  });
});

// Test bot protection
describe('Bot Protection', () => {
  it('should detect honeypot field', () => {
    botProtection.initializeForm('test');
    botProtection.markHoneypotTouched('test');
    
    const result = botProtection.checkForBot('test');
    expect(result.isBot).toBe(true);
    expect(result.reasons).toContain('Honeypot field was filled');
  });
});

// Test encryption
describe('Privacy Encryption', () => {
  it('should encrypt and decrypt data', async () => {
    const original = 'secret data';
    const password = 'password123';
    
    const encrypted = await privacyEncryption.encrypt(original, password);
    expect(encrypted.ciphertext).not.toBe(original);
    
    const decrypted = await privacyEncryption.decrypt(encrypted, password);
    expect(decrypted).toBe(original);
  });
  
  it('should fail with wrong password', async () => {
    const encrypted = await privacyEncryption.encrypt('data', 'pass1');
    
    await expect(
      privacyEncryption.decrypt(encrypted, 'wrong_pass')
    ).rejects.toThrow('Decryption failed');
  });
});
```

---

## Maintenance

### Database Maintenance

**Check registered users**:
```sql
SELECT 
  username,
  wallet_address,
  created_at,
  last_login_at,
  is_active
FROM user_wallets
WHERE is_active = true
ORDER BY created_at DESC;
```

**Check for duplicates** (should return 0):
```sql
SELECT username_lower, COUNT(*) 
FROM user_wallets 
GROUP BY username_lower 
HAVING COUNT(*) > 1;
```

**Deactivate user**:
```sql
UPDATE user_wallets 
SET is_active = false 
WHERE username_lower = 'username';
```

### Security Monitoring

**Monitor bot detection**:
- Log bot check results
- Track false positive rate
- Adjust thresholds if needed

**Monitor login attempts**:
- Track failed attempts
- Identify attack patterns
- Implement IP blocking if necessary

### Updates

**Update PBKDF2 iterations** (if needed in future):
```typescript
// Current: 100,000
// If increasing, ensure backward compatibility
```

**Update encryption algorithm** (if needed in future):
```typescript
// Current: AES-256-GCM
// Migration required if changing
```

---

## Security Best Practices

### DO ✅
- Always check username availability before registration
- Always validate wallet address format
- Always encrypt sensitive data before storage
- Always use server-side validation
- Always log security events
- Always use HTTPS in production

### DON'T ❌
- Never store private keys in plain text
- Never send passwords in plain text
- Never trust client-side validation alone
- Never bypass bot protection checks
- Never disable encryption
- Never expose database credentials

---

## Troubleshooting

### Issue: "Username already taken" but user can't find it

**Cause**: Case-insensitive matching
**Solution**: Try different username or check username_lower field

### Issue: "Wallet address already registered"

**Cause**: User may have registered before with different username
**Solution**: User should recover wallet with original username

### Issue: "Decryption failed"

**Cause**: Wrong password or corrupted data
**Solution**: Verify password, check localStorage for corruption

### Issue: "Bot detected" for legitimate user

**Cause**: User action triggered bot detection
**Solution**: Review bot protection logs, adjust thresholds if needed

---

## Support

For issues or questions:
1. Check this documentation
2. Review code comments in source files
3. Check database logs
4. Contact development team

---

**Last Updated**: 2026-02-16
**Version**: 1.0
**Status**: Production Ready ✅
