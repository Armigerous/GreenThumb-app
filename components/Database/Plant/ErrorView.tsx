import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ErrorViewProps {
  message: string;
  onRetry?: () => void;
  onBack?: () => void;
}

export function ErrorView({ message, onRetry, onBack }: ErrorViewProps) {
  return (
    <View className="flex-1 justify-center items-center bg-cream-50 p-5">
      <Ionicons name="leaf" size={64} color="#d1d5db" />
      <Text className="text-xl font-bold text-red-500 mt-4">
        Oops! Something went wrong
      </Text>
      <Text className="text-sm text-cream-500 text-center mt-2">{message}</Text>
      <View className="flex-row mt-6 space-x-4">
        {onRetry && (
          <TouchableOpacity
            className="py-2.5 px-5 bg-brand-600 rounded-lg"
            onPress={onRetry}
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        )}
        {onBack && (
          <TouchableOpacity
            className="py-2.5 px-5 bg-cream-200 rounded-lg"
            onPress={onBack}
          >
            <Text className="text-cream-700 font-semibold">Go Back</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
