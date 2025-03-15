import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import SearchBar from "@/components/Plants/SearchBar";
import CategoryFilter from "@/components/Plants/CategoryFilter";
import PlantCard from "@/components/Plants/PlantCard";
import NameToggle from "@/components/Plants/NameToggle";
import { searchPlants } from "@/lib/api";
import { PlantData } from "@/types/plant";

export default function PlantDatabaseScreen() {
  const { user } = useUser();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [plants, setPlants] = useState<PlantData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Categories for filter buttons
  const categories = [
    "All",
    "Houseplant",
    "Succulent",
    "Vine",
    "Herb",
    "Tree",
    "Shrub",
  ];
  const [activeCategory, setActiveCategory] = useState("All");
  const [useCommonNames, setUseCommonNames] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(1); // Reset to first page on new search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch plants when query, category, or page changes
  useEffect(() => {
    async function fetchPlants() {
      try {
        setLoading(true);
        setError(null);

        // Convert category filter to API format
        const filters =
          activeCategory !== "All" ? activeCategory.toLowerCase() : "";

        // Set name type based on toggle
        const nameType = useCommonNames ? "common" : "scientific";

        const response = await searchPlants(
          debouncedQuery,
          page,
          filters,
          nameType
        );

        setPlants(response.results);
        setTotalCount(response.count);
      } catch (err) {
        console.error("Failed to fetch plants:", err);
        setError("Failed to load plants. Please try again.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }

    fetchPlants();
  }, [debouncedQuery, activeCategory, page, useCommonNames]);

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
  };

  const handleLoadMore = () => {
    if (plants.length < totalCount && !loading) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const renderEmptyState = () => (
    <View className="items-center justify-center py-8">
      <Ionicons name="leaf" size={48} color="#d1d5db" />
      <Text className="text-gray-400 mt-2 text-center">
        No plants found. Try a different search.
      </Text>
    </View>
  );

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
          onToggle={setUseCommonNames}
        />

        {/* Category Filter */}
        <CategoryFilter
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
        />
      </View>

      {loading && page === 1 ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#047857" />
          <Text className="mt-4 text-gray-600">Loading plants...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center px-5">
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
          <Text className="text-red-500 font-bold text-lg mt-4">
            Oops! Something went wrong
          </Text>
          <Text className="text-gray-500 text-center mt-2">{error}</Text>
        </View>
      ) : (
        <FlatList
          data={plants}
          keyExtractor={(item) => `${item.id}-${item.slug}`}
          contentContainerStyle={{ padding: 20 }}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          renderItem={({ item }) => <PlantCard plant={item} />}
          ListEmptyComponent={renderEmptyState}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading && page > 1 ? (
              <View className="py-4 items-center">
                <ActivityIndicator size="small" color="#047857" />
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}
