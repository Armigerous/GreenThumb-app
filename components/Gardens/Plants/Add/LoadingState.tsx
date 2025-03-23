import { View, Text, SafeAreaView, Animated, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRef, useEffect } from "react";

/**
 * Custom animated loading spinner that replaces the standard ActivityIndicator
 * Uses rotation animation with brand-appropriate styling for a better visual experience
 *
 * @param color - The color of the spinner icon
 * @param size - The size of the spinner (defaults to 32)
 */
const AnimatedSpinner = ({
  color = "#5E994B",
  size = 32,
}: {
  color?: string;
  size?: number;
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
      <Ionicons name="leaf-outline" size={size} color={color} />
    </Animated.View>
  );
};

/**
 * LoadingState component for displaying a loading spinner
 *
 * Shows a centered custom animated loading spinner with an optional message.
 * Uses a brand-appropriate animation that fits with the app's garden theme.
 *
 * @param message - Optional message to display below the spinner
 */
interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({
  message = "Loading...",
}: LoadingStateProps) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 justify-center items-center">
        <AnimatedSpinner color="#5E994B" size={48} />
        <Text className="mt-4 text-cream-600">{message}</Text>
      </View>
    </SafeAreaView>
  );
}
