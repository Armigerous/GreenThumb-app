import React, { useEffect, useRef, useCallback, useState } from "react";
import { Animated, Easing, ViewStyle } from "react-native";

type AnimatedTransitionProps = {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  initialY?: number;
  style?: ViewStyle;
  className?: string;
  enabled?: boolean;
};

/**
 * A reusable component that provides smooth transitions with configurable
 * fade-in and slide-up animations.
 */
const AnimatedTransition = ({
  children,
  delay = 150,
  duration = 400,
  initialY = 10,
  style = {},
  className = "",
  enabled = true,
}: AnimatedTransitionProps) => {
  // Initialize animated values once using useState to avoid re-creation
  const [translateY] = useState(() => new Animated.Value(0));
  const [opacity] = useState(() => new Animated.Value(1));
  const hasAnimated = useRef(false);
  const isInitialized = useRef(false);

  const startAnimation = useCallback(() => {
    if (!enabled) {
      return;
    }

    // Only animate if we haven't already animated
    if (!hasAnimated.current) {
      hasAnimated.current = true;

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration,
          delay,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration,
          delay,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [enabled, translateY, opacity, duration, delay]);

  useEffect(() => {
    // Initialize values only once
    if (!isInitialized.current) {
      isInitialized.current = true;

      if (enabled) {
        translateY.setValue(initialY);
        opacity.setValue(0);
      } else {
        translateY.setValue(0);
        opacity.setValue(1);
      }
    }

    // Reset animation state when enabled changes
    hasAnimated.current = false;

    if (enabled) {
      // Set initial values for animation
      translateY.setValue(initialY);
      opacity.setValue(0);

      // Start animation on next tick
      const timeoutId = setTimeout(() => {
        startAnimation();
      }, 0);

      return () => clearTimeout(timeoutId);
    } else {
      // Set final values immediately for disabled state
      translateY.setValue(0);
      opacity.setValue(1);
    }
  }, [enabled, initialY, translateY, opacity, startAnimation]);

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
};

export default AnimatedTransition;
