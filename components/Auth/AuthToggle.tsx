import React from "react";
import {
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { BodyText } from "@/components/UI/Text";

type AuthToggleProps = {
  isPhone: boolean;
  onToggle: (usePhone: boolean) => void;
};

export function AuthToggle({ isPhone, onToggle }: AuthToggleProps) {
  const { width } = useWindowDimensions();
  const isSmallDevice = width < 380;

  return (
    <View className="flex-row justify-between mb-2">
      <TouchableOpacity
        onPress={() => onToggle(false)}
        className={`${isSmallDevice ? "py-1.5 px-3" : "py-2 px-4"} rounded-lg ${
          !isPhone ? "bg-primary" : "bg-transparent"
        }`}
      >
        <BodyText
          className={`$${
            !isPhone ? "text-primary-foreground" : "text-foreground"
          } ${isSmallDevice ? "text-xs" : "text-sm"}`}
        >
          {isPhone ? "Use Email" : "Email"}
        </BodyText>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onToggle(true)}
        className={`${isSmallDevice ? "py-1.5 px-3" : "py-2 px-4"} rounded-lg ${
          isPhone ? "bg-primary" : "bg-transparent"
        }`}
      >
        <BodyText
          className={`$${
            isPhone ? "text-primary-foreground" : "text-foreground"
          } ${isSmallDevice ? "text-xs" : "text-sm"}`}
        >
          {!isPhone ? "Use Phone" : "Phone"}
        </BodyText>
      </TouchableOpacity>
    </View>
  );
}
