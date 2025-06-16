import { View, Text } from "react-native";
import { BodyText } from "@/components/UI/Text";

/**
 * ErrorMessage component for displaying error messages
 *
 * Provides a consistent way to display error messages to users.
 * Can be customized with different severity levels.
 *
 * @param message - The error message to display
 * @param severity - The severity level of the error ('error', 'warning', or 'info')
 */
interface ErrorMessageProps {
  message: string | null;
  severity?: "error" | "warning" | "info";
}

export default function ErrorMessage({
  message,
  severity = "error",
}: ErrorMessageProps) {
  if (!message) return null;

  // Define background and text colors based on severity using brand colors
  let bgColor = "bg-red-50"; // Keep red for errors for accessibility
  let textColor = "text-destructive"; // Use brand destructive color

  if (severity === "warning") {
    bgColor = "bg-accent-50"; // Brand yellow background
    textColor = "text-accent-800"; // Brand yellow text with good contrast
  } else if (severity === "info") {
    bgColor = "bg-brand-50"; // Brand green background for info
    textColor = "text-brand-700"; // Brand green text with good contrast
  }

  return (
    <View className={`mb-4 p-3 ${bgColor} rounded-lg`}>
      <BodyText className={textColor}>{message}</BodyText>
    </View>
  );
}
