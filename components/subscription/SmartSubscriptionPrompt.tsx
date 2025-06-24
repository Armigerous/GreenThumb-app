/**
 * Smart subscription prompt component
 *
 * Redesigned to align with GreenThumb brand identity - nurturing, confident,
 * and focused on plant care transformation outcomes rather than technical features.
 */

import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Modal, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import RAnimated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  withSequence,
  interpolateColor,
} from "react-native-reanimated";

import {
  useSubscriptionTriggers,
  SubscriptionTrigger,
  TRIGGER_TEMPLATES,
} from "@/lib/subscriptionTriggers";
import { BackgroundGradient } from "@/components/UI/BackgroundGradient";
import { TitleText, SubtitleText, BodyText } from "@/components/UI/Text";
import { useCurrentSeason } from "@/lib/hooks/useCurrentSeason";
import SubmitButton from "@/components/UI/SubmitButton";

const AnimatedTouchableOpacity =
  RAnimated.createAnimatedComponent(TouchableOpacity);

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
  const season = useCurrentSeason();
  const [trigger, setTrigger] = useState<SubscriptionTrigger | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const subscriptionTriggers = useSubscriptionTriggers(user?.id);

  // Animation values
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);
  const translateY = useSharedValue(20);
  const buttonPress = useSharedValue(0);

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
      opacity.value = withTiming(1, { duration: 400 });
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      translateY.value = withTiming(0, { duration: 400 });
    }
  }, [isVisible, trigger]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      buttonPress.value,
      [0, 1],
      ["#5E994B", "#4A7A3B"] // brand-600 to brand-700
    );
    return { backgroundColor };
  });

  const handleDismiss = async () => {
    if (!trigger) return;

    // Animate out with gentle spring
    opacity.value = withTiming(0, { duration: 300 });
    scale.value = withTiming(0.95, { duration: 300 });
    translateY.value = withTiming(20, { duration: 300 });

    // Mark trigger as shown to avoid spam
    await subscriptionTriggers.markTriggerShown(trigger.moment);

    setTimeout(() => {
      setIsVisible(false);
      setTrigger(null);
      onDismiss?.();
    }, 300);
  };

  const handleUpgrade = async () => {
    if (!trigger) return;

    // Button press animation
    buttonPress.value = withSequence(
      withTiming(1, { duration: 150 }),
      withTiming(0, { duration: 200 })
    );

    // Track engagement
    await subscriptionTriggers.trackEngagement("subscription_prompt_upgrade");
    await subscriptionTriggers.markTriggerShown(trigger.moment);

    setTimeout(() => {
      router.push("/(tabs)/pricing");
      onUpgrade?.();
    }, 200);
  };

  const handleLearnMore = async () => {
    if (!trigger) return;

    // Track engagement
    await subscriptionTriggers.trackEngagement(
      "subscription_prompt_learn_more"
    );

    router.push("/(tabs)/pricing");
  };

  if (!isVisible || !trigger || subscriptionTriggers.isPremium) {
    return null;
  }

  // Brand-aligned messaging based on trigger type
  const getBrandMessage = () => {
    switch (trigger.moment) {
      case "garden_limit_approaching":
        return {
          title: "Ready to Design Your Dream Garden?",
          subtitle:
            "Transform from limited to limitless with premium garden tools",
          icon: "leaf" as const,
          benefits: [
            "Create unlimited beautiful garden spaces",
            "Organize plants like a pro gardener",
            "Share your garden success with family",
            "85% plant survival guarantee included",
          ],
        };
      case "task_limit_approaching":
        return {
          title: "Never Wonder 'What Should I Do?' Again",
          subtitle: "Unlock unlimited AI-powered plant care guidance",
          icon: "checkmark-circle" as const,
          benefits: [
            "Unlimited personalized care tasks",
            "Weather-aware seasonal adjustments",
            "Expert consultation when you need it",
            "Save $200+ annually on plant replacements",
          ],
        };
      case "photo_limit_approaching":
        return {
          title: "Watch Your Plant Journey Unfold",
          subtitle: "Capture unlimited progress photos and growth stories",
          icon: "camera" as const,
          benefits: [
            "Unlimited progress photo tracking",
            "AI-powered health analysis",
            "Before & after transformation gallery",
            "Share your plant parent success story",
          ],
        };
      case "feature_discovery":
        return {
          title: "You're Becoming a Confident Plant Parent!",
          subtitle:
            "Unlock premium features designed to guarantee your success",
          icon: "sparkles" as const,
          benefits: [
            "AI learns your specific conditions",
            "85% plant survival vs 45% average",
            "Join 25,000+ successful plant parents",
            "30-day money-back guarantee",
          ],
        };
      default:
        return {
          title: "Transform Your Plant Care Journey",
          subtitle: "From anxious plant killer to confident plant parent",
          icon: "leaf" as const,
          benefits: [
            "Personalized care plans that actually work",
            "Never kill another plant again",
            "Expert support when you need it most",
            "Guaranteed plant success or money back",
          ],
        };
    }
  };

  const brandMessage = getBrandMessage();

  const promptContent = (
    <RAnimated.View style={animatedStyle}>
      <View className="bg-cream-50 rounded-3xl shadow-lg overflow-hidden mx-4">
        <BackgroundGradient>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header with close button */}
            <View className="flex-row justify-between items-start p-6 pb-2">
              <View className="flex-1 pr-4">
                <TitleText className="text-2xl text-cream-800 mb-1">
                  {brandMessage.title}
                </TitleText>
                <BodyText className="text-cream-700 text-base leading-relaxed">
                  {brandMessage.subtitle}
                </BodyText>
              </View>

              <TouchableOpacity
                onPress={handleDismiss}
                className="bg-cream-200 rounded-full p-2 opacity-70"
              >
                <Ionicons name="close" size={18} color="#2e2c29" />
              </TouchableOpacity>
            </View>

            <View className="px-6 pb-6">
              {/* Feature icon */}
              <View className="self-center bg-brand-100 rounded-full p-4 mb-6">
                <Ionicons name={brandMessage.icon} size={32} color="#5E994B" />
              </View>

              {/* Benefits list */}
              <View className="space-y-4 mb-6">
                {brandMessage.benefits.map((benefit, index) => (
                  <View key={index} className="flex-row items-start">
                    <View className="bg-brand-500 rounded-full p-1 mr-3 mt-1">
                      <Ionicons name="checkmark" size={12} color="white" />
                    </View>
                    <BodyText className="flex-1 text-cream-800 leading-relaxed">
                      {benefit}
                    </BodyText>
                  </View>
                ))}
              </View>

              {/* Guarantee badge */}
              <View className="bg-accent-200 border border-accent-300 rounded-2xl p-4 mb-6">
                <View className="flex-row items-center">
                  <Ionicons
                    name="shield-checkmark"
                    size={24}
                    color="#483b00"
                    className="mr-3"
                  />
                  <View className="flex-1">
                    <SubtitleText className="text-accent-800 font-title-bold">
                      85% Success Guarantee
                    </SubtitleText>
                    <BodyText className="text-accent-800 text-sm mt-1">
                      Your plants will thrive, or get every penny back. No
                      questions asked.
                    </BodyText>
                  </View>
                </View>
              </View>

              {/* Action buttons */}
              <AnimatedTouchableOpacity
                style={buttonAnimatedStyle}
                onPressIn={() =>
                  (buttonPress.value = withTiming(1, { duration: 150 }))
                }
                onPressOut={() =>
                  (buttonPress.value = withTiming(0, { duration: 200 }))
                }
                onPress={handleUpgrade}
                className="rounded-2xl py-4 mb-4"
              >
                <BodyText className="text-center text-primary-foreground font-paragraph-semibold text-lg">
                  Transform Your Plant Care
                </BodyText>
              </AnimatedTouchableOpacity>

              <TouchableOpacity
                onPress={handleLearnMore}
                className="bg-cream-100 border border-cream-300 rounded-2xl py-3 mb-3"
              >
                <BodyText className="text-center text-cream-700 font-paragraph-semibold">
                  See All Premium Features
                </BodyText>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleDismiss} className="py-2">
                <BodyText className="text-center text-cream-600">
                  Maybe later
                </BodyText>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </BackgroundGradient>
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
        <View className="flex-1 bg-black/50 justify-center items-center px-4">
          {promptContent}
        </View>
      </Modal>
    );
  }

  return promptContent;
}

/**
 * Hook to trigger subscription prompts programmatically
 * Updated with brand-focused messaging and user psychology
 */
export function useSmartSubscriptionPrompt() {
  const { user } = useUser();
  const subscriptionTriggers = useSubscriptionTriggers(user?.id);

  /**
   * Show a prompt after a user completes an action
   * Focus on celebrating progress and suggesting next steps
   */
  const triggerAfterAction = async (
    action: string,
    options?: {
      delay?: number;
      forceShow?: boolean;
      celebrateProgress?: boolean;
    }
  ) => {
    if (subscriptionTriggers.isPremium) return;

    // Track the action
    await subscriptionTriggers.trackEngagement(action);

    // Check if we should show a prompt
    const trigger = await subscriptionTriggers.getCurrentTrigger();

    if (trigger || options?.forceShow) {
      // Enhance trigger with celebration messaging if appropriate
      if (options?.celebrateProgress && trigger) {
        return {
          ...trigger,
          title: "🎉 Great Progress! " + trigger.title,
          subtitle:
            "You're becoming a confident plant parent. Ready for the next level?",
        };
      }
      return trigger;
    }

    return null;
  };

  /**
   * Show prompt when user hits a usage limit
   * Focus on transformation outcomes rather than limits
   */
  const triggerOnLimitReached = async (
    limitType: "gardens" | "tasks" | "photos" | "ai",
    currentUsage: number,
    limit: number
  ) => {
    if (subscriptionTriggers.isPremium) return null;

    const percentage = (currentUsage / limit) * 100;

    if (percentage >= 80) {
      // Brand-focused messaging for different limit types
      const messages = {
        gardens: {
          title: "Ready to Create Your Garden Paradise?",
          subtitle: `You've designed ${currentUsage} beautiful gardens! Unlock unlimited spaces to grow.`,
          benefits: [
            "Design unlimited garden spaces",
            "Advanced organization tools",
            "Family garden sharing",
            "Professional garden layouts",
          ],
        },
        tasks: {
          title: "You're Mastering Plant Care!",
          subtitle: `${currentUsage} completed tasks show you're committed. Unlock unlimited guidance.`,
          benefits: [
            "Unlimited AI-powered tasks",
            "Seasonal care adjustments",
            "Expert consultation access",
            "Advanced scheduling tools",
          ],
        },
        photos: {
          title: "Your Plant Journey is Beautiful!",
          subtitle: `${currentUsage} photos captured! Unlock unlimited progress tracking.`,
          benefits: [
            "Unlimited progress photos",
            "AI health analysis",
            "Growth timeline creation",
            "Success story sharing",
          ],
        },
        ai: {
          title: "AI is Helping You Succeed!",
          subtitle: `${currentUsage} AI consultations used. Get unlimited expert guidance.`,
          benefits: [
            "Unlimited AI plant analysis",
            "Instant expert recommendations",
            "24/7 plant problem solving",
            "Predictive care suggestions",
          ],
        },
      };

      const message = messages[limitType];

      return {
        moment: `${limitType}_limit_approaching` as any,
        title: message.title,
        subtitle: message.subtitle,
        benefits: message.benefits,
        urgency: "high" as const,
        priority: "high" as const,
        feature: limitType,
      };
    }

    return null;
  };

  /**
   * Show feature discovery prompt
   * Focus on user success and next-level outcomes
   */
  const triggerFeatureDiscovery = async (featureName: string) => {
    if (subscriptionTriggers.isPremium) return null;

    const canShow = await subscriptionTriggers.shouldShowTrigger(
      "feature_discovery"
    );
    if (!canShow) return null;

    return {
      moment: "feature_discovery" as const,
      title: "You're Ready for Premium Plant Care!",
      subtitle: `Unlock ${featureName} and transform into a confident plant parent`,
      benefits: [
        "85% plant survival guarantee",
        "Join 25,000+ successful plant parents",
        "Personalized AI care plans",
        "Expert support when you need it",
      ],
      urgency: "medium" as const,
      priority: "medium" as const,
      feature: featureName,
    };
  };

  return {
    triggerAfterAction,
    triggerOnLimitReached,
    triggerFeatureDiscovery,
    isPremium: subscriptionTriggers.isPremium,
  };
}
