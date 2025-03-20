import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Router } from "expo-router";
import type { UserPlant as BaseUserPlant } from "@/types/garden";

interface ExtendedUserPlant extends BaseUserPlant {
  planting_date?: string;
}

type GardenPlantsListProps = {
  plants?: ExtendedUserPlant[];
  onAddPlant: () => void;
  onPlantPress: (plant: ExtendedUserPlant) => void;
};

export default function GardenPlantsList({
  plants,
  onAddPlant,
  onPlantPress,
}: GardenPlantsListProps) {
  return (
    <View className="bg-white p-4 rounded-xl mb-4">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-foreground text-lg font-semibold">Plants</Text>
        <TouchableOpacity
          className="bg-brand-500 rounded-full px-3 py-1.5"
          onPress={onAddPlant}
        >
          <Text className="text-white font-medium">Add Plant</Text>
        </TouchableOpacity>
      </View>

      {plants && plants.length > 0 ? (
        <View>
          {plants.map((plant) => (
            <TouchableOpacity
              key={plant.id}
              className="flex-row border-b border-cream-200 items-center last:border-b-0 py-3"
              onPress={() => onPlantPress(plant)}
            >
              <View className="flex-1">
                <Text className="text-base text-foreground font-medium">
                  {plant.custom_name || plant.botanical_name}
                </Text>
                {plant.custom_name && (
                  <Text className="text-cream-500 text-sm">
                    {plant.botanical_name}
                  </Text>
                )}

                {plant.planting_date && (
                  <Text className="text-cream-400 text-xs mt-1">
                    Planted:{" "}
                    {new Date(plant.planting_date).toLocaleDateString()}
                  </Text>
                )}
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
          ))}
        </View>
      ) : (
        <View className="items-center py-8">
          <Ionicons
            name="leaf-outline"
            size={48}
            color="#9e9a90"
            className="mb-2"
          />
          <Text className="text-center text-cream-500">
            No plants added yet.{"\n"}Add your first plant to get started!
          </Text>
        </View>
      )}
    </View>
  );
}
