import React from "react";
import {
  Image,
  ImageSourcePropType,
  Text,
  View,
  ViewStyle,
  useWindowDimensions,
  ImageStyle,
} from "react-native";
import Animated, {
  AnimatedStyleProp,
  interpolate,
  useAnimatedStyle,
  withTiming,
  SharedValue,
  Easing,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Optimized animation config to match native keyboard animation speed
// Native keyboard animations are typically faster (around 220-250ms)
const ANIMATION_CONFIG = {
  duration: 220, // Faster to match native keyboard speed
  easing: Easing.bezier(0.16, 1, 0.3, 1), // Fast at start, slower at end
};

type AuthGreetingProps = {
  imageSource: ImageSourcePropType;
  title: string;
  subtitle: string;
  imageAnimatedStyle?: AnimatedStyleProp<ImageStyle>;
  textAnimatedStyle?: AnimatedStyleProp<ViewStyle>;
  keyboardVisible?: Animated.SharedValue<number>;
};

export function AuthGreeting({
  imageSource,
  title,
  subtitle,
  imageAnimatedStyle,
  textAnimatedStyle,
  keyboardVisible,
}: AuthGreetingProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Calculate available space (accounting for safe area insets)
  const availableHeight = height - insets.top - insets.bottom;

  // Base image size calculations
  const baseImageSize = Math.min(
    Math.max(availableHeight * 0.4, 150),
    width * 0.7,
    350
  );

  // Image size animation - optimize by directly using the shared value without extra interpolation
  const imageStyle = useAnimatedStyle(() => {
    if (!keyboardVisible) return {};

    // Directly calculate size based on keyboard value for immediate response
    const scaleFactor = interpolate(
      keyboardVisible.value,
      [0, 0.7], // React earlier in the animation (at 70% instead of 100%)
      [1, 0.5],
      "clamp"
    );

    return {
      width: withTiming(baseImageSize * scaleFactor, ANIMATION_CONFIG),
      height: withTiming(baseImageSize * scaleFactor, ANIMATION_CONFIG),
    };
  }, [keyboardVisible, baseImageSize]);

  // Text container animation with faster response
  const textContainerStyle = useAnimatedStyle(() => {
    if (!keyboardVisible) return {};

    // React earlier in the animation to appear faster
    const translateY = interpolate(
      keyboardVisible.value,
      [0, 0.7], // Start movement earlier
      [0, -80],
      "clamp"
    );

    return {
      transform: [{ translateY: withTiming(translateY, ANIMATION_CONFIG) }],
    };
  }, [keyboardVisible]);

  // Enhanced text styling with immediate response
  const titleTextStyle = useAnimatedStyle(() => {
    if (!keyboardVisible) return {};

    // Faster font size response
    const targetFontSize = interpolate(
      keyboardVisible.value,
      [0, 0.7], // React earlier
      [24, 18],
      "clamp"
    );

    return {
      fontSize: withTiming(targetFontSize, ANIMATION_CONFIG),
      transform: [
        {
          scale: withTiming(
            interpolate(keyboardVisible.value, [0, 0.7], [1, 0.9], "clamp"),
            ANIMATION_CONFIG
          ),
        },
      ],
    };
  }, [keyboardVisible]);

  const subtitleTextStyle = useAnimatedStyle(() => {
    if (!keyboardVisible) return {};

    // Faster subtitle size response
    const targetFontSize = interpolate(
      keyboardVisible.value,
      [0, 0.7], // React earlier
      [16, 14],
      "clamp"
    );

    return {
      fontSize: withTiming(targetFontSize, ANIMATION_CONFIG),
      transform: [
        {
          scale: withTiming(
            interpolate(keyboardVisible.value, [0, 0.7], [1, 0.95], "clamp"),
            ANIMATION_CONFIG
          ),
        },
      ],
    };
  }, [keyboardVisible]);

  // If no keyboard tracking or animation is needed, use regular Views
  if (!keyboardVisible && !imageAnimatedStyle && !textAnimatedStyle) {
    return (
      <View className="w-full flex-1">
        {/* Top area with image (stays in place) */}
        <View className="flex-1 items-center justify-center">
          <Image
            source={imageSource}
            className="rounded-2xl overflow-hidden"
            style={{
              width: baseImageSize,
              height: baseImageSize,
            }}
            resizeMode="contain"
          />
        </View>

        {/* Text section at bottom */}
        <View className="w-full">
          <Text className="text-2xl md:text-3xl font-title font-bold text-foreground text-center">
            {title}
          </Text>
          <Text className="text-base md:text-lg font-paragraph text-foreground/80 text-center mt-1">
            {subtitle}
          </Text>
        </View>
      </View>
    );
  }

  // Use animated views when animation styles are provided
  return (
    <View className="w-full flex-1">
      {/* Top area with image (stays in place but shrinks) */}
      <View className="flex-1 items-center justify-center pt-6">
        <Animated.Image
          source={imageSource}
          className="rounded-2xl overflow-hidden"
          style={[
            {
              width: baseImageSize,
              height: baseImageSize,
            },
            imageStyle,
            imageAnimatedStyle,
          ]}
          resizeMode="contain"
        />
      </View>

      {/* Animated container for text that moves upward */}
      <Animated.View
        className="w-full mt-4"
        style={[textContainerStyle, textAnimatedStyle]}
      >
        {/* Title with dynamic size animation */}
        <Animated.Text
          style={[titleTextStyle]}
          className="text-foreground font-title font-bold text-center"
        >
          {title}
        </Animated.Text>

        {/* Subtitle with dynamic size animation */}
        <Animated.Text
          style={[subtitleTextStyle]}
          className="text-foreground/80 font-paragraph text-center mt-1"
        >
          {subtitle}
        </Animated.Text>
      </Animated.View>
    </View>
  );
}
