import { GardenDashboard } from "@/types/garden";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { format } from "date-fns";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function GardenCard({ garden }: { garden: GardenDashboard }) {
  const router = useRouter();

  // Determine the garden health status color
  const getHealthStatusColor = () => {
    if (!garden.total_plants) return "#161513"; // Default gray

    const healthPercentage = Number(garden.health_percentage);
    if (healthPercentage >= 80) return "#77B860"; // Green for healthy
    if (healthPercentage >= 50) return "#bea100"; // Yellow/amber for needs attention
    return "#E50000"; // Red for critical
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (e) {
      return "Unknown date";
    }
  };

  // Get the next upcoming task
  const nextTask = garden.upcoming_tasks?.[0];

  return (
    <TouchableOpacity
      className="bg-white border border-cream-100 rounded-xl shadow-sm mb-4 overflow-hidden"
      onPress={() =>
        router.push({
          pathname: "/(home)/gardens/[id]",
          params: { id: garden.garden_id },
        })
      }
    >
      <View className="p-4">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-foreground text-lg font-bold">
            {garden.name}
          </Text>
          {garden.plants_needing_care > 0 && (
            <View className="bg-accent-100 rounded-full px-3 py-1">
              <Text className="text-xs text-accent-700 font-medium">
                {garden.plants_needing_care}{" "}
                {garden.plants_needing_care === 1 ? "plant" : "plants"} need
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
        {garden.total_plants > 0 && (
          <View className="mb-3">
            <View className="flex-row justify-between items-center mb-1">
              <Text className="text-cream-700 text-xs">Garden Health</Text>
              <Text
                className="text-xs font-medium"
                style={{ color: getHealthStatusColor() }}
              >
                {garden.health_percentage}%
              </Text>
            </View>
            <View className="h-2 bg-cream-100 rounded-full overflow-hidden">
              <View
                className="h-full rounded-full"
                style={{
                  width: `${garden.health_percentage}%`,
                  backgroundColor: getHealthStatusColor(),
                }}
              />
            </View>
          </View>
        )}

        <View className="flex-row items-center mb-3">
          <View className="flex-row items-center">
            <Ionicons name="leaf" size={16} color="#77B860" />
            <Text className="text-brand-600 text-sm font-medium ml-1">
              {garden.total_plants} Plants
            </Text>
          </View>

          {garden.total_plants > 0 && (
            <View className="flex-row ml-4">
              {garden.healthy_plants > 0 && (
                <View className="flex-row items-center mr-2">
                  <View className="bg-brand-500 h-2 rounded-full w-2 mr-1" />
                  <Text className="text-brand-700 text-xs">
                    {garden.healthy_plants}
                  </Text>
                </View>
              )}
              {garden.plants_needing_care > 0 && (
                <View className="flex-row items-center mr-2">
                  <View className="bg-accent-500 h-2 rounded-full w-2 mr-1" />
                  <Text className="text-xs text-accent-700">
                    {garden.plants_needing_care}
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

        {garden.total_plants > 0 ? (
          <View>
            {/* Preview of plants needing attention first */}
            {garden.plants &&
              garden.plants
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
            {garden.healthy_plants > 0 && (
              <View className="flex-row bg-brand-50 justify-between p-2 rounded-lg items-center">
                <Text className="text-brand-700 text-sm">
                  {garden.healthy_plants} healthy{" "}
                  {garden.healthy_plants === 1 ? "plant" : "plants"}
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
