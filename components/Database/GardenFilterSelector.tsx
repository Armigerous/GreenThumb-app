import React from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BodyText } from "@/components/UI/Text";
import { GardenFilterOption } from "@/lib/hooks/useGardenFilters";

interface GardenFilterSelectorProps {
  gardenFilterOptions: GardenFilterOption[];
  activeGardenFilter: string | null;
  onSelectGardenFilter: (gardenId: string | null) => void;
}

const GardenFilterSelector: React.FC<GardenFilterSelectorProps> = ({
  gardenFilterOptions,
  activeGardenFilter,
  onSelectGardenFilter,
}) => {
  if (gardenFilterOptions.length === 0) {
    return null;
  }

  return (
    <View className="mb-4">
      <BodyText className="text-sm font-medium text-cream-700 mb-2">
        Filter by your gardens:
      </BodyText>
      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row"
        contentContainerStyle={{ paddingHorizontal: 2 }}
      >
        {/* Clear filters option */}
        <TouchableOpacity
          className={`flex-row items-center px-3 py-2 rounded-lg mr-2 ${
            activeGardenFilter === null
              ? "bg-cream-200 border border-cream-300"
              : "bg-cream-50 border border-cream-200"
          }`}
          onPress={() => onSelectGardenFilter(null)}
        >
          <Feather 
            name="x-circle" 
            size={14} 
            color={activeGardenFilter === null ? "#7c2d12" : "#a3a3a3"}
          />
          <BodyText 
            className={`ml-2 text-sm ${
              activeGardenFilter === null 
                ? "text-cream-800 font-medium" 
                : "text-cream-600"
            }`}
          >
            All Plants
          </BodyText>
        </TouchableOpacity>

        {/* Garden filter options */}
        {gardenFilterOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            className={`flex-row items-center px-3 py-2 rounded-lg mr-2 ${
              activeGardenFilter === option.id
                ? "bg-brand-100 border border-brand-300"
                : "bg-cream-50 border border-cream-200"
            }`}
            onPress={() => onSelectGardenFilter(option.id)}
          >
            <Feather 
              name="home" 
              size={14} 
              color={activeGardenFilter === option.id ? "#5E994B" : "#a3a3a3"}
            />
            <BodyText 
              className={`ml-2 text-sm ${
                activeGardenFilter === option.id 
                  ? "text-brand-700 font-medium" 
                  : "text-cream-600"
              }`}
            >
              {option.name}
            </BodyText>
            {option.isDefault && (
              <View className="ml-2 px-2 py-0.5 bg-brand-600/20 rounded-full">
                <BodyText className="text-xs text-brand-600 font-medium">
                  Auto
                </BodyText>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default GardenFilterSelector;