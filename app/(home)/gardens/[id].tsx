import { LoadingSpinner } from "@/components/UI/LoadingSpinner";
import { useGardenDetails, useGardenTasksSummary } from "@/lib/queries";
import { supabase } from "@/lib/supabaseClient";
import type { UserPlant } from "@/types/garden";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback } from "react";
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SwipeableRow } from "@/components/UI/SwipeableRow";
import { useQueryClient } from "@tanstack/react-query";
import { PageContainer } from "@/components/UI/PageContainer";
import CachedImage from "@/components/Database/CachedImage";

// Get screen width for responsive sizing
const screenWidth = Dimensions.get("window").width;

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

  // Fetch garden tasks summary
  const { data: gardenTasks, isLoading: tasksLoading } = useGardenTasksSummary(
    Number(id)
  );

  // Refetch garden data whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleConditionsPress = () => {
    // Navigate to garden conditions page
    if (gardenData?.id) {
      router.push({
        pathname: "/(home)/gardens/conditions",
        params: { id: gardenData.id.toString() },
      });
    }
  };

  const handleAddPlant = () => {
    if (gardenData?.id) {
      router.push({
        pathname: "/(home)/plants",
        params: { gardenId: gardenData.id.toString(), action: "add" },
      });
    }
  };

  const handlePlantPress = (plant: UserPlant) => {
    router.push({
      pathname: "/(home)/gardens/plant/[id]",
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
      pathname: "/(home)/gardens/plant/[id]",
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
              // First delete all plants in the garden
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
              router.back();
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
    return <LoadingSpinner message="Loading garden details..." />;
  }

  if (error || !gardenData) {
    return (
      <PageContainer>
        <View className="pt-5 px-5">
          <Text className="text-destructive text-lg">
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

  // Group plants by status
  const criticalPlants = plants.filter(
    (p) => p.status === "Dead" || p.status === "Wilting"
  );
  const needsAttentionPlants = plants.filter(
    (p) => p.status === "Needs Water" || p.status === "Dormant"
  );
  const healthyPlants = plants.filter((p) => p.status === "Healthy");

  // Check if garden has growing conditions
  const hasConditions = Boolean(
    (gardenData.sunlight_conditions &&
      gardenData.sunlight_conditions.length > 0) ||
      (gardenData.soil_textures && gardenData.soil_textures.length > 0) ||
      (gardenData.soil_ph_ranges && gardenData.soil_ph_ranges.length > 0) ||
      (gardenData.soil_drainage && gardenData.soil_drainage.length > 0)
  );

  // Status configuration for consistent styling
  const statusConfig = {
    Healthy: {
      bg: "bg-brand-100",
      text: "text-brand-700",
      icon: "checkmark-circle" as const,
      color: "#059669",
      description: "Thriving and happy",
    },
    "Needs Water": {
      bg: "bg-yellow-100",
      text: "text-yellow-700",
      icon: "water" as const,
      color: "#d97706",
      description: "Time for a drink",
    },
    Wilting: {
      bg: "bg-red-100",
      text: "text-red-700",
      icon: "alert-circle" as const,
      color: "#dc2626",
      description: "Urgent care needed",
    },
    Dormant: {
      bg: "bg-yellow-100",
      text: "text-yellow-700",
      icon: "moon" as const,
      color: "#d97706",
      description: "Resting period",
    },
    Dead: {
      bg: "bg-red-100",
      text: "text-red-700",
      icon: "alert-circle" as const,
      color: "#dc2626",
      description: "May need replacement",
    },
  } as const;

  // Render a more iOS-like plant card
  const renderPlantCard = (plant: UserPlant) => {
    const status = statusConfig[plant.status as keyof typeof statusConfig];

    return (
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
            <Text className="text-lg text-foreground font-medium">
              {plant.nickname}
            </Text>
            <View className="flex-row items-center">
              <Ionicons name={status.icon} size={16} color={status.color} />
              <Text className={`text-sm ml-1 ${status.text}`}>
                {status.description}
              </Text>
            </View>
          </View>

          {/* Right Arrow */}
          <Ionicons name="chevron-forward" size={20} color="#9e9a90" />
        </TouchableOpacity>
      </SwipeableRow>
    );
  };

  // Render empty state with more visual appeal
  const renderEmptyState = () => (
    <View className="items-center px-6 py-10 mt-4">
      <Ionicons
        name="leaf-outline"
        size={64}
        color="#77B860"
        className="mb-4"
      />
      <Text className="text-center text-foreground text-xl font-bold mb-2">
        Your Garden Awaits
      </Text>
      <Text className="text-center text-cream-600 mb-6 px-4">
        Add your first plant to start your gardening journey. Track growth, care
        schedules, and watch them thrive!
      </Text>
      <TouchableOpacity
        className="bg-primary rounded-lg px-6 py-3"
        onPress={handleAddPlant}
      >
        <View className="flex-row items-center justify-center">
          <Ionicons name="add-circle-outline" size={20} color="white" />
          <Text className="text-white font-bold ml-2 text-base">
            Plant Something New
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <PageContainer scroll={false} padded={false}>
      {/* Header with Garden Name and Navigation */}
      <View className="pt-5 pb-2 px-5">
        <View className="flex-row justify-between items-center mb-2">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center"
          >
            <Ionicons name="arrow-back" size={24} color="#2e2c29" />
            <Text className="text-foreground text-base ml-2">Back</Text>
          </TouchableOpacity>

          <View className="flex-row">
            <TouchableOpacity
              className="bg-accent-200 rounded-lg py-2 px-4 mr-2 flex-row items-center"
              onPress={handleConditionsPress}
            >
              <Ionicons name="sunny-outline" size={18} color="#2e2c29" />
              <Text className="text-foreground ml-2 font-medium">
                Conditions
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-primary rounded-lg py-2 px-4 flex-row items-center"
              onPress={handleAddPlant}
            >
              <Ionicons name="add" size={18} color="#fffefa" />
              <Text className="text-primary-foreground ml-2 font-medium">
                Add Plant
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Garden Title with Delete Button */}
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-2xl text-foreground font-bold">
            {gardenData.name}
          </Text>

          {/* Delete Garden Button - More subtle in header */}
          <TouchableOpacity
            className="bg-destructive rounded-lg py-2 px-4 flex-row items-center justify-center"
            onPress={handleDeleteGarden}
          >
            <Ionicons name="trash-outline" size={20} color="#fffefa" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Garden Stats Overview */}
      {dashboardData && (
        <View className="px-5 py-4">
          <View className="flex-row justify-between p-4 bg-cream-200 rounded-xl border-2 border-cream-300">
            <View className="items-center flex-1">
              <View className="bg-brand-50 w-12 h-12 rounded-full items-center justify-center mb-1">
                <Ionicons name="leaf" size={24} color="#77B860" />
              </View>
              <Text className="text-xl font-bold text-brand-700">
                {dashboardData.total_plants}
              </Text>
              <Text className="text-cream-600 text-xs">PLANTS</Text>
            </View>

            <View className="items-center flex-1">
              <View className="bg-yellow-50 w-12 h-12 rounded-full items-center justify-center mb-1">
                <Ionicons
                  name="water"
                  size={24}
                  color={
                    dashboardData.plants_needing_care > 0
                      ? "#d97706"
                      : "#9e9a90"
                  }
                />
              </View>
              <Text
                className={`text-xl font-bold ${
                  dashboardData.plants_needing_care > 0
                    ? "text-yellow-600"
                    : "text-foreground"
                }`}
              >
                {dashboardData.plants_needing_care}
              </Text>
              <Text className="text-foreground text-xs">NEED CARE</Text>
            </View>

            <View className="items-center flex-1">
              <View className="bg-brand-50 w-12 h-12 rounded-full items-center justify-center mb-1">
                <Ionicons name="heart" size={24} color="#77B860" />
              </View>
              <Text className="text-xl font-bold text-primary">
                {dashboardData.health_percentage}%
              </Text>
              <Text className="text-foreground text-xs">HEALTH</Text>
            </View>
          </View>
        </View>
      )}

      {/* Plants List */}
      <ScrollView className="flex-1 pb-32">
        {plants.length === 0 ? (
          renderEmptyState()
        ) : (
          <View className="mb-8">
            {criticalPlants.length > 0 && (
              <View className="mb-4">
                <View className="bg-red-50 mx-5 px-4 py-2 rounded-lg mb-2">
                  <Text className="text-destructive font-medium">
                    Needs Immediate Care
                  </Text>
                </View>
                {criticalPlants.map((plant) => (
                  <View key={plant.id}>{renderPlantCard(plant)}</View>
                ))}
              </View>
            )}

            {needsAttentionPlants.length > 0 && (
              <View className="mb-4">
                <View className="bg-yellow-50 mx-5 px-4 py-2 rounded-lg mb-2">
                  <Text className="text-yellow-700 font-medium">
                    Due for Care
                  </Text>
                </View>
                {needsAttentionPlants.map((plant) => (
                  <View key={plant.id}>{renderPlantCard(plant)}</View>
                ))}
              </View>
            )}

            {healthyPlants.length > 0 && (
              <View className="mb-4">
                <View className="bg-brand-50 mx-5 px-4 py-2 rounded-lg mb-2">
                  <Text className="text-brand-700 font-medium">
                    Looking Good
                  </Text>
                </View>
                {healthyPlants.map((plant) => (
                  <View key={plant.id}>{renderPlantCard(plant)}</View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </PageContainer>
  );
};

export default GardenDetails;
