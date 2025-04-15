import { Stack } from "expo-router";

/**
 * Layout for the plant management screens
 *
 * This layout configures the stack navigation for all plant-related screens
 * within the gardens section, including individual plant detail and add screens.
 */
export default function PlantLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: "modal",
        animation: "slide_from_bottom",
      }}
    >
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: false,
          animation: "slide_from_left",
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          headerShown: false,
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
    </Stack>
  );
}
