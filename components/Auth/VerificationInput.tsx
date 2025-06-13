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
};

export function VerificationInput({
  verificationCode,
  setVerificationCode,
  onVerify,
  isLoading,
  isPhone,
}: VerificationInputProps) {
  return (
    <View className="w-full mb-4">
      <BodyText className="text-center text-base text-gray-700 font-paragraph font-medium mb-4">
        {isPhone
          ? "We've sent a verification code to your phone"
          : "We've sent a verification code to your email"}
      </BodyText>

      <AuthInput
        label="Verification Code"
        value={verificationCode}
        onChangeText={setVerificationCode}
        placeholder="Enter verification code"
        icon="shield-checkmark-outline"
        keyboardType="number-pad"
        disabled={isLoading}
      />

      <View className="mt-4">
        <AuthButton
          onPress={onVerify}
          isLoading={isLoading}
          label="Verify"
          loadingLabel="Verifying..."
          icon="checkmark-circle-outline"
        />
      </View>
    </View>
  );
}
