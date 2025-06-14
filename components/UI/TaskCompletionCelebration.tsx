import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

// Type for valid routes in the app
type AppRoute = "/(home)/calendar" | "/(home)/gardens" | "/(home)/gardens/[id]";

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

// Confetti particle component
const ConfettiParticle = ({
  size = 10,
  color = "#77B860",
  duration = 3000,
  delay = 0,
  position = { x: 0, y: 0 },
}) => {
  // Random ending position for the particle
  const finalX = useRef(Math.random() * 300 - 150).current;
  const finalY = useRef(Math.random() * 200 + 200).current;
  const rotations = useRef(Math.random() * 8 + 2).current;

  // Animation values
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // First show the particle with a scale animation
    const scaleAnim = Animated.timing(scale, {
      toValue: 1,
      duration: 200,
      delay,
      useNativeDriver: true,
    });

    // Create the falling animation
    const animations = Animated.parallel([
      Animated.timing(translateX, {
        toValue: finalX,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: finalY,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration,
        delay: delay + duration * 0.7, // Start fading after 70% of the animation
        useNativeDriver: true,
      }),
      Animated.timing(rotate, {
        toValue: rotations,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]);

    // Start the animations
    scaleAnim.start();
    animations.start();

    // Clean up animations on unmount
    return () => {
      scaleAnim.stop();
      animations.stop();
    };
  }, [
    delay,
    duration,
    finalX,
    finalY,
    opacity,
    rotate,
    rotations,
    scale,
    translateX,
    translateY,
  ]);

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: position.y,
        left: position.x,
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: size / 5,
        opacity,
        transform: [
          { translateX },
          { translateY },
          {
            rotate: rotate.interpolate({
              inputRange: [0, 1],
              outputRange: ["0deg", "360deg"],
            }),
          },
          { scale },
        ],
      }}
    />
  );
};

/**
 * A reusable celebration component that shows when tasks are completed
 * Can be used in various contexts with different celebration types
 */
export function TaskCompletionCelebration({
  visible,
  onClose,
  type = "single",
  actionRoute,
  containerStyle = {},
}: TaskCompletionCelebrationProps) {
  // Animation values
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const backgroundOpacityAnim = useRef(new Animated.Value(0)).current;

  // Confetti state
  const [showConfetti, setShowConfetti] = useState(false);
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

  // Generate confetti particles - using brand colors only
  const confettiColors = [
    "#5E994B", // brand-600 (primary)
    "#77B860", // brand-500
    "#8EC57B", // brand-400
    "#A5D196", // brand-300
    "#ffd900", // accent-200 (yellow)
    "#ffe264", // accent-100
  ];
  const confettiCount = 50;
  const confettiParticles = Array.from({ length: confettiCount }).map(
    (_, index) => ({
      id: index,
      size: Math.random() * 10 + 5,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      position: {
        x: Math.random() * screenWidth - 40,
        y: -20,
      },
      delay: Math.random() * 500,
      duration: Math.random() * 2000 + 2000,
    })
  );

  // Trigger animation when visible state changes
  useEffect(() => {
    if (visible) {
      // Reset confetti
      setShowConfetti(false);

      // Animate in quickly with a scale effect
      Animated.parallel([
        Animated.timing(backgroundOpacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 7,
          tension: 50,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Start confetti animation when the main animation completes
        if (type === "all" || type === "overdueComplete") {
          setShowConfetti(true);
        }
      });
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(backgroundOpacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.3,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, opacityAnim, scaleAnim, backgroundOpacityAnim, type]);

  // Handle action button press
  const handleActionPress = () => {
    if (onClose) {
      onClose();
    }
    if (actionRoute) {
      router.push(actionRoute as any);
    }
  };

  if (!visible) return null;

  // Determine content based on celebration type
  const getCelebrationContent = () => {
    switch (type) {
      case "overdueComplete":
        return {
          icon: "trophy" as CelebrationIcon,
          iconColor: "#5E994B", // brand-600
          title: "🌱 Caught up!",
          message:
            "Your plants are so grateful! You've completed all your overdue care tasks.",
          actionText: "View Calendar",
          actionRoute: "/(home)/calendar" as AppRoute,
          showConfetti: true,
        };
      case "all":
        return {
          icon: "trophy" as CelebrationIcon,
          iconColor: "#5E994B", // brand-600
          title: "🌿 All done!",
          message: "Your garden is thriving thanks to your dedicated care!",
          actionText: "View More",
          actionRoute: actionRoute || ("/(home)/calendar" as AppRoute),
          showConfetti: true,
        };
      case "single":
      default:
        return {
          icon: "checkmark-circle" as CelebrationIcon,
          iconColor: "#5E994B", // brand-600
          title: "🌱 Nice work!",
          message: "Your plants appreciate the love and attention!",
          actionText: "Continue",
          actionRoute: actionRoute,
          showConfetti: false,
        };
    }
  };

  const content = getCelebrationContent();

  return (
    <Animated.View
      className="absolute top-0 left-0 right-0 bottom-0 items-center justify-center z-50"
      style={{
        opacity: backgroundOpacityAnim,
        backgroundColor: "rgba(255, 255, 255, 0.92)",
        ...containerStyle,
      }}
    >
      {/* Custom confetti effect */}
      {showConfetti &&
        content.showConfetti &&
        confettiParticles.map((particle) => (
          <ConfettiParticle
            key={particle.id}
            size={particle.size}
            color={particle.color}
            delay={particle.delay}
            duration={particle.duration}
            position={particle.position}
          />
        ))}

      <Animated.View
        className="bg-white rounded-2xl p-6 shadow-xl w-[80%] items-center"
        style={{
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <View className="w-24 h-24 rounded-full bg-brand-100 items-center justify-center mb-6 shadow-sm">
          <Ionicons
            name={content.icon as any}
            size={56}
            color={content.iconColor}
          />
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
