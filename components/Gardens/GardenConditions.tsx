import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Garden } from "@/types/garden";

type GardenConditionsProps = {
  garden: Garden;
  onEditPress: () => void;
};

export default function GardenConditions({
  garden,
  onEditPress,
}: GardenConditionsProps) {
  const hasConditions = Boolean(
    (garden.sunlight && garden.sunlight.length > 0) ||
      (garden.soil_texture && garden.soil_texture.length > 0) ||
      (garden.soil_ph && garden.soil_ph.length > 0) ||
      (garden.soil_drainage && garden.soil_drainage.length > 0)
  );

  const getPlantingRecommendations = () => {
    const recommendations = [];

    if (garden.sunlight && garden.sunlight.length > 0) {
      recommendations.push(
        `Best for ${garden.sunlight.join(" or ")} conditions`
      );
    }

    if (garden.soil_drainage && garden.soil_drainage.length > 0) {
      recommendations.push(
        `Suitable for ${garden.soil_drainage.join(" to ")} drainage`
      );
    }

    return recommendations;
  };

  const recommendations = getPlantingRecommendations();

  return (
    <View className="bg-white p-4 rounded-xl mb-8">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-foreground text-lg font-semibold">
          Growing Conditions
        </Text>
        <TouchableOpacity
          onPress={onEditPress}
          className="bg-cream-50 p-2 rounded-full"
        >
          <Ionicons name="create-outline" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {hasConditions ? (
        <View className="space-y-4">
          {recommendations.length > 0 && (
            <View className="bg-brand-50 p-3 rounded-lg">
              <Text className="text-brand-700 font-medium mb-1">
                Planting Tips
              </Text>
              {recommendations.map((tip, index) => (
                <View key={index} className="flex-row items-center mt-1">
                  <View className="bg-brand-500 h-2 rounded-full w-2 mr-2" />
                  <Text className="text-brand-600 text-sm">{tip}</Text>
                </View>
              ))}
            </View>
          )}

          {garden.soil_ph && garden.soil_ph.length > 0 && (
            <View className="bg-purple-50 p-3 rounded-lg">
              <Text className="text-purple-700 font-medium mb-1">
                Soil pH Range
              </Text>
              <Text className="text-purple-600 text-sm">
                Best suited for plants that prefer {garden.soil_ph.join(" to ")}{" "}
                soil
              </Text>
            </View>
          )}

          {garden.soil_texture && garden.soil_texture.length > 0 && (
            <View className="bg-amber-50 p-3 rounded-lg">
              <Text className="text-amber-700 font-medium mb-1">Soil Type</Text>
              <Text className="text-amber-600 text-sm">
                {garden.soil_texture.join(", ")} soil composition
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View className="items-center py-6">
          <Ionicons
            name="leaf-outline"
            size={40}
            color="#9e9a90"
            className="mb-2"
          />
          <Text className="text-center text-cream-500 mb-4">
            Set your garden conditions to get personalized plant recommendations
          </Text>
          <TouchableOpacity
            onPress={onEditPress}
            className="flex-row bg-brand-500 rounded-full items-center px-4 py-2"
          >
            <Ionicons name="create-outline" size={18} color="white" />
            <Text className="text-white font-medium ml-2">Set Conditions</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
