import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

export default function OAuthCallback() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/");
    } else if (isLoaded && !isSignedIn) {
      router.replace("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  return (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" />
    </View>
  );
}
