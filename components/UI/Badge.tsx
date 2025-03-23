import React from "react";
import { View, Text } from "react-native";

interface BadgeProps {
  text: string;
}

export function Badge({ text }: BadgeProps) {
  return (
    <View className="bg-brand-100 px-3 py-1.5 rounded-2xl mr-2">
      <Text className="text-xs text-brand-700 font-medium">{text}</Text>
    </View>
  );
}
