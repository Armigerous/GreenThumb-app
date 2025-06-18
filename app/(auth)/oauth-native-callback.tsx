import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

export default function OAuthCallback() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    console.log(
      "📱 OAuth Callback: Component mounted - User arrived at OAuth callback"
    );
    console.log(
      "🔄 OAuth Callback - isLoaded:",
      isLoaded,
      "isSignedIn:",
      isSignedIn
    );
    console.log("🔄 OAuth Callback - userId:", userId);
    console.log("🔄 OAuth Callback - params:", params);

    if (isLoaded) {
      if (isSignedIn) {
        console.log("🚀 OAuth Callback: Success - navigating to home");
        console.log(
          "📍 Navigation triggered from: OAuth Callback -> Home (Success)"
        );
        router.replace("/");
      } else {
        console.log("🔙 OAuth Callback: Failed - returning to auth screen");
        console.log(
          "📍 Navigation triggered from: OAuth Callback -> Auth Screen (Failed)"
        );
        router.replace("/(auth)/auth");
      }
    }
  }, [isLoaded, isSignedIn, router, userId, params]);

  return (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" />
    </View>
  );
}
