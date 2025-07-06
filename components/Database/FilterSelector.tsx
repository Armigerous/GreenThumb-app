import React, { useState, useEffect, useMemo } from "react";
import { TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import FilterModal from "./FilterModal";
import { premadeFilters } from "@/types/premadeFilters";
import { BodyText } from "@/components/UI/Text";

interface FilterSelectorProps {
  filters: string[];
  activeFilter: string;
  onSelectFilter: (filter: string) => void;
  activeGardenFilter?: string | null;
  onGardenFilterChange?: (gardenId: string | null) => void;
}

const FilterSelector: React.FC<FilterSelectorProps> = ({
  filters,
  activeFilter,
  onSelectFilter,
  activeGardenFilter,
  onGardenFilterChange,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<{
    [key: string]: boolean;
  }>({});
  const [filterCount, setFilterCount] = useState(0);
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(
    null
  );

  useEffect(() => {
    // Update filter count whenever selectedOptions changes
    setFilterCount(
      Object.keys(selectedOptions).filter((key) => selectedOptions[key]).length
    );

    // Determine if a quick filter is active
    if (Object.keys(selectedOptions).length > 0) {
      for (const filter of premadeFilters) {
        const filterKeys = filter.filters;
        // Check if all filter keys are selected
        const allSelected = filterKeys.every((key) => selectedOptions[key]);
        // Check if only these filter keys are selected (no extras)
        const onlyTheseSelected =
          Object.keys(selectedOptions)
            .filter((key) => selectedOptions[key])
            .every((key) => filterKeys.includes(key)) &&
          filterKeys.length ===
            Object.keys(selectedOptions).filter((key) => selectedOptions[key])
              .length;

        if (allSelected && onlyTheseSelected) {
          setActiveQuickFilter(filter.id);
          return;
        }
      }
    }

    // If we get here, no quick filter exactly matches
    setActiveQuickFilter(null);
  }, [selectedOptions]);

  // Get active quick filter details
  const activeQuickFilterDetails = useMemo(() => {
    if (!activeQuickFilter) return null;
    return premadeFilters.find((f) => f.id === activeQuickFilter);
  }, [activeQuickFilter]);

  // Handle applying filters from the modal
  const handleApplyFilters = (options: { [key: string]: boolean }) => {
    setSelectedOptions(options);

    // Get the active filter keys
    const activeKeys = Object.keys(options).filter((key) => options[key]);

    if (activeKeys.length === 0) {
      // If no filters selected, use ""
      onSelectFilter("");
    } else {
      // Format the filters as a comma-separated string of "category|value" pairs
      const formattedFilters = activeKeys.map((key) => key).join(",");
      console.log("Applying filters:", formattedFilters);
      onSelectFilter(formattedFilters);

      // For backward compatibility with the existing filter UI
      // Find a plant type filter to set as the active filter name
      const plantTypeFilter = activeKeys.find((key) =>
        key.startsWith("plant-type|")
      );

      if (plantTypeFilter) {
        // This is just for UI display purposes in the filter tabs
        const filterValue = plantTypeFilter.split("|")[1];
        // Find the closest match in our filter options
        const matchedFilter =
          filters.find(
            (f) =>
              filterValue.toLowerCase().includes(f.toLowerCase()) ||
              f.toLowerCase().includes(filterValue.toLowerCase())
          ) || "";
        // This doesn't affect the actual filtering, just the UI tab selection
        // onSelectFilter(matchedFilter);
      }
    }
  };

  return (
    <View className="flex-row items-center">
      <TouchableOpacity
        className={`flex-row items-center justify-center ${
          filterCount > 0 ? "bg-brand-600" : "bg-primary"
        } px-3 py-2 rounded-lg`}
        onPress={() => setModalVisible(true)}
      >
        <Feather name="filter" color={"#fffefa"} size={16} />
        <BodyText className="ml-2 text-sm font-medium text-primary-foreground">
          {filterCount > 0 ? `Filters (${filterCount})` : "Filter"}
        </BodyText>
      </TouchableOpacity>

      {activeQuickFilterDetails && (
        <View className="flex-row items-center ml-2 bg-cream-400/30 px-3 py-2 rounded-lg">
          <Feather
            name={activeQuickFilterDetails.icon}
            color={"#555"}
            size={16}
          />
          <BodyText className="ml-2 text-sm font-medium text-gray-700">
            {activeQuickFilterDetails.name}
          </BodyText>
          <View className="ml-2 px-2 py-0.5 bg-brand-600/20 rounded-full">
            <BodyText className="text-xs text-brand-600 font-medium">
              Quick Filter
            </BodyText>
          </View>
          <TouchableOpacity
            className="ml-2 p-1"
            onPress={() => {
              // Clear the active quick filter
              const newOptions = { ...selectedOptions };
              activeQuickFilterDetails.filters.forEach((filter) => {
                delete newOptions[filter];
              });
              handleApplyFilters(newOptions);
            }}
          >
            <Feather name="x" size={14} color="#555" />
          </TouchableOpacity>
        </View>
      )}

      <FilterModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        selectedOptions={selectedOptions}
        onApplyFilters={handleApplyFilters}
        activeGardenFilter={activeGardenFilter}
        onGardenFilterChange={onGardenFilterChange}
      />
    </View>
  );
};

export default FilterSelector;
