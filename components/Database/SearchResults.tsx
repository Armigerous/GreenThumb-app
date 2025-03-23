import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { usePlantCards } from "@/lib/queries";
import { prefetchImages } from "@/lib/services/imagePrefetcher";
import Pagination from "../UI/Pagination";
import PlantCard from "./PlantCard";
import { PlantCardData } from "@/types/plant";
// Error state component
const ErrorState = memo(
  ({ message, onRetry }: { message?: string; onRetry: () => void }) => (
    <View className="flex-1 items-center justify-center py-8 px-4">
      <Image
        source={{ uri: "https://theofficialgreenthumb.com/sad-plant.png" }}
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
      source={{ uri: "https://theofficialgreenthumb.com/sad-plant.png" }}
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

// Scroll fade component to indicate more content
const ScrollFade = memo(
  ({
    showTopFade,
    showBottomFade,
  }: {
    showTopFade: boolean;
    showBottomFade: boolean;
  }) => {
    return (
      <>
        {showTopFade && (
          <LinearGradient
            colors={["rgba(255,255,255,0.9)", "rgba(255,255,255,0)"]}
            className="absolute top-0 left-0 right-0 h-40 z-10 pointer-events-none"
          />
        )}
        {showBottomFade && (
          <LinearGradient
            colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.9)"]}
            className="absolute bottom-0 left-0 right-0 h-40 z-10 pointer-events-none"
          />
        )}
      </>
    );
  }
);

ScrollFade.displayName = "ScrollFade";

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
    const [showTopFade, setShowTopFade] = useState(false);
    const [showBottomFade, setShowBottomFade] = useState(true);

    // Use our query hook with the filters parameter
    const { data, isLoading, error, refetch } = usePlantCards(
      page,
      limit,
      query || "",
      filters || "",
      nameType || "scientific"
    );

    // Log filter information for debugging
    useEffect(() => {
      console.log("SearchResults - Applied filters:", filters);
    }, [filters]);

    // Prefetch images when data is loaded
    useEffect(() => {
      if (data?.results && data.results.length > 0) {
        // Extract image URIs from the plant data
        const imageUris = (data.results as PlantCardData[])
          .filter(
            (plant): plant is PlantCardData => !!plant && !!plant.first_image
          )
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

    // Handle scroll events to show/hide fades
    const handleScroll = useCallback(
      (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        const contentHeight = event.nativeEvent.contentSize.height;
        const layoutHeight = event.nativeEvent.layoutMeasurement.height;

        // Show top fade if scrolled down
        setShowTopFade(offsetY > 10);

        // Show bottom fade if not at the bottom
        const isAtBottom = offsetY + layoutHeight >= contentHeight - 10;
        setShowBottomFade(!isAtBottom);
      },
      []
    );

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

        <View className="flex-1 relative">
          <FlatList
            ref={flatListRef}
            data={validResults}
            keyExtractor={(item) => item.slug}
            renderItem={({ item }) => (
              <PlantCard
                plant={item}
                displayMode={nameType as "scientific" | "common"}
              />
            )}
            numColumns={columnCount}
            contentContainerStyle={{ padding: 12 }}
            columnWrapperStyle={{ justifyContent: "space-between" }}
            refreshControl={
              <RefreshControl refreshing={false} onRefresh={handleRefresh} />
            }
            onScroll={handleScroll}
            scrollEventThrottle={16}
          />
          <ScrollFade
            showTopFade={showTopFade}
            showBottomFade={showBottomFade}
          />
        </View>
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          variant={columnCount > 2 ? "default" : "compact"}
        />
      </View>
    );
  }
);

SearchResults.displayName = "SearchResults";

export default SearchResults;
