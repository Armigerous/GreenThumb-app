import { Text, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type GardenCardProps = {
  garden: {
    id: number;
    name: string;
    nc_regions_ids?: string | string[];
    sunlight_ids?: string | string[];
    soil_texture_ids?: string | string[];
    soil_ph_ids?: string | string[];
    soil_drainage_ids?: string | string[];
    user_plants?: any[];
    created_at?: string;
  };
};

export default function GardenCard({ garden }: GardenCardProps) {
  const router = useRouter();

  const getPlantHealthSummary = () => {
    if (!garden.user_plants || garden.user_plants.length === 0) return null;

    const healthyCount = garden.user_plants.filter(
      (p) => p.status === "healthy"
    ).length;
    const needsAttentionCount = garden.user_plants.filter(
      (p) => p.status === "needs_attention"
    ).length;
    const criticalCount = garden.user_plants.filter(
      (p) => p.status === "critical"
    ).length;

    return { healthyCount, needsAttentionCount, criticalCount };
  };

  const healthSummary = getPlantHealthSummary();

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
        <Text className="text-foreground text-lg font-bold mb-2">
          {garden.name}
        </Text>

        <View className="flex-row flex-wrap gap-2 mb-3">
          {garden.nc_regions_ids && (
            <View className="bg-cream-100 rounded px-2 py-1">
              <Text className="text-cream-800 text-xs">
                {Array.isArray(garden.nc_regions_ids)
                  ? garden.nc_regions_ids.join(", ")
                  : garden.nc_regions_ids}
              </Text>
            </View>
          )}
          {garden.sunlight_ids && (
            <View className="bg-yellow-100 rounded px-2 py-1">
              <Text className="text-xs text-yellow-800">
                <Ionicons name="sunny-outline" size={12} color="#b45309" />
                {Array.isArray(garden.sunlight_ids)
                  ? garden.sunlight_ids.join(", ")
                  : garden.sunlight_ids}
              </Text>
            </View>
          )}
          {garden.soil_texture_ids && (
            <View className="bg-brown-100 rounded px-2 py-1">
              <Text className="text-brown-800 text-xs">
                <Ionicons name="layers-outline" size={12} color="#78350f" />
                {Array.isArray(garden.soil_texture_ids)
                  ? garden.soil_texture_ids.join(", ")
                  : garden.soil_texture_ids}
              </Text>
            </View>
          )}
        </View>

        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Ionicons name="leaf" size={16} color="#10b981" />
            <Text className="text-brand-600 text-sm font-medium ml-1">
              {garden.user_plants?.length || 0} Plants
            </Text>
          </View>

          {healthSummary &&
            garden.user_plants &&
            garden.user_plants.length > 0 && (
              <View className="flex-row">
                {healthSummary.healthyCount > 0 && (
                  <View className="flex-row items-center mr-2">
                    <View className="bg-brand-500 h-2 rounded-full w-2 mr-1" />
                    <Text className="text-brand-700 text-xs">
                      {healthSummary.healthyCount}
                    </Text>
                  </View>
                )}
                {healthSummary.needsAttentionCount > 0 && (
                  <View className="flex-row items-center mr-2">
                    <View className="bg-yellow-500 h-2 rounded-full w-2 mr-1" />
                    <Text className="text-xs text-yellow-700">
                      {healthSummary.needsAttentionCount}
                    </Text>
                  </View>
                )}
                {healthSummary.criticalCount > 0 && (
                  <View className="flex-row items-center">
                    <View className="bg-red-500 h-2 rounded-full w-2 mr-1" />
                    <Text className="text-red-700 text-xs">
                      {healthSummary.criticalCount}
                    </Text>
                  </View>
                )}
              </View>
            )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
