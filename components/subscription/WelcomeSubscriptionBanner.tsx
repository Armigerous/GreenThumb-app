/**
 * Welcome subscription banner/modal - appears after successful signup
 * Shows for first week only, provides quick intro to premium features
 *
 * FEATURES:
 * - ✅ Minimal text, maximum impact
 * - ✅ Two variants: 'banner' (inline) and 'modal' (fullscreen)
 * - ✅ Quick visual hierarchy
 * - ✅ Simple call-to-action
 * - ✅ Brand-aligned outcome-focused messaging
 * - ✅ Guarantee-based positioning
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

  // Outcome-focused benefits (not technical features)
  const outcomes = [
    {
      icon: "shield-checkmark-outline" as const,
      text: "Guaranteed plant success",
    },
    { icon: "trending-up-outline" as const, text: "85% survival rate" },
    { icon: "heart-outline" as const, text: "Confident plant parenting" },
  ];

  const BannerContent = () => (
    <RAnimated.View
      style={animatedStyle}
      className="mx-4 mb-6 bg-gradient-to-br from-brand-50 to-cream-50 rounded-2xl shadow-lg overflow-hidden border border-brand-100"
    >
      <View className="p-5">
        <View className="flex-row items-center justify-between mb-3">
          <View className="bg-brand-100 px-3 py-1 rounded-full">
            <Text className="text-brand-700 font-paragraph-medium text-xs">
              First Week Special
            </Text>
          </View>
          <TouchableOpacity onPress={handleDismiss} className="p-1">
            <Ionicons name="close" size={18} color="#636059" />
          </TouchableOpacity>
        </View>

        <Text className="text-cream-800 font-title-bold text-lg mb-2">
          🌱 Stop Killing Plants - Guaranteed
        </Text>

        <Text className="text-cream-700 font-paragraph text-sm mb-4">
          Transform from anxious plant killer to confident plant parent
        </Text>

        <View className="space-y-2 mb-4">
          {outcomes.map((outcome, index) => (
            <View key={index} className="flex-row items-center">
              <Ionicons name={outcome.icon} size={16} color="#5E994B" />
              <Text className="text-cream-700 font-paragraph text-sm ml-2">
                {outcome.text}
              </Text>
            </View>
          ))}
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
              Later
            </Text>
          </TouchableOpacity>
        </View>

        <Text className="text-cream-500 font-paragraph text-xs text-center mt-3">
          30-day money-back guarantee
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

          <Text className="text-cream-800 font-title-bold text-2xl mb-3">
            Stop Killing Plants - Guaranteed
          </Text>

          <Text className="text-cream-700 font-paragraph text-base leading-6 mb-6">
            What if I told you that you could guarantee your plants will thrive,
            or get your money back?
          </Text>

          <View className="bg-cream-50 rounded-xl p-4 mb-6 border border-cream-200">
            <Text className="text-cream-800 font-title-semibold text-lg mb-2">
              The Results: 85% vs 45% Success Rate
            </Text>
            <Text className="text-cream-700 font-paragraph text-sm leading-5">
              You&apos;re almost twice as likely to succeed with GreenThumb.
              That means more thriving plants, less money wasted.
            </Text>
          </View>

          <View className="space-y-4 mb-6">
            {outcomes.map((outcome, index) => (
              <View
                key={index}
                className="flex-row items-center p-4 bg-cream-50 rounded-xl border border-cream-200"
              >
                <View className="bg-brand-100 rounded-full p-3 mr-4">
                  <Ionicons name={outcome.icon} size={24} color="#5E994B" />
                </View>
                <Text className="text-cream-700 font-paragraph-semibold text-base flex-1">
                  {outcome.text}
                </Text>
              </View>
            ))}
          </View>

          <View className="bg-accent-100 border border-accent-300 rounded-xl p-4 mb-6">
            <Text className="text-accent-800 font-paragraph-semibold text-sm mb-1">
              💰 30-Day Money-Back Guarantee
            </Text>
            <Text className="text-accent-800 font-paragraph text-sm">
              Best case: You finally become the plant parent you&apos;ve always
              wanted. Worst case: You get every penny back.
            </Text>
          </View>

          <View className="space-y-3">
            {showUpgrade && (
              <TouchableOpacity
                onPress={handleUpgrade}
                className="bg-brand-600 rounded-xl py-4 px-6"
              >
                <Text className="text-primary-foreground font-paragraph-bold text-center text-base">
                  Try Risk-Free for 30 Days
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleDismiss}
              className="border border-cream-300 rounded-xl py-4 px-6"
            >
              <Text className="text-cream-700 font-paragraph-semibold text-center text-base">
                Maybe Later
              </Text>
            </TouchableOpacity>
          </View>

          <Text className="text-cream-500 font-paragraph text-xs text-center mt-6">
            Join 25,000+ successful plant parents
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
