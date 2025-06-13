import React from "react";
import { Text, View, useWindowDimensions } from "react-native";
import { BodyText } from "@/components/UI/Text";

type AuthErrorProps = {
  error: string | null;
};

export function AuthError({ error }: AuthErrorProps) {
  const { width } = useWindowDimensions();
  const isSmallDevice = width < 380;

  if (!error) return null;

  return (
    <View
      className={`bg-destructive/10 border border-destructive rounded-lg ${
        isSmallDevice ? "p-2 mb-3" : "p-3 mb-4"
      }`}
    >
      <BodyText
        className={`text-destructive text-center ${
          isSmallDevice ? "text-xs" : "text-sm"
        }`}
      >
        {error}
      </BodyText>
    </View>
  );
}
