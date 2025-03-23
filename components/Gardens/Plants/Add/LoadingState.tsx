import { View, Text, ActivityIndicator, SafeAreaView } from "react-native";

/**
 * LoadingState component for displaying a loading spinner
 *
 * Shows a centered loading spinner with an optional message.
 * Can be reused across different screens in the app.
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
        <ActivityIndicator size="large" color="#5E994B" />
        <Text className="mt-4 text-cream-600">{message}</Text>
      </View>
    </SafeAreaView>
  );
}
