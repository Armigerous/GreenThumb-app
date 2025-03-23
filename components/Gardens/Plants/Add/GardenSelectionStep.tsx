import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Garden } from "@/types/garden";
import SubmitButton from "./SubmitButton";
import { useMemo, useRef, useEffect, useState } from "react";

/**
 * Simple skeleton loading component for UI elements
 */
const Skeleton = ({ className }: { className: string }) => (
  <View className={`bg-cream-100 rounded-md animate-pulse ${className}`} />
);

/**
 * GardenSelectionStep component for selecting a garden to add a plant to
 *
 * This component displays a user's gardens in a selectable list format with animation effects,
 * search capabilities, and appropriate loading/error states. It implements accessibility features
 * and follows modern UI patterns.
 *
 * @param gardens - Array of user's gardens to choose from
 * @param selectedGarden - Currently selected garden, if any
 * @param onSelectGarden - Callback for when a garden is selected
 * @param onNext - Callback for moving to the next step
 * @param plantName - Name of the plant being added (for display purposes)
 * @param isLoading - Whether garden data is being loaded
 * @param error - Error message if garden fetch failed
 */
interface GardenSelectionStepProps {
  gardens: Garden[] | undefined;
  selectedGarden: Garden | null;
  onSelectGarden: (garden: Garden) => void;
  onNext: () => void;
  plantName: string;
  isLoading?: boolean;
  error?: string;
}

export default function GardenSelectionStep({
  gardens,
  selectedGarden,
  onSelectGarden,
  onNext,
  plantName,
  isLoading = false,
  error,
}: GardenSelectionStepProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Animation value for list fade-in
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Sort gardens alphabetically by name for better UX
  const sortedGardens = useMemo(() => {
    if (!gardens) return [];
    return [...gardens].sort((a, b) => a.name.localeCompare(b.name));
  }, [gardens]);

  // Filter gardens based on search query
  const filteredGardens = useMemo(() => {
    if (searchQuery.trim() === "") return sortedGardens;
    return sortedGardens.filter((garden) =>
      garden.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sortedGardens, searchQuery]);

  // Run fade-in animation when gardens load
  useEffect(() => {
    if (!isLoading && gardens && gardens.length > 0) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [isLoading, gardens, fadeAnim]);

  /**
   * Handler for garden selection with memo to avoid unnecessary rerenders
   */
  const handleSelectGarden = useMemo(
    () => (garden: Garden) => {
      onSelectGarden(garden);
    },
    [onSelectGarden]
  );

  /**
   * Render loading skeleton UI for gardens
   */
  const renderLoadingSkeleton = () => (
    <View className="mb-6">
      {[1, 2, 3].map((index) => (
        <View
          key={index}
          className="mb-3 p-4 rounded-xl border border-cream-200 bg-white"
        >
          <Skeleton className="w-36 h-6 mb-2" />
          <Skeleton className="w-20 h-4" />
        </View>
      ))}
    </View>
  );

  /**
   * Render error state with retry option
   */
  if (error) {
    return (
      <View className="px-4 py-6 flex items-center justify-center">
        <Ionicons name="alert-circle" size={48} color="#EF4444" />
        <Text className="text-xl font-bold mb-2 mt-4 text-center">
          Unable to Load Gardens
        </Text>
        <Text className="text-cream-600 mb-8 text-center">{error}</Text>
        <TouchableOpacity
          className="bg-brand-500 rounded-xl py-3 px-6 flex-row items-center"
          onPress={() => router.replace("/(home)/gardens/plant/add")}
          accessibilityRole="button"
          accessibilityLabel="Retry loading gardens"
        >
          <Ionicons
            name="refresh-outline"
            size={20}
            color="white"
            style={{ marginRight: 6 }}
          />
          <Text className="text-white font-medium">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  /**
   * Render loading state
   */
  if (isLoading) {
    return (
      <View className="px-4">
        <Text className="text-xl font-bold mb-4">Select a Garden</Text>
        <View className="mb-6">
          <Text className="text-cream-600">
            Choose which garden you want to add your{" "}
            <Text className="text-foreground font-medium">{plantName}</Text> to:
          </Text>
        </View>
        {renderLoadingSkeleton()}
      </View>
    );
  }

  /**
   * Render empty state with CTA to create a garden
   */
  if (!gardens || gardens.length === 0) {
    return (
      <View className="px-4 py-6 flex items-center justify-center">
        <Ionicons
          name="leaf-outline"
          size={48}
          color="#5E994B"
          style={{ marginBottom: 16 }}
        />
        <Text className="text-xl font-bold mb-2 text-center">
          No Gardens Available
        </Text>
        <Text className="text-cream-600 mb-8 text-center">
          You need to create a garden before adding plants.
        </Text>
        <TouchableOpacity
          className="bg-brand-500 rounded-xl py-3 px-6 flex-row items-center"
          onPress={() => router.push("/(home)/gardens/new")}
          accessibilityRole="button"
          accessibilityLabel="Create a new garden"
        >
          <Ionicons
            name="add-circle-outline"
            size={20}
            color="white"
            style={{ marginRight: 6 }}
          />
          <Text className="text-white font-medium">Create Garden</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="px-4 py-2 flex-1">
      <Text className="text-xl font-bold mb-3">Select a Garden</Text>
      <View className="mb-4">
        <Text className="text-cream-600">
          Choose which garden you want to add your{" "}
          <Text className="text-foreground font-medium">{plantName}</Text> to:
        </Text>
      </View>

      {/* Garden search - for when users have many gardens */}
      {gardens.length > 3 && (
        <View className="mb-4 bg-cream-50 rounded-xl p-2 flex-row items-center border border-cream-200">
          <Ionicons name="search" size={20} color="#9CA3AF" className="ml-2" />
          <TextInput
            className="flex-1 ml-2 text-foreground"
            placeholder="Search gardens..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessibilityLabel="Search gardens"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              accessibilityLabel="Clear search"
            >
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Garden selection list with animated appearance */}
      <ScrollView
        className="mb-4 flex-1"
        accessibilityLabel="Garden selection list"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {filteredGardens.length > 0 ? (
            filteredGardens.map((garden) => (
              <TouchableOpacity
                key={garden.id}
                className={`mb-3 p-4 rounded-xl border ${
                  selectedGarden?.id === garden.id
                    ? "border-brand-500 bg-brand-50"
                    : "border-cream-200 bg-white"
                }`}
                onPress={() => handleSelectGarden(garden)}
                accessibilityRole="radio"
                accessibilityState={{
                  checked: selectedGarden?.id === garden.id,
                }}
                accessibilityLabel={`Select garden ${garden.name} with ${
                  garden.user_plants?.length || 0
                } plants`}
              >
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text
                      className="text-lg font-medium text-foreground"
                      numberOfLines={1}
                    >
                      {garden.name}
                    </Text>
                    <View className="flex-row items-center mt-1">
                      <Ionicons
                        name="leaf-outline"
                        size={14}
                        color="#9CA3AF"
                        style={{ marginRight: 4 }}
                      />
                      <Text className="text-sm text-cream-500">
                        {garden.user_plants?.length || 0} plants
                      </Text>
                    </View>
                  </View>
                  {selectedGarden?.id === garden.id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color="#5E994B"
                    />
                  )}
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="py-8 flex items-center">
              <Text className="text-cream-500 text-center">
                No gardens match your search.
              </Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Navigation buttons with fixed position */}
      <View className="flex-row justify-between items-center py-4 px-4">
        <TouchableOpacity
          className="flex-row items-center justify-center py-3 px-5 rounded-xl border border-cream-400 bg-cream-200"
          onPress={() => router.push("/(home)/gardens")}
          accessibilityRole="button"
          accessibilityLabel="Cancel and return to gardens"
        >
          <Ionicons
            name="arrow-back-outline"
            size={18}
            color="#6B7280"
            style={{ marginRight: 4 }}
          />
          <Text className="font-medium text-cream-700">Cancel</Text>
        </TouchableOpacity>

        <View className="flex-row">
          {selectedGarden && (
            <View className="flex-row items-center mr-3">
              <Ionicons
                name="flower-outline"
                size={16}
                color="#5E994B"
                style={{ marginRight: 4 }}
              />
              <Text className="text-sm text-brand-600">
                {selectedGarden.name}
              </Text>
            </View>
          )}
          <SubmitButton
            label="Continue"
            onPress={onNext}
            isDisabled={!selectedGarden}
            variant={selectedGarden ? "primary" : "secondary"}
            loadingLabel="Processing..."
          />
        </View>
      </View>
    </View>
  );
}
