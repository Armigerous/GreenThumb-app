import { tokenCache } from "@/cache";
import { ClerkProvider, ClerkLoaded, useAuth } from "@clerk/clerk-expo";
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { SWRConfig } from "swr";
import "./globals.css";
import { Platform, Text, View } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  checkSupabaseStorage,
  checkRequestingUserIdFunction,
} from "@/utils/initSupabase";

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
  const { isSignedIn, isLoaded } = useAuth();
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

  // Check if we have a publishable key
  useEffect(() => {
    if (!publishableKey) {
      console.error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in .env");
      setIsClerkReady(false);
    }
  }, [publishableKey]);

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
  );
}
