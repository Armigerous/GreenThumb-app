import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useGardenDetails } from "@/lib/queries";
import { ActivityIndicator } from "react-native";
import type { UserPlant } from "@/types/garden";

const GardenDetails = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { data: garden, isLoading, error } = useGardenDetails(Number(id));

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#5E994B" />
      </SafeAreaView>
    );
  }

  if (error || !garden) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="px-5 pt-5">
          <Text className="text-lg text-destructive">
            Error loading garden details. Please try again.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-5 pt-5 flex-row justify-between items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center"
        >
          <Ionicons name="arrow-back" size={24} color="#2e2c29" />
          <Text className="text-lg font-medium text-foreground ml-2">Back</Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-brand-500 p-2 rounded-full">
          <Ionicons name="create-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-5 pt-4">
        <Text className="text-2xl font-bold text-foreground mb-4">
          {garden.name}
        </Text>

        <View className="flex-row flex-wrap gap-2 mb-4">
          {garden.nc_regions_ids && (
            <View className="bg-cream-100 px-3 py-1.5 rounded">
              <Text className="text-sm text-cream-800">
                {Array.isArray(garden.nc_regions_ids)
                  ? garden.nc_regions_ids.join(", ")
                  : garden.nc_regions_ids}
              </Text>
            </View>
          )}
          {garden.sunlight_ids && (
            <View className="bg-cream-100 px-3 py-1.5 rounded">
              <Text className="text-sm text-cream-800">
                {Array.isArray(garden.sunlight_ids)
                  ? garden.sunlight_ids.join(", ")
                  : garden.sunlight_ids}
              </Text>
            </View>
          )}
        </View>

        <View className="bg-white rounded-xl p-4 mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-lg font-semibold text-foreground">
              Plants
            </Text>
            <TouchableOpacity className="bg-brand-500 px-3 py-1.5 rounded-full">
              <Text className="text-white font-medium">Add Plant</Text>
            </TouchableOpacity>
          </View>

          {garden.user_plants && garden.user_plants.length > 0 ? (
            garden.user_plants.map((plant: UserPlant) => (
              <TouchableOpacity
                key={plant.id}
                className="flex-row items-center py-3 border-b border-cream-200 last:border-b-0"
              >
                <View className="flex-1">
                  <Text className="text-base font-medium text-foreground">
                    {plant.custom_name}
                  </Text>
                  <Text className="text-sm text-cream-500">
                    {plant.botanical_name}
                  </Text>
                </View>
                <View
                  className={`px-2 py-1 rounded ${
                    plant.status === "healthy"
                      ? "bg-brand-100"
                      : plant.status === "needs_attention"
                      ? "bg-yellow-100"
                      : "bg-red-100"
                  }`}
                >
                  <Text
                    className={`text-xs font-medium ${
                      plant.status === "healthy"
                        ? "text-brand-700"
                        : plant.status === "needs_attention"
                        ? "text-yellow-700"
                        : "text-red-700"
                    }`}
                  >
                    {plant.status === "healthy"
                      ? "Healthy"
                      : plant.status === "needs_attention"
                      ? "Needs Attention"
                      : "Critical"}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="py-8 items-center">
              <Ionicons
                name="leaf-outline"
                size={48}
                color="#9e9a90"
                className="mb-2"
              />
              <Text className="text-cream-500 text-center">
                No plants added yet.{"\n"}Add your first plant to get started!
              </Text>
            </View>
          )}
        </View>

        <View className="bg-white rounded-xl p-4 mb-8">
          <Text className="text-lg font-semibold text-foreground mb-2">
            Garden Conditions
          </Text>

          {garden.soil_texture_ids && (
            <View className="mb-4">
              <Text className="text-sm font-medium text-cream-600 mb-1">
                Soil Texture
              </Text>
              <Text className="text-base text-foreground">
                {Array.isArray(garden.soil_texture_ids)
                  ? garden.soil_texture_ids.join(", ")
                  : garden.soil_texture_ids}
              </Text>
            </View>
          )}

          {garden.soil_ph_ids && (
            <View className="mb-4">
              <Text className="text-sm font-medium text-cream-600 mb-1">
                Soil pH
              </Text>
              <Text className="text-base text-foreground">
                {Array.isArray(garden.soil_ph_ids)
                  ? garden.soil_ph_ids.join(", ")
                  : garden.soil_ph_ids}
              </Text>
            </View>
          )}

          {garden.soil_drainage_ids && (
            <View>
              <Text className="text-sm font-medium text-cream-600 mb-1">
                Soil Drainage
              </Text>
              <Text className="text-base text-foreground">
                {Array.isArray(garden.soil_drainage_ids)
                  ? garden.soil_drainage_ids.join(", ")
                  : garden.soil_drainage_ids}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default GardenDetails;
