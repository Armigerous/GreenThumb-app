import { Text, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { format } from "date-fns";

type GardenCardProps = {
  garden: {
    id: number;
    name: string;
    nc_regions?: string[];
    created_at?: string;
    plants?: any[];
  };
};

export default function GardenCard({ garden }: GardenCardProps) {
  const router = useRouter();

  const getPlantHealthSummary = () => {
    if (!garden.plants || garden.plants.length === 0) return null;

    const healthyCount = garden.plants.filter(
      (p) => p.status === "healthy"
    ).length;
    const needsAttentionCount = garden.plants.filter(
      (p) => p.status === "needs_attention"
    ).length;
    const criticalCount = garden.plants.filter(
      (p) => p.status === "critical"
    ).length;

    return { healthyCount, needsAttentionCount, criticalCount };
  };

  const healthSummary = getPlantHealthSummary();
  const createdDate = garden.created_at ? new Date(garden.created_at) : null;

  // Get the region display name
  const regionName =
    garden.nc_regions && garden.nc_regions.length > 0
      ? garden.nc_regions[0]
      : "Unknown Region";

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
        <Text className="text-foreground text-xl font-bold mb-1">
          {garden.name}
        </Text>

        {regionName && (
          <View className="flex-row items-center mb-3">
            <Ionicons name="location-outline" size={14} color="#78350f" />
            <Text className="text-cream-700 text-sm ml-1">{regionName}</Text>
            {createdDate && (
              <Text className="text-cream-500 text-xs ml-auto">
                Created {format(createdDate, "MMM d, yyyy")}
              </Text>
            )}
          </View>
        )}

        <View className="bg-brand-50 p-3 rounded-lg mb-3">
          {garden.plants && garden.plants.length > 0 ? (
            <View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-brand-900 font-medium">
                  Plant Health Status
                </Text>
                <Text className="text-brand-600 font-medium">
                  {garden.plants.length} Plants
                </Text>
              </View>

              <View className="bg-cream-200 h-2 rounded-full w-full overflow-hidden">
                {healthSummary && (
                  <View className="flex-row h-full">
                    {healthSummary.healthyCount > 0 && (
                      <View
                        className="bg-brand-500 h-full"
                        style={{
                          width: `${
                            (healthSummary.healthyCount /
                              garden.plants.length) *
                            100
                          }%`,
                        }}
                      />
                    )}
                    {healthSummary.needsAttentionCount > 0 && (
                      <View
                        className="bg-yellow-500 h-full"
                        style={{
                          width: `${
                            (healthSummary.needsAttentionCount /
                              garden.plants.length) *
                            100
                          }%`,
                        }}
                      />
                    )}
                    {healthSummary.criticalCount > 0 && (
                      <View
                        className="bg-red-500 h-full"
                        style={{
                          width: `${
                            (healthSummary.criticalCount /
                              garden.plants.length) *
                            100
                          }%`,
                        }}
                      />
                    )}
                  </View>
                )}
              </View>

              <View className="flex-row justify-between mt-2">
                <View className="flex-row items-center">
                  <View className="bg-brand-500 h-3 rounded-full w-3 mr-1" />
                  <Text className="text-brand-700 text-xs">
                    {healthSummary?.healthyCount || 0} Healthy
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <View className="bg-yellow-500 h-3 rounded-full w-3 mr-1" />
                  <Text className="text-xs text-yellow-700">
                    {healthSummary?.needsAttentionCount || 0} Needs Care
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <View className="bg-red-500 h-3 rounded-full w-3 mr-1" />
                  <Text className="text-red-700 text-xs">
                    {healthSummary?.criticalCount || 0} Critical
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View className="items-center py-1">
              <Text className="text-cream-700 text-sm">
                No plants added yet
              </Text>
            </View>
          )}
        </View>

        {healthSummary && healthSummary.criticalCount > 0 && (
          <View className="bg-red-50 border border-red-200 p-3 rounded-lg mb-1">
            <View className="flex-row items-center">
              <Ionicons name="alert-circle" size={18} color="#b91c1c" />
              <Text className="text-red-700 text-sm font-medium ml-1">
                {healthSummary.criticalCount}{" "}
                {healthSummary.criticalCount === 1
                  ? "plant needs"
                  : "plants need"}{" "}
                urgent attention
              </Text>
            </View>
          </View>
        )}

        {healthSummary &&
          healthSummary.needsAttentionCount > 0 &&
          healthSummary.criticalCount === 0 && (
            <View className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-1">
              <View className="flex-row items-center">
                <Ionicons name="water" size={18} color="#b45309" />
                <Text className="text-sm text-yellow-700 font-medium ml-1">
                  {healthSummary.needsAttentionCount}{" "}
                  {healthSummary.needsAttentionCount === 1
                    ? "plant needs"
                    : "plants need"}{" "}
                  care soon
                </Text>
              </View>
            </View>
          )}

        {healthSummary &&
          healthSummary.healthyCount === garden.plants?.length &&
          garden.plants?.length > 0 && (
            <View className="bg-green-50 border border-green-200 p-3 rounded-lg mb-1">
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                <Text className="text-green-700 text-sm font-medium ml-1">
                  All plants healthy
                </Text>
              </View>
            </View>
          )}
      </View>
    </TouchableOpacity>
  );
}
