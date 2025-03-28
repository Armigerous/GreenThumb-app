import React from "react";
import { View, Text } from "react-native";
import { PlantGrowthLoader, CompactPlantLoader } from "./PlantGrowthLoader";

/**
 * LoadingSpinner component for displaying a loading state
 *
 * Provides a consistent loading experience across the app with
 * brand-appropriate animation and styling
 *
 * @param message - Optional message to display below the spinner
 * @param iconSize - Size of the loading spinner (defaults to 40)
 */
interface LoadingSpinnerProps {
  message?: string;
  iconSize?: number;
}

export function LoadingSpinner({
  message = "Loading...",
  iconSize = 40,
}: LoadingSpinnerProps) {
  return (
    <View className="flex-1 justify-center items-center bg-cream-50">
      <PlantGrowthLoader message={message} color="#047857" />
    </View>
  );
}

/**
 * Compact version of the loading spinner for inline use
 */
interface CompactSpinnerProps {
  size?: number;
  color?: string;
}

export function CompactSpinner({
  size = 24,
  color = "#047857",
}: CompactSpinnerProps) {
  return <CompactPlantLoader size={size} color={color} />;
}
