import { tokenCache } from "@/cache";
import { ClerkProvider, ClerkLoaded, useAuth } from "@clerk/clerk-expo";
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { SWRConfig } from "swr";
import "./globals.css";
import { Platform, Text, View } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { initSentry, setUser, addBreadcrumb } from "@/lib/sentry";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import {
  checkSupabaseStorage,
  checkRequestingUserIdFunction,
} from "@/utils/initSupabase";
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

// This component handles authentication routing
function InitialLayout() {
  const { isSignedIn, isLoaded, userId } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (isSignedIn && inAuthGroup) {
      // Redirect to home if user is signed in and trying to access auth screens
      router.replace("/");
    } else if (!isSignedIn && !inAuthGroup && segments[0] !== undefined) {
      // Redirect to welcome screen if user is not signed in and trying to access protected screens
      router.replace("/(auth)/welcome");
    }
  }, [isSignedIn, isLoaded, segments]);

  // Set user context in Sentry when authentication state changes
  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn && userId) {
        setUser({ id: userId });
        addBreadcrumb("User signed in", "auth");
      } else {
        setUser({});
        addBreadcrumb("User signed out", "auth");
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
              });
          }
        }, 4000); // Increase delay to ensure RLS function check completes first
      } catch (error) {
        console.error("Error setting up storage services:", error);
      }
    }
  }, [isSignedIn]);

  return <Slot />;
}

export default function RootLayout() {
  const [isClerkReady, setIsClerkReady] = useState(true);
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // Initialize Sentry
  useEffect(() => {
    initSentry();
    addBreadcrumb("App started", "navigation");
  }, []);

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
              <InitialLayout />
            </SWRConfig>
          </QueryClientProvider>
        </ClerkLoaded>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}
