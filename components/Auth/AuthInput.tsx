import React, { useState } from "react";
import {
  Text,
  TextInput,
  View,
  KeyboardTypeOptions,
  useWindowDimensions,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type AuthInputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  icon: keyof typeof Ionicons.glyphMap;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  disabled?: boolean;
  labelRightComponent?: React.ReactNode;
  textContentType?:
    | "none"
    | "username"
    | "emailAddress"
    | "password"
    | "newPassword"
    | "oneTimeCode"
    | "telephoneNumber";
};

export function AuthInput({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  secureTextEntry = false,
  keyboardType = "default",
  disabled = false,
  labelRightComponent,
  textContentType,
}: AuthInputProps) {
  const { width } = useWindowDimensions();
  const isSmallDevice = width < 380;
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Determine if this is a password field
  const isPassword = secureTextEntry;

  // Auto-set textContentType based on secureTextEntry if not provided
  const resolvedTextContentType =
    textContentType || (isPassword ? "password" : undefined);

  return (
    <>
      <View className="flex-row justify-between items-center mb-1">
        <Text className="text-foreground text-sm font-paragraph">{label}</Text>
        {labelRightComponent}
      </View>
      <View className="flex-row items-center bg-cream-50 border border-foreground rounded-lg mb-4 overflow-hidden">
        <View className={`${isSmallDevice ? "p-2" : "p-3"} justify-center`}>
          <Ionicons
            name={icon}
            size={isSmallDevice ? 18 : 20}
            color="#2e2c29"
          />
        </View>
        <TextInput
          className={`flex-1 ${isSmallDevice ? "p-2" : "p-3"} text-foreground ${
            isSmallDevice ? "text-sm" : "text-base"
          }`}
          autoCapitalize="none"
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#999"
          onChangeText={onChangeText}
          secureTextEntry={isPassword && !isPasswordVisible}
          keyboardType={keyboardType}
          editable={!disabled}
          textContentType={resolvedTextContentType}
        />
        {isPassword && (
          <Pressable
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            className={`${isSmallDevice ? "mr-2" : "mr-3"} flex justify-center`}
            accessibilityLabel={
              isPasswordVisible ? "Hide password" : "Show password"
            }
            accessibilityRole="button"
          >
            <Ionicons
              name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
              size={isSmallDevice ? 18 : 20}
              color="#2e2c29"
            />
          </Pressable>
        )}
      </View>
    </>
  );
}
