import { tokenCache } from "@/cache";
import { ClerkProvider, ClerkLoaded, useAuth } from "@clerk/clerk-expo";
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { SWRConfig } from "swr";
import "./globals.css";
import { Platform, Text, View } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { configureBackgroundFetch } from "@/lib/backgroundService";

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

  // Initialize background service when user is signed in
  useEffect(() => {
    if (isSignedIn && Platform.OS !== "web") {
      // Configure background fetch for plant data updates
      configureBackgroundFetch();
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
