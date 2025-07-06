import NameToggle from "@/components/Database/NameToggle";
import SearchBar from "@/components/Database/SearchBar";
import SearchResults from "@/components/Database/SearchResults";
import FilterSelector from "@/components/Database/FilterSelector";
import { useUser } from "@clerk/clerk-expo";
import { useCallback, useEffect, useState } from "react";
import {
  SafeAreaView,
  StatusBar,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAtom } from "jotai";
import { activeFiltersAtom } from "@/atoms/filters";
import { PageContainer } from "@/components/UI/PageContainer";
import { TitleText, BodyText } from "@/components/UI/Text";
import { useGardenFilters } from "@/lib/hooks/useGardenFilters";

export default function PlantDatabaseScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  // State for filter selection
  const [activeFilters, setActiveFilters] = useAtom(activeFiltersAtom);
  const [useCommonNames, setUseCommonNames] = useState(false);
  const [activeGardenFilter, setActiveGardenFilter] = useState<string | null>(
    null
  );
  const [hasInitializedGardenFilters, setHasInitializedGardenFilters] =
    useState(false);

  // Garden-based filtering hook
  const {
    gardenFilterOptions,
    defaultFilters,
    hasGardens,
    isLoading: gardenFiltersLoading,
  } = useGardenFilters();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(1); // Reset to first page on new search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Auto-apply garden filters when user has gardens (only once on first load)
  useEffect(() => {
    if (!gardenFiltersLoading && hasGardens && !hasInitializedGardenFilters) {
      // Apply the first garden's filters automatically
      if (gardenFilterOptions.length > 0) {
        const defaultGarden = gardenFilterOptions[0];
        setActiveGardenFilter(defaultGarden.id);
        setActiveFilters(defaultGarden.filters.join(","));
        setHasInitializedGardenFilters(true);
      }
    }
  }, [
    gardenFiltersLoading,
    hasGardens,
    gardenFilterOptions,
    hasInitializedGardenFilters,
    setActiveFilters,
  ]);

  // Handle name type toggle
  const handleNameTypeToggle = useCallback((useCommon: boolean) => {
    setUseCommonNames(useCommon);
    setPage(1); // Reset to first page on name type change
  }, []);

  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    // Scroll to top of the screen when changing pages
    StatusBar.currentHeight && window.scrollTo(0, StatusBar.currentHeight);
  }, []);

  // Handle filter selection
  const handleFilterSelect = useCallback(
    (filter: string) => {
      setActiveFilters(filter);
      setPage(1); // Reset to first page on filter change
      // Clear garden filter when manual filters are applied
      if (filter !== "" && activeGardenFilter !== null) {
        setActiveGardenFilter(null);
      }
    },
    [setActiveFilters, activeGardenFilter]
  );

  // Handle garden filter selection
  const handleGardenFilterSelect = useCallback(
    (gardenId: string | null) => {
      setActiveGardenFilter(gardenId);
      setPage(1); // Reset to first page on filter change

      if (gardenId === null) {
        // Clear all filters
        setActiveFilters("");
      } else {
        // Apply selected garden's filters
        const selectedGarden = gardenFilterOptions.filter(
          (g) => g.id === gardenId
        )[0];
        if (selectedGarden) {
          setActiveFilters(selectedGarden.filters.join(","));
        }
      }
    },
    [gardenFilterOptions, setActiveFilters]
  );

  return (
    <PageContainer scroll={false} padded={false}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1">
          <View className="pt-5 px-5">
            <TitleText className="text-3xl mb-4">Plant Database</TitleText>

            {/* Status message for garden filtering */}
            {activeGardenFilter && (
              <View className="mb-4 p-3 bg-brand-50 border border-brand-200 rounded-lg">
                <View className="flex-row items-center">
                  <Feather name="info" size={16} color="#5E994B" />
                  <BodyText className="ml-2 text-sm text-brand-700">
                    Showing plants personalized for your garden conditions
                  </BodyText>
                </View>
              </View>
            )}

            {/* Search Bar */}
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search plants..."
            />

            {/* Name Toggle and Filter Selector in a row */}
            <View className="flex-row justify-between items-center">
              <NameToggle
                useCommonNames={useCommonNames}
                onToggle={handleNameTypeToggle}
              />
              <FilterSelector
                filters={[]}
                activeFilter={activeFilters}
                onSelectFilter={handleFilterSelect}
                activeGardenFilter={activeGardenFilter}
                onGardenFilterChange={handleGardenFilterSelect}
              />
            </View>
          </View>

          {/* Search Results */}
          <SearchResults
            query={debouncedQuery}
            page={page}
            filters={activeFilters}
            nameType={useCommonNames ? "common" : "scientific"}
            onPageChange={handlePageChange}
          />
        </View>
      </TouchableWithoutFeedback>
    </PageContainer>
  );
}
