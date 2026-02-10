#!/bin/bash

###############################################################################
# Automated AAB Signing Script for Zikalyze
# 
# This script AUTOMATICALLY handles EVERYTHING for AAB signing:
# - Builds the release AAB
# - Creates a keystore with default credentials
# - Signs the AAB
# - Verifies the signature
# - Copies the signed AAB to an easy-to-find location
#
# Usage:
#   ./scripts/auto_sign_aab.sh
#
# No questions asked, no manual steps - just run and go!
###############################################################################

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Configuration
KEYSTORE_PATH="zikalyze-release-key.jks"
KEY_ALIAS="zikalyze"
KEYSTORE_PASSWORD="zikalyze2024"  # Default password - change if needed
KEY_PASSWORD="zikalyze2024"        # Default password - change if needed
AAB_PATH="android/app/build/outputs/bundle/release/app-release.aab"
OUTPUT_AAB="zikalyze-signed.aab"

# Keystore details (used for automatic keystore creation)
DNAME="CN=Zikalyze, OU=Development, O=Zikalyze, L=San Francisco, ST=California, C=US"

# Function to print colored output
print_header() {
    echo ""
    echo -e "${BOLD}${CYAN}================================================${NC}"
    echo -e "${BOLD}${CYAN}$1${NC}"
    echo -e "${BOLD}${CYAN}================================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_step() {
    echo -e "${MAGENTA}▶️  $1${NC}"
}

# Main header
clear
echo ""
echo -e "${BOLD}${CYAN}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${CYAN}║                                                   ║${NC}"
echo -e "${BOLD}${CYAN}║       Zikalyze Automated AAB Signing Tool        ║${NC}"
echo -e "${BOLD}${CYAN}║                                                   ║${NC}"
echo -e "${BOLD}${CYAN}║     No Manual Steps - Everything Automated!      ║${NC}"
echo -e "${BOLD}${CYAN}║                                                   ║${NC}"
echo -e "${BOLD}${CYAN}╚═══════════════════════════════════════════════════╝${NC}"
echo ""

print_info "This script will automatically:"
echo "  1️⃣  Build the release AAB"
echo "  2️⃣  Create/use a keystore"
echo "  3️⃣  Sign the AAB"
echo "  4️⃣  Verify the signature"
echo "  5️⃣  Copy signed AAB to root directory"
echo ""
print_warning "Starting in 3 seconds... (Ctrl+C to cancel)"
sleep 3

# Step 1: Check dependencies
print_header "Step 1: Checking Dependencies"

if ! command -v java &> /dev/null; then
    print_error "Java is not installed!"
    print_info "Install Java JDK from: https://adoptium.net/"
    exit 1
fi
print_success "Java found: $(java -version 2>&1 | head -n 1)"

if ! command -v jarsigner &> /dev/null; then
    print_error "jarsigner not found!"
    print_info "jarsigner comes with Java JDK"
    exit 1
fi
print_success "jarsigner found"

if ! command -v keytool &> /dev/null; then
    print_error "keytool not found!"
    print_info "keytool comes with Java JDK"
    exit 1
fi
print_success "keytool found"

# Step 2: Build the AAB
print_header "Step 2: Building Release AAB"

print_step "Cleaning previous builds..."
cd android
./gradlew clean > /dev/null 2>&1 || true

print_step "Building release AAB (this may take a few minutes)..."
./gradlew bundleRelease

if [ ! -f "app/build/outputs/bundle/release/app-release.aab" ]; then
    print_error "Failed to build AAB!"
    exit 1
fi

cd ..
AAB_SIZE=$(du -h "$AAB_PATH" | cut -f1)
print_success "AAB built successfully! Size: $AAB_SIZE"
print_info "Location: $AAB_PATH"

# Step 3: Create or verify keystore
print_header "Step 3: Setting Up Keystore"

if [ -f "$KEYSTORE_PATH" ]; then
    print_success "Keystore already exists: $KEYSTORE_PATH"
    print_info "Using existing keystore for signing"
else
    print_step "Creating new keystore with default credentials..."
    print_warning "Using default password: $KEYSTORE_PASSWORD"
    
    # Create keystore with all defaults (no prompts)
    keytool -genkey -v \
        -keystore "$KEYSTORE_PATH" \
        -keyalg RSA \
        -keysize 2048 \
        -validity 10000 \
        -alias "$KEY_ALIAS" \
        -storepass "$KEYSTORE_PASSWORD" \
        -keypass "$KEY_PASSWORD" \
        -dname "$DNAME" \
        > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        print_success "Keystore created successfully!"
        print_info "Location: $KEYSTORE_PATH"
        print_warning "Password: $KEYSTORE_PASSWORD (SAVE THIS!)"
    else
        print_error "Failed to create keystore"
        exit 1
    fi
fi

# Step 4: Sign the AAB
print_header "Step 4: Signing AAB"

print_step "Signing AAB with jarsigner..."
jarsigner -verbose \
    -sigalg SHA256withRSA \
    -digestalg SHA-256 \
    -storepass "$KEYSTORE_PASSWORD" \
    -keypass "$KEY_PASSWORD" \
    -keystore "$KEYSTORE_PATH" \
    "$AAB_PATH" \
    "$KEY_ALIAS" \
    > /dev/null 2>&1

if [ $? -eq 0 ]; then
    print_success "AAB signed successfully!"
else
    print_error "Failed to sign AAB"
    exit 1
fi

# Step 5: Verify signature
print_header "Step 5: Verifying Signature"

print_step "Verifying AAB signature..."
jarsigner -verify -verbose -certs "$AAB_PATH" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    print_success "Signature verified successfully!"
else
    print_error "Signature verification failed!"
    exit 1
fi

# Step 6: Copy to root directory
print_header "Step 6: Finalizing"

print_step "Copying signed AAB to root directory..."
cp "$AAB_PATH" "./$OUTPUT_AAB"
print_success "Signed AAB copied to: ./$OUTPUT_AAB"

# Get file info
FINAL_SIZE=$(du -h "./$OUTPUT_AAB" | cut -f1)
ABSOLUTE_PATH=$(readlink -f "./$OUTPUT_AAB")

# Success summary
echo ""
echo -e "${BOLD}${GREEN}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${GREEN}║                                                   ║${NC}"
echo -e "${BOLD}${GREEN}║           ✅ SUCCESS! AAB IS READY! ✅           ║${NC}"
echo -e "${BOLD}${GREEN}║                                                   ║${NC}"
echo -e "${BOLD}${GREEN}╚═══════════════════════════════════════════════════╝${NC}"
echo ""

print_header "📦 Your Signed AAB Details"
echo ""
echo -e "${BOLD}File Name:${NC}      $OUTPUT_AAB"
echo -e "${BOLD}File Size:${NC}      $FINAL_SIZE"
echo -e "${BOLD}Full Path:${NC}      $ABSOLUTE_PATH"
echo -e "${BOLD}Keystore:${NC}       $KEYSTORE_PATH"
echo -e "${BOLD}Password:${NC}       $KEYSTORE_PASSWORD"
echo ""

print_header "🚀 Next Steps: Upload to Google Play"
echo ""
echo "1. Go to Google Play Console:"
echo -e "   ${CYAN}https://play.google.com/console${NC}"
echo ""
echo "2. Select your app (or create a new app)"
echo ""
echo "3. Navigate to Release section:"
echo "   - For testing: ${BOLD}Testing → Internal testing${NC}"
echo "   - For production: ${BOLD}Release → Production${NC}"
echo ""
echo "4. Click ${BOLD}\"Create new release\"${NC}"
echo ""
echo "5. Upload your signed AAB:"
echo -e "   ${BOLD}$ABSOLUTE_PATH${NC}"
echo ""
echo "6. Fill in release notes and click ${BOLD}\"Review release\"${NC}"
echo ""
echo "7. Click ${BOLD}\"Start rollout\"${NC}"
echo ""

print_header "⚠️  IMPORTANT - SAVE THESE CREDENTIALS!"
echo ""
echo -e "${BOLD}${RED}You MUST keep these for future app updates:${NC}"
echo ""
echo -e "${BOLD}Keystore file:${NC}     $KEYSTORE_PATH"
echo -e "${BOLD}Keystore password:${NC} $KEYSTORE_PASSWORD"
echo -e "${BOLD}Key alias:${NC}         $KEY_ALIAS"
echo ""
echo -e "${YELLOW}Without these, you cannot update your app!${NC}"
echo -e "${YELLOW}Backup the keystore file to a secure location!${NC}"
echo ""

print_header "📚 Additional Resources"
echo ""
echo "- AAB Signing Guide:        AAB_SIGNING_GUIDE.md"
echo "- Quick Start Guide:        QUICK_START_SIGNING.md"
echo "- Troubleshooting:          AAB_TROUBLESHOOTING.md"
echo "- Play Store Deployment:    docs/PLAYSTORE_DEPLOYMENT.md"
echo ""

print_success "All done! Your AAB is ready to upload to Google Play Store! 🎉"
echo ""
