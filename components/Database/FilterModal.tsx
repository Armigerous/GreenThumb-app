import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Platform,
  Animated,
  TouchableWithoutFeedback,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { allFilters } from "@/types/filterData";
import { premadeFilters } from "@/types/premadeFilters";
import AnimatedProgressBar from "../UI/AnimatedProgressBar";
import { TitleText, SubtitleText, BodyText } from "@/components/UI/Text";

// Define a type for Feather icon names
type FeatherIconName = React.ComponentProps<typeof Feather>["name"];

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  selectedOptions: { [key: string]: boolean };
  onApplyFilters: (selectedOptions: { [key: string]: boolean }) => void;
}

// QuickFilterTooltip component
interface QuickFilterTooltipProps {
  filter: (typeof premadeFilters)[0];
  visible: boolean;
  onClose: () => void;
  onApply: (filterId: string) => void;
}

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

export default function FilterModal({
  visible,
  onClose,
  selectedOptions: initialSelectedOptions,
  onApplyFilters,
}: FilterModalProps) {
  const [selectedOptions, setSelectedOptions] = useState<{
    [key: string]: boolean;
  }>(initialSelectedOptions || {});
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({});
  const [expandedCategories, setExpandedCategories] = useState<{
    [key: string]: boolean;
  }>({});
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(
    null
  );
  const [showQuickFilterDetails, setShowQuickFilterDetails] = useState(false);
  const [tooltipFilter, setTooltipFilter] = useState<string | null>(null);

  // Toggle section expansion
  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  }, []);

  // Toggle category expansion
  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  }, []);

  // Toggle option selection
  const toggleOption = useCallback((key: string, checked: boolean) => {
    setSelectedOptions((prev) => ({ ...prev, [key]: checked }));
  }, []);

  // Apply premade filter
  const applyPremadeFilter = useCallback(
    (filterId: string, filters: string[]) => {
      // Reset existing filters
      const newFilters: { [key: string]: boolean } = {};
      filters.forEach((filter) => {
        newFilters[filter] = true;
      });
      setSelectedOptions(newFilters);
      setActiveQuickFilter(filterId);

      // Auto-expand relevant sections based on the applied filters
      const relevantSections = new Set<string>();
      filters.forEach((filter) => {
        const categoryId = filter.split("|")[0];
        allFilters.forEach((section) => {
          section.categories.forEach((category) => {
            if (category.id === categoryId) {
              relevantSections.add(section.id);
            }
          });
        });
      });

      const newExpandedSections = { ...expandedSections };
      relevantSections.forEach((sectionId) => {
        newExpandedSections[sectionId] = true;
      });
      setExpandedSections(newExpandedSections);
    },
    [expandedSections]
  );

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setSelectedOptions({});
    setActiveQuickFilter(null);
  }, []);

  // Apply filters and close modal
  const handleApplyFilters = useCallback(() => {
    onApplyFilters(selectedOptions);
    onClose();
  }, [selectedOptions, onApplyFilters, onClose]);

  // Filter sections based on search and advanced setting
  const filteredSections = allFilters
    .filter((section) => (showAdvancedFilters ? true : !section.isAdvanced))
    .map((section) => ({
      ...section,
      categories: section.categories
        .filter((cat) => (showAdvancedFilters ? true : !cat.isAdvanced))
        .map((cat) => ({
          ...cat,
          options: cat.options.filter((option) =>
            searchTerm
              ? option.toLowerCase().includes(searchTerm.toLowerCase())
              : true
          ),
        }))
        .filter((cat) => cat.options.length > 0),
    }))
    .filter((section) => section.categories.length > 0);

  // Get the active filter count for each quick filter
  const getQuickFilterActiveCount = useCallback(
    (filterId: string) => {
      const filter = premadeFilters.find((f) => f.id === filterId);
      if (!filter) return 0;

      return filter.filters.filter((f) => selectedOptions[f]).length;
    },
    [selectedOptions]
  );

  // Check if a quick filter is fully applied
  const isQuickFilterFullyApplied = useCallback(
    (filterId: string) => {
      const filter = premadeFilters.find((f) => f.id === filterId);
      if (!filter) return false;

      return filter.filters.every((f) => selectedOptions[f]);
    },
    [selectedOptions]
  );

  // Get the active quick filter details
  const getActiveQuickFilterDetails = useCallback(() => {
    if (!activeQuickFilter) return null;

    const filter = premadeFilters.find((f) => f.id === activeQuickFilter);
    if (!filter) return null;

    const appliedCount = getQuickFilterActiveCount(activeQuickFilter);
    const totalCount = filter.filters.length;

    return {
      ...filter,
      appliedCount,
      totalCount,
      isFullyApplied: appliedCount === totalCount,
    };
  }, [activeQuickFilter, getQuickFilterActiveCount]);

  const activeFilterDetails = getActiveQuickFilterDetails();

  // Close tooltip when tapping outside
  useEffect(() => {
    if (tooltipFilter) {
      const timer = setTimeout(() => {
        // Auto-dismiss tooltip after 5 seconds if user doesn't interact with it
        setTooltipFilter(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [tooltipFilter]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1">
        <View className="flex-row justify-between items-center p-4 border-b border-cream-300">
          <TouchableOpacity onPress={onClose}>
            <Feather name="x" size={24} color="#000" />
          </TouchableOpacity>
          <TitleText className="text-xl font-bold">Filter Plants</TitleText>
          <TouchableOpacity onPress={handleApplyFilters}>
            <BodyText className="text-brand-600 font-semibold">Apply</BodyText>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="px-4 py-2 border-b border-cream-300">
          <View className="flex-row items-center bg-cream-100 rounded-xl px-3 py-2.5 mb-4 border border-cream-300">
            <Feather name="search" size={18} color="#666" />
            <TextInput
              className="flex-1 ml-2 text-base"
              placeholder="Search filters..."
              placeholderTextColor="#BBBBBB"
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
            {searchTerm ? (
              <TouchableOpacity onPress={() => setSearchTerm("")}>
                <Feather name="x" size={18} color="#666" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Premade Filters */}
        <View className="p-4 border-b border-cream-300">
          <View className="flex-row justify-between items-center mb-2">
            <TitleText className="text-lg font-semibold">
              Quick Filters
            </TitleText>
            {activeFilterDetails && (
              <TouchableOpacity
                onPress={() =>
                  setShowQuickFilterDetails(!showQuickFilterDetails)
                }
                className="flex-row items-center"
              >
                <BodyText className="text-primary mr-1">
                  {showQuickFilterDetails ? "Hide details" : "Show details"}
                </BodyText>
                <Feather
                  name={showQuickFilterDetails ? "chevron-up" : "chevron-down"}
                  size={16}
                  color="#555"
                />
              </TouchableOpacity>
            )}
          </View>

          {activeFilterDetails && showQuickFilterDetails && (
            <View className="mb-3 bg-cream-100/20 p-4 rounded-lg border border-cream-300">
              <View className="flex-row items-start mb-3">
                <View className="bg-brand-600/10 p-2 rounded-full mr-3">
                  <Feather
                    name={activeFilterDetails.icon}
                    size={20}
                    color="#555"
                  />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center justify-between">
                    <TitleText className="font-bold text-base text-gray-800">
                      {activeFilterDetails.name}
                    </TitleText>
                    <TouchableOpacity
                      onPress={clearAllFilters}
                      className="bg-cream-400/60 px-2 py-1 rounded-md"
                    >
                      <BodyText className="text-xs font-medium">Clear</BodyText>
                    </TouchableOpacity>
                  </View>
                  <BodyText className="text-sm text-gray-600 mt-1 leading-5">
                    {activeFilterDetails.description}
                  </BodyText>
                </View>
              </View>

              <View className="bg-white p-3 rounded-md mb-2">
                <BodyText className="text-xs font-medium mb-2 text-gray-700">
                  Filter Progress
                </BodyText>
                <View className="flex-row items-center mb-1">
                  <View className="flex-1">
                    <AnimatedProgressBar
                      percentage={
                        (activeFilterDetails.appliedCount /
                          activeFilterDetails.totalCount) *
                        100
                      }
                      color="#5E994B" // brand-600
                      height={12}
                      duration={500}
                    />
                  </View>
                  <BodyText className="text-xs ml-2 font-medium">
                    {activeFilterDetails.appliedCount}/
                    {activeFilterDetails.totalCount}
                  </BodyText>
                </View>
                <BodyText className="text-xs text-gray-500 mt-1">
                  {activeFilterDetails.isFullyApplied
                    ? "All filters in this quick filter are applied"
                    : "Some filters in this quick filter are not applied"}
                </BodyText>
              </View>

              <TouchableOpacity
                className="bg-brand-600/10 rounded-md p-2 flex-row items-center justify-center"
                onPress={() => {
                  // Toggle tooltip for this filter to see details
                  setTooltipFilter(activeQuickFilter);
                }}
              >
                <Feather name="info" size={14} color="#555" />
                <BodyText className="text-sm ml-1 text-gray-700 font-medium">
                  View Filter Details
                </BodyText>
              </TouchableOpacity>
            </View>
          )}

          {/* Quick Filters ScrollView with padding to ensure tooltips are visible */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingVertical: 20,
              paddingHorizontal: 10,
            }}
            style={{ marginHorizontal: -4 }}
          >
            {premadeFilters.map((filter, index) => {
              const isActive = activeQuickFilter === filter.id;
              const isPartiallyApplied =
                getQuickFilterActiveCount(filter.id) > 0 &&
                !isQuickFilterFullyApplied(filter.id);

              return (
                <View key={filter.id} className="mx-2" style={{ width: 100 }}>
                  <TouchableOpacity
                    className={`rounded-lg p-3 items-center ${
                      isActive
                        ? "bg-brand-600"
                        : isPartiallyApplied
                        ? "bg-brand-600/30"
                        : "bg-cream-100 border border-cream-300"
                    }`}
                    onPress={() => {
                      // Close any open tooltip first
                      setTooltipFilter(null);
                      applyPremadeFilter(filter.id, filter.filters);
                    }}
                    onLongPress={() => setTooltipFilter(filter.id)}
                    delayLongPress={500}
                  >
                    <Feather
                      name={filter.icon}
                      size={24}
                      color={isActive ? "#fff" : "#555"}
                    />
                    <BodyText
                      className={`text-sm text-center mt-1 ${
                        isActive ? "text-white font-medium" : ""
                      }`}
                    >
                      {filter.name}
                    </BodyText>
                    {isPartiallyApplied && (
                      <View className="absolute top-1 right-1 w-3 h-3 bg-accent-400 rounded-full" />
                    )}
                  </TouchableOpacity>

                  {/* Separate info button below the filter */}
                  <TouchableOpacity
                    className={`mt-1 py-1.5 px-2 rounded-md flex-row items-center justify-center ${
                      isActive ? "bg-brand-600/80" : "bg-brand-600/20"
                    }`}
                    onPress={() => {
                      // Toggle tooltip
                      setTooltipFilter(
                        tooltipFilter === filter.id ? null : filter.id
                      );
                    }}
                    accessibilityLabel={`Show information about ${filter.name} filter`}
                    accessibilityHint="Shows details about what this quick filter includes"
                  >
                    <Feather
                      name="info"
                      size={14}
                      color={isActive ? "#fff" : "#555"}
                    />
                    <BodyText
                      className={`text-xs ml-1 ${
                        isActive ? "text-white" : "text-gray-700"
                      }`}
                    >
                      Info
                    </BodyText>
                  </TouchableOpacity>

                  {tooltipFilter === filter.id && (
                    <QuickFilterTooltip
                      filter={filter}
                      visible={tooltipFilter === filter.id}
                      onClose={() => setTooltipFilter(null)}
                      onApply={(filterId) => {
                        applyPremadeFilter(filterId, filter.filters);
                      }}
                    />
                  )}
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* Filter Sections */}
        <ScrollView className="flex-1">
          {filteredSections.map((section) => (
            <View key={section.id} className="border-b border-cream-300">
              <TouchableOpacity
                className="flex-row justify-between items-center p-4"
                onPress={() => toggleSection(section.id)}
              >
                <View className="flex-row items-center">
                  <Feather name={section.icon} size={20} color="#555" />
                  <BodyText className="text-lg font-medium ml-2">
                    {section.name}
                  </BodyText>
                </View>
                <Feather
                  name={
                    expandedSections[section.id]
                      ? "chevron-down"
                      : "chevron-right"
                  }
                  size={20}
                  color="#555"
                />
              </TouchableOpacity>

              {expandedSections[section.id] && (
                <View className="pl-4 pr-2 pb-2">
                  {section.categories.map((category) => (
                    <View key={category.id}>
                      <TouchableOpacity
                        className="flex-row justify-between items-center p-3"
                        onPress={() =>
                          toggleCategory(`${section.id}-${category.id}`)
                        }
                      >
                        <View className="flex-row items-center">
                          <Feather
                            name={category.icon}
                            size={18}
                            color="#666"
                          />
                          <BodyText className="text-base font-medium ml-2">
                            {category.name}
                            {category.isAdvanced && showAdvancedFilters && (
                              <BodyText className="text-xs text-brand-600 ml-1">
                                {" "}
                                (Advanced)
                              </BodyText>
                            )}
                          </BodyText>
                        </View>
                        <Feather
                          name={
                            expandedCategories[`${section.id}-${category.id}`]
                              ? "chevron-down"
                              : "chevron-right"
                          }
                          size={18}
                          color="#666"
                        />
                      </TouchableOpacity>

                      {expandedCategories[`${section.id}-${category.id}`] && (
                        <View className="pl-8 pr-2 pb-2">
                          {category.options.map((option) => {
                            const optionKey = `${category.id}|${option}`;
                            return (
                              <TouchableOpacity
                                key={optionKey}
                                className="flex-row items-center py-2"
                                onPress={() =>
                                  toggleOption(
                                    optionKey,
                                    !selectedOptions[optionKey]
                                  )
                                }
                              >
                                <View
                                  className={`w-5 h-5 rounded border flex items-center justify-center ${
                                    selectedOptions[optionKey]
                                      ? "bg-brand-600 border-brand-600"
                                      : "border-cream-300"
                                  }`}
                                >
                                  {selectedOptions[optionKey] && (
                                    <Feather
                                      name="check"
                                      size={14}
                                      color="#fff"
                                    />
                                  )}
                                </View>
                                <BodyText className="text-base ml-2">
                                  {option}
                                </BodyText>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        {/* Footer Buttons */}
        <View className="p-4 border-t border-cream-300">
          {/* Selected Filters Summary */}
          {Object.keys(selectedOptions).filter((key) => selectedOptions[key])
            .length > 0 && (
            <View className="mb-3 bg-cream-400/20 p-3 rounded-lg">
              <View className="flex-row justify-between items-center mb-2">
                <BodyText className="font-semibold">Selected Filters</BodyText>
                <TouchableOpacity
                  onPress={clearAllFilters}
                  className="bg-cream-400/40 px-2 py-1 rounded"
                >
                  <BodyText className="text-xs">Clear All</BodyText>
                </TouchableOpacity>
              </View>
              <ScrollView style={{ maxHeight: 100 }}>
                {Object.keys(selectedOptions)
                  .filter((key) => selectedOptions[key])
                  .map((key, index) => {
                    const [category, value] = key.split("|");
                    // Find the category name from allFilters
                    let categoryName = category;
                    let categoryIcon: FeatherIconName = "filter";

                    allFilters.forEach((section) => {
                      section.categories.forEach((cat) => {
                        if (cat.id === category) {
                          categoryName = cat.name;
                          categoryIcon = cat.icon;
                        }
                      });
                    });

                    return (
                      <View key={index} className="flex-row items-center mb-1">
                        <Feather name={categoryIcon} size={12} color="#555" />
                        <BodyText className="text-xs ml-1">
                          <BodyText className="font-medium">
                            {categoryName}:
                          </BodyText>{" "}
                          {value}
                        </BodyText>
                        <TouchableOpacity
                          className="ml-auto p-1"
                          onPress={() => toggleOption(key, false)}
                        >
                          <Feather name="x" size={12} color="#555" />
                        </TouchableOpacity>
                      </View>
                    );
                  })}
              </ScrollView>

              {/* Show active quick filter if applicable */}
              {activeQuickFilter && (
                <View className="mt-2 pt-2 border-t border-cream-300/50">
                  <View className="flex-row items-center">
                    <BodyText className="text-xs text-gray-600">
                      Quick Filter:
                    </BodyText>
                    <View className="flex-row items-center ml-1 bg-brand-600/10 px-2 py-0.5 rounded-full">
                      {premadeFilters.find(
                        (f) => f.id === activeQuickFilter
                      ) && (
                        <Feather
                          name={
                            premadeFilters.find(
                              (f) => f.id === activeQuickFilter
                            )?.icon || "filter"
                          }
                          size={10}
                          color="#555"
                        />
                      )}
                      <BodyText className="text-xs ml-1 font-medium">
                        {premadeFilters.find((f) => f.id === activeQuickFilter)
                          ?.name || ""}
                      </BodyText>
                    </View>
                  </View>
                </View>
              )}
            </View>
          )}

          <View className="flex-row justify-between mb-3">
            <TouchableOpacity
              className="flex-1 mr-2 py-3 bg-destructive rounded-lg items-center"
              onPress={clearAllFilters}
            >
              <BodyText className="text-white font-semibold">
                Clear All
              </BodyText>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 ml-2 py-3 bg-cream-400/40 rounded-lg items-center"
              onPress={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <BodyText className="font-semibold">
                {showAdvancedFilters ? "Hide Advanced" : "Show Advanced"}
              </BodyText>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            className="py-3 bg-brand-600 rounded-lg items-center"
            onPress={handleApplyFilters}
          >
            <BodyText className="text-white font-semibold">
              Apply Filters
            </BodyText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
