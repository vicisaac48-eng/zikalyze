#!/bin/bash

# sign_aab.sh - Script to sign an Android App Bundle (AAB)
# Usage: ./scripts/sign_aab.sh <AAB_PATH> <KEYSTORE_PATH> <ALIAS>

set -e

# Prompt for arguments if not provided
if [ -z "$1" ]; then
  read -p "Enter path to your .aab file: " AAB_PATH
else
  AAB_PATH="$1"
fi

if [ -z "$2" ]; then
  read -p "Enter path to your keystore (.jks): " KEYSTORE_PATH
else
  KEYSTORE_PATH="$2"
fi

if [ -z "$3" ]; then
  read -p "Enter your key alias: " ALIAS
else
  ALIAS="$3"
fi

# Prompt for keystore password securely
read -s -p "Enter keystore password: " STOREPASS

echo
read -s -p "Enter key password (press Enter if same as keystore password): " KEYPASS

echo
if [ -z "$KEYPASS" ]; then
  KEYPASS="$STOREPASS"
fi

echo "Signing $AAB_PATH with keystore $KEYSTORE_PATH and alias $ALIAS..."

jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
  -keystore "$KEYSTORE_PATH" \
  -storepass "$STOREPASS" \
  -keypass "$KEYPASS" \
  "$AAB_PATH" "$ALIAS"

if [ $? -eq 0 ]; then
  echo "\n✅ Successfully signed $AAB_PATH"
else
  echo "\n❌ Failed to sign $AAB_PATH"
  exit 1
fi
