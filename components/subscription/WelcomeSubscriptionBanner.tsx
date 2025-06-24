/**
 * Welcome subscription banner - appears after successful signup
 * Subtle introduction to premium features without disrupting flow
 */

import { useCurrentSeason } from "@/lib/hooks/useCurrentSeason";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
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
}

export function WelcomeSubscriptionBanner({
  onDismiss,
  showUpgrade = true,
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
    opacity.value = withTiming(0, { duration: 300 });
    translateY.value = withTiming(-40, { duration: 300 });

    setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, 300);
  };

  const handleUpgrade = () => {
    scale.value = withSequence(
      withTiming(0.97, { duration: 150 }),
      withTiming(1, { duration: 250 })
    );

    setTimeout(() => {
      router.push("/pricing");
    }, 200);
  };

  if (!isVisible) return null;

  return (
    <RAnimated.View
      style={animatedStyle}
      className="mx-4 mb-6 bg-brand-50 rounded-2xl shadow-lg overflow-hidden"
    >
      <View className="p-4">
        <Text className="text-cream-800 font-title-bold text-lg mb-1">
          Ready to See Your Garden Thrive?
        </Text>
        <Text className="text-cream-700 font-paragraph text-sm leading-5 mb-4">
          Go from plant-killer to confident plant-parent. Unlock premium tools
          guaranteed to help your plants flourish.
        </Text>

        <View className="flex-row gap-3 items-center">
          {showUpgrade && (
            <TouchableOpacity
              onPress={handleUpgrade}
              className="bg-brand-600 rounded-lg py-2.5 px-5 flex-1"
            >
              <Text className="text-primary-foreground font-paragraph-semibold text-center text-sm">
                Unlock Premium
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={handleDismiss}>
            <Text className="text-cream-600 font-paragraph-semibold text-sm">
              Maybe Later
            </Text>
          </TouchableOpacity>
        </View>
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
