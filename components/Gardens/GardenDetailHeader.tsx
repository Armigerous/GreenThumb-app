import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { format } from "date-fns";
import type { Garden } from "@/types/garden";

type GardenDetailHeaderProps = {
  garden: Garden;
  onEditPress: () => void;
  onAddPlant: () => void;
};

export default function GardenDetailHeader({
  garden,
  onEditPress,
  onAddPlant,
}: GardenDetailHeaderProps) {
  const router = useRouter();

  const getGardenStatus = () => {
    if (!garden.user_plants || garden.user_plants.length === 0) return null;

    const healthyCount = garden.user_plants.filter(
      (p) => p.status === "Healthy"
    ).length;
    const needsAttentionCount = garden.user_plants.filter(
      (p) => p.status === "Needs Water" || p.status === "Dormant"
    ).length;
    const criticalCount = garden.user_plants.filter(
      (p) => p.status === "Dead" || p.status === "Wilting"
    ).length;

    const plantsNeedingCare = needsAttentionCount + criticalCount;
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

  const gardenStatus = getGardenStatus();

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
        <View className="flex-row">
          <TouchableOpacity
            className="bg-brand-500 p-2 rounded-full mr-2"
            onPress={onAddPlant}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-cream-100 p-2 rounded-full"
            onPress={onEditPress}
          >
            <Ionicons name="create-outline" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      <Text className="text-2xl text-foreground font-bold mb-4">
        {garden.name}
      </Text>

      {gardenStatus ? (
        <View className="space-y-4">
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <View className="flex-row bg-brand-50 rounded-lg items-center px-3 py-1.5">
                <Ionicons name="leaf" size={16} color="#10b981" />
                <Text className="text-brand-600 text-sm font-medium ml-1">
                  {gardenStatus.totalPlants}{" "}
                  {gardenStatus.totalPlants === 1 ? "Plant" : "Plants"}
                </Text>
              </View>
            </View>

            {gardenStatus.plantsNeedingCare > 0 ? (
              <TouchableOpacity className="bg-yellow-100 rounded-lg px-3 py-1.5">
                <Text className="text-sm text-yellow-700 font-medium">
                  {gardenStatus.plantsNeedingCare} need
                  {gardenStatus.plantsNeedingCare === 1 ? "s" : ""} care
                </Text>
              </TouchableOpacity>
            ) : (
              <View className="bg-green-100 rounded-lg px-3 py-1.5">
                <Text className="text-green-700 text-sm font-medium">
                  All plants healthy
                </Text>
              </View>
            )}
          </View>

          <View className="bg-cream-50 p-3 rounded-lg">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-cream-700 font-medium">Garden Health</Text>
              <Text className="text-cream-600 text-sm">
                {gardenStatus.healthPercentage}% Healthy
              </Text>
            </View>
            <View className="bg-cream-200 h-2 rounded-full overflow-hidden">
              <View
                className="bg-brand-500 h-full rounded-full"
                style={{ width: `${gardenStatus.healthPercentage}%` }}
              />
            </View>
          </View>
        </View>
      ) : (
        <View className="bg-cream-50 p-4 rounded-lg">
          <Text className="text-center text-cream-600 mb-3">
            Get started by adding your first plant
          </Text>
          <TouchableOpacity
            onPress={onAddPlant}
            className="bg-brand-500 rounded-full items-center py-2"
          >
            <Text className="text-white font-medium">Add Plant</Text>
          </TouchableOpacity>
        </View>
      )}

      <View className="bg-cream-100 h-px mt-4" />
    </View>
  );
}
