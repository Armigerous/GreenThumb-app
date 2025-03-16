import React, {
  useState,
  useCallback,
  useRef,
  memo,
  useEffect,
  useMemo,
} from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  TouchableOpacity,
  Image,
  ScrollView,
  LayoutChangeEvent,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";

import PlantCard from "./PlantCard";
import { ApiResponse, PlantCardData } from "@/types/plant";
import { fetchPlantCards, testSupabaseConnection } from "@/lib/supabaseApi";
import { prefetchImages } from "@/lib/services/imagePrefetcher";
import { usePlantCards } from "@/lib/queries";

// Pagination component for mobile
const PaginationComponent = memo(
  ({
    currentPage,
    totalPages,
    onPageChange,
  }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }) => {
    if (totalPages <= 1) return null;

    const isFirstPage = currentPage === 1;
    const isLastPage = currentPage === totalPages;

    // Generate page numbers to display
    const getPageNumbers = () => {
      const pages = [];

      // Always show first page
      if (currentPage > 3) {
        pages.push(1);
      }

      // Show ellipsis if needed
      if (currentPage > 4) {
        pages.push(-1); // -1 represents ellipsis
      }

      // Show pages around current page
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        pages.push(i);
      }

      // Show ellipsis if needed
      if (currentPage < totalPages - 3) {
        pages.push(-2); // -2 represents ellipsis
      }

      // Always show last page
      if (currentPage < totalPages - 2) {
        pages.push(totalPages);
      }

      return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
      <View className="py-4 px-4 bg-white shadow-sm">
        <View className="flex-row items-center justify-center">
          {/* Previous button */}
          <TouchableOpacity
            onPress={() => !isFirstPage && onPageChange(currentPage - 1)}
            disabled={isFirstPage}
            className={`px-3 py-2 rounded-lg flex-row items-center ${
              isFirstPage ? "opacity-50" : ""
            }`}
            accessibilityLabel="Previous page"
          >
            <Ionicons name="chevron-back" size={18} color="#047857" />
            <Text className="text-brand-700 ml-1">Prev</Text>
          </TouchableOpacity>

          {/* Page numbers */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
            className="flex-row mx-2"
          >
            {pageNumbers.map((page, index) => {
              if (page < 0) {
                // Render ellipsis
                return (
                  <View key={`ellipsis-${index}`} className="px-2 py-1">
                    <Text className="text-cream-500">...</Text>
                  </View>
                );
              }

              const isActive = page === currentPage;

              return (
                <TouchableOpacity
                  key={`page-${page}`}
                  onPress={() => onPageChange(page)}
                  className={`mx-1 px-3 py-1 rounded-lg ${
                    isActive ? "bg-brand-100" : ""
                  }`}
                  accessibilityLabel={`Page ${page}`}
                >
                  <Text
                    className={`${
                      isActive ? "text-brand-800 font-medium" : "text-cream-600"
                    }`}
                  >
                    {page}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Next button */}
          <TouchableOpacity
            onPress={() => !isLastPage && onPageChange(currentPage + 1)}
            disabled={isLastPage}
            className={`px-3 py-2 rounded-lg flex-row items-center ${
              isLastPage ? "opacity-50" : ""
            }`}
            accessibilityLabel="Next page"
          >
            <Text className="text-brand-700 mr-1">Next</Text>
            <Ionicons name="chevron-forward" size={18} color="#047857" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
);

PaginationComponent.displayName = "PaginationComponent";

// Error state component
const ErrorState = memo(
  ({ message, onRetry }: { message?: string; onRetry: () => void }) => (
    <View className="flex-1 items-center justify-center py-8 px-4">
      <Image
        source={{ uri: "https://theofficialbrandthumb.com/sad-plant.png" }}
        className="w-40 h-40 rounded-lg mb-4"
      />
      <Text className="text-xl font-bold text-destructive mb-2">
        Oops! Something went wrong 🌱
      </Text>
      <Text className="text-cream-600 text-center mb-4">
        {message ||
          "We couldn't load the plants. Maybe take a break and try again in a few minutes?"}
      </Text>
      <TouchableOpacity
        onPress={onRetry}
        className="bg-brand-600 px-4 py-2 rounded-lg"
      >
        <Text className="text-white font-medium">Try Again</Text>
      </TouchableOpacity>
    </View>
  )
);

ErrorState.displayName = "ErrorState";

// No results component
const NoResults = memo(() => (
  <View className="flex-1 items-center justify-center py-8 px-4">
    <Image
      source={{ uri: "https://theofficialbrandthumb.com/sad-plant.png" }}
      className="w-40 h-40 rounded-lg mb-4"
    />
    <Text className="text-xl font-bold text-cream-800 mb-2">
      No results found 🌱
    </Text>
    <Text className="text-cream-600 text-center">
      Try searching with different keywords.
    </Text>
  </View>
));

NoResults.displayName = "NoResults";

// Plant card skeleton for loading state
const PlantCardSkeleton = memo(() => (
  <View style={{ width: "48%", marginBottom: 16 }}>
    <View className="bg-white rounded-xl overflow-hidden shadow-sm h-[220px]">
      <View className="w-full h-[120px] bg-cream-400/40" />
      <View className="p-3 space-y-2">
        <View className="h-5 bg-cream-400/40 rounded w-3/4" />
        <View className="h-4 bg-cream-400/40 rounded w-1/2" />
        <View className="h-6 bg-cream-400/40 rounded w-1/3 mt-auto" />
      </View>
    </View>
  </View>
));

PlantCardSkeleton.displayName = "PlantCardSkeleton";

// Main SearchResults component
const SearchResults = memo(
  ({
    query,
    page,
    filters,
    nameType,
    onPageChange,
  }: {
    query?: string;
    page: number;
    filters?: string;
    nameType?: string;
    onPageChange: (page: number) => void;
  }) => {
    const limit = 28;
    const flatListRef = useRef<FlatList>(null);
    const [columnCount, setColumnCount] = useState(2);

    // Use our new query hook instead of custom hook
    const { data, isLoading, error, refetch } = usePlantCards(
      page,
      limit,
      query || "",
      filters || "all",
      nameType || "scientific"
    );

    // Prefetch images when data is loaded
    useEffect(() => {
      if (data?.results && data.results.length > 0) {
        // Extract image URIs from the plant data
        const imageUris = data.results
          .filter((plant) => plant && plant.first_image)
          .map((plant) => plant.first_image as string);

        // Prefetch the images
        if (imageUris.length > 0) {
          prefetchImages(imageUris);
        }
      }
    }, [data]);

    // Calculate total pages
    const totalPages = data ? Math.ceil(data.count / limit) : 0;

    // Handle layout changes for responsive design
    const handleLayout = (event: LayoutChangeEvent) => {
      const { width } = event.nativeEvent.layout;
      setColumnCount(width > 640 ? 3 : 2);
    };

    // Handle page changes
    const handlePageChange = (newPage: number) => {
      if (newPage === page) return;

      // Scroll to top when changing pages
      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({ offset: 0, animated: true });
      }

      onPageChange(newPage);
    };

    // Handle refresh
    const handleRefresh = () => {
      refetch();
    };

    // Filter out invalid results
    const validResults = useMemo(() => {
      if (!data || !data.results) return [];
      return data.results.filter(
        (plant) => plant && plant.slug && plant.scientific_name
      );
    }, [data]);

    if (isLoading) {
      return (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#047857" />
          <Text className="mt-3 text-base text-cream-600">
            Loading plants...
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View className="flex-1 justify-center items-center p-5">
          <Ionicons name="leaf" size={64} color="#d1d5db" />
          <Text className="text-xl font-bold text-red-500 mt-4">
            Oops! Something went wrong
          </Text>
          <Text className="text-sm text-cream-500 text-center mt-2">
            {error.message || "Failed to load plants. Please try again later."}
          </Text>
          <TouchableOpacity
            className="mt-6 py-2.5 px-5 bg-brand-600 rounded-lg"
            onPress={() => refetch()}
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!data || !data.results || data.results.length === 0) {
      return (
        <View className="flex-1 justify-center items-center p-5">
          <Ionicons name="search" size={64} color="#d1d5db" />
          <Text className="text-xl font-bold text-cream-800 mt-4">
            No plants found
          </Text>
          <Text className="text-sm text-cream-500 text-center mt-2">
            {query
              ? `We couldn't find any plants matching "${query}"`
              : "No plants available at the moment"}
          </Text>
          {query && (
            <TouchableOpacity
              className="mt-6 py-2.5 px-5 bg-brand-600 rounded-lg"
              onPress={() => onPageChange(1)}
            >
              <Text className="text-white font-semibold">View All Plants</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    return (
      <View className="flex-1" onLayout={handleLayout}>
        <View className="px-4 py-2">
          <Text className="text-xl font-bold text-cream-800">
            {query ? `Results for "${query}"` : "All Plants"}
          </Text>
          <Text className="text-cream-600">
            {data.count} plants found • Page {page} of {totalPages}
          </Text>
        </View>

        <FlatList
          ref={flatListRef}
          data={validResults}
          keyExtractor={(item) => item.slug}
          renderItem={({ item }) => <PlantCard plant={item} />}
          numColumns={columnCount}
          contentContainerStyle={{ padding: 12 }}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={handleRefresh} />
          }
          ListFooterComponent={
            <PaginationComponent
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          }
        />
      </View>
    );
  }
);

SearchResults.displayName = "SearchResults";

export default SearchResults;
