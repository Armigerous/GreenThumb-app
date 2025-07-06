import CachedImage from "@/components/CachedImage";
import { LoadingSpinner } from "@/components/UI/LoadingSpinner";
import { PageContainer } from "@/components/UI/PageContainer";
import SubmitButton from "@/components/UI/SubmitButton";
import { SwipeableRow } from "@/components/UI/SwipeableRow";
import {
  useGardenDetails,
  useGardenTasksSummary,
  usePlantCards,
} from "@/lib/queries";
import { deleteImageFromStorage } from "@/lib/services/imageUpload";
import { supabase } from "@/lib/supabaseClient";
import type { UserPlant } from "@/types/garden";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import HeroSection from "@/components/Gardens/HeroSection";
import PlantList from "@/components/Gardens/PlantList";
import RecommendedPlantsSection from "@/components/Gardens/RecommendedPlantsSection";
import { BodyText } from "@/components/Gardens";
import { useGardenFilters } from "@/lib/hooks/useGardenFilters";
import TabNavigation from "@/components/UI/TabNavigation";

// Get screen width for responsive sizing
const screenWidth = Dimensions.get("window").width;

// Animation component for staggered entrance
const AnimatedSection = ({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) => {
  const translateY = useRef(new Animated.Value(20)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, translateY, opacity]);

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateY }],
      }}
    >
      {children}
    </Animated.View>
  );
};

// Define the type for recommended plants (should match RecommendedPlantsSection)
type RecommendedPlant = {
  id: string | number;
  name: string;
  imageUrl?: string;
};

const GardenDetails = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    data: gardenData,
    isLoading,
    error,
    refetch,
  } = useGardenDetails(Number(id));

  // Animation references
  const headerScaleAnim = useRef(new Animated.Value(0.95)).current;
  const headerOpacityAnim = useRef(new Animated.Value(0)).current;

  // Fetch garden tasks summary
  const { data: gardenTasks, isLoading: tasksLoading } = useGardenTasksSummary(
    Number(id)
  );

  // --- Recommended Plants Logic ---
  // Use the same logic as the plant database for garden-based filtering
  const { gardenFilterOptions } = useGardenFilters();
  // Find the current garden in the filter options (by id)
  const currentGardenFilter = gardenFilterOptions.find(
    (g) => g.gardenId === gardenData?.id
  );
  const recommendedFilterString = currentGardenFilter
    ? currentGardenFilter.filters.join(",")
    : "";
  // TEMP DEBUG LOG: Print recommended filter string for current garden
  console.log(
    "[RecommendedPlants] Filter String (from useGardenFilters):",
    recommendedFilterString
  );

  const {
    data: recommendedData,
    isLoading: recommendedLoading,
    error: recommendedError,
  } = usePlantCards(1, 10, "", recommendedFilterString, "scientific");

  // Map to RecommendedPlant type for the section
  // Reason: recommendedData.results is always PlantCardData[] (see fetchPlantCards/processPlantData)
  const recommendedPlants: RecommendedPlant[] =
    (
      recommendedData?.results as
        | import("@/types/plant").PlantCardData[]
        | undefined
    )?.map((plant) => ({
      id: plant.id,
      name: plant.common_name || plant.scientific_name || "Unknown Plant",
      imageUrl: plant.first_image || undefined,
    })) || [];

  // Handler for adding a recommended plant (placeholder)
  const handleAddRecommended = (plant: RecommendedPlant) => {
    // Reason: Placeholder for adding a recommended plant to the garden
    // TODO: Implement add logic when recommendations are live
    Alert.alert(
      "Coming soon",
      `Add ${plant.name} to your garden (not yet implemented)`
    );
  };

  // Refetch garden data whenever the screen comes into focus
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Trigger header animation when data is loaded
  useEffect(() => {
    if (!isLoading && !tasksLoading && gardenData) {
      Animated.parallel([
        Animated.timing(headerScaleAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(headerOpacityAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isLoading, tasksLoading, gardenData, headerScaleAnim, headerOpacityAnim]);

  // Get personalized garden message
  const getGardenMessage = () => {
    if (!gardenData) return "Welcome to your garden!";

    const totalPlants = gardenData.dashboard?.total_plants || 0;
    const plantsNeedingCare =
      gardenData.dashboard?.plants_with_overdue_tasks || 0;

    if (totalPlants === 0) {
      return "Your garden is ready for new life. Add your first plant to begin!";
    }

    if (plantsNeedingCare > 0) {
      return `${plantsNeedingCare} of your plants need attention today.`;
    }

    return "Your plants are happy to see you today!";
  };

  const handleConditionsPress = () => {
    // Navigate to garden conditions page
    if (gardenData?.id) {
      router.push({
        pathname: "/(tabs)/gardens/conditions",
        params: { id: gardenData.id.toString() },
      });
    }
  };

  const handleAddPlant = () => {
    if (gardenData?.id) {
      router.push({
        pathname: "/(tabs)/plants",
        params: { gardenId: gardenData.id.toString(), action: "add" },
      });
    }
  };

  const handlePlantPress = (plant: UserPlant) => {
    router.push({
      pathname: "/(tabs)/gardens/plant/[id]",
      params: { id: plant.id.toString() },
    });
  };

  const handleWaterPlant = async (plant: UserPlant) => {
    try {
      // Create a new care log entry for watering
      const now = new Date().toISOString();
      const careLog = {
        care_type: "Watered",
        taken_care_at: now,
        care_notes: "Plant watered via quick action",
      };

      // Get existing care logs and add new one
      const existingLogs = plant.care_logs || [];
      const updatedLogs = [...existingLogs, careLog];

      // Update the plant status and add the care log
      const { error } = await supabase
        .from("user_plants")
        .update({
          status: "Healthy",
          care_logs: updatedLogs,
          updated_at: now,
        })
        .eq("id", plant.id);

      if (error) {
        console.error("Error watering plant:", error);
        Alert.alert("Error", "Could not update plant watering status.");
        return;
      }

      // Refetch garden data to update the UI
      Alert.alert("Success", `${plant.nickname} has been watered!`);

      // Invalidate both the garden details query and the garden dashboard query
      if (gardenData) {
        queryClient.invalidateQueries({
          queryKey: ["gardenDetails", gardenData.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["gardenDashboard", gardenData.user_id],
        });
      }

      refetch();
    } catch (err) {
      console.error("Water plant error:", err);
      Alert.alert("Error", "Failed to water plant. Please try again.");
    }
  };

  const handleEditPlant = (plant: UserPlant) => {
    router.push({
      pathname: "/(tabs)/gardens/plant/[id]",
      params: { id: plant.id.toString() },
    });
  };

  const handleSettingsUpdate = (updated: boolean) => {
    if (updated) {
      // Invalidate both the garden details query and the garden dashboard query
      if (gardenData) {
        queryClient.invalidateQueries({
          queryKey: ["gardenDetails", gardenData.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["gardenDashboard", gardenData.user_id],
        });
      }
      refetch();
    }
  };

  /**
   * Handles the deletion of the garden with confirmation
   * Deletes all associated plants and the garden itself
   */
  const handleDeleteGarden = async () => {
    if (!gardenData?.id) return;

    Alert.alert(
      "Delete Garden",
      "Are you sure you want to delete this garden? This action cannot be undone and all plants in this garden will be deleted.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // Get all plants in this garden to delete their images
              const { data: gardenPlants, error: fetchError } = await supabase
                .from("user_plants")
                .select("*")
                .eq("garden_id", gardenData.id);

              if (fetchError) throw fetchError;

              // Delete all plant images from storage
              if (gardenPlants && gardenPlants.length > 0) {
                console.log(
                  `Deleting images for ${gardenPlants.length} plants in garden ${gardenData.id}`
                );

                // Collect all image deletion promises
                const allImageDeletionPromises = [];

                // Process each plant
                for (const plant of gardenPlants) {
                  if (plant.images && plant.images.length > 0) {
                    // Add deletion promises for each image
                    const plantImagePromises = plant.images.map(
                      (imageUrl: string) => deleteImageFromStorage(imageUrl)
                    );
                    allImageDeletionPromises.push(...plantImagePromises);
                  }
                }

                // Wait for all image deletions to complete
                if (allImageDeletionPromises.length > 0) {
                  await Promise.all(allImageDeletionPromises);
                }
              }

              // Delete all tasks related to plants in this garden first to avoid FK constraint violations
              if (gardenPlants && gardenPlants.length > 0) {
                const plantIds = gardenPlants.map((plant) => plant.id);

                console.log(
                  `Deleting tasks for ${plantIds.length} plants in garden ${gardenData.id}`
                );

                const { error: tasksError } = await supabase
                  .from("plant_tasks")
                  .delete()
                  .in("user_plant_id", plantIds);

                if (tasksError) {
                  console.error("Error deleting plant tasks:", tasksError);
                  // Continue with deletion anyway
                }
              }

              // Then delete all plants in the garden
              const { error: plantsError } = await supabase
                .from("user_plants")
                .delete()
                .eq("garden_id", gardenData.id);

              if (plantsError) throw plantsError;

              // Then delete the garden
              const { error: gardenError } = await supabase
                .from("user_gardens")
                .delete()
                .eq("id", gardenData.id);

              if (gardenError) throw gardenError;

              // Invalidate the garden dashboard query cache to trigger a refetch
              queryClient.invalidateQueries({
                queryKey: ["gardenDashboard", gardenData.user_id],
              });

              Alert.alert("Success", "Garden deleted successfully");
              router.push("/(tabs)/gardens");
            } catch (err) {
              console.error("Error deleting garden:", err);
              Alert.alert(
                "Error",
                "Failed to delete garden. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  // Tab state for switching between My Plants and Recommendations
  const [activeTab, setActiveTab] = useState<string>("plants");
  const tabItems = [
    { key: "plants", label: "My Plants" },
    { key: "recommendations", label: "Recommendations" },
  ];

  if (isLoading) {
    return (
      <PageContainer scroll={false} animate={false}>
        <LoadingSpinner message="Loading garden details..." />
      </PageContainer>
    );
  }

  if (error || !gardenData) {
    return (
      <PageContainer scroll={false} padded={false}>
        <View className="pt-5 px-5">
          <Text className="text-destructive text-lg font-paragraph">
            Error loading garden details. Please try again.
          </Text>
        </View>
      </PageContainer>
    );
  }

  // Extract dashboard data if available
  const dashboardData = gardenData.dashboard;
  const plants =
    dashboardData?.plants?.map(
      (plant) =>
        ({
          ...plant,
          garden_id: gardenData.id,
          created_at: new Date().toISOString(), // Use current date as fallback
          updated_at: new Date().toISOString(), // Use current date as fallback
          care_logs: [], // Initialize empty care logs
          plant_tasks: [], // Initialize empty tasks
        } as UserPlant)
    ) || [];

  // Group plants by actual care urgency based on task timing, not just existence of tasks
  const plantsWithOverdueTasks = plants.filter((plant) => {
    if (!plant.plant_tasks || plant.plant_tasks.length === 0) return false;
    const now = new Date();
    return plant.plant_tasks.some(
      (task) => !task.completed && new Date(task.due_date) < now
    );
  });

  const plantsWithUrgentTasks = plants.filter((plant) => {
    if (!plant.plant_tasks || plant.plant_tasks.length === 0) return false;
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999); // End of tomorrow

    const incompleteTasks = plant.plant_tasks.filter((task) => !task.completed);
    if (incompleteTasks.length === 0) return false;

    // Check if already categorized as overdue
    const hasOverdue = incompleteTasks.some(
      (task) => new Date(task.due_date) < now
    );
    if (hasOverdue) return false; // Don't double-count overdue plants

    // Check if has tasks due today or tomorrow
    return incompleteTasks.some((task) => {
      const taskDate = new Date(task.due_date);
      return taskDate >= now && taskDate <= tomorrow;
    });
  });

  const plantsWithRegularTasks = plants.filter((plant) => {
    if (!plant.plant_tasks || plant.plant_tasks.length === 0) return true;

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);

    const incompleteTasks = plant.plant_tasks.filter((task) => !task.completed);
    if (incompleteTasks.length === 0) return true;

    // Check if has any overdue tasks
    const hasOverdue = incompleteTasks.some(
      (task) => new Date(task.due_date) < now
    );
    if (hasOverdue) return false;

    // Check if has any urgent tasks (due today/tomorrow)
    const hasUrgent = incompleteTasks.some((task) => {
      const taskDate = new Date(task.due_date);
      return taskDate >= now && taskDate <= tomorrow;
    });
    if (hasUrgent) return false;

    // All remaining tasks are due later
    return true;
  });

  // Check if garden has growing conditions
  const hasConditions = Boolean(
    (gardenData.sunlight && gardenData.sunlight.length > 0) ||
      (gardenData.soil_texture && gardenData.soil_texture.length > 0) ||
      (gardenData.soil_ph_ranges && gardenData.soil_ph_ranges.length > 0) ||
      (gardenData.soil_drainage && gardenData.soil_drainage.length > 0)
  );

  // Note: Plant status field removed - using task-based care indicators instead

  // Render a more iOS-like plant card with animation
  const renderPlantCard = (plant: UserPlant, index: number) => {
    // Get the most urgent task for this plant instead of using unreliable status
    const getMostUrgentTask = () => {
      if (!plant.plant_tasks || plant.plant_tasks.length === 0) return null;
      const now = new Date();
      const incompleteTasks = plant.plant_tasks.filter(
        (task) => !task.completed
      );
      if (incompleteTasks.length === 0) return null;

      return incompleteTasks.sort(
        (a, b) =>
          new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      )[0];
    };

    const urgentTask = getMostUrgentTask();

    // Determine care status based on actual tasks
    const getCareStatus = () => {
      if (!urgentTask) {
        return {
          text: "All caught up",
          color: "#77B860",
          icon: "checkmark-circle" as const,
        };
      }

      const now = new Date();
      const dueDate = new Date(urgentTask.due_date);
      const isOverdue = dueDate < now;

      if (isOverdue) {
        return {
          text: `${urgentTask.task_type} overdue`,
          color: "#dc2626",
          icon:
            urgentTask.task_type === "Water"
              ? ("water" as const)
              : urgentTask.task_type === "Fertilize"
              ? ("leaf" as const)
              : ("cut" as const),
        };
      } else {
        return {
          text: `${urgentTask.task_type} due soon`,
          color: "#d97706",
          icon:
            urgentTask.task_type === "Water"
              ? ("water" as const)
              : urgentTask.task_type === "Fertilize"
              ? ("leaf" as const)
              : ("cut" as const),
        };
      }
    };

    const careStatus = getCareStatus();

    return (
      <AnimatedSection delay={100 + index * 50}>
        <SwipeableRow
          onDelete={() => {
            Alert.alert(
              "Delete Plant",
              `Are you sure you want to delete ${plant.nickname}?`,
              [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      // Delete all plant images from storage first
                      if (plant.images && plant.images.length > 0) {
                        console.log(
                          `Deleting ${plant.images.length} images for plant ${plant.id}`
                        );

                        // Process all image deletions concurrently
                        const imageDeletionPromises = plant.images.map(
                          (imageUrl: string) => deleteImageFromStorage(imageUrl)
                        );

                        // Wait for all image deletions to complete
                        await Promise.all(imageDeletionPromises);
                      }

                      // Then delete the plant from the database
                      const { error } = await supabase
                        .from("user_plants")
                        .delete()
                        .eq("id", plant.id);

                      if (error) throw error;

                      // Invalidate both the garden details query and the garden dashboard query
                      queryClient.invalidateQueries({
                        queryKey: ["gardenDetails", gardenData.id],
                      });
                      queryClient.invalidateQueries({
                        queryKey: ["gardenDashboard", gardenData.user_id],
                      });

                      refetch();
                    } catch (err) {
                      console.error("Error deleting plant:", err);
                      Alert.alert(
                        "Error",
                        "Could not delete plant. Please try again."
                      );
                    }
                  },
                },
              ]
            );
          }}
          onEdit={() => handleEditPlant(plant)}
          onWater={() => handleWaterPlant(plant)}
        >
          <TouchableOpacity
            onPress={() => handlePlantPress(plant)}
            className="bg-white flex-row items-center px-4 py-3 border-b border-cream-300"
          >
            {/* Plant Image */}
            {plant.images?.[0] ? (
              <CachedImage
                uri={plant.images[0]}
                style={{ width: 48, height: 48 }}
                resizeMode="cover"
                rounded={true}
              />
            ) : (
              <View className="w-12 h-12 rounded-full bg-cream-100 items-center justify-center">
                <Ionicons name="leaf-outline" size={24} color="#9e9a90" />
              </View>
            )}

            {/* Plant Info */}
            <View className="flex-1 ml-4">
              <Text className="text-lg text-foreground font-paragraph font-medium">
                {plant.nickname}
              </Text>
              <View className="flex-row items-center">
                <Ionicons
                  name={careStatus.icon}
                  size={16}
                  color={careStatus.color}
                />
                <Text
                  className="text-sm font-paragraph ml-1"
                  style={{ color: careStatus.color }}
                >
                  {careStatus.text}
                </Text>
              </View>
            </View>

            {/* Right Arrow */}
            <Ionicons name="chevron-forward" size={20} color="#9e9a90" />
          </TouchableOpacity>
        </SwipeableRow>
      </AnimatedSection>
    );
  };

  // --- New: Unified page layout with tabs ---
  return (
    <PageContainer scroll={false} padded={false} safeArea={true}>
      {/* Top bar: Back and Settings */}
      <View className="flex-row justify-between items-center px-6 mt-2">
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/gardens")}
          className="flex-row items-center py-2"
          style={{ minHeight: 44 }}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Ionicons name="arrow-back-outline" size={20} color="#2e2c29" />
          <Text className="text-foreground font-paragraph text-base ml-1">
            Back
          </Text>
        </TouchableOpacity>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            onPress={handleConditionsPress}
            accessibilityRole="button"
            accessibilityLabel="Edit garden conditions"
            style={{
              padding: 6,
              borderRadius: 20,
              marginRight: 8,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text className="text-foreground font-paragraph text-base mr-1">
              Settings
            </Text>
            <Ionicons name="settings-outline" size={22} color="#2e2c29" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Hero Section: Welcome, stats, main CTA */}
      <HeroSection
        gardenName={gardenData.name}
        gardenMessage={(() => {
          const totalPlants = dashboardData?.total_plants || 0;
          const plantsNeedingCare =
            dashboardData?.plants_with_overdue_tasks || 0;
          if (totalPlants === 0) {
            return "Your garden is ready for new life. Add your first plant to begin!";
          }
          if (plantsNeedingCare > 0) {
            return `${plantsNeedingCare} of your plants need attention today.`;
          }
          return "Your garden is thriving! All your plants are healthy.";
        })()}
        stats={{
          plantsNeedingCare: dashboardData?.plants_with_overdue_tasks || 0,
        }}
      />

      {/* Tab Navigation for switching between My Plants and Recommendations */}
      <View className="px-6 mt-4 mb-2">
        <TabNavigation
          tabs={tabItems}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </View>

      {/* Tab Panels */}
      <View className="flex-1">
        {activeTab === "plants" ? (
          // My Plants Tab: Show plant list or empty state, scrollable
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingBottom: 32,
              flexGrow: 1,
            }}
            showsVerticalScrollIndicator={false}
          >
            {plants.length > 0 ? (
              <PlantList
                plants={plants}
                onPlantPress={handlePlantPress}
                onEditPlant={handleEditPlant}
                onWaterPlant={handleWaterPlant}
                onDeletePlant={(plant) => {
                  Alert.alert(
                    "Delete Plant",
                    `Are you sure you want to delete ${plant.nickname}?`,
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: async () => {
                          try {
                            if (plant.images && plant.images.length > 0) {
                              const imageDeletionPromises = plant.images.map(
                                (imageUrl: string) =>
                                  deleteImageFromStorage(imageUrl)
                              );
                              await Promise.all(imageDeletionPromises);
                            }
                            const { error } = await supabase
                              .from("user_plants")
                              .delete()
                              .eq("id", plant.id);
                            if (error) throw error;
                            queryClient.invalidateQueries({
                              queryKey: ["gardenDetails", gardenData.id],
                            });
                            queryClient.invalidateQueries({
                              queryKey: ["gardenDashboard", gardenData.user_id],
                            });
                            refetch();
                          } catch (err) {
                            Alert.alert(
                              "Error",
                              "Could not delete plant. Please try again."
                            );
                          }
                        },
                      },
                    ]
                  );
                }}
              />
            ) : (
              <View
                style={{
                  alignItems: "center",
                  marginTop: 32,
                  marginBottom: 24,
                }}
              >
                <Ionicons
                  name="leaf-outline"
                  size={64}
                  color="#77B860"
                  style={{ marginBottom: 12 }}
                />
                <Text
                  style={{
                    fontSize: 22,
                    color: "#2e2c29",
                    fontFamily: "Mali-Bold",
                    marginBottom: 8,
                  }}
                >
                  Your Garden Awaits
                </Text>
                <Text
                  style={{
                    color: "#9e9a90",
                    fontFamily: "Nunito-Regular",
                    fontSize: 16,
                    marginBottom: 18,
                    textAlign: "center",
                    maxWidth: 320,
                  }}
                >
                  Add your first plant to start your gardening journey. Track
                  growth, care schedules, and watch them thrive!
                </Text>
                <SubmitButton
                  onPress={handleAddPlant}
                  iconName="add-circle-outline"
                  iconPosition="left"
                >
                  Plant Something New
                </SubmitButton>
              </View>
            )}
          </ScrollView>
        ) : (
          // Recommendations Tab: Show recommended plants, scrollable
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingBottom: 32,
              flexGrow: 1,
            }}
            showsVerticalScrollIndicator={false}
          >
            <RecommendedPlantsSection
              recommendedPlants={recommendedPlants}
              onAddRecommended={handleAddRecommended}
            />
          </ScrollView>
        )}
      </View>
    </PageContainer>
  );
};

export default GardenDetails;
