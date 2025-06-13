import React, { useEffect, useRef } from "react";
import { Animated, Easing, ViewStyle } from "react-native";

interface StaggeredContentProps {
  children: React.ReactNode;
  index?: number;
  staggerInterval?: number;
  baseDelay?: number;
  duration?: number;
  enabled?: boolean;
  initialY?: number;
  style?: ViewStyle;
  className?: string;
}

/**
 * A component for creating smooth, staggered animations for content sections.
 * This component handles the timing and coordination of animations to ensure
 * a fluid, professional feeling when loading multiple elements.
 *
 * @param children - The content to be animated
 * @param index - The position of this element in a sequence (0-based)
 * @param staggerInterval - The time between staggered animations (default: 40ms)
 * @param baseDelay - Initial delay before any animations start (default: 100ms)
 * @param duration - Animation duration (default: 500ms)
 * @param enabled - Whether animations are enabled (default: true)
 * @param initialY - Initial Y offset for the slide up animation (default: 15)
 * @param style - Additional styles to apply
 * @param className - Tailwind classes to apply
 */
export function StaggeredContent({
  children,
  index = 0,
  staggerInterval = 40,
  baseDelay = 100,
  duration = 500,
  enabled = true,
  initialY = 15,
  style = {},
  className = "",
}: StaggeredContentProps) {
  const translateY = useRef(new Animated.Value(initialY)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (enabled) {
      // Calculate staggered delay
      const delay = baseDelay + index * staggerInterval;

      // Reset values when component remounts or enabled changes
      translateY.setValue(initialY);
      opacity.setValue(0);

      // Use a spring animation for translateY for more natural movement
      const animations = [
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          tension: 40,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration,
          delay,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ];

      // Start animations in parallel
      Animated.parallel(animations).start();
    } else {
      // If animations are disabled, immediately show content
      translateY.setValue(0);
      opacity.setValue(1);
    }
  }, [enabled, initialY, baseDelay, staggerInterval, index, duration]);

  return (
    <Animated.View
      className={className}
      style={[
        {
          opacity,
          transform: [{ translateY }],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}
