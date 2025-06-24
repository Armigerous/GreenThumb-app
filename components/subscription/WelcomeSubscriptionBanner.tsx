/**
 * Welcome subscription banner/modal - appears after successful signup
 * Shows for first week only, provides detailed intro to premium features
 *
 * FEATURES:
 * - ✅ Clear messaging that this offer is only available during the first week
 * - ✅ More descriptive content about premium benefits
 * - ✅ Two variants: 'banner' (inline) and 'modal' (fullscreen)
 * - ✅ Better visual hierarchy and feature preview
 * - ✅ Urgency indicators and social proof
 * - ✅ Brand-aligned messaging focused on outcomes over features
 * - ✅ Guarantee-based positioning and risk reversal
 *
 * USAGE:
 * Banner variant (default): Shows inline with other content, less intrusive
 * Modal variant: Fullscreen experience, more detailed information
 *
 * The component automatically detects if the user is in their first week
 * based on Clerk's user.createdAt field (handled in parent component)
 */

import { useCurrentSeason } from "@/lib/hooks/useCurrentSeason";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TouchableOpacity, View, Modal, ScrollView } from "react-native";
import RAnimated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const AnimatedTouchableOpacity =
  RAnimated.createAnimatedComponent(TouchableOpacity);

interface WelcomeSubscriptionBannerProps {
  onDismiss?: () => void;
  showUpgrade?: boolean;
  variant?: "banner" | "modal";
}

export function WelcomeSubscriptionBanner({
  onDismiss,
  showUpgrade = true,
  variant = "banner",
}: WelcomeSubscriptionBannerProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const season = useCurrentSeason();

  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const handleDismiss = () => {
    if (variant === "modal") {
      setIsVisible(false);
      onDismiss?.();
    } else {
      opacity.value = withTiming(0, { duration: 300 });
      translateY.value = withTiming(-40, { duration: 300 });

      setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, 300);
    }
  };

  const handleUpgrade = () => {
    if (variant === "banner") {
      scale.value = withSequence(
        withTiming(0.97, { duration: 150 }),
        withTiming(1, { duration: 250 })
      );
    }

    setTimeout(
      () => {
        router.push("/pricing");
      },
      variant === "banner" ? 200 : 0
    );
  };

  if (!isVisible) return null;

  // Brand-aligned outcome-focused features (not technical features)
  const outcomeFeatures = [
    {
      icon: "infinite-outline" as const,
      text: "Never lose another plant to neglect",
    },
    {
      icon: "calendar-outline" as const,
      text: "Know exactly when to care for each plant",
    },
    {
      icon: "analytics-outline" as const,
      text: "Watch your plants thrive with confidence",
    },
    {
      icon: "camera-outline" as const,
      text: "Catch problems before they become fatal",
    },
  ];

  const BannerContent = () => (
    <RAnimated.View
      style={animatedStyle}
      className="mx-4 mb-6 bg-gradient-to-br from-brand-50 to-cream-50 rounded-2xl shadow-lg overflow-hidden border border-brand-100"
    >
      <View className="p-5">
        {/* Header with timing indicator */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="bg-brand-100 px-3 py-1 rounded-full">
            <Text className="text-brand-700 font-paragraph-medium text-xs">
              First Week Only
            </Text>
          </View>
          <TouchableOpacity onPress={handleDismiss} className="p-1">
            <Ionicons name="close" size={18} color="#636059" />
          </TouchableOpacity>
        </View>

        {/* Primary brand message - outcome focused */}
        <Text className="text-cream-800 font-title-bold text-lg mb-2">
          🌱 Stop Killing Plants - Guaranteed
        </Text>

        {/* Risk reversal messaging */}
        <Text className="text-cream-700 font-paragraph text-sm leading-5 mb-4">
          Transform from anxious plant killer to confident plant parent in your
          first week. Join 25,000+ plant parents who save $200+ annually by
          keeping plants alive. 30-day money-back guarantee.
        </Text>

        {/* Outcome-focused features preview */}
        <View className="space-y-2 mb-4">
          {outcomeFeatures.slice(0, 2).map((feature, index) => (
            <View key={index} className="flex-row items-center">
              <Ionicons name={feature.icon} size={16} color="#5E994B" />
              <Text className="text-cream-700 font-paragraph text-xs ml-2">
                {feature.text}
              </Text>
            </View>
          ))}
          <Text className="text-cream-600 font-paragraph text-xs">
            + 85% plant survival rate vs. 45% industry average
          </Text>
        </View>

        <View className="flex-row gap-3 items-center">
          {showUpgrade && (
            <TouchableOpacity
              onPress={handleUpgrade}
              className="bg-brand-600 rounded-lg py-3 px-5 flex-1"
            >
              <Text className="text-primary-foreground font-paragraph-semibold text-center text-sm">
                Try Risk-Free
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={handleDismiss}>
            <Text className="text-cream-600 font-paragraph-semibold text-sm">
              Maybe Later
            </Text>
          </TouchableOpacity>
        </View>

        {/* Urgency with guarantee */}
        <Text className="text-cream-500 font-paragraph text-xs text-center mt-3">
          First week special pricing • Risk-free guarantee
        </Text>
      </View>
    </RAnimated.View>
  );

  const ModalContent = () => (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleDismiss}
    >
      <ScrollView className="flex-1 bg-cream-50">
        <View className="p-6 pt-12">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <View className="bg-brand-100 px-4 py-2 rounded-full">
              <Text className="text-brand-700 font-paragraph-semibold text-sm">
                🎉 First Week Special
              </Text>
            </View>
            <TouchableOpacity onPress={handleDismiss} className="p-2">
              <Ionicons name="close" size={24} color="#636059" />
            </TouchableOpacity>
          </View>

          {/* Primary brand message */}
          <Text className="text-cream-800 font-title-bold text-2xl mb-3">
            Stop Killing Plants - Guaranteed
          </Text>

          {/* Problem agitation + solution */}
          <Text className="text-cream-700 font-paragraph text-base leading-6 mb-6">
            Tired of killing plants? Frustrated with generic advice that
            doesn&apos;t work? What if I told you that you could guarantee your
            plants will thrive, or get your money back?
          </Text>

          {/* Problem/Solution with brand messaging */}
          <View className="bg-cream-50 rounded-xl p-4 mb-6 border border-cream-200">
            <Text className="text-cream-800 font-title-semibold text-lg mb-2">
              The Problem: $200+ in Dead Plants Annually
            </Text>
            <Text className="text-cream-700 font-paragraph text-sm leading-5">
              85% of plant parents kill plants in their first year. But
              here&apos;s what&apos;s different: We don&apos;t give generic
              advice. Our AI creates personalized plans for your exact plants,
              conditions, and schedule.
            </Text>
          </View>

          {/* Proof statement */}
          <View className="bg-brand-50 rounded-xl p-4 mb-6 border border-brand-100">
            <Text className="text-brand-700 font-title-semibold text-lg mb-2">
              The Results: 85% vs 45% Success Rate
            </Text>
            <Text className="text-cream-700 font-paragraph text-sm leading-5">
              You&apos;re almost twice as likely to succeed with GreenThumb.
              That means more thriving plants, less money wasted, and the
              confidence you&apos;ve always wanted.
            </Text>
          </View>

          {/* Outcomes you'll get */}
          <Text className="text-cream-800 font-title-semibold text-lg mb-4">
            What You&apos;ll Experience:
          </Text>

          <View className="space-y-4 mb-6">
            {outcomeFeatures.map((feature, index) => (
              <View key={index} className="flex-row items-center">
                <View className="bg-brand-100 rounded-full p-2 mr-4">
                  <Ionicons name={feature.icon} size={20} color="#5E994B" />
                </View>
                <Text className="text-cream-700 font-paragraph text-sm flex-1">
                  {feature.text}
                </Text>
              </View>
            ))}
          </View>

          {/* Risk reversal emphasis */}
          <View className="bg-accent-200 border border-accent-800 rounded-xl p-4 mb-6">
            <Text className="text-accent-800 font-paragraph-semibold text-sm mb-1">
              💰 30-Day Money-Back Guarantee
            </Text>
            <Text className="text-accent-800 font-paragraph text-sm">
              Best case: You finally become the plant parent you&apos;ve always
              wanted. Worst case: You try it for 30 days and get every penny
              back. What makes more sense?
            </Text>
          </View>

          {/* Actions with guarantee language */}
          <View className="space-y-3">
            {showUpgrade && (
              <TouchableOpacity
                onPress={handleUpgrade}
                className="bg-brand-600 rounded-xl py-4 px-6"
              >
                <Text className="text-primary-foreground font-paragraph-bold text-center text-base">
                  Try Risk-Free for 30 Days
                </Text>
                <Text className="text-brand-100 font-paragraph text-center text-sm mt-1">
                  First week pricing • Cancel anytime
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleDismiss}
              className="border border-cream-300 rounded-xl py-4 px-6"
            >
              <Text className="text-cream-700 font-paragraph-semibold text-center text-base">
                I&apos;ll Keep Killing Plants Instead
              </Text>
            </TouchableOpacity>
          </View>

          {/* Social proof */}
          <Text className="text-cream-500 font-paragraph text-xs text-center mt-6">
            Join 25,000+ successful plant parents • Save $200+ annually • 85%
            success rate
          </Text>
        </View>
      </ScrollView>
    </Modal>
  );

  return variant === "modal" ? <ModalContent /> : <BannerContent />;
}

/**
 * Feature discovery card - shows premium features contextually
 */
export function FeatureDiscoveryCard({
  feature,
  icon,
  title,
  description,
}: {
  feature: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);

  const opacity = useSharedValue(1);
  const pressState = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const animatedButton = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      pressState.value,
      [0, 1],
      ["#5E994B", "#4A7A3B"]
    );
    return {
      backgroundColor,
    };
  });

  const handleDismiss = () => {
    opacity.value = withTiming(0, { duration: 200 });
    setTimeout(() => setIsVisible(false), 200);
  };

  const handleLearnMore = () => {
    router.push("/pricing");
  };

  if (!isVisible) return null;

  return (
    <RAnimated.View
      style={animatedStyle}
      className="mx-4 mb-4 bg-cream-50 border border-brand-100 rounded-2xl p-4 shadow-md"
    >
      <View className="flex-row items-center">
        <View className="bg-brand-100 rounded-full p-2.5 mr-4">
          <Ionicons name={icon} size={22} color="#5E994B" />
        </View>

        <View className="flex-1">
          <Text className="text-cream-800 font-title-semibold text-base mb-0.5">
            ✨ {title}
          </Text>
          <Text className="text-cream-700 font-paragraph text-sm leading-5">
            {description}
          </Text>
        </View>
      </View>

      <View className="flex-row gap-3 mt-4">
        <AnimatedTouchableOpacity
          style={animatedButton}
          onPressIn={() =>
            (pressState.value = withTiming(1, { duration: 150 }))
          }
          onPressOut={() =>
            (pressState.value = withTiming(0, { duration: 200 }))
          }
          onPress={handleLearnMore}
          className="rounded-lg py-2.5 px-4 flex-1"
        >
          <Text className="text-primary-foreground font-paragraph-semibold text-sm text-center">
            Learn More
          </Text>
        </AnimatedTouchableOpacity>

        <TouchableOpacity
          onPress={handleDismiss}
          className="rounded-lg py-2.5 px-4"
        >
          <Text className="text-cream-600 font-paragraph-semibold text-sm">
            Not Now
          </Text>
        </TouchableOpacity>
      </View>
    </RAnimated.View>
  );
}
