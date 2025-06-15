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
      router.push("/subscription/pricing");
    }, 150);
  };

  if (!isVisible) return null;

  return (
    <RAnimated.View
      style={animatedStyle}
      className="mx-5 mb-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-4"
    >
      <View className="flex-row items-start">
        <View className="bg-green-100 rounded-full p-2 mr-3">
          <Ionicons name="leaf" size={20} color="#059669" />
        </View>

        <View className="flex-1">
          <Text className="text-green-800 font-semibold text-base mb-1">
            🌱 Welcome to GreenThumb!
          </Text>
          <Text className="text-green-700 text-sm leading-5 mb-3">
            You&apos;re starting with our free plan. Upgrade anytime for
            unlimited gardens, AI insights, and expert support.
          </Text>

          <View className="flex-row space-x-2">
            {showUpgrade && (
              <TouchableOpacity
                onPress={handleUpgrade}
                className="bg-green-600 rounded-lg py-2 px-4 flex-row items-center"
              >
                <Ionicons name="star" size={14} color="white" />
                <Text className="text-white font-medium ml-1 text-sm">
                  See Premium
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleDismiss}
              className="bg-white border border-green-300 rounded-lg py-2 px-4"
            >
              <Text className="text-green-700 font-medium text-sm">
                Maybe Later
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity onPress={handleDismiss} className="p-1">
          <Ionicons name="close" size={16} color="#6b7280" />
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
      router.push("/subscription/pricing");
    }, 150);
  };

  if (!isVisible) return null;

  return (
    <RAnimated.View
      style={animatedStyle}
      className="mx-5 mb-4 bg-white border border-blue-200 rounded-xl p-4 shadow-sm"
    >
      <View className="flex-row items-start">
        <View className="bg-blue-100 rounded-full p-2 mr-3">
          <Ionicons name={icon as any} size={20} color="#2563eb" />
        </View>

        <View className="flex-1">
          <Text className="text-blue-800 font-semibold text-base mb-1">
            ✨ {title}
          </Text>
          <Text className="text-blue-700 text-sm leading-5 mb-3">
            {description}
          </Text>

          <View className="flex-row space-x-2">
            <TouchableOpacity
              onPress={handleLearnMore}
              className="bg-blue-600 rounded-lg py-2 px-4"
            >
              <Text className="text-white font-medium text-sm">Learn More</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDismiss}
              className="bg-gray-100 rounded-lg py-2 px-4"
            >
              <Text className="text-gray-700 font-medium text-sm">Not Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity onPress={handleDismiss} className="p-1">
          <Ionicons name="close" size={16} color="#6b7280" />
        </TouchableOpacity>
      </View>
    </RAnimated.View>
  );
}
