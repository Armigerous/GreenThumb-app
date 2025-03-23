import React from "react";
import { View, ActivityIndicator, Text } from "react-native";

interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({
  message = "Loading...",
}: LoadingSpinnerProps) {
  return (
    <View className="flex-1 justify-center items-center bg-cream-50">
      <ActivityIndicator size="large" color="#047857" />
      <Text className="mt-3 text-base text-cream-600">{message}</Text>
    </View>
  );
}
