import React from "react";
import { View } from "react-native";
import { PlantGrowthLoader, CompactPlantLoader } from "./PlantGrowthLoader";
import AnimatedTransition from "./AnimatedTransition";

/**
 * LoadingSpinner component for displaying a loading state
 *
 * Provides a consistent loading experience across the app with
 * brand-appropriate animation and styling
 *
 * @param message - Optional message to display below the spinner
 * @param color - Color of the loading animation (defaults to brand green)
 * @param backgroundColor - Background color class for the container
 * @param animated - Whether to animate the entrance of the spinner (defaults to true)
 */
interface LoadingSpinnerProps {
  message?: string;
  color?: string;
  backgroundColor?: string;
  animated?: boolean;
}

export function LoadingSpinner({
  message = "Loading...",
  color = "#5E994B", // Brand primary color
  backgroundColor = "bg-transparent",
  animated = true,
}: LoadingSpinnerProps) {
  const content = (
    <PlantGrowthLoader
      message={message}
      color={color}
      backgroundColor={backgroundColor}
    />
  );

  if (!animated) {
    return (
      <View className="flex-1 justify-center items-center">{content}</View>
    );
  }

  return (
    <View className="flex-1 justify-center items-center">
      <AnimatedTransition delay={100} duration={300} initialY={0}>
        {content}
      </AnimatedTransition>
    </View>
  );
}

/**
 * Compact version of the loading spinner for inline use
 */
interface CompactSpinnerProps {
  size?: number;
  color?: string;
  animated?: boolean;
}

export function CompactSpinner({
  size = 24,
  color = "#5E994B", // Brand primary color
  animated = true,
}: CompactSpinnerProps) {
  if (!animated) {
    return <CompactPlantLoader size={size} color={color} />;
  }

  return (
    <AnimatedTransition delay={50} duration={200} initialY={0}>
      <CompactPlantLoader size={size} color={color} />
    </AnimatedTransition>
  );
}
