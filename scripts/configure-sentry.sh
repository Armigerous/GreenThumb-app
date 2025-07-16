#!/bin/bash

# Sentry Configuration Script for GreenThumb
# This script helps configure Sentry with source maps for different build environments

echo "🔧 Sentry Configuration Script"
echo "=============================="

# Function to show current configuration
show_config() {
    echo ""
    echo "📋 Current Configuration:"
    echo "   Organization: eren-kahveci"
    echo "   Project: greenthumb"
    echo "   URL: https://sentry.io/"
    echo "   Auth Token: Configured in sentry.properties"
    echo ""
}

# Function to enable source maps
enable_source_maps() {
    echo "✅ Enabling source map uploads..."
    
    # Update .xcode.env
    cat > ios/.xcode.env << EOF
# Sentry configuration for iOS builds
# Source maps will be uploaded automatically for production builds

# Uncomment the line below to disable source map upload during development
# export SENTRY_DISABLE_AUTO_UPLOAD=true
EOF
    
    echo "✅ Source maps enabled for production builds"
    echo "📝 Development builds can still disable uploads by uncommenting the line in ios/.xcode.env"
}

# Function to disable source maps
disable_source_maps() {
    echo "⚠️  Disabling source map uploads..."
    
    # Update .xcode.env
    cat > ios/.xcode.env << EOF
# Disable Sentry source map upload during build to prevent build failures
export SENTRY_DISABLE_AUTO_UPLOAD=true
export SENTRY_ALLOW_FAILURE=true
EOF
    
    echo "✅ Source maps disabled for all builds"
    echo "📝 This will prevent build failures but reduce error tracking quality"
}

# Function to test Sentry configuration
test_sentry() {
    echo "🧪 Testing Sentry configuration..."
    
    # Check if sentry.properties files exist
    if [ -f "ios/sentry.properties" ] && [ -f "android/sentry.properties" ]; then
        echo "✅ Sentry properties files found"
    else
        echo "❌ Sentry properties files missing"
        return 1
    fi
    
    # Check auth token
    if grep -q "auth.token" ios/sentry.properties; then
        echo "✅ Auth token configured"
    else
        echo "❌ Auth token missing"
        return 1
    fi
    
    echo "✅ Sentry configuration looks good!"
}

# Main script logic
case "${1:-help}" in
    "enable")
        enable_source_maps
        show_config
        ;;
    "disable")
        disable_source_maps
        show_config
        ;;
    "test")
        test_sentry
        ;;
    "help"|*)
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  enable  - Enable source map uploads for production builds"
        echo "  disable - Disable source map uploads (prevents build failures)"
        echo "  test    - Test current Sentry configuration"
        echo "  help    - Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0 enable   # Enable source maps for better error tracking"
        echo "  $0 disable  # Disable source maps if builds are failing"
        echo "  $0 test     # Verify Sentry is configured correctly"
        echo ""
        ;;
esac 