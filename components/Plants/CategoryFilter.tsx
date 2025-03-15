import React from "react";
import { ScrollView, TouchableOpacity, Text } from "react-native";

interface CategoryFilterProps {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mb-4"
      contentContainerStyle={{ paddingRight: 16 }}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category}
          className={`px-4 py-2 mr-2 rounded-full ${
            activeCategory === category ? "bg-brand-600" : "bg-gray-100"
          }`}
          onPress={() => onSelectCategory(category)}
        >
          <Text
            className={`text-sm font-medium ${
              activeCategory === category ? "text-white" : "text-gray-600"
            }`}
          >
            {category}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default CategoryFilter;
