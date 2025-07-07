import { GardenDashboard } from "@/types/garden";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import SubmitButton from "../../../UI/SubmitButton";
import { TitleText, SubtitleText, BodyText } from "@/components/UI/Text";

/**
 * Advanced skeleton loading component for UI elements with pulse animation
 * Uses React Native's Animated API to create a smooth, subtle pulse effect
 * that mimics content loading in a visually pleasing way
 */
const Skeleton = ({ className }: { className: string }) => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  // Setup the pulse animation sequence
  useEffect(() => {
    const animatePulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(() => animatePulse());
    };

    animatePulse();

    // Cleanup animation when component unmounts
    return () => {
      pulseAnim.stopAnimation();
    };
  }, [pulseAnim]);

  return (
    <Animated.View
      style={{ opacity: pulseAnim }}
      className={`bg-cream-100 rounded-md ${className}`}
    />
  );
};

/**
 * Staggered animation skeleton component to provide visual feedback during loading
 * Creates a more natural feeling loading state with staggered animations
 */
const StaggeredSkeletonLoader = () => {
  // Staggered animation values for each skeleton item
  const animations = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  // Start staggered animations when component mounts
  useEffect(() => {
    // Create a staggered animation sequence for each item
    animations.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: index * 150, // Stagger the animations
        useNativeDriver: true,
      }).start();
    });

    // Cleanup animations when component unmounts
    return () => {
      animations.forEach((anim) => anim.stopAnimation());
    };
  }, []);

  return (
    <View className="mb-6">
      {[0, 1, 2].map((index) => (
        <Animated.View
          key={index}
          style={{ opacity: animations[index] }}
          className="mb-3"
        >
          <View className="p-4 rounded-xl border border-cream-200 bg-white">
            <Skeleton className="w-36 h-6 mb-2" />
            <View className="flex-row items-center">
              <View className="w-4 h-4 mr-2 bg-cream-100 rounded-full" />
              <Skeleton className="w-20 h-4" />
            </View>
          </View>
        </Animated.View>
      ))}

      {/* Loading search bar skeleton */}
      <Animated.View style={{ opacity: animations[0] }} className="mb-4 mt-2">
        <View className="h-10 bg-cream-50 rounded-xl border border-cream-200" />
      </Animated.View>
    </View>
  );
};

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
 * @param plantSlug - Slug of the plant being added (for display purposes)
 * @param isLoading - Whether garden data is being loaded
 * @param error - Error message if garden fetch failed
 */
interface GardenSelectionStepProps {
  gardens: GardenDashboard[] | undefined;
  selectedGarden: GardenDashboard | null;
  onSelectGarden: (garden: GardenDashboard) => void;
  onNext: () => void;
  plantName: string;
  plantSlug: string;
  isLoading?: boolean;
  error?: string;
}

export default function GardenSelectionStep({
  gardens,
  selectedGarden,
  onSelectGarden,
  onNext,
  plantName,
  plantSlug,
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
    return [...gardens].sort((a, b) =>
      (a.name ?? "").localeCompare(b.name ?? "")
    );
  }, [gardens]);

  // Filter gardens based on search query
  const filteredGardens = useMemo(() => {
    if (searchQuery.trim() === "") return sortedGardens;
    return sortedGardens.filter((garden) =>
      (garden.name ?? "").toLowerCase().includes(searchQuery.toLowerCase())
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
    () => (garden: GardenDashboard) => {
      onSelectGarden(garden);
    },
    [onSelectGarden]
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
          onPress={() => router.replace("/(tabs)/gardens/plant/add")}
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
   * Render enhanced loading state with animated skeletons
   * Maintains the same overall structure as the loaded content for a smoother transition
   */
  if (isLoading) {
    return (
      <View className="px-4 py-2 flex-1">
        <View className="flex-row items-center mb-4">
          <TitleText className="text-xl text-foreground">
            Choose a Garden
          </TitleText>
        </View>
        <BodyText className="text-cream-600 mb-6">
          Select a garden to add{" "}
          <BodyText className="font-medium">{plantName}</BodyText> to:
        </BodyText>

        <StaggeredSkeletonLoader />

        {/* Bottom navigation skeleton for visual consistency */}
        <View className="flex-row justify-between items-center py-4 px-4">
          <Skeleton className="w-24 h-10 rounded-xl" />
          <Skeleton className="w-32 h-10 rounded-xl" />
        </View>
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
        <TitleText className="text-xl font-bold mb-2 text-center">
          No Gardens Available
        </TitleText>
        <BodyText className="text-cream-600 mb-8 text-center">
          You need to create a garden before adding plants.
        </BodyText>
        <View className="bg-cream-100 p-6 rounded-xl mt-4">
          <View className="items-center mb-4">
            <Ionicons name="add-circle-outline" size={48} color="#047857" />
            <TitleText className="text-lg text-foreground text-center mb-2">
              Create a New Garden
            </TitleText>
            <BodyText className="text-cream-600 text-center mb-4">
              Make a new garden to add your plant to!
            </BodyText>
          </View>
          <SubmitButton
            onPress={() => router.push("/(tabs)/gardens/new")}
            iconName="add-circle-outline"
            iconPosition="left"
          >
            Create New Garden
          </SubmitButton>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 flex">
      <View className="flex-1">
        <View className="flex-row items-center mb-4">
          <TitleText className="text-xl text-foreground">
            Choose a Garden
          </TitleText>
        </View>
        <BodyText className="text-cream-600 mb-6">
          Select a garden to add{" "}
          <BodyText className="font-medium">{plantName}</BodyText> to:
        </BodyText>

        {/* Garden search - for when users have many gardens */}
        {gardens && gardens.length > 3 && (
          <View className="mb-4 bg-cream-50 rounded-xl p-2 flex-row items-center border border-cream-200">
            <Ionicons
              name="search"
              size={20}
              color="#9CA3AF"
              className="ml-2"
            />
            <TextInput
              className="flex-1 ml-2 text-foreground"
              placeholder="Search gardens..."
              placeholderTextColor="#BBBBBB"
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
          className="flex-1"
          accessibilityLabel="Garden selection list"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            {filteredGardens.length > 0 ? (
              filteredGardens.map((garden) => (
                <TouchableOpacity
                  key={garden.garden_id}
                  className={`mb-3 p-4 rounded-xl border ${
                    selectedGarden?.garden_id === garden.garden_id
                      ? "border-brand-500 bg-brand-50"
                      : "border-cream-200 bg-white"
                  }`}
                  onPress={() => handleSelectGarden(garden)}
                  accessibilityRole="radio"
                  accessibilityState={{
                    checked: selectedGarden?.garden_id === garden.garden_id,
                  }}
                  accessibilityLabel={`Select garden ${garden.name} with ${
                    garden.total_plants || 0
                  } plants`}
                >
                  <View className="flex-row justify-between items-center">
                    <View className="flex-1">
                      <SubtitleText className="text-lg text-foreground mb-1">
                        {garden.name}
                      </SubtitleText>
                      <BodyText className="text-sm text-cream-600 mb-2">
                        {garden.total_plants ?? 0} plant
                        {(garden.total_plants ?? 0) === 1 ? "" : "s"}
                        {(garden.plants_with_overdue_tasks ?? 0) > 0 && (
                          <>
                            {" "}
                            · {garden.plants_with_overdue_tasks} need
                            {(garden.plants_with_overdue_tasks ?? 0) === 1
                              ? "s"
                              : ""}{" "}
                            care
                          </>
                        )}
                      </BodyText>
                    </View>
                    {selectedGarden?.garden_id === garden.garden_id && (
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
      </View>
    </View>
  );
}
