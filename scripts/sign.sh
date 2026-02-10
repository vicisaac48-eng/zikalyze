#!/bin/bash

###############################################################################
# Super Simple AAB Signing Wrapper
# 
# This is a friendly wrapper that ensures the auto_sign_aab.sh script runs
# correctly even if you're not in the right directory.
###############################################################################

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Find the project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

echo ""
echo -e "${BLUE}🚀 Zikalyze Automated AAB Signing${NC}"
echo ""

# Check if we're in the right place
if [ ! -f "$PROJECT_ROOT/scripts/auto_sign_aab.sh" ]; then
    echo -e "${RED}❌ Error: Cannot find auto_sign_aab.sh${NC}"
    echo ""
    echo "Make sure you're running this from the Zikalyze project directory."
    exit 1
fi

# Change to project root
cd "$PROJECT_ROOT"
echo -e "${GREEN}✅ Found project at: $PROJECT_ROOT${NC}"
echo ""

# Run the actual signing script
exec ./scripts/auto_sign_aab.sh
