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
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

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

  // Silently refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (!isLoading) {
        refetch();
      }
    }, [refetch, isLoading])
  );

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

      // Use the health_percentage property directly from each garden
      // Only include gardens that have plants
      if (garden.total_plants && garden.total_plants > 0) {
        totalHealthScores += garden.health_percentage || 0;
        totalGardensWithScore++;
      }
    });

    // Calculate average health score across all gardens
    const avgHealthPercentage =
      totalGardensWithScore > 0
        ? Math.round(totalHealthScores / totalGardensWithScore)
        : 0;

    return {
      totalPlantsCount,
      gardenCount: gardens.length,
      avgHealthPercentage,
    };
  };

  const overallHealth = calculateOverallHealth(gardens);

  // Show loading spinner only for initial data fetch, not during navigation
  if (isLoading && !gardens) {
    return <LoadingSpinner message="Loading gardens..." />;
  }

  return (
    <PageContainer scroll={true} padded={false} animate={true}>
      {/* Header */}
      <AnimatedTransition delay={150} initialY={10}>
        <View className="flex-row justify-between items-center mb-6 px-4 pt-4">
          <Text className="text-2xl font-bold text-foreground">My Gardens</Text>
          <TouchableOpacity
            className="bg-primary rounded-lg px-4 py-2 flex-row items-center"
            onPress={() => router.push("/(home)/gardens/new")}
          >
            <Text className="text-primary-foreground font-medium mr-2">
              New Garden
            </Text>
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
              <View className="flex-row justify-between mb-6 px-4">
                <View className="flex-1 bg-cream-50 rounded-lg p-3 mr-2 shadow-sm">
                  <Text className="text-xs text-cream-600 mb-1">
                    Total Plants
                  </Text>
                  <Text className="text-xl font-bold text-foreground">
                    {overallHealth.totalPlantsCount}
                  </Text>
                </View>

                <View className="flex-1 bg-cream-50 rounded-lg p-3 mx-2 shadow-sm">
                  <Text className="text-xs text-cream-600 mb-1">Gardens</Text>
                  <Text className="text-xl font-bold text-foreground">
                    {overallHealth.gardenCount}
                  </Text>
                </View>

                <View className="flex-1 bg-cream-50 rounded-lg p-3 ml-2 shadow-sm">
                  <Text className="text-xs text-cream-600 mb-1">
                    Health Score
                  </Text>
                  <View className="flex-row items-center">
                    <Text
                      className={`text-xl font-bold ${
                        overallHealth.avgHealthPercentage >= 80
                          ? "text-brand-600"
                          : overallHealth.avgHealthPercentage >= 50
                          ? "text-accent-600"
                          : "text-destructive"
                      }`}
                    >
                      {overallHealth.avgHealthPercentage}%
                    </Text>
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
                    <View className="bg-brand-50 rounded-full p-4">
                      <Ionicons name="leaf" size={62} color="#5E994B" />
                    </View>
                    <Text className="text-foreground text-center font-bold text-lg capitalize">
                      No Gardens Yet
                    </Text>
                    <Text className="text-foreground text-center px-8">
                      Create your first garden to track and nurture your plants
                      in one place
                    </Text>
                    <TouchableOpacity
                      className="bg-primary rounded-lg px-6 py-3 flex-row items-center gap-2"
                      onPress={() => router.push("/(home)/gardens/new")}
                    >
                      <Text className="text-primary-foreground font-medium">
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
