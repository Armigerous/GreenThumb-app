import { Text, View, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { format } from "date-fns";

type GardenCardProps = {
  garden: {
    id: number;
    name: string;
    user_plants?: Array<{
      id: string;
      nickname: string;
      status: string;
      images: string[];
      care_logs: Array<{
        created_at: string;
        action: string;
      }>;
      main_plant_data: {
        scientific_name: string;
        common_names: string[];
      };
    }>;
    created_at: string;
  };
};

export default function GardenCard({ garden }: GardenCardProps) {
  const router = useRouter();

  const getGardenInsights = () => {
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

    return {
      healthyCount,
      needsAttentionCount,
      criticalCount,
      plantsNeedingCare,
    };
  };

  const insights = getGardenInsights();

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
            <View className="bg-yellow-100 rounded-full px-3 py-1">
              <Text className="text-xs text-yellow-700 font-medium">
                {insights.plantsNeedingCare}{" "}
                {insights.plantsNeedingCare === 1 ? "plant" : "plants"} need
                care
              </Text>
            </View>
          )}
        </View>

        <View className="flex-row items-center mb-3">
          <View className="flex-row items-center">
            <Ionicons name="leaf" size={16} color="#10b981" />
            <Text className="text-brand-600 text-sm font-medium ml-1">
              {garden.user_plants?.length || 0} Plants
            </Text>
          </View>

          {insights && garden.user_plants && garden.user_plants.length > 0 && (
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
                  <View className="bg-yellow-500 h-2 rounded-full w-2 mr-1" />
                  <Text className="text-xs text-yellow-700">
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

        {garden.user_plants && garden.user_plants.length > 0 ? (
          <View>
            {/* Preview of plants needing attention first */}
            {garden.user_plants
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
              <View className="flex-row bg-green-50 justify-between p-2 rounded-lg items-center">
                <Text className="text-green-700 text-sm">
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
