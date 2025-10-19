import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, {
  Easing,
  Extrapolation,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";

interface PlantGrowthLoaderProps {
  message?: string;
  color?: string;
  backgroundColor?: string;
}

interface CompactPlantLoaderProps {
  size?: number;
  color?: string;
}

const STAGE_TIMINGS = {
  seed: [0, 0.16, 0.24, 0.34] as const,
  sprout: [0.24, 0.34, 0.52, 0.62] as const,
  plant: [0.52, 0.62, 0.78, 0.88] as const,
  flower: [0.72, 0.82, 0.94, 0.98] as const,
};

const STAGE_OUTPUT = [0, 1, 1, 0] as const;

function useGrowthTimeline(duration: number) {
  const timeline = useSharedValue(0);

  useEffect(() => {
    timeline.value = 0;
    timeline.value = withRepeat(
      withTiming(1, {
        duration,
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      false
    );

    return () => {
      cancelAnimation(timeline);
    };
  }, [duration, timeline]);

  return timeline;
}

function useStageAnimatedStyle(
  timeline: SharedValue<number>,
  timings: readonly [number, number, number, number],
  options: { translateY?: number; sway?: { amplitude?: number } } = {}
) {
  const { translateY, sway } = options;

  return useAnimatedStyle(() => {
    const progress = interpolate(
      timeline.value,
      timings,
      STAGE_OUTPUT,
      Extrapolation.CLAMP
    );

    const transforms: { [key: string]: string | number }[] = [
      { scale: Math.max(progress, 0.0001) },
    ];

    if (typeof translateY === "number") {
      transforms.push({ translateY });
    }

    if (sway) {
      const [start, enter, peak, exit] = timings;
      const midpoint = (enter + peak) / 2;
      const tail = Math.min(exit, peak + (exit - peak) / 2);
      const amplitude = sway.amplitude ?? 4;
      const angle = interpolate(
        timeline.value,
        [enter, midpoint, tail],
        [-amplitude, amplitude, -amplitude],
        Extrapolation.CLAMP
      );
      transforms.push({ rotate: `${angle}deg` });
    }

    return {
      opacity: progress,
      transform: transforms as any,
    };
  });
}

export function PlantGrowthLoader({
  message = "Growing...",
  color = "#047857",
  backgroundColor = "bg-transparent",
}: PlantGrowthLoaderProps) {
  const size = 80;
  const iconSize = Math.round(size * 0.58);
  const timeline = useGrowthTimeline(4200);

  const seedStyle = useStageAnimatedStyle(timeline, STAGE_TIMINGS.seed, {
    translateY: size * 0.12,
  });
  const sproutStyle = useStageAnimatedStyle(timeline, STAGE_TIMINGS.sprout, {
    translateY: size * 0.06,
  });
  const plantStyle = useStageAnimatedStyle(timeline, STAGE_TIMINGS.plant);
  const flowerStyle = useStageAnimatedStyle(timeline, STAGE_TIMINGS.flower, {
    sway: { amplitude: 4.5 },
  });

  return (
    <View className={`items-center justify-center ${backgroundColor}`}>
      <View style={{ width: size, height: size }}>
        <Animated.View
          style={[
            {
              position: "absolute",
            },
            seedStyle,
          ]}
        >
          <MaterialCommunityIcons
            name="seed-outline"
            size={iconSize}
            color={color}
          />
        </Animated.View>

        <Animated.View
          style={[
            {
              position: "absolute",
            },
            sproutStyle,
          ]}
        >
          <MaterialCommunityIcons
            name="sprout-outline"
            size={iconSize + 4}
            color={color}
          />
        </Animated.View>

        <Animated.View
          style={[
            {
              position: "absolute",
            },
            plantStyle,
          ]}
        >
          <MaterialCommunityIcons
            name="leaf"
            size={iconSize + 8}
            color={color}
          />
        </Animated.View>

        <Animated.View
          style={[
            {
              position: "absolute",
            },
            flowerStyle,
          ]}
        >
          <MaterialCommunityIcons
            name="flower-tulip"
            size={iconSize + 12}
            color={color}
          />
        </Animated.View>
      </View>

      <Text className="mt-3 text-sm font-paragraph text-cream-700">
        {message}
      </Text>
    </View>
  );
}

export function CompactPlantLoader({
  size = 24,
  color = "#047857",
}: CompactPlantLoaderProps) {
  const timeline = useGrowthTimeline(2800);
  const iconSize = Math.max(12, Math.round(size * 0.8));

  const seedStyle = useStageAnimatedStyle(timeline, STAGE_TIMINGS.seed, {
    translateY: size * 0.08,
  });
  const sproutStyle = useStageAnimatedStyle(timeline, STAGE_TIMINGS.sprout, {
    translateY: size * 0.04,
  });
  const plantStyle = useStageAnimatedStyle(timeline, STAGE_TIMINGS.plant);
  const flowerStyle = useStageAnimatedStyle(timeline, STAGE_TIMINGS.flower, {
    sway: { amplitude: 3.2 },
  });

  return (
    <View style={{ width: size, height: size }}>
      <Animated.View
        style={[
          {
            position: "absolute",
          },
          seedStyle,
        ]}
      >
        <MaterialCommunityIcons
          name="seed-outline"
          size={iconSize}
          color={color}
        />
      </Animated.View>

      <Animated.View
        style={[
          {
            position: "absolute",
          },
          sproutStyle,
        ]}
      >
        <MaterialCommunityIcons
          name="sprout-outline"
          size={iconSize + 2}
          color={color}
        />
      </Animated.View>

      <Animated.View
        style={[
          {
            position: "absolute",
          },
          plantStyle,
        ]}
      >
        <MaterialCommunityIcons
          name="leaf"
          size={iconSize + 4}
          color={color}
        />
      </Animated.View>

      <Animated.View
        style={[
          {
            position: "absolute",
          },
          flowerStyle,
        ]}
      >
        <MaterialCommunityIcons
          name="flower-tulip"
          size={iconSize + 6}
          color={color}
        />
      </Animated.View>
    </View>
  );
}