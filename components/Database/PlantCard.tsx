import React, { memo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { PlantCardData } from "../../types/plant";
import { useRouter } from "expo-router";
import CachedImage from "../CachedImage";

interface PlantCardProps {
  plant: PlantCardData;
  /**
   * Determines how to display plant names in the card
   * - 'scientific': Scientific name as title, common name as subtitle
   * - 'common': Common name as title, scientific name as subtitle
   */
  displayMode?: "scientific" | "common";
}

const PlantCard: React.FC<PlantCardProps> = memo(
  ({ plant, displayMode = "scientific" }) => {
    const router = useRouter();

    // Ensure we have the required properties
    if (!plant || !plant.slug) {
      console.error("Invalid plant data:", plant);
      return (
        <View className="bg-white border border-cream-300 rounded-xl overflow-hidden shadow-sm h-[220px] w-[48%] mb-4">
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
          // In common name mode, use the scientific_slug (which is the original slug)
          slug:
            displayMode === "common"
              ? plant.scientific_slug || plant.slug
              : plant.slug,
          title: displayName,
        },
      });
    };

    // Determine display name and sub name based on display mode and available data
    let displayName: string;
    let subName: string = "";

    if (displayMode === "common") {
      // Common name display mode: common name as title, scientific name as subtitle
      displayName =
        plant.common_name || plant.scientific_name || "Unknown Plant";
      // Only show scientific name as subtitle if it exists and is different from display name
      if (plant.scientific_name && displayName !== plant.scientific_name) {
        subName = plant.scientific_name;
      }
    } else {
      // Scientific name display mode: scientific name as title, common name as subtitle
      displayName = plant.scientific_name || "Unknown Plant";
      // Only show common name as subtitle if it exists
      if (plant.common_name) {
        subName = plant.common_name;
      }
    }

    return (
      <TouchableOpacity
        className="bg-white rounded-xl overflow-hidden h-[220px] w-[48%] mb-4"
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <CachedImage
          uri={plant.first_image || ""}
          style={{ width: "100%", height: 120 }}
          resizeMode="cover"
          cacheKey={`plant-card-${plant.slug}-image`}
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
  }
);

PlantCard.displayName = "PlantCard";

export default PlantCard;
