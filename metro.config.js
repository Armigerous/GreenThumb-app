const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

// Get default Expo config
const config = getDefaultConfig(__dirname);

// Fix for Supabase realtime compatibility with Expo SDK 53
// This resolves the "node_modules/ws/lib/stream.js" Node.js import error
// CRITICAL: Also prevents NativeWind bundling loops
// Reference: https://github.com/supabase/supabase-js/issues/1400
config.resolver.unstable_enablePackageExports = false;

// Additional Metro resolver optimizations to prevent NativeWind bundling loops
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Increase Metro's max workers and add timeout to prevent hanging
config.maxWorkers = 2;
config.resetCache = true;

// Apply NativeWind with minimal configuration to reduce bundling complexity
module.exports = withNativeWind(config, {
  input: "./app/globals.css"
});
