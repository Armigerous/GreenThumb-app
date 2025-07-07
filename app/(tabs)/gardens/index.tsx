import GardenCard from "@/components/Gardens/GardenCard";
import { useSupabaseAuth } from "@/lib/hooks/useSupabaseAuth";
import { useGardenDashboard } from "@/lib/queries";
import { GardenDashboard } from "@/types/garden";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { PageContainer } from "@/components/UI/PageContainer";
import AnimatedTransition from "@/components/UI/AnimatedTransition";
import { LoadingSpinner } from "@/components/UI/LoadingSpinner";

import { useCallback, useEffect } from "react";
import { BodyText, TitleText } from "@/components/Gardens";

export default function GardensScreen() {
  const { user } = useUser();
  const router = useRouter();
  useSupabaseAuth();
  const {
    data: gardens,
    isLoading,
    error,
    refetch,
  } = useGardenDashboard(user?.id);

  // Silently refresh data when component mounts or loading state changes
  useEffect(() => {
    if (!isLoading) {
      refetch();
    }
  }, [refetch, isLoading]);

  // Log error details if present
  if (error) {
    console.error("Gardens fetch error:", error);
  }

  /**
   * Calculate overall garden statistics
   * @param gardens Array of user's gardens
   * @returns Object with garden and plant statistics
   */
  const calculateOverallStats = (gardens: GardenDashboard[] | undefined) => {
    if (!gardens || gardens.length === 0) return null;

    let totalPlantsCount = 0;
    let gardensWithPlants = 0;
    let totalOverdueTasks = 0;

    gardens.forEach((garden) => {
      totalPlantsCount += garden.total_plants || 0;
      
      if (garden.total_plants && garden.total_plants > 0) {
        gardensWithPlants++;
      }
      
      totalOverdueTasks += garden.plants_with_overdue_tasks || 0;
    });

    return {
      totalPlantsCount,
      gardenCount: gardens.length,
      gardensWithPlants,
      plantsNeedingCare: totalOverdueTasks,
    };
  };

  const overallStats = calculateOverallStats(gardens);

  // Show loading spinner only for initial data fetch, not during navigation
  if (isLoading) {
    return (
      <PageContainer scroll={false} animate={false}>
        <LoadingSpinner message="Loading gardens..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer scroll={true} padded={false} animate={true}>
      {/* Header */}
      <AnimatedTransition delay={150} initialY={10}>
        <View className="flex-row justify-between items-center mb-6 px-4 pt-4">
          <TitleText className="text-3xl">My Gardens</TitleText>
          <TouchableOpacity
            className="bg-primary rounded-lg px-4 py-2 flex-row items-center"
            onPress={() => router.push("/(tabs)/gardens/new")}
          >
            <BodyText className="text-primary-foreground mr-2">
              New Garden
            </BodyText>
            <Ionicons name="add" size={24} color="#fffefa" />
          </TouchableOpacity>
        </View>
      </AnimatedTransition>

      {/* Only render content when we have data */}
      {gardens && (
        <>
          {/* Overall Statistics Summary */}
          {overallStats && (
            <AnimatedTransition delay={250} initialY={10}>
              {/*
                Stats Row: Evenly distribute 3 cards with consistent spacing and padding.
                - Use a single px-4 on the parent for edge padding.
                - Use flex-row and gap-x-3 for even spacing between cards.
                - Remove all mx-2, mr-2, ml-2 from cards for consistency.
                - This ensures the cards feel visually grouped and centered inside the phone.
              */}
              <View className="px-4">
                <View className="flex-row gap-x-3">
                  <View className="flex-1 bg-cream-50 rounded-lg p-3 shadow-sm">
                    <TitleText className="text-xs mb-1">Gardens</TitleText>
                    <BodyText className="text-xl">
                      {overallStats.gardenCount}
                    </BodyText>
                  </View>
                  <View className="flex-1 bg-cream-50 rounded-lg p-3 shadow-sm">
                    <TitleText className="text-xs mb-1">Total Plants</TitleText>
                    <BodyText className="text-xl">
                      {overallStats.totalPlantsCount}
                    </BodyText>
                  </View>
                  <View className="flex-1 bg-cream-50 rounded-lg p-3 shadow-sm">
                    <TitleText className="text-xs mb-1">Need Care</TitleText>
                    <View className="flex-row items-center">
                      <BodyText
                        className={`text-xl ${
                          overallStats.plantsNeedingCare === 0
                            ? "text-brand-600"
                            : "text-accent-600"
                        }`}
                      >
                        {overallStats.plantsNeedingCare}
                      </BodyText>
                      {overallStats.plantsNeedingCare === 0 && (
                        <Ionicons name="checkmark-circle" size={16} color="#5E994B" className="ml-1" />
                      )}
                    </View>
                  </View>
                </View>
              </View>
            </AnimatedTransition>
          )}

          {/* Gardens List */}
          <View className="px-2 py-4">
            {gardens.length > 0 ? (
              gardens.map((garden, index) => (
                <AnimatedTransition
                  key={garden.garden_id}
                  delay={350 + index * 100}
                  initialY={15}
                >
                  <GardenCard garden={garden} maxWidth={120} />
                </AnimatedTransition>
              ))
            ) : (
              <AnimatedTransition delay={350} initialY={10}>
                <View className="flex-1 justify-center items-center py-8">
                  <View className="flex-col items-center justify-center gap-4">
                    <View className="bg-cream-100/40 rounded-xl p-4">
                      <Ionicons name="leaf" size={62} color="#5E994B" />
                    </View>
                    <Text className="text-foreground text-center font-title font-bold text-lg capitalize">
                      No Gardens Yet
                    </Text>
                    <Text className="text-foreground text-center font-paragraph px-8">
                      Create your first garden to track and nurture your plants
                      in one place
                    </Text>
                    <TouchableOpacity
                      className="bg-primary rounded-lg px-6 py-3 flex-row items-center gap-2"
                      onPress={() => router.push("/(tabs)/gardens/new")}
                    >
                      <Text className="text-primary-foreground font-paragraph font-medium">
                        Create Your First Garden
                      </Text>
                      <Ionicons
                        name="arrow-forward"
                        size={18}
                        color="#fffefa"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </AnimatedTransition>
            )}
          </View>
        </>
      )}
    </PageContainer>
  );
}
