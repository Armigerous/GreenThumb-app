/**
 * Paywall prompt components for GreenThumb subscription
 *
 * Beautiful, contextual prompts that appear when users hit usage limits
 * or try to access premium features, designed with brand identity in mind.
 */

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Modal, ScrollView, TouchableOpacity, View } from "react-native";
import { BodyText, SubtitleText, Text, TitleText } from "@/components/UI/Text";
import { BackgroundGradient } from "@/components/UI/BackgroundGradient";
import { useCurrentSeason } from "@/lib/hooks/useCurrentSeason";
import AnimatedProgressBar from "../UI/AnimatedProgressBar";
import SubmitButton from "../UI/SubmitButton";

export interface PaywallPromptProps {
  isVisible: boolean;
  onClose: () => void;
  feature: string;
  currentUsage?: number;
  limit?: number;
  urgency?: "low" | "medium" | "high";
}

/**
 * Full-screen paywall modal, redesigned to align with brand identity.
 */
export function PaywallPrompt({
  isVisible,
  onClose,
  feature,
  currentUsage,
  limit,
  urgency = "medium",
}: PaywallPromptProps) {
  const router = useRouter();
  const season = useCurrentSeason();

  const handleUpgrade = () => {
    onClose();
    router.push("/(tabs)/pricing");
  };

  const getTitle = () => {
    // Messaging focused on outcomes and transformation
    switch (feature) {
      case "gardens":
        return "Design Your Dream Garden Oasis";
      case "plants_per_garden":
        return "Grow a Lush, Thriving Paradise";
      case "tasks_per_month":
        return "Unlock Effortless Plant Care";
      case "photo_uploads":
        return "Watch Your Garden's Story Unfold";
      default:
        return "Become a Confident Plant Parent";
    }
  };

  const getSubtitle = () => {
    if (currentUsage !== undefined && limit !== undefined) {
      return `You've tracked ${currentUsage} of your ${limit} free ${feature
        .replace(/_/g, " ")
        .replace("per month", "")} this month.`;
    }
    return "Ready to transform your plant care journey?";
  };

  const getBenefits = () => {
    // Benefits focused on user value and brand promise
    switch (feature) {
      case "gardens":
        return [
          "Create unlimited garden spaces",
          "Organize your plants effortlessly",
          "Share your garden with family",
          "Unlock advanced design tools",
        ];
      default:
        return [
          "Save your plants with AI-powered care",
          "Unlock unlimited photo tracking",
          "Get personalized, weather-aware tasks",
          "Access our 85% plant survival guarantee",
        ];
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="w-11/12 max-w-sm rounded-3xl overflow-hidden shadow-lg">
          <BackgroundGradient>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View className="absolute top-3 right-3 z-10">
                <TouchableOpacity
                  onPress={onClose}
                  className="p-2 rounded-full bg-cream-100/50"
                >
                  <Ionicons name="close" size={20} color="#2e2c29" />
                </TouchableOpacity>
              </View>

              {/* Content */}
              <View className="px-6 pb-6">
                <TitleText className="text-center text-2xl text-cream-800 mb-2">
                  {getTitle()}
                </TitleText>
                <Text className="text-center text-cream-700 mb-6">
                  {getSubtitle()}
                </Text>

                {/* Progress Bar (if applicable) */}
                {currentUsage !== undefined && limit !== undefined && (
                  <View className="mb-6">
                    <AnimatedProgressBar
                      percentage={(currentUsage / limit) * 100}
                      color="#77B860"
                      backgroundColor="#D6E8CC"
                    />
                    <Text className="text-center text-cream-600 text-xs mt-2">
                      {currentUsage} of {limit} used
                    </Text>
                  </View>
                )}

                {/* Benefits */}
                <View className="space-y-3 mb-6">
                  {getBenefits().map((benefit, index) => (
                    <View key={index} className="flex-row items-center">
                      <View className="bg-brand-100 rounded-full p-1.5 mr-3">
                        <Ionicons name="leaf" size={14} color="#4A7A3B" />
                      </View>
                      <BodyText className="flex-1 text-cream-800">
                        {benefit}
                      </BodyText>
                    </View>
                  ))}
                </View>

                {/* Guarantee */}
                <View className="bg-brand-50 border border-brand-100 rounded-xl p-4 mb-6">
                  <View className="flex-row items-center mb-1">
                    <Ionicons
                      name="sparkles-outline"
                      size={20}
                      className="text-brand-700"
                    />
                    <SubtitleText className="text-brand-800 ml-2 text-base">
                      85% Plant Survival Guarantee
                    </SubtitleText>
                  </View>
                  <Text className="text-brand-700 text-sm">
                    If your plants don&apos;t thrive with our system, we&apos;ll
                    refund your subscription. No questions asked.
                  </Text>
                </View>

                {/* Action Buttons */}
                <SubmitButton onPress={handleUpgrade}>
                  Upgrade and Grow
                </SubmitButton>

                <TouchableOpacity onPress={onClose} className="mt-4">
                  <Text className="text-center text-cream-600">
                    Maybe later
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </BackgroundGradient>
        </View>
      </View>
    </Modal>
  );
}

/**
 * Inline paywall banner (less intrusive), redesigned for brand consistency.
 */
export function PaywallBanner({
  feature,
  currentUsage,
  limit,
  onUpgrade,
}: {
  feature: string;
  currentUsage?: number;
  limit?: number;
  onUpgrade: () => void;
}) {
  const getPercentage = () => {
    if (currentUsage === undefined || limit === undefined) return 0;
    return Math.min(100, (currentUsage / limit) * 100);
  };

  const isNearLimit = getPercentage() >= 80;

  return (
    <View
      className={`mx-4 mb-4 rounded-xl p-4 ${
        isNearLimit
          ? "bg-accent-50 border-accent-200"
          : "bg-brand-50 border-brand-100"
      } border`}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-4">
          <SubtitleText
            className={`mb-1 ${
              isNearLimit ? "text-accent-800" : "text-brand-800"
            }`}
          >
            {isNearLimit ? "Unlock Your Full Garden" : "Ready to Grow?"}
          </SubtitleText>
          {currentUsage !== undefined && limit !== undefined ? (
            <Text
              className={`text-sm ${
                isNearLimit ? "text-accent-700" : "text-brand-700"
              }`}
            >
              {currentUsage} of {limit} {feature.replace("_", " ")} used
            </Text>
          ) : (
            <Text
              className={`text-sm ${
                isNearLimit ? "text-accent-700" : "text-brand-700"
              }`}
            >
              Upgrade to access all features
            </Text>
          )}
        </View>

        <TouchableOpacity
          onPress={onUpgrade}
          className={`rounded-lg py-2 px-4 ${
            isNearLimit ? "bg-accent-200" : "bg-brand-600"
          }`}
        >
          <Text
            className={`${
              isNearLimit ? "text-accent-800" : "text-cream-50"
            } font-paragraph-semibold`}
          >
            Upgrade
          </Text>
        </TouchableOpacity>
      </View>

      {currentUsage !== undefined && limit !== undefined && (
        <View className="mt-3">
          <AnimatedProgressBar
            percentage={getPercentage()}
            color={isNearLimit ? "#ffd900" : "#77B860"}
            backgroundColor="rgba(255, 255, 255, 0.5)"
          />
        </View>
      )}
    </View>
  );
}

/**
 * Quick upgrade button, redesigned for brand consistency.
 */
export function UpgradeButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-brand-600 rounded-full px-4 py-2 flex-row items-center shadow-md"
    >
      <Ionicons name="sparkles" size={16} color="white" />
      <Text className="text-white font-paragraph-semibold ml-2 text-sm">
        Upgrade
      </Text>
    </TouchableOpacity>
  );
}
