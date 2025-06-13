import React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { format } from "date-fns";
import SeasonalIllustration from "@/components/UI/SeasonalIllustration";
import { Season } from "@/types/weather";
import { StaggeredContent } from "@/components/UI/StaggeredContent";
import { TitleText, BodyText } from "@/components/UI/Text";

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
  // Get time of day for greeting
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Format today's date in a nice way
  const formattedDate = format(new Date(), "EEEE, MMMM d");

  return (
    <>
      {/* Header with Gradient - Thinner version */}
      <StaggeredContent index={0} baseDelay={50} staggerInterval={80}>
        <View className="rounded-lg overflow-hidden">
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
            <TitleText className="text-2xl font-bold text-primary-foreground">
              {justCompletedAllOverdueTasks
                ? "Congratulations!"
                : `${getTimeOfDay()}, ${userName || "Gardener"}`}
            </TitleText>
            <View className="flex-row items-center gap-2 mt-1">
              <Ionicons
                name={
                  justCompletedAllOverdueTasks ? "checkmark-circle" : "calendar"
                }
                size={16}
                color="#fffefa"
              />
              <BodyText className="text-sm text-primary-foreground">
                {formattedDate}
              </BodyText>
            </View>
          </LinearGradient>
        </View>
      </StaggeredContent>

      {/* Seasonal Illustration */}
      <StaggeredContent index={1} baseDelay={250} duration={600}>
        <SeasonalIllustration
          season={currentSeason}
          hasOverdueTasks={hasOverdueTasks}
          className="my-2"
        />
      </StaggeredContent>
    </>
  );
}
