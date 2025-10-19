import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

// Type for valid routes in the app
type AppRoute = "/(tabs)/calendar" | "/(tabs)/gardens" | "/(tabs)/gardens/[id]";

interface TaskCompletionCelebrationProps {
  visible: boolean;
  onClose?: () => void;
  type?: "single" | "all" | "overdueComplete";
  actionRoute?: AppRoute;
  containerStyle?: object;
}

// Type for valid Ionicons
type CelebrationIcon =
  | "trophy"
  | "checkmark-circle"
  | "checkmark-circle-outline";

// TODO: revive confetti using Reanimated once performance budget allows
const ConfettiParticle = () => null;

/**
 * A reusable celebration component that shows when tasks are completed.
 * Animations lean into our brand guidelines: quick lift, soft bounce, and a gentle fade.
 */
export function TaskCompletionCelebration({
  visible,
  onClose,
  type = "single",
  actionRoute,
  containerStyle = {},
}: TaskCompletionCelebrationProps) {
  const cardOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.86);
  const backdropOpacity = useSharedValue(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width: screenWidth } = Dimensions.get("window");

  const confettiPalette = useMemo(
    () => [
      "#5E994B", // brand-600
      "#77B860", // brand-500
      "#8EC57B", // brand-400
      "#A5D196", // brand-300
      "#FFD900", // accent splash
      "#FFE264",
    ],
    []
  );

  const confettiParticles = useMemo(
    () =>
      Array.from({ length: 50 }).map((_, index) => ({
        id: index,
        size: Math.random() * 10 + 5,
        color: confettiPalette[Math.floor(Math.random() * confettiPalette.length)],
        position: {
          x: Math.random() * screenWidth - 40,
          y: -20,
        },
        delay: Math.random() * 500,
        duration: Math.random() * 2000 + 2000,
      })),
    [confettiPalette, screenWidth]
  );

  useEffect(() => {
    if (visible) {
      setShowConfetti(false);

      backdropOpacity.value = withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.cubic),
      });
      cardOpacity.value = withTiming(1, {
        duration: 220,
        easing: Easing.out(Easing.cubic),
      });
      cardScale.value = 0.88;
      cardScale.value = withSpring(
        1,
        {
          stiffness: 340,
          damping: 20,
          mass: 0.7,
        },
        (finished) => {
          if (finished && (type === "all" || type === "overdueComplete")) {
            runOnJS(setShowConfetti)(true);
          }
        }
      );
    } else {
      setShowConfetti(false);
      backdropOpacity.value = withTiming(0, {
        duration: 180,
        easing: Easing.in(Easing.cubic),
      });
      cardOpacity.value = withTiming(0, {
        duration: 160,
        easing: Easing.in(Easing.cubic),
      });
      cardScale.value = withTiming(0.88, {
        duration: 160,
        easing: Easing.inOut(Easing.cubic),
      });
    }
  }, [visible, type, cardOpacity, cardScale, backdropOpacity]);

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  const handleActionPress = () => {
    onClose?.();
    if (actionRoute) {
      router.push(actionRoute as any);
    }
  };

  if (!visible) return null;

  const content = (() => {
    switch (type) {
      case "overdueComplete":
        return {
          icon: "trophy" as CelebrationIcon,
          iconColor: "#5E994B",
          title: "Caught up!",
          message:
            "Your plants are so grateful! You've completed all your overdue care tasks.",
          actionText: "View Calendar",
          actionRoute: "/(tabs)/calendar" as AppRoute,
          showConfetti: true,
        };
      case "all":
        return {
          icon: "trophy" as CelebrationIcon,
          iconColor: "#5E994B",
          title: "All done!",
          message: "Your garden is thriving thanks to your dedicated care!",
          actionText: "View More",
          actionRoute: actionRoute || ("/(tabs)/calendar" as AppRoute),
          showConfetti: true,
        };
      default:
        return {
          icon: "checkmark-circle" as CelebrationIcon,
          iconColor: "#5E994B",
          title: "Nice work!",
          message: "Your plants appreciate the love and attention!",
          actionText: "Continue",
          actionRoute,
          showConfetti: false,
        };
    }
  })();

  return (
    <Animated.View
      className="absolute top-0 left-0 right-0 bottom-0 items-center justify-center z-50"
      style={[overlayAnimatedStyle, containerStyle]}
    >
      {showConfetti &&
        content.showConfetti &&
        confettiParticles.map((particle) => (
          <ConfettiParticle key={particle.id} {...particle} />
        ))}

      <Animated.View
        className="bg-white rounded-2xl p-6 shadow-xl w-[80%] items-center"
        style={[
          cardAnimatedStyle,
          {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
            elevation: 8,
          },
        ]}
      >
        <View className="w-24 h-24 rounded-full bg-brand-100 items-center justify-center mb-6 shadow-sm">
          <Ionicons name={content.icon as any} size={56} color={content.iconColor} />
        </View>

        <Text className="text-2xl font-title font-bold text-brand-700 text-center mb-2">
          {content.title}
        </Text>

        <Text className="text-base font-paragraph text-brand-600 text-center mb-6">
          {content.message}
        </Text>

        {content.actionRoute && (
          <TouchableOpacity
            className="bg-brand-100 py-3 px-8 rounded-lg border border-brand-200 shadow-sm"
            onPress={handleActionPress}
          >
            <Text className="text-brand-600 font-paragraph font-medium">
              {content.actionText}
            </Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </Animated.View>
  );
}
