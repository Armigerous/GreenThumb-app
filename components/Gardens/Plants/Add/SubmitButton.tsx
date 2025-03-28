import { TouchableOpacity, Text, View, Animated, Easing } from "react-native";
import { useRef, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { CompactSpinner } from "@/components/UI/LoadingSpinner";

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
 * A consistent button component for form submissions with loading state support,
 * featuring a custom animated spinner for loading state rather than the default ActivityIndicator
 *
 * @param children - Button label/content
 * @param onPress - Button press handler
 * @param isDisabled - Whether the button should be disabled
 * @param loadingLabel - Button text when isLoading is true
 * @param isLoading - Whether the button should show a loading state
 * @param color - Button color theme (primary, secondary, destructive)
 * @param type - Button type (solid, outline)
 */
interface SubmitButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  isDisabled?: boolean;
  loadingLabel?: string;
  isLoading?: boolean;
  color?: "primary" | "secondary" | "destructive";
  type?: "solid" | "outline";
}

export default function SubmitButton({
  children,
  onPress,
  isDisabled = false,
  loadingLabel = "Submitting...",
  isLoading = false,
  color = "primary",
  type = "solid",
}: SubmitButtonProps) {
  // Determine button styles based on variant and states
  let buttonClass = "";
  let textClass = "";
  let spinnerColor = "white";

  const isButtonDisabled = isDisabled || isLoading;

  // Apply appropriate styles based on variant and disabled state
  if (color === "primary") {
    buttonClass = isButtonDisabled
      ? "bg-brand-300 border border-brand-400 opacity-70"
      : "bg-brand-500 border border-brand-600";
    textClass = "text-white";
    spinnerColor = "white";
  } else if (color === "secondary") {
    buttonClass = isButtonDisabled
      ? "border border-cream-400 bg-cream-300 opacity-70"
      : "border border-cream-400 bg-cream-200";
    textClass = isButtonDisabled ? "text-cream-500" : "text-foreground";
    spinnerColor = "#5E994B"; // Brand color for better visibility on light background
  } else if (color === "destructive") {
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
      <View className="flex-row items-center justify-center">
        {isLoading ? (
          <View className="flex-row items-center space-x-2">
            <CompactSpinner size={18} color={spinnerColor} />
            <Text className={`font-medium ${textClass} ml-2`}>
              {loadingLabel}
            </Text>
          </View>
        ) : (
          <Text className={`font-medium ${textClass} text-center`}>
            {children}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
