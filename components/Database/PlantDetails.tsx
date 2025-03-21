import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { PlantData } from "@/types/plant";

type PlantDetailsProps = {
  plantData: PlantData;
};

export default function PlantDetails({ plantData }: PlantDetailsProps) {
  return (
    <View className="space-y-4">
      {/* Scientific Name */}
      <View className="bg-purple-50 p-4 rounded-lg">
        <Text className="text-purple-700 font-medium mb-1">
          Scientific Name
        </Text>
        <Text className="text-purple-600 text-sm font-medium italic">
          {plantData.scientific_name}
        </Text>
        {plantData.common_names && plantData.common_names.length > 0 && (
          <Text className="text-purple-600 text-sm mt-1">
            Also known as: {plantData.common_names.join(", ")}
          </Text>
        )}
      </View>

      {/* Light Requirements */}
      {plantData.light_requirements && (
        <View className="bg-yellow-50 p-4 rounded-lg">
          <View className="flex-row items-center mb-1">
            <Ionicons name="sunny-outline" size={16} color="#d97706" />
            <Text className="text-yellow-700 font-medium ml-2">
              Light Requirements
            </Text>
          </View>
          <Text className="text-sm text-yellow-600">
            {plantData.light_requirements}
          </Text>
        </View>
      )}

      {/* Water Requirements */}
      {plantData.water_requirements && (
        <View className="bg-blue-50 p-4 rounded-lg">
          <View className="flex-row items-center mb-1">
            <Ionicons name="water-outline" size={16} color="#0891b2" />
            <Text className="text-blue-700 font-medium ml-2">
              Water Requirements
            </Text>
          </View>
          <Text className="text-blue-600 text-sm">
            {plantData.water_requirements}
          </Text>
        </View>
      )}

      {/* Size */}
      {(plantData.height_max || plantData.width_max) && (
        <View className="bg-green-50 p-4 rounded-lg">
          <View className="flex-row items-center mb-1">
            <Ionicons name="resize-outline" size={16} color="#059669" />
            <Text className="text-green-700 font-medium ml-2">
              Expected Size
            </Text>
          </View>
          <View className="space-y-1">
            {plantData.height_max && (
              <Text className="text-green-600 text-sm">
                Height: {plantData.height_min || 0} - {plantData.height_max}{" "}
                feet
              </Text>
            )}
            {plantData.width_max && (
              <Text className="text-green-600 text-sm">
                Width: {plantData.width_min || 0} - {plantData.width_max} feet
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Description */}
      {plantData.description && (
        <View className="bg-cream-50 p-4 rounded-lg">
          <Text className="text-cream-700 font-medium mb-1">About</Text>
          <Text className="text-cream-600 text-sm">
            {plantData.description}
          </Text>
        </View>
      )}

      {/* USDA Hardiness Zones */}
      {plantData.usda_hardiness_zones && (
        <View className="bg-orange-50 p-4 rounded-lg">
          <View className="flex-row items-center mb-1">
            <Ionicons name="thermometer-outline" size={16} color="#ea580c" />
            <Text className="text-orange-700 font-medium ml-2">
              USDA Hardiness Zones
            </Text>
          </View>
          <Text className="text-orange-600 text-sm">
            {plantData.usda_hardiness_zones}
          </Text>
        </View>
      )}
    </View>
  );
}
