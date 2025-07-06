import React, { useRef } from "react";
import {
  View,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
  Animated,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { allFilters } from "@/types/filterData";
import { premadeFilters } from "@/types/premadeFilters";
import { TitleText, SubtitleText, BodyText } from "@/components/UI/Text";

// Define a type for Feather icon names
import type { ComponentProps } from "react";
type FeatherIconName = ComponentProps<typeof Feather>["name"];

interface QuickFilterTooltipProps {
  filter: (typeof premadeFilters)[0];
  visible: boolean;
  onClose: () => void;
  onApply: (filterId: string) => void;
}

/**
 * QuickFilterTooltip
 * Shows details about a quick filter, including grouped filter breakdowns and an apply button.
 */
const QuickFilterTooltip: React.FC<QuickFilterTooltipProps> = ({
  filter,
  visible,
  onClose,
  onApply,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.9,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, opacity, scale]);

  if (!visible) return null;

  // Group filters by section for better organization
  const groupedFilters: Record<
    string,
    {
      name: string;
      icon: FeatherIconName;
      filters: { value: string; categoryName: string }[];
    }
  > = {};

  filter.filters.forEach((filterKey) => {
    const [category, value] = filterKey.split("|");
    let categoryName = category;
    let categoryIcon: FeatherIconName = "filter";
    let sectionId = "";
    let sectionName = "Other";

    // Find the category and section information
    allFilters.forEach((section) => {
      section.categories.forEach((cat) => {
        if (cat.id === category) {
          categoryName = cat.name;
          categoryIcon = cat.icon;
          sectionId = section.id;
          sectionName = section.name;
        }
      });
    });

    if (!groupedFilters[sectionId]) {
      groupedFilters[sectionId] = {
        name: sectionName,
        icon: categoryIcon,
        filters: [],
      };
    }

    groupedFilters[sectionId].filters.push({
      value,
      categoryName,
    });
  });

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
        </TouchableWithoutFeedback>

        <Animated.View
          style={{
            opacity,
            transform: [{ scale }],
            width: "90%",
            maxWidth: 400,
            maxHeight: "80%",
            borderRadius: 12,
            overflow: "hidden",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <View className="bg-white rounded-lg overflow-hidden">
            {/* Header */}
            <View className="p-4 border-b border-cream-300/50 bg-brand-600/5">
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center flex-1">
                  <View className="bg-brand-600/10 p-2 rounded-full">
                    <Feather name={filter.icon} size={22} color="#555" />
                  </View>
                  <View className="ml-3 flex-1">
                    <TitleText className="font-bold text-lg text-gray-800">
                      {filter.name}
                    </TitleText>
                    <SubtitleText className="text-xs text-gray-500 mt-0.5">
                      Quick Filter
                    </SubtitleText>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  className="bg-cream-400/40 rounded-full p-2"
                  hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                >
                  <Feather name="x" size={18} color="#555" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Description */}
            <View className="px-4 py-3 bg-cream-400/10">
              <BodyText className="text-sm text-gray-600 leading-5">
                {filter.description}
              </BodyText>
            </View>

            {/* Filter Groups */}
            <ScrollView className="px-4 py-3" style={{ maxHeight: 300 }}>
              <TitleText className="text-xs font-bold mb-3 text-brand-600">
                Includes these filters:
              </TitleText>

              {Object.keys(groupedFilters).map((sectionId) => {
                const section = groupedFilters[sectionId];
                return (
                  <View key={sectionId} className="mb-4 last:mb-0">
                    <View className="flex-row items-center mb-2">
                      <Feather name={section.icon} size={16} color="#555" />
                      <BodyText className="text-sm font-semibold ml-2 text-gray-700">
                        {section.name}
                      </BodyText>
                    </View>
                    <View className="bg-cream-400/20 p-3 rounded-lg ml-2">
                      {section.filters.map((filter, idx) => (
                        <View
                          key={idx}
                          className="flex-row items-center mb-2 last:mb-0"
                        >
                          <View className="w-2 h-2 rounded-full bg-gray-400 mr-2" />
                          <BodyText className="text-xs flex-1 text-gray-700">
                            <BodyText className="font-medium">
                              {filter.categoryName}:
                            </BodyText>{" "}
                            {filter.value}
                          </BodyText>
                        </View>
                      ))}
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            {/* Apply Button */}
            <View className="flex-row p-4 gap-2 border-t border-cream-300/30">
              <TouchableOpacity
                className="flex-1 py-3 bg-cream-400/40 rounded-lg items-center"
                onPress={onClose}
              >
                <BodyText className="font-medium text-sm text-gray-700">
                  Cancel
                </BodyText>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-3 bg-brand-600 rounded-lg items-center"
                onPress={() => {
                  onClose();
                  onApply(filter.id);
                }}
              >
                <BodyText className="text-white font-semibold text-sm">
                  Apply
                </BodyText>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default QuickFilterTooltip;
