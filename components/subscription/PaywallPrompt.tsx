/**
 * Paywall prompt components for GreenThumb subscription
 *
 * Beautiful, contextual prompts that appear when users hit usage limits
 * or try to access premium features.
 */

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

const { width: screenWidth } = Dimensions.get("window");

export interface PaywallPromptProps {
  isVisible: boolean;
  onClose: () => void;
  feature: string;
  currentUsage?: number;
  limit?: number;
  title?: string;
  subtitle?: string;
  benefits?: string[];
  urgency?: "low" | "medium" | "high";
}

/**
 * Full-screen paywall modal
 */
export function PaywallPrompt({
  isVisible,
  onClose,
  feature,
  currentUsage,
  limit,
  title,
  subtitle,
  benefits,
  urgency = "medium",
}: PaywallPromptProps) {
  const router = useRouter();

  const handleUpgrade = () => {
    onClose();
    router.push("/subscription/pricing");
  };

  const getTitle = () => {
    if (title) return title;

    switch (feature) {
      case "gardens":
        return "Unlock Unlimited Gardens";
      case "plants_per_garden":
        return "Add More Plants";
      case "tasks_per_month":
        return "Unlock Unlimited Tasks";
      case "photo_uploads":
        return "Upload More Photos";
      case "ai_suggestions":
        return "Get More AI Suggestions";
      case "expert_consultations":
        return "Expert Consultations";
      case "advanced_analytics":
        return "Advanced Analytics";
      case "weather_alerts":
        return "Weather Alerts";
      default:
        return "Upgrade to Premium";
    }
  };

  const getSubtitle = () => {
    if (subtitle) return subtitle;

    if (currentUsage !== undefined && limit !== undefined) {
      return `You've used ${currentUsage} of your ${limit} free ${feature.replace(
        "_",
        " "
      )} this month.`;
    }

    return `This feature requires GreenThumb Premium.`;
  };

  const getBenefits = () => {
    if (benefits) return benefits;

    switch (feature) {
      case "gardens":
        return [
          "Create unlimited gardens",
          "Organize plants by location",
          "Track multiple growing spaces",
          "Family garden sharing",
        ];
      case "tasks_per_month":
        return [
          "Unlimited task completions",
          "Advanced task scheduling",
          "Seasonal task suggestions",
          "Task performance analytics",
        ];
      case "photo_uploads":
        return [
          "Unlimited photo uploads",
          "AI-powered plant identification",
          "Growth progress tracking",
          "Photo organization tools",
        ];
      case "ai_suggestions":
        return [
          "Unlimited AI suggestions",
          "Personalized care recommendations",
          "Problem diagnosis",
          "Seasonal care tips",
        ];
      case "expert_consultations":
        return [
          "One-on-one expert sessions",
          "Certified plant care specialists",
          "Custom care plans",
          "Priority support",
        ];
      default:
        return [
          "Unlimited everything",
          "AI-powered recommendations",
          "Expert consultations",
          "85% plant survival guarantee",
        ];
    }
  };

  const getUrgencyColor = () => {
    switch (urgency) {
      case "high":
        return "#dc2626"; // red-600
      case "medium":
        return "#ea580c"; // orange-600
      case "low":
        return "#059669"; // green-600
      default:
        return "#059669";
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="px-5 pt-5 pb-4 flex-row items-center justify-between border-b border-gray-200">
          <View className="flex-1">
            <Text className="text-xl font-bold text-foreground">
              {getTitle()}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            className="p-2 rounded-full bg-gray-100"
          >
            <Ionicons name="close" size={20} color="#374151" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Progress Bar (if applicable) */}
          {currentUsage !== undefined && limit !== undefined && (
            <View className="px-5 py-6">
              <View className="bg-gray-100 rounded-full h-3 overflow-hidden">
                <View
                  className="h-full bg-orange-500 rounded-full"
                  style={{
                    width: `${Math.min(100, (currentUsage / limit) * 100)}%`,
                  }}
                />
              </View>
              <Text className="text-center text-muted-foreground text-sm mt-2">
                {currentUsage} of {limit} used this month
              </Text>
            </View>
          )}

          {/* Hero Section */}
          <View className="px-5 py-6 items-center">
            <View
              className="rounded-full p-4 mb-4"
              style={{ backgroundColor: `${getUrgencyColor()}20` }}
            >
              <Ionicons name="rocket" size={48} color={getUrgencyColor()} />
            </View>

            <Text className="text-lg text-muted-foreground text-center mb-6">
              {getSubtitle()}
            </Text>

            <Text className="text-base text-gray-700 text-center leading-6">
              Join thousands of plant parents who transformed their gardens with
              GreenThumb Premium.
            </Text>
          </View>

          {/* Benefits */}
          <View className="px-5 py-6">
            <Text className="text-lg font-semibold text-foreground mb-4">
              What you&apos;ll get:
            </Text>

            <View className="space-y-3">
              {getBenefits().map((benefit, index) => (
                <View key={index} className="flex-row items-center">
                  <View className="bg-green-100 rounded-full p-2 mr-3">
                    <Ionicons name="checkmark" size={16} color="#059669" />
                  </View>
                  <Text className="flex-1 text-foreground">{benefit}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Social Proof */}
          <View className="px-5 py-6 bg-green-50 mx-5 rounded-xl">
            <View className="flex-row items-center mb-3">
              <View className="flex-row mr-2">
                {[...Array(5)].map((_, i) => (
                  <Ionicons key={i} name="star" size={16} color="#fbbf24" />
                ))}
              </View>
              <Text className="text-green-800 font-semibold">4.9/5</Text>
            </View>
            <Text className="text-green-700 text-sm">
              &quot;My plants have never been healthier! The AI suggestions
              saved my peace lily.&quot; - Sarah M.
            </Text>
          </View>

          {/* Guarantee */}
          <View className="px-5 py-6">
            <View className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="shield-checkmark" size={20} color="#2563eb" />
                <Text className="text-blue-800 font-semibold ml-2">
                  85% Plant Survival Guarantee
                </Text>
              </View>
              <Text className="text-blue-700 text-sm">
                If 85% of your plants don&apos;t survive with our care system,
                we&apos;ll refund your subscription.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Action */}
        <View className="px-5 pb-8 pt-4 bg-white border-t border-gray-200">
          <TouchableOpacity
            onPress={handleUpgrade}
            className="rounded-xl py-4 px-6 mb-3"
            style={{ backgroundColor: getUrgencyColor() }}
          >
            <Text className="text-white text-center font-semibold text-lg">
              Upgrade to Premium
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose}>
            <Text className="text-center text-muted-foreground">
              Maybe later
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

/**
 * Inline paywall banner (less intrusive)
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
      className={`mx-5 mb-4 rounded-xl p-4 ${
        isNearLimit
          ? "bg-orange-50 border-orange-200"
          : "bg-blue-50 border-blue-200"
      } border`}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text
            className={`font-semibold mb-1 ${
              isNearLimit ? "text-orange-800" : "text-blue-800"
            }`}
          >
            {isNearLimit ? "Almost at your limit!" : "Upgrade to Premium"}
          </Text>
          {currentUsage !== undefined && limit !== undefined ? (
            <Text
              className={`text-sm ${
                isNearLimit ? "text-orange-700" : "text-blue-700"
              }`}
            >
              {currentUsage} of {limit} {feature.replace("_", " ")} used
            </Text>
          ) : (
            <Text
              className={`text-sm ${
                isNearLimit ? "text-orange-700" : "text-blue-700"
              }`}
            >
              Get unlimited access to all features
            </Text>
          )}
        </View>

        <TouchableOpacity
          onPress={onUpgrade}
          className={`rounded-lg py-2 px-4 ${
            isNearLimit ? "bg-orange-600" : "bg-blue-600"
          }`}
        >
          <Text className="text-white font-medium">Upgrade</Text>
        </TouchableOpacity>
      </View>

      {currentUsage !== undefined && limit !== undefined && (
        <View className="mt-3">
          <View className="bg-white/50 rounded-full h-2 overflow-hidden">
            <View
              className={`h-full rounded-full ${
                isNearLimit ? "bg-orange-500" : "bg-blue-500"
              }`}
              style={{ width: `${getPercentage()}%` }}
            />
          </View>
        </View>
      )}
    </View>
  );
}

/**
 * Quick upgrade button for navigation headers
 */
export function UpgradeButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-gradient-to-r from-green-500 to-green-600 rounded-full px-4 py-2 flex-row items-center"
    >
      <Ionicons name="star" size={16} color="white" />
      <Text className="text-white font-semibold ml-1 text-sm">Upgrade</Text>
    </TouchableOpacity>
  );
}
