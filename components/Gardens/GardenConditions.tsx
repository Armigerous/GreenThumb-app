import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type GardenConditionsProps = {
  garden: {
    soil_texture_ids?: string | string[];
    soil_ph_ids?: string | string[];
    soil_drainage_ids?: string | string[];
    sunlight_ids?: string | string[];
  };
};

export default function GardenConditions({ garden }: GardenConditionsProps) {
  return (
    <View className="bg-white p-4 rounded-xl mb-8">
      <Text className="text-foreground text-lg font-semibold mb-4">
        Garden Conditions
      </Text>

      <View className="space-y-4">
        {garden.sunlight_ids && (
          <View className="flex-row">
            <View className="w-10 items-center">
              <Ionicons name="sunny" size={24} color="#f59e0b" />
            </View>
            <View className="flex-1">
              <Text className="text-cream-600 text-sm font-medium mb-1">
                Sunlight
              </Text>
              <Text className="text-base text-foreground">
                {Array.isArray(garden.sunlight_ids)
                  ? garden.sunlight_ids.join(", ")
                  : garden.sunlight_ids}
              </Text>
            </View>
          </View>
        )}

        {garden.soil_texture_ids && (
          <View className="flex-row">
            <View className="w-10 items-center">
              <Ionicons name="layers" size={24} color="#78350f" />
            </View>
            <View className="flex-1">
              <Text className="text-cream-600 text-sm font-medium mb-1">
                Soil Texture
              </Text>
              <Text className="text-base text-foreground">
                {Array.isArray(garden.soil_texture_ids)
                  ? garden.soil_texture_ids.join(", ")
                  : garden.soil_texture_ids}
              </Text>
            </View>
          </View>
        )}

        {garden.soil_ph_ids && (
          <View className="flex-row">
            <View className="w-10 items-center">
              <Ionicons name="flask" size={24} color="#7c3aed" />
            </View>
            <View className="flex-1">
              <Text className="text-cream-600 text-sm font-medium mb-1">
                Soil pH
              </Text>
              <Text className="text-base text-foreground">
                {Array.isArray(garden.soil_ph_ids)
                  ? garden.soil_ph_ids.join(", ")
                  : garden.soil_ph_ids}
              </Text>
            </View>
          </View>
        )}

        {garden.soil_drainage_ids && (
          <View className="flex-row">
            <View className="w-10 items-center">
              <Ionicons name="water" size={24} color="#0ea5e9" />
            </View>
            <View className="flex-1">
              <Text className="text-cream-600 text-sm font-medium mb-1">
                Soil Drainage
              </Text>
              <Text className="text-base text-foreground">
                {Array.isArray(garden.soil_drainage_ids)
                  ? garden.soil_drainage_ids.join(", ")
                  : garden.soil_drainage_ids}
              </Text>
            </View>
          </View>
        )}

        {!garden.soil_texture_ids &&
          !garden.soil_ph_ids &&
          !garden.soil_drainage_ids &&
          !garden.sunlight_ids && (
            <View className="items-center py-6">
              <Ionicons
                name="settings-outline"
                size={40}
                color="#9e9a90"
                className="mb-2"
              />
              <Text className="text-center text-cream-500">
                No garden conditions set.{"\n"}Add conditions to optimize your
                plant recommendations.
              </Text>
            </View>
          )}
      </View>
    </View>
  );
}
