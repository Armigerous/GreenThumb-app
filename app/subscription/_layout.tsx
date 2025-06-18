import { Stack } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { ActivityIndicator, View } from "react-native";
import { useEffect } from "react";

export default function SubscriptionLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    console.log(
      "📱 Subscription Layout: Component mounted - Subscription routes layout initialized"
    );
    console.log(
      "🔍 Subscription Layout: isLoaded:",
      isLoaded,
      "isSignedIn:",
      isSignedIn
    );
  }, []);

  if (!isLoaded) {
    console.log("⏳ Subscription Layout: Auth state loading...");
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#5E994B" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        gestureEnabled: true,
        gestureDirection: "horizontal",
        animationDuration: 300,
        presentation: "card",
      }}
      screenListeners={{
        transitionStart: (e) => {
          console.log(
            "📍 Subscription Navigation: Transition started",
            e.data.closing ? "to previous screen" : "to new screen"
          );
        },
        transitionEnd: (e) => {
          console.log(
            "📍 Subscription Navigation: Transition completed",
            e.data.closing ? "to previous screen" : "to new screen"
          );
        },
      }}
    >
      <Stack.Screen
        name="pricing"
        options={{
          title: "Choose Your Plan",
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="checkout"
        options={{
          title: "Complete Purchase",
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="subscription-success"
        options={{
          title: "Welcome to Premium!",
          animation: "fade_from_bottom",
          gestureEnabled: false, // Prevent going back from success screen
        }}
      />
      <Stack.Screen
        name="subscription"
        options={{
          title: "Manage Subscription",
          animation: "slide_from_right",
        }}
      />
    </Stack>
  );
}
