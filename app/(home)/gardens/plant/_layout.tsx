import { Stack } from "expo-router";

/**
 * Layout for the plant management screens
 *
 * This layout configures the stack navigation for all plant-related screens
 * within the gardens section, including individual plant detail and add screens.
 */
export default function PlantLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
