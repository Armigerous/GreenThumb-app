import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function PlantsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[slug]"
        options={{
          headerShown: true,
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
