import { Redirect, Stack } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { ActivityIndicator, View } from "react-native";
import { useEffect } from "react";

export default function AuthRoutesLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    console.log(
      "📱 Auth Layout: Component mounted - Auth routes layout initialized"
    );
    console.log(
      "🔍 Auth Layout: isLoaded:",
      isLoaded,
      "isSignedIn:",
      isSignedIn
    );
  }, []);

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn) {
        console.log("🚀 Auth Layout: User is signed in - redirecting to home");
        console.log(
          "📍 Navigation triggered from: Auth Layout -> Home (Already Signed In)"
        );
      } else {
        console.log(
          "📋 Auth Layout: User not signed in - staying in auth flow"
        );
      }
    }
  }, [isLoaded, isSignedIn]);

  if (!isLoaded) {
    console.log("⏳ Auth Layout: Auth state loading...");
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#5E994B" />
      </View>
    );
  }

  if (isSignedIn) {
    return <Redirect href={"/"} />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade_from_bottom",
        gestureEnabled: true,
        gestureDirection: "horizontal",
        animationDuration: 250,
        presentation: "card",
      }}
      screenListeners={{
        transitionStart: (e) => {
          // Optional: Handle transition start if needed
        },
        transitionEnd: (e) => {
          // Optional: Handle transition end if needed
        },
      }}
      initialRouteName="welcome"
    >
      <Stack.Screen
        name="welcome"
        options={{
          animation: "slide_from_left",
        }}
      />
      <Stack.Screen
        name="auth"
        options={{
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="oauth-native-callback"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
