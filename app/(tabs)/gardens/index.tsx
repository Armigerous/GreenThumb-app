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
   * Calculate overall health metrics across all gardens
   * @param gardens Array of user's gardens
   * @returns Object with health statistics including average health percentage
   */
  const calculateOverallHealth = (gardens: GardenDashboard[] | undefined) => {
    if (!gardens || gardens.length === 0) return null;

    let totalPlantsCount = 0;
    let totalHealthScores = 0;
    let totalGardensWithScore = 0;

    gardens.forEach((garden) => {
      totalPlantsCount += garden.total_plants || 0;

      // Only include gardens that have plants (health_percentage is not null)
      if (
        garden.total_plants &&
        garden.total_plants > 0 &&
        garden.health_percentage !== null
      ) {
        totalHealthScores += garden.health_percentage || 0;
        totalGardensWithScore++;
      }
    });

    // Calculate average health score across all gardens with plants
    // If no gardens have plants, show neutral state (no percentage)
    const avgHealthPercentage =
      totalGardensWithScore > 0
        ? Math.round(totalHealthScores / totalGardensWithScore)
        : null;

    return {
      totalPlantsCount,
      gardenCount: gardens.length,
      avgHealthPercentage,
    };
  };

  const overallHealth = calculateOverallHealth(gardens);

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
          {/* Overall Health Summary */}
          {overallHealth && (
            <AnimatedTransition delay={250} initialY={10}>
              <View className="flex-row justify-between mb-6 px-2">
                <View className="flex-1 bg-cream-50 rounded-lg p-3 mx-2 shadow-sm">
                  <Text className="text-xs text-cream-600 font-paragraph mb-1">
                    Gardens
                  </Text>
                  <Text className="text-xl font-title font-bold text-foreground">
                    {overallHealth.gardenCount}
                  </Text>
                </View>
                <View className="flex-1 bg-cream-50 rounded-lg p-3 mr-2 shadow-sm">
                  <Text className="text-xs text-cream-600 font-paragraph mb-1">
                    Total Plants
                  </Text>
                  <Text className="text-xl font-title font-bold text-foreground">
                    {overallHealth.totalPlantsCount}
                  </Text>
                </View>

                <View className="flex-1 bg-cream-50 rounded-lg p-3 ml-2 shadow-sm">
                  <Text className="text-xs text-cream-600 font-paragraph mb-1">
                    Health Score
                  </Text>
                  <View className="flex-row items-center">
                    {overallHealth.avgHealthPercentage !== null ? (
                      <Text
                        className={`text-xl font-title font-bold ${
                          overallHealth.avgHealthPercentage >= 80
                            ? "text-brand-600"
                            : overallHealth.avgHealthPercentage >= 50
                            ? "text-accent-600"
                            : "text-destructive"
                        }`}
                      >
                        {overallHealth.avgHealthPercentage}%
                      </Text>
                    ) : (
                      <Text className="text-xl font-title font-bold text-cream-500">
                        No plants yet
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            </AnimatedTransition>
          )}

          {/* Gardens List */}
          <View className="px-4">
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
