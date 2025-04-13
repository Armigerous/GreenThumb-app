import React, { useEffect, useRef } from "react";
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
  const translateY = useRef(new Animated.Value(initialY)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (enabled) {
      // Reset values when component remounts or enabled changes
      translateY.setValue(initialY);
      opacity.setValue(0);

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
    } else {
      // If animations are disabled, immediately show content
      translateY.setValue(0);
      opacity.setValue(1);
    }
  }, [enabled, initialY, delay, duration]);

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
