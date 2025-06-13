import React from "react";
import {
  TouchableOpacity,
  View,
  ViewStyle,
  Text,
  useWindowDimensions,
} from "react-native";
import { AuthInput } from "./AuthInput";
import { AuthToggle } from "./AuthToggle";
import { AuthButton } from "./AuthButton";
import Animated, { AnimatedStyleProp } from "react-native-reanimated";
import { CompactSpinner } from "@/components/UI/LoadingSpinner";
import { BodyText } from "@/components/UI/Text";

type AuthInputSectionProps = {
  isPhone: boolean;
  toggleIdentifierType: (usePhone: boolean) => void;
  emailOrPhone: string;
  setEmailOrPhone: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  isSignUp: boolean;
  animatedStyle?: AnimatedStyleProp<ViewStyle>;
  showForgotPassword?: boolean;
  onForgotPasswordPress?: () => void;
};

export function AuthInputSection({
  isPhone,
  toggleIdentifierType,
  emailOrPhone,
  setEmailOrPhone,
  password,
  setPassword,
  onSubmit,
  isLoading,
  isSignUp,
  animatedStyle,
  showForgotPassword = false,
  onForgotPasswordPress = () => {},
}: AuthInputSectionProps) {
  const { width } = useWindowDimensions();
  const isSmallDevice = width < 380;

  const content = (
    <View className={`w-full ${isSmallDevice ? "mb-2" : "mb-3"}`}>
      <AuthToggle isPhone={isPhone} onToggle={toggleIdentifierType} />

      <AuthInput
        label={isPhone ? "Phone Number" : "Email"}
        value={emailOrPhone}
        onChangeText={setEmailOrPhone}
        placeholder={isPhone ? "Enter your phone number" : "Enter your email"}
        icon={isPhone ? "call-outline" : "mail-outline"}
        keyboardType={isPhone ? "phone-pad" : "email-address"}
        textContentType={isPhone ? "telephoneNumber" : "emailAddress"}
        disabled={isLoading}
      />

      <AuthInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="Enter your password"
        icon="lock-closed-outline"
        secureTextEntry={true}
        textContentType={isSignUp ? "newPassword" : "password"}
        disabled={isLoading}
        labelRightComponent={
          showForgotPassword ? (
            <TouchableOpacity onPress={onForgotPasswordPress}>
              <BodyText className="text-primary text-sm font-semibold">
                Forgot your password?
              </BodyText>
            </TouchableOpacity>
          ) : null
        }
      />

      <View className={isSmallDevice ? "mt-2" : "mt-4"}>
        <AuthButton
          onPress={onSubmit}
          isLoading={isLoading}
          label={isSignUp ? "Sign Up" : "Sign In"}
          loadingLabel={isSignUp ? "Creating Account..." : "Signing in..."}
          icon={isSignUp ? "person-add-outline" : "log-in-outline"}
        />
      </View>
    </View>
  );

  // If animatedStyle is provided, use Animated.View
  if (animatedStyle) {
    return <Animated.View style={animatedStyle}>{content}</Animated.View>;
  }

  // Otherwise use regular View
  return <View>{content}</View>;
}
