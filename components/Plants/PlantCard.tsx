import React, { memo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { PlantCardData } from "../../types/plant";
import { useRouter } from "expo-router";
import CachedImage from "../CachedImage";

interface PlantCardProps {
  plant: PlantCardData;
}

const PlantCard: React.FC<PlantCardProps> = memo(({ plant }) => {
  const router = useRouter();

  // Debug the plant data
  console.log("Plant data in PlantCard:", JSON.stringify(plant, null, 2));

  // Ensure we have the required properties
  if (!plant || !plant.slug) {
    console.error("Invalid plant data:", plant);
    return (
      <View className="bg-white rounded-xl overflow-hidden shadow-sm h-[220px] w-[48%] mb-4">
        <View className="p-3 flex-1 justify-center items-center">
          <Text className="text-destructive">Invalid plant data</Text>
        </View>
      </View>
    );
  }

  const handlePress = () => {
    // Navigate to the plant detail screen using stack navigation
    router.push({
      pathname: "/(home)/plants/[slug]",
      params: {
        slug: plant.slug,
        title: plant.common_name || plant.scientific_name,
      },
    });
  };

  // Determine display name and sub name based on available data
  const displayName =
    plant.common_name || plant.scientific_name || "Unknown Plant";
  const subName =
    plant.common_name &&
    plant.scientific_name &&
    plant.common_name !== plant.scientific_name
      ? plant.scientific_name
      : "";

  return (
    <TouchableOpacity
      className="bg-white rounded-xl overflow-hidden shadow-sm h-[220px] w-[48%] mb-4"
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <CachedImage
        uri={plant.first_image || ""}
        style={{ width: "100%", height: 120 }}
        resizeMode="cover"
      />
      <View className="p-3 flex-1 justify-between">
        <View>
          <Text
            className="text-base font-bold mb-1 text-cream-800"
            numberOfLines={1}
          >
            {displayName}
          </Text>
          {subName ? (
            <Text
              className="text-xs italic text-cream-500 mb-2"
              numberOfLines={1}
            >
              {subName}
            </Text>
          ) : null}
        </View>
        {plant.first_tag && (
          <View className="bg-brand-100 px-2 py-1 rounded-xl self-start mt-auto">
            <Text className="text-xs text-brand-700 font-medium">
              {plant.first_tag}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});

PlantCard.displayName = "PlantCard";

export default PlantCard;
