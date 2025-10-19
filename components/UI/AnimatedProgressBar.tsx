import { useEffect, useRef } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface AnimatedProgressBarProps {
  percentage: number;
  color?: string;
  height?: number;
  backgroundColor?: string;
  duration?: number;
}

export default function AnimatedProgressBar({
  percentage,
  color = "#5E994B",
  height = 8,
  backgroundColor = "#E5E3DF",
  duration = 500,
}: AnimatedProgressBarProps) {
  const progress = useSharedValue(0);
  const prevPercentageRef = useRef<number | null>(null);

  useEffect(() => {
    const clampedTarget = Math.max(0, Math.min(percentage / 100, 1));
    const previousPercentage = prevPercentageRef.current;
    const isSignificantDecrease =
      previousPercentage !== null &&
      percentage < previousPercentage * 0.3 &&
      previousPercentage > 50;

    if (isSignificantDecrease) {
      progress.value = Math.max(0.05, clampedTarget / 2);
      progress.value = withTiming(clampedTarget, {
        duration: Math.max(160, duration * 0.8),
        easing: Easing.out(Easing.ease),
      });
    } else {
      progress.value = withTiming(clampedTarget, {
        duration,
        easing: Easing.inOut(Easing.ease),
      });
    }

    prevPercentageRef.current = percentage;
  }, [percentage, duration, progress]);

  const progressStyle = useAnimatedStyle(() => {
    const value = Math.max(0, Math.min(1, progress.value));
    return {
      width: `${value * 100}%`,
    };
  });

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
        style={[
          {
            height: "100%",
            backgroundColor: color,
            borderRadius: height / 2,
          },
          progressStyle,
        ]}
      />
    </View>
  );
}