#!/bin/bash

# Script to fix Sentry build issues for iOS
# This script sets the necessary environment variables to prevent Sentry build failures

echo "🔧 Fixing Sentry build configuration..."

# Set environment variables to disable Sentry auto-upload
export SENTRY_DISABLE_AUTO_UPLOAD=true
export SENTRY_ALLOW_FAILURE=true

# Create or update .xcode.env file
cat > ios/.xcode.env << EOF
# Disable Sentry source map upload during build to prevent build failures
export SENTRY_DISABLE_AUTO_UPLOAD=true
export SENTRY_ALLOW_FAILURE=true
EOF

echo "✅ Sentry build configuration updated"
echo "📝 Environment variables set:"
echo "   - SENTRY_DISABLE_AUTO_UPLOAD=true"
echo "   - SENTRY_ALLOW_FAILURE=true"
echo ""
echo "🚀 You can now run your iOS build without Sentry upload issues" 