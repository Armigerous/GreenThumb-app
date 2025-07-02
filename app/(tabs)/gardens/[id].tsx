import CachedImage from "@/components/CachedImage";
import { LoadingSpinner } from "@/components/UI/LoadingSpinner";
import { PageContainer } from "@/components/UI/PageContainer";
import SubmitButton from "@/components/UI/SubmitButton";
import { SwipeableRow } from "@/components/UI/SwipeableRow";
import { useGardenDetails, useGardenTasksSummary } from "@/lib/queries";
import { deleteImageFromStorage } from "@/lib/services/imageUpload";
import { supabase } from "@/lib/supabaseClient";
import type { UserPlant } from "@/types/garden";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
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

  // Render empty state with more visual appeal
  const renderEmptyState = () => (
    <AnimatedSection delay={300}>
      <View className="items-center px-6 py-10 mt-4">
        <Ionicons
          name="leaf-outline"
          size={64}
          color="#77B860"
          className="mb-4"
        />
        <Text className="text-center text-foreground text-xl font-title font-bold mb-2">
          Your Garden Awaits
        </Text>
        <Text className="text-center text-cream-600 font-paragraph mb-6 px-4">
          Add your first plant to start your gardening journey. Track growth,
          care schedules, and watch them thrive!
        </Text>
        <SubmitButton
          onPress={handleAddPlant}
          iconName="add-circle-outline"
          iconPosition="left"
        >
          Plant Something New
        </SubmitButton>
      </View>
    </AnimatedSection>
  );

  return (
    <PageContainer scroll={false} padded={false} safeArea={true}>
      {/* Header with Garden Name and Navigation */}
      <View className="flex-row justify-between items-center px-6">
        <SubmitButton
          onPress={() => router.push("/(tabs)/gardens")}
          iconName="arrow-back"
          iconPosition="left"
          type="outline"
          color="secondary"
        >
          Back
        </SubmitButton>

        <SubmitButton
          onPress={handleDeleteGarden}
          color="destructive"
          iconName="trash-outline"
          iconOnly={true}
        >
          {""}
        </SubmitButton>
      </View>

      {/* Content area with normal gradient background */}
      <View className="flex-1">
        {/* Garden Header with Gradient */}
        <Animated.View
          className="rounded-xl overflow-hidden shadow-md mx-6 my-4"
          style={{
            opacity: headerOpacityAnim,
            transform: [{ scale: headerScaleAnim }],
            shadowColor: "#333333",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          <LinearGradient
            colors={["#3F6933", "#77B860"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 24, borderRadius: 12 }}
          >
            <Text className="text-2xl font-title font-bold text-primary-foreground mb-2">
              Welcome to {gardenData?.name}
            </Text>
            <Text className="text-lg font-paragraph text-primary-foreground mb-2">
              {getGardenMessage()}
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Garden Actions */}
        <AnimatedSection delay={200}>
          <View className="flex-row justify-between px-6 mb-4">
            <SubmitButton
              onPress={handleConditionsPress}
              color="secondary"
              iconName="sunny-outline"
              iconPosition="left"
            >
              Conditions
            </SubmitButton>
            <SubmitButton
              onPress={handleAddPlant}
              iconName="add"
              iconPosition="left"
            >
              Add Plant
            </SubmitButton>
          </View>
        </AnimatedSection>

        {/* Garden Stats Overview */}
        {dashboardData && (
          <AnimatedSection delay={300}>
            <View className="px-6">
              <View className="flex-row justify-between p-4 bg-cream-200 rounded-xl border border-cream-300">
                <View className="items-center flex-1">
                  <View className="bg-brand-50 w-12 h-12 rounded-full items-center justify-center mb-1">
                    <Ionicons name="leaf" size={24} color="#77B860" />
                  </View>
                  <Text className="text-xl font-title font-bold text-brand-700">
                    {dashboardData.total_plants}
                  </Text>
                  <Text className="text-cream-600 font-paragraph text-xs">
                    PLANTS
                  </Text>
                </View>

                <View className="items-center flex-1">
                  <View className="bg-yellow-50 w-12 h-12 rounded-full items-center justify-center mb-1">
                    <Ionicons
                      name="water"
                      size={24}
                      color={
                        dashboardData.plants_with_overdue_tasks > 0
                          ? "#d97706"
                          : "#9e9a90"
                      }
                    />
                  </View>
                  <Text
                    className={`text-xl font-title font-bold ${
                      dashboardData.plants_with_overdue_tasks > 0
                        ? "text-yellow-600"
                        : "text-foreground"
                    }`}
                  >
                    {dashboardData.plants_with_overdue_tasks}
                  </Text>
                  <Text className="text-foreground font-paragraph text-xs">
                    NEED CARE
                  </Text>
                </View>

                <View className="items-center flex-1">
                  <View className="bg-brand-50 w-12 h-12 rounded-full items-center justify-center mb-1">
                    <Ionicons name="heart" size={24} color="#77B860" />
                  </View>
                  <Text className="text-xl font-title font-bold text-primary">
                    {dashboardData.health_percentage}%
                  </Text>
                  <Text className="text-foreground font-paragraph text-xs">
                    HEALTH
                  </Text>
                </View>
              </View>
            </View>
          </AnimatedSection>
        )}

        {/* Plants List */}
        <ScrollView className="flex-1 pb-32">
          {plants.length === 0 ? (
            renderEmptyState()
          ) : (
            <View className="mb-8">
              {plantsWithOverdueTasks.length > 0 && (
                <View className="my-4">
                  <AnimatedSection delay={400}>
                    <View className="bg-red-50 mx-5 px-4 py-2 rounded-lg mb-2">
                      <Text className="text-destructive font-paragraph font-medium">
                        🚨 Needs Immediate Care
                      </Text>
                      <Text className="text-destructive text-xs">
                        These plants have overdue care tasks
                      </Text>
                    </View>
                  </AnimatedSection>
                  {plantsWithOverdueTasks.map((plant, index) => (
                    <View key={plant.id}>{renderPlantCard(plant, index)}</View>
                  ))}
                </View>
              )}

              {plantsWithUrgentTasks.length > 0 && (
                <View className="my-4">
                  <AnimatedSection delay={500}>
                    <View className="bg-yellow-50 mx-5 px-4 py-2 rounded-lg mb-2">
                      <Text className="text-yellow-700 font-paragraph font-medium">
                        ⚠️ Due Today/Tomorrow
                      </Text>
                      <Text className="text-yellow-700 text-xs">
                        These plants need care within the next day
                      </Text>
                    </View>
                  </AnimatedSection>
                  {plantsWithUrgentTasks.map((plant, index) => (
                    <View key={plant.id}>
                      {renderPlantCard(
                        plant,
                        plantsWithOverdueTasks.length + index
                      )}
                    </View>
                  ))}
                </View>
              )}

              {plantsWithRegularTasks.length > 0 && (
                <View className="my-4">
                  <AnimatedSection delay={600}>
                    <View className="bg-brand-50 mx-5 px-4 py-2 rounded-lg mb-2">
                      <Text className="text-brand-700 font-paragraph font-medium">
                        ✅ All Good
                      </Text>
                      <Text className="text-brand-700 text-xs">
                        These plants have care scheduled for later
                      </Text>
                    </View>
                  </AnimatedSection>
                  {plantsWithRegularTasks.map((plant, index) => (
                    <View key={plant.id}>
                      {renderPlantCard(
                        plant,
                        plantsWithOverdueTasks.length +
                          plantsWithUrgentTasks.length +
                          index
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </PageContainer>
  );
};

export default GardenDetails;
