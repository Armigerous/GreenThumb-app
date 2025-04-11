import GardenCard from "@/components/Gardens/GardenCard";
import { useSupabaseAuth } from "@/lib/hooks/useSupabaseAuth";
import { useGardenDashboard } from "@/lib/queries";
import { GardenDashboard } from "@/types/garden";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LoadingSpinner } from "@/components/UI/LoadingSpinner";
import { PageContainer } from "@/components/UI/PageContainer";

export default function GardensScreen() {
  const { user } = useUser();
  const router = useRouter();
  useSupabaseAuth();
  const { data: gardens, isLoading, error } = useGardenDashboard(user?.id);

  // Log error details if present
  if (error) {
    console.error("Gardens fetch error:", error);
  }

  /**
   * Calculate overall garden health across all gardens
   * @param gardens Array of user's gardens
   * @returns Object with health statistics
   */
  const calculateOverallHealth = (gardens: GardenDashboard[] | undefined) => {
    if (!gardens || gardens.length === 0) return null;

    let totalHealthyPlants = 0;
    let totalPlantsCount = 0;

    gardens.forEach((garden) => {
      totalHealthyPlants += garden.healthy_plants || 0;
      totalPlantsCount += garden.total_plants || 0;
    });

    if (totalPlantsCount === 0) return null;

    const healthPercentage = Math.round(
      (totalHealthyPlants / totalPlantsCount) * 100
    );

    return {
      totalHealthyPlants,
      totalPlantsCount,
      healthPercentage,
      plantsNeedingCare: totalPlantsCount - totalHealthyPlants,
    };
  };

  const overallHealth = calculateOverallHealth(gardens);

  if (isLoading) {
    return <LoadingSpinner message="Loading your gardens..." />;
  }

  return (
    <PageContainer scroll={true} padded={false}>
      {/* Header */}
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

      {/* Overall Health Summary */}
      {overallHealth && (
        <View className="flex-row justify-between mb-6 px-4">
          <View className="flex-1 bg-cream-50 rounded-lg p-3 mr-2 shadow-sm">
            <Text className="text-xs text-cream-600 mb-1">Total Plants</Text>
            <Text className="text-xl font-bold text-foreground">
              {overallHealth.totalPlantsCount}
            </Text>
          </View>

          <View className="flex-1 bg-cream-50 rounded-lg p-3 mx-2 shadow-sm">
            <Text className="text-xs text-cream-600 mb-1">Need Care</Text>
            <Text className="text-xl font-bold text-destructive">
              {overallHealth.plantsNeedingCare}
            </Text>
          </View>

          <View className="flex-1 bg-cream-50 rounded-lg p-3 ml-2 shadow-sm">
            <Text className="text-xs text-cream-600 mb-1">Health Score</Text>
            <View className="flex-row items-center">
              <Text
                className={`text-xl font-bold ${
                  overallHealth.healthPercentage >= 80
                    ? "text-brand-600"
                    : overallHealth.healthPercentage >= 50
                    ? "text-accent-600"
                    : "text-destructive"
                }`}
              >
                {overallHealth.healthPercentage}%
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Gardens List */}
      <View className="px-4">
        {gardens && gardens.length > 0 ? (
          gardens.map((garden) => (
            <GardenCard key={garden.garden_id} garden={garden} />
          ))
        ) : (
          <View className="flex-1 justify-center items-center py-8">
            <View className="flex-col items-center justify-center gap-4">
              <View className="bg-brand-50 rounded-full p-4">
                <Ionicons name="leaf" size={62} color="#5E994B" />
              </View>
              <Text className="text-foreground text-center font-bold text-lg capitalize">
                No Gardens Yet
              </Text>
              <Text className="text-foreground text-center px-8">
                Create your first garden to track and nurture your plants in one
                place
              </Text>
              <TouchableOpacity
                className="bg-primary rounded-lg px-6 py-3 flex-row items-center gap-2"
                onPress={() => router.push("/(home)/gardens/new")}
              >
                <Text className="text-primary-foreground font-medium">
                  Create Your First Garden
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#fffefa" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </PageContainer>
  );
}
