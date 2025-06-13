module.exports = {
  expo: {
    name: "GreenThumb",
    slug: "greenthumb-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/logo.png",
    scheme: "greenthumb",
    userInterfaceStyle: "automatic",
    newArchEnabled: false,

    // Splash screen configuration
    splash: {
      image: "./assets/images/logo.png",
      imageWidth: 200,
      resizeMode: "contain",
      backgroundColor: "#fff8e8",
    },

    // Plugin configurations
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
      "expo-updates",
      "expo-asset",
      [
        "expo-image-picker",
        {
          photosPermission:
            "The app needs access to your photos to let you add images of your plants.",
          cameraPermission:
            "The app needs access to your camera to let you take photos of your plants.",
        },
      ],
    ],

    // Experimental features
    experiments: {
      typedRoutes: true,
    },

    // Update configuration
    updates: {
      enabled: true,
      fallbackToCacheTimeout: 0,
      url: "https://u.expo.dev/e0e1a7e6-9d15-4a3c-92c3-85401a72814d",
    },

    runtimeVersion: "1.0.0",

    // Platform specific configurations
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.tugraerenk.greenthumb",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/logo.png",
        backgroundColor: "#ffffff",
      },
      package: "com.tugraerenk.greenthumb",
    },
    web: {
      favicon: "./assets/images/logo.png",
    },

    // Asset patterns
    assetBundlePatterns: ["**/*"],

    // Extra configuration including environment variables
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: "5b3f0f1a-b3f6-4765-9be3-9be62ab4b53c",
      },
      // Public environment variables referenced from .env
      EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY:
        process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
      EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      EXPO_PUBLIC_OPENWEATHER_API_KEY:
        process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY,
    },

    // Owner information
    owner: "armigerous",
  },
};
