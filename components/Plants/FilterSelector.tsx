import React from "react";
import { ScrollView, TouchableOpacity, Text } from "react-native";

interface FilterSelectorProps {
  filters: string[];
  activeFilter: string;
  onSelectFilter: (filter: string) => void;
}

const FilterSelector: React.FC<FilterSelectorProps> = ({
  filters,
  activeFilter,
  onSelectFilter,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mb-4"
      contentContainerStyle={{ paddingRight: 16 }}
    >
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter}
          className={`px-4 py-2 mr-2 rounded-full ${
            activeFilter === filter ? "bg-brand-600" : "bg-cream-100"
          }`}
          onPress={() => onSelectFilter(filter)}
        >
          <Text
            className={`text-sm font-medium ${
              activeFilter === filter ? "text-white" : "text-cream-600"
            }`}
          >
            {filter}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default FilterSelector;
