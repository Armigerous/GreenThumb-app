import React from "react";
import { View } from "react-native";
import { PlantGrowthLoader } from "@/components/UI/PlantGrowthLoader";
import { BodyText } from "@/components/UI/Text";

/**
 * Loading state to show when data is being loaded or an operation is in progress
 */
interface LoadingStateProps {
  message?: string;
  backgroundColor?: string;
}

export default function LoadingState({
  message = "Loading...",
  backgroundColor = "bg-transparent",
}: LoadingStateProps) {
  return (
    <View className={`flex-1 justify-center items-center ${backgroundColor}`}>
      <PlantGrowthLoader message={message} />
    </View>
  );
}
