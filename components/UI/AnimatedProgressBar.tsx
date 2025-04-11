import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

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

  // Animate to the new percentage value whenever it changes
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: percentage / 100,
      duration,
      useNativeDriver: false,
    }).start();
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
