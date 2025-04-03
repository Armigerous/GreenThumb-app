import { Redirect, Stack } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { ActivityIndicator, View } from "react-native";
import { useEffect } from "react";

export default function AuthRoutesLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (isSignedIn) {
    return <Redirect href={"/(home)"} />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        presentation: "card",
        gestureEnabled: true,
        gestureDirection: "horizontal",
      }}
      initialRouteName="welcome"
    />
  );
}
