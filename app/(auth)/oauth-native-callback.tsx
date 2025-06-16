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
      "🔄 OAuth Callback - isLoaded:",
      isLoaded,
      "isSignedIn:",
      isSignedIn
    );
    console.log("🔄 OAuth Callback - userId:", userId);
    console.log("🔄 OAuth Callback - params:", params);

    if (isLoaded) {
      if (isSignedIn) {
        console.log("✅ OAuth Success - Redirecting to home");
        router.replace("/");
      } else {
        console.log("❌ OAuth Failed - Redirecting to auth");
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
