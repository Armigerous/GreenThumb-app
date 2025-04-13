import { View, Text, Animated, useWindowDimensions } from "react-native";
import { useMemo, useRef, useEffect } from "react";

/**
 * ProgressIndicator component for multi-step flows
 *
 * Displays a visual indicator of progress through a multi-step process.
 * Shows progress bar, step markers, and textual labels for each step.
 * Includes animation effects and proper alignment between bars and labels.
 *
 * @param currentStep - The current active step (1-based index)
 * @param totalSteps - Total number of steps in the flow
 * @param stepLabels - Array of labels for each step
 * @param animate - Whether to animate progress transitions (defaults to true)
 * @param accentColor - Optional custom accent color for active elements
 * @param inactiveColor - Optional custom color for inactive elements
 */
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
  // Get window dimensions to calculate optimal label width
  const { width } = useWindowDimensions();

  // Animation value for progress bar width
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Calculate progress percentage (0 to 1)
  const progressPercentage = useMemo(() => {
    return (currentStep - 1) / (totalSteps - 1);
  }, [currentStep, totalSteps]);

  // Validate that we have the correct number of labels
  if (stepLabels.length !== totalSteps) {
    console.warn(
      `ProgressIndicator: Expected ${totalSteps} step labels but got ${stepLabels.length}`
    );
  }

  // Handle animation when currentStep changes
  useEffect(() => {
    if (animate) {
      Animated.timing(progressAnim, {
        toValue: progressPercentage,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      progressAnim.setValue(progressPercentage);
    }
  }, [currentStep, progressPercentage, animate, progressAnim]);

  // Constants for precise calculations
  const CIRCLE_SIZE = 12; // 3w x 3h = 12px diameter
  const CIRCLE_RADIUS = CIRCLE_SIZE / 2;

  // Calculate optimal label width based on total steps and screen width
  // Account for padding (8px on each side) and some spacing between labels
  const availableWidth = width - 16; // 8px padding on each side
  const optimalLabelWidth = useMemo(() => {
    // For 2 steps, we want wider labels. For 3+ steps, we need narrower labels
    if (totalSteps <= 2) return Math.min(120, availableWidth / 2);
    if (totalSteps === 3) return Math.min(100, availableWidth / 3);
    return Math.min(90, availableWidth / totalSteps);
  }, [totalSteps, availableWidth]);

  return (
    <View className="mb-6 py-4">
      {/* Progress container - contains both the bar and indicators */}
      <View className="mb-3 relative">
        {/* Base progress bar (inactive) */}
        <View
          className={`h-1.5 w-full bg-${inactiveColor} rounded-full border border-${accentColor}`}
        />

        {/* Animated progress overlay */}
        <Animated.View
          className={`h-1.5 bg-${accentColor} rounded-full absolute top-0 left-0`}
          style={{
            width: progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ["0%", "100%"],
            }),
          }}
        />

        {/* Step indicators aligned with the bar */}
        <View
          className="flex-row absolute top-0 w-full"
          style={{ transform: [{ translateY: -3 }] }}
        >
          {Array.from({ length: totalSteps }).map((_, index) => {
            const isActive = index + 1 <= currentStep;
            const isFirst = index === 0;
            const isLast = index === totalSteps - 1;

            // Calculate position percentage for exact alignment
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

      {/* Step labels with precise alignment */}
      <View className="relative my-1">
        {stepLabels.map((label, index) => {
          const isActive = index + 1 <= currentStep;
          const isFirst = index === 0;
          const isLast = index === totalSteps - 1;

          // Calculate position percentage for exact alignment with indicators
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
              <Text
                className={`text-xs ${
                  isActive
                    ? `text-${accentColor} font-medium`
                    : `text-cream-500`
                }`}
                style={{
                  textAlign: isFirst ? "left" : isLast ? "right" : "center",
                }}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
