import React, { useEffect, useRef } from "react";
import { Animated, View, Text, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { format } from "date-fns";
import { AnimatedSection } from "./AnimatedSection";
import SeasonalIllustration from "@/components/UI/SeasonalIllustration";
import { Season } from "@/types/weather";

interface HomeHeaderProps {
  userName: string | null;
  justCompletedAllOverdueTasks: boolean;
  hasOverdueTasks: boolean;
  currentSeason: Season;
}

export function HomeHeader({
  userName,
  justCompletedAllOverdueTasks,
  hasOverdueTasks,
  currentSeason,
}: HomeHeaderProps) {
  // Animation references
  const headerScaleAnim = useRef(new Animated.Value(0.95)).current;
  const headerOpacityAnim = useRef(new Animated.Value(0)).current;

  // Get time of day for greeting
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Format today's date in a nice way
  const formattedDate = format(new Date(), "EEEE, MMMM d");

  // Trigger header animation when component mounts
  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerScaleAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(headerOpacityAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [headerScaleAnim, headerOpacityAnim]);

  return (
    <>
      {/* Header with Gradient - Thinner version */}
      <Animated.View
        className="rounded-lg overflow-hidden"
        style={{
          opacity: headerOpacityAnim,
          transform: [{ scale: headerScaleAnim }],
        }}
      >
        <LinearGradient
          colors={
            justCompletedAllOverdueTasks
              ? ["#16a34a", "#77B860"] // Green celebration gradient
              : hasOverdueTasks
              ? ["#ef4444", "#f87171"] // Red gradient for overdue tasks
              : ["#3F6933", "#77B860"] // Normal green gradient
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ padding: 16 }}
        >
          <Text className="text-2xl font-bold text-primary-foreground">
            {justCompletedAllOverdueTasks
              ? "Congratulations!"
              : `${getTimeOfDay()}, ${userName || "Gardener"}`}
          </Text>
          <View className="flex-row items-center gap-2 mt-1">
            <Ionicons
              name={
                justCompletedAllOverdueTasks ? "checkmark-circle" : "calendar"
              }
              size={16}
              color="#fffefa"
            />
            <Text className="text-sm text-primary-foreground">
              {formattedDate}
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Seasonal Illustration */}
      <AnimatedSection delay={150}>
        <SeasonalIllustration
          season={currentSeason}
          hasOverdueTasks={hasOverdueTasks}
          className="my-2"
        />
      </AnimatedSection>
    </>
  );
}
