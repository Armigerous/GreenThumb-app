import React from "react";
import {
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CompactSpinner } from "@/components/UI/LoadingSpinner";

type AuthButtonProps = {
  onPress: () => void;
  isLoading: boolean;
  label: string;
  loadingLabel?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
};

export function AuthButton({
  onPress,
  isLoading,
  label,
  loadingLabel,
  icon,
  disabled = false,
}: AuthButtonProps) {
  const { width } = useWindowDimensions();
  const isSmallDevice = width < 380;

  return (
    <TouchableOpacity
      className={`bg-primary ${
        isSmallDevice ? "py-3" : "py-4"
      } rounded-lg items-center flex-row justify-center`}
      onPress={onPress}
      disabled={isLoading || disabled}
    >
      <Text
        className={`text-primary-foreground font-bold ${
          isSmallDevice ? "text-sm" : "text-base"
        } mr-2`}
      >
        {isLoading ? loadingLabel || `${label}...` : label}
      </Text>
      {isLoading ? (
        <CompactSpinner size={isSmallDevice ? 18 : 20} color="#FFFFFF" />
      ) : icon ? (
        <Ionicons name={icon} size={isSmallDevice ? 18 : 20} color="#FFFFFF" />
      ) : null}
    </TouchableOpacity>
  );
}
