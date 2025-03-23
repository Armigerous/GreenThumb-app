import {
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useUserGardens } from "@/lib/queries";
import { useSupabaseAuth } from "@/lib/hooks/useSupabaseAuth";
import GardenCard from "@/components/Gardens/GardenCard";
import { Garden, GardenTaskSummary } from "@/types/garden";
import { format } from "date-fns";

export default function GardensScreen() {
  const { user } = useUser();
  const router = useRouter();
  useSupabaseAuth();
  const { data: gardens, isLoading, error } = useUserGardens(user?.id);

  // Log error details if present
  if (error) {
    console.error("Gardens fetch error:", error);
  }

  /**
   * Calculate overall garden health across all gardens
   * @param gardens Array of user's gardens
   * @returns Object with health statistics
   */
  const calculateOverallHealth = (gardens: Garden[] | undefined) => {
    if (!gardens || gardens.length === 0) return null;

    let totalHealthyPlants = 0;
    let totalPlantsCount = 0;

    // Sum up health stats from all gardens
    gardens.forEach((garden) => {
      if (garden.health_stats) {
        totalHealthyPlants += garden.health_stats.healthy_plants;
        totalPlantsCount += garden.health_stats.total_plants;
      } else if (garden.user_plants && garden.user_plants.length > 0) {
        // Fallback to calculating from user_plants
        totalHealthyPlants += garden.user_plants.filter(
          (p) => p.status === "Healthy"
        ).length;
        totalPlantsCount += garden.user_plants.length;
      }
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

  /**
   * Get the most urgent tasks across all gardens
   * @param gardens Array of user's gardens
   * @param limit Maximum number of tasks to return
   * @returns Array of urgent tasks
   */
  const getUrgentTasks = (
    gardens: Garden[] | undefined,
    limit = 3
  ): GardenTaskSummary[] => {
    if (!gardens || gardens.length === 0) return [];

    // Collect all pending tasks
    const allTasks: GardenTaskSummary[] = [];
    gardens.forEach((garden) => {
      if (garden.pending_tasks && garden.pending_tasks.length > 0) {
        // Add garden name to each task for display
        const tasksWithGardenName = garden.pending_tasks.map((task) => ({
          ...task,
          garden_name: garden.name,
        })) as GardenTaskSummary[];

        allTasks.push(...tasksWithGardenName);
      }
    });

    // Sort by due date and return limited number
    return allTasks
      .sort(
        (a, b) =>
          new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      )
      .slice(0, limit);
  };

  /**
   * Format a date string in a human-readable format
   * @param dateString The date string to format
   * @returns Formatted date string
   */
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d");
    } catch (e) {
      return "Unknown date";
    }
  };

  // Calculate overall stats
  const overallHealth = calculateOverallHealth(gardens);
  const urgentTasks = getUrgentTasks(gardens);

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="pt-5 px-5">
          <Text className="text-destructive text-lg">
            Please sign in to view your gardens.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#5E994B" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="pt-5 px-5">
          <Text className="text-destructive text-lg">
            Error loading gardens: {error.message}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row justify-between items-center pt-5 px-5">
        <Text className="text-2xl text-foreground font-bold">My Gardens</Text>
        <TouchableOpacity
          className="bg-brand-500 p-2 rounded-full"
          onPress={() => router.push("/(home)/gardens/new")}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 pt-4 px-5">
        {/* Garden Health Summary Card */}
        {overallHealth && gardens && gardens.length > 0 && (
          <View className="bg-white border border-cream-100 rounded-xl p-4 mb-5 shadow-sm">
            <Text className="text-lg font-bold text-foreground mb-3">
              Garden Overview
            </Text>

            {/* Health Stats */}
            <View className="mb-4">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-cream-700 text-sm">Overall Health</Text>
                <Text
                  className="text-sm font-medium"
                  style={{
                    color:
                      overallHealth.healthPercentage >= 80
                        ? "#10b981"
                        : overallHealth.healthPercentage >= 50
                        ? "#f59e0b"
                        : "#ef4444",
                  }}
                >
                  {overallHealth.healthPercentage}%
                </Text>
              </View>

              <View className="h-2 bg-cream-100 rounded-full overflow-hidden mb-2">
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${overallHealth.healthPercentage}%`,
                    backgroundColor:
                      overallHealth.healthPercentage >= 80
                        ? "#10b981"
                        : overallHealth.healthPercentage >= 50
                        ? "#f59e0b"
                        : "#ef4444",
                  }}
                />
              </View>

              <View className="flex-row">
                <View className="flex-1 flex-row items-center">
                  <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                  <Text className="text-xs text-cream-700 ml-1">
                    {overallHealth.totalHealthyPlants} healthy
                  </Text>
                </View>

                {overallHealth.plantsNeedingCare > 0 && (
                  <View className="flex-1 flex-row items-center">
                    <Ionicons name="alert-circle" size={14} color="#f59e0b" />
                    <Text className="text-xs text-cream-700 ml-1">
                      {overallHealth.plantsNeedingCare} need care
                    </Text>
                  </View>
                )}

                <View className="flex-1 flex-row items-center">
                  <Ionicons name="leaf" size={14} color="#6b7280" />
                  <Text className="text-xs text-cream-700 ml-1">
                    {overallHealth.totalPlantsCount} total
                  </Text>
                </View>
              </View>
            </View>

            {/* Urgent Tasks */}
            {urgentTasks.length > 0 && (
              <View>
                <Text className="text-sm font-bold text-foreground mb-2">
                  Upcoming Tasks
                </Text>
                {urgentTasks.map((task, index) => (
                  <View
                    key={task.task_id}
                    className="flex-row items-center justify-between py-2"
                    style={{
                      borderTopWidth: index > 0 ? 1 : 0,
                      borderColor: "#f3f4f6",
                    }}
                  >
                    <View className="flex-row items-center flex-1">
                      <Ionicons
                        name={
                          task.task_type === "Water"
                            ? "water"
                            : task.task_type === "Fertilize"
                            ? "flask"
                            : "leaf"
                        }
                        size={16}
                        color="#3b82f6"
                      />
                      <View className="ml-2 flex-1">
                        <Text className="text-cream-800 text-sm">
                          {task.plant_nickname}
                        </Text>
                        <Text className="text-cream-600 text-xs">
                          {task.task_type} in {task.garden_name}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-blue-600 text-xs">
                      Due {formatDate(task.due_date)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Garden Cards */}
        {gardens && gardens.length > 0 ? (
          gardens.map((garden) => (
            <GardenCard key={garden.id} garden={garden} />
          ))
        ) : (
          <View className="items-center py-8">
            <Ionicons
              name="leaf-outline"
              size={48}
              color="#9e9a90"
              className="mb-2"
            />
            <Text className="text-center text-cream-500">
              No gardens yet.{"\n"}Create your first garden to get started!
            </Text>
          </View>
        )}

        <TouchableOpacity
          className="bg-cream-50 border border-cream-300 border-dashed justify-center p-4 rounded-xl items-center mb-8"
          onPress={() => router.push("/(home)/gardens/new")}
        >
          <Ionicons name="add-circle-outline" size={32} color="#6b7280" />
          <Text className="text-base text-cream-500 mt-2">Add New Garden</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
