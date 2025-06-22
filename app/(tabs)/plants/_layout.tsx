import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

export default function PlantsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[slug]"
        options={{
          headerShown: false,
          headerBackTitle: "Plants",
          presentation: "card",
          headerLeft: ({ tintColor }) => (
            <Ionicons
              name="arrow-back"
              size={24}
              color={tintColor}
              className="mr-2"
            />
          ),
        }}
      />
    </Stack>
  );
}
