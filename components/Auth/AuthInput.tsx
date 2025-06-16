import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TextInputProps,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BodyText } from "@/components/UI/Text";
import { ValidationIndicator } from "./ValidationIndicator";
import {
  validateFieldRealTime,
  formatPhoneNumber,
  ValidationResult,
} from "@/lib/validation";

interface AuthInputProps extends Omit<TextInputProps, "style"> {
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  disabled?: boolean;
  error?: string | null;
  validationType?: "email" | "phone" | "password" | "verification" | "name";
  isSignUp?: boolean;
  showValidation?: boolean;
  autoFormat?: boolean;
  showPasswordToggle?: boolean;
  showValidationIndicator?: boolean;
}

export function AuthInput({
  icon,
  placeholder,
  value,
  onChangeText,
  disabled = false,
  error = null,
  validationType,
  isSignUp = false,
  showValidation = true,
  autoFormat = false,
  showPasswordToggle = false,
  showValidationIndicator = false,
  secureTextEntry,
  ...textInputProps
}: AuthInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [realtimeValidation, setRealtimeValidation] =
    useState<ValidationResult>({ isValid: true });
  const [hasBeenTouched, setHasBeenTouched] = useState(false);

  // Real-time validation
  useEffect(() => {
    if (validationType && showValidation) {
      const validation = validateFieldRealTime(validationType, value, {
        isSignUp,
      });
      setRealtimeValidation(validation);
    }
  }, [value, validationType, showValidation, isSignUp]);

  const handleChangeText = (text: string) => {
    let formattedText = text;

    // Auto-format phone numbers
    if (autoFormat && validationType === "phone") {
      formattedText = formatPhoneNumber(text);
    }

    // Mark as touched when user starts typing
    if (!hasBeenTouched && text.length > 0) {
      setHasBeenTouched(true);
    }

    onChangeText(formattedText);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Mark as touched when field loses focus
    if (!hasBeenTouched) {
      setHasBeenTouched(true);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Determine validation state
  const hasExternalError = Boolean(error);
  const hasValidationError =
    showValidation &&
    hasBeenTouched &&
    !realtimeValidation.isValid &&
    value.trim().length > 0 &&
    showValidationIndicator; // Only consider validation errors when indicator is enabled
  const hasError = hasExternalError || hasValidationError;

  const displayError =
    error ||
    (hasBeenTouched &&
    value.trim().length > 0 &&
    showValidationIndicator && // Only show validation errors when indicator is enabled
    !realtimeValidation.isValid
      ? realtimeValidation.error
      : null);

  // Field is valid if it has content, no errors, and has been touched
  const isValid =
    !hasError &&
    hasBeenTouched &&
    value.trim().length > 0 &&
    realtimeValidation.isValid;

  // Dynamic styling based on state using brand colors
  const getBorderColor = () => {
    if (hasError) return "border-destructive"; // Use semantic destructive color
    if (isValid) return "border-brand-300"; // Brand green for valid state
    if (isFocused) return "border-brand-400"; // Brand green for focus
    return "border-cream-300"; // Brand neutral for default
  };

  const getBackgroundColor = () => {
    if (hasError) return "bg-red-50"; // Light red for errors (keeping for accessibility)
    if (isValid) return "bg-brand-50"; // Light brand green for valid
    return "bg-cream-50"; // Brand neutral background
  };

  const getIconColor = () => {
    if (hasError) return "#E50000"; // Destructive color from brand palette
    if (isValid) return "#5E994B"; // Brand-600 for valid state
    if (isFocused) return "#5E994B"; // Brand-600 for focus
    return "#636059"; // Cream-600 for default state
  };

  const actualSecureTextEntry = showPasswordToggle
    ? !showPassword
    : secureTextEntry;

  return (
    <View className="mb-4">
      <View
        className={`${getBackgroundColor()} border ${getBorderColor()} rounded-lg px-4 py-3 transition-colors`}
      >
        <View className="flex-row items-center">
          <Ionicons
            name={icon}
            size={20}
            color={getIconColor()}
            style={{ marginRight: 12 }}
          />
          <TextInput
            value={value}
            onChangeText={handleChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            placeholderTextColor="#9e9a90" // Cream-400 for placeholder text
            className="flex-1 text-base font-paragraph text-foreground"
            editable={!disabled}
            secureTextEntry={actualSecureTextEntry}
            {...textInputProps}
          />

          {/* Password visibility toggle */}
          {showPasswordToggle && (
            <TouchableOpacity
              onPress={togglePasswordVisibility}
              className="ml-2 p-1"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={getIconColor()}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Validation Indicator - positioned absolutely above input */}
      {showValidationIndicator && validationType && (
        <View
          className="absolute left-0 right-0 z-10"
          style={{ bottom: "100%", marginBottom: 8 }}
        >
          <ValidationIndicator
            validationType={validationType}
            value={value}
            validation={realtimeValidation}
            isVisible={showValidationIndicator}
            isTouched={hasBeenTouched}
            isFocused={isFocused}
            isSignUp={isSignUp}
          />
        </View>
      )}

      {/* Error message using brand colors */}
      {displayError && (
        <View className="flex-row items-start mt-2 px-1">
          <Ionicons
            name="alert-circle-outline"
            size={16}
            color="#E50000" // Destructive color from brand palette
            style={{ marginTop: 1, marginRight: 6 }}
          />
          <BodyText className="text-destructive text-sm flex-1 leading-5">
            {displayError}
          </BodyText>
        </View>
      )}

      {/* Success message using brand colors */}
      {isValid && validationType === "password" && isSignUp && !hasError && (
        <View className="flex-row items-center mt-2 px-1">
          <Ionicons
            name="checkmark-circle-outline"
            size={16}
            color="#5E994B" // Brand-600 for success
            style={{ marginRight: 6 }}
          />
          <BodyText className="text-brand-600 text-sm">
            Password looks strong!
          </BodyText>
        </View>
      )}
    </View>
  );
}
