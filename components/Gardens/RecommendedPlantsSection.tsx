import React from "react";
import { View, TouchableOpacity, FlatList, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { PlantCardData } from "@/types/plant";
import SubmitButton from "../UI/SubmitButton";
import { TitleText, BodyText } from "../UI/Text";

interface RecommendedPlantsSectionProps {
  recommendedPlants: PlantCardData[];
  onAddRecommended: (plant: PlantCardData) => void;
  onPlantPress: (plant: PlantCardData) => void;
}

/**
 * RecommendedPlantsSection
 * Vertically scrollable list of recommended plants.
 * Each card shows plant image, common/scientific names, and an 'Add' button.
 * Card is clickable for navigation; Add is a secondary action.
 * // Reason: Full-tab immersive recommendations, consistent with plant card design.
 */
const RecommendedPlantsSection: React.FC<RecommendedPlantsSectionProps> = ({
  recommendedPlants,
  onAddRecommended,
  onPlantPress,
}) => {
  if (!recommendedPlants || recommendedPlants.length === 0) {
    // Placeholder for empty state
    return (
      <View className="mt-6 mb-2">
        <TitleText className="mb-3">Recommended for You</TitleText>
        <BodyText className="text-base text-neutral-400 mb-2">
          No recommendations yet. Check back soon!
        </BodyText>
      </View>
    );
  }

  // Render a single recommended plant card
  const renderPlant = ({ item }: { item: PlantCardData }) => (
    <TouchableOpacity
      className="flex-row items-center bg-white rounded-2xl p-3.5 mb-3.5 shadow-sm"
      onPress={() => onPlantPress(item)}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`View details for ${
        item.common_name || item.scientific_name
      }`}
    >
      {/* Plant Image */}
      {item.first_image ? (
        <Image
          source={{ uri: item.first_image }}
          className="w-14 h-14 rounded-full mr-3.5"
        />
      ) : (
        <View className="w-14 h-14 rounded-full bg-neutral-100 items-center justify-center mr-3.5">
          <Ionicons name="leaf-outline" size={28} color="#9e9a90" />
        </View>
      )}
      {/* Plant Info */}
      <View className="flex-1 justify-center">
        <BodyText
          className="text-base text-neutral-900 font-bold mb-0.5"
          numberOfLines={1}
        >
          {item.common_name || "Unknown Plant"}
        </BodyText>
        <BodyText className="text-xs text-neutral-400" numberOfLines={1}>
          {item.scientific_name}
        </BodyText>
      </View>
      {/* Add Button */}
      {/* Reason: Use SubmitButton for design consistency with Add to Garden button on plant detail screen */}
      <View
        onStartShouldSetResponder={(e) => {
          e.stopPropagation();
          return false;
        }}
        accessibilityLabel={`Add ${
          item.common_name || item.scientific_name
        } to your garden`}
        accessibilityRole="button"
      >
        <SubmitButton
          onPress={() => onAddRecommended(item)}
          iconName="add-circle-outline"
          iconPosition="left"
          color="primary"
          size="md"
          width="auto"
          className="ml-2"
        >
          Add
        </SubmitButton>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="mt-6 mb-2 flex-1">
      <TitleText className="mb-3">Recommended for You</TitleText>
      <FlatList
        data={recommendedPlants}
        renderItem={renderPlant}
        keyExtractor={(item) => item.slug}
        className="pb-8"
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default RecommendedPlantsSection;
