import { TouchableOpacity, Text, View, Animated, Easing } from "react-native";
import { useRef, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";

/**
 * Custom animated loading spinner component that replaces the standard ActivityIndicator
 * Uses rotation animation with brand-appropriate styling for a seamless visual experience
 *
 * @param color - The color of the spinner
 * @param size - The size of the spinner (defaults to 16)
 */
const LoadingSpinner = ({
  color,
  size = 16,
}: {
  color: string;
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
      <Ionicons name="sync-outline" size={size} color={color} />
    </Animated.View>
  );
};

/**
 * SubmitButton component for form submissions
 *
 * A consistent button component for form submissions with loading state support,
 * featuring a custom animated spinner for loading state rather than the default ActivityIndicator
 *
 * @param onPress - Function to call when the button is pressed
 * @param label - Button text to display
 * @param loadingLabel - Button text when isLoading is true
 * @param isLoading - Whether the button should show a loading state
 * @param isDisabled - Whether the button should be disabled
 * @param variant - Button style variant ('primary', 'secondary', or 'danger')
 */
interface SubmitButtonProps {
  onPress: () => void;
  label: string;
  loadingLabel?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
}

export default function SubmitButton({
  onPress,
  label,
  loadingLabel = "Submitting...",
  isLoading = false,
  isDisabled = false,
  variant = "primary",
}: SubmitButtonProps) {
  // Determine button styles based on variant and states
  let buttonClass = "";
  let textClass = "";
  let spinnerColor = "white";

  const isButtonDisabled = isDisabled || isLoading;

  // Apply appropriate styles based on variant and disabled state
  if (variant === "primary") {
    buttonClass = isButtonDisabled
      ? "bg-brand-300 border border-brand-400 opacity-70"
      : "bg-brand-500 border border-brand-600";
    textClass = "text-white";
    spinnerColor = "white";
  } else if (variant === "secondary") {
    buttonClass = isButtonDisabled
      ? "border border-cream-400 bg-cream-300 opacity-70"
      : "border border-cream-400 bg-cream-200";
    textClass = isButtonDisabled ? "text-cream-500" : "text-foreground";
    spinnerColor = "#5E994B"; // Brand color for better visibility on light background
  } else if (variant === "danger") {
    buttonClass = isButtonDisabled ? "bg-red-300 opacity-70" : "bg-red-500";
    textClass = "text-white";
    spinnerColor = "white";
  }

  return (
    <TouchableOpacity
      className={`rounded-xl py-3 px-6 ${buttonClass}`}
      onPress={onPress}
      disabled={isButtonDisabled}
      accessible={!isButtonDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isButtonDisabled, busy: isLoading }}
      accessibilityHint={isLoading ? "Processing, please wait" : undefined}
    >
      {isLoading ? (
        <View className="flex-row items-center justify-center">
          <LoadingSpinner color={spinnerColor} size={18} />
          <Text className={`font-medium ${textClass} ml-2`}>
            {loadingLabel}
          </Text>
        </View>
      ) : (
        <Text className={`font-medium ${textClass} text-center`}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}
