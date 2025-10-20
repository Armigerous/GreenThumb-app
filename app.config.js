module.exports = {
	expo: {
		name: "GreenThumb",
		slug: "greenthumb-app",
		version: "1.0.1",
		orientation: "portrait",
		icon: "./assets/images/logo.png",
		scheme: "greenthumb",
		userInterfaceStyle: "automatic",
		newArchEnabled: true,

		// Splash screen configuration
		splash: {
			image: "./assets/images/logo-transparent.png",
			imageWidth: 200,
			resizeMode: "contain",
			backgroundColor: "#fff8e8",
			// Add these properties for better splash screen handling
			dark: {
				image: "./assets/images/logo-transparent.png",
				backgroundColor: "#1a1a1a",
			},
		},

		// Plugin configurations
		plugins: [
			[
				"@sentry/react-native/expo",
				{
					url: "https://sentry.io/",
					project: process.env.SENTRY_PROJECT || "greenthumb",
					organization: process.env.SENTRY_ORG || "eren-kahveci",
					// Enable source map upload for better error tracking
					uploadSourceMaps: false,
				},
			],
			[
				"expo-router",
				// Removed 'origin' to disable web support and make the app mobile-only
			],
			"expo-splash-screen",
			"expo-updates",
			"expo-asset",
			"expo-web-browser",
			"expo-font",
			"expo-secure-store",
			[
				"@stripe/stripe-react-native",
				{
					publishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
					merchantIdentifier: "merchant.com.tugraerenk.greenthumb",
				},
			],
			[
				"expo-image-picker",
				{
					photosPermission:
						"The app needs access to your photos to let you add images of your plants.",
					cameraPermission:
						"The app needs access to your camera to let you take photos of your plants.",
				},
			],
			[
				"expo-location",
				{
					locationAlwaysAndWhenInUsePermission:
						"Allow GreenThumb to use your location to provide local weather updates and frost warnings for your garden.",
					locationAlwaysPermission:
						"Allow GreenThumb to use your location to provide local weather updates and frost warnings for your garden.",
					locationWhenInUsePermission:
						"Allow GreenThumb to use your location to provide local weather updates and frost warnings for your garden.",
				},
			],
		],

		// Experimental features
		// experiments: {
		//   typedRoutes: true,
		// },

		// Update configuration
		updates: {
			enabled: true,
			fallbackToCacheTimeout: 0,
			url: "https://u.expo.dev/e0e1a7e6-9d15-4a3c-92c3-85401a72814d",
		},

		runtimeVersion: "1.0.1",

		// Platform specific configurations
		ios: {
			supportsTablet: true,
			bundleIdentifier: "com.tugraerenk.greenthumb",
			infoPlist: {
				ITSAppUsesNonExemptEncryption: false,
			},
		},
		android: {
			adaptiveIcon: {
				foregroundImage: "./assets/images/logo.png",
				backgroundColor: "#ffffff",
			},
			package: "com.tugraerenk.greenthumb",
		},
		// Web configuration removed to prevent SSR build issues during mobile builds
		// web: {
		//   output: "server",
		//   favicon: "./assets/images/logo.png",
		// },

		// Asset patterns
		assetBundlePatterns: ["**/*"],

		// Extra configuration including environment variables
		extra: {
			// router: {
			//   origin: "https://greenthumb.expo.app", // Removed to disable web support
			// },
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
			EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY:
				process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
			// Sentry configuration
			SENTRY_DSN: process.env.SENTRY_DSN,
			SENTRY_PROJECT: process.env.SENTRY_PROJECT,
			SENTRY_ORG: process.env.SENTRY_ORG,
			// Server-side only variables (not exposed to client)
			SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
			OPENAI_API_KEY: process.env.OPENAI_API_KEY,
			STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
			STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
		},

		// Owner information
		owner: "armigerous",
	},
};
