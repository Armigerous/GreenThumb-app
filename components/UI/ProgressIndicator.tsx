import { View, Text, useWindowDimensions } from "react-native";
import { useMemo, useRef, useEffect } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { BodyText } from "./Text";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
  animate?: boolean;
  accentColor?: string;
  inactiveColor?: string;
}

export default function ProgressIndicator({
  currentStep,
  totalSteps,
  stepLabels,
  animate = true,
  accentColor = "primary",
  inactiveColor = "cream-50",
}: ProgressIndicatorProps) {
  const { width } = useWindowDimensions();

  const progressValue = useSharedValue(0);
  const previousStepRef = useRef<number | null>(null);

  const progressPercentage = useMemo(() => {
    if (totalSteps <= 1) {
      return 0;
    }
    return (currentStep - 1) / (totalSteps - 1);
  }, [currentStep, totalSteps]);

  if (stepLabels.length !== totalSteps) {
    console.warn(
      `ProgressIndicator: Expected ${totalSteps} step labels but got ${stepLabels.length}`
    );
  }

  useEffect(() => {
    const previousStep = previousStepRef.current;
    const target = Math.max(0, Math.min(progressPercentage, 1));

    if (!animate) {
      progressValue.value = target;
    } else {
      const isBackwardSkip =
        previousStep !== null && currentStep < previousStep;

      progressValue.value = withTiming(target, {
        duration: isBackwardSkip ? 220 : 360,
        easing: isBackwardSkip
          ? Easing.out(Easing.quad)
          : Easing.out(Easing.cubic),
      });
    }

    previousStepRef.current = currentStep;
  }, [animate, currentStep, progressPercentage, progressValue]);

  const progressStyle = useAnimatedStyle(() => {
    const value = Math.max(0, Math.min(1, progressValue.value));
    return {
      width: `${value * 100}%`,
    };
  });

  const CIRCLE_SIZE = 12;
  const CIRCLE_RADIUS = CIRCLE_SIZE / 2;

  const availableWidth = width - 16;
  const optimalLabelWidth = useMemo(() => {
    if (totalSteps <= 2) return Math.min(120, availableWidth / 2);
    if (totalSteps === 3) return Math.min(100, availableWidth / 3);
    return Math.min(90, availableWidth / totalSteps);
  }, [totalSteps, availableWidth]);

  return (
    <View className="mb-6 py-4">
      <View className="mb-3 relative">
        <View
          className={`h-1.5 w-full bg-${inactiveColor} rounded-full border border-${accentColor}`}
        />

        <Animated.View
          className={`h-1.5 bg-${accentColor} rounded-full absolute top-0 left-0`}
          style={progressStyle}
        />

        <View
          className="flex-row absolute top-0 w-full"
          style={{ transform: [{ translateY: -3 }] }}
        >
          {Array.from({ length: totalSteps }).map((_, index) => {
            const isActive = index + 1 <= currentStep;
            const isFirst = index === 0;
            const isLast = index === totalSteps - 1;

            const position = isFirst
              ? 0
              : isLast
              ? 100
              : (index / (totalSteps - 1)) * 100;

            return (
              <View
                key={index}
                className={`absolute h-3 w-3 rounded-full border border-${accentColor} ${
                  isActive ? `bg-${accentColor}` : `bg-${inactiveColor}`
                }`}
                style={{
                  left: `${position}%`,
                  transform: [{ translateX: -CIRCLE_RADIUS }],
                }}
              />
            );
          })}
        </View>
      </View>

      <View className="relative my-1">
        {stepLabels.map((label, index) => {
          const isActive = index + 1 <= currentStep;
          const isFirst = index === 0;
          const isLast = index === totalSteps - 1;

          const position = isFirst
            ? 0
            : isLast
            ? 100
            : (index / (totalSteps - 1)) * 100;

          return (
            <View
              key={index}
              className="absolute"
              style={{
                left: `${position}%`,
                width: optimalLabelWidth,
                transform: [
                  {
                    translateX: isFirst
                      ? 0
                      : isLast
                      ? -optimalLabelWidth
                      : -optimalLabelWidth / 2,
                  },
                ],
              }}
            >
              <BodyText
                className={`text-xs ${
                  isActive ? `text-${accentColor}` : `text-${inactiveColor}`
                }`}
                style={{
                  textAlign: isFirst ? "left" : isLast ? "right" : "center",
                }}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {label}
              </BodyText>
            </View>
          );
        })}
      </View>
    </View>
  );
}