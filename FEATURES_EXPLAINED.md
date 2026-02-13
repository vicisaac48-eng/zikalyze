# Features Explained: Functions and Purpose

This document provides detailed explanations of three key features implemented in the Zikalyze application.

---

## 1. Accessibility Features (ARIA, Reduced Motion)

### 🎯 Purpose
Make the application accessible to all users, including those with disabilities, following WCAG 2.1 Level AAA standards.

### 🔧 Functions

#### A. ARIA Attributes

**What they do:**
ARIA (Accessible Rich Internet Applications) attributes provide semantic information to assistive technologies like screen readers.

**Implementation:**

```tsx
// Example: AuthLoadingOverlay.tsx
<div 
  role="status"                           // Identifies as a status update
  aria-live="polite"                      // Announces changes to screen readers
  aria-label="Authenticating your credentials"  // Provides context
>
  <span aria-label="Authentication in progress">
    Authenticating
  </span>
  <div aria-hidden="true">                // Hides decorative elements
    {/* Decorative animated dots */}
  </div>
</div>
```

**ARIA Attributes Used:**

| Attribute | Function | Example |
|-----------|----------|---------|
| `role="status"` | Identifies dynamic status regions | Loading states |
| `aria-live="polite"` | Announces updates without interrupting | Status changes |
| `aria-label="..."` | Provides descriptive label | "Loading dashboard content" |
| `aria-hidden="true"` | Hides decorative elements from screen readers | Animated dots, icons |

**Benefits:**
- ✅ Screen reader users hear "Authenticating your credentials" instead of silence
- ✅ Status updates are announced automatically
- ✅ Decorative animations don't clutter the audio experience
- ✅ Users understand what's happening even without seeing the screen

**Files with ARIA:**
- `src/components/AuthLoadingOverlay.tsx`
- `src/components/dashboard/DashboardSplash.tsx`
- `src/components/dashboard/DashboardSkeleton.tsx`
- `src/components/LandingSplash.tsx`

---

#### B. Reduced Motion Support

**What it does:**
Disables animations for users who have enabled the "reduce motion" setting in their operating system.

**Implementation:**

```css
/* src/index.css */
@media (prefers-reduced-motion: reduce) {
  /* Disable all loading animations */
  .logo-spin-professional,
  .auth-ring-rotate,
  .auth-ring-rotate-reverse,
  .auth-glow-pulse,
  .auth-logo-glow,
  .auth-dot-pulse,
  .splash-icon,
  .logo-splash-pulse,
  .color-band,
  .skeleton-shimmer,
  .skeleton-pulse {
    animation: none !important;
  }
}
```

**How it works:**

1. **System Setting Detection:**
   - User enables "Reduce Motion" in their OS (Windows, macOS, iOS, Android)
   - Browser detects this preference
   - CSS media query `(prefers-reduced-motion: reduce)` activates

2. **Animation Disabling:**
   - All decorative animations are disabled
   - Static loading indicators remain
   - Functionality is preserved
   - No flashing or motion triggers

**Why it matters:**

| User Group | Benefit |
|------------|---------|
| **Vestibular Disorders** | Prevents dizziness, nausea from motion |
| **ADHD/Attention Issues** | Removes distracting animations |
| **Migraine Sufferers** | Avoids motion-triggered headaches |
| **Battery Savers** | Reduces CPU usage on mobile devices |
| **Preference** | Some users simply prefer static UIs |

**Example User Experience:**

**Without Reduced Motion:**
```
Loading... [spinning logo] [pulsing glow] [rotating rings]
```

**With Reduced Motion:**
```
Loading... [static logo] [static indicator]
```

**Standards Compliance:**
- ✅ WCAG 2.1 Level AAA (Motion from Animation)
- ✅ Section 508 compliant
- ✅ ADA (Americans with Disabilities Act) friendly

---

### 📊 Accessibility Impact

**Before Implementation:**
- ❌ Screen readers read nothing during loading
- ❌ Animations run regardless of user preferences
- ❌ Motion could trigger vestibular issues
- ❌ No semantic information for assistive tech

**After Implementation:**
- ✅ Screen readers announce loading states
- ✅ Animations respect user preferences
- ✅ Safe for users with motion sensitivity
- ✅ Full semantic HTML structure

---

## 2. Trade Quality Veto System

### 🎯 Purpose
Prevent "Split Personality Syndrome" where different sections of the trading analysis show contradictory recommendations.

### 🔧 Functions

#### The Problem: Split Personality Syndrome

**Before the veto system:**
```
🛡️ Trade Quality Check:
✅ EXECUTE (85% HIGH QUALITY)

📱 Quick Summary:
🛑 AVOID (30% confidence)

❓ User Confusion: Which recommendation should I follow?
```

#### The Solution: Hierarchical Veto System

**How it works:**

```typescript
// Pseudo-code from src/lib/zikalyze-brain/index.ts

// Step 1: Calculate base quality score
let baseQualityScore = 85; // Example: Trade looks good

// Step 2: Apply Neural Network Filter Veto
if (skipTrade) {  // Neural network says confidence < 51%
  qualityScore = Math.min(35, baseQualityScore); // Cap at 35%
  vetoReason = "Capped by NN Filter";
}

// Step 3: Apply Tri-Modular Analysis Veto (higher priority)
if (triModularVerdict === 'AVOID') {
  qualityScore = Math.min(30, qualityScore); // Cap at 30%
  vetoReason = "Capped by Tri-Modular AVOID";
}

// Result: All sections now show consistent 30% quality
```

**Veto Hierarchy:**

```
Priority 1 (Highest): Tri-Modular Human-In-The-Loop
  └─> If verdict = AVOID → Cap quality at 30%

Priority 2: Neural Network Filter
  └─> If NN confidence < 51% → Cap quality at 35%

Priority 3 (Lowest): Base Quality Score
  └─> Original calculated quality (0-100%)
```

**Implementation Details:**

| Veto Source | Trigger Condition | Quality Cap | Display |
|-------------|-------------------|-------------|---------|
| Tri-Modular | verdict = AVOID | 30% | "🚫 TRADE BLOCKED" |
| NN Filter | skipTrade = true | 35% | "⚠️ SKIPPED" |
| None | Clean trade | 0-100% | "✅ EXECUTE" or quality level |

**Code Example:**

```typescript
// src/lib/zikalyze-brain/index.ts (lines 705-721)

let qualityScore = baseQualityScore;
let vetoApplied = false;
let vetoReason = '';

// Neural Network Filter veto
if (skipTrade) {
  qualityScore = Math.min(35, qualityScore);
  vetoApplied = true;
  vetoReason = 'Capped by NN Filter';
  console.log(`🔴 NN Filter veto applied: ${baseQualityScore}% → ${qualityScore}%`);
}

// Tri-Modular veto (overrides NN Filter if more restrictive)
if (triModularVerdict === 'AVOID') {
  qualityScore = Math.min(30, qualityScore);
  vetoApplied = true;
  vetoReason = 'Capped by Tri-Modular AVOID';
  console.log(`🔴 Tri-Modular veto applied: → ${qualityScore}%`);
}
```

---

#### Display Changes

**Trade Quality Check Section:**

**Before Veto:**
```
✅ EXECUTE
Score: 85% (HIGH QUALITY)
```

**After NN Filter Veto:**
```
⚠️ SKIPPED
Score: 35% (Capped by NN Filter)
Base: 85%
```

**After Tri-Modular Veto:**
```
🚫 TRADE BLOCKED — AI safety filters active
Score: 30% (Capped by Tri-Modular AVOID)
Base: 85%
```

**Quick Summary Section:**

**Synchronized with Veto:**
```
🔴 NO TRADE / WAITING
Confidence: AVOID
```

---

### 📊 Trade Quality Veto Impact

**Problem Solved:**
- ✅ No more contradictory signals
- ✅ Single source of truth (Tri-Modular + NN Filter)
- ✅ Clear veto reasons shown to user
- ✅ Prevents users from taking risky trades
- ✅ All sections show consistent recommendation

**User Benefits:**
- **Trust:** System appears coherent and reliable
- **Clarity:** Veto reason explains why quality is low
- **Safety:** AI safety filters protect from bad trades
- **Transparency:** Base score still shown for reference

**Files Modified:**
- `src/lib/zikalyze-brain/index.ts` (veto logic)
- `src/lib/zikalyze-brain/tri-modular-analysis.ts` (AVOID check)

---

## 3. Storage Constants

### 🎯 Purpose
Centralize all storage keys to prevent typos, improve type safety, and make the codebase more maintainable.

### 🔧 Functions

#### The Problem: Magic Strings

**Before (Bad Practice):**

```typescript
// In Landing.tsx
const hasSeenSplash = sessionStorage.getItem('landing_splash_shown');

// In Dashboard.tsx
const hasSeenSplash = sessionStorage.getItem('dashboard_spalsh_shown'); // Typo!

// In Settings.tsx
const lastCrypto = localStorage.getItem('last_crypto');

// In Auth.tsx
const walletSession = localStorage.getItem('walet_session'); // Typo!
```

**Problems:**
- ❌ Typos cause bugs (spalsh, walet)
- ❌ No autocomplete
- ❌ Hard to refactor
- ❌ No type safety
- ❌ Keys scattered throughout codebase

---

#### The Solution: Centralized Constants

**Implementation:**

```typescript
// src/constants/storage.ts

export const SESSION_STORAGE_KEYS = {
  DASHBOARD_SPLASH_SHOWN: 'dashboard_splash_shown',
  LANDING_SPLASH_SHOWN: 'landing_splash_shown',
} as const;

export const LOCAL_STORAGE_KEYS = {
  LAST_CRYPTO: 'last_crypto',
  WALLET_SESSION: 'wallet_session',
  COOKIE_CONSENT: 'cookieConsent',
} as const;
```

**Usage:**

```typescript
// Import the constants
import { SESSION_STORAGE_KEYS, LOCAL_STORAGE_KEYS } from '@/constants/storage';

// Use with autocomplete and type safety
const hasSeenSplash = sessionStorage.getItem(
  SESSION_STORAGE_KEYS.DASHBOARD_SPLASH_SHOWN  // ✅ Autocomplete works
);

const lastCrypto = localStorage.getItem(
  LOCAL_STORAGE_KEYS.LAST_CRYPTO  // ✅ No typos possible
);
```

---

### 📊 Storage Constants Functions

#### 1. Type Safety

**TypeScript Benefits:**

```typescript
// Type is inferred as: 'dashboard_splash_shown' | 'landing_splash_shown'
type SessionKey = typeof SESSION_STORAGE_KEYS[keyof typeof SESSION_STORAGE_KEYS];

// Compile-time error if you typo
sessionStorage.getItem(SESSION_STORAGE_KEYS.DASHBORD_SPLASH); // ❌ Error!
```

#### 2. IDE Autocomplete

**Developer Experience:**

```typescript
// Just type SESSION_STORAGE_KEYS. and get suggestions:
SESSION_STORAGE_KEYS.
  ├─ DASHBOARD_SPLASH_SHOWN
  └─ LANDING_SPLASH_SHOWN
```

#### 3. Refactoring Made Easy

**Example: Renaming a key**

**Before (risky):**
```typescript
// Find and replace 'landing_splash_shown' in 5+ files
// Hope you didn't miss any
// Hope there are no typos
```

**After (safe):**
```typescript
// Change in ONE place:
export const SESSION_STORAGE_KEYS = {
  LANDING_SPLASH_SHOWN: 'landing_splash_v2',  // ✅ All usages updated
} as const;
```

#### 4. Documentation

**Self-Documenting Code:**

```typescript
// Constants file serves as documentation
export const SESSION_STORAGE_KEYS = {
  /** Tracks if dashboard splash screen has been shown this session */
  DASHBOARD_SPLASH_SHOWN: 'dashboard_splash_shown',
  
  /** Tracks if landing page splash screen has been shown this session */
  LANDING_SPLASH_SHOWN: 'landing_splash_shown',
} as const;
```

---

### 📊 Storage Constants Impact

**Before Implementation:**
- ❌ 5+ string literals scattered across files
- ❌ Typos causing silent bugs
- ❌ No autocomplete
- ❌ Hard to find all usages

**After Implementation:**
- ✅ Single source of truth
- ✅ Compile-time type checking
- ✅ IDE autocomplete
- ✅ Easy refactoring
- ✅ Self-documenting

**Files Using Storage Constants:**
- `src/pages/Dashboard.tsx`
- `src/pages/Landing.tsx`
- `src/components/dashboard/DashboardSplash.tsx`
- `src/components/LandingSplash.tsx`

---

## Summary Table

| Feature | Primary Function | Benefit | Standards |
|---------|------------------|---------|-----------|
| **ARIA Attributes** | Provide semantic info to assistive tech | Screen reader accessibility | WCAG 2.1 AA |
| **Reduced Motion** | Disable animations for sensitive users | Prevent motion sickness | WCAG 2.1 AAA |
| **Trade Veto System** | Prevent contradictory trade signals | User trust & safety | Industry best practice |
| **Storage Constants** | Centralize storage keys | Type safety & maintainability | TypeScript best practice |

---

## Testing These Features

### Accessibility Testing

**ARIA Attributes:**
```bash
# Use a screen reader (NVDA, JAWS, VoiceOver)
# Navigate to loading screens
# Should hear: "Status: Authenticating your credentials"
```

**Reduced Motion:**
```bash
# Enable "Reduce Motion" in OS settings
# Open the app
# Animations should be disabled
```

### Trade Veto System Testing

```typescript
// Scenario 1: NN Filter blocks trade
Neural Network confidence: 45% (< 51%)
Expected: Quality capped at 35%

// Scenario 2: Tri-Modular blocks trade
Tri-Modular verdict: AVOID
Expected: Quality capped at 30%

// Scenario 3: Both block (Tri-Modular wins)
NN + Tri-Modular both block
Expected: Quality capped at 30% (most restrictive)
```

### Storage Constants Testing

```typescript
// Should get autocomplete
SESSION_STORAGE_KEYS.DASHBOARD_SPLASH_SHOWN

// Should fail compilation
SESSION_STORAGE_KEYS.INVALID_KEY  // ❌ TypeScript error
```

---

## Developer Guidelines

### When to Add ARIA Attributes

✅ **Do add ARIA for:**
- Loading states
- Dynamic content updates
- Form validation messages
- Status notifications

❌ **Don't add ARIA for:**
- Standard HTML elements (use semantic HTML)
- Redundant information
- Static content

### When to Disable Animations

```css
/* Always respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  .your-animation-class {
    animation: none !important;
  }
}
```

### When to Add Storage Constants

✅ **Do add constant for:**
- Any storage key used in multiple places
- Keys that might be renamed
- Keys with complex names

❌ **Don't add constant for:**
- One-time use keys
- Temporary/debug storage

---

## Conclusion

These three features work together to create a:
- ✅ **Accessible** application (ARIA + reduced motion)
- ✅ **Trustworthy** trading system (veto hierarchy)
- ✅ **Maintainable** codebase (storage constants)

All implemented following professional standards and best practices.
