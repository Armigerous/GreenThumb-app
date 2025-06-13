import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TitleText, BodyText } from "@/components/UI/Text";

interface ErrorViewProps {
  message: string;
  onRetry?: () => void;
  onBack?: () => void;
}

export function ErrorView({ message, onRetry, onBack }: ErrorViewProps) {
  return (
    <View className="flex-1 justify-center items-center bg-cream-50 p-5">
      <Ionicons name="leaf" size={64} color="#d1d5db" />
      <TitleText className="text-xl text-red-500 mt-4">
        Oops! Something went wrong
      </TitleText>
      <BodyText className="text-sm text-cream-500 text-center mt-2">
        {message}
      </BodyText>
      <View className="flex-row mt-6 space-x-4">
        {onRetry && (
          <TouchableOpacity
            className="py-2.5 px-5 bg-brand-600 rounded-lg"
            onPress={onRetry}
          >
            <BodyText className="text-white font-semibold">Try Again</BodyText>
          </TouchableOpacity>
        )}
        {onBack && (
          <TouchableOpacity
            className="py-2.5 px-5 bg-cream-200 rounded-lg"
            onPress={onBack}
          >
            <BodyText className="text-cream-700 font-semibold">
              Go Back
            </BodyText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
