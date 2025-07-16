#!/bin/bash

# Safe Sentry Testing Script
# This script safely tests source maps without breaking existing functionality

echo "🧪 Safe Sentry Testing Script"
echo "============================="

# Create backup directory
BACKUP_DIR="./backup/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📦 Creating backup in $BACKUP_DIR"

# Backup current configuration
cp eas.json "$BACKUP_DIR/eas.json.backup"
cp app.config.js "$BACKUP_DIR/app.config.js.backup"
cp ios/.xcode.env "$BACKUP_DIR/.xcode.env.backup" 2>/dev/null || echo "No .xcode.env to backup"

echo "✅ Configuration backed up"

# Function to restore from backup
restore_backup() {
    echo ""
    echo "🔄 Restoring from backup..."
    cp "$BACKUP_DIR/eas.json.backup" eas.json
    cp "$BACKUP_DIR/app.config.js.backup" app.config.js
    if [ -f "$BACKUP_DIR/.xcode.env.backup" ]; then
        cp "$BACKUP_DIR/.xcode.env.backup" ios/.xcode.env
    fi
    echo "✅ Configuration restored"
}

# Function to test current configuration
test_current() {
    echo ""
    echo "🔍 Testing current configuration..."
    
    # Test Sentry config
    ./scripts/configure-sentry.sh test
    
    # Check for conflicts
    echo ""
    echo "🔍 Checking for configuration conflicts..."
    
    # Check if production has source maps enabled
    if grep -q "SENTRY_UPLOAD_SOURCE_MAPS.*true" eas.json; then
        echo "✅ Production profile has source maps enabled"
    else
        echo "⚠️  Production profile does not have source maps enabled"
    fi
    
    # Check if development has source maps disabled
    if grep -q "SENTRY_DISABLE_AUTO_UPLOAD.*true" eas.json; then
        echo "✅ Development profiles have source maps disabled"
    else
        echo "⚠️  Development profiles may have source maps enabled"
    fi
    
    # Check app.config.js
    if grep -q "uploadSourceMaps.*true" app.config.js; then
        echo "✅ app.config.js has source maps enabled"
    else
        echo "⚠️  app.config.js has source maps disabled"
    fi
}

# Function to create safe test configuration
create_safe_test() {
    echo ""
    echo "🔧 Creating safe test configuration..."
    
    # Create a test profile that's identical to production but with source maps disabled
    cat > eas.json << 'EOF'
{
  "cli": {
    "version": ">= 16.10.1",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "channel": "development",
      "ios": {
        "resourceClass": "m-medium"
      },
      "env": {
        "SENTRY_DISABLE_AUTO_UPLOAD": "true",
        "SENTRY_ALLOW_FAILURE": "true"
      }
    },
    "preview": {
      "distribution": "internal",
      "channel": "preview",
      "ios": {
        "resourceClass": "m-medium"
      },
      "env": {
        "SENTRY_DISABLE_AUTO_UPLOAD": "true",
        "SENTRY_ALLOW_FAILURE": "true"
      }
    },
    "production": {
      "autoIncrement": true,
      "channel": "production",
      "ios": {
        "resourceClass": "m-medium"
      },
      "env": {
        "SENTRY_DISABLE_AUTO_UPLOAD": "true",
        "SENTRY_ALLOW_FAILURE": "true"
      }
    },
    "production-with-sourcemaps": {
      "autoIncrement": true,
      "channel": "production",
      "ios": {
        "resourceClass": "m-medium"
      },
      "env": {
        "SENTRY_ORG": "eren-kahveci",
        "SENTRY_PROJECT": "greenthumb",
        "SENTRY_URL": "https://sentry.io/",
        "SENTRY_AUTH_TOKEN": "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",
        "SENTRY_RELEASE_NAME": "greenthumb-ios",
        "SENTRY_DIST": "1",
        "SENTRY_UPLOAD_SOURCE_MAPS": "true"
      }
    },
    "apk": {
      "android": {
        "buildType": "apk"
      },
      "distribution": "internal",
      "channel": "apk",
      "env": {
        "SENTRY_DISABLE_AUTO_UPLOAD": "true",
        "SENTRY_ALLOW_FAILURE": "true"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
EOF

    # Disable source maps in app.config.js for safety
    sed -i '' 's/uploadSourceMaps: true/uploadSourceMaps: false/' app.config.js
    
    # Ensure .xcode.env has source maps disabled
    cat > ios/.xcode.env << 'EOF'
# Disable Sentry source map upload during build to prevent build failures
export SENTRY_DISABLE_AUTO_UPLOAD=true
export SENTRY_ALLOW_FAILURE=true
EOF

    echo "✅ Safe test configuration created"
    echo "📝 Now you have:"
    echo "   - 'production' profile: Source maps DISABLED (safe)"
    echo "   - 'production-with-sourcemaps' profile: Source maps ENABLED (test)"
    echo "   - All other profiles: Source maps DISABLED (safe)"
}

# Function to show usage
show_usage() {
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  test     - Test current configuration for conflicts"
    echo "  safe     - Create safe test configuration (source maps disabled by default)"
    echo "  restore  - Restore from backup"
    echo "  help     - Show this help message"
    echo ""
    echo "Safe Testing Workflow:"
    echo "  1. $0 test     # Check current state"
    echo "  2. $0 safe     # Create safe configuration"
    echo "  3. eas build --platform ios --profile production  # Test safe build"
    echo "  4. eas build --platform ios --profile production-with-sourcemaps  # Test with source maps"
    echo "  5. $0 restore  # Restore original if needed"
    echo ""
}

# Main script logic
case "${1:-help}" in
    "test")
        test_current
        ;;
    "safe")
        create_safe_test
        test_current
        ;;
    "restore")
        restore_backup
        ;;
    "help"|*)
        show_usage
        ;;
esac 