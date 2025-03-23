import React, { useRef, useEffect } from "react";
import { View, Text, Animated, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * Reusable animated spinner component for application-wide loading states
 * Provides a consistent and visually appealing loading experience across the app
 *
 * @param color - The color of the spinner icon
 * @param size - The size of the spinner
 * @param icon - The icon name to use (default is leaf-outline for garden theme)
 */
const AnimatedSpinner = ({
  color = "#047857",
  size = 32,
  icon = "leaf-outline",
}: {
  color?: string;
  size?: number;
  icon?: keyof typeof Ionicons.glyphMap;
}) => {
  // Create rotation animation value
  const spinValue = useRef(new Animated.Value(0)).current;

  // Set up rotation animation
  useEffect(() => {
    // Create infinite rotation animation
    const startRotation = () => {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    };

    startRotation();

    // Clean up animation on unmount
    return () => {
      spinValue.stopAnimation();
    };
  }, [spinValue]);

  // Map 0-1 to 0-360 degrees rotation
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View
      style={{
        transform: [{ rotate: spin }],
        width: size,
        height: size,
      }}
    >
      <Ionicons name={icon} size={size} color={color} />
    </Animated.View>
  );
};

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
      <AnimatedSpinner color="#047857" size={iconSize} />
      <Text className="mt-3 text-base text-cream-600">{message}</Text>
    </View>
  );
}
