import GardenCard from "@/components/Gardens/GardenCard";
import { useSupabaseAuth } from "@/lib/hooks/useSupabaseAuth";
import { useGardenDashboard } from "@/lib/queries";
import { GardenDashboard } from "@/types/garden";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4 pt-4">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-bold text-foreground">My Gardens</Text>
          <TouchableOpacity
            className="bg-brand-500 rounded-full p-2"
            onPress={() => router.push("/(home)/gardens/new")}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Overall Health Summary */}
        {overallHealth && (
          <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
            <Text className="text-lg font-semibold mb-2">Overall Health</Text>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-cream-700">
                {overallHealth.totalPlantsCount} Total Plants
              </Text>
              <Text
                className={`font-medium ${
                  overallHealth.healthPercentage >= 80
                    ? "text-brand-600"
                    : overallHealth.healthPercentage >= 50
                    ? "text-accent-600"
                    : "text-destructive"
                }`}
              >
                {overallHealth.healthPercentage}% Healthy
              </Text>
            </View>
            <View className="h-2 bg-cream-100 rounded-full overflow-hidden">
              <View
                className={`h-full rounded-full ${
                  overallHealth.healthPercentage >= 80
                    ? "bg-brand-500"
                    : overallHealth.healthPercentage >= 50
                    ? "bg-accent-500"
                    : "bg-destructive"
                }`}
                style={{ width: `${overallHealth.healthPercentage}%` }}
              />
            </View>
          </View>
        )}

        {/* Gardens List */}
        {gardens && gardens.length > 0 ? (
          gardens.map((garden) => (
            <GardenCard key={garden.garden_id} garden={garden} />
          ))
        ) : (
          <View className="flex-1 justify-center items-center py-8">
            <Text className="text-cream-600 text-center mb-4">
              You haven't created any gardens yet
            </Text>
            <TouchableOpacity
              className="bg-brand-500 rounded-full px-6 py-3"
              onPress={() => router.push("/(home)/gardens/new")}
            >
              <Text className="text-white font-medium">
                Create Your First Garden
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
