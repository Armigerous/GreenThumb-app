/**
 * Smart subscription prompt component
 *
 * Uses behavioral triggers to show contextual subscription prompts
 * at strategic moments without disrupting the user experience.
 */

import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import RAnimated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  withSequence,
} from "react-native-reanimated";

import {
  useSubscriptionTriggers,
  SubscriptionTrigger,
  TRIGGER_TEMPLATES,
} from "@/lib/subscriptionTriggers";

interface SmartSubscriptionPromptProps {
  /** Trigger the prompt based on a specific moment */
  triggerMoment?:
    | "onboarding"
    | "usage_limit"
    | "feature_discovery"
    | "engagement";

  /** Custom trigger data (overrides automatic trigger detection) */
  customTrigger?: SubscriptionTrigger;

  /** Show as modal vs inline */
  showAsModal?: boolean;

  /** Callback when prompt is dismissed */
  onDismiss?: () => void;

  /** Callback when user upgrades */
  onUpgrade?: () => void;
}

export function SmartSubscriptionPrompt({
  triggerMoment,
  customTrigger,
  showAsModal = false,
  onDismiss,
  onUpgrade,
}: SmartSubscriptionPromptProps) {
  const { user } = useUser();
  const router = useRouter();
  const [trigger, setTrigger] = useState<SubscriptionTrigger | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const subscriptionTriggers = useSubscriptionTriggers(user?.id);

  // Animation values
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const translateY = useSharedValue(20);

  // Load appropriate trigger
  useEffect(() => {
    if (subscriptionTriggers.isPremium) return;

    if (customTrigger) {
      setTrigger(customTrigger);
      setIsVisible(true);
      return;
    }

    // Auto-detect trigger based on current state
    const loadTrigger = async () => {
      const currentTrigger = await subscriptionTriggers.getCurrentTrigger();
      if (currentTrigger) {
        setTrigger(currentTrigger);
        setIsVisible(true);
      }
    };

    loadTrigger();
  }, [customTrigger, subscriptionTriggers.isPremium]);

  // Animate in when visible
  useEffect(() => {
    if (isVisible && trigger) {
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSpring(1, { damping: 15 });
      translateY.value = withTiming(0, { duration: 300 });
    }
  }, [isVisible, trigger]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  const handleDismiss = async () => {
    if (!trigger) return;

    // Animate out
    opacity.value = withTiming(0, { duration: 200 });
    scale.value = withTiming(0.9, { duration: 200 });
    translateY.value = withTiming(20, { duration: 200 });

    // Mark trigger as shown to avoid spam
    await subscriptionTriggers.markTriggerShown(trigger.moment);

    setTimeout(() => {
      setIsVisible(false);
      setTrigger(null);
      onDismiss?.();
    }, 200);
  };

  const handleUpgrade = async () => {
    if (!trigger) return;

    // Button press animation
    scale.value = withSequence(
      withTiming(0.98, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );

    // Track engagement
    await subscriptionTriggers.trackEngagement("subscription_prompt_upgrade");
    await subscriptionTriggers.markTriggerShown(trigger.moment);

    setTimeout(() => {
      router.push("/pricing");
      onUpgrade?.();
    }, 150);
  };

  const handleLearnMore = async () => {
    if (!trigger) return;

    // Track engagement
    await subscriptionTriggers.trackEngagement(
      "subscription_prompt_learn_more"
    );

    router.push("/pricing");
  };

  if (!isVisible || !trigger || subscriptionTriggers.isPremium) {
    return null;
  }

  const urgencyColors = {
    low: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
      accent: "text-blue-600",
      button: "bg-blue-600",
    },
    medium: {
      bg: "bg-orange-50",
      border: "border-orange-200",
      text: "text-orange-800",
      accent: "text-orange-600",
      button: "bg-orange-600",
    },
    high: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      accent: "text-red-600",
      button: "bg-red-600",
    },
  };

  const colors = urgencyColors[trigger.urgency || "medium"];

  const promptContent = (
    <RAnimated.View
      style={animatedStyle}
      className={`${colors.bg} ${colors.border} border rounded-xl p-5 m-5 shadow-sm`}
    >
      <View className="flex-row items-start">
        {/* Icon based on trigger type */}
        <View className={`${colors.button} rounded-full p-2 mr-4`}>
          <Ionicons
            name={
              trigger.moment.includes("garden")
                ? "leaf"
                : trigger.moment.includes("task")
                ? "checkmark"
                : trigger.moment.includes("photo")
                ? "camera"
                : trigger.moment.includes("ai")
                ? "bulb"
                : "star"
            }
            size={20}
            color="white"
          />
        </View>

        <View className="flex-1">
          {/* Header */}
          <Text className={`${colors.text} font-bold text-lg mb-1`}>
            {trigger.title}
          </Text>
          <Text className={`${colors.accent} text-sm mb-4`}>
            {trigger.subtitle}
          </Text>

          {/* Benefits */}
          <View className="mb-4">
            {trigger.benefits.slice(0, 3).map((benefit, index) => (
              <View key={index} className="flex-row items-center mb-2">
                <Ionicons name="checkmark-circle" size={16} color="#059669" />
                <Text className="text-gray-700 text-sm ml-2">{benefit}</Text>
              </View>
            ))}
          </View>

          {/* Actions */}
          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={handleUpgrade}
              className={`${colors.button} rounded-lg py-3 px-4 flex-1`}
            >
              <Text className="text-white font-semibold text-center">
                Upgrade Now
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLearnMore}
              className="bg-white border border-gray-300 rounded-lg py-3 px-4"
            >
              <Text className="text-gray-700 font-medium">Learn More</Text>
            </TouchableOpacity>
          </View>

          {/* Dismiss option */}
          <TouchableOpacity onPress={handleDismiss} className="mt-3 py-2">
            <Text className="text-gray-500 text-center text-sm">
              Not interested right now
            </Text>
          </TouchableOpacity>
        </View>

        {/* Close button */}
        <TouchableOpacity onPress={handleDismiss} className="p-1">
          <Ionicons name="close" size={18} color="#6b7280" />
        </TouchableOpacity>
      </View>
    </RAnimated.View>
  );

  if (showAsModal) {
    return (
      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={handleDismiss}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="max-w-sm w-full">{promptContent}</View>
        </View>
      </Modal>
    );
  }

  return promptContent;
}

/**
 * Hook to trigger subscription prompts programmatically
 */
export function useSmartSubscriptionPrompt() {
  const { user } = useUser();
  const subscriptionTriggers = useSubscriptionTriggers(user?.id);

  /**
   * Show a prompt after a user completes an action
   */
  const triggerAfterAction = async (
    action: string,
    options?: {
      delay?: number;
      forceShow?: boolean;
      customMessage?: string;
    }
  ) => {
    if (subscriptionTriggers.isPremium) return;

    // Track the action
    await subscriptionTriggers.trackEngagement(action);

    // Check if we should show a prompt
    const trigger = await subscriptionTriggers.getCurrentTrigger();

    if (trigger || options?.forceShow) {
      // Return the trigger data to be shown by the component
      return trigger;
    }

    return null;
  };

  /**
   * Show prompt when user hits a usage limit
   */
  const triggerOnLimitReached = async (
    limitType: "gardens" | "tasks" | "photos" | "ai",
    currentUsage: number,
    limit: number
  ) => {
    if (subscriptionTriggers.isPremium) return null;

    const percentage = (currentUsage / limit) * 100;

    if (percentage >= 90) {
      const template =
        TRIGGER_TEMPLATES[
          `${limitType}_limit_approaching` as keyof typeof TRIGGER_TEMPLATES
        ];

      if (template) {
        return {
          ...template,
          subtitle: `You've used ${currentUsage} of ${limit} ${limitType}`,
          urgency: "high" as const,
        };
      }
    }

    return null;
  };

  /**
   * Show feature discovery prompt
   */
  const triggerFeatureDiscovery = async (featureName: string) => {
    if (subscriptionTriggers.isPremium) return null;

    const canShow = await subscriptionTriggers.shouldShowTrigger(
      "feature_discovery"
    );
    if (!canShow) return null;

    return {
      ...TRIGGER_TEMPLATES.feature_discovery,
      subtitle: `Discover ${featureName} and other premium features`,
      urgency: "medium" as const,
    };
  };

  return {
    triggerAfterAction,
    triggerOnLimitReached,
    triggerFeatureDiscovery,
    isPremium: subscriptionTriggers.isPremium,
  };
}
