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

  // Define background and text colors based on severity
  let bgColor = "bg-red-100";
  let textColor = "text-red-700";

  if (severity === "warning") {
    bgColor = "bg-amber-100";
    textColor = "text-amber-700";
  } else if (severity === "info") {
    bgColor = "bg-blue-100";
    textColor = "text-blue-700";
  }

  return (
    <View className={`mb-4 p-3 ${bgColor} rounded-lg`}>
      <BodyText className={textColor}>{message}</BodyText>
    </View>
  );
}
