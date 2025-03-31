import { Redirect, Stack } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { ActivityIndicator, View } from "react-native";
import { useEffect } from "react";

export default function AuthRoutesLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
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
        name="sign-in"
        options={{
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="sign-up"
        options={{
          animation: "slide_from_right",
        }}
      />
    </Stack>
  );
}
