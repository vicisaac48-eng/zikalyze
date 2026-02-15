#!/bin/bash

# auto_sign_aab.sh - Automated AAB signing script
# Works in GitHub Codespaces, local terminals, and CI/CD environments
# Usage: ./scripts/auto_sign_aab.sh [AAB_PATH] [KEYSTORE_PATH] [ALIAS]

set -e

# Default values
DEFAULT_AAB_PATH="android/app/build/outputs/bundle/release/app-release.aab"
DEFAULT_KEYSTORE="my-release-key.jks"
DEFAULT_ALIAS="my-key-alias"
PASSWORD_FILE="keystore-password.txt"

# ANSI color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  Zikalyze AAB Auto-Signing Tool${NC}"
echo -e "${BLUE}  Perfect for GitHub Codespaces & Terminals${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Use provided arguments or defaults
AAB_PATH="${1:-$DEFAULT_AAB_PATH}"
KEYSTORE_PATH="${2:-$DEFAULT_KEYSTORE}"
ALIAS="${3:-$DEFAULT_ALIAS}"

# Step 1: Check if AAB file exists
echo -e "${BLUE}[1/5]${NC} Checking AAB file..."
if [ ! -f "$AAB_PATH" ]; then
    echo -e "${RED}❌ AAB file not found: $AAB_PATH${NC}"
    echo ""
    echo "Please build the AAB first:"
    echo "  cd android && ./gradlew bundleRelease && cd .."
    echo ""
    echo "Or download from GitHub Actions artifacts and extract to:"
    echo "  $AAB_PATH"
    exit 1
fi
echo -e "${GREEN}✅ Found AAB: $AAB_PATH${NC}"
AAB_SIZE=$(du -h "$AAB_PATH" | cut -f1)
echo -e "   Size: $AAB_SIZE"
echo ""

# Step 2: Check if keystore exists
echo -e "${BLUE}[2/5]${NC} Checking keystore..."
if [ ! -f "$KEYSTORE_PATH" ]; then
    echo -e "${RED}❌ Keystore not found: $KEYSTORE_PATH${NC}"
    echo ""
    echo "To create a new keystore, run:"
    echo "  keytool -genkey -v -keystore $KEYSTORE_PATH -alias $ALIAS \\"
    echo "    -keyalg RSA -keysize 2048 -validity 10000"
    exit 1
fi
echo -e "${GREEN}✅ Found keystore: $KEYSTORE_PATH${NC}"
echo ""

# Step 3: Get keystore password
echo -e "${BLUE}[3/5]${NC} Getting keystore password..."

# Try to get password from environment variable first
if [ -n "$KEYSTORE_PASSWORD" ]; then
    STOREPASS="$KEYSTORE_PASSWORD"
    echo -e "${GREEN}✅ Using password from KEYSTORE_PASSWORD environment variable${NC}"
# Try password file next
elif [ -f "$PASSWORD_FILE" ]; then
    STOREPASS=$(cat "$PASSWORD_FILE")
    echo -e "${GREEN}✅ Using password from $PASSWORD_FILE${NC}"
# Prompt for password as last resort
else
    echo -e "${YELLOW}⚠️  No password file or environment variable found${NC}"
    echo "You can set password with:"
    echo "  export KEYSTORE_PASSWORD='your-password'"
    echo "or create $PASSWORD_FILE with your password"
    echo ""
    read -s -p "Enter keystore password: " STOREPASS
    echo ""
    if [ -z "$STOREPASS" ]; then
        echo -e "${RED}❌ Password cannot be empty${NC}"
        exit 1
    fi
fi
echo ""

# Use same password for key unless specified
KEYPASS="${KEYSTORE_KEYPASS:-$STOREPASS}"

# Step 4: Check if jarsigner is available
echo -e "${BLUE}[4/5]${NC} Checking jarsigner availability..."
if ! command -v jarsigner &> /dev/null; then
    echo -e "${RED}❌ jarsigner not found${NC}"
    echo ""
    echo "jarsigner comes with JDK. Please ensure JDK is installed:"
    echo "  sudo apt-get install openjdk-21-jdk"
    exit 1
fi
JAVA_VERSION=$(java -version 2>&1 | head -n 1)
echo -e "${GREEN}✅ jarsigner available${NC}"
echo -e "   $JAVA_VERSION"
echo ""

# Step 5: Sign the AAB
echo -e "${BLUE}[5/5]${NC} Signing AAB file..."
echo -e "${YELLOW}This may take a moment...${NC}"
echo ""

jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
  -keystore "$KEYSTORE_PATH" \
  -storepass "$STOREPASS" \
  -keypass "$KEYPASS" \
  "$AAB_PATH" "$ALIAS" 2>&1 | grep -E "(signing|Signed|added|jar)"

if [ $? -eq 0 ] || jarsigner -verify "$AAB_PATH" &> /dev/null; then
    echo ""
    echo -e "${GREEN}================================================${NC}"
    echo -e "${GREEN}  ✅ SUCCESS! AAB Signed Successfully${NC}"
    echo -e "${GREEN}================================================${NC}"
    echo ""
    echo -e "${GREEN}📦 Signed AAB:${NC} $AAB_PATH"
    echo -e "${GREEN}📁 Size:${NC} $AAB_SIZE"
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo "1. Download the signed AAB (if in Codespaces)"
    echo "2. Go to https://play.google.com/console"
    echo "3. Navigate to your app → Production → Create new release"
    echo "4. Upload the signed AAB file"
    echo "5. Add release notes and submit for review"
    echo ""
    echo -e "${YELLOW}💡 Tip:${NC} Keep your keystore and password safe!"
    echo "   If you lose them, you won't be able to update your app."
    echo ""
    exit 0
else
    echo ""
    echo -e "${RED}================================================${NC}"
    echo -e "${RED}  ❌ FAILED to sign AAB${NC}"
    echo -e "${RED}================================================${NC}"
    echo ""
    echo "Possible issues:"
    echo "• Wrong keystore password"
    echo "• Wrong key alias"
    echo "• Corrupted keystore file"
    echo ""
    echo "Try verifying keystore contents:"
    echo "  keytool -list -v -keystore $KEYSTORE_PATH"
    exit 1
fi
