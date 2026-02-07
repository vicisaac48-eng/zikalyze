#!/bin/bash

# Health Check Script for Zikalyze Web App
# This script builds the app, starts the preview server, runs health checks, and cleans up

set -e

echo "🏗️  Building the application..."
npm run build

echo ""
echo "🚀 Starting preview server..."
# Start preview server in background
npx vite preview --host :: --port 8080 > /dev/null 2>&1 &
SERVER_PID=$!

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🧹 Cleaning up..."
    if [ ! -z "$SERVER_PID" ]; then
        kill $SERVER_PID 2>/dev/null || true
    fi
    exit $1
}

# Set trap to cleanup on script exit
trap 'cleanup $?' EXIT INT TERM

echo "⏳ Waiting for server to start..."
# Wait for server to be ready
max_attempts=30
attempt=0
until curl -s http://localhost:8080 > /dev/null 2>&1; do
    attempt=$((attempt + 1))
    if [ $attempt -ge $max_attempts ]; then
        echo "❌ Server failed to start after 30 seconds"
        cleanup 1
    fi
    sleep 1
done

echo "✅ Server is ready!"
echo ""
echo "🧪 Running health checks..."
PLAYWRIGHT_NO_WEBSERVER=1 npx playwright test

# Check test results
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ All health checks passed! The web app is working perfectly."
    cleanup 0
else
    echo ""
    echo "❌ Some health checks failed. Check the output above for details."
    cleanup 1
fi
