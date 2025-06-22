import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function GardensLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          animation: "slide_from_left",
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
