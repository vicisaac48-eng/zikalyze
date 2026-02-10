#!/bin/bash

###############################################################################
# AAB Signing Script for Zikalyze
# 
# This script helps you sign your Android App Bundle (AAB) for Play Store upload
# 
# Usage:
#   ./scripts/sign_aab.sh [OPTIONS]
#
# Options:
#   --keystore <path>     Path to your keystore file (default: zikalyze-release-key.jks)
#   --alias <alias>       Keystore alias (default: zikalyze)
#   --aab <path>          Path to AAB file (default: android/app/build/outputs/bundle/release/app-release.aab)
#   --verify              Verify the signature after signing
#   --help                Show this help message
#
# Example:
#   ./scripts/sign_aab.sh
#   ./scripts/sign_aab.sh --keystore my-key.jks --alias myalias
#   ./scripts/sign_aab.sh --verify
#
###############################################################################

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Default values
KEYSTORE_PATH="zikalyze-release-key.jks"
KEY_ALIAS="zikalyze"
AAB_PATH="android/app/build/outputs/bundle/release/app-release.aab"
VERIFY_SIGNATURE=false

# Function to print colored output
print_header() {
    echo -e "\n${BOLD}${BLUE}================================================${NC}"
    echo -e "${BOLD}${BLUE}$1${NC}"
    echo -e "${BOLD}${BLUE}================================================${NC}\n"
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

# Function to show help
show_help() {
    echo "AAB Signing Script for Zikalyze"
    echo ""
    echo "Usage: ./scripts/sign_aab.sh [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --keystore <path>     Path to your keystore file (default: zikalyze-release-key.jks)"
    echo "  --alias <alias>       Keystore alias (default: zikalyze)"
    echo "  --aab <path>          Path to AAB file (default: android/app/build/outputs/bundle/release/app-release.aab)"
    echo "  --verify              Verify the signature after signing"
    echo "  --help                Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./scripts/sign_aab.sh"
    echo "  ./scripts/sign_aab.sh --keystore my-key.jks --alias myalias"
    echo "  ./scripts/sign_aab.sh --verify"
    echo ""
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --keystore)
            KEYSTORE_PATH="$2"
            shift 2
            ;;
        --alias)
            KEY_ALIAS="$2"
            shift 2
            ;;
        --aab)
            AAB_PATH="$2"
            shift 2
            ;;
        --verify)
            VERIFY_SIGNATURE=true
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Print header
print_header "Zikalyze AAB Signing Tool"

# Check if jarsigner is available
if ! command -v jarsigner &> /dev/null; then
    print_error "jarsigner not found!"
    print_info "jarsigner is part of the Java JDK"
    print_info "Install Java JDK: https://adoptium.net/"
    exit 1
fi

print_success "jarsigner found: $(which jarsigner)"

# Check if keytool is available (for verification)
if ! command -v keytool &> /dev/null; then
    print_warning "keytool not found - signature verification will be limited"
fi

# Verify AAB file exists
print_header "Checking AAB File"

if [ ! -f "$AAB_PATH" ]; then
    print_error "AAB file not found: $AAB_PATH"
    print_info "Build the AAB first with: cd android && ./gradlew bundleRelease"
    exit 1
fi

AAB_SIZE=$(du -h "$AAB_PATH" | cut -f1)
print_success "AAB file found: $AAB_PATH"
print_info "AAB size: $AAB_SIZE"

# Check keystore file
print_header "Checking Keystore"

if [ ! -f "$KEYSTORE_PATH" ]; then
    print_warning "Keystore not found: $KEYSTORE_PATH"
    echo ""
    print_info "Do you want to create a new keystore? (y/n)"
    read -r create_keystore
    
    if [[ "$create_keystore" =~ ^[Yy]$ ]]; then
        print_info "Creating new keystore..."
        print_warning "You will be prompted to enter passwords and your details"
        print_warning "IMPORTANT: Remember these passwords - you'll need them for future updates!"
        echo ""
        
        keytool -genkey -v \
            -keystore "$KEYSTORE_PATH" \
            -keyalg RSA \
            -keysize 2048 \
            -validity 10000 \
            -alias "$KEY_ALIAS"
        
        if [ $? -eq 0 ]; then
            print_success "Keystore created: $KEYSTORE_PATH"
        else
            print_error "Failed to create keystore"
            exit 1
        fi
    else
        print_error "Cannot proceed without a keystore"
        print_info "Create one with: keytool -genkey -v -keystore $KEYSTORE_PATH -keyalg RSA -keysize 2048 -validity 10000 -alias $KEY_ALIAS"
        exit 1
    fi
else
    print_success "Keystore found: $KEYSTORE_PATH"
fi

# Sign the AAB
print_header "Signing AAB"

print_info "Using keystore: $KEYSTORE_PATH"
print_info "Using alias: $KEY_ALIAS"
print_info "Signing: $AAB_PATH"
echo ""
print_warning "You will be prompted for your keystore password"
echo ""

# Run jarsigner
jarsigner -verbose \
    -sigalg SHA256withRSA \
    -digestalg SHA-256 \
    -keystore "$KEYSTORE_PATH" \
    "$AAB_PATH" \
    "$KEY_ALIAS"

if [ $? -eq 0 ]; then
    print_success "AAB signed successfully!"
else
    print_error "Failed to sign AAB"
    print_info "Common issues:"
    print_info "  - Wrong keystore password"
    print_info "  - Wrong key alias"
    print_info "  - Keystore file is corrupted"
    exit 1
fi

# Verify signature if requested
if [ "$VERIFY_SIGNATURE" = true ]; then
    print_header "Verifying Signature"
    
    jarsigner -verify -verbose -certs "$AAB_PATH"
    
    if [ $? -eq 0 ]; then
        print_success "Signature verification passed!"
    else
        print_error "Signature verification failed!"
        exit 1
    fi
fi

# Final instructions
print_header "Next Steps"

print_success "Your AAB is now signed and ready for Play Store upload!"
echo ""
print_info "Upload to Play Console:"
print_info "1. Go to: https://play.google.com/console"
print_info "2. Select your app"
print_info "3. Navigate to: Release → Production (or Internal Testing)"
print_info "4. Click 'Create new release'"
print_info "5. Upload: $AAB_PATH"
print_info "6. Fill in release notes"
print_info "7. Click 'Review release' → 'Start rollout'"
echo ""
print_warning "IMPORTANT: Keep your keystore file safe!"
print_warning "Location: $KEYSTORE_PATH"
print_warning "You'll need it for ALL future app updates"
echo ""

# Optional: Copy to a convenient location
echo -e "${BOLD}Optional:${NC} Copy signed AAB to current directory? (y/n)"
read -r copy_aab

if [[ "$copy_aab" =~ ^[Yy]$ ]]; then
    cp "$AAB_PATH" "./app-release-signed.aab"
    print_success "Copied to: ./app-release-signed.aab"
fi

print_success "Done!"
