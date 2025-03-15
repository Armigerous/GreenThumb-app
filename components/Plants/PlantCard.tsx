import React, { memo } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { PlantCardData } from "../../types/plant";
import { useRouter } from "expo-router";

interface PlantCardProps {
  plant: PlantCardData;
}

const PlantCard: React.FC<PlantCardProps> = memo(({ plant }) => {
  const router = useRouter();

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

  return (
    <TouchableOpacity
      className="bg-white rounded-xl overflow-hidden mb-4 w-[48%] shadow-sm"
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Image
        source={{
          uri:
            plant.first_image ||
            "https://theofficialgreenthumb.com/no-plant-image.png",
        }}
        className="w-full h-[120px]"
        resizeMode="cover"
      />
      <View className="p-3">
        <Text
          className="text-base font-bold mb-1 text-gray-800"
          numberOfLines={1}
        >
          {plant.common_name || plant.scientific_name}
        </Text>
        <Text className="text-xs italic text-gray-500 mb-2" numberOfLines={1}>
          {plant.common_name ? plant.scientific_name : ""}
        </Text>
        {plant.first_tag && (
          <View className="bg-green-100 px-2 py-1 rounded-xl self-start">
            <Text className="text-xs text-green-700 font-medium">
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
