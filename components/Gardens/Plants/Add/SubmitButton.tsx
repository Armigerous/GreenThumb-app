import { TouchableOpacity, Text } from "react-native";

/**
 * SubmitButton component for form submissions
 *
 * A consistent button component for form submissions with loading state support
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

  const isButtonDisabled = isDisabled || isLoading;

  // Apply appropriate styles based on variant and disabled state
  if (variant === "primary") {
    buttonClass = isButtonDisabled
      ? "bg-brand-300 border border-brand-400 opacity-70"
      : "bg-brand-500 border border-brand-600";
    textClass = "text-white";
  } else if (variant === "secondary") {
    buttonClass = isButtonDisabled
      ? "border border-cream-400 bg-cream-300 opacity-70"
      : "border border-cream-400 bg-cream-200";
    textClass = isButtonDisabled ? "text-cream-500" : "text-foreground";
  } else if (variant === "danger") {
    buttonClass = isButtonDisabled ? "bg-red-300 opacity-70" : "bg-red-500";
    textClass = "text-white";
  }

  return (
    <TouchableOpacity
      className={`rounded-xl py-3 px-6 ${buttonClass}`}
      onPress={onPress}
      disabled={isButtonDisabled}
    >
      <Text className={`font-medium ${textClass}`}>
        {isLoading ? loadingLabel : label}
      </Text>
    </TouchableOpacity>
  );
}
