import { TouchableOpacity, Text, View } from "react-native";
import { CompactSpinner } from "@/components/UI/LoadingSpinner";

/**
 * SubmitButton component for form submissions with loading state
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
      : "bg-primary";
    textClass = "text-primary-foreground";
    spinnerColor = "white";
  } else if (color === "secondary") {
    buttonClass = isButtonDisabled
      ? "border border-cream-400 bg-cream-300 opacity-70"
      : "border border-cream-400 bg-cream-200";
    textClass = isButtonDisabled ? "text-cream-500" : "text-foreground";
    spinnerColor = "#047857"; // Brand color for better visibility on light background
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
