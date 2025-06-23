import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";

export default function RootIndex() {
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    console.log(
      "📱 Root Index: Checking auth state - isLoaded:",
      isLoaded,
      "isSignedIn:",
      isSignedIn
    );
  }, [isLoaded, isSignedIn]);

  if (!isLoaded) {
    console.log("⏳ Root Index: Auth loading...");
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#5E994B" />
      </View>
    );
  }

  if (isSignedIn) {
    console.log("🚀 Root Index: User signed in - redirecting to home");
    return <Redirect href="/(tabs)" />;
  }

  console.log("🚀 Root Index: User not signed in - redirecting to welcome");
  return <Redirect href="/(auth)/welcome" />;
}
