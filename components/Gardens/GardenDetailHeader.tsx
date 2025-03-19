import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { format } from "date-fns";

type GardenDetailHeaderProps = {
  garden: {
    id: number;
    name: string;
    nc_regions?: string[];
    created_at?: string;
    plants?: any[];
  };
  onEditPress: () => void;
  onAddPlant?: () => void;
};

export default function GardenDetailHeader({
  garden,
  onEditPress,
  onAddPlant,
}: GardenDetailHeaderProps) {
  const router = useRouter();

  // Get plant health stats
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
  const regionName =
    garden.nc_regions && garden.nc_regions.length > 0
      ? garden.nc_regions[0]
      : null;
  const createdDate = garden.created_at ? new Date(garden.created_at) : null;

  return (
    <View className="pt-5 px-5">
      <View className="flex-row justify-between items-center mb-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center"
        >
          <Ionicons name="arrow-back" size={24} color="#2e2c29" />
          <Text className="text-foreground text-lg font-medium ml-2">Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-row bg-cream-100 border border-brand-500 rounded-full items-center px-3 py-2"
          onPress={onEditPress}
        >
          <Ionicons name="pencil" size={16} color="#5E994B" />
          <Text className="text-brand-600 font-medium ml-1">Edit Garden</Text>
        </TouchableOpacity>
      </View>

      <View className="mb-6">
        <Text className="text-3xl text-foreground font-bold mb-2">
          {garden.name}
        </Text>

        <View className="flex-row items-center mb-3">
          {regionName && (
            <View className="flex-row bg-cream-100 rounded-full items-center mr-2 px-3 py-1">
              <Ionicons name="location-outline" size={14} color="#78350f" />
              <Text className="text-cream-800 text-sm ml-1">{regionName}</Text>
            </View>
          )}
          {createdDate && (
            <Text className="text-cream-500 text-sm">
              Created {format(createdDate, "MMM d, yyyy")}
            </Text>
          )}
        </View>
      </View>

      {/* Garden Overview Card */}
      {garden.plants && garden.plants.length > 0 ? (
        <View className="bg-white p-4 rounded-xl shadow-sm mb-5">
          <Text className="text-foreground text-lg font-semibold mb-3">
            Garden Overview
          </Text>

          <View className="flex-row justify-between mb-3">
            <View className="items-center">
              <Text className="text-2xl text-brand-600 font-bold">
                {garden.plants.length}
              </Text>
              <Text className="text-cream-600 text-sm">Total Plants</Text>
            </View>

            {healthSummary && (
              <>
                <View className="items-center">
                  <Text className="text-2xl text-green-600 font-bold">
                    {healthSummary.healthyCount}
                  </Text>
                  <Text className="text-cream-600 text-sm">Healthy</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl text-yellow-600 font-bold">
                    {healthSummary.needsAttentionCount}
                  </Text>
                  <Text className="text-cream-600 text-sm">Needs Care</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl text-red-600 font-bold">
                    {healthSummary.criticalCount}
                  </Text>
                  <Text className="text-cream-600 text-sm">Critical</Text>
                </View>
              </>
            )}
          </View>

          {healthSummary && (
            <View className="bg-cream-200 h-4 rounded-full w-full overflow-hidden">
              <View className="flex-row h-full">
                {healthSummary.healthyCount > 0 && (
                  <View
                    className="bg-green-500 h-full"
                    style={{
                      width: `${
                        (healthSummary.healthyCount / garden.plants.length) *
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
                        (healthSummary.criticalCount / garden.plants.length) *
                        100
                      }%`,
                    }}
                  />
                )}
              </View>
            </View>
          )}

          {healthSummary && healthSummary.criticalCount > 0 && (
            <View className="bg-red-50 border border-red-200 p-3 rounded-lg mt-4">
              <View className="flex-row items-center">
                <Ionicons name="alert-circle" size={18} color="#b91c1c" />
                <Text className="text-red-700 text-sm font-medium ml-2">
                  {healthSummary.criticalCount}{" "}
                  {healthSummary.criticalCount === 1
                    ? "plant requires"
                    : "plants require"}{" "}
                  urgent attention
                </Text>
              </View>
            </View>
          )}
        </View>
      ) : (
        <View className="bg-white justify-center p-5 rounded-xl shadow-sm items-center mb-5">
          <Ionicons
            name="leaf-outline"
            size={48}
            color="#9e9a90"
            className="mb-2"
          />
          <Text className="text-foreground text-lg font-medium mb-1">
            No Plants Yet
          </Text>
          <Text className="text-center text-cream-600">
            Add your first plant to start tracking your garden's health
          </Text>
          <TouchableOpacity
            className="bg-brand-500 rounded-full mt-4 px-4 py-2"
            onPress={onAddPlant}
          >
            <Text className="text-white font-medium">Add First Plant</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
