/**
 * Welcome subscription banner - appears after successful signup
 * Subtle introduction to premium features without disrupting flow
 */

import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import RAnimated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
} from "react-native-reanimated";

interface WelcomeSubscriptionBannerProps {
  onDismiss?: () => void;
  showUpgrade?: boolean;
}

export function WelcomeSubscriptionBanner({
  onDismiss,
  showUpgrade = true,
}: WelcomeSubscriptionBannerProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);

  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const handleDismiss = () => {
    opacity.value = withTiming(0, { duration: 200 });
    translateY.value = withTiming(-20, { duration: 200 });

    setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, 200);
  };

  const handleUpgrade = () => {
    scale.value = withSequence(
      withTiming(0.98, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );

    setTimeout(() => {
      router.push("/pricing");
    }, 150);
  };

  if (!isVisible) return null;

  return (
    <RAnimated.View
      style={animatedStyle}
      className="mx-4 mb-4 bg-brand-50 border border-brand-100 rounded-xl p-4 shadow-sm"
    >
      <View className="flex-row items-start">
        <View className="bg-brand-100 rounded-full p-2 mr-3">
          <Ionicons name="leaf" size={20} color="#5E994B" />
        </View>

        <View className="flex-1">
          <Text className="text-cream-800 font-title-semibold text-base mb-1">
            🌱 Welcome to Your Garden Journey!
          </Text>
          <Text className="text-cream-700 font-paragraph text-sm leading-5 mb-3">
            You&apos;ve started with our free plan. Transform into a confident
            plant parent with unlimited gardens and AI-powered insights.
          </Text>

          <View className="flex-row gap-2">
            {showUpgrade && (
              <TouchableOpacity
                onPress={handleUpgrade}
                className="bg-brand-600 rounded-lg py-2 px-4 flex-row items-center"
              >
                <Ionicons name="star" size={14} color="#fffefa" />
                <Text className="text-primary-foreground font-paragraph-semibold ml-1 text-sm">
                  Grow Premium
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleDismiss}
              className="bg-cream-50 border border-brand-200 rounded-lg py-2 px-4"
            >
              <Text className="text-cream-700 font-paragraph-semibold text-sm">
                Later
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity onPress={handleDismiss} className="p-1">
          <Ionicons name="close" size={16} color="#636059" />
        </TouchableOpacity>
      </View>
    </RAnimated.View>
  );
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
  icon: string;
  title: string;
  description: string;
}) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);

  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const handleDismiss = () => {
    opacity.value = withTiming(0, { duration: 200 });
    setTimeout(() => setIsVisible(false), 200);
  };

  const handleLearnMore = () => {
    scale.value = withSequence(
      withTiming(0.98, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );

    setTimeout(() => {
      router.push("/pricing");
    }, 150);
  };

  if (!isVisible) return null;

  return (
    <RAnimated.View
      style={animatedStyle}
      className="mx-4 mb-4 bg-cream-50 border border-brand-200 rounded-xl p-4 shadow-sm"
    >
      <View className="flex-row items-start">
        <View className="bg-brand-100 rounded-full p-2 mr-3">
          <Ionicons name={icon as any} size={20} color="#5E994B" />
        </View>

        <View className="flex-1">
          <Text className="text-cream-800 font-title-semibold text-base mb-1">
            ✨ {title}
          </Text>
          <Text className="text-cream-700 font-paragraph text-sm leading-5 mb-3">
            {description}
          </Text>

          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={handleLearnMore}
              className="bg-brand-600 rounded-lg py-2 px-4"
            >
              <Text className="text-primary-foreground font-paragraph-semibold text-sm">
                See How
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDismiss}
              className="bg-cream-100 border border-cream-300 rounded-lg py-2 px-4"
            >
              <Text className="text-cream-700 font-paragraph-semibold text-sm">
                Not Now
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity onPress={handleDismiss} className="p-1">
          <Ionicons name="close" size={16} color="#636059" />
        </TouchableOpacity>
      </View>
    </RAnimated.View>
  );
}
