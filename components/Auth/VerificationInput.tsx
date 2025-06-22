import React from "react";
import { View, TouchableOpacity, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { AnimatedStyleProp } from "react-native-reanimated";
import { AuthInput } from "./AuthInput";
import { AuthButton } from "./AuthButton";
import { BodyText, TitleText } from "@/components/UI/Text";

type VerificationInputProps = {
  verificationCode: string;
  setVerificationCode: (value: string) => void;
  onVerify: () => void;
  onResend?: () => void;
  isLoading: boolean;
  isResending?: boolean;
  isPhone: boolean;
  phoneNumber?: string;
  emailAddress?: string;
  error?: string | null;
  canResend?: boolean;
  resendCountdown?: number;
  animatedStyle?: AnimatedStyleProp<ViewStyle>;
};

export function VerificationInput({
  verificationCode,
  setVerificationCode,
  onVerify,
  onResend,
  isLoading,
  isResending = false,
  isPhone,
  phoneNumber,
  emailAddress,
  error = null,
  canResend = true,
  resendCountdown = 0,
  animatedStyle,
}: VerificationInputProps) {
  const contactInfo = isPhone ? phoneNumber : emailAddress;
  const contactType = isPhone ? "phone" : "email";
  const iconName = isPhone ? "call-outline" : "mail-outline";

  const content = (
    <View className="flex-1 px-4">
      {/* Header */}
      <View className="mb-6">
        <View className="items-center mb-6">
          <View className="w-16 h-16 bg-brand-100 rounded-full items-center justify-center mb-4">
            <Ionicons
              name="shield-checkmark-outline"
              size={32}
              color="#5E994B"
            />
          </View>
          <TitleText className="text-2xl text-center mb-2 text-foreground">
            Verify Your {isPhone ? "Phone" : "Email"}
          </TitleText>
          <BodyText className="text-cream-600 text-center leading-6">
            We&apos;ve sent a secure verification code to keep your account
            safe.
          </BodyText>
        </View>
      </View>

      {/* Contact info display */}
      <View className="bg-brand-50 rounded-xl p-4 mb-6 border border-brand-100">
        <View className="flex-row items-center justify-center">
          <Ionicons name={iconName} size={16} color="#5E994B" />
          <BodyText className="text-brand-700 font-paragraph-medium ml-2">
            {contactInfo}
          </BodyText>
        </View>
      </View>

      {/* Verification code input */}
      <View className="mb-6">
        <BodyText className="text-lg font-paragraph-medium text-foreground mb-1">
          Verification Code
        </BodyText>
        <AuthInput
          value={verificationCode}
          onChangeText={setVerificationCode}
          placeholder="Enter 6-digit code"
          icon="shield-checkmark-outline"
          keyboardType="number-pad"
          disabled={isLoading}
          validationType="verification"
          error={error}
          showValidation={true}
          maxLength={8}
          autoFocus={true}
        />
      </View>

      {/* Security note */}
      <View className="bg-cream-100 rounded-xl p-4 mb-6 border border-cream-200">
        <View className="flex-row items-start">
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="#5E994B"
            className="mt-1"
          />
          <View className="flex-1 ml-3">
            <BodyText className="text-foreground font-paragraph-semibold mb-1">
              Secure Verification
            </BodyText>
            <BodyText className="text-cream-600 text-sm leading-5">
              This code expires in 10 minutes for your security. Never share it
              with anyone.
            </BodyText>
          </View>
        </View>
      </View>

      {/* Action buttons */}
      <View className="mt-6">
        <AuthButton
          onPress={onVerify}
          loading={isLoading}
          label="Verify & Continue"
          loadingLabel="Verifying..."
          icon="checkmark-circle-outline"
          disabled={
            !verificationCode || verificationCode.length < 4 || isLoading
          }
        />

        {/* Resend option */}
        {onResend && (
          <View className="mt-4 items-center">
            {canResend && resendCountdown === 0 ? (
              <TouchableOpacity
                onPress={onResend}
                disabled={isResending}
                className="py-3"
              >
                <View className="flex-row items-center">
                  {isResending && (
                    <Ionicons
                      name="refresh-outline"
                      size={16}
                      color="#5E994B"
                      className="mr-2"
                    />
                  )}
                  <BodyText className="text-brand-600 font-paragraph-medium">
                    {isResending ? "Sending..." : "Resend Code"}
                  </BodyText>
                </View>
              </TouchableOpacity>
            ) : (
              <View className="py-3">
                <BodyText className="text-cream-500 font-paragraph-medium">
                  {resendCountdown > 0
                    ? `Resend available in ${resendCountdown}s`
                    : "Code sent successfully"}
                </BodyText>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );

  if (animatedStyle) {
    return (
      <Animated.View style={animatedStyle} className="flex-1">
        {content}
      </Animated.View>
    );
  }

  return <View className="flex-1">{content}</View>;
}
