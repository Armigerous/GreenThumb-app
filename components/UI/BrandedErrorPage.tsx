import React from "react";
import { View, TouchableOpacity, Image } from "react-native";
import { TitleText, BodyText } from "@/components/UI/Text";

interface BrandedErrorPageProps {
  message?: string;
  onRetry: () => void;
  onBack?: () => void;
}

/**
 * BrandedErrorPage - A user-friendly, on-brand error page for GreenThumb
 * Uses the 'sad plant' illustration and brand palette. No technical error details.
 */
export default function BrandedErrorPage({
  message = "We couldn't load the page. Please try again in a moment!",
  onRetry,
  onBack,
}: BrandedErrorPageProps) {
  return (
    <View className="flex-1 items-center justify-center bg-cream-50 px-5 py-8">
      <Image
        source={{ uri: "https://theofficialgreenthumb.com/sad-plant.png" }}
        className="w-40 h-40 rounded-lg mb-4"
        resizeMode="contain"
        accessibilityLabel="Sad plant illustration"
      />
      <TitleText className="text-xl text-brand-700 mb-2 text-center">
        Oops! Something went wrong
      </TitleText>
      <BodyText className="text-base text-cream-700 text-center mb-6">
        {message}
      </BodyText>
      <View className="flex-row space-x-4">
        <TouchableOpacity
          className="py-2.5 px-5 bg-brand-600 rounded-lg"
          onPress={onRetry}
        >
          <BodyText className="text-white font-semibold">Try Again</BodyText>
        </TouchableOpacity>
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
