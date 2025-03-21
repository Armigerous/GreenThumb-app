import FilterSelector from "@/components/Database/FilterSelector";
import NameToggle from "@/components/Database/NameToggle";
import SearchBar from "@/components/Database/SearchBar";
import SearchResults from "@/components/Database/SearchResults";
import { useUser } from "@clerk/clerk-expo";
import { useCallback, useEffect, useState } from "react";
import { SafeAreaView, StatusBar, Text, View } from "react-native";

export default function PlantDatabaseScreen() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  // Filters for filter buttons
  const [activeFilter, setActiveFilter] = useState("All");
  const [useCommonNames, setUseCommonNames] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(1); // Reset to first page on new search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle filter change
  const handleFilterChange = useCallback((filter: string) => {
    setActiveFilter(filter);
    setPage(1); // Reset to first page on filter change
  }, []);

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

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="pt-5 px-5">
        <Text className="text-2xl text-foreground font-bold mb-4">
          Plant Database
        </Text>

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
            filters={["All", "Indoor", "Outdoor", "Succulents", "Herbs"]}
            activeFilter={activeFilter}
            onSelectFilter={handleFilterChange}
          />
        </View>
      </View>

      {/* Search Results */}
      <SearchResults
        query={debouncedQuery}
        page={page}
        filters={activeFilter !== "All" ? activeFilter : ""}
        nameType={useCommonNames ? "common" : "scientific"}
        onPageChange={handlePageChange}
      />
    </SafeAreaView>
  );
}
