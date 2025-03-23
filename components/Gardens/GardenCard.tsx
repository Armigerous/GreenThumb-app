import { Garden } from "@/types/garden";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { format } from "date-fns";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function GardenCard({ garden }: { garden: Garden }) {
  const router = useRouter();

  /**
   * Get garden insights using either health_stats from DB view or calculating from user_plants
   * Provides a fallback calculation if health_stats is not available
   * @returns Object containing health statistics for the garden
   */
  const getGardenInsights = () => {
    // If health_stats is available from the database view, use it
    if (garden.health_stats) {
      return {
        healthyCount: garden.health_stats.healthy_plants,
        needsAttentionCount: garden.health_stats.plants_needing_care,
        criticalCount:
          garden.user_plants?.filter(
            (p) => p.status === "Dead" || p.status === "Wilting"
          ).length || 0,
        plantsNeedingCare: garden.health_stats.plants_needing_care,
        totalPlants: garden.health_stats.total_plants,
        healthPercentage: garden.health_stats.health_percentage,
      };
    }

    // Fallback to calculating from user_plants if health_stats is not available
    if (!garden.user_plants || garden.user_plants.length === 0) return null;

    // Get plant health stats
    const healthyCount = garden.user_plants.filter(
      (p) => p.status === "Healthy"
    ).length;
    const needsAttentionCount = garden.user_plants.filter(
      (p) => p.status === "Needs Water" || p.status === "Dormant"
    ).length;
    const criticalCount = garden.user_plants.filter(
      (p) => p.status === "Dead" || p.status === "Wilting"
    ).length;

    // Get next actions needed
    const plantsNeedingCare = garden.user_plants.filter(
      (p) => p.status !== "Healthy"
    ).length;

    const totalPlants = garden.user_plants.length;
    const healthPercentage = Math.round((healthyCount / totalPlants) * 100);

    return {
      healthyCount,
      needsAttentionCount,
      criticalCount,
      plantsNeedingCare,
      totalPlants,
      healthPercentage,
    };
  };

  /**
   * Get the most urgent upcoming task for the garden
   * @returns Object containing information about the next task
   */
  const getNextUpcomingTask = () => {
    if (!garden.pending_tasks || garden.pending_tasks.length === 0) return null;

    // Return the first task as they are already ordered by due_date
    return garden.pending_tasks[0];
  };

  const insights = getGardenInsights();
  const nextTask = getNextUpcomingTask();

  // Determine the garden health status color
  const getHealthStatusColor = () => {
    if (!insights) return "#9ca3af"; // Default gray

    if (insights.healthPercentage >= 80) return "#10b981"; // Green for healthy
    if (insights.healthPercentage >= 50) return "#f59e0b"; // Yellow/amber for needs attention
    return "#ef4444"; // Red for critical
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (e) {
      return "Unknown date";
    }
  };

  /**
   * Check if the garden has any plants by examining both user_plants and health_stats
   * This ensures we accurately determine if the garden is empty regardless of data source
   * @returns boolean indicating if the garden has plants
   */
  const hasPlants = (): boolean => {
    // Check if the garden has a total_plants property from user_gardens_dashboard view
    if (garden.total_plants && garden.total_plants > 0) {
      return true;
    }

    // If we have health_stats and it shows plants, we know there are plants
    if (garden.health_stats && garden.health_stats.total_plants > 0) {
      return true;
    }

    // If we have user_plants array and it's not empty, we know there are plants
    if (garden.user_plants && garden.user_plants.length > 0) {
      return true;
    }

    // If insights were calculated and total plants > 0, we know there are plants
    if (insights && insights.totalPlants > 0) {
      return true;
    }

    // Default: no plants detected
    return false;
  };

  return (
    <TouchableOpacity
      className="bg-white border border-cream-100 rounded-xl shadow-sm mb-4 overflow-hidden"
      onPress={() =>
        router.push({
          pathname: "/(home)/gardens/[id]",
          params: { id: garden.id },
        })
      }
    >
      <View className="p-4">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-foreground text-lg font-bold">
            {garden.name}
          </Text>
          {insights && insights.plantsNeedingCare > 0 && (
            <View className="bg-accent-100 rounded-full px-3 py-1">
              <Text className="text-xs text-accent-700 font-medium">
                {insights.plantsNeedingCare}{" "}
                {insights.plantsNeedingCare === 1 ? "plant" : "plants"} need
                care
              </Text>
            </View>
          )}
        </View>

        {/* Updated date */}
        <View className="flex-row items-center mb-2">
          <Ionicons name="time-outline" size={14} color="#6b7280" />
          <Text className="text-cream-600 text-xs ml-1">
            Updated {formatDate(garden.updated_at)}
          </Text>
        </View>

        {/* Health summary bar */}
        {insights && insights.totalPlants > 0 && (
          <View className="mb-3">
            <View className="flex-row justify-between items-center mb-1">
              <Text className="text-cream-700 text-xs">Garden Health</Text>
              <Text
                className="text-xs font-medium"
                style={{ color: getHealthStatusColor() }}
              >
                {insights.healthPercentage}%
              </Text>
            </View>
            <View className="h-2 bg-cream-100 rounded-full overflow-hidden">
              <View
                className="h-full rounded-full"
                style={{
                  width: `${insights.healthPercentage}%`,
                  backgroundColor: getHealthStatusColor(),
                }}
              />
            </View>
          </View>
        )}

        <View className="flex-row items-center mb-3">
          <View className="flex-row items-center">
            <Ionicons name="leaf" size={16} color="#10b981" />
            <Text className="text-brand-600 text-sm font-medium ml-1">
              {insights?.totalPlants ||
                garden.total_plants ||
                garden.health_stats?.total_plants ||
                garden.user_plants?.length ||
                0}{" "}
              Plants
            </Text>
          </View>

          {insights && insights.totalPlants > 0 && (
            <View className="flex-row ml-4">
              {insights.healthyCount > 0 && (
                <View className="flex-row items-center mr-2">
                  <View className="bg-brand-500 h-2 rounded-full w-2 mr-1" />
                  <Text className="text-brand-700 text-xs">
                    {insights.healthyCount}
                  </Text>
                </View>
              )}
              {insights.needsAttentionCount > 0 && (
                <View className="flex-row items-center mr-2">
                  <View className="bg-accent-500 h-2 rounded-full w-2 mr-1" />
                  <Text className="text-xs text-accent-700">
                    {insights.needsAttentionCount}
                  </Text>
                </View>
              )}
              {insights.criticalCount > 0 && (
                <View className="flex-row items-center">
                  <View className="bg-red-500 h-2 rounded-full w-2 mr-1" />
                  <Text className="text-red-700 text-xs">
                    {insights.criticalCount}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Next upcoming task if available */}
        {nextTask && (
          <View className="bg-blue-50 p-3 rounded-lg mb-3">
            <View className="flex-row justify-between items-center mb-1">
              <Text className="text-blue-700 text-sm font-medium">
                Next Task
              </Text>
              <Text className="text-blue-600 text-xs">
                Due {formatDate(nextTask.due_date)}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons
                name={
                  nextTask.task_type === "Water"
                    ? "water"
                    : nextTask.task_type === "Fertilize"
                    ? "flask"
                    : "leaf"
                }
                size={14}
                color="#3b82f6"
              />
              <Text className="text-blue-700 text-xs ml-1">
                {nextTask.task_type} {nextTask.plant_nickname}
              </Text>
            </View>
          </View>
        )}

        {hasPlants() ? (
          <View>
            {/* Preview of plants needing attention first */}
            {garden.user_plants &&
              garden.user_plants
                .filter((p) => p.status !== "Healthy")
                .slice(0, 2)
                .map((plant) => (
                  <View
                    key={plant.id}
                    className="flex-row bg-cream-50 p-2 rounded-lg items-center mb-2"
                  >
                    {plant.images?.[0] && (
                      <Image
                        source={{ uri: plant.images[0] }}
                        className="h-8 rounded-full w-8 mr-2"
                      />
                    )}
                    <View className="flex-1">
                      <Text className="text-cream-800 text-sm font-medium">
                        {plant.nickname}
                      </Text>
                      <Text className="text-cream-600 text-xs">
                        Needs attention
                      </Text>
                    </View>
                    <Ionicons
                      name={
                        plant.status === "Dead" || plant.status === "Wilting"
                          ? "alert-circle"
                          : "water"
                      }
                      size={16}
                      color={
                        plant.status === "Dead" || plant.status === "Wilting"
                          ? "#dc2626"
                          : "#d97706"
                      }
                    />
                  </View>
                ))}

            {/* Show remaining healthy plants count if any */}
            {insights && insights.healthyCount > 0 && (
              <View className="flex-row bg-brand-50 justify-between p-2 rounded-lg items-center">
                <Text className="text-brand-700 text-sm">
                  {insights.healthyCount} healthy{" "}
                  {insights.healthyCount === 1 ? "plant" : "plants"}
                </Text>
                <Ionicons name="checkmark-circle" size={16} color="#059669" />
              </View>
            )}
          </View>
        ) : (
          <View className="bg-cream-50 p-3 rounded-lg">
            <Text className="text-center text-cream-600 text-sm">
              Add your first plant to get started
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
