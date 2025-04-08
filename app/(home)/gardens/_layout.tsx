import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function GardensLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: "#fff8e8" },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="new"
        options={{
          headerShown: false,
          presentation: "fullScreenModal",
        }}
      />
      <Stack.Screen
        name="conditions"
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />

      <Stack.Screen
        name="plant"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
