import React, { useState, useEffect, useCallback } from "react";
import {
  Text,
  View,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { useUser } from "@clerk/clerk-expo";
import SearchBar from "@/components/Plants/SearchBar";
import FilterSelector from "@/components/Plants/FilterSelector";
import NameToggle from "@/components/Plants/NameToggle";
import SearchResults from "@/components/Plants/SearchResults";

export default function PlantDatabaseScreen() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  // Filters for filter buttons
  const filterOptions = [
    "All",
    "Houseplant",
    "Succulent",
    "Vine",
    "Herb",
    "Tree",
    "Shrub",
  ];
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
      <View className="px-5 pt-5">
        <Text className="text-2xl font-bold text-foreground mb-4">
          Plant Database
        </Text>

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search plants..."
        />

        {/* Name Toggle */}
        <NameToggle
          useCommonNames={useCommonNames}
          onToggle={handleNameTypeToggle}
        />

        {/* Filter Selector */}
        <FilterSelector
          filters={filterOptions}
          activeFilter={activeFilter}
          onSelectFilter={handleFilterChange}
        />
      </View>

      {/* Search Results */}
      <SearchResults
        query={debouncedQuery}
        page={page}
        filters={activeFilter !== "All" ? activeFilter.toLowerCase() : ""}
        nameType={useCommonNames ? "common" : "scientific"}
        onPageChange={handlePageChange}
      />
    </SafeAreaView>
  );
}
