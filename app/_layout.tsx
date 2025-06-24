import { tokenCache } from "@/cache";
import { ClerkProvider, ClerkLoaded, useAuth } from "@clerk/clerk-expo";
import { Slot, Redirect, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { SWRConfig } from "swr";
import "./globals.css";
import { Platform, Text, View } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as Sentry from "@sentry/react-native";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import {
  checkSupabaseStorage,
  checkRequestingUserIdFunction,
} from "@/utils/initSupabase";
import Constants from "expo-constants";
import {
  useFonts,
  Mali_200ExtraLight,
  Mali_300Light,
  Mali_400Regular,
  Mali_500Medium,
  Mali_600SemiBold,
  Mali_700Bold,
  Mali_200ExtraLight_Italic,
  Mali_300Light_Italic,
  Mali_400Regular_Italic,
  Mali_500Medium_Italic,
  Mali_600SemiBold_Italic,
  Mali_700Bold_Italic,
} from "@expo-google-fonts/mali";
import {
  Nunito_200ExtraLight,
  Nunito_300Light,
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
  Nunito_200ExtraLight_Italic,
  Nunito_300Light_Italic,
  Nunito_400Regular_Italic,
  Nunito_500Medium_Italic,
  Nunito_600SemiBold_Italic,
  Nunito_700Bold_Italic,
  Nunito_800ExtraBold_Italic,
  Nunito_900Black_Italic,
} from "@expo-google-fonts/nunito";
import { LoadingSpinner } from "@/components/UI/LoadingSpinner";

// Initialize Sentry once at module level to prevent reinitialization
const sentryDsn = Constants.expoConfig?.extra?.SENTRY_DSN;
let sentryInitialized = false;

if (sentryDsn && !sentryInitialized) {
  console.log(
    "🔧 Initializing Sentry with DSN:",
    sentryDsn.substring(0, 20) + "..."
  );

  Sentry.init({
    dsn: sentryDsn,
    debug: __DEV__,
    environment: __DEV__ ? "development" : "production",
    tracesSampleRate: __DEV__ ? 1.0 : 0.2,
    _experiments: {
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    },
    integrations: [
      Sentry.mobileReplayIntegration({
        maskAllText: true,
        maskAllImages: true,
        maskAllVectors: true,
      }),
      Sentry.feedbackIntegration({
        // Additional configuration goes here
      }),
    ],
  });

  Sentry.addBreadcrumb({
    message: "App started",
    category: "navigation",
    level: "info",
  });

  sentryInitialized = true;
  console.log("✅ Sentry initialized successfully");
} else if (!sentryDsn) {
  console.warn("⚠️ SENTRY_DSN not found in app config");
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Default settings for all queries
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// This component handles the app initialization and providers
function RootNavigator() {
  const { isSignedIn, isLoaded, userId } = useAuth();
  const [navigationReady, setNavigationReady] = useState(false);
  const segments = useSegments();

  // Determine if the current route is an auth route
  const isAuthRoute = segments[0] === "(auth)";

  useEffect(() => {
    console.log("📱 Root Navigator: Component mounted - App initialization");
    console.log(
      "🔍 Root Navigator: Auth state - isLoaded:",
      isLoaded,
      "isSignedIn:",
      isSignedIn
    );
  }, [isLoaded, isSignedIn]);

  // Set user context in Sentry when authentication state changes
  useEffect(() => {
    if (isLoaded && sentryInitialized) {
      if (isSignedIn && userId) {
        Sentry.setUser({ id: userId });
        Sentry.addBreadcrumb({
          message: "User signed in",
          category: "auth",
          level: "info",
        });
      } else {
        Sentry.setUser({});
        Sentry.addBreadcrumb({
          message: "User signed out",
          category: "auth",
          level: "info",
        });
      }
    }
  }, [isSignedIn, isLoaded, userId]);

  // Initialize Supabase storage check when user is signed in
  useEffect(() => {
    if (isSignedIn && Platform.OS !== "web") {
      try {
        // Check Supabase storage buckets and RLS function - add delay to ensure auth is ready
        let storageChecked = false;
        let rlsFunctionChecked = false;

        // Session variable to disable developer notices for this session
        const storageNoticesDisabled = { current: false };

        // First check the requesting_user_id function
        setTimeout(() => {
          if (!rlsFunctionChecked) {
            checkRequestingUserIdFunction()
              .then((userId) => {
                rlsFunctionChecked = true;
                console.log("RLS function check complete, user ID:", userId);
              })
              .catch((error) => {
                console.error("Failed to check RLS function:", error);
                if (sentryInitialized) {
                  Sentry.captureException(error, {
                    tags: { component: "RLS_function_check" },
                    extra: { userId: userId },
                  });
                }
              });
          }
        }, 2000);

        // Then check storage buckets
        setTimeout(() => {
          if (!storageChecked && !storageNoticesDisabled.current) {
            checkSupabaseStorage()
              .then((isReady) => {
                storageChecked = true;
                console.log("Storage check complete, bucket ready:", isReady);

                // If the check says the bucket is ready (or might be), disable future alerts
                if (isReady) {
                  storageNoticesDisabled.current = true;
                  console.log("Storage notices disabled for this session");
                }
              })
              .catch((error) => {
                console.error("Failed to check Supabase storage:", error);
                if (sentryInitialized) {
                  Sentry.captureException(error, {
                    tags: { component: "supabase_storage_check" },
                    extra: { userId: userId },
                  });
                }
              });
          }
        }, 4000); // Increase delay to ensure RLS function check completes first
      } catch (error) {
        console.error("Error setting up storage services:", error);
        if (sentryInitialized) {
          Sentry.captureException(error as Error, {
            tags: { component: "storage_services_setup" },
            extra: { userId: userId },
          });
        }
      }
    }
  }, [isSignedIn, userId]);

  // Add a small delay to prevent immediate redirects that cause loops
  useEffect(() => {
    if (isLoaded) {
      const timer = setTimeout(() => {
        setNavigationReady(true);
      }, 200); // Increased delay to prevent race conditions
      return () => clearTimeout(timer);
    }
  }, [isLoaded]);

  // Show loading spinner while auth state is being determined
  if (!isLoaded || !navigationReady) {
    console.log("⏳ Root Navigator: Auth state loading...");
    return <LoadingSpinner message="Loading..." />;
  }

  // Redirect unauthorized users to welcome screen, unless already on an auth route
  if (!isSignedIn && navigationReady && !isAuthRoute) {
    console.log(
      "🔒 Unauthorized user detected, redirecting to / (auth)/welcome"
    );
    return <Redirect href="/(auth)/welcome" />;
  }

  console.log(
    "✅ Root Navigator: Navigation ready - allowing router to handle routing"
  );
  return <Slot />;
}

function RootLayout() {
  const [isClerkReady, setIsClerkReady] = useState(true);
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // Load fonts
  const [fontsLoaded, fontError] = useFonts({
    Mali_200ExtraLight,
    Mali_300Light,
    Mali_400Regular,
    Mali_500Medium,
    Mali_600SemiBold,
    Mali_700Bold,
    Mali_200ExtraLight_Italic,
    Mali_300Light_Italic,
    Mali_400Regular_Italic,
    Mali_500Medium_Italic,
    Mali_600SemiBold_Italic,
    Mali_700Bold_Italic,
    Nunito_200ExtraLight,
    Nunito_300Light,
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
    Nunito_200ExtraLight_Italic,
    Nunito_300Light_Italic,
    Nunito_400Regular_Italic,
    Nunito_500Medium_Italic,
    Nunito_600SemiBold_Italic,
    Nunito_700Bold_Italic,
    Nunito_800ExtraBold_Italic,
    Nunito_900Black_Italic,
  });

  // Log font loading status
  useEffect(() => {
    if (fontsLoaded) {
      console.log("✅ All fonts loaded successfully");
      console.log("🔤 Mali and Nunito fonts are ready to use");
    }

    if (fontError) {
      console.error("❌ Font loading error:", fontError);
      console.log("📋 Attempted to load:", [
        "Mali_400Regular",
        "Mali_700Bold",
        "Nunito_400Regular",
        "Nunito_700Bold",
        "... and other weights",
      ]);
    }
  }, [fontsLoaded, fontError]);

  // Check if we have a publishable key
  useEffect(() => {
    if (!publishableKey) {
      console.error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in .env");
      setIsClerkReady(false);
    }
  }, [publishableKey]);

  // If fonts are not loaded or clerk is not ready, show loading screen
  if (!fontsLoaded && !fontError) {
    return <LoadingSpinner message="Loading fonts..." />;
  }

  // If font loading failed, log the error but continue
  if (fontError) {
    console.error("Error loading fonts:", fontError);
  }

  // If Clerk is not ready, show a fallback UI
  if (!isClerkReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <Text style={{ fontSize: 18, textAlign: "center", marginBottom: 20 }}>
          Authentication configuration is missing.
        </Text>
        <Text style={{ fontSize: 14, textAlign: "center", color: "#666" }}>
          Please add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to your .env file.
        </Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey!}>
        <ClerkLoaded>
          <QueryClientProvider client={queryClient}>
            <SWRConfig
              value={{
                provider: () => new Map(),
                revalidateOnFocus: false,
                revalidateOnReconnect: true,
              }}
            >
              <RootNavigator />
            </SWRConfig>
          </QueryClientProvider>
        </ClerkLoaded>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}

// Export without Sentry.wrap to prevent reinitialization loop
export default RootLayout;
