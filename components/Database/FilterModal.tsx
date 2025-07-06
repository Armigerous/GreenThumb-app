import { BodyText, TitleText } from "@/components/UI/Text";
import { useGardenFilters } from "@/lib/hooks/useGardenFilters";
import { allFilters } from "@/types/filterData";
import { premadeFilters } from "@/types/premadeFilters";
import { Feather } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  Modal,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  View,
  Keyboard,
  TouchableWithoutFeedback,
  useWindowDimensions,
} from "react-native";
import AnimatedProgressBar from "../UI/AnimatedProgressBar";
import TabNavigation, { TabItem } from "../UI/TabNavigation";
import FilterSearchBar from "./FilterModal/FilterSearchBar";
import QuickFilterTooltip from "./FilterModal/QuickFilterTooltip";
import GardenInfoTooltip from "./FilterModal/GardenInfoTooltip";

// Define a type for Feather icon names
type FeatherIconName = React.ComponentProps<typeof Feather>["name"];

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  selectedOptions: { [key: string]: boolean };
  onApplyFilters: (selectedOptions: { [key: string]: boolean }) => void;
  activeGardenFilter?: string | null;
  onGardenFilterChange?: (gardenId: string | null) => void;
}

export default function FilterModal({
  visible,
  onClose,
  selectedOptions: initialSelectedOptions,
  onApplyFilters,
  activeGardenFilter,
  onGardenFilterChange,
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
  const [activeTab, setActiveTab] = useState<"gardens" | "quick" | "custom">(
    "gardens"
  );
  const [searchBarFocused, setSearchBarFocused] = useState(false);
  const [tooltipGarden, setTooltipGarden] = useState<string | null>(null);

  // Garden filters hook
  const {
    gardenFilterOptions,
    hasGardens,
    isLoading: gardenFiltersLoading,
    gardens,
  } = useGardenFilters();

  // Responsive: get window width once at top level (hooks must be top-level)
  // Reason: useWindowDimensions must be called at the top level, not inside render or callbacks
  const { width } = useWindowDimensions();
  const isSmallDevice = width < 380;
  const columns = isSmallDevice ? 1 : 2;

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
  const toggleOption = useCallback(
    (key: string, checked: boolean) => {
      setSelectedOptions((prev) => ({ ...prev, [key]: checked }));

      // Clear garden filter when manual filters are changed
      if (checked && onGardenFilterChange) {
        onGardenFilterChange(null);
      }
    },
    [onGardenFilterChange]
  );

  // Handle garden filter selection
  const handleGardenFilterSelect = useCallback(
    (gardenId: string | null) => {
      if (onGardenFilterChange) {
        onGardenFilterChange(gardenId);
      }

      if (gardenId === null) {
        // Clear all filters when "All Plants" is selected
        setSelectedOptions({});
        setActiveQuickFilter(null);
      } else {
        // Apply selected garden's filters
        const selectedGarden = gardenFilterOptions.find(
          (g) => g.id === gardenId
        );
        if (selectedGarden) {
          const newFilters: { [key: string]: boolean } = {};
          selectedGarden.filters.forEach((filter) => {
            newFilters[filter] = true;
          });
          setSelectedOptions(newFilters);
          setActiveQuickFilter(null); // Clear quick filters when garden filter is applied

          // Auto-expand relevant sections based on the applied filters
          const relevantSections = new Set<string>();
          selectedGarden.filters.forEach((filter) => {
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
        }
      }
    },
    [gardenFilterOptions, onGardenFilterChange, expandedSections]
  );

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

      // Clear garden filter when quick filter is applied
      if (onGardenFilterChange) {
        onGardenFilterChange(null);
      }

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
    [expandedSections, onGardenFilterChange]
  );

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setSelectedOptions({});
    setActiveQuickFilter(null);
    if (onGardenFilterChange) {
      onGardenFilterChange(null);
    }
  }, [onGardenFilterChange]);

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

  // Tab definitions for filter navigation
  const filterTabs: TabItem[] = [
    { key: "gardens", label: "By Garden" },
    { key: "quick", label: "Quick Filters" },
    { key: "custom", label: "Custom" },
  ];

  // Helper: Compare two filter option objects for equality
  const areFiltersEqual = (
    a: { [key: string]: boolean },
    b: { [key: string]: boolean }
  ) => {
    const aKeys = Object.keys(a).filter((k) => a[k]);
    const bKeys = Object.keys(b).filter((k) => b[k]);
    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every((k) => b[k]);
  };

  // Determine if filters have changed
  const filtersChanged = !areFiltersEqual(
    selectedOptions,
    initialSelectedOptions || {}
  );

  // Accordion state for custom tab
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1">
        {/* Modal Title & Close Button */}
        <View className="px-4 pt-4 pb-2 flex-row items-center justify-between">
          <TitleText className="text-xl font-title-bold">
            Filter Plants
          </TitleText>

          <TouchableOpacity
            onPress={onClose}
            accessibilityLabel="Close filter modal"
            accessibilityRole="button"
            className="ml-2 flex-row items-center p-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="x" size={22} color="#2e2c29" />
            <BodyText className="ml-1 text-sm text-cream-800">Close</BodyText>
          </TouchableOpacity>
        </View>
        {/* Tab Navigation */}
        <View className="px-4 mb-2">
          <TabNavigation
            tabs={filterTabs}
            activeTab={activeTab}
            onTabChange={(key) =>
              setActiveTab(key as "gardens" | "quick" | "custom")
            }
          />
        </View>
        {/* Tab Content */}
        {activeTab === "gardens" && hasGardens && (
          <View className="flex-1">
            <View className="p-4 border-b border-cream-300 flex-shrink-0">
              {/* Responsive grid: 2 columns on normal screens, 1 on small screens */}
              {(() => {
                // Group gardens into rows
                const rows = [];
                for (let i = 0; i < gardenFilterOptions.length; i += columns) {
                  rows.push(gardenFilterOptions.slice(i, i + columns));
                }
                return (
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 16 }}
                  >
                    {rows.map((row, rowIndex) => (
                      <View
                        key={rowIndex}
                        className="flex-row justify-between mb-4"
                      >
                        {row.map((option, colIndex) => {
                          const isActive = activeGardenFilter === option.id;
                          // Find the full Garden object for this card
                          const fullGarden = gardens?.find(
                            (g) => g.id === option.gardenId
                          );
                          return (
                            <View
                              key={option.id}
                              className={
                                columns === 1
                                  ? "w-full"
                                  : colIndex === 0 && row.length === 1
                                  ? "w-full"
                                  : "w-[48%]"
                              }
                            >
                              <TouchableOpacity
                                className={`rounded-lg p-3 items-center mb-2 relative ${
                                  isActive
                                    ? "bg-brand-600"
                                    : "bg-cream-100 border border-cream-300"
                                }`}
                                onPress={() =>
                                  handleGardenFilterSelect(option.id)
                                }
                              >
                                <Feather
                                  name="home"
                                  size={24}
                                  color={isActive ? "#fff" : "#555"}
                                />
                                <BodyText
                                  className={`text-sm text-center mt-1 ${
                                    isActive ? "text-white font-medium" : ""
                                  }`}
                                >
                                  {option.name}
                                </BodyText>
                                {option.isDefault && (
                                  <View className="mt-2 px-2 py-0.5 bg-brand-600/20 rounded-full">
                                    <BodyText className="text-xs text-brand-600 font-medium">
                                      Auto
                                    </BodyText>
                                  </View>
                                )}
                              </TouchableOpacity>
                              <TouchableOpacity
                                className={`py-1.5 px-2 rounded-md flex-row items-center justify-center mb-2 ${
                                  isActive
                                    ? "bg-brand-600/80"
                                    : "bg-brand-600/20"
                                }`}
                                onPress={() =>
                                  setTooltipGarden(
                                    tooltipGarden === option.id
                                      ? null
                                      : option.id
                                  )
                                }
                                accessibilityLabel={`Show information about ${option.name} garden`}
                                accessibilityHint="Shows details about this garden filter"
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
                              {tooltipGarden === option.id && fullGarden && (
                                <GardenInfoTooltip
                                  garden={fullGarden}
                                  visible={tooltipGarden === option.id}
                                  onClose={() => setTooltipGarden(null)}
                                />
                              )}
                            </View>
                          );
                        })}
                        {/* If last row has only 1 garden and columns=2, add a spacer for alignment */}
                        {columns === 2 && row.length === 1 && (
                          <View className="w-[48%]" />
                        )}
                      </View>
                    ))}
                  </ScrollView>
                );
              })()}
            </View>
          </View>
        )}
        {activeTab === "quick" && (
          <View className="flex-1">
            <View className="p-4 border-b border-cream-300 flex-shrink-0">
              {/* Responsive grid: 2 columns on normal screens, 1 on small screens */}
              {(() => {
                // Group filters into rows
                const rows = [];
                for (let i = 0; i < premadeFilters.length; i += columns) {
                  rows.push(premadeFilters.slice(i, i + columns));
                }
                return (
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 16 }}
                  >
                    {rows.map((row, rowIndex) => (
                      <View
                        key={rowIndex}
                        className="flex-row justify-between mb-4"
                      >
                        {row.map((filter, colIndex) => {
                          const isActive = activeQuickFilter === filter.id;
                          const isPartiallyApplied =
                            getQuickFilterActiveCount(filter.id) > 0 &&
                            !isQuickFilterFullyApplied(filter.id);
                          return (
                            <View
                              key={filter.id}
                              className={
                                columns === 1
                                  ? "w-full"
                                  : colIndex === 0 && row.length === 1
                                  ? "w-full"
                                  : "w-[48%]"
                              }
                            >
                              <TouchableOpacity
                                className={`rounded-lg p-3 items-center mb-2 relative ${
                                  isActive
                                    ? "bg-brand-600"
                                    : isPartiallyApplied
                                    ? "bg-brand-600/30"
                                    : "bg-cream-100 border border-cream-300"
                                }`}
                                onPress={() => {
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
                              <TouchableOpacity
                                className={`py-1.5 px-2 rounded-md flex-row items-center justify-center mb-2 ${
                                  isActive
                                    ? "bg-brand-600/80"
                                    : "bg-brand-600/20"
                                }`}
                                onPress={() =>
                                  setTooltipFilter(
                                    tooltipFilter === filter.id
                                      ? null
                                      : filter.id
                                  )
                                }
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
                                    applyPremadeFilter(
                                      filterId,
                                      filter.filters
                                    );
                                  }}
                                />
                              )}
                            </View>
                          );
                        })}
                        {/* If last row has only 1 filter and columns=2, add a spacer for alignment */}
                        {columns === 2 && row.length === 1 && (
                          <View className="w-[48%]" />
                        )}
                      </View>
                    ))}
                  </ScrollView>
                );
              })()}
              {/* Quick Filter Details (compact) */}
              {activeQuickFilter && (
                <View className="mt-3 bg-cream-100/20 p-3 rounded-lg border border-cream-300">
                  <View className="flex-row items-center justify-between">
                    <BodyText className="font-medium">
                      {
                        premadeFilters.find((f) => f.id === activeQuickFilter)
                          ?.name
                      }
                    </BodyText>
                    <TouchableOpacity
                      onPress={clearAllFilters}
                      className="bg-cream-400/60 px-2 py-1 rounded-md"
                    >
                      <BodyText className="text-xs font-medium">Clear</BodyText>
                    </TouchableOpacity>
                  </View>
                  <BodyText className="text-xs text-gray-600 mt-1">
                    {
                      premadeFilters.find((f) => f.id === activeQuickFilter)
                        ?.description
                    }
                  </BodyText>
                </View>
              )}
            </View>
          </View>
        )}
        {activeTab === "custom" && (
          <View className="flex-1">
            {/* Search Bar */}
            <View className="px-4 py-2">
              <FilterSearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                onFocus={() => setSearchBarFocused(true)}
                onBlur={() => setSearchBarFocused(false)}
              />
            </View>
            <TouchableWithoutFeedback
              onPress={() => {
                if (searchBarFocused) Keyboard.dismiss();
              }}
              disabled={!searchBarFocused}
            >
              <View style={{ flex: 1 }}>
                <ScrollView className="flex-1">
                  {/* Show explicit message if no filters found after search */}
                  {filteredSections.length === 0 ? (
                    <View className="flex-1 items-center justify-center py-16">
                      <Feather name="search" size={32} color="#bbb" />
                      <BodyText className="text-lg text-gray-500 mt-3">
                        No filters found. Try a different search term.
                      </BodyText>
                    </View>
                  ) : (
                    filteredSections.map((section) => (
                      <View
                        key={section.id}
                        className="border-b border-cream-300"
                      >
                        <TouchableOpacity
                          className="flex-row justify-between items-center p-4"
                          onPress={() =>
                            setOpenSection(
                              openSection === section.id ? null : section.id
                            )
                          }
                        >
                          <View className="flex-row items-center">
                            <Feather
                              name={section.icon}
                              size={20}
                              color="#555"
                            />
                            <BodyText className="text-lg font-medium ml-2">
                              {section.name}
                            </BodyText>
                          </View>
                          <Feather
                            name={
                              openSection === section.id
                                ? "chevron-down"
                                : "chevron-right"
                            }
                            size={20}
                            color="#555"
                          />
                        </TouchableOpacity>
                        {openSection === section.id && (
                          <View className="pl-4 pr-2 pb-2">
                            {section.categories.map((category) => (
                              <View key={category.id}>
                                <TouchableOpacity
                                  className="flex-row justify-between items-center p-3"
                                  onPress={() =>
                                    setOpenCategory(
                                      openCategory ===
                                        `${section.id}-${category.id}`
                                        ? null
                                        : `${section.id}-${category.id}`
                                    )
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
                                      {category.isAdvanced &&
                                        showAdvancedFilters && (
                                          <BodyText className="text-xs text-brand-600 ml-1">
                                            {" "}
                                            (Advanced)
                                          </BodyText>
                                        )}
                                    </BodyText>
                                  </View>
                                  <Feather
                                    name={
                                      openCategory ===
                                      `${section.id}-${category.id}`
                                        ? "chevron-down"
                                        : "chevron-right"
                                    }
                                    size={18}
                                    color="#666"
                                  />
                                </TouchableOpacity>
                                {openCategory ===
                                  `${section.id}-${category.id}` && (
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
                    ))
                  )}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        )}
        {/* Footer Buttons */}
        <View className="p-4 border-t border-cream-300">
          {/* Show info box above Clear All when filtering by garden and a garden is selected */}
          {/* Reason: The info box should reinforce the context of personalized filters, but not interrupt the garden list UI. Placing it here keeps the action area clear and consistent. */}
          {activeTab === "gardens" && activeGardenFilter && (
            <View className="mb-3 bg-brand-50 border border-brand-200 rounded-lg p-3">
              <View className="flex-row items-center">
                <Feather name="info" size={16} color="#5E994B" />
                <BodyText className="ml-2 text-sm text-brand-700">
                  Personalized for your garden
                </BodyText>
              </View>
            </View>
          )}
          {/* Selected Filters Summary (compact) */}
          {Object.keys(selectedOptions).filter((key) => selectedOptions[key])
            .length > 1 && (
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
              <ScrollView style={{ maxHeight: 60 }} horizontal>
                {Object.keys(selectedOptions)
                  .filter((key) => selectedOptions[key])
                  .map((key, index) => {
                    const [category, value] = key.split("|");
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
                      <View
                        key={index}
                        className="flex-row items-center mr-3 mb-1"
                      >
                        <Feather name={categoryIcon} size={12} color="#555" />
                        <BodyText className="text-xs ml-1">
                          <BodyText className="font-medium">
                            {categoryName}:
                          </BodyText>{" "}
                          {value}
                        </BodyText>
                        <TouchableOpacity
                          className="ml-1 p-1"
                          onPress={() => toggleOption(key, false)}
                        >
                          <Feather name="x" size={12} color="#555" />
                        </TouchableOpacity>
                      </View>
                    );
                  })}
              </ScrollView>
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
            {/* Only show Show Advanced/Hide Advanced in Custom tab */}
            {activeTab === "custom" && (
              <TouchableOpacity
                className="flex-1 ml-2 py-3 bg-cream-400/40 rounded-lg items-center"
                onPress={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                <BodyText className="font-semibold">
                  {showAdvancedFilters ? "Hide Advanced" : "Show Advanced"}
                </BodyText>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            className="py-3 bg-brand-600 rounded-lg items-center"
            onPress={filtersChanged ? handleApplyFilters : undefined}
            disabled={!filtersChanged}
            style={{ opacity: filtersChanged ? 1 : 0.5 }}
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
