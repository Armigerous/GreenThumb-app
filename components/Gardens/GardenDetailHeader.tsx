import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type GardenDetailHeaderProps = {
  garden: {
    id: number;
    name: string;
    nc_regions_ids?: string | string[];
    sunlight_ids?: string | string[];
    user_plants?: any[];
  };
  onEditPress: () => void;
};

export default function GardenDetailHeader({
  garden,
  onEditPress,
}: GardenDetailHeaderProps) {
  const router = useRouter();

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
          className="bg-brand-500 p-2 rounded-full"
          onPress={onEditPress}
        >
          <Ionicons name="create-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <Text className="text-2xl text-foreground font-bold mb-4">
        {garden.name}
      </Text>

      <View className="flex-row flex-wrap gap-2 mb-4">
        {garden.nc_regions_ids && (
          <View className="flex-row bg-cream-100 rounded items-center px-3 py-1.5">
            <Ionicons
              name="location-outline"
              size={14}
              color="#78350f"
              className="mr-1"
            />
            <Text className="text-cream-800 text-sm">
              {Array.isArray(garden.nc_regions_ids)
                ? garden.nc_regions_ids.join(", ")
                : garden.nc_regions_ids}
            </Text>
          </View>
        )}
        {garden.sunlight_ids && (
          <View className="flex-row bg-yellow-100 rounded items-center px-3 py-1.5">
            <Ionicons
              name="sunny-outline"
              size={14}
              color="#b45309"
              className="mr-1"
            />
            <Text className="text-sm text-yellow-800">
              {Array.isArray(garden.sunlight_ids)
                ? garden.sunlight_ids.join(", ")
                : garden.sunlight_ids}
            </Text>
          </View>
        )}
      </View>

      {garden.user_plants && garden.user_plants.length > 0 && (
        <View className="flex-row mb-4">
          <View className="flex-row bg-brand-50 rounded items-center px-3 py-1.5">
            <Ionicons name="leaf" size={16} color="#10b981" />
            <Text className="text-brand-600 text-sm font-medium ml-1">
              {garden.user_plants.length}{" "}
              {garden.user_plants.length === 1 ? "Plant" : "Plants"}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
