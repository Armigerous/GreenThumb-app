import React from "react";
import {
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CompactSpinner } from "@/components/UI/LoadingSpinner";
import { BodyText } from "@/components/UI/Text";

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
      onPress={onPress}
      disabled={isLoading || disabled}
      className={`flex-row items-center justify-center bg-primary rounded-lg px-4 py-3 ${
        isLoading || disabled ? "opacity-60" : ""
      }`}
      activeOpacity={0.8}
    >
      {icon && (
        <Ionicons name={icon} size={20} color="#fffefa" className="mr-2" />
      )}
      {isLoading ? (
        <>
          <CompactSpinner size={20} color="#fffefa" />
          <BodyText className="text-primary-foreground ml-2">
            {loadingLabel || label}
          </BodyText>
        </>
      ) : (
        <BodyText className="text-primary-foreground">{label}</BodyText>
      )}
    </TouchableOpacity>
  );
}
