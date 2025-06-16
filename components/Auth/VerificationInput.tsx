import React from "react";
import { View } from "react-native";
import { AuthInput } from "./AuthInput";
import { AuthButton } from "./AuthButton";
import { BodyText } from "@/components/UI/Text";

type VerificationInputProps = {
  verificationCode: string;
  setVerificationCode: (value: string) => void;
  onVerify: () => void;
  isLoading: boolean;
  isPhone: boolean;
  error?: string | null;
};

export function VerificationInput({
  verificationCode,
  setVerificationCode,
  onVerify,
  isLoading,
  isPhone,
  error = null,
}: VerificationInputProps) {
  return (
    <View className="w-full mb-4">
      <BodyText className="text-center text-base text-gray-700 font-paragraph font-medium mb-4">
        {isPhone
          ? "We've sent a verification code to your phone"
          : "We've sent a verification code to your email"}
      </BodyText>

      <AuthInput
        value={verificationCode}
        onChangeText={setVerificationCode}
        placeholder="Enter verification code"
        icon="shield-checkmark-outline"
        keyboardType="number-pad"
        disabled={isLoading}
        validationType="verification"
        error={error}
        showValidation={true}
        maxLength={8}
      />

      <View className="mt-4">
        <AuthButton
          onPress={onVerify}
          loading={isLoading}
          label="Verify"
          loadingLabel="Verifying..."
          icon="checkmark-circle-outline"
        />
      </View>
    </View>
  );
}
