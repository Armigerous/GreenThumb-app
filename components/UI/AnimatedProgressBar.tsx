import { useEffect, useRef } from "react";
import { Animated, View, Easing } from "react-native";

interface AnimatedProgressBarProps {
  percentage: number;
  color?: string;
  height?: number;
  backgroundColor?: string;
  duration?: number;
}

/**
 * AnimatedProgressBar component that smoothly animates progress changes
 * Uses React Native's Animated API to create a fluid transition between values
 * The animation starts from 0 and progresses to the target percentage
 *
 * @param percentage - The target percentage to animate to (0-100)
 * @param color - The color of the progress bar (defaults to brand-600)
 * @param height - The height of the progress bar in pixels (defaults to 8)
 * @param backgroundColor - The background color of the progress bar container (defaults to cream-200)
 * @param duration - The duration of the animation in milliseconds (defaults to 500)
 */
export default function AnimatedProgressBar({
  percentage,
  color = "#5E994B", // brand-600
  height = 8,
  backgroundColor = "#E5E3DF", // cream-200
  duration = 500,
}: AnimatedProgressBarProps) {
  // Create an animated value for the progress width
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Track previous percentage to detect large changes
  const prevPercentageRef = useRef<number | null>(null);

  // Animate to the new percentage value whenever it changes
  useEffect(() => {
    // Calculate if this is a significant decrease that would benefit from a reset
    const prevPercentage = prevPercentageRef.current;
    const isSignificantDecrease =
      prevPercentage !== null &&
      percentage < prevPercentage * 0.3 &&
      prevPercentage > 50;

    // If significant decrease, reset with a brief delay for smoother transition
    if (isSignificantDecrease) {
      // Configure next animation before resetting to prevent visual glitches
      Animated.timing(progressAnim, {
        toValue: percentage / 100,
        duration: duration * 0.8, // Slightly faster for reset animations
        useNativeDriver: false,
        // Easing.out provides smoother animation for decreasing values
        easing: Easing.out(Easing.ease),
      }).start();

      // Quick reset with minimal visual impact
      progressAnim.setValue(Math.max(0.01, percentage / 200));
    } else {
      // Normal animation for incremental changes or increases
      Animated.timing(progressAnim, {
        toValue: percentage / 100,
        duration,
        useNativeDriver: false,
        easing: Easing.inOut(Easing.ease),
      }).start();
    }

    // Update the previous percentage reference
    prevPercentageRef.current = percentage;
  }, [percentage, duration, progressAnim]);

  return (
    <View
      style={{
        height,
        backgroundColor,
        borderRadius: height / 2,
        overflow: "hidden",
      }}
    >
      <Animated.View
        style={{
          height: "100%",
          backgroundColor: color,
          borderRadius: height / 2,
          width: progressAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ["0%", "100%"],
          }),
        }}
      />
    </View>
  );
}
