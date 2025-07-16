const { withNativeWind } = require("nativewind/metro");
const { getSentryExpoConfig } = require("@sentry/react-native/metro");

const config = getSentryExpoConfig(__dirname);

// Fix for Supabase realtime compatibility with Expo SDK 53
// This resolves the "node_modules/ws/lib/stream.js" Node.js import error
// Reference: https://github.com/supabase/supabase-js/issues/1400
config.resolver.unstable_enablePackageExports = false;

module.exports = withNativeWind(config, { input: "./app/globals.css" });
