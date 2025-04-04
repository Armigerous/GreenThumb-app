import { LoadingSpinner } from "@/components/UI/LoadingSpinner";
import { useGardenDetails } from "@/lib/queries";
import { supabase } from "@/lib/supabaseClient";
import type { UserPlant } from "@/types/garden";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback } from "react";
import {
  Alert,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Get screen width for responsive sizing
const screenWidth = Dimensions.get("window").width;

const GardenDetails = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const {
    data: gardenData,
    isLoading,
    error,
    refetch,
  } = useGardenDetails(Number(id));

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
      refetch();
    } catch (err) {
      console.error("Water plant error:", err);
      Alert.alert("Error", "Failed to water plant. Please try again.");
    }
  };

  const handleEditPlant = (plant: UserPlant) => {
    router.push({
      pathname: "/(home)/plants",
      params: { id: plant.id.toString(), edit: "true" },
    });
  };

  const handleSettingsUpdate = (updated: boolean) => {
    if (updated) {
      refetch();
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading garden details..." />;
  }

  if (error || !gardenData) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="pt-5 px-5">
          <Text className="text-destructive text-lg">
            Error loading garden details. Please try again.
          </Text>
        </View>
      </SafeAreaView>
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

  // Render a more visually appealing plant card
  const renderPlantCard = (plant: UserPlant) => {
    const status = statusConfig[plant.status as keyof typeof statusConfig];

    return (
      <TouchableOpacity
        key={plant.id}
        className="bg-white border border-cream-100 rounded-xl shadow-md mb-5 overflow-hidden"
        onPress={() => handlePlantPress(plant)}
      >
        {/* Plant Image Banner */}
        <View className="w-full h-32 bg-cream-50">
          {plant.images?.[0] ? (
            <Image
              source={{ uri: plant.images[0] }}
              className="h-full w-full"
              resizeMode="cover"
            />
          ) : (
            <View className="h-full w-full items-center justify-center">
              <Ionicons name="leaf-outline" size={48} color="#9e9a90" />
            </View>
          )}
        </View>

        {/* Plant Information */}
        <View className="p-4">
          {/* Plant Name and Status Badge */}
          <View className="flex-row justify-between items-start mb-3">
            <Text className="text-xl text-foreground font-bold flex-1 mr-2">
              {plant.nickname}
            </Text>
            <View
              className={`rounded-full px-3 py-1 flex-row items-center ${status.bg}`}
            >
              <Ionicons name={status.icon} size={16} color={status.color} />
              <Text className={`text-xs font-medium ml-1 ${status.text}`}>
                {plant.status}
              </Text>
            </View>
          </View>

          {/* Status description */}
          <Text className="text-cream-600 mb-4">{status.description}</Text>

          {/* Action Buttons */}
          <View className="flex-row justify-between">
            <TouchableOpacity
              className="flex-1 bg-blue-50 rounded-lg items-center py-3 mr-2"
              onPress={() => handleWaterPlant(plant)}
            >
              <View className="flex-row items-center">
                <Ionicons name="water" size={18} color="#0891b2" />
                <Text className="text-blue-600 font-medium ml-2">Water</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-cream-50 rounded-lg items-center py-3 ml-2"
              onPress={() => handleEditPlant(plant)}
            >
              <View className="flex-row items-center">
                <Ionicons name="settings-outline" size={18} color="#6b7280" />
                <Text className="text-cream-700 font-medium ml-2">Manage</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Render empty state with more visual appeal
  const renderEmptyState = () => (
    <View className="bg-white rounded-xl shadow-md items-center px-6 py-10 mt-4">
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
        className="bg-brand-500 rounded-lg px-6 py-3"
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
    <SafeAreaView className="flex-1 bg-background">
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
              className="bg-accent-100 rounded-lg py-2 px-4 mr-2 flex-row items-center"
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
              <Ionicons name="add" size={18} color="white" />
              <Text className="text-primary-foreground ml-2 font-medium">
                Add Plant
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Garden Title */}
        <Text className="text-2xl text-foreground font-bold mb-2">
          {gardenData.name}
        </Text>
      </View>

      {/* Garden Stats Overview */}
      {dashboardData && (
        <View className="px-5 py-4">
          <View className="flex-row justify-between p-4 bg-white rounded-xl shadow-sm">
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

      {/* Plants Content Area */}
      <ScrollView className="flex-1 px-5 pt-4">
        {plants.length === 0 ? (
          renderEmptyState()
        ) : (
          <View className="mb-8">
            {criticalPlants.length > 0 && (
              <View className="mb-6">
                <View className="flex-row items-center mb-4 bg-red-50 px-4 py-2 rounded-lg">
                  <Ionicons name="alert-circle" size={24} color="#dc2626" />
                  <View className="ml-3">
                    <Text className="text-foreground text-lg font-bold">
                      Needs Immediate Care
                    </Text>
                    <Text className="text-destructive">
                      These plants are in critical condition and need your help
                      now
                    </Text>
                  </View>
                </View>
                {criticalPlants.map((plant) => renderPlantCard(plant))}
              </View>
            )}

            {needsAttentionPlants.length > 0 && (
              <View className="mb-6">
                <View className="flex-row items-center mb-4 bg-yellow-50 px-4 py-2 rounded-lg">
                  <Ionicons name="water" size={24} color="#d97706" />
                  <View className="ml-3">
                    <Text className="text-foreground text-lg font-bold">
                      Due for Care
                    </Text>
                    <Text className="text-accent-400">
                      These plants could use a little attention soon
                    </Text>
                  </View>
                </View>
                {needsAttentionPlants.map((plant) => renderPlantCard(plant))}
              </View>
            )}

            {healthyPlants.length > 0 && (
              <View className="mb-6">
                <View className="flex-row items-center mb-4 bg-brand-50 border border-brand-300 px-4 py-2 rounded-lg">
                  <Ionicons name="checkmark-circle" size={24} color="#77B860" />
                  <View className="ml-3">
                    <Text className="text-foreground text-lg font-bold">
                      Looking Good
                    </Text>
                    <Text className="text-brand-600">
                      These plants are thriving under your care
                    </Text>
                  </View>
                </View>
                {healthyPlants.map((plant) => renderPlantCard(plant))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default GardenDetails;
