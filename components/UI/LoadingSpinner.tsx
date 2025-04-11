import React from "react";
import { View } from "react-native";
import { PlantGrowthLoader, CompactPlantLoader } from "./PlantGrowthLoader";

/**
 * LoadingSpinner component for displaying a loading state
 *
 * Provides a consistent loading experience across the app with
 * brand-appropriate animation and styling
 *
 * @param message - Optional message to display below the spinner
 * @param iconSize - Size of the loading spinner (defaults to 40)
 * @param color - Color of the loading animation (defaults to brand green)
 * @param backgroundColor - Background color class for the container
 */
interface LoadingSpinnerProps {
  message?: string;
  iconSize?: number;
  color?: string;
  backgroundColor?: string;
}

export function LoadingSpinner({
  message = "Loading...",
  iconSize = 40,
  color = "#047857", // Brand green color
  backgroundColor = "bg-transparent",
}: LoadingSpinnerProps) {
  return (
    <View className="flex-1 justify-center items-center">
      <PlantGrowthLoader
        message={message}
        color={color}
        backgroundColor={backgroundColor}
      />
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
  color = "#047857", // Brand green color
}: CompactSpinnerProps) {
  return <CompactPlantLoader size={size} color={color} />;
}
