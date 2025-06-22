import React from "react";
import { View, TouchableOpacity, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthInput } from "./AuthInput";
import { AuthButton } from "./AuthButton";
import { BodyText, TitleText } from "@/components/UI/Text";
import Animated, { AnimatedStyleProp } from "react-native-reanimated";

type PhoneCollectionScreenProps = {
  // Data
  emailAddress?: string;
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;

  // Actions
  onComplete: () => void;
  onSkip?: () => void;

  // State
  isLoading: boolean;
  error?: string | null;

  // Styling
  animatedStyle?: AnimatedStyleProp<ViewStyle>;
};

export function PhoneCollectionScreen({
  emailAddress,
  phoneNumber,
  setPhoneNumber,
  onComplete,
  onSkip,
  isLoading,
  error,
  animatedStyle,
}: PhoneCollectionScreenProps) {
  const content = (
    <View className="flex-1 px-4">
      {/* Header */}
      <View className="mb-6">
        <View className="items-center mb-6">
          <View className="w-16 h-16 bg-brand-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="call-outline" size={32} color="#5E994B" />
          </View>
          <TitleText className="text-2xl text-center mb-2 text-foreground">
            Add Your Phone Number
          </TitleText>
          <BodyText className="text-cream-600 text-center leading-6">
            We&apos;ll send you plant care reminders and account security
            updates.
          </BodyText>
        </View>
      </View>

      {/* Account info display */}
      <View className="bg-brand-50 rounded-xl p-4 mb-6 border border-brand-100">
        <View className="flex-row items-center mb-2">
          <Ionicons name="mail-outline" size={16} color="#5E994B" />
          <BodyText className="text-brand-700 font-paragraph-medium ml-2">
            {emailAddress}
          </BodyText>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="checkmark-circle" size={16} color="#5E994B" />
          <BodyText className="text-brand-700 font-paragraph-medium ml-2">
            Account created successfully
          </BodyText>
        </View>
      </View>

      {/* Phone input */}
      <View className="mb-6">
        <BodyText className="text-lg font-paragraph-medium text-foreground mb-1">
          Phone Number
        </BodyText>
        <AuthInput
          icon="call-outline"
          placeholder="Enter your phone number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
          validationType="phone"
          error={error}
          showValidation={true}
          autoFormat={true}
        />
      </View>

      {/* Privacy note */}
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
              Your Privacy is Protected
            </BodyText>
            <BodyText className="text-cream-600 text-sm leading-5">
              We&apos;ll never share your phone number. You can update
              notification preferences anytime.
            </BodyText>
          </View>
        </View>
      </View>

      {/* Action buttons */}
      <View className="mt-6">
        <AuthButton
          label="Complete Setup"
          onPress={onComplete}
          loading={isLoading}
          disabled={phoneNumber.replace(/\D/g, "").length === 0 || isLoading}
          icon="checkmark-circle-outline"
          loadingLabel="Setting up account..."
        />

        {onSkip && (
          <TouchableOpacity
            onPress={onSkip}
            disabled={isLoading}
            className="py-3 mt-3"
          >
            <BodyText className="text-center text-cream-500 font-paragraph-medium">
              Skip for now (limited features)
            </BodyText>
          </TouchableOpacity>
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
