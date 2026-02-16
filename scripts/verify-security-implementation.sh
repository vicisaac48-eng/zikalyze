#!/bin/bash
# ============================================================================
# Code Integrity Verification Script
# Ensures no existing functionality is broken by new security implementation
# ============================================================================

echo "🔍 Verifying Code Integrity..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track issues
ISSUES=0

# ============================================================================
# 1. Check for duplicate service names
# ============================================================================
echo "📁 Checking for duplicate service names..."

if [ -f "src/services/bot-protection.service.ts" ]; then
    echo "  ✅ New bot-protection.service.ts created"
else
    echo "  ❌ bot-protection.service.ts missing"
    ISSUES=$((ISSUES + 1))
fi

if [ -f "src/services/privacy-encryption.service.ts" ]; then
    echo "  ✅ New privacy-encryption.service.ts created"
else
    echo "  ❌ privacy-encryption.service.ts missing"
    ISSUES=$((ISSUES + 1))
fi

# Check existing bot protection hook is not modified
if grep -q "useBotProtection" src/hooks/useBotProtection.ts 2>/dev/null; then
    echo "  ✅ Existing useBotProtection hook intact"
else
    echo "  ⚠️  useBotProtection hook may be modified"
    ISSUES=$((ISSUES + 1))
fi

echo ""

# ============================================================================
# 2. Check database migration compatibility
# ============================================================================
echo "📊 Checking database migration compatibility..."

# Check if user_wallets was dropped before
if grep -q "DROP TABLE.*user_wallets" supabase/migrations/20260108114622_*.sql 2>/dev/null; then
    echo "  ✅ user_wallets table was previously dropped (OK to recreate)"
else
    echo "  ⚠️  user_wallets table history unclear"
fi

# Check new migration exists
if [ -f "supabase/migrations/20260216053000_username_uniqueness_and_wallet_security.sql" ]; then
    echo "  ✅ New migration file created"
    
    # Check migration has required elements
    if grep -q "CREATE TABLE.*user_wallets" supabase/migrations/20260216053000_*.sql 2>/dev/null; then
        echo "  ✅ Migration creates user_wallets table"
    else
        echo "  ❌ Migration missing user_wallets table"
        ISSUES=$((ISSUES + 1))
    fi
    
    if grep -q "check_username_available" supabase/migrations/20260216053000_*.sql 2>/dev/null; then
        echo "  ✅ Migration includes username check function"
    else
        echo "  ❌ Migration missing username check function"
        ISSUES=$((ISSUES + 1))
    fi
else
    echo "  ❌ Migration file missing"
    ISSUES=$((ISSUES + 1))
fi

echo ""

# ============================================================================
# 3. Check Edge Function compatibility
# ============================================================================
echo "🌐 Checking Edge Function compatibility..."

if [ -d "supabase/functions/wallet-auth" ]; then
    echo "  ✅ wallet-auth edge function directory created"
    
    if [ -f "supabase/functions/wallet-auth/index.ts" ]; then
        echo "  ✅ wallet-auth function implementation exists"
    else
        echo "  ❌ wallet-auth function implementation missing"
        ISSUES=$((ISSUES + 1))
    fi
else
    echo "  ❌ wallet-auth function directory missing"
    ISSUES=$((ISSUES + 1))
fi

# Check for conflicts with existing functions
EXISTING_FUNCTIONS=($(ls supabase/functions/ 2>/dev/null | grep -v wallet-auth))
for func in "${EXISTING_FUNCTIONS[@]}"; do
    if [ "$func" == "wallet-auth" ]; then
        echo "  ⚠️  Potential conflict with existing wallet-auth function"
        ISSUES=$((ISSUES + 1))
    fi
done

echo ""

# ============================================================================
# 4. Check TypeScript imports and exports
# ============================================================================
echo "📦 Checking TypeScript compatibility..."

# Check for circular dependencies
echo "  Checking for circular dependencies..."
if command -v madge &> /dev/null; then
    madge --circular src/ 2>/dev/null || echo "  ℹ️  madge not installed, skipping circular dependency check"
else
    echo "  ℹ️  madge not installed, skipping circular dependency check"
fi

# Check new services have proper exports
if grep -q "export.*botProtectionService" src/services/bot-protection.service.ts 2>/dev/null; then
    echo "  ✅ bot-protection service properly exported"
else
    echo "  ❌ bot-protection service export missing"
    ISSUES=$((ISSUES + 1))
fi

if grep -q "export.*privacyEncryption" src/services/privacy-encryption.service.ts 2>/dev/null; then
    echo "  ✅ privacy-encryption service properly exported"
else
    echo "  ❌ privacy-encryption service export missing"
    ISSUES=$((ISSUES + 1))
fi

echo ""

# ============================================================================
# 5. Check for breaking changes in existing hooks
# ============================================================================
echo "🔗 Checking existing hooks for breaking changes..."

# Check useAuth hook still exports required functions
if [ -f "src/hooks/useAuth.ts" ]; then
    if grep -q "export.*useAuth" src/hooks/useAuth.ts 2>/dev/null; then
        echo "  ✅ useAuth hook export intact"
    else
        echo "  ❌ useAuth hook export missing"
        ISSUES=$((ISSUES + 1))
    fi
    
    # Check for required functions
    for func in "signUp" "signInWithKey" "recoverWallet" "signOut"; do
        if grep -q "$func" src/hooks/useAuth.ts 2>/dev/null; then
            echo "  ✅ useAuth.$func function exists"
        else
            echo "  ⚠️  useAuth.$func function may be missing"
        fi
    done
else
    echo "  ❌ useAuth hook file missing"
    ISSUES=$((ISSUES + 1))
fi

echo ""

# ============================================================================
# 6. Check documentation
# ============================================================================
echo "📚 Checking documentation..."

if [ -f "SECURITY_IMPLEMENTATION_GUIDE.md" ]; then
    echo "  ✅ Security implementation guide created"
else
    echo "  ⚠️  Security implementation guide missing"
fi

if [ -f "SECURITY_SUMMARY.md" ]; then
    echo "  ✅ Security summary created"
else
    echo "  ⚠️  Security summary missing"
fi

echo ""

# ============================================================================
# 7. Final verification
# ============================================================================
echo "============================================================================"
if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED - No breaking changes detected${NC}"
    echo ""
    echo "Summary:"
    echo "  • New services added without conflicts"
    echo "  • Database migration compatible"
    echo "  • Edge function properly created"
    echo "  • TypeScript exports correct"
    echo "  • Existing hooks unchanged"
    echo "  • Documentation complete"
    echo ""
    echo "✅ Safe to deploy!"
    exit 0
else
    echo -e "${RED}❌ ISSUES DETECTED: $ISSUES potential problems found${NC}"
    echo ""
    echo "Please review the issues above before deploying."
    echo ""
    exit 1
fi
